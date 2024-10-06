let data = {};
let headers = [];

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
    spreadsheetLink.href = window.config.SPREADSHEET_URL;
}

function fetchDataFromAPI() {
    const API_URL = window.config.API_URL;
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
    if (enteredPassword === window.config.COMMON_PASS) {
        window.open(document.getElementById('spreadsheetLink').getAttribute('href'), '_blank');
    } else {
        alert('パスワードが正しくありません。');
    }
}