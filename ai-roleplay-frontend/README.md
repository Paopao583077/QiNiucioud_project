## AI Roleplay（沉浸式 AI 角色扮演语音聊天）

一个基于 React 18 + Vite 的前端项目，提供与虚构/历史人物进行语音与文本对话的沉浸式体验。

### 技术栈
- **核心框架**: React 18
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **HTTP**: Axios
- **UI**: Chakra UI
- **音频**: Web Audio API + react-media-recorder
- **代码规范**: ESLint + Prettier
- **测试**: Jest + React Testing Library（待接入）

### 本地开发
1. 安装依赖
```bash
npm i
```
2. 启动开发服务
```bash
npm run dev
```
3. 访问开发地址（Vite 输出的本地端口）

### 脚本
- `npm run dev`：开发模式
- `npm run build`：构建生产包
- `npm run preview`：本地预览构建产物
- `npm run lint`：运行 ESLint

### P0 目标与范围
- **用户认证系统**
  - 用户注册/登录（UI + 表单校验 + API 对接）
- **AI 角色展示**
  - 预设角色展示页面（网格/卡片）
  - 角色搜索（关键字/分类筛选）
- **语音聊天**
  - 语音录制/发送/播放
  - 文本聊天模式

### 近期计划
  接口联调

### 代码规范
- 遵循 ESLint 默认规则与 React Hooks 规则
- 统一使用函数组件与 Hooks
- 命名清晰、避免缩写；控制分支深度；优先早返回


