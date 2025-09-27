import React, { useState } from 'react';
import { Token, TokenAnalysis } from '../types';
import { analyzeTokenContract } from '../services/geminiService';
import { SparklesIcon, XCircleIcon, BeakerIcon } from './icons/HeroIcons';
import Spinner from './shared/Spinner';

interface TokenCardProps {
  token: Token;
  onSell: () => void;
  onUpdateAnalysis: (contractAddress: string, analysis: TokenAnalysis) => void;
  setAnalysisLoading: (contractAddress: string, isLoading: boolean) => void;
}

const RiskBadge: React.FC<{ risk: TokenAnalysis['riskAssessment'] }> = ({ risk }) => {
    const riskColor = {
        'Low': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-orange-500/20 text-orange-300',
        'Very High': 'bg-red-500/20 text-red-300',
    }[risk];
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskColor}`}>{risk} Risk</span>;
};

const TokenCard: React.FC<TokenCardProps> = ({ token, onSell, onUpdateAnalysis, setAnalysisLoading }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = async () => {
    if(token.analysis) {
        setShowAnalysis(!showAnalysis);
        return;
    }
    setAnalysisLoading(token.contractAddress, true);
    setShowAnalysis(true);
    const analysisResult = await analyzeTokenContract(token.contractAddress);
    onUpdateAnalysis(token.contractAddress, analysisResult);
  };
  
  const pnlColor = token.pnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const truncatedAddress = `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}`;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 transition-all hover:border-sky-500/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg text-white" title={token.contractAddress}>{truncatedAddress}</p>
          <p className="text-sm text-slate-400">{token.amount.toFixed(2)} tokens</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handleAnalyze} className="p-2 text-slate-400 hover:text-sky-400" title="Analyze with AI">
                <SparklesIcon className="h-5 w-5"/>
            </button>
            <button onClick={onSell} className="p-2 text-slate-400 hover:text-red-400" title="Sell Token">
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div>
            <p className="text-slate-400">Current Value</p>
            <p className="font-semibold text-white">${token.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
            <p className="text-slate-400">PNL</p>
            <p className={`font-semibold ${pnlColor}`}>{token.pnl >= 0 ? '+' : ''}${token.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {showAnalysis && (
        <div className="mt-4 pt-4 border-t border-slate-700">
            {token.analysisLoading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Spinner />
                    <span>AI is analyzing...</span>
                </div>
            ) : token.analysis ? (
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-md text-sky-400 flex items-center gap-2"><BeakerIcon className="h-5 w-5" /> {token.analysis.projectName}</h4>
                        <RiskBadge risk={token.analysis.riskAssessment} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-300">Use Case:</p>
                        <p className="text-slate-400">{token.analysis.useCase}</p>
                    </div>
                </div>
            ) : null}
        </div>
      )}
    </div>
  );
};

export default TokenCard;
