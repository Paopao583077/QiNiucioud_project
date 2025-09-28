import React from 'react';

export default function CharacterDetailModal({ character, onClose, onStartChat }) {
  if (!character) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: 32,
        minWidth: 320,
        maxWidth: 400,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 12,
          right: 16,
          background: 'none',
          border: 'none',
          fontSize: 24,
          color: '#888',
          cursor: 'pointer',
        }}>×</button>
        <img src={character.avatar} alt={character.name} style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 16, boxShadow: '0 2px 8px var(--border-color)' }} />
        <h2 style={{ margin: '8px 0 4px 0', color: 'var(--primary)' }}>{character.name}</h2>
        <p style={{ color: 'var(--main-text)', fontSize: 15, textAlign: 'center', marginBottom: 12, opacity: 0.8 }}>{character.description}</p>
        <button
          onClick={onStartChat}
          style={{ marginTop: 12, background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: 6, padding: '10px 0', width: '100%', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >与TA聊天</button>
      </div>
    </div>
  );
}