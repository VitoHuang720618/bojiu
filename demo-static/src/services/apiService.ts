/**
 * API 服務模組
 * 負責處理所有的外部數據請求，特別是動態線路獲取
 */

export interface HostnameData {
    hostname: string;
    name?: string;
}

export const apiService = {
    /**
     * 獲取動態線路列表
     * 透過 Nginx Proxy `/api/hostnames` 請求
     */
    async getHostnames(): Promise<string[]> {
        let retries = 0;
        const maxRetries = 2;

        const fetchInternal = async (): Promise<string[]> => {
            try {
                const response = await fetch('/api/hostnames', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/html',
                        'Cache-Control': 'no-cache'
                    },
                    credentials: 'include'
                });

                const contentType = response.headers.get('content-type');

                // 無論狀態碼為何，如果返回的是 HTML，優先檢查是否為人機驗證
                if (contentType && contentType.includes('text/html')) {
                    const html = await response.text();

                    // 使用正則表達式提取 identity_id 的值
                    const match = html.match(/identity_id=([^; ]+)/);
                    if (match && match[1]) {
                        const identityId = match[1];

                        if (retries >= maxRetries) {
                            console.error('ApiService: 已達到最大重試次數，驗證依然失敗。');
                            return [];
                        }

                        console.log(`ApiService: 偵測到驗證頁面 (狀態碼: ${response.status}, 重試次數: ${retries + 1})，正在處理 identity_id...`);

                        // 手動寫入 Cookie
                        const expiry = 7200;
                        const date = new Date();
                        date.setTime(date.getTime() + (expiry * 1000));
                        document.cookie = `identity_id=${identityId}; expires=${date.toUTCString()}; Max-Age=${expiry}; path=/; SameSite=Lax`;

                        // 關鍵：等待 1000ms 讓瀏覽器穩定 Cookie，然後再重試
                        retries++;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return fetchInternal();
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    return data.map((item: any) => item.hostname || item);
                } else if (data && Array.isArray(data.data)) {
                    return data.data.map((item: any) => item.hostname);
                }

                return [];
            } catch (error) {
                console.error('ApiService: 獲取線路失敗:', error);
                throw error;
            }
        };

        return fetchInternal();
    }
};
