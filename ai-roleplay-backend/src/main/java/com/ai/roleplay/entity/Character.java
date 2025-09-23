package com.ai.roleplay.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("characters")
public class Character {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    private String description;
    private String avatar;
    private String personality;
    private String background;
    private String systemPrompt;
    private String category;
    private Integer status; // 0-禁用 1-启用
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}