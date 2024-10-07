function waitForConfig() {
    return new Promise((resolve) => {
        const checkConfig = () => {
            if (window.config) {
                resolve();
            } else {
                setTimeout(checkConfig, 100);
            }
        };
        checkConfig();
    });
}

waitForConfig().then(() => {
    // ここに既存のコードを移動
    // 例: initializeApp();
});

let data = {};
let headers = [];

// 設定を取得する関数
function getConfig(key, defaultValue) {
    console.log('window.config:', window.config);
    if (!window.config) {
        console.error('Config not loaded');
        return defaultValue;
    }
    if (!(key in window.config)) {
        console.warn(`Config key "${key}" not found, using default value: ${defaultValue}`);
        return defaultValue;
    }
    return window.config[key];
}

function initializeApp() {
    const loader = document.getElementById('loader');
    const select = document.getElementById('columnSelect');
    const button = document.querySelector('footer button');

    loader.style.display = 'block';

    // セッションストレージからデータを取得
    const storedData = sessionStorage.getItem('spreadsheetData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        headers = parsedData.headers;
        data = parsedData.data;
        populateSelect();
        loader.style.display = 'none';
        select.style.display = 'block';
        button.style.display = 'block';
    } else {
        fetchDataFromAPI();
    }

    setSpreadsheetLink();
}

function setSpreadsheetLink() {
    const spreadsheetLink = document.getElementById('spreadsheetLink');
    spreadsheetLink.href = getConfig('SPREADSHEET_URL', '#');
}

function fetchDataFromAPI() {
    console.log('Fetching data from API...');
    const API_URL = getConfig('API_URL');
    console.log('API_URL:', API_URL);
    if (!API_URL) {
        console.error('API_URL is not defined');
        document.getElementById('result').textContent = 'API URLの設定が見つかりません。';
        return;
    }

    const loader = document.getElementById('loader');
    const select = document.getElementById('columnSelect');
    const button = document.querySelector('footer button');

    // ローダーを表示し、セレクトを無効化して表示
    loader.style.display = 'block';
    select.style.display = 'block';
    select.disabled = true;
    select.innerHTML = '<option>データを読み込み中...</option>';

    // ボタンを無効化して表示
    button.style.display = 'block';
    button.disabled = true;

    fetch(API_URL)
        .then(response => response.json())
        .then(jsonData => {
            headers = jsonData.headers;
            data = jsonData.data;

            // データをセッションストレージに保存
            sessionStorage.setItem('spreadsheetData', JSON.stringify({headers, data}));

            populateSelect();
            loader.style.display = 'none';
            select.disabled = false;
            button.disabled = false;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loader.style.display = 'none';
            select.disabled = false;
            select.innerHTML = '<option>データの読み込みに失敗しました</option>';
            document.getElementById('result').textContent = 'データの読み込みに失敗しました。';
            button.disabled = true;
        });
}

function populateSelect() {
    const select = document.getElementById('columnSelect');
    select.innerHTML = '<option value="">ゲームを選択</option>';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        select.appendChild(option);
    });
}

function pickRandomWord() {
    const select = document.getElementById('columnSelect');
    const selectedColumn = select.value;
    
    if (!selectedColumn) {
        // alert('ゲームを選択してください');
        document.getElementById('result').textContent = "ゲームを選択してください";
        return;
    }

    const columnIndex = headers.indexOf(selectedColumn);
    if (columnIndex === -1) {
        alert('選択された列が見つかりません');
        return;
    }

    const words = data.map(row => row[columnIndex]).filter(Boolean);
    if (words.length === 0) {
        alert('選択された列にデータがありません');
        return;
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];

    document.getElementById('result').textContent = randomWord;
}

function toggleSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('open');
}

function clearSessionStorage() {
    sessionStorage.clear();
    // alert('セッションストレージがクリアされました。ページをリロードします。');
    location.reload();
}

// アプリケーションの初期化
window.onload = initializeApp;

function checkPasswordAndRedirect(event) {
    event.preventDefault();
    const enteredPassword = prompt('パスワードを入力してください:');
    const correctPassword = getConfig('COMMON_PASS');
    if (correctPassword && enteredPassword === correctPassword) {
        window.open(getConfig('SPREADSHEET_URL', '#'), '_blank');
    } else {
        alert('パスワー��が正しくありません。');
    }
}