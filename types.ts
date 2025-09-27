import React from 'react';

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface Token {
  contractAddress: string;
  snipePrice: number;
  amount: number;
  currentValue: number;
  pnl: number;
  analysis?: TokenAnalysis | null;
  analysisLoading: boolean;
}

export interface TokenAnalysis {
  projectName: string;
  useCase: string;
  riskAssessment: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface SniperSettings {
  privateKey: string;
  rpcUrl: string;
  routerAddress: string;
}