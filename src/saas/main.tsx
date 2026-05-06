import React from 'react';
import ReactDOM from 'react-dom/client';
import { SaaSLayout } from './SaaSLayout';
import './SaaS.css';

const App = () => {
  return (
    <React.StrictMode>
      <SaaSLayout />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
