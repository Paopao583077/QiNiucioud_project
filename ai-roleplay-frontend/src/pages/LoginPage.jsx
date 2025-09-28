import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { post, isApiError } from '../lib/api.js';
import { useAuthStore } from '../features/auth/store.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const setSession = useAuthStore((s) => s.setSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await post('/users/login', { username, password });
      
      // 适配后端实际返回的格式
      setSession({ 
        user: {
          id: data.data.userId,
          username: data.data.username,
          nickname: data.data.nickname
        }, 
        token: data.data.token  // 后端返回的是 token，不是 accessToken
      });
      navigate(redirect, { replace: true });
    } catch (err) {
      if (isApiError(err)) setError(err.message || '登录失败');
      else setError('网络异常');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto' }}>
      <h2>登录</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          placeholder="用户名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: 'tomato' }}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? '登录中...' : '登录'}</button>
      </form>
      <button onClick={() => navigate('/')}
        style={{ position: 'absolute', left: 24, top: 24, background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer' }}>
        ← 返回首页
      </button>
      <p style={{ marginTop: 12 }}>
        还没有账号？<Link to="/register">去注册</Link>
      </p>
    </div>
  );
}


