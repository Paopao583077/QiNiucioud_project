package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Tag(name = "文件管理", description = "文件上传下载相关接口")
@RestController
@RequestMapping("/files")
public class FileController {
    
    @Value("${file.upload.path:/tmp/uploads}")
    private String uploadPath;
    
    @Value("${file.upload.max-size:10485760}") // 10MB
    private long maxFileSize;
    
    @Operation(summary = "上传头像")
    @PostMapping("/avatar")
    public Result<FileUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "avatar");
    }
    
    @Operation(summary = "上传音频文件")
    @PostMapping("/audio")
    public Result<FileUploadResponse> uploadAudio(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "audio");
    }
    
    @Operation(summary = "上传图片")
    @PostMapping("/image")
    public Result<FileUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "image");
    }
    
    private Result<FileUploadResponse> uploadFile(MultipartFile file, String type) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        
        if (file.getSize() > maxFileSize) {
            return Result.error("文件大小不能超过10MB");
        }
        
        try {
            // 验证文件类型
            String contentType = file.getContentType();
            if (!isValidFileType(contentType, type)) {
                return Result.error("不支持的文件类型");
            }
            
            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + extension;
            
            // 创建目录结构
            String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String relativePath = type + "/" + dateStr + "/" + filename;
            Path filePath = Paths.get(uploadPath, relativePath);
            
            // 确保目录存在
            Files.createDirectories(filePath.getParent());
            
            // 保存文件
            file.transferTo(filePath.toFile());
            
            // 返回文件信息
            FileUploadResponse response = new FileUploadResponse();
            response.setFilename(filename);
            response.setOriginalName(originalFilename);
            response.setUrl("/files/" + relativePath);
            response.setSize(file.getSize());
            response.setType(contentType);
            
            return Result.success(response);
            
        } catch (IOException e) {
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
    
    private boolean isValidFileType(String contentType, String type) {
        if (contentType == null) return false;
        
        return switch (type) {
            case "avatar", "image" -> contentType.startsWith("image/");
            case "audio" -> contentType.startsWith("audio/");
            default -> false;
        };
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
    
    @Operation(summary = "获取文件信息")
    @GetMapping("/info")
    public Result<FileInfo> getFileInfo(@RequestParam String url) {
        try {
            Path filePath = Paths.get(uploadPath, url.replace("/files/", ""));
            File file = filePath.toFile();
            
            if (!file.exists()) {
                return Result.error("文件不存在");
            }
            
            FileInfo info = new FileInfo();
            info.setName(file.getName());
            info.setSize(file.length());
            info.setLastModified(file.lastModified());
            info.setExists(true);
            
            return Result.success(info);
            
        } catch (Exception e) {
            return Result.error("获取文件信息失败: " + e.getMessage());
        }
    }
    
    @Data
    public static class FileUploadResponse {
        private String filename;
        private String originalName;
        private String url;
        private Long size;
        private String type;
    }
    
    @Data
    public static class FileInfo {
        private String name;
        private Long size;
        private Long lastModified;
        private Boolean exists;
    }
}