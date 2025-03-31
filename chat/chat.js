// 智能助手聊天功能
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');
    
    // 预设回复
    const botResponses = {
        "不开心": "我理解你现在的心情不好。记住，情绪就像天气一样，阴天不会永远持续，阳光总会再次出现。",
        "有趣的故事": "有一只企鹅走进酒吧，对酒保说:'我爸爸在这里吗？'酒保问:'你爸爸长什么样？'企鹅说:'穿着黑白西装啊！'酒保:'......'",
        "建议": "当你感到困惑时，可以尝试深呼吸三次，然后问自己:这个问题一个月后还重要吗？一年后呢？这能帮你理清思路。",
        "天气": "是的，天气确实能影响我们的心情。晴天时不妨出去走走，阴天时可以在室内做些让自己开心的事。",
        "你好": "你好呀！我是MindMate，你的心理健康助手。有什么我可以帮你的吗？",
        "谢谢": "不客气！随时为你服务。记住，你的感受很重要，我在这里倾听你。",
        "压力": "压力是生活的一部分，但我们可以学会管理它。尝试深呼吸、运动或与你信任的人谈谈。",
        "睡眠": "良好的睡眠对心理健康至关重要。建议保持规律的睡眠时间，睡前避免使用电子设备。"
    };
    
    // 发送消息
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;
        
        // 添加用户消息
        addMessage(messageText, 'user');
        chatInput.value = '';
        
        // 模拟思考时间
        setTimeout(() => {
            // 查找匹配的回复
            let response = "我在这里陪伴你。如果你愿意，可以多告诉我一些你的感受。";
            for (const keyword in botResponses) {
                if (messageText.includes(keyword)) {
                    response = botResponses[keyword];
                    break;
                }
            }
            
            // 添加机器人回复
            addMessage(response, 'bot');
        }, 1000);
    }
    
    // 添加消息到聊天框
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 输入框回车事件
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 初始欢迎消息
    setTimeout(() => {
        addMessage("我是你的MindMate，很高兴见到你，你想和我聊聊天吗？", 'bot');
    }, 500);
});