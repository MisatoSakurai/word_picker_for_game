import React, { useState, useEffect, useRef } from 'react';
import '../styles/RandomWordPicker.css';

const RandomWordPicker = () => {
  const [data, setData] = useState({});
  const [headers, setHeaders] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const resultRef = useRef(null);
  const mainRef = useRef(null);

  const adjustFontSize = () => {
    const resultElement = resultRef.current;
    const mainElement = mainRef.current;
    if (!resultElement || !mainElement) return;

    const maxWidth = mainElement.clientWidth * 0.9;
    const maxHeight = mainElement.clientHeight * 0.8;

    let fontSize = Math.min(maxWidth, maxHeight) / 2; // 初期フォントサイズを調整
    resultElement.style.fontSize = `${fontSize}px`;

    while (
      (resultElement.scrollWidth > maxWidth || resultElement.scrollHeight > maxHeight) &&
      fontSize > 10
    ) {
      fontSize -= 1;
      resultElement.style.fontSize = `${fontSize}px`;
    }

    
  };

  useEffect(() => {
    initializeApp();
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [result]);

  const initializeApp = () => {
    setIsLoading(true);
    const storedData = sessionStorage.getItem('spreadsheetData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setHeaders(parsedData.headers);
      setData(parsedData.data);
      setIsLoading(false);
    } else {
      fetchDataFromAPI();
    }
  };

  const fetchDataFromAPI = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    // console.log(API_URL);
    if (!API_URL) {
      console.error('API_URL is not defined');
      setResult('API URLの設定が見つかりません。');
      setIsLoading(false);
      return;
    }

    fetch(API_URL)
      .then(response => {
        // console.log(response);
        return response.json();
      })
      .then(jsonData => {
        setHeaders(jsonData.headers);
        setData(jsonData.data);
        sessionStorage.setItem('spreadsheetData', JSON.stringify(jsonData));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setResult('データの読み込みに失敗しました。');
        setIsLoading(false);
      });
  };

  const pickRandomWord = () => {
    if (!selectedColumn) {
      setResult("ゲームを選択してください");
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
    setResult(words[randomIndex]);
  };

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const clearSessionStorage = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const checkPasswordAndRedirect = (event) => {
    event.preventDefault();
    const enteredPassword = prompt('パスワードを入力してください:');
    const correctPassword = process.env.REACT_APP_COMMON_PASS;
    if (correctPassword && enteredPassword === correctPassword) {
      window.open(process.env.REACT_APP_SPREADSHEET_URL, '_blank');
    } else {
      alert('パスワードが正しくありません。');
    }
  };

  return (
    <div className="random-word-picker">
      <header>
        <div className="select-container">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            disabled={isLoading}
          >
            <option value="">ゲームを選択</option>
            {headers.map((header, index) => (
              <option key={index} value={header}>{header}</option>
            ))}
          </select>
          <button className="hamburger-menu" onClick={toggleSideMenu}>☰</button>
        </div>
      </header>

      <main ref={mainRef}>
        {isLoading ? (
          <div className="loader"></div>
        ) : (
          <div id="result" ref={resultRef}>{result}</div>
        )}
      </main>

      <footer>
        <button className="pick-button" onClick={pickRandomWord} disabled={isLoading}>
          お題を引く
        </button>
      </footer>

      <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
        <a href="#" onClick={clearSessionStorage}>お題を最新のものに更新</a>
        <a href="#" onClick={checkPasswordAndRedirect}>お題リストへ</a>
      </div>

      <div className={`overlay ${isSideMenuOpen ? 'open' : ''}`} onClick={toggleSideMenu}></div>
    </div>
  );
};

export default RandomWordPicker;