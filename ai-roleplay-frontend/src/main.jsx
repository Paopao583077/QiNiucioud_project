// 主题初始化，优先localStorage，否则跟随系统
const savedTheme = localStorage.getItem('themeMode');
if (savedTheme && savedTheme !== 'auto') {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import App from './App.jsx'
import { theme } from './lib/theme.js'
import { useAuthStore } from './features/auth/store.js'

function Root() {
  // 恢复登录态
  useAuthStore.getState().hydrateFromStorage()
  return (
      <App />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
