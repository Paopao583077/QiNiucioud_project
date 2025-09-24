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
    
    @Operation(summary = "创建新对话")
    @PostMapping
    public Result<ConversationResponse> createConversation(@RequestBody CreateConversationRequest request) {
        Long userId = 1L; // 简化处理
        
        if (request.getCharacterId() == null) {
            return Result.error("角色ID不能为空");
        }
        
        Conversation conversation = conversationService.createConversation(userId, request.getCharacterId(), request.getTitle());
        
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setTitle(conversation.getTitle());
        response.setCharacterId(conversation.getCharacterId());
        response.setMessageCount(conversation.getMessageCount());
        
        return Result.success(response);
    }
    
    @Operation(summary = "删除对话")
    @DeleteMapping("/{id}")
    public Result<Void> deleteConversation(@PathVariable Long id) {
        Long userId = 1L; // 简化处理
        
        boolean success = conversationService.deleteConversation(userId, id);
        if (success) {
            return Result.success();
        } else {
            return Result.error("删除失败，对话不存在或无权限");
        }
    }
    
    @Operation(summary = "更新对话标题")
    @PutMapping("/{id}/title")
    public Result<Void> updateConversationTitle(@PathVariable Long id, @RequestBody UpdateTitleRequest request) {
        Long userId = 1L; // 简化处理
        
        boolean success = conversationService.updateConversationTitle(userId, id, request.getTitle());
        if (success) {
            return Result.success();
        } else {
            return Result.error("更新失败，对话不存在或无权限");
        }
    }
    
    @Operation(summary = "获取对话详情")
    @GetMapping("/{id}")
    public Result<ConversationDetailResponse> getConversationDetail(@PathVariable Long id) {
        Conversation conversation = conversationService.getById(id);
        if (conversation == null) {
            return Result.error("对话不存在");
        }
        
        List<Message> messages = conversationService.getConversationMessages(id);
        
        ConversationDetailResponse response = new ConversationDetailResponse();
        response.setId(conversation.getId());
        response.setTitle(conversation.getTitle());
        response.setCharacterId(conversation.getCharacterId());
        response.setMessageCount(conversation.getMessageCount());
        response.setMessages(messages);
        response.setCreateTime(conversation.getCreateTime());
        response.setUpdateTime(conversation.getUpdateTime());
        
        return Result.success(response);
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
    
    @Data
    public static class CreateConversationRequest {
        private Long characterId;
        private String title;
    }
    
    @Data
    public static class UpdateTitleRequest {
        private String title;
    }
    
    @Data
    public static class ConversationResponse {
        private Long id;
        private String title;
        private Long characterId;
        private Integer messageCount;
    }
    
    @Data
    public static class ConversationDetailResponse {
        private Long id;
        private String title;
        private Long characterId;
        private Integer messageCount;
        private List<Message> messages;
        private java.time.LocalDateTime createTime;
        private java.time.LocalDateTime updateTime;
    }
}