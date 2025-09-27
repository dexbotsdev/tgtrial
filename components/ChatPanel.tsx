import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { HashtagIcon, PlayIcon, PauseIcon, BoltIcon } from './icons/HeroIcons';

interface ChatPanelProps {
  onSnipeToken: (contractAddress: string) => void;
  isSnipingActive: boolean;
  onToggleSniping: () => void;
}

const mockSenders = [
  { name: 'Alpha Caller', avatar: `https://i.pravatar.cc/150?u=alpha` },
  { name: 'Giga Brain', avatar: `https://i.pravatar.cc/150?u=giga` },
  { name: 'Chad Dev', avatar: `https://i.pravatar.cc/150?u=chad` },
  { name: 'Moon Launcher', avatar: `https://i.pravatar.cc/150?u=moon` },
];

const generateRandomMessage = (id: number): Message => {
  const sender = mockSenders[Math.floor(Math.random() * mockSenders.length)];
  const commonMessages = [
    'This is looking bullish.',
    'Just aped in, feeling good about this one.',
    'Dev is based, community is strong.',
    'Check out the whitepaper, solid fundamentals.',
    'To the moon! 🚀',
    'Diamond hands only!',
    'LFG!',
    `I think we're about to see a huge pump.`
  ];
  
  // Occasionally post a contract address
  if (Math.random() < 0.25) { // 25% chance of a contract address message
    const contractAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const contractMessages = [
        `NEW GEM JUST DROPPED! Stealth launch. Contract: ${contractAddress}`,
        `This is the one boys, get in early. CA: ${contractAddress}`,
        `Alpha alert! Ape responsibly: ${contractAddress}`,
    ];
    return {
        id,
        sender: sender.name,
        avatar: sender.avatar,
        text: contractMessages[Math.floor(Math.random() * contractMessages.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    id,
    sender: sender.name,
    avatar: sender.avatar,
    text: commonMessages[Math.floor(Math.random() * commonMessages.length)],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

// Regex to find BSC contract addresses
const contractRegex = /0x[a-fA-F0-9]{40}/;

const ChatPanel: React.FC<ChatPanelProps> = ({ onSnipeToken, isSnipingActive, onToggleSniping }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        const newMessage = generateRandomMessage(prev.length + 1);
        const match = newMessage.text.match(contractRegex);
        if (match && isSnipingActive) {
            onSnipeToken(match[0]);
        }
        return [...prev, newMessage];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSnipingActive, onSnipeToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageText = (text: string) => {
    const parts = text.split(contractRegex);
    const matches = text.match(new RegExp(contractRegex, 'g')) || [];
    
    return (
      <p className="text-slate-200 whitespace-pre-wrap break-words">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {matches[index] && (
              <span className="inline-flex items-center gap-2 bg-slate-900/50 rounded-md p-1 mx-1 align-middle">
                <strong className="text-amber-400 font-mono text-sm">{matches[index]}</strong>
                {!isSnipingActive && (
                  <button
                    onClick={() => onSnipeToken(matches[index])}
                    className="px-2 py-0.5 text-xs font-semibold text-white bg-sky-600 rounded hover:bg-sky-500 transition-colors flex items-center gap-1"
                    title={`Manually snipe ${matches[index].slice(0, 6)}...`}
                  >
                    <BoltIcon className="h-3 w-3" />
                    Snipe
                  </button>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-800">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-full">
            <HashtagIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">BSC Alpha Calls</h2>
            <p className="text-sm text-slate-400">1,337 members, 250 online</p>
          </div>
        </div>
        <button
          onClick={onToggleSniping}
          className={`flex items-center gap-2 px-4 py-2 font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
            ${isSnipingActive ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500' : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500'}`}
        >
          {isSnipingActive ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          <span>{isSnipingActive ? 'Stop Sniping' : 'Start Sniping'}</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const previousSender = index > 0 ? messages[index - 1].sender : null;
          const showSenderInfo = msg.sender !== previousSender;

          return (
            <div key={msg.id} className={`flex gap-3 ${showSenderInfo ? 'mt-4' : 'mt-1'}`}>
              <div className="w-10">
                {showSenderInfo ? (
                  <img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10"></div>
                )}
              </div>
              <div className="flex-1">
                {showSenderInfo && (
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-sky-400">{msg.sender}</p>
                    <p className="text-xs text-slate-500">{msg.timestamp}</p>
                  </div>
                )}
                 {renderMessageText(msg.text)}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </main>
    </div>
  );
};

export default ChatPanel;
