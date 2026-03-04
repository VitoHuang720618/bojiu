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
        try {
            const response = await fetch('/api/hostnames', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/html',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');

            // 如果返回的是 HTML，說明遇到了人機驗證
            if (contentType && contentType.includes('text/html')) {
                const html = await response.text();

                // 使用正則表達式提取 identity_id 的值
                const match = html.match(/identity_id=([^; ]+)/);
                if (match && match[1]) {
                    const identityId = match[1];
                    console.log('ApiService: 偵測到驗證頁面，正在自動處理 identity_id...');

                    // 手動寫入 Cookie (由於是同網域 Proxy，這會生效)
                    // 仿照驗證頁面的 expiry (7200秒 = 2小時)
                    const expiry = 7200;
                    const date = new Date();
                    date.setTime(date.getTime() + (expiry * 1000));
                    document.cookie = `identity_id=${identityId}; expires=${date.toUTCString()}; Max-Age=${expiry}; path=/; SameSite=Lax`;

                    // 遞迴重試一次
                    return this.getHostnames();
                }
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
    }
};
