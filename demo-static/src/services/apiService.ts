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
            // 請求本地 Nginx Proxy
            const response = await fetch('/api/hostnames', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                // 確保跨域請求能帶上或接收 Cookie (identity_id)
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 假設返回格式為： { code: 200, data: [ { hostname: "...", name: "..." }, ... ] }
            // 或者主人提供的 curl 範例返回的原始陣列
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
