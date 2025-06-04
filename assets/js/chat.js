document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');

    // 对话历史，首条为系统提示词
    let conversationHistory = [
        {
            role: "system",
            content: `
你是MindMate，一个温暖、善解人意的心理健康助手。你的目标是像知心朋友一样倾听用户的想法和感受。
- 在日常对话中，请像朋友一样自然、温和地聊天和引导，不要在每句话后加任何标签。
- 只有在用户明确要求“生成报告”时，你才输出建议，且必须严格只输出如下四条建议，每条建议前加上对应标签，顺序如下，不能有其它内容，不能有多余解释、问候、总结、说明、空行或其它文字：
【情绪管理】：（你的建议内容，1-2句话，简明具体）
【情感调整】：（你的建议内容，1-2句话，简明具体）
【社交建议】：（你的建议内容，1-2句话，简明具体）
【运动建议】：（你的建议内容，1-2句话，简明具体）
- 在日常对话中，绝对不要输出任何带有【情绪管理】【情感调整】【社交建议】【运动建议】标签的建议，除非用户明确要求“生成报告”。
- 只有在用户明确要求“生成报告”时，才输出建议，并且只输出四条建议，且不能有其它说明、总结或模拟提示。
- 所有回复请用中文。
`
        }
    ];

    // 渲染历史
    function renderHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            if (msg.hidden) return; // 跳过隐藏消息
            if (msg.role === "user") addMessage(msg.content, 'user');
            if (msg.role === "assistant") addMessage(msg.content, 'bot');
        });
    }

    // 添加消息到界面
    function addMessage(text, sender, isTemp = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${isTemp ? 'temp-message' : ''}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // 替换临时消息
    function replaceTempMessage(tempElement, newText) {
        tempElement.classList.remove('temp-message');
        tempElement.textContent = newText;
    }

    // 获取当日日记
    async function getTodayDiary() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const res = await fetch('/api/chat/today_diary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            return data.diary;
        }
        return null;
    }

    // 保存历史到后端
    async function saveHistory() {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('/api/chat/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ history: conversationHistory.slice(1) }) // 不存system
        });
    }

    // 加载历史
    async function loadHistory() {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/chat/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.history && data.history.length > 0) {
                conversationHistory = [conversationHistory[0], ...data.history];
                renderHistory();
            }
        }
    }

    // 智谱API调用（通过后端代理），自动拼接日记
    async function callZhipuAPI(userMessage, isHidden = false) {
        const API_URL = "/api/zhipu/chat";
        // 获取当日日记
        const diary = await getTodayDiary();
        let systemPrompt = conversationHistory[0].content;
        if (diary) {
            systemPrompt += `\n用户今天的日记内容如下：${diary.title || ''}。${diary.content || ''}。你可以结合这些内容更好地理解和关心用户。`;
        }
        // 构造历史
        const history = [{ role: "system", content: systemPrompt }, ...conversationHistory.slice(1)];
        history.push({ role: "user", content: userMessage });
        const recentHistory = history.slice(-10);

        try {
            const thinkingMsg = addMessage("思考中...", 'bot', true);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "GLM-4",
                    messages: recentHistory,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            if (!response.ok) throw new Error(`请求失败: ${response.status}`);
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            // 只有不是隐藏消息时才push user消息
            if (!isHidden) {
                conversationHistory.push({ role: "user", content: userMessage });
            }
            conversationHistory.push({ role: "assistant", content: aiResponse });
            replaceTempMessage(thinkingMsg, aiResponse);
            await saveHistory();
        } catch (error) {
            console.error("API调用失败:", error);
            addMessage("网络似乎不太稳定，请稍后再试...", 'bot');
        }
    }

    // 发送消息逻辑
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        addMessage(messageText, 'user');
        chatInput.value = '';
        await callZhipuAPI(messageText);
    }

    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 页面加载时自动加载历史
    loadHistory();

    // 初始欢迎消息（仅首次）
    setTimeout(() => {
        // 如果没有历史AI消息才欢迎
        if (!conversationHistory.some(msg => msg.role === "assistant")) {
            const welcomeMsg = "你好呀！我是MindMate，你的心理健康助手。今天想聊些什么呢？";
            addMessage(welcomeMsg, 'bot');
            conversationHistory.push({ role: "assistant", content: welcomeMsg });
        }
    }, 500);

    // 生成心理报告并跳转
    async function generateReportAndGoto() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('请先登录');
            return;
        }

        // 1. 触发AI生成报告和建议，获取AI回复
        const reportPrompt = `现在请你根据我们的对话，生成一份心理健康测评报告，并严格按照如下格式输出建议：
【情绪管理】：（你的建议内容，1-2句话，简明具体）
【情感调整】：（你的建议内容，1-2句话，简明具体）
【社交建议】：（你的建议内容，1-2句话，简明具体）
【运动建议】：（你的建议内容，1-2句话，简明具体）`;

        // 插入隐藏的user消息
        conversationHistory.push({
            role: "user",
            content: reportPrompt,
            hidden: true
        });

        // 让AI回复，并插入到聊天记录
        await callZhipuAPI(reportPrompt, true);

        // 2. 保存最新历史
        await saveHistory();

        // 3. 请求后端生成报告
        const res = await fetch('/api/generate_report', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const reportData = await res.json();
            localStorage.setItem('reportData', JSON.stringify(reportData));
            window.location.href = 'report.html';
        } else {
            const data = await res.json();
            alert(data.msg || '生成报告失败');
        }
    }

    // 按钮事件绑定
    document.getElementById('generateReportBtn').addEventListener('click', generateReportAndGoto);

});