import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initSync } from './services/syncService';
import './index.css';

// Pull shared state before first render so the app reads the latest data.
initSync().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
