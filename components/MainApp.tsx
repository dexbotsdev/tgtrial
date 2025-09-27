import React, { useState, useCallback, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import PortfolioPanel from './PortfolioPanel';
import { Token } from '../types';
import Toast from './shared/Toast';

const MainApp: React.FC = () => {
  const [snipedTokens, setSnipedTokens] = useState<Token[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSnipingActive, setIsSnipingActive] = useState<boolean>(true);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSniping = () => {
    const nextState = !isSnipingActive;
    setIsSnipingActive(nextState);
    showToast(nextState ? 'Auto-sniping started.' : 'Auto-sniping paused.');
  };

  const handleSnipeToken = useCallback((contractAddress: string) => {
    // Prevent sniping the same token twice
    if (snipedTokens.some(token => token.contractAddress === contractAddress)) {
      showToast('Token already in portfolio.');
      return;
    }

    showToast(`Snipe initiated for ${contractAddress.slice(0, 10)}...`);

    // Simulate snipe action
    setTimeout(() => {
        const snipePrice = Math.random() * 0.01;
        const amount = 1000 + Math.random() * 9000;
        const newToken: Token = {
            contractAddress,
            snipePrice,
            amount,
            currentValue: snipePrice * amount,
            pnl: 0,
            analysisLoading: false,
        };

        setSnipedTokens(prevTokens => [newToken, ...prevTokens]);
        showToast(`Successfully sniped ${amount.toFixed(0)} tokens!`);
    }, 1500);
  }, [snipedTokens]);

  const handleSellToken = useCallback((contractAddress: string) => {
    const token = snipedTokens.find(t => t.contractAddress === contractAddress);
    if (token) {
        showToast(`Sold token for a PNL of $${token.pnl.toFixed(2)}.`);
        setSnipedTokens(prevTokens => prevTokens.filter(t => t.contractAddress !== contractAddress));
    }
  }, [snipedTokens]);

  const handleUpdateAnalysis = (contractAddress: string, analysis: any) => {
     setSnipedTokens(prev => prev.map(t => 
        t.contractAddress === contractAddress ? { ...t, analysis, analysisLoading: false } : t
    ));
  };

  const setAnalysisLoading = (contractAddress: string, isLoading: boolean) => {
    setSnipedTokens(prev => prev.map(t => 
        t.contractAddress === contractAddress ? { ...t, analysisLoading: isLoading } : t
    ));
  };


  useEffect(() => {
    // Simulate market price fluctuations
    const interval = setInterval(() => {
      setSnipedTokens(prevTokens => 
        prevTokens.map(token => {
          const changePercent = (Math.random() - 0.49) * 0.1; // Fluctuate up to 10%
          const newCurrentValue = token.currentValue * (1 + changePercent);
          const pnl = newCurrentValue - (token.snipePrice * token.amount);
          return { ...token, currentValue: newCurrentValue, pnl };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen max-h-screen text-white bg-slate-900">
      <div className="w-full lg:w-2/3 flex flex-col border-r border-slate-700">
        <ChatPanel 
            onSnipeToken={handleSnipeToken} 
            isSnipingActive={isSnipingActive}
            onToggleSniping={handleToggleSniping}
        />
      </div>
      <div className="hidden lg:flex lg:w-1/3 flex-col">
        <PortfolioPanel 
            tokens={snipedTokens} 
            onSellToken={handleSellToken}
            onUpdateAnalysis={handleUpdateAnalysis}
            setAnalysisLoading={setAnalysisLoading}
            showToast={showToast}
        />
      </div>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default MainApp;