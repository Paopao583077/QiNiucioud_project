package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.service.CharacterService;
import com.ai.roleplay.service.ConversationService;
import com.ai.roleplay.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "系统管理", description = "系统统计和健康检查接口")
@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
public class SystemController {
    
    private final UserService userService;
    private final CharacterService characterService;
    private final ConversationService conversationService;
    
    @Operation(summary = "系统健康检查")
    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("系统运行正常");
    }
    
    @Operation(summary = "获取系统统计信息")
    @GetMapping("/stats")
    public Result<SystemStats> getSystemStats() {
        SystemStats stats = new SystemStats();
        stats.setTotalUsers(userService.count());
        stats.setTotalCharacters(characterService.count());
        stats.setTotalConversations(conversationService.count());
        
        return Result.success(stats);
    }
    
    @Operation(summary = "获取系统版本信息")
    @GetMapping("/version")
    public Result<VersionInfo> getVersion() {
        VersionInfo version = new VersionInfo();
        version.setVersion("1.0.0");
        version.setBuildTime("2024-01-01");
        version.setDescription("AI角色扮演聊天系统");
        
        return Result.success(version);
    }
    
    @Data
    public static class SystemStats {
        private Long totalUsers;
        private Long totalCharacters;
        private Long totalConversations;
    }
    
    @Data
    public static class VersionInfo {
        private String version;
        private String buildTime;
        private String description;
    }
}