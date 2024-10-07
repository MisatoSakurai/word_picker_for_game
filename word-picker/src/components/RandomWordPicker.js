import React, { useState, useEffect, useRef } from 'react';
import '../styles/RandomWordPicker.css';

const RandomWordPicker = () => {
  const [data, setData] = useState({});
  const [headers, setHeaders] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 初期値をtrueに設定
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [results, setResults] = useState(Array(4).fill('ゲームを選択してください'));
  const resultRefs = useRef([]);
  const containerRefs = useRef([]);

  const resultRef = useRef(null);
  const mainRef = useRef(null);

  const [fontSizes, setFontSizes] = useState({});

  const [selectedTimer, setSelectedTimer] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);

  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const [isTimeAlmostUp, setIsTimeAlmostUp] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [selectedFont, setSelectedFont] = useState('NotoSansJP');

  const fontOptions = [
    { value: 'NotoSansJP', label: 'Noto Sans JP' },
    { value: 'AppliMincho', label: 'アプリ明朝' }, // アプリ明朝を追加
    { value: 'Azuki', label: '小豆フォント' },
    { value: 'MakaPop', label: '851マカポップ' },
  ];

  const adjustFontSize = () => {
    const resultElement = resultRef.current;
    const mainElement = mainRef.current;
    console.log("mainElement", mainElement);
    console.log("resultElement", resultElement);
    if (!resultElement || !mainElement) return;

    const maxWidth = mainElement.clientWidth * 0.9;
    const maxHeight = mainElement.clientHeight * 0.8;
    console.log(maxWidth, maxHeight);

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
    setIsLoading(true); // データ取得開始時にローディングを表示
    const storedData = sessionStorage.getItem('spreadsheetData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setHeaders(parsedData.headers);
      setData(parsedData.data);
      setIsLoading(false); // データ取得完了時にローディングを非表示
    } else {
      fetchDataFromAPI();
    }
  };

  const fetchDataFromAPI = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    if (!API_URL) {
      console.error('API_URL is not defined');
      setResult('API URLの設定が見つかりません。');
      setIsLoading(false);
      return;
    }

    fetch(API_URL)
      .then(response => response.json())
      .then(jsonData => {
        setHeaders(jsonData.headers);
        setData(jsonData.data);
        sessionStorage.setItem('spreadsheetData', JSON.stringify(jsonData));
        setIsLoading(false); // データ取得完了時にローディングを非表示
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setResult('データの読み込みに失敗しました。');
        setIsLoading(false); // エラー時もローディングを非表示
      });
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingTime(selectedTimer);
    setIsTimeAlmostUp(false);
    setIsTimeUp(false);
    
    if (selectedTimer === 0) return; // タイ���ーが0（なし）の場合は何もしない

    timerRef.current = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 6 && prevTime > 1) {
          setIsTimeAlmostUp(true);
        }
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setShowTimeUpPopup(true);
          setIsTimeAlmostUp(false);
          setIsTimeUp(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const closeTimeUpPopup = () => {
    setShowTimeUpPopup(false);
  };

  const pickRandomWord = () => {
    if (!selectedColumn) {
      setResults(Array(playerCount).fill("ゲームを選択してください"));
      return;
    }

    const columnIndex = headers.indexOf(selectedColumn);
    if (columnIndex === -1) {
      alert('選択されたゲームが見つかりません');
      return;
    }

    let words = data.map(row => row[columnIndex]).filter(Boolean);
    if (words.length === 0) {
      alert('全てのお題を引きました。右上のメニューよりお題を更新してください');
      return;
    }

    const newResults = [];
    for (let i = 0; i < playerCount; i++) {
      if (words.length === 0) {
        newResults.push("単語がありません");
      } else {
        const randomIndex = Math.floor(Math.random() * words.length);
        const pickedWord = words[randomIndex];
        newResults.push(pickedWord);
        words.splice(randomIndex, 1);
      }
    }
    setResults(newResults);

    // セッションストレージからデータを削除
    const updatedData = data.filter(row => !newResults.includes(row[columnIndex]));
    setData(updatedData);

    // セッションストレージを更新
    const updatedSessionData = {
      headers: headers,
      data: updatedData
    };
    sessionStorage.setItem('spreadsheetData', JSON.stringify(updatedSessionData));

    if (updatedData.length === 0) {
      alert('すべてのワードがピックされました。データをリセットします。');
      initializeApp();
    }

    startTimer();
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
    const enteredPassword = prompt('パスワーを入力してください:');
    const correctPassword = process.env.REACT_APP_COMMON_PASS;
    if (correctPassword && enteredPassword === correctPassword) {
      window.open(process.env.REACT_APP_SPREADSHEET_URL, '_blank');
    } else {
      alert('パスワードが正しくありません。');
    }
  };

  const handlePlayerCountChange = (event) => {
    setPlayerCount(Number(event.target.value));
  };

  const ResultDisplay = ({ result, index }) => (
    <div 
      className={`result-container player-${index + 1}`}
      ref={el => containerRefs.current[index] = el}
    >
      <div 
        className={`result font-${selectedFont}`}
        ref={el => resultRefs.current[index] = el}
        style={{ fontSize: `${fontSizes[`player-${index + 1}`] || 16}px` }}
      >
        {result}
      </div>
    </div>
  );

  useEffect(() => {
    resultRefs.current = resultRefs.current.slice(0, playerCount);
    containerRefs.current = containerRefs.current.slice(0, playerCount);
    adjustFontSizes();
    window.addEventListener('resize', adjustFontSizes);
    return () => window.removeEventListener('resize', adjustFontSizes);
  }, [results, playerCount]);

  const adjustFontSizes = () => {
    const mainElement = mainRef.current;
    console.log("mainElement", mainElement);
    if (!mainElement) return;

    const newFontSizes = {};

    resultRefs.current.forEach((resultRef, index) => {
      if (resultRef) {
        console.log("resultElement", resultRef);
        const maxWidth = mainElement.clientWidth * 0.9 / Math.ceil(Math.sqrt(playerCount));
        const maxHeight = mainElement.clientHeight * 0.8 / Math.ceil(Math.sqrt(playerCount));
        console.log("maxWidth", maxWidth);
        console.log("maxHeight", maxHeight);

        let fontSize = Math.min(maxWidth, maxHeight) / 2; // 初期フォントサイズを調整
        console.log("init_fontSize", fontSize);
        resultRef.style.fontSize = `${fontSize}px`;
        console.log("最初のresultRef.scrollWidth", resultRef.scrollWidth);
        console.log("最初のresultRef.scrollHeight", resultRef.scrollHeight);
        while (
          (resultRef.scrollWidth > maxWidth || resultRef.scrollHeight > maxHeight) &&
          fontSize > 16
        ) {
          fontSize -= 1;
          resultRef.style.fontSize = `${fontSize}px`;
        }
        console.log("resultRef.scrollWidth", resultRef.scrollWidth);
        console.log("resultRef.scrollHeight", resultRef.scrollHeight);
        console.log("resultRef.style.fontSize", resultRef.style.fontSize);
        newFontSizes[`player-${index + 1}`] = fontSize;
      }
    });

    setFontSizes(newFontSizes);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timerOptions = [
    { value: 0, label: 'なし' },
    { value: 10, label: '10秒' },
    { value: 30, label: '30秒' },
    { value: 60, label: '1:00' },
    { value: 90, label: '1:30' },
    { value: 120, label: '2:00' },
    { value: 180, label: '3:00' },
    { value: 300, label: '5:00' },
    { value: 600, label: '10:00' },
  ];

  useEffect(() => {
    document.documentElement.style.setProperty('--selected-font', selectedFont);
    document.body.className = `font-${selectedFont}`;
  }, [selectedFont]);

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
          <select
            value={playerCount}
            onChange={handlePlayerCountChange}
            className="player-count-select"
          >
            {[1, 2, 3, 4].map(count => (
              <option key={count} value={count}>{count}人</option>
            ))}
          </select>
          <button className="hamburger-menu" onClick={toggleSideMenu}>☰</button>
          <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
            <a href="#" onClick={clearSessionStorage}>お題を更新</a>
            <a href="#" onClick={checkPasswordAndRedirect}>お題リストへ</a>
            <div className="timer-selector">
              <span>タイマー：</span>
              <select
                value={selectedTimer}
                onChange={(e) => setSelectedTimer(Number(e.target.value))}
              >
                {timerOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="font-selector">
              <span>フォント：</span>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={`overlay ${isSideMenuOpen ? 'open' : ''}`} onClick={toggleSideMenu}></div>
        </div>
      </header>

      <main ref={mainRef} className={`player-count-${playerCount}`}>
        <div className="loader" style={{display: isLoading ? 'block' : 'none'}}></div>
        {results.slice(0, playerCount).map((result, index) => (
          <ResultDisplay key={index} result={result} index={index} />
        ))}
      </main>

      <footer>
        <button className="pick-button" onClick={pickRandomWord} disabled={isLoading}>
          {remainingTime > 0 ? `お題を引く (${formatTime(remainingTime)})` : 'お題を引く'}
        </button>
      </footer>

      {showTimeUpPopup && selectedTimer !== 0 && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>タイムアップ！</h2>
            <button onClick={closeTimeUpPopup}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomWordPicker;