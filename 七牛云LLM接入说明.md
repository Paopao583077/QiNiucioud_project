# 七牛云大模型API接入说明

## 概述

本项目已支持七牛云大模型API，可以替代智谱GLM-4使用。七牛云提供了多种优秀的大模型服务，包括通义千问系列、ChatGLM等。

## 配置步骤

### 1. 获取七牛云API密钥

1. 登录 [七牛云控制台](https://portal.qiniu.com/)
2. 进入 **个人中心** -> **密钥管理**
3. 获取 `AccessKey`（用作API Key）
4. 开通大模型服务并获取相应权限

### 2. 修改配置文件

在 `ai-roleplay-backend/src/main/resources/application.yml` 中配置：

```yaml
ai:
  # 七牛云大模型配置
  qiniu:
    api-key: your-qiniu-access-key      # 替换为你的AccessKey
    base-url: https://dashscope.qiniuapi.com/api/v1
    model: qwen-turbo                   # 选择模型
  
  # 当前使用的AI服务提供商
  provider: qiniu  # 设置为 qiniu 使用七牛云，设置为 zhipu 使用智谱AI
```

### 3. 支持的模型

七牛云支持以下大模型：

| 模型名称       | 模型ID      | 特点           | 适用场景             |
| -------------- | ----------- | -------------- | -------------------- |
| 通义千问-Turbo | qwen-turbo  | 速度快，成本低 | 日常对话，快速响应   |
| 通义千问-Plus  | qwen-plus   | 平衡性能和成本 | 复杂对话，角色扮演   |
| 通义千问-Max   | qwen-max    | 最强性能       | 高质量创作，深度分析 |
| ChatGLM3-6B    | chatglm3-6b | 开源模型       | 轻量级应用           |

### 4. 环境变量配置（推荐）

为了安全起见，建议使用环境变量：

```yaml
ai:
  qiniu:
    api-key: ${QINIU_ACCESS_KEY:your-default-key}
    model: ${QINIU_MODEL:qwen-turbo}
  provider: ${AI_PROVIDER:qiniu}
```

然后在启动时设置环境变量：
```bash
export QINIU_ACCESS_KEY="your-actual-access-key"
export QINIU_MODEL="qwen-plus"
export AI_PROVIDER="qiniu"
```

## 使用方式

### 切换AI服务提供商

项目支持在智谱AI和七牛云之间动态切换：

1. **使用七牛云**：设置 `ai.provider: qiniu`
2. **使用智谱AI**：设置 `ai.provider: zhipu`

### API调用示例

服务会自动根据配置选择对应的AI服务：

```java
// 在ConversationService中
@Autowired
private AiServiceFactory aiServiceFactory;

// 普通对话
String response = aiServiceFactory.chat(systemPrompt, messages);

// 使用技能对话
String response = aiServiceFactory.chatWithSkill(characterPrompt, skillPrompt, userMessage);

// 异步调用
CompletableFuture<String> future = aiServiceFactory.chatAsync(systemPrompt, messages);
```

## 性能对比

| 指标     | 七牛云 qwen-turbo | 七牛云 qwen-plus | 智谱 GLM-4 |
| -------- | ----------------- | ---------------- | ---------- |
| 响应速度 | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐             | ⭐⭐⭐        |
| 回答质量 | ⭐⭐⭐               | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐      |
| 成本     | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐             | ⭐⭐⭐        |
| 中文支持 | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐            | ⭐⭐⭐⭐       |
| 角色扮演 | ⭐⭐⭐               | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐      |

## 推荐配置

### 开发环境
```yaml
ai:
  provider: qiniu
  qiniu:
    model: qwen-turbo  # 快速响应，成本低
```

### 生产环境
```yaml
ai:
  provider: qiniu
  qiniu:
    model: qwen-plus   # 平衡性能和成本
```

### 高质量场景
```yaml
ai:
  provider: qiniu
  qiniu:
    model: qwen-max    # 最佳质量
```

## 故障排除

### 常见问题

1. **认证失败**
   - 检查AccessKey和SecretKey是否正确
   - 确认账户是否开通大模型服务

2. **模型不存在**
   - 检查模型ID是否正确
   - 确认账户是否有该模型的使用权限

3. **请求超时**
   - 检查网络连接
   - 可以增加超时时间配置

### 日志调试

启用调试日志：
```yaml
logging:
  level:
    com.ai.roleplay.service.QiniuAiService: DEBUG
```

## 费用说明

七牛云大模型按调用次数计费，具体价格请参考 [七牛云官方定价](https://www.qiniu.com/prices)。

建议：
- 开发测试使用 qwen-turbo
- 生产环境根据质量要求选择 qwen-plus 或 qwen-max
- 设置合理的请求频率限制

## 技术支持

如遇到问题，可以：
1. 查看项目日志文件
2. 参考七牛云官方文档
3. 联系七牛云技术支持