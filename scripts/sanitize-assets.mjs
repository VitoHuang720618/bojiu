import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修改路徑為專案根目錄
const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'manager/backend/data/config.json');
const UPLOADS_DIR = path.join(ROOT, 'manager/backend/uploads');
const SETTINGS_PATH = path.join(ROOT, 'demo/public/site-settings.json');

console.log('🚀 開始專案資產淨化...');

// 1. 讀取並淨化 config.json
if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ 找不到 config.json');
    process.exit(1);
}

const rawConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
let config = JSON.parse(rawConfig);

const timestampRegex = /-\d{13}/;

function sanitizeObject(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('/uploads/')) {
            const oldUrl = obj[key];
            const match = oldUrl.match(timestampRegex);
            
            if (match) {
                const timestamp = match[0];
                const cleanUrl = oldUrl.replace(timestamp, '');
                const oldFileName = oldUrl.replace('/uploads/', '');
                const cleanFileName = cleanUrl.replace('/uploads/', '');
                
                const oldFile = path.join(UPLOADS_DIR, oldFileName);
                const cleanFile = path.join(UPLOADS_DIR, cleanFileName);

                if (fs.existsSync(oldFile)) {
                    console.log(`📦 [處理圖片] ${oldFileName} -> ${cleanFileName}`);
                    // 覆蓋寫入乾淨檔名 (保留現在正確的圖)
                    fs.copyFileSync(oldFile, cleanFile);
                }
                obj[key] = cleanUrl;
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
}

sanitizeObject(config);

// 儲存乾淨的 config.json
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
console.log('✅ config.json 路徑淨化完成');

// 2. 淨化 site-settings.json (發布用 JSON)
if (fs.existsSync(SETTINGS_PATH)) {
    const rawSettings = fs.readFileSync(SETTINGS_PATH, 'utf8');
    let settings = JSON.parse(rawSettings);
    
    // 對 settings 進行同樣的替換邏輯 (site-settings.json 使用的是 /defaults/)
    const defaultsRegex = /\/defaults\/(.+)-\d{13}(\.png|\.jpg|\.jpeg|\.webp)/g;
    let settingsStr = JSON.stringify(settings, null, 2);
    settingsStr = settingsStr.replace(/\/defaults\/(.+)-\d{13}(\.png|\.jpg|\.jpeg|\.webp)/g, '/defaults/$1$2');
    
    fs.writeFileSync(SETTINGS_PATH, settingsStr, 'utf8');
    console.log('✅ site-settings.json 路徑淨化完成');
}

// 3. 物理移除 uploads/ 中所有帶有戳記的舊檔案
console.log('🧹 正在磁碟中掃除舊的戳記檔案...');
const files = fs.readdirSync(UPLOADS_DIR);
let pruneCount = 0;

files.forEach(file => {
    if (timestampRegex.test(file)) {
        const filePath = path.join(UPLOADS_DIR, file);
        fs.unlinkSync(filePath);
        pruneCount++;
    }
});

console.log(`✨ 掃除完畢！共移除 ${pruneCount} 個舊檔案。`);
console.log('====================================');
console.log('🎉 專案已恢復純淨！現在所有圖片都以固定檔名讀取且即時覆蓋。');
