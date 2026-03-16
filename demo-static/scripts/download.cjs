const fs = require('fs');
const https = require('https');
const path = require('path');

// Execute from project root: node demo-static/scripts/download.cjs
const tsFilePath = path.join(__dirname, '../src/config/siteConfig.ts');
const uploadDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let content = fs.readFileSync(tsFilePath, 'utf8');

// 找出所有 GCP 圖床網址
const urlRegex = /https:\/\/bojiu\.vito\.website\/uploads\/([^"']+)/g;
let match;
const uniqueUrls = new Set();

while ((match = urlRegex.exec(content)) !== null) {
  uniqueUrls.add(match[0]);
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function processAll() {
  console.log(`找到 ${uniqueUrls.size} 張圖片，準備下載...`);
  let count = 0;
  for (const url of uniqueUrls) {
    const filename = url.split('/').pop();
    const dest = path.join(uploadDir, filename);
    if (!fs.existsSync(dest)) {
      try {
        await downloadFile(url, dest);
        count++;
        console.log(`已下載: ${filename}`);
      } catch (e) {
        console.error(`下載失敗: ${url}`, e);
      }
    } else {
        console.log(`跳過 (已存在): ${filename}`);
    }
  }
  
  // 將 ts 中的網址改成讀取本地 public/uploads
  content = content.replace(/https:\/\/bojiu\.vito\.website\/uploads\//g, '/uploads/');
  fs.writeFileSync(tsFilePath, content);
  console.log(`\n完成！總共下載了 ${count} 張新圖，並已修正路徑。`);
}

processAll();
