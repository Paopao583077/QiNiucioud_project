import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post, isApiError } from '../lib/api.js';
import { useAuthStore } from '../features/auth/store.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await post('/users/register', { username, email, password, nickname });
      setSession({ user: data.data, token: data.data.accessToken });
      navigate('/', { replace: true });
    } catch (err) {
      if (isApiError(err)) setError(err.message || '注册失败');
      else setError('网络异常');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div style={{ maxWidth: 360, margin: '40px auto' }}>
      <button onClick={() => navigate('/')} style={{ position: 'absolute', left: 24, top: 24, background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer' }}>← 返回首页</button>
      <h2>注册</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input placeholder="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div style={{ color: 'tomato' }}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? '注册中...' : '注册'}</button>
      </form>
      <p style={{ marginTop: 12 }}>
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </div>
  )
}
