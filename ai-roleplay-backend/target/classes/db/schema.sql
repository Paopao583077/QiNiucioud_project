-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_roleplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_roleplay;

-- 用户表
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
) COMMENT '用户表';

-- 角色表
CREATE TABLE characters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description TEXT COMMENT '角色描述',
    avatar VARCHAR(255) COMMENT '角色头像',
    personality TEXT COMMENT '性格特征',
    background TEXT COMMENT '背景故事',
    system_prompt TEXT COMMENT '系统提示词',
    category VARCHAR(50) COMMENT '角色分类',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
) COMMENT '角色表';

-- 角色技能表
CREATE TABLE character_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    skill_name VARCHAR(100) NOT NULL COMMENT '技能名称',
    skill_description TEXT COMMENT '技能描述',
    skill_prompt TEXT COMMENT '技能提示词',
    skill_type VARCHAR(50) COMMENT '技能类型',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_character_id (character_id)
) COMMENT '角色技能表';

-- 对话会话表
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    character_id BIGINT NOT NULL COMMENT '角色ID',
    title VARCHAR(200) COMMENT '对话标题',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_user_id (user_id),
    INDEX idx_character_id (character_id)
) COMMENT '对话会话表';

-- 消息表
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL COMMENT '对话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色 user/assistant',
    content TEXT NOT NULL COMMENT '消息内容',
    audio_url VARCHAR(255) COMMENT '语音文件URL',
    skill_used VARCHAR(100) COMMENT '使用的技能',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_conversation_id (conversation_id)
) COMMENT '消息表';