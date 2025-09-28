import { create } from 'zustand';
import { get, post, toQuery } from '../../lib/api.js';
import { isMock } from '../../lib/config.js';

const STORAGE_MSG_KEY = 'chat_messages_cache_v1';
const STORAGE_SESS_KEY = 'chat_sessions_cache_v1';

function loadJson(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const useChatStore = create((set, get) => ({
  activeThreadId: 'default',
  messagesByThread: {},
  sessions: [],
  loading: false,
  defaultCharacter: { id: 1, name: 'AI小智', description: '智能助手，随时为您服务' },

  setActiveThread: (threadId) => {
    const exist = (get().sessions || []).some((s) => s.id === threadId);
    const nextId = exist ? threadId : get().activeThreadId;
    set({ activeThreadId: nextId });
    // 自动加载历史（若当前消息为空）
    const hasMsgs = (get().messagesByThread[nextId] || []).length > 0;
    if (!hasMsgs) {
      // fire and forget
      get().loadHistory(nextId);
    }
  },

  getMessages: (threadId) => {
    const id = threadId || get().activeThreadId;
    return get().messagesByThread[id] || [];
  },

  setMessages: (threadId, messages) => {
    const id = threadId || get().activeThreadId;
    const next = { ...get().messagesByThread, [id]: messages };
    set({ messagesByThread: next });
    saveJson(STORAGE_MSG_KEY, next);
  },

  appendMessage: (threadId, message) => {
    const id = threadId || get().activeThreadId;
    const cur = get().messagesByThread[id] || [];
    const msg = { id: message.id || Date.now() + Math.random(), ...message };
    const next = { ...get().messagesByThread, [id]: [...cur, msg] };
    set({ messagesByThread: next });
    saveJson(STORAGE_MSG_KEY, next);
    return msg.id;
  },

  replaceMessage: (threadId, tempId, newMessage) => {
    const id = threadId || get().activeThreadId;
    const cur = get().messagesByThread[id] || [];
    const nextArr = cur.map((m) => (m.id === tempId ? { ...m, ...newMessage } : m));
    const next = { ...get().messagesByThread, [id]: nextArr };
    set({ messagesByThread: next });
    saveJson(STORAGE_MSG_KEY, next);
  },

  hydrateFromStorage: () => {
    const msgCache = loadJson(STORAGE_MSG_KEY, {});
    const sessCache = loadJson(STORAGE_SESS_KEY, []);
    const active = (sessCache[0] && sessCache[0].id) || 'default';
    set({ messagesByThread: msgCache, sessions: sessCache, activeThreadId: active });
  },

  // 会话管理
  createSession: ({ title, characterId, characterName }) => {
    const id = 's_' + Date.now();
    const session = {
      id,
      // 初始标题可为空，首条用户消息/语音识别后自动设置
      title: title || characterName || '',
      characterId: characterId || null,
      characterName: characterName || null,
      updatedAt: Date.now(),
      hidden: true,
    };
    const next = [session, ...get().sessions];
    set({ sessions: next, activeThreadId: id, messagesByThread: { ...get().messagesByThread, [id]: [] } });
    saveJson(STORAGE_SESS_KEY, next);
    saveJson(STORAGE_MSG_KEY, get().messagesByThread);
    return id;
  },

  deleteSession: (id) => {
    const nextSess = (get().sessions || []).filter((s) => s.id !== id);
    const nextMsg = { ...get().messagesByThread };
    delete nextMsg[id];
    let nextActive = get().activeThreadId;
    if (nextActive === id) nextActive = (nextSess[0] && nextSess[0].id) || 'default';
    set({ sessions: nextSess, messagesByThread: nextMsg, activeThreadId: nextActive });
    saveJson(STORAGE_SESS_KEY, nextSess);
    saveJson(STORAGE_MSG_KEY, nextMsg);
  },

  renameSession: (id, title) => {
    const next = (get().sessions || []).map((s) => (s.id === id ? { ...s, title } : s));
    set({ sessions: next });
    saveJson(STORAGE_SESS_KEY, next);
  },

  loadHistory: async (threadId) => {
    const id = threadId || get().activeThreadId;
    set({ loading: true });
    try {
      let list = [];
      if (isMock) {
        list = [];
      } else {
        const data = await get(`/conversations/${id}/messages`);
        list = Array.isArray(data?.data?.messages) ? data.data.messages : [];
      }
      get().setMessages(id, list);
      // 更新会话时间
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now() } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
    } catch {
      // 忽略网络错误：沿用本地缓存
    } finally {
      set({ loading: false });
    }
  },

  sendText: async (content) => {
    const id = get().activeThreadId;
    const beforeMsgs = get().messagesByThread[id] || [];
    const tempId = get().appendMessage(id, {
      role: 'user',
      type: 'text',
      content,
      ts: Date.now(),
      status: 'sent',
    });
    try {
      let replies = [];
      if (isMock) {
        await new Promise((r) => setTimeout(r, 300));
        replies = [
          { id: 'm_' + Date.now(), role: 'assistant', type: 'text', content: `Echo: ${content}`, ts: Date.now() },
        ];
      } else {
        // 获取当前会话信息
        const currentSession = get().sessions.find(s => s.id === id);
        let characterId = currentSession?.characterId || get().defaultCharacter?.id || 1;
        
        // 确保characterId是数字类型
        if (typeof characterId === 'string') {
          // 如果是字符串，尝试转换为数字，失败则使用默认值
          const numericId = parseInt(characterId);
          characterId = isNaN(numericId) ? 1 : numericId;
        }
        
        const data = await post('/conversations/chat', { 
          conversationId: id, 
          characterId: characterId,
          content,
          skillId: null
        });
        
        // 适配后端响应格式：后端返回的是 {response: "AI回复内容"}
        if (data?.data?.response) {
          replies = [{
            id: 'ai_' + Date.now(),
            role: 'assistant',
            type: 'text',
            content: data.data.response,
            ts: Date.now()
          }];
        } else {
          // 如果后端返回成功但没有response字段，显示默认消息
          replies = [{
            id: 'ai_' + Date.now(),
            role: 'assistant',
            type: 'text',
            content: '抱歉，我暂时无法回应，请稍后再试。',
            ts: Date.now()
          }];
        }
      }
      replies.forEach((m) => get().appendMessage(id, m));
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now(), hidden: false } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
      // 自动标题（仅首条用户消息生效）
      if (beforeMsgs.length === 0) {
        const title = String(content).slice(0, 30);
        get().renameSession(id, title);
      }
    } catch (e) {
      // 仅保留最近一次的网络繁忙可重试回答
      const cur = get().messagesByThread[id] || [];
      const prevErrorIdx = [...cur].reverse().findIndex((m) => m.role === 'assistant' && m.status === 'error');
      if (prevErrorIdx >= 0) {
        const realIdx = cur.length - 1 - prevErrorIdx;
        const prev = cur[realIdx];
        // 置为已失效，避免出现多个可重试项
        get().replaceMessage(id, prev.id, { status: 'sent' });
      }
      get().appendMessage(id, {
        role: 'assistant',
        type: 'text',
        content: '网络繁忙，点击重试',
        ts: Date.now(),
        status: 'error',
        retryType: 'text',
        retryContent: content,
        refUserId: tempId,
      });
      // 即使失败也要显示会话
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now(), hidden: false } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
      throw e;
    }
  },

  sendAudio: async (blob) => {
    const id = get().activeThreadId;
    const beforeMsgs = get().messagesByThread[id] || [];
    const url = URL.createObjectURL(blob);
    const tempId = get().appendMessage(id, {
      role: 'user',
      type: 'audio',
      url,
      ts: Date.now(),
      status: 'sent',
    });
    const fd = new FormData();
    fd.append('audio', blob, 'record.webm');
    fd.append('conversationId', id);
    
    // 获取当前会话的角色ID
    const currentSession = get().sessions.find(s => s.id === id);
    if (currentSession?.characterId) {
      fd.append('characterId', currentSession.characterId);
    }
    try {
      // 语音识别：用于自动标题
      if (beforeMsgs.length === 0) {
        try {
          const asrFd = new FormData();
          asrFd.append('audio', blob, 'record.webm');
          if (isMock) {
            const text = '语音识别结果（mock）';
            const title = String(text).slice(0, 30);
            get().renameSession(id, title);
          } else {
            const asrRes = await fetch('http://localhost:8080/api/speech/recognition', { method: 'POST', body: asrFd, credentials: 'include' });
            if (asrRes.ok) {
              const asrData = await asrRes.json();
              // 适配后端新的响应格式
              const text = asrData?.data?.text || '';
              if (text) {
                const title = String(text).slice(0, 30);
                get().renameSession(id, title);
              }
            }
          }
        } catch {}
      }

      let replies = [];
      if (isMock) {
        await new Promise((r) => setTimeout(r, 300));
        replies = [
          { id: 'm_' + Date.now(), role: 'assistant', type: 'text', content: '已收到你的语音（mock）', ts: Date.now() },
        ];
        } else {
          const res = await fetch('http://localhost:8080/api/conversations/voice', { method: 'POST', body: fd, credentials: 'include' });
          if (!res.ok) throw new Error('VOICE_UPLOAD_FAILED');
          const data = await res.json();
          
          // 适配后端返回的消息格式
          if (data?.data?.messages && Array.isArray(data.data.messages)) {
            replies = data.data.messages.map(msg => ({
              id: msg.id || 'msg_' + Date.now(),
              role: msg.role,
              type: msg.type || 'text',
              content: msg.content,
              ts: msg.createTime ? new Date(msg.createTime).getTime() : Date.now()
            }));
          }
        }
      replies.forEach((m) => get().appendMessage(id, m));
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now(), hidden: false } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
    } catch (e) {
      const cur = get().messagesByThread[id] || [];
      const prevErrorIdx = [...cur].reverse().findIndex((m) => m.role === 'assistant' && m.status === 'error');
      if (prevErrorIdx >= 0) {
        const realIdx = cur.length - 1 - prevErrorIdx;
        const prev = cur[realIdx];
        get().replaceMessage(id, prev.id, { status: 'sent' });
      }
      get().appendMessage(id, {
        role: 'assistant',
        type: 'text',
        content: '网络繁忙，点击重试',
        ts: Date.now(),
        status: 'error',
        retryType: 'audio',
        retryBlob: blob,
        refUserId: tempId,
      });
      // 即使失败也要显示会话
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now(), hidden: false } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
      throw e;
    }
  },

  // 仅重试“最近一次”失败消息：调用方应控制只对最后一条 error 调用
  retryMessage: async (messageId) => {
    const id = get().activeThreadId;
    const msgs = get().messagesByThread[id] || [];
    const target = msgs.find((m) => m.id === messageId);
    if (!target || target.status !== 'error' || target.role !== 'assistant') return;
    // 标记该“繁忙回答”为重试中
    get().replaceMessage(id, messageId, { status: 'sending', content: '重试中...', error: undefined });
    try {
      let replies = [];
      if (target.retryType === 'text') {
        if (isMock) {
          await new Promise((r) => setTimeout(r, 300));
          replies = [{ id: 'm_' + Date.now(), role: 'assistant', type: 'text', content: `Echo: ${target.retryContent}`, ts: Date.now() }];
        } else {
          // 获取当前会话信息
          const currentSession = get().sessions.find(s => s.id === id);
          const data = await post('/conversations/chat', { 
            conversationId: id, 
            characterId: currentSession?.characterId,
            content: target.retryContent,
            skillId: null
          });
          
          // 适配后端响应格式
          if (data?.data?.response) {
            replies = [{
              id: 'ai_' + Date.now(),
              role: 'assistant',
              type: 'text',
              content: data.data.response,
              ts: Date.now()
            }];
          }
        }
      } else if (target.retryType === 'audio' && target.retryBlob) {
        const fd = new FormData();
        fd.append('audio', target.retryBlob, 'record.webm');
        fd.append('conversationId', id);
        if (isMock) {
          await new Promise((r) => setTimeout(r, 300));
          replies = [
            { id: 'm_' + Date.now(), role: 'assistant', type: 'text', content: '已收到你的语音（mock）', ts: Date.now() },
          ];
        } else {
          const res = await fetch('http://localhost:8080/api/conversations/voice', { method: 'POST', body: fd, credentials: 'include' });
          if (!res.ok) throw new Error('VOICE_UPLOAD_FAILED');
          const data = await res.json();
          
          // 适配后端返回的消息格式
          if (data?.data?.messages && Array.isArray(data.data.messages)) {
            replies = data.data.messages.map(msg => ({
              id: msg.id || 'msg_' + Date.now(),
              role: msg.role,
              type: msg.type || 'text',
              content: msg.content,
              ts: msg.createTime ? new Date(msg.createTime).getTime() : Date.now()
            }));
          }
        }
      }
      // 用第一条真实回复覆盖这条"繁忙回答"记录，不新增重复项
      if (replies.length > 0) {
        const first = replies[0];
        get().replaceMessage(id, messageId, { ...first, status: 'sent' });
        replies.slice(1).forEach((m) => get().appendMessage(id, m));
      } else {
        get().replaceMessage(id, messageId, { status: 'sent', content: '' });
      }
      const nextSess = (get().sessions || []).map((s) => (s.id === id ? { ...s, updatedAt: Date.now(), hidden: false } : s));
      set({ sessions: nextSess });
      saveJson(STORAGE_SESS_KEY, nextSess);
    } catch (e) {
      get().replaceMessage(id, messageId, { status: 'error', content: '网络繁忙', error: '网络繁忙，点击重试' });
      throw e;
    }
  },
}));


