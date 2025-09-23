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
}