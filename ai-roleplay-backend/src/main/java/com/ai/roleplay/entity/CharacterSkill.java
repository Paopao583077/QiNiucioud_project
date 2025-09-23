package com.ai.roleplay.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("character_skills")
public class CharacterSkill {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long characterId;
    private String skillName;
    private String skillDescription;
    private String skillPrompt;
    private String skillType; // question, create, analyze等
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}