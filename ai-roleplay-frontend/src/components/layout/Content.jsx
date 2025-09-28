import React from 'react';

export default function Content({ children }) {
  return (
    <section
      style={{
        flex: 1,
        padding: 16,
        minWidth: 0,
        background: 'var(--main-bg)',
        color: 'var(--main-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </section>
  );
}
