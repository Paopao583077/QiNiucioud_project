# 🚀 AI角色扮演系统 - 快速启动指南

## 最小改动快速运行方案

基于后端现有接口，已完成前端适配，现在可以快速运行项目。

### 修改内容总结

✅ **已完成的修改**：
1. **LoginPage.jsx** - 适配后端登录响应格式
2. **ChatPage.jsx** - 适配聊天接口参数和响应
3. **CharacterDetailPage.jsx** - 适配角色接口响应格式
4. **ProfilePage.jsx** - 适配用户接口响应格式
5. **chat/store.js** - 修复聊天逻辑适配后端接口

### 启动步骤

#### 1. 启动后端服务
```bash
cd ai-roleplay-backend
mvn spring-boot:run
```
后端将在 `http://localhost:8080` 启动

#### 2. 启动前端服务
```bash
cd ai-roleplay-frontend
npm install
npm run dev
```
前端将在 `http://localhost:3000` 启动

**注意**：前端已配置为直接请求 `http://localhost:8080/api`，无需代理配置

#### 3. 测试核心功能

**用户功能**：
- 访问 `http://localhost:3000/register` 注册新用户
- 访问 `http://localhost:3000/login` 登录用户

**角色功能**：
- 访问 `http://localhost:3000` 查看角色列表
- 点击角色查看详情
- 开始与角色对话

**聊天功能**：
- 发送文本消息
- 查看AI回复
- 查看对话历史

### 接口适配说明

#### 登录接口适配
```javascript
// 前端期望格式
setSession({ 
  user: { id, username, nickname }, 
  token: "jwt_token" 
});

// 后端实际返回
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1,
    "username": "testuser", 
    "nickname": "测试用户",
    "token": "jwt_token"
  }
}
```

#### 聊天接口适配
```javascript
// 前端发送
{
  conversationId: "s_1234567890",
  characterId: 1,
  content: "你好",
  skillId: null
}

// 后端返回
{
  "code": 200,
  "message": "success", 
  "data": {
    "response": "你好！我是苏格拉底..."
  }
}
```

### 注意事项

1. **认证问题**：部分接口使用硬编码 `userId = 1L`，需要先注册用户
2. **会话管理**：前端使用本地存储管理会话，后端需要完善会话创建逻辑
3. **错误处理**：已添加基本的错误处理和重试机制
4. **Mock模式**：如果后端未启动，前端会使用Mock数据进行演示

### 后续优化建议

1. **完善后端认证**：修复硬编码的userId问题
2. **添加会话管理**：实现真正的对话会话创建和管理
3. **完善错误处理**：添加更详细的错误信息和用户提示
4. **添加语音功能**：实现语音识别和合成功能
5. **添加文件上传**：实现头像和文件上传功能

### 故障排除

**常见问题**：
1. **CORS错误**：确保后端配置了正确的CORS设置
2. **认证失败**：检查JWT token是否正确传递
3. **接口404**：确认后端服务已启动且接口路径正确
4. **数据格式错误**：检查请求和响应格式是否匹配

**调试方法**：
1. 打开浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 确认API响应格式是否正确
4. 验证JWT token是否有效

现在您可以启动项目并测试核心功能了！🎉
