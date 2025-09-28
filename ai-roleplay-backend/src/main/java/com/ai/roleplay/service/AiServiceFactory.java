package com.ai.roleplay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * AI服务工厂类，根据配置选择不同的AI服务提供商
 */
@Service
@RequiredArgsConstructor
public class AiServiceFactory {
    
    private final ZhipuAiService zhipuAiService;
    private final QiniuAiService qiniuAiService;
    
    @Value("${ai.provider:zhipu}")
    private String provider;
    
    /**
     * 获取当前配置的AI服务
     */
    private AiService getCurrentAiService() {
        switch (provider.toLowerCase()) {
            case "qiniu":
                return new AiServiceAdapter() {
                    @Override
                    public String chatSync(String systemPrompt, List<Map<String, String>> messages) {
                        return qiniuAiService.chatSync(systemPrompt, messages);
                    }
                    
                    @Override
                    public CompletableFuture<String> chatAsync(String systemPrompt, List<Map<String, String>> messages) {
                        return qiniuAiService.chatAsync(systemPrompt, messages);
                    }
                    
                    @Override
                    public String chatWithSkillSync(String characterPrompt, String skillPrompt, String userMessage) {
                        return qiniuAiService.chatWithSkillSync(characterPrompt, skillPrompt, userMessage);
                    }
                    
                    @Override
                    public CompletableFuture<String> chatWithSkillAsync(String characterPrompt, String skillPrompt, String userMessage) {
                        return qiniuAiService.chatWithSkillAsync(characterPrompt, skillPrompt, userMessage);
                    }
                };
            case "zhipu":
            default:
                return new AiServiceAdapter() {
                    @Override
                    public String chatSync(String systemPrompt, List<Map<String, String>> messages) {
                        return zhipuAiService.chatSync(systemPrompt, messages);
                    }
                    
                    @Override
                    public CompletableFuture<String> chatAsync(String systemPrompt, List<Map<String, String>> messages) {
                        return zhipuAiService.chatAsync(systemPrompt, messages);
                    }
                    
                    @Override
                    public String chatWithSkillSync(String characterPrompt, String skillPrompt, String userMessage) {
                        return zhipuAiService.chatWithSkillSync(characterPrompt, skillPrompt, userMessage);
                    }
                    
                    @Override
                    public CompletableFuture<String> chatWithSkillAsync(String characterPrompt, String skillPrompt, String userMessage) {
                        return zhipuAiService.chatWithSkillAsync(characterPrompt, skillPrompt, userMessage);
                    }
                };
        }
    }
    
    public String chat(String systemPrompt, List<Map<String, String>> messages) {
        return getCurrentAiService().chatSync(systemPrompt, messages);
    }
    
    public CompletableFuture<String> chatAsync(String systemPrompt, List<Map<String, String>> messages) {
        return getCurrentAiService().chatAsync(systemPrompt, messages);
    }
    
    public String chatWithSkill(String characterPrompt, String skillPrompt, String userMessage) {
        return getCurrentAiService().chatWithSkillSync(characterPrompt, skillPrompt, userMessage);
    }
    
    public CompletableFuture<String> chatWithSkillAsync(String characterPrompt, String skillPrompt, String userMessage) {
        return getCurrentAiService().chatWithSkillAsync(characterPrompt, skillPrompt, userMessage);
    }
    
    /**
     * AI服务接口
     */
    private interface AiService {
        String chatSync(String systemPrompt, List<Map<String, String>> messages);
        CompletableFuture<String> chatAsync(String systemPrompt, List<Map<String, String>> messages);
        String chatWithSkillSync(String characterPrompt, String skillPrompt, String userMessage);
        CompletableFuture<String> chatWithSkillAsync(String characterPrompt, String skillPrompt, String userMessage);
    }
    
    /**
     * AI服务适配器
     */
    private abstract static class AiServiceAdapter implements AiService {
        // 子类实现具体方法
    }
}