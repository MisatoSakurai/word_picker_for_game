const fs = require('fs');
const path = require('path');

console.log('Generating config.js...');
console.log('API_URL:', process.env.API_URL);
console.log('SPREADSHEET_URL:', process.env.SPREADSHEET_URL);
console.log('COMMON_PASS:', process.env.COMMON_PASS);

const configContent = `
window.config = {
    API_URL: '${process.env.API_URL}',
    SPREADSHEET_URL: '${process.env.SPREADSHEET_URL}',
    COMMON_PASS: '${process.env.COMMON_PASS}'
};
`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'config.js'), configContent);

// ビルド成功を示すために空のエクスポートを追加
module.exports = () => {};

console.log('Config.js generated successfully');
