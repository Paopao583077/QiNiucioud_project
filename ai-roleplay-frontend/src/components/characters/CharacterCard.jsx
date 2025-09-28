import React from 'react';

export default function CharacterCard({ character, onClick, onChat, chatLabel = '开始聊天' }) {
  return (
    <div
      className="character-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: 'none',
        borderRadius: 16,
        padding: 20,
        margin: 10,
        display: 'inline-block',
        width: 200,
        textAlign: 'center',
        background: 'var(--card-bg)',
        boxShadow: 'var(--card-shadow)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 12px 36px 0 rgba(108,99,255,0.18)';
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(108,99,255,0.10)';
        e.currentTarget.style.transform = 'none';
      }}
    >
  <img src={character.avatar} alt={character.name} style={{ width: 88, height: 88, borderRadius: '50%', marginBottom: 14, boxShadow: '0 4px 16px var(--border-color)', border: '3px solid var(--card-bg)', background: 'var(--card-bg)' }} />
  <h3 style={{ margin: '12px 0 6px 0', fontWeight: 700, color: 'var(--primary)', fontSize: 20 }}>{character.name}</h3>
  <p style={{ color: 'var(--main-text)', fontSize: 15, minHeight: 32, marginBottom: 0, opacity: 0.8 }}>{character.description?.slice(0, 28) || ''}</p>
      {onChat && (
        <button
          style={{
            marginTop: 16,
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            width: '100%',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: '0 2px 8px var(--border-color)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          onClick={e => { e.stopPropagation(); onChat(); }}
        >{chatLabel}</button>
      )}
    </div>
  );
}