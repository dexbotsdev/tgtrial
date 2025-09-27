import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { TelegramIcon, KeyIcon, PhoneIcon, LockClosedIcon, ArrowRightIcon, InformationCircleIcon } from './icons/HeroIcons';
import Spinner from './shared/Spinner';
import { startLogin } from '../services/telegramService';
import { Api } from 'telegram';

interface LoginProps {
  onLoginSuccess: () => void;
}

type LoginStep = 'credentials' | 'phone' | 'code' | 'password';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [password, setPassword] = useState('');
  
  const phoneCodeResolve = useRef<((value: string) => void) | null>(null);
  const passwordResolve = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    // Pre-fill credentials from local storage for convenience
    const savedApiId = localStorage.getItem('telegramApiId');
    const savedApiHash = localStorage.getItem('telegramApiHash');
    if (savedApiId) setApiId(savedApiId);
    if (savedApiHash) setApiHash(savedApiHash);
  }, []);


  const handleCredentialSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!apiId || !apiHash) {
      setError("API ID and API Hash are required.");
      return;
    }
    // Save to localStorage to enable session persistence on app reload
    localStorage.setItem('telegramApiId', apiId);
    localStorage.setItem('telegramApiHash', apiHash);
    
    setError(null);
    setStep('phone');
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await startLogin({
        apiId: parseInt(apiId, 10),
        apiHash,
        phoneNumber: () => {
          setStep('phone');
          return Promise.resolve(phoneNumber);
        },
        phoneCode: () => {
          setStep('code');
          return new Promise<string>((resolve) => {
            phoneCodeResolve.current = resolve;
          });
        },
        password: () => {
          setStep('password');
          return new Promise<string>((resolve) => {
            passwordResolve.current = resolve;
          });
        },
        onError: (err: any) => {
          console.log(err)
            setError(err.message || "An unknown error occurred.");
            setIsLoading(false);
            setStep('phone'); // Go back to phone step on error
        }
      });
      
      // If startLogin completes without error, it means we are logged in.
      setIsLoading(false);
      onLoginSuccess();

    } catch (err: any) {
        // This catch is for initial setup errors before the callbacks are used.
        setError(err.message || 'Failed to initiate login.');
        setIsLoading(false);
    }
  };

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phoneCodeResolve.current) {
      phoneCodeResolve.current(phoneCode);
      setIsLoading(true);
      setError(null);
    }
  };
  
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordResolve.current) {
      passwordResolve.current(password);
      setIsLoading(true);
      setError(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'credentials':
        return (
          <form onSubmit={handleCredentialSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiId" className="block text-sm font-medium text-slate-300">API ID</label>
              <div className="mt-1 relative">
                <KeyIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="apiId" type="text" value={apiId} onChange={(e) => setApiId(e.target.value)} placeholder="Your API ID" required className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
             <div>
              <label htmlFor="apiHash" className="block text-sm font-medium text-slate-300">API Hash</label>
              <div className="mt-1 relative">
                 <KeyIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="apiHash" type="text" value={apiHash} onChange={(e) => setApiHash(e.target.value)} placeholder="Your API Hash" required className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
              Next <ArrowRightIcon className="h-5 w-5"/>
            </button>
            <div className="flex items-start gap-2 text-xs text-slate-500 p-2 bg-slate-800/50 rounded-md">
                <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5"/>
                <span>You can get your API credentials from my.telegram.org.</span>
            </div>
          </form>
        );
      case 'phone':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone Number</label>
              <div className="mt-1 relative">
                <PhoneIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="phone" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1234567890" required className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2">
              {isLoading ? <><Spinner />Authenticating...</> : 'Send Code'}
            </button>
          </form>
        );
      case 'code':
        return (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300">Verification Code</label>
              <div className="mt-1 relative">
                <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="code" type="text" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="12345" required className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2">
               {isLoading ? <><Spinner />Verifying...</> : 'Verify Code'}
            </button>
          </form>
        );
       case 'password':
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">2FA Password</label>
              <div className="mt-1 relative">
                <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your two-factor password" required className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2">
              {isLoading ? <><Spinner />Logging In...</> : 'Login'}
            </button>
          </form>
        );
      default:
        return null;
    }
  };
  
  const getTitle = () => {
    switch (step) {
        case 'credentials': return 'Enter API Credentials';
        case 'phone': return 'Login to Telegram';
        case 'code': return 'Enter Verification Code';
        case 'password': return 'Enter 2FA Password';
        default: return 'Login';
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 space-y-8 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl shadow-sky-900/20 border border-slate-700">
        <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-sky-500 rounded-full mb-2">
                <TelegramIcon className="h-8 w-8 text-white" />
            </div>
          <h1 className="text-2xl font-bold text-center text-white">{getTitle()}</h1>
        </div>
        
        {error && (
            <div className="p-3 text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-md">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="transition-all">
          {renderStep()}
        </div>
        <style>{`.btn-primary { padding: 0.75rem 1rem; font-weight: 600; color: white; background-color: #0284c7; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #0369a1; } .btn-primary:disabled { background-color: #075985; cursor: not-allowed; }`}</style>
      </div>
    </div>
  );
};

export default Login;