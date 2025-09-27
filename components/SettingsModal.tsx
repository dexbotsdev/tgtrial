import React, { useState, useEffect, FormEvent } from 'react';
import { SniperSettings } from '../types';
import { Cog6ToothIcon, XCircleIcon } from './icons/HeroIcons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState<SniperSettings>({
    privateKey: '',
    rpcUrl: '',
    routerAddress: '',
  });

  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('sniperSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sniperSettings', JSON.stringify(settings));
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="settings-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md p-6 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl shadow-sky-900/20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <h2 id="settings-modal-title" className="text-xl font-bold flex items-center gap-2">
                <Cog6ToothIcon className="h-6 w-6 text-sky-400"/>
                Sniper Settings
            </h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Close modal">
                <XCircleIcon className="h-7 w-7"/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="privateKey" className="block text-sm font-medium text-slate-300">
              Wallet Private Key
            </label>
            <input
              type="password"
              id="privateKey"
              name="privateKey"
              value={settings.privateKey}
              onChange={handleChange}
              placeholder="0x..."
              className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="rpcUrl" className="block text-sm font-medium text-slate-300">
              RPC URL
            </label>
            <input
              type="url"
              id="rpcUrl"
              name="rpcUrl"
              value={settings.rpcUrl}
              onChange={handleChange}
              placeholder="https://bsc-dataseed.binance.org/"
              className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="routerAddress" className="block text-sm font-medium text-slate-300">
              DEX Router Address
            </label>
            <input
              type="text"
              id="routerAddress"
              name="routerAddress"
              value={settings.routerAddress}
              onChange={handleChange}
              placeholder="0x10ED43C718714eb63d5aA57B78B54704E256024E"
              className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;