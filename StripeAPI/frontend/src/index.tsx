import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import {app, analytics} from './firebase';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);