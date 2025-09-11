document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const themeToggle = document.getElementById('themeToggle');
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileBtn = document.getElementById('profileBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const tabs = document.querySelectorAll('.tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const profileForm = document.getElementById('profileForm');
    const settingsForm = document.getElementById('settingsForm');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const modelSelect = document.getElementById('modelSelect');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const resetSettings = document.getElementById('resetSettings');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    const maxTokensSlider = document.getElementById('maxTokens');
    const maxTokensValue = document.getElementById('maxTokensValue');
    const exportDataBtn = document.getElementById('exportData');
    const importDataBtn = document.getElementById('importData');
    const uploadAvatarBtn = document.getElementById('uploadAvatar');
    const modelIndicator = document.getElementById('modelIndicator');
    const notificationContainer = document.getElementById('notificationContainer');
    const fileUploadBtn = document.getElementById('fileUploadBtn');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const filePreviewModal = document.getElementById('filePreviewModal');
    const closeFilePreviewModal = document.getElementById('closeFilePreviewModal');
    const filePreviewTitle = document.getElementById('filePreviewTitle');
    const filePreviewContent = document.getElementById('filePreviewContent');
    const downloadFileBtn = document.getElementById('downloadFile');

    // 状态管理
    let currentUser = null;
    let currentChatId = null;
    let chats = [];
    let chatToDelete = null;
    let selectedFiles = [];
    let currentPreviewFile = null;
    let settings = {
        selectedModel: 'deepseek-v2',
        temperature: 70,
        maxTokens: 2000,
        apiEndpoint: 'http://localhost:3001/api/chat',
        autoSave: true,
        messageHistory: true,
        fontSize: 'medium',
        enterBehavior: 'send',
        autoExpand: true,
        sidebarCollapse: false,
        typingAnimation: true,
        messageSound: false,
        maxFileSize: 10,
        allowedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt'],
        autoCompressImages: true,
        dataCollection: false,
        clearHistory: 'never'
    };

    // 初始化
    init();

    function init() {
        loadUserPreferences();
        loadSettings();
        loadUserData();
        loadChats();
        setupEventListeners();
        checkAuthenticationStatus();
        applySettings();
        updateModelIndicator();
    }

    function setupEventListeners() {
        // 发送消息
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keydown', handleInputKeydown);
        
        // 主题切换
        themeToggle.addEventListener('click', toggleTheme);
        
        // 用户菜单
        userMenuButton.addEventListener('click', toggleUserMenu);
        
        // 认证相关
        loginBtn.addEventListener('click', showAuthModal);
        logoutBtn.addEventListener('click', handleLogout);
        closeModal.addEventListener('click', hideAuthModal);
        closeProfileModal.addEventListener('click', hideProfileModal);
        closeSettingsModal.addEventListener('click', hideSettingsModal);
        closeFilePreviewModal.addEventListener('click', hideFilePreviewModal);
        profileBtn.addEventListener('click', showProfileModal);
        settingsBtn.addEventListener('click', showSettingsModal);
        
        // 表单提交
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        profileForm.addEventListener('submit', handleProfileUpdate);
        settingsForm.addEventListener('submit', handleSettingsUpdate);
        
        // 标签切换
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        
        // 新对话
        newChatBtn.addEventListener('click', startNewChat);
        
        // 模型选择
        modelSelect.addEventListener('change', updateModelIndicator);
        
        // 温度滑块
        temperatureSlider.addEventListener('input', updateTemperatureValue);
        
        // Token长度滑块
        maxTokensSlider.addEventListener('input', updateMaxTokensValue);
        
        // 重置设置
        resetSettings.addEventListener('click', resetToDefaultSettings);
        
        // 数据导入导出
        exportDataBtn.addEventListener('click', exportUserData);
        importDataBtn.addEventListener('click', importUserData);
        
        // 头像上传
        uploadAvatarBtn.addEventListener('click', handleAvatarUpload);
        
        // 文件上传
        fileUploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        
        // 文件下载
        downloadFileBtn.addEventListener('click', downloadCurrentFile);
        
        // 删除确认
        closeDeleteModal.addEventListener('click', hideDeleteModal);
        cancelDelete.addEventListener('click', hideDeleteModal);
        confirmDelete.addEventListener('click', handleChatDelete);
        
        // 点击外部关闭菜单和模态框
        document.addEventListener('click', handleOutsideClick);
        
        // 调整输入框高度
        userInput.addEventListener('input', autoResizeTextarea);
    }

    function loadUserPreferences() {
        // 加载主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            settings = { ...settings, ...parsedSettings };
            
            // 更新设置表单
            updateSettingsForm();
        }
    }

    function updateSettingsForm() {
        document.getElementById('modelSelect').value = settings.selectedModel;
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('temperatureValue').textContent = `${settings.temperature}%`;
        document.getElementById('maxTokens').value = settings.maxTokens;
        document.getElementById('maxTokensValue').textContent = `${settings.maxTokens} tokens`;
        document.getElementById('apiEndpoint').value = settings.apiEndpoint;
        document.getElementById('autoSave').checked = settings.autoSave;
        document.getElementById('messageHistory').checked = settings.messageHistory;
        document.getElementById('fontSize').value = settings.fontSize;
        document.getElementById('enterBehavior').value = settings.enterBehavior;
        document.getElementById('autoExpand').checked = settings.autoExpand;
        document.getElementById('sidebarCollapse').checked = settings.sidebarCollapse;
        document.getElementById('typingAnimation').checked = settings.typingAnimation;
        document.getElementById('messageSound').checked = settings.messageSound;
        document.getElementById('maxFileSize').value = settings.maxFileSize;
        document.getElementById('autoCompressImages').checked = settings.autoCompressImages;
        document.getElementById('dataCollection').checked = settings.dataCollection;
        document.getElementById('clearHistory').value = settings.clearHistory;
        
        // 设置允许的文件类型
        const allowedFileTypesSelect = document.getElementById('allowedFileTypes');
        Array.from(allowedFileTypesSelect.options).forEach(option => {
            option.selected = settings.allowedFileTypes.includes(option.value);
        });
    }

    function saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }

    function applySettings() {
        // 应用字体大小
        document.documentElement.style.fontSize = 
            settings.fontSize === 'small' ? '14px' : 
            settings.fontSize === 'large' ? '18px' : '16px';
        
        // 应用消息历史显示设置
        const messageTimes = document.querySelectorAll('.message-time');
        messageTimes.forEach(time => {
            time.style.display = settings.messageHistory ? 'block' : 'none';
        });
        
        // 应用输入框自动扩展
        if (settings.autoExpand) {
            userInput.addEventListener('input', autoResizeTextarea);
        } else {
            userInput.removeEventListener('input', autoResizeTextarea);
            userInput.style.height = 'auto';
        }
        
        // 应用侧边栏自动折叠
        if (window.innerWidth < 768 && settings.sidebarCollapse) {
            document.querySelector('.sidebar').classList.remove('show');
        }
    }

    function resetToDefaultSettings() {
        if (confirm('确定要恢复默认设置吗？所有自定义设置将被重置。')) {
            const defaultSettings = {
                selectedModel: 'deepseek-v2',
                temperature: 70,
                maxTokens: 2000,
                apiEndpoint: 'http://localhost:3001/api/chat',
                autoSave: true,
                messageHistory: true,
                fontSize: 'medium',
                enterBehavior: 'send',
                autoExpand: true,
                sidebarCollapse: false,
                typingAnimation: true,
                messageSound: false,
                maxFileSize: 10,
                allowedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt'],
                autoCompressImages: true,
                dataCollection: false,
                clearHistory: 'never'
            };
            
            settings = defaultSettings;
            updateSettingsForm();
            saveSettings();
            applySettings();
            updateModelIndicator();
            showNotification('设置已恢复为默认值', 'success');
        }
    }

    function updateTemperatureValue() {
        const value = temperatureSlider.value;
        temperatureValue.textContent = `${value}%`;
        settings.temperature = parseInt(value);
    }

    function updateMaxTokensValue() {
        const value = maxTokensSlider.value;
        maxTokensValue.textContent = `${value} tokens`;
        settings.maxTokens = parseInt(value);
    }

    function updateModelIndicator() {
        const selectedModel = modelSelect.value;
        settings.selectedModel = selectedModel;
        const modelName = modelSelect.options[modelSelect.selectedIndex].text;
        modelIndicator.textContent = `模型: ${modelName}`;
    }

    function loadUserData() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            usernameDisplay.textContent = currentUser.name;
            logoutBtn.style.display = 'block';
            loginBtn.style.display = 'none';
        }
    }

    function loadChats() {
        let savedChats = localStorage.getItem('chats');
        if (savedChats) {
            chats = JSON.parse(savedChats);
            renderChatHistory();
            
            // 如果有当前聊天ID，加载该聊天
            const savedCurrentChatId = localStorage.getItem('currentChatId');
            if (savedCurrentChatId) {
                loadChat(savedCurrentChatId);
            }
        } else {
            // 创建初始聊天
            startNewChat();
        }
    }

    function renderChatHistory() {
        chatHistory.innerHTML = '';
        
        if (chats.length === 0) {
            chatHistory.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>暂无对话记录</p></div>';
            return;
        }
        
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.chatId = chat.id;
            
            if (chat.id === currentChatId) {
                chatItem.classList.add('active');
            }
            
            chatItem.innerHTML = `
                <i class="fas fa-comment"></i>
                <div class="chat-item-content">
                    <div class="chat-item-title">${chat.title || '新对话'}</div>
                    <div class="chat-item-preview">${getChatPreview(chat.messages)}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="delete-chat-btn" data-chat-id="${chat.id}" title="删除对话">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-chat-btn')) {
                    loadChat(chat.id);
                }
            });
            
            // 添加删除按钮事件
            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showDeleteModal(chat.id);
            });
            
            chatHistory.appendChild(chatItem);
        });
    }

    function getChatPreview(messages) {
        if (!messages || messages.length === 0) return '暂无消息';
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.files && lastMessage.files.length > 0) {
            return `[文件] ${lastMessage.files[0].name}`;
        }
        return lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
    }

    function startNewChat() {
        const newChatId = Date.now().toString();
        const newChat = {
            id: newChatId,
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString(),
            model: settings.selectedModel
        };
        
        chats.unshift(newChat);
        currentChatId = newChatId;
        
        saveChats();
        renderChatHistory();
        clearChatContainer();
        clearFileSelection();
        
        // 显示欢迎消息
        document.querySelector('.welcome-message').style.display = 'block';
        
        showNotification('新对话已创建', 'success');
    }

    function loadChat(chatId) {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        
        currentChatId = chatId;
        localStorage.setItem('currentChatId', chatId);
        
        clearChatContainer();
        clearFileSelection();
        document.querySelector('.welcome-message').style.display = 'none';
        
        // 渲染聊天消息
        chat.messages.forEach(message => {
            if (message.files && message.files.length > 0) {
                addFileMessageToChat(message.role, message.content, message.timestamp, message.files);
            } else {
                addMessageToChat(message.role, message.content, message.timestamp);
            }
        });
        
        // 更新聊天历史UI
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeChatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (activeChatItem) {
            activeChatItem.classList.add('active');
        }
        
        renderChatHistory();
    }

    function clearChatContainer() {
        // 保留欢迎消息
        const welcomeMessage = document.querySelector('.welcome-message');
        chatContainer.innerHTML = '';
        if (welcomeMessage) {
            chatContainer.appendChild(welcomeMessage);
        }
    }

    function clearFileSelection() {
        selectedFiles = [];
        filePreview.innerHTML = '';
        fileInput.value = '';
    }

    function handleInputKeydown(e) {
        if (settings.enterBehavior === 'send') {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        } else {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            }
        }
    }

    function autoResizeTextarea() {
        if (!settings.autoExpand) return;
        
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        const hasFiles = selectedFiles.length > 0;
        
        if (!message && !hasFiles) return;

        // 禁用按钮和输入框，防止重复发送
        sendButton.disabled = true;
        userInput.disabled = true;

        // 隐藏欢迎消息
        document.querySelector('.welcome-message').style.display = 'none';

        // 将用户消息添加到聊天界面
        const userMessageTime = new Date().toISOString();
        
        if (hasFiles) {
            addFileMessageToChat('user', message, userMessageTime, selectedFiles);
            // 保存用户消息和文件到当前聊天
            saveMessageToChat('user', message, userMessageTime, selectedFiles);
        } else {
            addMessageToChat('user', message, userMessageTime);
            // 保存用户消息到当前聊天
            saveMessageToChat('user', message, userMessageTime);
        }
        
        userInput.value = ''; // 清空输入框
        clearFileSelection();
        autoResizeTextarea(); // 重置文本区域高度

        try {
            // 显示"AI正在思考"的提示
            const thinkingElement = addMessageToChat('ai', 'AI正在思考...');
            
            // 使用设置中的模型
            const selectedModel = settings.selectedModel;
            
            // 准备请求数据
            const requestData = {
                message: message,
                model: selectedModel,
                temperature: settings.temperature / 100,
                max_tokens: settings.maxTokens
            };
            
            // 如果有文件，添加文件信息
            if (hasFiles) {
                requestData.files = selectedFiles.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                }));
            }
            
            // 调用后端API
            const response = await fetch(settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            // 移除"思考中"提示，添加真实的AI回复
            thinkingElement.remove();
            
            const aiMessageTime = new Date().toISOString();
            
            // 如果启用了打字动画，则逐字显示回复
            if (settings.typingAnimation) {
                await typewriterEffect('ai', data.reply, aiMessageTime);
            } else {
                addMessageToChat('ai', data.reply, aiMessageTime);
            }
            
            // 保存AI回复到当前聊天
            saveMessageToChat('ai', data.reply, aiMessageTime);
            
            // 播放消息提示音
            if (settings.messageSound) {
                playMessageSound();
            }

        } catch (error) {
            console.error('Error:', error);
            // 移除"思考中"提示，显示错误信息
            const thinkingElement = document.querySelector('.thinking');
            if (thinkingElement) {
                thinkingElement.remove();
            }
            addMessageToChat('ai', `出错啦: ${error.message}`);
            showNotification('发送消息时出错', 'error');
        } finally {
            // 重新启用按钮和输入框
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus(); // 焦点重新回到输入框
        }
    }

    function playMessageSound() {
        // 创建简单的消息提示音
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.15);
        
        setTimeout(() => {
            oscillator.stop();
        }, 150);
    }

    async function typewriterEffect(role, text, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        const contentSpan = document.createElement('span');
        messageDiv.appendChild(contentSpan);
        
        if (timestamp) {
            const timeElement = document.createElement('div');
            timeElement.classList.add('message-time');
            timeElement.textContent = formatTime(timestamp);
            timeElement.style.display = settings.messageHistory ? 'block' : 'none';
            messageDiv.appendChild(timeElement);
        }
        
        chatContainer.appendChild(messageDiv);
        
        // 逐字显示效果
        for (let i = 0; i <= text.length; i++) {
            contentSpan.textContent = text.substring(0, i);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        return messageDiv;
    }

    function saveMessageToChat(role, content, timestamp, files = null) {
        if (!settings.autoSave) return;
        
        const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
        if (chatIndex === -1) return;
        
        const messageData = {
            role,
            content,
            timestamp
        };
        
        if (files && files.length > 0) {
            messageData.files = files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                data: file.data || null
            }));
        }
        
        chats[chatIndex].messages.push(messageData);
        
        // 如果这是第一条消息，设置聊天标题
        if (chats[chatIndex].messages.length === 1 && role === 'user') {
            if (content) {
                chats[chatIndex].title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
            } else if (files && files.length > 0) {
                chats[chatIndex].title = `[文件] ${files[0].name}`;
            }
        }
        
        saveChats();
        renderChatHistory();
    }

    function saveChats() {
        if (!settings.autoSave) return;
        localStorage.setItem('chats', JSON.stringify(chats));
        localStorage.setItem('currentChatId', currentChatId);
    }

    function addMessageToChat(role, content, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        if (content === 'AI正在思考...') {
            messageDiv.classList.add('thinking');
        }
        
        messageDiv.textContent = content;
        
        if (timestamp) {
            const timeElement = document.createElement('div');
            timeElement.classList.add('message-time');
            timeElement.textContent = formatTime(timestamp);
            timeElement.style.display = settings.messageHistory ? 'block' : 'none';
            messageDiv.appendChild(timeElement);
        }
        
        chatContainer.appendChild(messageDiv);
        
        // 自动滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return messageDiv;
    }

    function addFileMessageToChat(role, content, timestamp, files) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        if (content) {
            const contentDiv = document.createElement('div');
            contentDiv.textContent = content;
            messageDiv.appendChild(contentDiv);
        }
        
        // 添加文件预览
        files.forEach(file => {
            const fileElement = createFileElement(file);
            messageDiv.appendChild(fileElement);
        });
        
        if (timestamp) {
            const timeElement = document.createElement('div');
            timeElement.classList.add('message-time');
            timeElement.textContent = formatTime(timestamp);
            timeElement.style.display = settings.messageHistory ? 'block' : 'none';
            messageDiv.appendChild(timeElement);
        }
        
        chatContainer.appendChild(messageDiv);
        
        // 自动滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return messageDiv;
    }

    function createFileElement(file) {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('message-file');
        
        // 文件图标
        const fileIcon = document.createElement('i');
        if (file.type.startsWith('image/')) {
            fileIcon.classList.add('fas', 'fa-image', 'message-file-icon');
            
            // 图片预览
            const img = document.createElement('img');
            img.src = file.data || URL.createObjectURL(new Blob([file]));
            img.classList.add('message-image');
            img.alt = file.name;
            img.addEventListener('click', () => previewFile(file));
            fileDiv.appendChild(img);
        } else {
            // 根据文件类型设置图标
            if (file.type === 'application/pdf') {
                fileIcon.classList.add('fas', 'fa-file-pdf', 'message-file-icon');
            } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                fileIcon.classList.add('fas', 'fa-file-word', 'message-file-icon');
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                fileIcon.classList.add('fas', 'fa-file-alt', 'message-file-icon');
            } else {
                fileIcon.classList.add('fas', 'fa-file', 'message-file-icon');
            }
        }
        
        // 文件信息
        const fileInfo = document.createElement('div');
        fileInfo.classList.add('message-file-info');
        
        const fileName = document.createElement('div');
        fileName.classList.add('message-file-name');
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.classList.add('message-file-size');
        fileSize.textContent = formatFileSize(file.size);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        
        // 文件操作
        const fileAction = document.createElement('div');
        fileAction.classList.add('message-file-action');
        fileAction.innerHTML = '<i class="fas fa-download"></i>';
        fileAction.title = '下载文件';
        fileAction.addEventListener('click', () => downloadFile(file));
        
        fileDiv.appendChild(fileIcon);
        fileDiv.appendChild(fileInfo);
        fileDiv.appendChild(fileAction);
        
        return fileDiv;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            showNotification('已切换至深色模式', 'success');
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            showNotification('已切换至浅色模式', 'success');
        }
    }

    function toggleUserMenu() {
        userMenu.classList.toggle('show');
    }

    function showAuthModal() {
        authModal.classList.add('show');
    }

    function hideAuthModal() {
        authModal.classList.remove('show');
    }

    function showSettingsModal() {
        settingsModal.classList.add('show');
        userMenu.classList.remove('show');
    }

    function hideSettingsModal() {
        settingsModal.classList.remove('show');
    }

    function showFilePreviewModal() {
        filePreviewModal.classList.add('show');
    }

    function hideFilePreviewModal() {
        filePreviewModal.classList.remove('show');
        currentPreviewFile = null;
    }

    function showProfileModal() {
        if (!currentUser) {
            showAuthModal();
            return;
        }
        
        // 填充个人资料表单
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileBio').value = currentUser.bio || '';
        
        profileModal.classList.add('show');
        userMenu.classList.remove('show');
    }

    function hideProfileModal() {
        profileModal.classList.remove('show');
    }

    function showDeleteModal(chatId) {
        chatToDelete = chatId;
        deleteConfirmModal.classList.add('show');
    }

    function hideDeleteModal() {
        deleteConfirmModal.classList.remove('show');
        chatToDelete = null;
    }

    function handleChatDelete() {
        if (!chatToDelete) return;
        
        // 从聊天列表中删除
        const chatTitle = chats.find(chat => chat.id === chatToDelete)?.title || '对话';
        chats = chats.filter(chat => chat.id !== chatToDelete);
        
        // 如果删除的是当前聊天，切换到新聊天
        if (currentChatId === chatToDelete) {
            if (chats.length > 0) {
                currentChatId = chats[0].id;
                loadChat(currentChatId);
            } else {
                startNewChat();
            }
        }
        
        saveChats();
        renderChatHistory();
        hideDeleteModal();
        showNotification(`已删除对话: ${chatTitle}`, 'success');
    }

    function switchTab(tabName) {
        // 切换活动标签
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // 切换活动表单
        authForms.forEach(form => {
            if (form.id === `${tabName}Form`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // 模拟登录过程
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            usernameDisplay.textContent = currentUser.name;
            
            logoutBtn.style.display = 'block';
            loginBtn.style.display = 'none';
            
            hideAuthModal();
            showNotification('登录成功！', 'success');
        } else {
            showNotification('邮箱或密码错误！', 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showNotification('密码不匹配！', 'error');
            return;
        }
        
        // 模拟注册过程
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === email)) {
            showNotification('该邮箱已被注册！', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            bio: '',
            avatar: null,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自动登录
        currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            bio: newUser.bio,
            avatar: newUser.avatar
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        usernameDisplay.textContent = currentUser.name;
        
        logoutBtn.style.display = 'block';
        loginBtn.style.display = 'none';
        
        hideAuthModal();
        showNotification('注册成功！', 'success');
    }

    function handleProfileUpdate(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const bio = document.getElementById('profileBio').value;
        
        // 更新用户信息
        currentUser.name = name;
        currentUser.email = email;
        currentUser.bio = bio;
        
        // 更新本地存储
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 更新用户列表中的信息
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].name = name;
            users[userIndex].email = email;
            users[userIndex].bio = bio;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        usernameDisplay.textContent = currentUser.name;
        hideProfileModal();
        showNotification('个人资料已更新！', 'success');
    }

    function handleSettingsUpdate(e) {
        e.preventDefault();
        
        // 更新设置
        settings.selectedModel = document.getElementById('modelSelect').value;
        settings.temperature = parseInt(document.getElementById('temperature').value);
        settings.maxTokens = parseInt(document.getElementById('maxTokens').value);
        settings.apiEndpoint = document.getElementById('apiEndpoint').value;
        settings.autoSave = document.getElementById('autoSave').checked;
        settings.messageHistory = document.getElementById('messageHistory').checked;
        settings.fontSize = document.getElementById('fontSize').value;
        settings.enterBehavior = document.getElementById('enterBehavior').value;
        settings.autoExpand = document.getElementById('autoExpand').checked;
        settings.sidebarCollapse = document.getElementById('sidebarCollapse').checked;
        settings.typingAnimation = document.getElementById('typingAnimation').checked;
        settings.messageSound = document.getElementById('messageSound').checked;
        settings.maxFileSize = parseInt(document.getElementById('maxFileSize').value);
        settings.autoCompressImages = document.getElementById('autoCompressImages').checked;
        settings.dataCollection = document.getElementById('dataCollection').checked;
        settings.clearHistory = document.getElementById('clearHistory').value;
        
        // 获取允许的文件类型
        const allowedFileTypesSelect = document.getElementById('allowedFileTypes');
        settings.allowedFileTypes = Array.from(allowedFileTypesSelect.selectedOptions).map(option => option.value);
        
        saveSettings();
        applySettings();
        updateModelIndicator();
        hideSettingsModal();
        showNotification('设置已保存！', 'success');
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        usernameDisplay.textContent = '未登录';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        
        userMenu.classList.remove('show');
        showNotification('已退出登录', 'info');
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        const maxSize = settings.maxFileSize * 1024 * 1024; // 转换为字节
        
        // 检查文件大小和类型
        for (const file of files) {
            if (file.size > maxSize) {
                showNotification(`文件 ${file.name} 超过最大限制 ${settings.maxFileSize}MB`, 'error');
                continue;
            }
            
            // 检查文件类型
            const isAllowed = settings.allowedFileTypes.some(type => {
                if (type.includes('*')) {
                    // 通配符类型，如图片
                    return file.type.startsWith(type.replace('*', ''));
                } else {
                    // 具体扩展名
                    return type.split(',').some(ext => file.name.toLowerCase().endsWith(ext));
                }
            });
            
            if (!isAllowed) {
                showNotification(`不支持的文件类型: ${file.name}`, 'error');
                continue;
            }
            
            // 如果是图片且启用了自动压缩，压缩图片
            if (file.type.startsWith('image/') && settings.autoCompressImages) {
                compressImage(file).then(compressedFile => {
                    compressedFile.originalName = file.name;
                    selectedFiles.push(compressedFile);
                    addFilePreview(compressedFile);
                }).catch(error => {
                    console.error('Error compressing image:', error);
                    selectedFiles.push(file);
                    addFilePreview(file);
                });
            } else {
                selectedFiles.push(file);
                addFilePreview(file);
            }
        }
        
        // 清空文件输入，允许选择相同文件
        fileInput.value = '';
    }

    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 计算压缩后的尺寸
                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 1024; // 最大尺寸
                    
                    if (width > height) {
                        if (width > maxDimension) {
                            height *= maxDimension / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width *= maxDimension / height;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 绘制压缩后的图片
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换为Blob
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 70% 质量
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    function addFilePreview(file) {
        const previewItem = document.createElement('div');
        previewItem.classList.add('file-preview-item');
        
        const fileName = document.createElement('span');
        fileName.classList.add('file-preview-name');
        fileName.textContent = file.originalName || file.name;
        fileName.title = file.originalName || file.name;
        
        const removeBtn = document.createElement('span');
        removeBtn.classList.add('file-preview-remove');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = '移除文件';
        removeBtn.addEventListener('click', () => {
            const index = selectedFiles.findIndex(f => f === file);
            if (index !== -1) {
                selectedFiles.splice(index, 1);
                previewItem.remove();
            }
        });
        
        previewItem.appendChild(fileName);
        previewItem.appendChild(removeBtn);
        filePreview.appendChild(previewItem);
    }

    function previewFile(file) {
        currentPreviewFile = file;
        filePreviewTitle.textContent = file.name;
        filePreviewContent.innerHTML = '';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = file.data || URL.createObjectURL(file);
            img.alt = file.name;
            filePreviewContent.appendChild(img);
        } else {
            const icon = document.createElement('div');
            icon.classList.add('file-preview-document');
            
            if (file.type === 'application/pdf') {
                icon.innerHTML = '<i class="fas fa-file-pdf"></i>';
            } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                icon.innerHTML = '<i class="fas fa-file-word"></i>';
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                icon.innerHTML = '<i class="fas fa-file-alt"></i>';
            } else {
                icon.innerHTML = '<i class="fas fa-file"></i>';
            }
            
            const fileName = document.createElement('div');
            fileName.textContent = file.name;
            fileName.style.marginTop = '10px';
            fileName.style.wordBreak = 'break-all';
            
            filePreviewContent.appendChild(icon);
            filePreviewContent.appendChild(fileName);
        }
        
        showFilePreviewModal();
    }

    function downloadFile(file) {
        const url = file.data || URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (!file.data) {
            URL.revokeObjectURL(url);
        }
    }

    function downloadCurrentFile() {
        if (currentPreviewFile) {
            downloadFile(currentPreviewFile);
        }
    }

    function exportUserData() {
        if (!currentUser) {
            showNotification('请先登录再导出数据', 'error');
            return;
        }
        
        const userData = {
            user: currentUser,
            chats: chats,
            settings: settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `deepseek-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('数据导出成功', 'success');
    }

    function importUserData() {
        if (!currentUser) {
            showNotification('请先登录再导入数据', 'error');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const userData = JSON.parse(e.target.result);
                    
                    if (userData.chats) {
                        chats = userData.chats;
                        saveChats();
                        renderChatHistory();
                    }
                    
                    if (userData.settings) {
                        settings = { ...settings, ...userData.settings };
                        saveSettings();
                        updateSettingsForm();
                        applySettings();
                        updateModelIndicator();
                    }
                    
                    showNotification('数据导入成功', 'success');
                } catch (error) {
                    console.error('Error importing data:', error);
                    showNotification('导入文件格式错误', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    function handleAvatarUpload() {
        showNotification('头像上传功能需连接服务器', 'info');
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'error') icon = 'fas fa-exclamation-circle';
        if (type === 'warning') icon = 'fas fa-exclamation-triangle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        notificationContainer.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    function checkAuthenticationStatus() {
        if (!currentUser) {
            logoutBtn.style.display = 'none';
            loginBtn.style.display = 'block';
        } else {
            logoutBtn.style.display = 'block';
            loginBtn.style.display = 'none';
        }
    }

    function handleOutsideClick(e) {
        // 关闭用户菜单
        if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.remove('show');
        }
        
        // 关闭模态框
        if (authModal.classList.contains('show') && !authModal.querySelector('.modal-content').contains(e.target)) {
            hideAuthModal();
        }
        
        if (profileModal.classList.contains('show') && !profileModal.querySelector('.modal-content').contains(e.target)) {
            hideProfileModal();
        }
        
        if (settingsModal.classList.contains('show') && !settingsModal.querySelector('.modal-content').contains(e.target)) {
            hideSettingsModal();
        }
        
        if (deleteConfirmModal.classList.contains('show') && !deleteConfirmModal.querySelector('.modal-content').contains(e.target)) {
            hideDeleteModal();
        }
        
        if (filePreviewModal.classList.contains('show') && !filePreviewModal.querySelector('.modal-content').contains(e.target)) {
            hideFilePreviewModal();
        }
    }

    // 模拟AI回复功能（当后端不可用时使用）
    function simulateAIResponse(userMessage) {
        const responses = [
            "这是一个有趣的问题！让我来帮你解答。",
            "基于我的理解，这个问题的答案可能是...",
            "我需要更多信息来准确回答这个问题。你能提供更多细节吗？",
            "根据最新的研究，这个问题的解决方案是...",
            "我很乐意帮助你解决这个问题！首先，让我们从基础开始..."
        ];
        
        // 根据用户消息长度选择回复
        const index = userMessage.length % responses.length;
        return responses[index];
    }
});