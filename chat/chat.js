document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // 对话历史
    let conversationHistory = [
        { role: "system", content: "你是一个心理健康助手，用温暖、简洁的语言回答用户问题。" }
    ];

    // 发送消息函数
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText) return;

        // 添加用户消息
        addMessage(messageText, 'user');
        conversationHistory.push({ role: "user", content: messageText });
        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;

        try {
            // 显示"正在输入"状态
            const typingIndicator = addTypingIndicator();

            // 调用API
            const response = await fetchDeepSeekResponse(conversationHistory);
            
            // 添加AI回复
            chatMessages.removeChild(typingIndicator);
            addMessage(response, 'bot');
            conversationHistory.push({ role: "assistant", content: response });
        } catch (error) {
            console.error("对话出错:", error);
            addMessage("抱歉，出现了问题。请重试。", 'bot');
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    // DeepSeek API调用
    async function fetchDeepSeekResponse(messages) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'sk-f5024bba0e8f429096602b355ac93e6d' // 替换为你的API密钥
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "API请求失败");
        }

        return (await response.json()).choices[0].message.content;
    }

    // 添加消息到界面
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 显示"正在输入"动画
    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-indicator';
        indicator.innerHTML = '正在输入<span>.</span><span>.</span><span>.</span>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }

    // 绑定事件
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 初始欢迎消息
    setTimeout(() => {
        addMessage("你好！我是你的心理健康助手，有什么可以帮你的吗？", 'bot');
        conversationHistory.push({
            role: "assistant",
            content: "你好！我是你的心理健康助手，有什么可以帮你的吗？"
        });
    }, 500);
});