import { useEffect, useState } from 'react';

export default function SettingsPage() {
  // 主题切换，默认跟随系统
  function getDefaultTheme() {
    const saved = localStorage.getItem('themeMode');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }
  const [theme, setTheme] = useState(getDefaultTheme);
  // 响应 theme 变化
  useEffect(() => {
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => {
        document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      };
      apply();
      mq.addEventListener('change', apply);
      localStorage.removeItem('themeMode');
      return () => mq.removeEventListener('change', apply);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('themeMode', theme);
    }
  }, [theme]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>系统设置</h2>
      <div style={{ marginBottom: 30 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          主题模式
        </label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value)}
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
        >
          <option value="light">浅色模式</option>
          <option value="dark">深色模式</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>
    </div>
  );
}


