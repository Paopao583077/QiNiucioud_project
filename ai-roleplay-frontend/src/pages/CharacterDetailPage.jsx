import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '../lib/api.js';
import { useChatStore } from '../features/chat/store.js';

export default function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const createSession = useChatStore((s) => s.createSession);
  
  const [character, setCharacter] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCharacter();
  }, [id]);

  async function loadCharacter() {
    setLoading(true);
    setError('');
    try {
      const [characterRes, skillsRes] = await Promise.all([
        get(`/characters/${id}`),
        get(`/characters/${id}/skills`)
      ]);
      
      // 适配后端响应格式
      setCharacter(characterRes.data);
      setSkills(skillsRes.data || []); // 后端直接返回技能数组，不需要 .skills
    } catch (err) {
      setError(err.message || '加载角色信息失败');
    } finally {
      setLoading(false);
    }
  }

  function handleStartChat() {
    const sessionId = createSession({ 
      characterId: character.id, 
      characterName: character.name, 
      title: `与 ${character.name}` 
    });
    navigate('/chat');
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'tomato' }}>{error}</div>
        <button onClick={() => navigate('/characters')} style={{ marginTop: 16, padding: '8px 16px' }}>
          返回角色列表
        </button>
      </div>
    );
  }

  if (!character) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div>角色不存在</div>
        <button onClick={() => navigate('/characters')} style={{ marginTop: 16, padding: '8px 16px' }}>
          返回角色列表
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        {/* 角色头像 */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ 
            width: 120, 
            height: 120, 
            borderRadius: 8, 
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid #ddd'
          }}>
            {character.avatar ? (
              <img 
                src={character.avatar} 
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: 48, color: '#999' }}>👤</div>
            )}
          </div>
        </div>

        {/* 角色基本信息 */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 28 }}>{character.name}</h1>
          <div style={{ color: '#666', marginBottom: 12 }}>
            {character.categoryName} • 热度 {character.popularity}%
          </div>
          <p style={{ margin: '0 0 16px 0', lineHeight: 1.6, color: '#555' }}>
            {character.description}
          </p>
          <button 
            onClick={handleStartChat}
            style={{
              padding: '12px 24px',
              background: '#6C63FF',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            开始对话
          </button>
        </div>
      </div>

      {/* 角色背景 */}
      {character.background && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>角色背景</h3>
          <div style={{ 
            padding: 16, 
            background: '#f8f9fa', 
            borderRadius: 8, 
            lineHeight: 1.6,
            color: '#555'
          }}>
            {character.background}
          </div>
        </div>
      )}

      {/* 角色性格 */}
      {character.personality && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>性格特点</h3>
          <div style={{ 
            padding: 16, 
            background: '#f8f9fa', 
            borderRadius: 8, 
            lineHeight: 1.6,
            color: '#555'
          }}>
            {character.personality}
          </div>
        </div>
      )}

      {/* 角色技能 */}
      {skills.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 16px 0' }}>特殊技能</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ 
                padding: 16, 
                border: '1px solid #e0e0e0', 
                borderRadius: 8,
                background: 'white'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>
                  {skill.name}
                </div>
                <div style={{ color: '#666', marginBottom: 8, lineHeight: 1.5 }}>
                  {skill.description}
                </div>
                {skill.example && (
                  <div style={{ 
                    padding: 8, 
                    background: '#f0f8ff', 
                    borderRadius: 4, 
                    fontSize: 14,
                    color: '#0066cc',
                    fontStyle: 'italic'
                  }}>
                    💡 示例：{skill.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
