const fs = require('fs');

const configContent = `
window.config = {
    API_URL: '${process.env.API_URL}',
    SPREADSHEET_URL: '${process.env.SPREADSHEET_URL}',
    COMMON_PASS: '${process.env.COMMON_PASS}'
};
`;

fs.writeFileSync('public/config.js', configContent);
