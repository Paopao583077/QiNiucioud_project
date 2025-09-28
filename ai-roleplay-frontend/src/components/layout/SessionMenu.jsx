import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function SessionMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    // 定位菜单
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      // 默认右下对齐，超出视口自动调整
      const menuWidth = 140;
      const menuHeight = 90;
      let left = rect.right;
      let top = rect.bottom + 4;
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 8;
      }
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }
      setMenuPos({ top, left });
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'transparent',
          color: 'var(--button-text)',
          border: 'none',
          borderRadius: 6,
          width: 28,
          height: 28,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
        title="会话设置"
      >
        ⋮
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            minWidth: 140,
            background: 'var(--card-bg)',
            color: 'var(--main-text)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            boxShadow: '0 4px 16px 0 rgba(60,60,100,0.10)',
            zIndex: 9999,
            padding: '6px 0',
            overflow: 'visible',
            maxWidth: 'calc(100vw - 24px)',
          }}
        >
          <button
            onClick={() => { setOpen(false); onRename(); }}
            style={{
              width: '100%',
              background: 'none',
              color: 'inherit',
              border: 'none',
              textAlign: 'left',
              padding: '8px 16px',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >重命名</button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            style={{
              width: '100%',
              background: 'none',
              color: 'tomato',
              border: 'none',
              textAlign: 'left',
              padding: '8px 16px',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >删除</button>
        </div>,
        document.body
      )}
    </div>
  );
}
