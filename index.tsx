import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'big-integer'; // Ensure big-integer is loaded for the telegram library
import { Buffer } from 'buffer';
import process from 'process';

// Polyfill Node.js globals for browser environment
window.Buffer = Buffer;
// FIX: Cast window to `any` to allow attaching the process polyfill, resolving a TypeScript error.
(window as any).process = process;


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
