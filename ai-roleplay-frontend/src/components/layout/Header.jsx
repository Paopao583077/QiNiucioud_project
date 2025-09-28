import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store.js';

export default function Header() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  function onLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
  <header style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', gap: 12, background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ width: 24, height: 24, background: 'var(--primary)', borderRadius: 4, display: 'inline-block' }} />
        <strong>AI Roleplay</strong>
      </div>
      <nav style={{ marginLeft: 16, display: 'flex', gap: 12 }}>
        <Link to="/">首页</Link>
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        {isAuthed ? (
          <>
            <span>你好，{user?.name || '用户'}</span>
            <Link to="/profile">个人中心</Link>
            <Link to="/settings">设置</Link>
            <button onClick={onLogout} style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>退出</button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </div>
    </header>
  );
}


