package com.ai.roleplay.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("messages")
public class Message {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long conversationId;
    private String role; // user, assistant
    private String type; // text, audio
    private String content;
    private String audioUrl; // 语音文件URL
    private String skillUsed; // 使用的技能
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}