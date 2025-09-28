package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.entity.Conversation;
import com.ai.roleplay.entity.Message;
import com.ai.roleplay.service.ConversationService;
import com.ai.roleplay.service.SpeechService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "对话管理", description = "对话相关接口")
@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {
    
    private final ConversationService conversationService;
    private final SpeechService speechService;
    
    @Operation(summary = "发送消息")
    @PostMapping("/chat")
    public Result<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            Long userId = com.ai.roleplay.util.SecurityUtil.getCurrentUserId();
            if (userId == null) {
                return Result.error("用户未登录");
            }
            
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return Result.error("消息内容不能为空");
            }
            
            // 处理conversationId参数
            Long conversationId = null;
            if (request.getConversationId() != null && !request.getConversationId().equals("default") && !request.getConversationId().startsWith("s_")) {
                try {
                    conversationId = Long.parseLong(request.getConversationId());
                } catch (NumberFormatException e) {
                    // 忽略无效的conversationId
                }
            }
            
            // 处理characterId，支持字符串和数字类型
            Long characterId = 1L; // 默认使用AI小智角色
            if (request.getCharacterId() != null && !request.getCharacterId().trim().isEmpty()) {
                try {
                    // 尝试解析为数字
                    characterId = Long.parseLong(request.getCharacterId());
                } catch (NumberFormatException e) {
                    // 如果不是数字，根据字符串映射到角色ID
                    String charIdStr = request.getCharacterId();
                    switch (charIdStr) {
                        case "preset-hp":
                        case "harry-potter":
                            characterId = 3L; // 哈利波特角色
                            break;
                        case "preset-shakespeare":
                        case "shakespeare":
                            characterId = 4L; // 莎士比亚角色
                            break;
                        case "preset-socrates":
                        case "socrates":
                            characterId = 2L; // 苏格拉底角色
                            break;
                        case "ai-xiaozhi":
                        case "xiaozhi":
                            characterId = 1L; // AI小智角色
                            break;
                        default:
                            characterId = 1L; // 默认AI小智
                            break;
                    }
                }
            }
            
            String response = conversationService.chat(
                userId, 
                conversationId,
                characterId,
                request.getContent(),
                request.getSkillId()
            );
            
            if (response == null || response.trim().isEmpty()) {
                log.warn("AI服务返回空响应，用户ID: {}, 对话ID: {}", userId, conversationId);
                return Result.error("AI服务暂时不可用，请稍后重试");
            }
            
            ChatResponse chatResponse = new ChatResponse();
            chatResponse.setResponse(response);
            return Result.success(chatResponse);
        } catch (Exception e) {
            log.error("聊天接口异常", e);
            return Result.error("系统异常，请稍后重试");
        }
    }
    
    @Operation(summary = "获取用户对话列表")
    @GetMapping
    public Result<List<Conversation>> getUserConversations() {
        Long userId = com.ai.roleplay.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
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
    
    @Operation(summary = "语音消息发送")
    @PostMapping("/voice")
    public Result<VoiceChatResponse> voiceChat(@RequestParam("audio") org.springframework.web.multipart.MultipartFile audioFile,
                                               @RequestParam(value = "conversationId", required = false) String conversationIdStr,
                                               @RequestParam(value = "characterId", required = false) String characterIdStr) {
        Long userId = com.ai.roleplay.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        
        try {
            if (audioFile.isEmpty()) {
                return Result.error("音频文件不能为空");
            }
            
            // 处理conversationId：如果是"default"或无效字符串，则传null
            Long conversationId = null;
            if (conversationIdStr != null && !conversationIdStr.equals("default") && !conversationIdStr.startsWith("s_")) {
                try {
                    conversationId = Long.parseLong(conversationIdStr);
                } catch (NumberFormatException e) {
                    // 忽略无效的conversationId，使用null创建新对话
                    log.info("Invalid conversationId: {}, will create new conversation", conversationIdStr);
                }
            }
            
            // 处理characterId，支持字符串和数字类型
            Long characterId = 1L; // 默认使用AI小智角色
            if (characterIdStr != null && !characterIdStr.trim().isEmpty()) {
                try {
                    // 尝试解析为数字
                    characterId = Long.parseLong(characterIdStr);
                } catch (NumberFormatException e) {
                    // 如果不是数字，根据字符串映射到角色ID
                    switch (characterIdStr) {
                        case "preset-hp":
                        case "harry-potter":
                            characterId = 3L; // 哈利波特角色
                            break;
                        case "preset-shakespeare":
                        case "shakespeare":
                            characterId = 4L; // 莎士比亚角色
                            break;
                        case "preset-socrates":
                        case "socrates":
                            characterId = 2L; // 苏格拉底角色
                            break;
                        case "ai-xiaozhi":
                        case "xiaozhi":
                            characterId = 1L; // AI小智角色
                            break;
                        default:
                            characterId = 1L; // 默认AI小智
                            break;
                    }
                }
            }
            
            // 1. 语音识别
            String recognizedText;
            try {
                recognizedText = speechService.speechToText(audioFile.getBytes());
                if (recognizedText == null || recognizedText.trim().isEmpty()) {
                    recognizedText = "语音识别失败，请重试";
                }
            } catch (Exception e) {
                log.error("语音识别失败", e);
                recognizedText = "语音识别失败，请重试";
            }
            
            // 2. 调用对话服务获取AI回复
            String aiResponse = conversationService.chat(userId, conversationId, characterId, recognizedText, null);
            
            // 3. 构建响应
            VoiceChatResponse response = new VoiceChatResponse();
            java.util.List<Message> messages = new java.util.ArrayList<>();
            
            // 用户语音消息（显示识别的文本）
            Message userMessage = new Message();
            userMessage.setId(Long.valueOf(System.currentTimeMillis()));
            userMessage.setRole("user");
            userMessage.setContent(recognizedText);
            // userMessage.setType("text"); // 临时注释，数据库表未更新
            userMessage.setCreateTime(java.time.LocalDateTime.now());
            messages.add(userMessage);
            
            // AI回复消息
            Message aiMessage = new Message();
            aiMessage.setId(Long.valueOf(System.currentTimeMillis() + 1));
            aiMessage.setRole("assistant");
            aiMessage.setContent(aiResponse);
            // aiMessage.setType("text"); // 临时注释，数据库表未更新
            aiMessage.setCreateTime(java.time.LocalDateTime.now());
            messages.add(aiMessage);
            
            response.setMessages(messages);
            return Result.success(response);
            
        } catch (Exception e) {
            log.error("语音处理失败", e);
            return Result.error("语音处理失败: " + e.getMessage());
        }
    }
    
    @Data
    public static class ChatRequest {
        private String conversationId; // 改为String类型，在业务逻辑中处理
        private String characterId; // 改为String类型，支持字符串ID
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
    
    @Data
    public static class VoiceChatResponse {
        private List<Message> messages;
    }
}