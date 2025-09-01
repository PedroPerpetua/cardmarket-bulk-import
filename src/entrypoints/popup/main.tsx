import React from 'react';

import ReactDOM from 'react-dom/client';

import App from './App';

/* eslint-disable import/order */
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
/* eslint-enable import/order */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
