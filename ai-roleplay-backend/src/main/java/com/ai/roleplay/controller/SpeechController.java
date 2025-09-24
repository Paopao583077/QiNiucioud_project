package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.service.SpeechService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
    public Result<String> speechToText(@RequestParam("audio") MultipartFile audioFile) {
        try {
            if (audioFile.isEmpty()) {
                return Result.error("音频文件不能为空");
            }
            
            byte[] audioData = audioFile.getBytes();
            String text = speechService.speechToText(audioData);
            
            if (text != null) {
                return Result.success(text);
            } else {
                return Result.error("语音识别失败");
            }
        } catch (Exception e) {
            return Result.error("语音识别异常: " + e.getMessage());
        }
    }
    
    @Operation(summary = "语音合成")
    @PostMapping(value = "/synthesis", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] textToSpeech(@RequestParam String text, 
                              @RequestParam(defaultValue = "xiaoyun") String voice) {
        try {
            return speechService.textToSpeech(text, voice);
        } catch (Exception e) {
            return new byte[0];
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