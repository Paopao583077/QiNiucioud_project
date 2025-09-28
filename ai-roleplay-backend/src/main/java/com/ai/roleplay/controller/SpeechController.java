package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.service.SpeechService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "语音服务", description = "语音识别和语音合成相关接口")
@RestController
@RequestMapping("/speech")
@RequiredArgsConstructor
public class SpeechController {
    
    private final SpeechService speechService;
    
    @Operation(summary = "语音识别")
    @PostMapping("/recognition")
    public Result<RecognitionResponse> speechToText(@RequestParam("audio") MultipartFile audioFile) {
        Long userId = com.ai.roleplay.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        try {
            if (audioFile.isEmpty()) {
                return Result.error("音频文件不能为空");
            }
            
            byte[] audioData = audioFile.getBytes();
            String text = speechService.speechToText(audioData);
            
            if (text != null) {
                RecognitionResponse response = new RecognitionResponse();
                response.setText(text);
                response.setConfidence(0.95);
                response.setLanguage("zh-CN");
                return Result.success(response);
            } else {
                return Result.error("语音识别失败");
            }
        } catch (Exception e) {
            return Result.error("语音识别异常: " + e.getMessage());
        }
    }
    
    @Operation(summary = "语音合成")
    @PostMapping("/synthesis")
    public Result<SynthesisResponse> textToSpeech(@RequestBody SynthesisRequest request) {
        try {
            byte[] audioData = speechService.textToSpeech(request.getText(), request.getVoice());
            if (audioData != null && audioData.length > 0) {
                // 生成音频文件URL（简化实现）
                String audioUrl = "/files/speech/" + System.currentTimeMillis() + ".wav";
                SynthesisResponse response = new SynthesisResponse();
                response.setAudioUrl(audioUrl);
                response.setDuration(3.5);
                return Result.success(response);
            } else {
                return Result.error("语音合成失败");
            }
        } catch (Exception e) {
            return Result.error("语音合成异常: " + e.getMessage());
        }
    }
    
    @Operation(summary = "获取支持的语音列表")
    @GetMapping("/voices")
    public Result<java.util.List<VoiceInfo>> getSupportedVoices() {
        java.util.List<VoiceInfo> voices = new java.util.ArrayList<>();
        
        voices.add(new VoiceInfo("xiaoyun", "小云", "女声", "温柔"));
        voices.add(new VoiceInfo("xiaogang", "小刚", "男声", "稳重"));
        voices.add(new VoiceInfo("xiaomeng", "小萌", "女声", "活泼"));
        voices.add(new VoiceInfo("xiaofeng", "小峰", "男声", "磁性"));
        
        return Result.success(voices);
    }
    
    @Operation(summary = "语音格式转换")
    @PostMapping("/convert")
    public Result<String> convertAudioFormat(@RequestParam("audio") MultipartFile audioFile,
                                           @RequestParam(defaultValue = "wav") String targetFormat) {
        Long userId = com.ai.roleplay.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        try {
            if (audioFile.isEmpty()) {
                return Result.error("音频文件不能为空");
            }
            
            // 这里简化实现，实际需要音频格式转换逻辑
            String convertedUrl = "/audio/converted/" + System.currentTimeMillis() + "." + targetFormat;
            return Result.success(convertedUrl);
        } catch (Exception e) {
            return Result.error("音频转换失败: " + e.getMessage());
        }
    }
    
    @Data
    public static class RecognitionResponse {
        private String text;
        private Double confidence;
        private String language;
    }
    
    @Data
    public static class SynthesisRequest {
        private String text;
        private String voice;
    }
    
    @Data
    public static class SynthesisResponse {
        private String audioUrl;
        private Double duration;
    }
    
    @Data
    public static class VoiceInfo {
        private String id;
        private String name;
        private String gender;
        private String style;
        
        public VoiceInfo(String id, String name, String gender, String style) {
            this.id = id;
            this.name = name;
            this.gender = gender;
            this.style = style;
        }
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getStyle() { return style; }
        public void setStyle(String style) { this.style = style; }
    }
}