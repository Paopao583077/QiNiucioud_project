package com.ai.roleplay.service;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class QiniuAiService {
    
    @Value("${ai.qiniu.api-key}")
    private String apiKey;
    
    @Value("${ai.qiniu.base-url}")
    private String baseUrl;
    
    @Value("${ai.qiniu.model}")
    private String model;
    
    @org.springframework.scheduling.annotation.Async("aiTaskExecutor")
    public java.util.concurrent.CompletableFuture<String> chatAsync(String systemPrompt, List<Map<String, String>> messages) {
        String result = chatSync(systemPrompt, messages);
        return java.util.concurrent.CompletableFuture.completedFuture(result);
    }
    
    public String chatSync(String systemPrompt, List<Map<String, String>> messages) {
        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> allMessages = new ArrayList<>();
            
            // 添加系统提示
            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                Map<String, String> systemMessage = new HashMap<>();
                systemMessage.put("role", "system");
                systemMessage.put("content", systemPrompt);
                allMessages.add(systemMessage);
            }
            
            // 添加对话历史
            allMessages.addAll(messages);
            requestBody.put("messages", allMessages);
            
            // 添加其他参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("max_tokens", 2000);
            parameters.put("temperature", 0.7);
            parameters.put("top_p", 0.9);
            requestBody.put("parameters", parameters);
            
            String requestBodyJson = JSONUtil.toJsonStr(requestBody);
            
            // 发送请求 - 使用简单的API Key认证
            HttpResponse response = HttpRequest.post(baseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBodyJson)
                    .execute();
            
            if (response.isOk()) {
                JSONObject responseJson = JSONUtil.parseObj(response.body());
                
                // 检查是否有错误
                if (responseJson.containsKey("error")) {
                    log.error("七牛云AI调用失败: {}", responseJson.getStr("error"));
                    return "抱歉，我现在无法回应，请稍后再试。";
                }
                
                // 解析响应
                if (responseJson.containsKey("choices")) {
                    return responseJson.getJSONArray("choices")
                            .getJSONObject(0)
                            .getJSONObject("message")
                            .getStr("content");
                } else if (responseJson.containsKey("output")) {
                    // 兼容不同的响应格式
                    return responseJson.getJSONObject("output").getStr("text");
                }
                
                log.error("七牛云AI响应格式异常: {}", response.body());
                return "抱歉，我现在无法回应，请稍后再试。";
            } else {
                log.error("七牛云AI调用失败，状态码: {}, 响应: {}", response.getStatus(), response.body());
                return "抱歉，我现在无法回应，请稍后再试。";
            }
        } catch (Exception e) {
            log.error("七牛云AI调用异常", e);
            return "抱歉，我现在无法回应，请稍后再试。";
        }
    }
    
    @org.springframework.scheduling.annotation.Async("aiTaskExecutor")
    public java.util.concurrent.CompletableFuture<String> chatWithSkillAsync(String characterPrompt, String skillPrompt, String userMessage) {
        String result = chatWithSkillSync(characterPrompt, skillPrompt, userMessage);
        return java.util.concurrent.CompletableFuture.completedFuture(result);
    }
    
    public String chatWithSkillSync(String characterPrompt, String skillPrompt, String userMessage) {
        String combinedPrompt = characterPrompt + "\n\n" + skillPrompt;
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);
        
        return chatSync(combinedPrompt, messages);
    }
    

    
    // 保持同步方法用于向后兼容
    public String chat(String systemPrompt, List<Map<String, String>> messages) {
        return chatSync(systemPrompt, messages);
    }
    
    public String chatWithSkill(String characterPrompt, String skillPrompt, String userMessage) {
        return chatWithSkillSync(characterPrompt, skillPrompt, userMessage);
    }
}