import { useEffect, useRef, useState } from 'react';
import { useRef as useReactRef } from 'react';
import { useChatStore } from '../features/chat/store.js';
import { useAuthStore } from '../features/auth/store.js';

export default function ChatPage() {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const messagesByThread = useChatStore((s) => s.messagesByThread);
  const sessions = useChatStore((s) => s.sessions);
  const defaultCharacter = useChatStore((s) => s.defaultCharacter);
  const messages = messagesByThread[activeThreadId] || [];
  const hydrateChat = useChatStore((s) => s.hydrateFromStorage);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const sendText = useChatStore((s) => s.sendText);
  const sendAudio = useChatStore((s) => s.sendAudio);
  const retryMessage = useChatStore((s) => s.retryMessage);
  
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisQueue, setSynthesisQueue] = useState([]);
  
  // 获取当前会话信息
  const currentSession = sessions.find(s => s.id === activeThreadId);
  const hasCharacter = currentSession?.characterId || currentSession?.characterName;
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false); // 是否有请求进行中
  const pendingMsgIdRef = useReactRef(null); // 记录占位消息id
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordMs, setRecordMs] = useState(0);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const listRef = useRef(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 首次挂载：恢复缓存并拉取历史
  useEffect(() => {
    hydrateChat();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 语音合成功能
  async function synthesizeSpeech(text, voice = 'xiaoyun') {
    try {
      const response = await fetch('http://localhost:8080/api/speech/synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        },
        body: JSON.stringify({ text, voice })
      });
      
      const data = await response.json();
      if (data.code === 200) {
        return data.data.audioUrl;
      }
      return null;
    } catch (error) {
      console.error('语音合成失败:', error);
      return null;
    }
  }

  // 自动为AI回复合成语音
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.type === 'text' && !lastMessage.audioUrl) {
      const audioUrl = synthesizeSpeech(lastMessage.content);
      if (audioUrl) {
        // 更新消息，添加音频URL
        // 这里需要调用store的更新方法
      }
    }
  }, [messages]);

  // 计时器
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setRecordMs((v) => v + 100), 100);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRecordMs(0);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [recording]);

  async function onSendText() {
    if (pending) {
      window.alert('正在回答中，请稍候...');
      return;
    }
    const content = text.trim();
    if (!content) return;
    setText('');
    setPending(true);
    // 先插入占位消息
    const fakeId = 'pending-' + Date.now();
    pendingMsgIdRef.current = fakeId;
    useChatStore.getState().addMessage?.({
      id: fakeId,
      role: 'assistant',
      type: 'text',
      content: '思考中...',
      status: 'pending',
      threadId: activeThreadId,
    });
    try {
      await sendText(content);
      // 请求成功后，自动替换为真实内容（store内逻辑）
    } catch (e) {
      // 失败时移除占位消息
      useChatStore.getState().removeMessage?.(pendingMsgIdRef.current);
      pendingMsgIdRef.current = null;
      // 可以在底部显示错误，也可在消息气泡上有错误状态
      console.error(e);
    } finally {
      setPending(false);
    }
  }

  async function startRecord() {
    if (pending) {
      window.alert('正在回答中，请稍候...');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('当前浏览器不支持录音');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        try {
          await sendAudio(blob);
        } finally {
          // 释放轨道
          stream.getTracks().forEach((t) => t.stop());
        }
      };
      mr.start();
      setRecorder(mr);
      setRecording(true);
    } catch (e) {
      console.error(e);
      alert('无法访问麦克风');
    }
  }

  function stopRecord() {
    if (recorder && recording) {
      recorder.stop();
      setRecording(false);
      setRecorder(null);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendText();
    }
  }

  const mm = Math.floor(recordMs / 60000)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor((recordMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--main-bg)', color: 'var(--main-text)' }}>
  <div ref={listRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            开始你的第一句对话吧～
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} onRetry={() => retryMessage(m.id)} />
        ))}
      </div>
  <div style={{ borderTop: '1px solid var(--border-color)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--card-bg)' }}>
        {recording ? (
          // 录音时显示录音界面和波形图
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 16, color: '#666' }}>
              正在录音 {mm}:{ss}
            </div>
            <button 
              onClick={stopRecord} 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                border: 'none',
                background: '#ff4444',
                color: 'white',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ⏹
            </button>
            <AudioWaveform duration={recordMs} />
          </div>
        ) : (
          // 非录音时显示正常输入界面
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={startRecord} style={{ width: 90, background: 'var(--button-bg)', color: 'var(--button-text)' }} disabled={pending}>
              录音
            </button>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="输入消息，Enter 发送，Shift+Enter 换行"
              rows={2}
              style={{ flex: 1, resize: 'vertical' }}
              disabled={pending}
            />
            <button onClick={onSendText} style={{ width: 90, background: 'var(--button-bg)', color: 'var(--button-text)' }} disabled={pending}>发送</button>
          </div>
        )}
      </div>
    </div>
  );
}

// 录音波形图组件
function AudioWaveform({ duration }) {
  const [bars, setBars] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 生成随机高度模拟音频波形
      const newBars = Array.from({ length: 20 }, () => Math.random() * 40 + 10);
      setBars(newBars);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
      {bars.map((height, index) => (
        <div
          key={index}
          style={{
            width: 3,
            height: height,
            background: '#6C63FF',
            borderRadius: 1.5,
            transition: 'height 0.1s ease'
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, onRetry }) {
  const isUser = msg.role === 'user';
  const align = { display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding: '6px 8px' };
  const bubble = {
    maxWidth: '70%',
    padding: '8px 12px',
    borderRadius: 12,
    background: isUser ? '#6C63FF' : 'var(--card-bg)',

    wordBreak: 'break-word',
  };

  return (
    <div style={align}>
      <div style={bubble}>
        {msg.type === 'text' ? (
          <span>{msg.content}</span>
        ) : (
          <audio src={msg.url} controls preload="metadata" />
        )}
        {msg.status === 'error' && (
          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12 }}>{msg.error || '网络繁忙，点击重试'}</span>
            {onRetry && (
              <button onClick={onRetry} style={{ padding: '2px 6px', fontSize: 12 }}>重试</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


