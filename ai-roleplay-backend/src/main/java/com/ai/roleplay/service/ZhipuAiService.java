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
public class ZhipuAiService {
    
    @Value("${ai.zhipu.api-key}")
    private String apiKey;
    
    @Value("${ai.zhipu.base-url}")
    private String baseUrl;
    
    @Value("${ai.zhipu.model}")
    private String model;
    
    public String chat(String systemPrompt, List<Map<String, String>> messages) {
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
            
            // 发送请求
            HttpResponse response = HttpRequest.post(baseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(JSONUtil.toJsonStr(requestBody))
                    .execute();
            
            if (response.isOk()) {
                JSONObject responseJson = JSONUtil.parseObj(response.body());
                return responseJson.getJSONArray("choices")
                        .getJSONObject(0)
                        .getJSONObject("message")
                        .getStr("content");
            } else {
                log.error("智谱AI调用失败: {}", response.body());
                return "抱歉，我现在无法回应，请稍后再试。";
            }
        } catch (Exception e) {
            log.error("智谱AI调用异常", e);
            return "抱歉，我现在无法回应，请稍后再试。";
        }
    }
    
    public String chatWithSkill(String characterPrompt, String skillPrompt, String userMessage) {
        String combinedPrompt = characterPrompt + "\n\n" + skillPrompt;
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);
        
        return chat(combinedPrompt, messages);
    }
}