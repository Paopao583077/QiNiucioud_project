package com.ai.roleplay.controller;

import com.ai.roleplay.entity.Conversation;
import com.ai.roleplay.entity.Message;
import com.ai.roleplay.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "对话管理", description = "对话相关接口")
@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {
    
    private final ConversationService conversationService;
    
    @Operation(summary = "发送消息")
    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody ChatRequest request) {
        // 这里简化处理，实际应该从JWT中获取用户ID
        Long userId = 1L;
        
        String response = conversationService.chat(
            userId, 
            request.getConversationId(), 
            request.getContent(),
            request.getSkillId()
        );
        
        return Map.of("response", response);
    }
    
    @Operation(summary = "获取用户对话列表")
    @GetMapping
    public List<Conversation> getUserConversations() {
        // 这里简化处理，实际应该从JWT中获取用户ID
        Long userId = 1L;
        return conversationService.getUserConversations(userId);
    }
    
    @Operation(summary = "获取对话消息")
    @GetMapping("/{id}/messages")
    public List<Message> getConversationMessages(@PathVariable Long id) {
        return conversationService.getConversationMessages(id);
    }
    
    // 内部类定义请求体
    public static class ChatRequest {
        private Long conversationId;
        private String content;
        private Long skillId;
        
        // getters and setters
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getSkillId() { return skillId; }
        public void setSkillId(Long skillId) { this.skillId = skillId; }
    }
}