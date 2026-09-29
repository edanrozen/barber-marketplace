import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('#root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* import.meta.env.BASE_URL mirrors vite.config.ts's `base` automatically —
        '/' in dev, '/barber-marketplace/' in the GitHub Pages build — so the
        router's basename never has to be kept in sync by hand. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
