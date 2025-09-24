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
}