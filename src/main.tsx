import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeEnvironment } from '@/lib/env';

// Initialize environment validation on app startup
initializeEnvironment();

createRoot(document.getElementById("root")!).render(<App />);
