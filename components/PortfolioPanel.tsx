import React, { useState } from 'react';
import { Token, TokenAnalysis } from '../types';
import TokenCard from './TokenCard';
import SettingsModal from './SettingsModal';
import { CurrencyDollarIcon, Cog6ToothIcon } from './icons/HeroIcons';


interface PortfolioPanelProps {
  tokens: Token[];
  onSellToken: (contractAddress: string) => void;
  onUpdateAnalysis: (contractAddress: string, analysis: TokenAnalysis) => void;
  setAnalysisLoading: (contractAddress: string, isLoading: boolean) => void;
  showToast: (message: string) => void;
}

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ tokens, onSellToken, onUpdateAnalysis, setAnalysisLoading, showToast }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const totalValue = tokens.reduce((acc, token) => acc + token.currentValue, 0);
  const totalPnl = tokens.reduce((acc, token) => acc + token.pnl, 0);

  const handleSaveSettings = () => {
    showToast("Settings saved successfully.");
    setIsSettingsOpen(false);
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 shadow-md">
        <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-emerald-400 mr-3" />
            <h2 className="text-lg font-bold">Snipe Portfolio</h2>
        </div>
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
            aria-label="Open Settings"
        >
            <Cog6ToothIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total PNL</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <CurrencyDollarIcon className="h-16 w-16" />
            <p className="mt-4 text-center">Your portfolio is empty.</p>
            <p className="text-sm text-center">Sniped tokens will appear here.</p>
          </div>
        ) : (
          tokens.map(token => (
            <TokenCard 
                key={token.contractAddress} 
                token={token} 
                onSell={() => onSellToken(token.contractAddress)}
                onUpdateAnalysis={onUpdateAnalysis}
                setAnalysisLoading={setAnalysisLoading}
            />
          ))
        )}
      </main>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default PortfolioPanel;