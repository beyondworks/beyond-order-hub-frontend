import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App'; // App 컴포넌트를 src 폴더에서 가져옵니다.

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}