import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT, 'manager/backend/uploads');
const SETTINGS_URL = 'https://bojiu.vito.website/site-settings.json';
const BASE_URL = 'https://bojiu.vito.website';

async function downloadFile(url, targetPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`📦 [同步] 已覆蓋本地檔案: ${path.basename(targetPath)}`);
}

async function run() {
    console.log(`🚀 正在從 ${SETTINGS_URL} 獲取最新資產清單...`);
    
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    try {
        const response = await fetch(SETTINGS_URL);
        if (!response.ok) throw new Error('無法讀取 site-settings.json');
        const settings = await response.json();
        
        const timestampRegex = /-\d{13}/;
        const assets = [];

        // 遞迴尋找所有圖片路徑
        function findAssets(obj) {
            for (const key in obj) {
                const val = obj[key];
                if (typeof val === 'string' && (val.includes('/defaults/') || val.includes('/assets/'))) {
                    const remoteUrl = BASE_URL + val;
                    const originalName = path.basename(val);
                    // 清除檔名中的時間戳記
                    const cleanName = originalName.replace(timestampRegex, '');
                    assets.push({ url: remoteUrl, name: cleanName });
                } else if (typeof val === 'object' && val !== null) {
                    findAssets(val);
                }
            }
        }

        findAssets(settings);

        // 過濾重複的檔名
        const uniqueAssets = Array.from(new Map(assets.map(a => [a.name, a])).values());
        console.log(`🔍 發現 ${uniqueAssets.length} 個待同步資產...`);

        for (const asset of uniqueAssets) {
            const targetPath = path.join(UPLOADS_DIR, asset.name);
            try {
                await downloadFile(asset.url, targetPath);
            } catch (err) {
                console.error(`❌ 下載失敗 ${asset.name}: ${err.message}`);
            }
        }

        console.log('====================================');
        console.log('🎉 恭喜主人！本地資產已同步為線上最新版本並完成覆寫。');
        console.log('現在本地的 uploads/ 全部都是線上那組「正確的圖」了。');

    } catch (err) {
        console.error(`❌ 同步失敗: ${err.message}`);
    }
}

run();
