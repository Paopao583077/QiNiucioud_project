package com.ai.roleplay.service;

import com.ai.roleplay.entity.Character;
import com.ai.roleplay.entity.CharacterSkill;
import com.ai.roleplay.mapper.CharacterMapper;
import com.ai.roleplay.mapper.CharacterSkillMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterService extends ServiceImpl<CharacterMapper, Character> {
    
    private final CharacterSkillMapper characterSkillMapper;
    
    public List<Character> searchCharacters(String keyword) {
        QueryWrapper<Character> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like("name", keyword)
                    .or().like("description", keyword)
                    .or().like("category", keyword));
        }
        wrapper.orderByDesc("create_time");
        return list(wrapper);
    }
    
    public List<CharacterSkill> getCharacterSkills(Long characterId) {
        QueryWrapper<CharacterSkill> wrapper = new QueryWrapper<>();
        wrapper.eq("character_id", characterId);
        wrapper.orderByAsc("sort_order");
        return characterSkillMapper.selectList(wrapper);
    }
    
    public CharacterSkill getSkillById(Long skillId) {
        return characterSkillMapper.selectById(skillId);
    }
    
    public List<String> getAllCategories() {
        QueryWrapper<Character> wrapper = new QueryWrapper<>();
        wrapper.select("DISTINCT category");
        wrapper.eq("status", 1);
        wrapper.isNotNull("category");
        
        return list(wrapper).stream()
                .map(Character::getCategory)
                .distinct()
                .sorted()
                .toList();
    }
    
    public List<Character> getCharactersByCategory(String category) {
        QueryWrapper<Character> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.eq("category", category);
        wrapper.orderByDesc("create_time");
        
        return list(wrapper);
    }
    
    public List<Character> getPopularCharacters(Integer limit) {
        // 这里简化实现，实际应该根据对话数量等指标排序
        QueryWrapper<Character> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.orderByDesc("create_time");
        wrapper.last("LIMIT " + limit);
        
        return list(wrapper);
    }
    
    public List<Character> getRecommendedCharacters(Long userId) {
        // 这里简化实现，实际应该根据用户历史对话推荐
        QueryWrapper<Character> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        wrapper.orderByDesc("create_time");
        wrapper.last("LIMIT 5");
        
        return list(wrapper);
    }
}