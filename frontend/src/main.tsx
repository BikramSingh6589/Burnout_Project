import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppLoadingScreen } from './components/AppLoadingScreen.tsx'

function RootApp() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading ? (
        <AppLoadingScreen onLoadingComplete={() => setLoading(false)} />
      ) : (
        <App />
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
