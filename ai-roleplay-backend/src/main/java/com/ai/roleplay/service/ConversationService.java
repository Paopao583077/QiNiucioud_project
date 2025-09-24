package com.ai.roleplay.service;

import com.ai.roleplay.entity.Character;
import com.ai.roleplay.entity.CharacterSkill;
import com.ai.roleplay.entity.Conversation;
import com.ai.roleplay.entity.Message;
import com.ai.roleplay.mapper.ConversationMapper;
import com.ai.roleplay.mapper.MessageMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConversationService extends ServiceImpl<ConversationMapper, Conversation> {
    
    private final MessageMapper messageMapper;
    private final CharacterService characterService;
    private final ZhipuAiService zhipuAiService;
    
    @Transactional
    public String chat(Long userId, Long conversationId, String content, Long skillId) {
        // 获取或创建对话
        Conversation conversation = getOrCreateConversation(userId, conversationId);
        
        // 保存用户消息
        Message userMessage = new Message();
        userMessage.setConversationId(conversation.getId());
        userMessage.setRole("user");
        userMessage.setContent(content);
        messageMapper.insert(userMessage);
        
        // 获取角色信息
        Character character = characterService.getById(conversation.getCharacterId());
        
        // 获取对话历史
        List<Message> history = getConversationHistory(conversation.getId(), 10);
        List<Map<String, String>> messages = convertToAiMessages(history);
        
        String response;
        String skillUsed = null;
        
        if (skillId != null) {
            // 使用技能回复
            CharacterSkill skill = characterService.getSkillById(skillId);
            if (skill != null) {
                response = zhipuAiService.chatWithSkill(
                    character.getSystemPrompt(), 
                    skill.getSkillPrompt(), 
                    content
                );
                skillUsed = skill.getSkillName();
            } else {
                response = zhipuAiService.chat(character.getSystemPrompt(), messages);
            }
        } else {
            // 普通对话
            response = zhipuAiService.chat(character.getSystemPrompt(), messages);
        }
        
        // 保存AI回复
        Message aiMessage = new Message();
        aiMessage.setConversationId(conversation.getId());
        aiMessage.setRole("assistant");
        aiMessage.setContent(response);
        aiMessage.setSkillUsed(skillUsed);
        messageMapper.insert(aiMessage);
        
        // 更新对话消息数量
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        updateById(conversation);
        
        return response;
    }
    
    @Transactional
    public String chat(Long userId, Long conversationId, Long characterId, String content, Long skillId) {
        // 获取或创建对话
        Conversation conversation = getOrCreateConversation(userId, conversationId, characterId);
        
        // 保存用户消息
        Message userMessage = new Message();
        userMessage.setConversationId(conversation.getId());
        userMessage.setRole("user");
        userMessage.setContent(content);
        messageMapper.insert(userMessage);
        
        // 获取角色信息
        Character character = characterService.getById(conversation.getCharacterId());
        
        // 获取对话历史
        List<Message> history = getConversationHistory(conversation.getId(), 10);
        List<Map<String, String>> messages = convertToAiMessages(history);
        
        String response;
        String skillUsed = null;
        
        if (skillId != null) {
            // 使用技能回复
            CharacterSkill skill = characterService.getSkillById(skillId);
            if (skill != null) {
                response = zhipuAiService.chatWithSkill(
                    character.getSystemPrompt(), 
                    skill.getSkillPrompt(), 
                    content
                );
                skillUsed = skill.getSkillName();
            } else {
                response = zhipuAiService.chat(character.getSystemPrompt(), messages);
            }
        } else {
            // 普通对话
            response = zhipuAiService.chat(character.getSystemPrompt(), messages);
        }
        
        // 保存AI回复
        Message aiMessage = new Message();
        aiMessage.setConversationId(conversation.getId());
        aiMessage.setRole("assistant");
        aiMessage.setContent(response);
        aiMessage.setSkillUsed(skillUsed);
        messageMapper.insert(aiMessage);
        
        // 更新对话消息数量
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        updateById(conversation);
        
        return response;
    }
    
    private Conversation getOrCreateConversation(Long userId, Long conversationId, Long characterId) {
        if (conversationId != null) {
            return getById(conversationId);
        }
        
        // 创建新对话
        if (characterId == null) {
            throw new IllegalArgumentException("创建新对话时必须指定角色ID");
        }
        
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setCharacterId(characterId);
        conversation.setTitle("新对话");
        conversation.setMessageCount(0);
        save(conversation);
        
        return conversation;
    }
    
    private List<Message> getConversationHistory(Long conversationId, int limit) {
        QueryWrapper<Message> wrapper = new QueryWrapper<>();
        wrapper.eq("conversation_id", conversationId);
        wrapper.orderByDesc("create_time");
        wrapper.last("LIMIT " + limit);
        
        List<Message> messages = messageMapper.selectList(wrapper);
        // 反转顺序，使其按时间正序
        List<Message> reversed = new ArrayList<>();
        for (int i = messages.size() - 1; i >= 0; i--) {
            reversed.add(messages.get(i));
        }
        return reversed;
    }
    
    private List<Map<String, String>> convertToAiMessages(List<Message> messages) {
        List<Map<String, String>> aiMessages = new ArrayList<>();
        for (Message msg : messages) {
            Map<String, String> aiMsg = new HashMap<>();
            aiMsg.put("role", msg.getRole());
            aiMsg.put("content", msg.getContent());
            aiMessages.add(aiMsg);
        }
        return aiMessages;
    }
    
    public List<Conversation> getUserConversations(Long userId) {
        QueryWrapper<Conversation> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("update_time");
        return list(wrapper);
    }
    
    public List<Message> getConversationMessages(Long conversationId) {
        QueryWrapper<Message> wrapper = new QueryWrapper<>();
        wrapper.eq("conversation_id", conversationId);
        wrapper.orderByAsc("create_time");
        return messageMapper.selectList(wrapper);
    }
}