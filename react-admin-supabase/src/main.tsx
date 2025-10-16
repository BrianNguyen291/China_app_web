import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/fullscreen.css'
import App from './App.tsx'

console.log('🌟 [MAIN] Application starting...');
console.log('🌍 [MAIN] Environment:', {
  nodeEnv: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [MAIN] Root element not found!');
  throw new Error('Root element not found');
}

console.log('🎯 [MAIN] Root element found, creating React root...');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log('✅ [MAIN] React app rendered successfully');
