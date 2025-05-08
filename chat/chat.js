// 智能助手聊天功能
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');
    
    // 预设回复（快速响应常见问题）
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
    
    // 检查是否是预设问题
    function getPresetResponse(userMessage) {
        userMessage = userMessage.toLowerCase();
        for (const keyword in botResponses) {
            if (userMessage.includes(keyword.toLowerCase())) {
                return botResponses[keyword];
            }
        }
        return null; // 没有匹配的预设
    }

    // 存储对话历史（用于多轮对话）
    let conversationHistory = [
        { role: "system", content: "你是MindMate，一个贴心的心理健康助手。" }
    ];

    
   // 调用智谱API
   async function callZhipuAPI(userMessage) {
    const API_KEY = "60023322a23f474dbaba344943a49af7.fhHh3GubeKJSNREj"; // 替换为你的API Key
    const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; // GLM-4接口地址

    // 添加用户消息到历史记录
    conversationHistory.push({ role: "user", content: userMessage });

    try {
        // 显示"思考中..."提示
        const thinkingMsg = addMessage("思考中...", 'bot', true);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "GLM-4-Flash-250414", 
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) throw new Error(`请求失败: ${response.status}`);

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // 添加AI回复到历史记录
            conversationHistory.push({ role: "assistant", content: aiResponse });

            // 替换"思考中..."为真实回复
            replaceTempMessage(thinkingMsg, aiResponse);

        } catch (error) {
            console.error("API调用失败:", error);
            addMessage("网络似乎不太稳定，请稍后再试...", 'bot');
        }
    }
    
    // 添加消息到聊天框（新增temp参数用于临时消息）
    function addMessage(text, sender, isTemp = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (isTemp) messageDiv.classList.add('temp-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv; // 返回消息元素引用
    }
    
    // 替换临时消息
    function replaceTempMessage(tempElement, newText) {
        tempElement.classList.remove('temp-message');
        tempElement.textContent = newText;
    }
    
    // 发送消息逻辑（兼容预设+API）
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // 添加用户消息到界面
        addMessage(messageText, 'user');
        chatInput.value = '';

        // 1. 先检查预设回复
        const presetResponse = getPresetResponse(messageText);
        if (presetResponse) {
            setTimeout(() => {
                addMessage(presetResponse, 'bot');
                conversationHistory.push({ 
                    role: "assistant", 
                    content: presetResponse 
                });
            }, 800);
        } 
        // 2. 调用智谱API
        else {
            await callZhipuAPI(messageText);
        }
    }
    
    function addMessage(text, sender, isTemp = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${isTemp ? 'temp-message' : ''}`;
        messageDiv.textContent = text;
        
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // 自动滚动到底部
        
        return messageDiv; // 返回消息元素，方便后续操作
    }

    function replaceTempMessage(tempElement, newText) {
        tempElement.classList.remove('temp-message'); // 移除临时样式
        tempElement.textContent = newText; // 更新内容
    }

    function getPresetResponse(userMessage) {
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
        
        // 不区分大小写匹配关键词
        userMessage = userMessage.toLowerCase();
        for (const keyword in botResponses) {
            if (userMessage.includes(keyword.toLowerCase())) {
                return botResponses[keyword];
            }
        }
        return null; // 无匹配时返回null
    }

   // 事件监听
   sendButton.addEventListener('click', sendMessage);
   chatInput.addEventListener('keypress', (e) => {
       if (e.key === 'Enter') sendMessage();
   });

   // 初始欢迎消息
   setTimeout(() => {
       const welcomeMsg = "我是你的MindMate，今天想聊些什么呢？";
       addMessage(welcomeMsg, 'bot');
       conversationHistory.push({ role: "assistant", content: welcomeMsg });
   }, 500);
});