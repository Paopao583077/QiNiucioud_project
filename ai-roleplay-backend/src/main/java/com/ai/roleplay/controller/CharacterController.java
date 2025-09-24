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
}