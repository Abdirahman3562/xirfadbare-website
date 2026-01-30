import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { DataProvider, useData } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import GlobalLoader from './components/GlobalLoader'

// App wrapper that handles loading state
const AppWithData = () => {
  const { loading } = useData();

  if (loading) {
    return <GlobalLoader />;
  }

  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <ThemeProvider>
        <AppWithData />
      </ThemeProvider>
    </DataProvider>
  </StrictMode>,
)
