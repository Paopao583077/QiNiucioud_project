# AI角色扮演系统 API接口文档

## 接口概览

### 基础信息
- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **响应格式**: 统一JSON格式

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
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

### 1.2 用户登录
- **POST** `/users/login`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### 1.3 获取用户信息
- **GET** `/users/{id}`

### 1.4 更新用户信息
- **PUT** `/users/{id}`
- **请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "/files/avatar/xxx.jpg"
}
```

## 2. 角色管理 (/characters)

### 2.1 搜索角色
- **GET** `/characters/search?keyword=苏格拉底`

### 2.2 获取角色详情
- **GET** `/characters/{id}`

### 2.3 获取角色技能
- **GET** `/characters/{id}/skills`

### 2.4 获取所有分类
- **GET** `/characters/categories`

### 2.5 根据分类获取角色
- **GET** `/characters/category/{category}`

### 2.6 获取热门角色
- **GET** `/characters/popular?limit=10`

### 2.7 获取推荐角色
- **GET** `/characters/recommended`

## 3. 对话管理 (/conversations)

### 3.1 发送消息
- **POST** `/conversations/chat`
- **请求体**:
```json
{
  "conversationId": 1,
  "characterId": 1,
  "content": "你好",
  "skillId": 1
}
```

### 3.2 创建新对话
- **POST** `/conversations`
- **请求体**:
```json
{
  "characterId": 1,
  "title": "与苏格拉底的对话"
}
```

### 3.3 获取用户对话列表
- **GET** `/conversations`

### 3.4 获取对话详情
- **GET** `/conversations/{id}`

### 3.5 获取对话消息
- **GET** `/conversations/{id}/messages`

### 3.6 删除对话
- **DELETE** `/conversations/{id}`

### 3.7 更新对话标题
- **PUT** `/conversations/{id}/title`
- **请求体**:
```json
{
  "title": "新标题"
}
```

## 4. 语音服务 (/speech)

### 4.1 语音识别
- **POST** `/speech/recognition`
- **请求**: multipart/form-data
- **参数**: audio (音频文件)

### 4.2 语音合成
- **POST** `/speech/synthesis`
- **参数**: 
  - text: 要合成的文本
  - voice: 音色 (默认xiaoyun)

### 4.3 获取支持的语音列表
- **GET** `/speech/voices`

### 4.4 音频格式转换
- **POST** `/speech/convert`
- **请求**: multipart/form-data
- **参数**: 
  - audio: 音频文件
  - targetFormat: 目标格式 (默认wav)

## 5. 文件管理 (/files)

### 5.1 上传头像
- **POST** `/files/avatar`
- **请求**: multipart/form-data
- **参数**: file (图片文件)

### 5.2 上传音频
- **POST** `/files/audio`
- **请求**: multipart/form-data
- **参数**: file (音频文件)

### 5.3 上传图片
- **POST** `/files/image`
- **请求**: multipart/form-data
- **参数**: file (图片文件)

### 5.4 获取文件信息
- **GET** `/files/info?url=/files/xxx`

## 6. 系统管理 (/system)

### 6.1 健康检查
- **GET** `/system/health`

### 6.2 系统统计
- **GET** `/system/stats`

### 6.3 版本信息
- **GET** `/system/version`

## 错误码说明

| 错误码 | 说明           |
| ------ | -------------- |
| 200    | 成功           |
| 400    | 请求参数错误   |
| 401    | 未授权         |
| 403    | 禁止访问       |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |

## 使用示例

### 完整对话流程
1. 搜索角色: `GET /characters/search?keyword=苏格拉底`
2. 获取角色技能: `GET /characters/1/skills`
3. 创建对话: `POST /conversations` 
4. 发送消息: `POST /conversations/chat`
5. 获取历史: `GET /conversations/1/messages`

### 语音对话流程
1. 录制语音并上传: `POST /speech/recognition`
2. 发送识别的文本: `POST /conversations/chat`
3. 合成AI回复语音: `POST /speech/synthesis`

## 注意事项

1. 所有接口都支持CORS跨域访问
2. 文件上传大小限制为10MB
3. 语音文件支持wav、mp3等格式
4. 图片文件支持jpg、png、gif等格式
5. 当前版本用户认证已简化，生产环境需要完善JWT认证