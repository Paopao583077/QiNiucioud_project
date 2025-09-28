import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../features/chat/store.js';
import SessionMenu from './SessionMenu.jsx';

export default function Sidebar() {
  const navigate = useNavigate();
  const sessions = useChatStore((s) => s.sessions);
  const activeId = useChatStore((s) => s.activeThreadId);
  const setActive = useChatStore((s) => s.setActiveThread);
  const createSession = useChatStore((s) => s.createSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const renameSession = useChatStore((s) => s.renameSession);

  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(() => {
    return (sessions || [])
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .filter((s) => !s.hidden)
      .filter((s) => (s.title || '').toLowerCase().includes(keyword.toLowerCase()));
  }, [sessions, keyword]);

  function onNewSession() {
    createSession({ title: '新会话' });
    navigate('/chat');
  }

  function onRename(id) {
    const t = prompt('重命名会话');
    if (t && t.trim()) renameSession(id, t.trim());
  }

  function onDelete(id) {
    if (confirm('确定删除该会话及其消息吗？此操作不可撤销。')) {
      deleteSession(id);
    }
  }

  return (
    <aside style={{ width: 300, padding: 12, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--sidebar-bg)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="搜索会话" style={{ padding: 6, flex: 1, borderRadius: 6 }} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button onClick={onNewSession} title="新会话">＋</button>
      </div>
      <div>
        <strong>聊天会话</strong>
        <ul style={{ margin: '8px 0', paddingLeft: 0, listStyle: 'none', maxHeight: 360, overflowY: 'auto' }}>
          {filtered.length === 0 && <li style={{ color: '#888' }}>暂无会话</li>}
          {filtered.map((s) => (
            <li key={s.id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: s.id === activeId ? 'var(--chat-select-bg)' : 'transparent', padding: '4px 8px', borderRadius: 6 }}>
                <button
                  onClick={() => { setActive(s.id); navigate('/chat'); }}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <EditableTitle id={s.id} title={s.title || '新会话'} onRename={renameSession} />
                    <small style={{ color: '#888' }}>{formatTime(s.updatedAt)}</small>
                  </div>
                </button>
                <SessionMenu
                  onRename={() => onRename(s.id)}
                  onDelete={() => onDelete(s.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function EditableTitle({ id, title, onRename }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  function commit() {
    const t = (val || '').trim();
    onRename(id, t || '新会话');
    setEditing(false);
  }
  return editing ? (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      style={{ width: '100%' }}
    />
  ) : (
    <span onDoubleClick={() => setEditing(true)} style={{ cursor: 'text' }}>{title}</span>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return '';
  }
}


