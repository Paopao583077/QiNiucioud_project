package com.ai.roleplay.controller;

import com.ai.roleplay.common.Result;
import com.ai.roleplay.entity.Character;
import com.ai.roleplay.entity.CharacterSkill;
import com.ai.roleplay.service.CharacterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "角色管理", description = "AI角色相关接口")
@RestController
@RequestMapping("/characters")
@RequiredArgsConstructor
public class CharacterController {
    
    private final CharacterService characterService;
    
    @Operation(summary = "搜索角色")
    @GetMapping("/search")
    public Result<List<Character>> searchCharacters(@RequestParam(required = false) String keyword) {
        List<Character> characters = characterService.searchCharacters(keyword);
        return Result.success(characters);
    }
    
    @Operation(summary = "获取角色详情")
    @GetMapping("/{id}")
    public Result<Character> getCharacter(@PathVariable Long id) {
        Character character = characterService.getById(id);
        if (character == null) {
            return Result.error("角色不存在");
        }
        return Result.success(character);
    }
    
    @Operation(summary = "获取角色技能")
    @GetMapping("/{id}/skills")
    public Result<List<CharacterSkill>> getCharacterSkills(@PathVariable Long id) {
        List<CharacterSkill> skills = characterService.getCharacterSkills(id);
        return Result.success(skills);
    }
    
    @Operation(summary = "获取所有角色分类")
    @GetMapping("/categories")
    public Result<List<String>> getCharacterCategories() {
        List<String> categories = characterService.getAllCategories();
        return Result.success(categories);
    }
    
    @Operation(summary = "根据分类获取角色")
    @GetMapping("/category/{category}")
    public Result<List<Character>> getCharactersByCategory(@PathVariable String category) {
        List<Character> characters = characterService.getCharactersByCategory(category);
        return Result.success(characters);
    }
    
    @Operation(summary = "获取热门角色")
    @GetMapping("/popular")
    public Result<List<Character>> getPopularCharacters(@RequestParam(defaultValue = "10") Integer limit) {
        List<Character> characters = characterService.getPopularCharacters(limit);
        return Result.success(characters);
    }
    
    @Operation(summary = "获取推荐角色")
    @GetMapping("/recommended")
    public Result<List<Character>> getRecommendedCharacters() {
        Long userId = 1L; // 简化处理
        List<Character> characters = characterService.getRecommendedCharacters(userId);
        return Result.success(characters);
    }
}