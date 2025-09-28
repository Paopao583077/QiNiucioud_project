-- 数据库迁移脚本：为messages表添加type字段
-- 执行时间：2024-01-01

USE ai_roleplay;

-- 为messages表添加type字段
ALTER TABLE messages 
ADD COLUMN type VARCHAR(20) DEFAULT 'text' COMMENT '消息类型 text/audio' 
AFTER role;

-- 更新现有数据，将所有现有消息的type设置为'text'
UPDATE messages SET type = 'text' WHERE type IS NULL;

-- 验证字段添加成功
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ai_roleplay' 
AND TABLE_NAME = 'messages' 
AND COLUMN_NAME = 'type';
