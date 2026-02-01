import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import bgImage from './assets/bg.PNG';
import logoSvg from './assets/logo.svg';

const App = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState('未抽');
  const [winner, setWinner] = useState<{ names: string[]; prize: any } | null>(null);
  const [finalRotation, setFinalRotation] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [currentWheelNames, setCurrentWheelNames] = useState<string[]>([]);
  const [waitingForNext, setWaitingForNext] = useState(false); // 是否在等待進行下一獎
  const [currentDisplayPrize, setCurrentDisplayPrize] = useState<any>(null); // 當前顯示的獎項（用於指針位置）
  
  // 每輪的得獎者位置設定（1-based 索引）
  const winnerPositionsConfig: { [key: string]: number[] } = {
    '優等獎': [1, 5, 10, 14, 19, 24, 30, 34, 39, 45],
    '貳獎': [3, 25],
    '壹獎': [15],
    '特等獎': [20],
    '頭獎': [10],
    '加碼獎': [3, 9, 15, 21, 28]  // 修正：第六輪只有33人，位置要在1-33內
  };
  
  // 每輪輪盤一開始偏移的位置數（讓人看不出做假）
  const initialOffsetPositions: { [key: string]: number } = {
    '優等獎': 16,  // 偏移16個位置
    '貳獎': 25,
    '壹獎': 20,
    '特等獎': 28,
    '頭獎': 22,
    '加碼獎': 26
  };
  
  // 根據得獎者位置重新排列名單
  const arrangeWheelNames = (allNames: string[], winnerNames: string[], positions: number[]) => {
    const totalCount = allNames.length;
    const arranged = new Array(totalCount).fill(null);
    
    // 先把得獎者放到指定位置（1-based 轉 0-based）
    positions.forEach((pos, idx) => {
      if (idx < winnerNames.length && pos > 0 && pos <= totalCount) {
        arranged[pos - 1] = winnerNames[idx];
      }
    });
    
    // 其他人填入剩餘位置
    const otherNames = allNames.filter(name => !winnerNames.includes(name));
    let otherIndex = 0;
    for (let i = 0; i < totalCount; i++) {
      if (arranged[i] === null && otherIndex < otherNames.length) {
        arranged[i] = otherNames[otherIndex++];
      }
    }
    
    return arranged.filter(name => name !== null);
  };
  
  // 已抽中的獎項結果
  const initialDrawnResults = [
    // 優等獎 10個
    { name: '騰達泵浦', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '濬捷機電', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '嘉溢五金', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '泉興電機', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '金樹電機', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '東興電機', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '竹翔泵浦', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '匠益電機', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '永祥泵浦', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    { name: '仁偉電機', prize: { name: '優等獎', item: '禮券_新光三越，五千', count: 10 } },
    // 貳獎 2個
    { name: '泰元電機', prize: { name: '貳獎', item: '藍芽耳機 APPLE AirPods Pro 3', count: 2 } },
    { name: '育昌五金', prize: { name: '貳獎', item: '藍芽耳機 APPLE AirPods Pro 3', count: 2 } },
    // 壹獎 1個
    { name: '元一行', prize: { name: '壹獎', item: '吸塵器 Dyson V8 Cyclone 無線吸塵器', count: 1 } },
    // 特等獎 1個
    { name: '明泉五金', prize: { name: '特等獎', item: '平板 iPad Air M3晶片/11吋/WiFi/128G 平板電腦', count: 1 } },
    // 頭獎 1個
    { name: '侑鑫電機', prize: { name: '頭獎', item: '手機APPLE iPhone17 Pro(256G)', count: 1 } },
    // 加碼獎 5個
    { name: '嘉源五金', prize: { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 } },
    { name: '正岱電機', prize: { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 } },
    { name: '建東電機', prize: { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 } },
    { name: '盛輝電機', prize: { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 } },
    { name: '德龍電機', prize: { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 } },
  ];
  
  // 初始名單 48 家
  const initialNames = [
    '騰達泵浦', '濬捷機電', '嘉溢五金', '泉興電機', '金樹電機',
    '東興電機', '竹翔泵浦', '匠益電機', '永祥泵浦', '仁偉電機',
    '泰元電機', '育昌五金', '元一行', '明泉五金', '侑鑫電機',
    '嘉源五金', '正岱電機', '建東電機', '盛輝電機', '德龍電機',
    '百賜吉', '富巃實業', '東大五金(泉鋒)', '興龍電機', '溢泉實業',
    '廣源五金', '裕祥電機', '進泉五金', '信泉五金', '太詮企業',
    '耐斯五金', '紘惺企業', '正久電機', '國泰水電', '大泉行',
    '弘舜電機', '宏耘電機', '志安電機', '久建大興業', '銓勝行',
    '玄太電機', '川友泵浦', '源隆管件', '惠豐', '伸豐五金',
    '聖泰電機', '宇成興業', '國泰行'
  ];

  // 從 localStorage 讀取資料，如果沒有則使用初始值
  const [remainingNames, setRemainingNames] = useState(() => {
    try {
      const saved = localStorage.getItem('remainingNames');
      if (saved) return JSON.parse(saved);
      // 預設全部 48 人都在
      return initialNames;
    } catch {
      return initialNames;
    }
  });
  
  const [drawnNames, setDrawnNames] = useState(() => {
    try {
      const saved = localStorage.getItem('drawnNames');
      if (!saved) return [];  // 預設為空，沒有得獎者
      
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
    { name: '優等獎', item: '禮券_新光三越，五千', count: 10 },
    { name: '貳獎', item: '藍芽耳機 APPLE AirPods Pro 3', count: 2 },
    { name: '壹獎', item: '吸塵器 Dyson V8 Cyclone 無線吸塵器', count: 1 },
    { name: '特等獎', item: '平板 iPad Air M3晶片/11吋/WiFi/128G 平板電腦', count: 1 },
    { name: '頭獎', item: '手機APPLE iPhone17 Pro(256G)', count: 1 },
    { name: '加碼獎', item: '禮券_新光三越，三千', count: 5 }
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
  const wheelNames = currentWheelNames.length > 0 ? currentWheelNames : (() => {
    // 如果有當前獎項，且還沒開始抽獎，就排列名單
    if (currentPrize && remainingNames.length > 0) {
      const currentDrawnCount = drawnNames.length;
      const drawCount = Math.min(currentPrize.count, remainingNames.length);
      const selectedWinners = initialDrawnResults.slice(currentDrawnCount, currentDrawnCount + drawCount);
      const presetWinnerNames = selectedWinners.map(w => w.name);
      const positions = winnerPositionsConfig[currentPrize.name] || [];
      
      return arrangeWheelNames(remainingNames, presetWinnerNames, positions);
    }
    return remainingNames;
  })();
  const segmentAngle = 360 / wheelNames.length;
  
  // 計算當前輪盤應該的初始偏移角度
  const currentInitialOffset = currentPrize ? (
    (initialOffsetPositions[currentPrize.name] || 16) * segmentAngle
  ) : 0;
  
  // 總共要抽 20 人
  const totalDrawCount = prizes.reduce((sum, p) => sum + p.count, 0);

  const spinWheel = () => {
    if (isSpinning || remainingNames.length === 0 || drawnNames.length >= totalDrawCount) {
      return;
    }

    const prize = getCurrentPrize();
    if (!prize) return;

    // 設置當前顯示的獎項（用於指針位置）
    setCurrentDisplayPrize(prize);

    // 計算本次要抽出的人數（該獎項的全部數量）
    const drawCount = Math.min(prize.count, remainingNames.length);
    
    // 從 initialDrawnResults 中找出當前獎項對應的中獎者名單
    const currentDrawnCount = drawnNames.length;
    const selectedWinners = initialDrawnResults.slice(currentDrawnCount, currentDrawnCount + drawCount);
    const presetWinnerNames = selectedWinners.map(w => w.name);
    
    setIsSpinning(true);
    setWinner(null);
    
    // 根據得獎者位置重新排列輪盤名單
    const winnerPositions = winnerPositionsConfig[prize.name] || [];
    const arrangedNames = arrangeWheelNames(remainingNames, presetWinnerNames, winnerPositions);
    setCurrentWheelNames(arrangedNames);
    
    const frozenSegmentAngle = 360 / arrangedNames.length;
    
    const offsetPositions = initialOffsetPositions[prize.name] || 30;
    
    // 計算輪盤的初始偏移角度（往順時針方向偏移 N 個位置）
    const initialOffsetAngle = offsetPositions * frozenSegmentAngle;
    
    // 計算目標旋轉角度
    // 輪盤初始在 initialOffsetAngle（如 120°）
    // 目標：轉到 0° 讓指針對齊得獎者
    // 需要轉的角度：從 120° 到 0° = 轉 240° (或 -120°，但用正數比較好)
    const rotationToZero = 360 - initialOffsetAngle;
    
    // 輪盤旋轉：從初始位置 + 多轉10圈 + 轉到0°
    // 例如：120° + 3600° + 240° = 3960° = 11圈 = 0° (mod 360)
    const spins = 10;
    const newRotation = initialOffsetAngle + 360 * spins + rotationToZero;
    
    setFinalRotation(newRotation);
    setSpinKey(prev => prev + 1); // 觸發新動畫

    setTimeout(() => {
      setIsSpinning(false);
      
      // 直接使用預設的中獎名單
      const finalWinners: string[] = presetWinnerNames;
      
      // 顯示所有得獎者
      setWinner({ names: finalWinners, prize });
      
      // 只更新 drawnNames（用於顯示結果），不更新 remainingNames
      const newDrawnNames = finalWinners.map((name: string) => ({ name, prize }));
      setDrawnNames((prev: any[]) => [...prev, ...newDrawnNames]);
      
      // 停下來後，設置等待進行下一獎的狀態
      setWaitingForNext(true);
    }, 10000);
  };

  // 進行下一獎
  const proceedToNext = () => {
    if (!winner) return;
    
    const finalWinners = winner.names;
    
    // 現在才更新 remainingNames（移除中獎者）
    setRemainingNames((prev: string[]) => prev.filter((name: string) => !finalWinners.includes(name)));
    
    // 清空中獎訊息並準備下一輪
    setCurrentWheelNames([]);
    setWinner(null);
    setFinalRotation(0); // 重置旋轉角度，讓下一輪重新計算偏移
    setSpinKey(prev => prev + 1); // 重置動畫，確保下一輪從新的初始位置開始
    setWaitingForNext(false);
    setCurrentDisplayPrize(null); // 清空當前顯示獎項，讓指針跳到下一輪
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
    setWaitingForNext(false);
    setCurrentDisplayPrize(null);
  };

  return (
    <div className="min-h-screen" style={{ padding: '0 40px 40px 40px', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
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
      
      <div>
        <div className="flex items-center justify-between" style={{ height: '120px' }}>
          <img src={logoSvg} alt="Logo" style={{ height: '80px', width: 'auto' }} />
          <div className="flex items-center gap-4">
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
        </div>

        <div 
          className="flex gap-4"
          style={{
            flexDirection: window.innerWidth >= 768 ? 'row' : 'column'
          }}
        >
        {/* 輪盤區域 */}
        <div className="rounded-3xl shadow-2xl flex items-center justify-center" style={{ flex: '2', minWidth: 0, height: '900px', backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '0 4rem' }}>
          <div 
            className="flex"
            style={{
              flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
              justifyContent: window.innerWidth >= 768 ? 'center' : 'flex-start',
              alignItems: window.innerWidth >= 768 ? 'center' : 'flex-start',
              gap: window.innerWidth >= 768 ? '70px' : '32px'
            }}
          >
            {/* 左側：輪盤 */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div 
                className="relative"
                style={{
                  width: window.innerWidth >= 768 ? '600px' : '250px',
                  height: window.innerWidth >= 768 ? '600px' : '250px'
                }}
              >
                {/* 指針 - 根據預設位置分散 */}
                {(currentDisplayPrize || currentPrize) && (() => {
                  const displayPrize = currentDisplayPrize || currentPrize;
                  const positions = winnerPositionsConfig[displayPrize.name] || [];
                  const totalNames = currentWheelNames.length > 0 ? currentWheelNames.length : remainingNames.length;
                  const anglePerSegment = 360 / totalNames;
                  
                  return positions.map((position, i) => {
                    // position 是 1-based，轉換為 0-based index
                    const segmentIndex = position - 1;
                    // 計算該位置的角度（扇形中心）
                    const angle = segmentIndex * anglePerSegment + anglePerSegment / 2;
                    const wheelSize = window.innerWidth >= 768 ? 600 : 250;
                    
                    return (
                      <div 
                        key={i}
                        className="absolute left-1/2 z-[100]"
                        style={{
                          top: `-40px`,
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                          transformOrigin: `center ${wheelSize/2 + 40}px`
                        }}
                      >
                        <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 80 80">
                          <polygon points="40,70 20,10 40,20 60,10" fill="#DC2626" stroke="#991B1B" strokeWidth="3"/>
                        </svg>
                      </div>
                    );
                  });
                })()}

            {/* 輪盤 */}
            <div 
              key={spinKey}
              className={`relative w-full h-full rounded-full shadow-lg ${isSpinning ? 'spinning' : ''}`}
              style={{ 
                transform: isSpinning ? undefined : `rotate(${finalRotation || currentInitialOffset}deg)`,
                background: (() => {
                  const segments = wheelNames.length;
                  const anglePerSegment = 360 / segments;
                  
                  // 找出合適的因數來決定色相重複數
                  const findGoodDivisor = (n: number) => {
                    // 優先找 3-8 之間的因數（避免太多或太少色相）
                    for (let target = 6; target >= 3; target--) {
                      if (n % target === 0) return target;
                    }
                    for (let target = 7; target <= 8; target++) {
                      if (n % target === 0) return target;
                    }
                    // 找所有因數中接近平方根的
                    const sqrt = Math.sqrt(n);
                    for (let i = Math.floor(sqrt); i >= 2; i--) {
                      if (n % i === 0) return i;
                    }
                    return 2; // 最少用2個色相
                  };
                  
                  const colorCount = findGoodDivisor(segments);
                  
                  // 預設穿插的色相組，確保首尾對比明顯（紅、青、黃、紫、橘、綠...）
                  const baseHues = [0, 180, 60, 240, 30, 150, 90, 270, 120, 210, 330, 300];
                  
                  let gradient = 'conic-gradient(from 0deg';
                  for (let i = 0; i < segments; i++) {
                    // 取前 colorCount 個色相循環使用
                    const hue = baseHues[i % colorCount];
                    // 紫色(240°)特別調亮
                    const lightness = hue === 240 ? 75 : 70;
                    const color = `hsl(${hue}, 70%, ${lightness}%)`;
                    const startAngle = i * anglePerSegment;
                    const endAngle = (i + 1) * anglePerSegment;
                    gradient += `, ${color} ${startAngle}deg ${endAngle}deg`;
                  }
                  gradient += ')';
                  return gradient;
                })(),
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              {wheelNames.map((name: string, index: number) => {
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
                        marginTop: window.innerWidth >= 768 ? '40px' : '15px',
                        fontSize: window.innerWidth >= 768 ? '22px' : '12px'
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
              marginTop: window.innerWidth >= 768 ? '0' : '16px'
            }}
          >
            {currentPrize && (
              <div className="mb-4 p-4 bg-white rounded-xl text-center md:text-left shadow-md" style={{ width: '100%', minWidth: '400px' }}>
                <p className="text-xl font-bold text-gray-800">目前抽取：{currentPrize.name}</p>
                <p className="text-2xl text-gray-700 mt-2">{currentPrize.item}</p>
                <p className="text-base text-gray-600 mt-2">共 {currentPrize.count} 個名額</p>
              </div>
            )}
            
            <div className="text-center md:text-left">
            <button
              onClick={waitingForNext ? proceedToNext : spinWheel}
              disabled={(isSpinning || remainingNames.length === 0 || drawnNames.length >= totalDrawCount) && !waitingForNext}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
            >
              {isSpinning ? '抽獎中...' : waitingForNext ? '進行下一獎' : drawnNames.length >= totalDrawCount ? '已抽完所有獎項' : remainingNames.length === 0 ? '名單已空' : '開始抽獎'}
            </button>
            
            {winner && (
              <div className="mt-6 p-5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
                <p className="text-2xl font-bold text-orange-600">🎉 恭喜中獎</p>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xl font-bold text-red-600">{winner.prize.name}</p>
                  <p className="text-lg text-gray-700 mt-2">{winner.prize.item}</p>
                </div>
                <div className="mt-4 space-y-2">
                  {winner.names && winner.names.map((name: string, index: number) => (
                    <p key={index} className="text-xl font-bold text-orange-700">{index + 1}. {name}</p>
                  ))}
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
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{
            marginTop: window.innerWidth >= 768 ? '0' : '16px',
            minWidth: window.innerWidth >= 768 ? '400px' : 'auto',
            flex: '1',
            height: '900px'
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

          <div style={{ padding: '0.5rem !important', height: 'calc(900px - 60px)', overflow: 'auto' }}>
            {activeTab === '未抽' ? (
              <div className="grid grid-cols-2" style={{ gap: '0.5rem !important' }}>
                {/* 第一欄：1-24 */}
                <div>
                  <table className="w-full" style={{ fontSize: '16px' }}>
                    <thead className="bg-blue-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left text-blue-700">編號</th>
                        <th className="px-2 py-1 text-left text-blue-700">姓名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remainingNames.slice(0, 24).map((name: string, index: number) => (
                        <tr key={index} className={`border-b border-blue-100 hover:bg-blue-50 ${index % 2 === 1 ? 'bg-blue-25' : ''}`} style={index % 2 === 1 ? { backgroundColor: '#f0f7ff' } : {}}>
                          <td className="px-2 py-1 text-gray-600">{index + 1}</td>
                          <td className="px-2 py-1 text-gray-700 font-medium">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* 第二欄：25-48 */}
                <div>
                  <table className="w-full" style={{ fontSize: '16px' }}>
                    <thead className="bg-blue-100 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left text-blue-700">編號</th>
                        <th className="px-2 py-1 text-left text-blue-700">姓名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remainingNames.slice(24, 48).map((name: string, index: number) => (
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
              <div>
              {drawnNames.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  尚無抽獎結果
                </div>
              ) : (
                <div className="space-y-4">
                  {prizes.map((prize) => {
                    const prizeWinners = drawnNames.filter((item: any) => item?.prize?.name === prize.name);
                    if (prizeWinners.length === 0) return null;
                    
                    return (
                      <div key={prize.name} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-lg">
                            <span className="font-bold text-red-600">{prize.name}</span>
                            <span className="mx-2 text-gray-400">-</span>
                            <span className="text-base text-gray-700">{prize.item}</span>
                            <span className="ml-2 text-sm text-gray-500">(共 {prize.count} 個名額)</span>
                          </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {prizeWinners.map((item: any, index: number) => (
                            <div 
                              key={index} 
                              className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center"
                              style={{ fontSize: '16px' }}
                            >
                              <p className="font-bold text-lg text-gray-700">{item?.name || item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default App;
