import axios from 'axios';
import { useAuthStore } from '../features/auth/store.js';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

// 简单的 token 读取函数（后续可改为从 Zustand 读取）
function getAccessToken() {
  // 优先从 store 读取，回退 localStorage
  try {
    const tokenFromStore = useAuthStore.getState().accessToken;
    if (tokenFromStore) return tokenFromStore;
  } catch {}
  try {
    return localStorage.getItem('access_token') || '';
  } catch {
    return '';
  }
}

// 统一错误结构
function normalizeError(error) {
  const status = error?.response?.status || 0;
  const message =
    error?.response?.data?.message || error?.message || 'Network Error';
  const code = error?.response?.data?.code || 'UNKNOWN_ERROR';
  return { status, message, code, raw: error };
}

// 请求拦截：注入鉴权头
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 可在此添加 traceId、客户端信息等
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// 响应拦截：统一处理与错误规范化
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const norm = normalizeError(error);

    // 401 处理（示例：可在此触发登出/刷新令牌流程）
    if (norm.status === 401) {
      try {
        useAuthStore.getState().clearSession();
      } catch {}
      // 触发跳转到登录页（仅限浏览器环境）
      if (typeof window !== 'undefined') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?redirect=${redirect}`);
      }
      return Promise.reject(norm);
    }

    // 可选：对 5xx 进行简单重试（演示钩子，不默认启用）
    // if (norm.status >= 500 && !error.config.__retried) {
    //   error.config.__retried = true;
    //   await new Promise((r) => setTimeout(r, 300));
    //   return api.request(error.config);
    // }

    return Promise.reject(norm);
  }
);

// 便捷请求函数（可统一返回 data）
export async function get(url, config) {
  const res = await api.get(url, config);
  return res.data;
}
export async function post(url, data, config) {
  const res = await api.post(url, data, config);
  return res.data;
}
export async function put(url, data, config) {
  const res = await api.put(url, data, config);
  return res.data;
}
export async function del(url, config) {
  const res = await api.delete(url, config);
  return res.data;
}

// 错误工具：判断是否为已规范化错误
export function isApiError(e) {
  return e && typeof e === 'object' && 'status' in e && 'message' in e;
}

// 构建查询字符串
export function toQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vi) => usp.append(k, String(vi)));
    else usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}


