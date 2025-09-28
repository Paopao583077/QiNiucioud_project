export const isMock = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.VITE_USE_MOCK !== 'undefined') {
      return String(import.meta.env.VITE_USE_MOCK).toLowerCase() === 'true';
    }
  } catch {}
  try {
    // 运行时切换支持：在控制台设置 window.__USE_MOCK__ = true
    return Boolean(window.__USE_MOCK__);
  } catch {}
  return false;
})();


