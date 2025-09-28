import { useMemo, useState } from 'react';
import CharacterCard from '../components/characters/CharacterCard';
import CharacterDetailModal from '../components/characters/CharacterDetailModal';
import { get, toQuery } from '../lib/api.js';
import { useChatStore } from '../features/chat/store.js';
import { useNavigate } from 'react-router-dom';
import logo_AI from '../assets/icons/ai小智.png';
import logo_Socrates from '../assets/icons/Socrates.png';
import logo_HarryPotter from '../assets/icons/HarryPotter.png';
import logo_Shakespeare from '../assets/icons/Shakespeare.png';

const PRESETS = [
  {
    id: 2, // 苏格拉底在数据库中的ID
    name: '苏格拉底',
    description: '古希腊哲学家，擅长苏格拉底式提问与启发式对谈。',
    avatar: logo_Socrates,
  },
  {
    id: 3, // 哈利·波特在数据库中的ID
    name: '哈利·波特',
    description: '魔法世界的见证者，与朋友并肩对抗黑魔法。',
    avatar: logo_HarryPotter,
  },
  {
    id: 4, // 莎士比亚在数据库中的ID
    name: '莎士比亚',
    description: '英国文豪，戏剧与诗歌大师，语言华美且富戏剧张力。',
    avatar: logo_Shakespeare,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const createSession = useChatStore((s) => s.createSession);

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  async function search() {
    setLoading(true);
    try {
      const data = await get(`/characters/search?keyword=${encodeURIComponent(q)}`);
      setList(Array.isArray(data?.data?.items) ? data.data.items : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  function onStartChatFromPreset(p) {
    const id = createSession({ characterId: p.id, characterName: p.name, title: `与 ${p.name}` });
    navigate('/chat');
  }

  function onStartChatFromResult(c) {
    const id = createSession({ characterId: c.id, characterName: c.name, title: `与 ${c.name}` });
    navigate('/chat');
  }

  function onStartChatWithDefault() {
    const defaultCharacter = { id: 1, name: 'AI小智', description: '智能助手，随时为您服务' }; // AI小智在数据库中的ID是1
    const id = createSession({ characterId: defaultCharacter.id, characterName: defaultCharacter.name, title: `与 ${defaultCharacter.name}` });
    navigate('/chat');
  }

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--main-bg)', color: 'var(--main-text)', minHeight: '100vh' }}>
      <h2>欢迎来到 AI Roleplay</h2>
      <section>
        <h3>搜索角色并开始聊天</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索角色" style={{ padding: 8, flex: 1 }} />
          <button onClick={search} disabled={loading}>{loading ? '搜索中...' : '搜索'}</button>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {(!loading && list.length === 0 && q) ? <div style={{ color: '#888' }}>未找到结果</div> : null}
          {list.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              onClick={() => setSelectedCharacter(c)}
              onChat={() => onStartChatFromResult(c)}
              chatLabel="开始聊天"
            />
          ))}
        </div>
      </section>
      <section>
        <h3>预设角色</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {/* 默认AI小智卡片 */}
          <CharacterCard
            character={{ id: 1, name: 'AI小智', description: '智能助手，随时为您服务', avatar: logo_AI }}
            onClick={() => setSelectedCharacter({ id: 1, name: 'AI小智', description: '智能助手，随时为您服务', avatar: logo_AI })}
            onChat={onStartChatWithDefault}
            chatLabel="与AI小智聊天"
          />
          {PRESETS.map((p) => (
            <CharacterCard
              key={p.id}
              character={{ ...p }}
              onClick={() => setSelectedCharacter({ ...p })}
              onChat={() => onStartChatFromPreset(p)}
              chatLabel={`与${p.name}聊天`}
            />
          ))}
        </div>
      </section>
      {/* 角色详情弹窗 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onStartChat={() => {
            if (selectedCharacter.id === 1) onStartChatWithDefault(); // AI小智的ID是1
            else if (selectedCharacter.id === 2 || selectedCharacter.id === 3 || selectedCharacter.id === 4) onStartChatFromPreset(selectedCharacter); // 预设角色
            else onStartChatFromResult(selectedCharacter);
          }}
        />
      )}
    </div>
  );
}


