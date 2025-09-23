# AI角色扮演聊天系统

基于Spring Boot + 智谱GLM-4的AI角色扮演聊天系统，支持与历史名人和虚拟角色进行智能对话。

## 项目特色

- 🎭 **多角色扮演**: 支持苏格拉底、哈利·波特、莎士比亚等多个AI角色
- 🛠️ **专业技能**: 每个角色具备3项专业技能，提供更丰富的交互体验
- 🎤 **语音交互**: 支持语音输入和语音回复（基于浏览器API）
- 💬 **智能对话**: 基于智谱GLM-4模型，提供高质量的角色扮演对话
- 📱 **响应式设计**: 支持PC和移动端访问

## 技术架构

### 后端技术栈
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0 + Redis
- **ORM**: MyBatis Plus 3.5.4
- **安全**: Spring Security + JWT
- **AI模型**: 智谱GLM-4 API
- **API文档**: OpenAPI 3 (Swagger)

### 前端技术栈
- **原生技术**: HTML5 + CSS3 + JavaScript ES6
- **语音功能**: Web Speech API
- **UI设计**: 响应式布局，现代化界面

## 快速开始

### 1. 环境准备

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+
- 智谱AI API Key

### 2. 数据库配置

```sql
-- 创建数据库
CREATE DATABASE ai_roleplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 执行建表脚本
source ai-roleplay-backend/src/main/resources/db/schema.sql;

-- 插入测试数据
source ai-roleplay-backend/src/main/resources/db/data.sql;
```

### 3. 配置文件

修改 `ai-roleplay-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ai_roleplay?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
  
  redis:
    host: localhost
    port: 6379

ai:
  zhipu:
    api-key: your-zhipu-api-key  # 替换为你的智谱AI API Key
```

### 4. 启动后端服务

```bash
cd ai-roleplay-backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 5. 启动前端服务

```bash
cd ai-roleplay-frontend
# 使用任意HTTP服务器，例如：
python -m http.server 3000
# 或者使用Node.js的http-server
npx http-server -p 3000
```

前端页面将在 http://localhost:3000 启动

### 6. 访问应用

打开浏览器访问 http://localhost:3000，开始与AI角色对话！

## API文档

启动后端服务后，访问 http://localhost:8080/swagger-ui.html 查看完整的API文档。

### 主要接口

- `GET /api/characters/search` - 搜索角色
- `GET /api/characters/{id}` - 获取角色详情
- `GET /api/characters/{id}/skills` - 获取角色技能
- `POST /api/conversations/chat` - 发送消息
- `GET /api/conversations` - 获取对话列表

## 角色技能展示

### 苏格拉底 (哲学家)
1. **苏格拉底式提问** - 通过层层递进的问题引导思考
2. **逻辑推理指导** - 帮助分析问题的逻辑结构  
3. **人生智慧分享** - 提供人生哲理和道德指导

### 哈利·波特 (魔法师)
1. **魔法知识讲解** - 介绍魔法世界的各种知识
2. **勇气激励** - 在困难时给予鼓励和支持
3. **友谊建议** - 提供人际关系和友谊的建议

### 莎士比亚 (文学家)
1. **诗歌创作** - 根据主题创作诗歌或十四行诗
2. **文学分析** - 分析文学作品的深层含义
3. **语言艺术** - 教授修辞技巧和表达艺术

## 使用示例

### 与苏格拉底对话
```
用户: 什么是正义？
苏格拉底: 这是一个很好的问题。在回答之前，让我先问你：你认为一个人做正确的事情是因为害怕惩罚，还是因为内心的道德驱使？

用户: 我觉得应该是内心的道德驱使。
苏格拉底: 很有趣的观点。那么，如果没有人看见，没有人知道，这个人还会选择做正确的事情吗？这种内心的道德驱使从何而来？
```

### 使用哈利·波特的魔法知识技能
```
用户: 能告诉我关于守护神咒语的知识吗？
哈利·波特: 当然！守护神咒语(Expecto Patronum)是我最擅长的咒语之一。这个咒语需要你专注于最快乐的回忆，然后念出咒语。成功的守护神咒语会召唤出一个银色的守护神，它通常是一种对你有特殊意义的动物...
```

## 项目结构

```
ai-roleplay/
├── ai-roleplay-backend/          # Spring Boot后端
│   ├── src/main/java/
│   │   └── com/ai/roleplay/
│   │       ├── controller/       # 控制器层
│   │       ├── service/          # 服务层
│   │       ├── entity/           # 实体类
│   │       └── mapper/           # 数据访问层
│   └── src/main/resources/
│       ├── application.yml       # 配置文件
│       └── db/                   # 数据库脚本
├── ai-roleplay-frontend/         # 前端页面
│   ├── index.html               # 主页面
│   └── app.js                   # 前端逻辑
├── 项目设计文档.md               # 详细设计文档
└── README.md                    # 项目说明
```

## 开发计划

- [x] 基础框架搭建
- [x] 角色管理功能
- [x] 对话核心功能
- [x] 角色技能系统
- [x] 前端界面开发
- [ ] 语音识别集成
- [ ] 语音合成集成
- [ ] 用户认证系统
- [ ] 对话历史管理
- [ ] 部署优化

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请提交 Issue 或联系开发者。