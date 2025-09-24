class AiRoleplayApp {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
        this.currentCharacter = null;
        this.currentConversation = null;
        this.selectedSkill = null;
        this.isRecording = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadCharacters();
    }
    
    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.characterList = document.getElementById('characterList');
        this.skillsSection = document.getElementById('skillsSection');
        this.skillsList = document.getElementById('skillsList');
        this.currentCharacterEl = document.getElementById('currentCharacter');
        this.characterDescription = document.getElementById('characterDescription');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.loading = document.getElementById('loading');
    }
    
    bindEvents() {
        this.searchInput.addEventListener('input', (e) => {
            this.searchCharacters(e.target.value);
        });
        
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        this.voiceBtn.addEventListener('click', () => {
            this.toggleVoiceInput();
        });
    }
    
    async loadCharacters(keyword = '') {
        try {
            const url = keyword ? 
                `${this.baseUrl}/characters/search?keyword=${encodeURIComponent(keyword)}` :
                `${this.baseUrl}/characters/search`;
                
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.code === 200) {
                this.renderCharacters(result.data);
            } else {
                this.showError(result.message || '加载角色失败');
            }
        } catch (error) {
            console.error('加载角色失败:', error);
            this.showError('加载角色失败，请检查后端服务是否启动');
        }
    }
    
    renderCharacters(characters) {
        this.characterList.innerHTML = '';
        
        characters.forEach(character => {
            const characterEl = document.createElement('div');
            characterEl.className = 'character-item';
            characterEl.innerHTML = `
                <h4>${character.name}</h4>
                <p>${character.description}</p>
                <small>分类: ${character.category}</small>
            `;
            
            characterEl.addEventListener('click', () => {
                this.selectCharacter(character);
            });
            
            this.characterList.appendChild(characterEl);
        });
    }
    
    async selectCharacter(character) {
        // 更新UI状态
        document.querySelectorAll('.character-item').forEach(el => {
            el.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        this.currentCharacter = character;
        this.currentConversation = null;
        
        // 更新聊天区域标题
        this.currentCharacterEl.textContent = character.name;
        this.characterDescription.textContent = character.description;
        
        // 启用输入
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        this.voiceBtn.disabled = false;
        this.messageInput.placeholder = `与${character.name}对话...`;
        
        // 清空聊天记录
        this.chatMessages.innerHTML = `
            <div class="message assistant">
                <div class="message-content">
                    你好！我是${character.name}。${character.description}
                    <br><br>你可以直接与我对话，或者使用我的专业技能来获得更好的体验。
                </div>
            </div>
        `;
        
        // 加载角色技能
        await this.loadCharacterSkills(character.id);
    }
    
    async loadCharacterSkills(characterId) {
        try {
            const response = await fetch(`${this.baseUrl}/characters/${characterId}/skills`);
            const result = await response.json();
            
            if (result.code === 200) {
                this.renderSkills(result.data);
                this.skillsSection.style.display = result.data.length > 0 ? 'block' : 'none';
            } else {
                console.error('加载技能失败:', result.message);
            }
        } catch (error) {
            console.error('加载技能失败:', error);
        }
    }
    
    renderSkills(skills) {
        this.skillsList.innerHTML = '';
        
        skills.forEach(skill => {
            const skillEl = document.createElement('div');
            skillEl.className = 'skill-item';
            skillEl.innerHTML = `
                <strong>${skill.skillName}</strong>
                <br><small>${skill.skillDescription}</small>
            `;
            
            skillEl.addEventListener('click', () => {
                this.selectSkill(skill);
            });
            
            this.skillsList.appendChild(skillEl);
        });
    }
    
    selectSkill(skill) {
        // 更新技能选择状态
        document.querySelectorAll('.skill-item').forEach(el => {
            el.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        this.selectedSkill = skill;
        this.messageInput.placeholder = `使用"${skill.skillName}"技能与${this.currentCharacter.name}对话...`;
    }
    
    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || !this.currentCharacter) return;
        
        // 显示用户消息
        this.addMessage('user', content);
        this.messageInput.value = '';
        
        // 显示加载状态
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.baseUrl}/conversations/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: this.currentConversation,
                    characterId: this.currentCharacter?.id,
                    content: content,
                    skillId: this.selectedSkill?.id
                })
            });
            
            const result = await response.json();
            
            if (result.code === 200) {
                // 显示AI回复
                this.addMessage('assistant', result.data.response);
            } else {
                this.addMessage('assistant', result.message || '抱歉，我现在无法回应，请稍后再试。');
            }
            
            // 如果使用了技能，显示技能标识
            if (this.selectedSkill) {
                this.addSkillIndicator(this.selectedSkill.skillName);
            }
            
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessage('assistant', '抱歉，我现在无法回应，请稍后再试。');
        } finally {
            this.showLoading(false);
        }
    }
    
    addMessage(role, content) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.innerHTML = `
            <div class="message-content">${content}</div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    addSkillIndicator(skillName) {
        const indicatorEl = document.createElement('div');
        indicatorEl.className = 'message assistant';
        indicatorEl.innerHTML = `
            <div class="message-content" style="background: #e3f2fd; color: #1976d2; font-size: 12px;">
                💡 使用了技能: ${skillName}
            </div>
        `;
        
        this.chatMessages.appendChild(indicatorEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        this.sendBtn.disabled = show;
    }
    
    searchCharacters(keyword) {
        this.loadCharacters(keyword);
    }
    
    toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('您的浏览器不支持语音识别功能');
            return;
        }
        
        if (this.isRecording) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }
    
    startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            this.voiceBtn.textContent = '🔴';
            this.voiceBtn.style.background = '#dc3545';
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.messageInput.value = transcript;
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.stopVoiceInput();
        };
        
        this.recognition.onend = () => {
            this.stopVoiceInput();
        };
        
        this.recognition.start();
    }
    
    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isRecording = false;
        this.voiceBtn.textContent = '🎤';
        this.voiceBtn.style.background = '#28a745';
    }
    
    showError(message) {
        this.addMessage('assistant', `❌ ${message}`);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AiRoleplayApp();
});