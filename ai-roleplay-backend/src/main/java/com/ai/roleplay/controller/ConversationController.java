package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.entity.Conversation;
import com.ai.roleplay.entity.Message;
import com.ai.roleplay.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "对话管理", description = "对话相关接口")
@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {
    
    private final ConversationService conversationService;
    
    @Operation(summary = "发送消息")
    @PostMapping("/chat")
    public Result<ChatResponse> chat(@RequestBody ChatRequest request) {
        // 这里简化处理，实际应该从JWT中获取用户ID
        Long userId = 1L;
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return Result.error("消息内容不能为空");
        }
        
        String response = conversationService.chat(
            userId, 
            request.getConversationId(),
            request.getCharacterId(),
            request.getContent(),
            request.getSkillId()
        );
        
        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setResponse(response);
        return Result.success(chatResponse);
    }
    
    @Operation(summary = "获取用户对话列表")
    @GetMapping
    public Result<List<Conversation>> getUserConversations() {
        // 这里简化处理，实际应该从JWT中获取用户ID
        Long userId = 1L;
        List<Conversation> conversations = conversationService.getUserConversations(userId);
        return Result.success(conversations);
    }
    
    @Operation(summary = "获取对话消息")
    @GetMapping("/{id}/messages")
    public Result<List<Message>> getConversationMessages(@PathVariable Long id) {
        List<Message> messages = conversationService.getConversationMessages(id);
        return Result.success(messages);
    }
    
    @Data
    public static class ChatRequest {
        private Long conversationId;
        private Long characterId;
        private String content;
        private Long skillId;
    }
    
    @Data
    public static class ChatResponse {
        private String response;
    }
}