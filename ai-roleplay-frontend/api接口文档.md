# AI角色扮演系统 - 完整API接口文档

## 接口概览

### 基础信息
- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **响应格式**: 统一JSON格式
- **认证方式**: Bearer Token (JWT)

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误响应格式
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
```

## 1. 用户管理 (/users)

### 1.1 用户注册
- **POST** `/users/register`
- **请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "123456",
  "nickname": "测试用户"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 1.2 用户登录
- **POST** `/users/login`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "nickname": "测试用户",
      "avatar": null
    }
  }
}
```

### 1.3 获取用户信息
- **GET** `/users/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": "/files/avatar/xxx.jpg",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 1.4 更新用户信息
- **PUT** `/users/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "/files/avatar/xxx.jpg"
}
```

### 1.5 刷新Token
- **POST** `/users/refresh`
- **请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.6 用户登出
- **POST** `/users/logout`
- **Headers**: `Authorization: Bearer {token}`

## 2. 角色管理 (/characters)

### 2.1 搜索角色
- **GET** `/characters/search?keyword=苏格拉底`
- **参数**:
  - `keyword`: 搜索关键词
  - `category`: 分类筛选 (可选)
  - （注：当前接口不再分页，返回所有匹配结果，前端可做滚动加载）
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "苏格拉底",
        "description": "古希腊哲学家，擅长苏格拉底式提问",
        "category": "history",
        "categoryName": "历史人物",
        "avatar": "/files/characters/socrates.jpg",
        "skills": [
          {
            "id": 1,
            "name": "苏格拉底式提问",
            "description": "通过提问引导思考"
          }
        ],
        "popularity": 95,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
  }
}
```

### 2.2 获取角色详情
- **GET** `/characters/{id}`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "苏格拉底",
    "description": "古希腊哲学家，擅长苏格拉底式提问",
    "category": "history",
    "categoryName": "历史人物",
    "avatar": "/files/characters/socrates.jpg",
    "background": "苏格拉底是古希腊哲学家...",
    "personality": "智慧、耐心、善于引导",
    "skills": [
      {
        "id": 1,
        "name": "苏格拉底式提问",
        "description": "通过提问引导思考",
        "example": "你认为什么是正义？"
      }
    ],
    "popularity": 95,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2.3 获取角色技能
- **GET** `/characters/{id}/skills`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "苏格拉底式提问",
        "description": "通过提问引导思考",
        "example": "你认为什么是正义？"
      }
    ]
  }
}
```

### 2.4 获取所有分类
- **GET** `/characters/categories`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "categories": [
      {
        "id": "history",
        "name": "历史人物",
        "description": "历史上的著名人物",
        "count": 25
      },
      {
        "id": "literature",
        "name": "文学艺术",
        "description": "文学和艺术领域的人物",
        "count": 18
      }
    ]
  }
}
```

### 2.5 根据分类获取角色
- **GET** `/characters/category/{category}`
- **参数**:
  - `category`: 分类ID

### 2.6 获取热门角色
- **GET** `/characters/popular?limit=10`
- **参数**:
  - `limit`: 数量限制 (默认10)

### 2.7 获取推荐角色
- **GET** `/characters/recommended`
- **Headers**: `Authorization: Bearer {token}` (可选)

## 3. 对话管理 (/conversations)

### 3.1 创建新对话
- **POST** `/conversations`
- **Headers**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "characterId": 1,
  "title": "与苏格拉底的对话"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "对话创建成功",
  "data": {
    "id": "conv_1234567890",
    "title": "与苏格拉底的对话",
    "characterId": 1,
    "characterName": "苏格拉底",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 发送消息
- **POST** `/conversations/chat`
- **Headers**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "conversationId": "conv_1234567890",
  "content": "你好，苏格拉底",
  "skillId": 1
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "消息发送成功",
  "data": {
    "messages": [
      {
        "id": "msg_1234567890",
        "role": "user",
        "type": "text",
        "content": "你好，苏格拉底",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "id": "msg_1234567891",
        "role": "assistant",
        "type": "text",
        "content": "你好！我是苏格拉底。今天你想探讨什么问题呢？",
        "timestamp": "2024-01-01T00:00:01Z"
      }
    ]
  }
}
```

### 3.3 获取用户对话列表
- **GET** `/conversations?page=1&size=20&keyword=苏格拉底`
- **Headers**: `Authorization: Bearer {token}`
- **参数**:
  - `page`: 页码 (默认1)
  - `size`: 每页数量 (默认20)
  - `keyword`: 搜索关键词 (可选)
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "conversations": [
      {
        "id": "conv_1234567890",
        "title": "与苏格拉底的对话",
        "characterId": 1,
        "characterName": "苏格拉底",
        "lastMessage": "你好！我是苏格拉底。今天你想探讨什么问题呢？",
        "messageCount": 5,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:05:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  }
}
```

### 3.4 获取对话详情
- **GET** `/conversations/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "conv_1234567890",
    "title": "与苏格拉底的对话",
    "characterId": 1,
    "characterName": "苏格拉底",
    "userId": 1,
    "messageCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:05:00Z"
  }
}
```

### 3.5 获取对话消息
- **GET** `/conversations/{id}/messages?page=1&size=50`
- **Headers**: `Authorization: Bearer {token}`
- **参数**:
  - `page`: 页码 (默认1)
  - `size`: 每页数量 (默认50)
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "messages": [
      {
        "id": "msg_1234567890",
        "role": "user",
        "type": "text",
        "content": "你好，苏格拉底",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "id": "msg_1234567891",
        "role": "assistant",
        "type": "text",
        "content": "你好！我是苏格拉底。今天你想探讨什么问题呢？",
        "timestamp": "2024-01-01T00:00:01Z"
      }
    ],
    "total": 2,
    "page": 1,
    "size": 50
  }
}
```

### 3.6 删除对话
- **DELETE** `/conversations/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "code": 200,
  "message": "对话删除成功",
  "data": null
}
```

### 3.7 更新对话标题
- **PUT** `/conversations/{id}/title`
- **Headers**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "title": "新标题"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "标题更新成功",
  "data": {
    "id": "conv_1234567890",
    "title": "新标题"
  }
}
```

### 3.8 语音消息发送
- **POST** `/conversations/voice`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `audio`: 音频文件
  - `conversationId`: 对话ID
- **响应**:
```json
{
  "code": 200,
  "message": "语音消息发送成功",
  "data": {
    "messages": [
      {
        "id": "msg_1234567890",
        "role": "user",
        "type": "audio",
        "content": "语音识别结果",
        "audioUrl": "/files/audio/xxx.wav",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "id": "msg_1234567891",
        "role": "assistant",
        "type": "text",
        "content": "我听到了你的语音消息...",
        "timestamp": "2024-01-01T00:00:01Z"
      }
    ]
  }
}
```

## 4. 语音服务 (/speech)

### 4.1 语音识别
- **POST** `/speech/recognition`
- **Content-Type**: `multipart/form-data`
- **参数**: 
  - `audio`: 音频文件
- **响应**:
```json
{
  "code": 200,
  "message": "识别成功",
  "data": {
    "text": "你好，我想和你聊天",
    "confidence": 0.95,
    "language": "zh-CN"
  }
}
```

### 4.2 语音合成
- **POST** `/speech/synthesis`
- **请求体**:
```json
{
  "text": "你好！我是苏格拉底。今天你想探讨什么问题呢？",
  "voice": "xiaoyun",
  "speed": 1.0,
  "pitch": 1.0
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "合成成功",
  "data": {
    "audioUrl": "/files/speech/xxx.wav",
    "duration": 3.5
  }
}
```

### 4.3 获取支持的语音列表
- **GET** `/speech/voices`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "voices": [
      {
        "id": "xiaoyun",
        "name": "小云",
        "gender": "female",
        "language": "zh-CN",
        "description": "温柔女声"
      },
      {
        "id": "xiaogang",
        "name": "小刚",
        "gender": "male",
        "language": "zh-CN",
        "description": "沉稳男声"
      }
    ]
  }
}
```

### 4.4 音频格式转换
- **POST** `/speech/convert`
- **Content-Type**: `multipart/form-data`
- **参数**: 
  - `audio`: 音频文件
  - `targetFormat`: 目标格式 (wav, mp3, ogg)
- **响应**:
```json
{
  "code": 200,
  "message": "转换成功",
  "data": {
    "audioUrl": "/files/converted/xxx.wav",
    "format": "wav",
    "duration": 3.5,
    "size": 1024000
  }
}
```

## 5. 文件管理 (/files)

### 5.1 上传头像
- **POST** `/files/avatar`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `multipart/form-data`
- **参数**: `file` (图片文件)
- **响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/files/avatar/xxx.jpg",
    "size": 1024000,
    "width": 200,
    "height": 200
  }
}
```

### 5.2 上传音频
- **POST** `/files/audio`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `multipart/form-data`
- **参数**: `file` (音频文件)
- **响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/files/audio/xxx.wav",
    "size": 2048000,
    "duration": 5.2,
    "format": "wav"
  }
}
```

### 5.3 上传图片
- **POST** `/files/image`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `multipart/form-data`
- **参数**: `file` (图片文件)
- **响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/files/image/xxx.jpg",
    "size": 512000,
    "width": 800,
    "height": 600
  }
}
```

### 5.4 获取文件信息
- **GET** `/files/info?url=/files/xxx`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "/files/xxx",
    "size": 1024000,
    "type": "image/jpeg",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 5.5 删除文件
- **DELETE** `/files/delete`
- **Headers**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "url": "/files/xxx"
}
```

## 6. 系统管理 (/system)

### 6.1 健康检查
- **GET** `/system/health`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### 6.2 系统统计
- **GET** `/system/stats`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": {
      "total": 1000,
      "active": 50
    },
    "conversations": {
      "total": 5000,
      "today": 100
    },
    "characters": {
      "total": 100,
      "popular": 10
    }
  }
}
```

### 6.3 版本信息
- **GET** `/system/version`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "buildTime": "2024-01-01T00:00:00Z",
    "gitCommit": "abc123"
  }
}
```

## 7. 错误码说明

| 错误码 | 说明           | 示例场景                     |
| ------ | -------------- | ---------------------------- |
| 200    | 成功           | 请求处理成功                 |
| 400    | 请求参数错误   | 缺少必填参数、参数格式错误   |
| 401    | 未授权         | Token无效或过期              |
| 403    | 禁止访问       | 权限不足                     |
| 404    | 资源不存在     | 用户、角色、对话不存在       |
| 409    | 资源冲突       | 用户名已存在                 |
| 413    | 文件过大       | 上传文件超过大小限制         |
| 415    | 不支持的媒体类型 | 文件格式不支持               |
| 429    | 请求过于频繁   | 超过频率限制                 |
| 500    | 服务器内部错误 | 系统异常                     |

## 8. 使用示例

### 8.1 完整对话流程
```javascript
// 1. 用户登录
const loginRes = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: '123456' })
});
const { data: { accessToken } } = await loginRes.json();

// 2. 搜索角色
const searchRes = await fetch('/api/characters/search?keyword=苏格拉底', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { data: { items: characters } } = await searchRes.json();

// 3. 创建对话
const createRes = await fetch('/api/conversations', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ characterId: characters[0].id, title: '与苏格拉底的对话' })
});
const { data: conversation } = await createRes.json();

// 4. 发送消息
const chatRes = await fetch('/api/conversations/chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ conversationId: conversation.id, content: '你好' })
});
const { data: { messages } } = await chatRes.json();
```

### 8.2 语音对话流程
```javascript
// 1. 录制语音并识别
const formData = new FormData();
formData.append('audio', audioBlob);
const recognitionRes = await fetch('/api/speech/recognition', {
  method: 'POST',
  body: formData
});
const { data: { text } } = await recognitionRes.json();

// 2. 发送识别的文本
const chatRes = await fetch('/api/conversations/chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ conversationId: conversationId, content: text })
});
const { data: { messages } } = await chatRes.json();

// 3. 合成AI回复语音
const synthesisRes = await fetch('/api/speech/synthesis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: messages[1].content, voice: 'xiaoyun' })
});
const { data: { audioUrl } } = await synthesisRes.json();
```

## 9. 注意事项

1. **认证**: 所有需要认证的接口都需要在Header中携带 `Authorization: Bearer {token}`
2. **文件上传**: 支持的文件格式和大小限制
   - 图片: jpg, png, gif (最大10MB)
   - 音频: wav, mp3, ogg (最大50MB)
3. **分页**: 除搜索接口外，列表接口都支持分页，默认每页20条。搜索接口 `/characters/search` 当前不分页，返回所有结果，前端可做滚动加载。
4. **搜索**: 支持关键词搜索的接口都使用 `keyword` 参数
5. **错误处理**: 所有接口都返回统一的错误格式
6. **CORS**: 支持跨域访问，允许前端域名
7. **限流**: 部分接口有频率限制，避免滥用
8. **缓存**: 静态资源支持缓存，提高性能

## 10. 开发建议

1. **接口版本**: 建议使用 `/api/v1/` 前缀，便于后续版本升级
2. **日志记录**: 重要操作需要记录日志，便于问题排查
3. **监控告警**: 关键接口需要监控，异常时及时告警
4. **文档更新**: 接口变更时需要及时更新文档
5. **测试覆盖**: 所有接口都需要有对应的测试用例
