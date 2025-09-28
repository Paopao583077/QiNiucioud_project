import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store.js';
import { get, put, post } from '../lib/api.js';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      const data = await put(`/users/${user.id}`, {
        nickname: formData.nickname,
        avatar: formData.avatar
      });
      // 适配后端响应格式
      setSession({ 
        user: data.data, 
        token: useAuthStore.getState().accessToken // 使用 accessToken
      });
      setSuccess('信息更新成功');
    } catch (err) {
      setError(err.message || '更新失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8080/api/files/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.code === 200) {
        setFormData(prev => ({ ...prev, avatar: data.data.url }));
        setSuccess('头像上传成功');
      } else {
        setError(data.message || '头像上传失败');
      }
    } catch (err) {
      setError('头像上传失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>个人中心</h2>
      
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        {/* 头像区域 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid #ddd'
          }}>
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="头像" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: 48, color: '#999' }}>👤</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
            id="avatar-upload"
          />
          <label 
            htmlFor="avatar-upload" 
            style={{ 
              padding: '8px 16px', 
              background: '#6C63FF', 
              color: 'white', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {loading ? '上传中...' : '更换头像'}
          </label>
        </div>

        {/* 用户信息表单 */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>用户名</label>
            <input 
              value={user?.username || ''} 
              disabled 
              style={{ 
                width: '100%', 
                padding: 8, 
                border: '1px solid #ddd', 
                borderRadius: 4,
                background: '#f5f5f5'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>昵称</label>
            <input 
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
              placeholder="请输入昵称"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>邮箱</label>
            <input 
              value={formData.email}
              disabled
              style={{ 
                width: '100%', 
                padding: 8, 
                border: '1px solid #ddd', 
                borderRadius: 4,
                background: '#f5f5f5'
              }}
            />
          </div>

          {error && <div style={{ color: 'tomato', fontSize: 14 }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: 14 }}>{success}</div>}
          
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              padding: '10px 20px', 
              background: '#6C63FF', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}


