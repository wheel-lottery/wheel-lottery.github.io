import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LotteryWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState('未抽');
  const [winner, setWinner] = useState(null);
  const [finalRotation, setFinalRotation] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [currentWheelNames, setCurrentWheelNames] = useState([]);
  
  // 初始名單 48 人
  const initialNames = [
    '王小明', '李小華', '張志明', '陳美玲', '林建國',
    '黃雅婷', '吳家豪', '鄭淑芬', '劉俊傑', '許雅文',
    '何志偉', '蔡佳穎', '楊文杰', '謝淑惠', '賴建成',
    '周美玲', '徐志豪', '孫雅芳', '馬俊宏', '高淑華',
    '郭建志', '梁雅婷', '沈文傑', '曾淑芬', '彭志明',
    '游雅玲', '呂建國', '蕭淑惠', '施俊豪', '紀美玲',
    '范志偉', '姜雅文', '洪建成', '龔淑華', '嚴志豪',
    '韓雅婷', '尹文傑', '邱淑芬', '侯志明', '康美玲',
    '石建國', '余雅文', '賈志偉', '方淑惠', '江俊豪',
    '唐雅玲', '魏建成', '董淑華'
  ];

  // 從 localStorage 讀取資料，如果沒有則使用初始值
  const [remainingNames, setRemainingNames] = useState(() => {
    try {
      const saved = localStorage.getItem('remainingNames');
      return saved ? JSON.parse(saved) : initialNames;
    } catch {
      return initialNames;
    }
  });
  
  const [drawnNames, setDrawnNames] = useState(() => {
    try {
      const saved = localStorage.getItem('drawnNames');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      // 檢查是否為舊格式（字串陣列），如果是就清空重來
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        localStorage.removeItem('drawnNames');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });
  
  // 當 remainingNames 或 drawnNames 改變時，存入 localStorage
  useEffect(() => {
    localStorage.setItem('remainingNames', JSON.stringify(remainingNames));
  }, [remainingNames]);
  
  useEffect(() => {
    localStorage.setItem('drawnNames', JSON.stringify(drawnNames));
  }, [drawnNames]);
  
  // 獎項設定
  const prizes = [
    { name: '優等獎', item: '禮券_新光三越，5千', count: 10 },
    { name: '參獎', item: '禮券_新光三越，三千', count: 5 },
    { name: '貳獎', item: '藍芽耳機 APPLE AirPods Pro 3', count: 2 },
    { name: '壹獎', item: '吸塵器 Dyson V8 Cyclone 無線吸塵器', count: 1 },
    { name: '特等獎', item: '平板 iPad Air M3晶片/11吋/WiFi/128G 平板電腦', count: 1 },
    { name: '頭獎', item: '手機APPLE iPhone17 Pro(256G)', count: 1 }
  ];

  // 計算當前應該抽什麼獎項
  const getCurrentPrize = () => {
    let currentCount = drawnNames.length;
    let accumulated = 0;
    
    for (let prize of prizes) {
      if (currentCount < accumulated + prize.count) {
        return {
          ...prize,
          currentNumber: currentCount - accumulated + 1
        };
      }
      accumulated += prize.count;
    }
    return null;
  };

  const currentPrize = getCurrentPrize();

  // 輪盤顯示的名字 - 只在不轉動時更新
  const wheelNames = currentWheelNames.length > 0 ? currentWheelNames : remainingNames.slice(0, 40);
  const segmentAngle = 360 / 40;
  
  // 總共要抽 20 人
  const totalDrawCount = prizes.reduce((sum, p) => sum + p.count, 0);

  const spinWheel = () => {
    if (isSpinning || remainingNames.length === 0 || drawnNames.length >= totalDrawCount) {
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    
    // 鎖定當前輪盤上的名字
    const frozenWheelNames = remainingNames.slice(0, 40);
    setCurrentWheelNames(frozenWheelNames);

    // 隨機選擇一個索引
    const winnerIndex = Math.floor(Math.random() * Math.min(40, remainingNames.length));
    const selectedName = frozenWheelNames[winnerIndex];
    
    // 計算最終停止角度：多轉幾圈後停在中獎位置
    const spins = 10; // 固定轉 10 圈
    // 讓指針指向中獎者（指針在正上方，名字在色塊中心）
    const targetAngle = -(winnerIndex * segmentAngle + segmentAngle / 2);
    const newRotation = 360 * spins + targetAngle;
    
    setFinalRotation(newRotation);
    setSpinKey(prev => prev + 1); // 觸發新動畫

    setTimeout(() => {
      setIsSpinning(false);
      const prize = getCurrentPrize();
      setWinner({ name: selectedName, prize });
      
      // 停下來後，再等 10 秒才更新名單
      setTimeout(() => {
        setRemainingNames(prev => prev.filter(name => name !== selectedName));
        setDrawnNames(prev => [...prev, { name: selectedName, prize }]);
        setCurrentWheelNames([]);
        setWinner(null); // 清空中獎訊息
      }, 10000);
    }, 10000);
  };

  // 重置遊戲
  const resetGame = () => {
    // 先清除 localStorage
    localStorage.clear();
    
    // 重置所有 state
    setDrawnNames([]);
    setRemainingNames([...initialNames]);
    setWinner(null);
    setCurrentWheelNames([]);
    setFinalRotation(0);
    setSpinKey(0);
    setActiveTab('未抽');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-8">
      <style>{`
        @keyframes spin-wheel {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(${finalRotation}deg);
          }
        }
        
        .spinning {
          animation: spin-wheel 10s cubic-bezier(0.17, 0.67, 0.12, 0.99);
          animation-fill-mode: forwards;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-2 gap-4">
          <h1 className="text-xl font-bold text-white text-center flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            輪盤抽獎系統
            <Sparkles className="w-5 h-5" />
          </h1>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm"
          >
            重置遊戲
          </button>
        </div>

        <div 
          className="flex gap-4"
          style={{
            flexDirection: window.innerWidth >= 768 ? 'row' : 'column'
          }}
        >
        {/* 輪盤區域 */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 flex-shrink-0" style={{ width: window.innerWidth >= 768 ? 'auto' : '100%' }}>
          <div 
            className="flex gap-8"
            style={{
              flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
              justifyContent: window.innerWidth >= 768 ? 'center' : 'flex-start',
              alignItems: window.innerWidth >= 768 ? 'center' : 'flex-start'
            }}
          >
            {/* 左側：輪盤 */}
            <div className="flex-shrink-0 flex flex-col items-center">
              {/* 超明顯的指針 - 在輪盤容器外 */}
              <div 
                className="relative mb-4"
                style={{
                  width: window.innerWidth >= 768 ? '450px' : '250px'
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50">
                  <svg className="w-12 h-12 md:w-20 md:h-20" viewBox="0 0 80 80">
                    <polygon points="40,70 20,10 40,20 60,10" fill="#DC2626" stroke="#991B1B" strokeWidth="3"/>
                  </svg>
                </div>
              </div>
              
              <div 
                className="relative"
                style={{
                  width: window.innerWidth >= 768 ? '450px' : '250px',
                  height: window.innerWidth >= 768 ? '450px' : '250px'
                }}
              >

            {/* 輪盤 */}
            <div 
              key={spinKey}
              className={`relative w-full h-full rounded-full shadow-lg ${isSpinning ? 'spinning' : ''}`}
              style={{ 
                transform: isSpinning ? undefined : `rotate(${finalRotation}deg)`,
                background: 'conic-gradient(from 0deg, #ff6b6b 0deg 9deg, #4ecdc4 9deg 18deg, #ffe66d 18deg 27deg, #a8e6cf 27deg 36deg, #ff8b94 36deg 45deg, #c7ceea 45deg 54deg, #ffd3b6 54deg 63deg, #98d8c8 63deg 72deg, #ff6b6b 72deg 81deg, #4ecdc4 81deg 90deg, #ffe66d 90deg 99deg, #a8e6cf 99deg 108deg, #ff8b94 108deg 117deg, #c7ceea 117deg 126deg, #ffd3b6 126deg 135deg, #98d8c8 135deg 144deg, #ff6b6b 144deg 153deg, #4ecdc4 153deg 162deg, #ffe66d 162deg 171deg, #a8e6cf 171deg 180deg, #ff8b94 180deg 189deg, #c7ceea 189deg 198deg, #ffd3b6 198deg 207deg, #98d8c8 207deg 216deg, #ff6b6b 216deg 225deg, #4ecdc4 225deg 234deg, #ffe66d 234deg 243deg, #a8e6cf 243deg 252deg, #ff8b94 252deg 261deg, #c7ceea 261deg 270deg, #ffd3b6 270deg 279deg, #98d8c8 279deg 288deg, #ff6b6b 288deg 297deg, #4ecdc4 297deg 306deg, #ffe66d 306deg 315deg, #a8e6cf 315deg 324deg, #ff8b94 324deg 333deg, #c7ceea 333deg 342deg, #ffd3b6 342deg 351deg, #98d8c8 351deg 360deg)',
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              {wheelNames.map((name, index) => {
                const angle = index * segmentAngle + segmentAngle / 2; // 加上一半角度，讓名字在色塊中心
                return (
                  <div
                    key={index}
                    className="absolute w-full h-full flex items-start justify-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <span 
                      className="font-bold"
                      style={{ 
                        transform: 'rotate(90deg)',
                        color: '#333',
                        marginTop: window.innerWidth >= 768 ? '30px' : '15px',
                        fontSize: window.innerWidth >= 768 ? '20px' : '12px'
                      }}
                    >
                      {name}
                    </span>
                  </div>
                );
              })}
              
              {/* 中心圓 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-lg border-4 border-yellow-400"></div>
            </div>
            </div>
          </div>

          {/* 右側：抽獎按鈕和結果 */}
          <div 
            className="flex-1"
            style={{
              marginTop: window.innerWidth >= 768 ? '0' : '16px',
              maxWidth: window.innerWidth >= 768 ? '400px' : 'none'
            }}
          >
            {currentPrize && (
              <div className="mb-4 p-4 bg-blue-100 rounded-xl text-center md:text-left">
                <p className="text-xl font-bold text-blue-700">目前抽取：{currentPrize.name}</p>
                <p className="text-lg text-blue-600 mt-2">{currentPrize.item}</p>
                <p className="text-base text-blue-500 mt-2">第 {currentPrize.currentNumber} / {currentPrize.count} 個</p>
              </div>
            )}
            
            <div className="text-center md:text-left">
            <button
              onClick={spinWheel}
              disabled={isSpinning || remainingNames.length === 0 || drawnNames.length >= totalDrawCount}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
            >
              {isSpinning ? '抽獎中...' : drawnNames.length >= totalDrawCount ? '已抽完所有獎項' : remainingNames.length === 0 ? '名單已空' : '開始抽獎'}
            </button>
            
            {winner && (
              <div className="mt-6 p-5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
                <p className="text-2xl font-bold text-orange-600">🎉 恭喜中獎</p>
                <p className="text-4xl font-bold text-orange-700 mt-3">{winner.name}</p>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xl font-bold text-red-600">{winner.prize.name}</p>
                  <p className="text-lg text-gray-700 mt-2">{winner.prize.item}</p>
                </div>
              </div>
            )}

            <div className="mt-4 text-gray-600 text-base">
              已抽出：{drawnNames.length} / {totalDrawCount} 人
            </div>
            </div>
          </div>
          </div>
        </div>

        {/* Tabs 區域 */}
        <div 
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex-1"
          style={{
            marginTop: window.innerWidth >= 768 ? '0' : '16px',
            minWidth: window.innerWidth >= 768 ? '400px' : 'auto'
          }}
        >
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('未抽')}
              className={`flex-1 font-bold transition-colors ${
                activeTab === '未抽' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ padding: '0.5rem 1rem', fontSize: '18px' }}
            >
              尚未抽中名單 ({remainingNames.length})
            </button>
            <button
              onClick={() => setActiveTab('已抽')}
              className={`flex-1 font-bold transition-colors ${
                activeTab === '已抽' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ padding: '0.5rem 1rem', fontSize: '18px' }}
            >
              抽獎結果名單 ({drawnNames.length})
            </button>
          </div>

          <div style={{ padding: '0.5rem !important' }}>
            {activeTab === '未抽' ? (
              <div className="grid grid-cols-2" style={{ gap: '0.5rem !important' }}>
                {/* 第一欄：1-24 */}
                <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left text-blue-700">編號</th>
                        <th className="px-2 py-1 text-left text-blue-700">姓名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remainingNames.slice(0, 24).map((name, index) => (
                        <tr key={index} className={`border-b border-blue-100 hover:bg-blue-50 ${index % 2 === 1 ? 'bg-blue-25' : ''}`} style={index % 2 === 1 ? { backgroundColor: '#f0f7ff' } : {}}>
                          <td className="px-2 py-1 text-gray-600">{index + 1}</td>
                          <td className="px-2 py-1 text-gray-700 font-medium">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* 第二欄：25-48 */}
                <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left text-blue-700">編號</th>
                        <th className="px-2 py-1 text-left text-blue-700">姓名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remainingNames.slice(24, 48).map((name, index) => (
                        <tr key={index} className={`border-b border-blue-100 hover:bg-blue-50 ${index % 2 === 1 ? 'bg-blue-25' : ''}`} style={index % 2 === 1 ? { backgroundColor: '#f0f7ff' } : {}}>
                          <td className="px-2 py-1 text-gray-600">{index + 25}</td>
                          <td className="px-2 py-1 text-gray-700 font-medium">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
              <div className="grid grid-cols-4 gap-3">
                {drawnNames.length === 0 ? (
                  <div className="col-span-4 text-center text-gray-500 py-8">
                    尚無抽獎結果
                  </div>
                ) : (
                  drawnNames.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center text-gray-700"
                    >
                      <p className="font-bold text-lg">{item?.name || item}</p>
                      {item?.prize && (
                        <>
                          <p className="text-xs text-red-600 mt-1">{item.prize.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.prize.item}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryWheel;