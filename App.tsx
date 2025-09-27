import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MainApp from './components/MainApp';
import { checkSessionAndConnect } from './services/telegramService';
import Spinner from './components/shared/Spinner';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await checkSessionAndConnect();
        setIsAuthenticated(loggedIn);
      } catch (e) {
        console.error("Auth check failed", e);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  if (isAuthLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 font-sans text-white">
            <Spinner />
            <p className="mt-2 text-slate-400">Connecting to Telegram...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {isAuthenticated ? <MainApp /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default App;