package com.ai.roleplay.service;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class SpeechService {
    
    @Value("${ai.speech.baidu.app-id}")
    private String baiduAppId;
    
    @Value("${ai.speech.baidu.api-key}")
    private String baiduApiKey;
    
    @Value("${ai.speech.baidu.secret-key}")
    private String baiduSecretKey;
    
    @Value("${ai.speech.aliyun.access-key-id}")
    private String aliyunAccessKeyId;
    
    @Value("${ai.speech.aliyun.access-key-secret}")
    private String aliyunAccessKeySecret;
    
    @Value("${ai.speech.aliyun.app-key}")
    private String aliyunAppKey;
    
    /**
     * 百度语音识别
     */
    public String speechToText(byte[] audioData) {
        try {
            // 获取百度访问令牌
            String accessToken = getBaiduAccessToken();
            if (accessToken == null) {
                return null;
            }
            
            // 构建请求参数
            Map<String, Object> params = new HashMap<>();
            params.put("format", "wav");
            params.put("rate", 16000);
            params.put("channel", 1);
            params.put("cuid", "ai-roleplay");
            params.put("token", accessToken);
            params.put("speech", Base64.getEncoder().encodeToString(audioData));
            params.put("len", audioData.length);
            
            // 发送请求
            HttpResponse response = HttpRequest.post("https://vop.baidu.com/server_api")
                    .header("Content-Type", "application/json")
                    .body(JSONUtil.toJsonStr(params))
                    .execute();
            
            if (response.isOk()) {
                JSONObject result = JSONUtil.parseObj(response.body());
                if (result.getInt("err_no") == 0) {
                    return result.getJSONArray("result").getStr(0);
                } else {
                    log.error("百度语音识别失败: {}", result.getStr("err_msg"));
                }
            }
        } catch (Exception e) {
            log.error("语音识别异常", e);
        }
        return null;
    }
    
    /**
     * 阿里云语音合成
     */
    public byte[] textToSpeech(String text, String voice) {
        try {
            // 这里简化实现，实际需要使用阿里云SDK
            // 由于阿里云TTS API比较复杂，这里只提供接口框架
            log.info("文本转语音: {}, 音色: {}", text, voice);
            
            // 实际实现需要：
            // 1. 使用阿里云SDK
            // 2. 配置访问凭证
            // 3. 调用TTS API
            // 4. 返回音频数据
            
            return new byte[0]; // 占位返回
        } catch (Exception e) {
            log.error("语音合成异常", e);
            return null;
        }
    }
    
    private String getBaiduAccessToken() {
        try {
            String url = "https://aip.baidubce.com/oauth/2.0/token";
            
            HttpResponse response = HttpRequest.post(url)
                    .form("grant_type", "client_credentials")
                    .form("client_id", baiduApiKey)
                    .form("client_secret", baiduSecretKey)
                    .execute();
            
            if (response.isOk()) {
                JSONObject result = JSONUtil.parseObj(response.body());
                return result.getStr("access_token");
            }
        } catch (Exception e) {
            log.error("获取百度访问令牌失败", e);
        }
        return null;
    }
}