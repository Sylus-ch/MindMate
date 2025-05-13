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
    
    // 存储对话历史（用于多轮对话）
    let conversationHistory = [
        { role: "system", content: "你是MindMate，一个贴心的心理健康助手。" }
    ];

    // 当前状态标志
    let isInTestMode = false;
    let currentTest = null;

    // 获取当前用户ID（根据实际项目获取）
    function getCurrentUserId() {
        return localStorage.getItem('userId') || 'anonymous';
    }

    // 检查是否是预设问题
    function getPresetResponse(userMessage) {
        userMessage = userMessage.toLowerCase();
        for (const keyword in botResponses) {
            if (userMessage.includes(keyword.toLowerCase())) {
                return botResponses[keyword];
            }
        }
        return null;
    }

    // 添加消息到聊天框
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

    // 显示心理测试（不改变样式）
    function showPsychologicalTest(test) {
        isInTestMode = true;
        currentTest = test;
        
        // 显示测试引导消息
        const testIntro = addMessage(
            `我注意到你可能需要一些帮助。下面是一个简短的${test.title}，请回答几个问题好吗？`,
            'bot'
        );
        
        // 逐个显示问题
        test.questions.forEach((question, index) => {
            setTimeout(() => {
                const questionMsg = addMessage(
                    `${index + 1}. ${question}\n选项: ${test.options.join(", ")}`,
                    'bot'
                );
            }, 1000 * (index + 1));
        });
    }

    // 处理测试回答
    async function processTestAnswer(messageText) {
        if (!currentTest) return false;
        
        // 简单验证回答是否符合选项
        const currentQuestionIndex = conversationHistory
            .filter(msg => msg.role === "assistant" && msg.content.includes("."))
            .length - 1;
        
        if (currentQuestionIndex < 0 || currentQuestionIndex >= currentTest.questions.length) {
            return false;
        }
        
        // 记录回答
        currentTest.answers = currentTest.answers || [];
        currentTest.answers[currentQuestionIndex] = messageText;
        
        // 如果是最后一个问题，提交测试
        if (currentQuestionIndex === currentTest.questions.length - 1) {
            const submittingMsg = addMessage("正在分析你的回答...", 'bot', true);
            
            try {
                const response = await fetch('/api/chat/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: getCurrentUserId(),
                        testId: currentTest.title,
                        answers: currentTest.answers
                    })
                });
                
                const data = await response.json();
                replaceTempMessage(submittingMsg, data.result);
                
                // 显示安抚消息和推荐资源
                setTimeout(() => {
                    addMessage("感谢你完成测试。记住，你并不孤单，我们可以一起面对这些挑战。", 'bot');
                    
                    if (data.resources && data.resources.length) {
                        const resourcesText = "以下资源可能对你有帮助:\n" + 
                            data.resources.map(r => `- ${r.title}: ${r.url}`).join("\n");
                        addMessage(resourcesText, 'bot');
                    }
                }, 1000);
                
                // 重置测试状态
                isInTestMode = false;
                currentTest = null;
                
            } catch (error) {
                console.error('Error submitting test:', error);
                replaceTempMessage(submittingMsg, "提交测试失败，请稍后再试");
            }
            
            return true;
        }
        
        return true;
    }

    // 发送消息到后端处理
    async function sendToBackend(messageText) {
        const thinkingMsg = addMessage("思考中...", 'bot', true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText,
                    userId: getCurrentUserId(),
                    history: conversationHistory
                })
            });
            
            const data = await response.json();
            
            // 替换"思考中..."为真实回复
            replaceTempMessage(thinkingMsg, data.response);
            conversationHistory.push({ role: "assistant", content: data.response });
            
            // 如果检测到负面情绪且不在测试中，自动触发测试
            if (data.emotion && ['sad', 'angry', 'anxious'].includes(data.emotion) && !isInTestMode) {
                setTimeout(() => {
                    if (data.test) {
                        showPsychologicalTest(data.test);
                        conversationHistory.push({ 
                            role: "assistant", 
                            content: `我注意到你可能需要一些帮助。下面是一个简短的${data.test.title}`
                        });
                    }
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error:', error);
            replaceTempMessage(thinkingMsg, "网络似乎不太稳定，请稍后再试...");
        }
    }

    // 发送消息主逻辑
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // 添加用户消息到界面
        addMessage(messageText, 'user');
        chatInput.value = '';
        conversationHistory.push({ role: "user", content: messageText });

        // 如果在测试中，优先处理测试回答
        if (isInTestMode && await processTestAnswer(messageText)) {
            return;
        }

        // 检查预设回复
        const presetResponse = getPresetResponse(messageText);
        if (presetResponse) {
            setTimeout(() => {
                addMessage(presetResponse, 'bot');
                conversationHistory.push({ role: "assistant", content: presetResponse });
            }, 800);
        } else {
            await sendToBackend(messageText);
        }
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
