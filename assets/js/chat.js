document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');

    let todayDiaryCache = null;

    // 测评相关状态
    let testInProgress = false;
    let testQuestions = [];
    let testAnswers = [];
    let currentTestIndex = 0;
    let testType = ""; // 可扩展为PHQ-9、GAD-7等

    // PHQ-9题库（可扩展为更多量表）
    const PHQ9negative = [`
   以下是完整的 **心理健康双向量表题库（100题）**，按消极症状（100题）所有题目均以 **标准化四档评分（0-3分）** 呈现，可直接用于测评：

---

### **一、消极症状题库（100题）**
**评分标准**：  
0=从未 | 1=偶尔 | 2=经常 | 3=总是  

#### **1. 情绪症状（30题）**  
1. 我感到情绪低落，快乐不起来  
2. 我对平时感兴趣的事情失去兴趣  
3. 我无缘无故想哭  
4. 我觉得自己毫无价值  
5. 我对未来感到绝望  
6. 我比平时更容易烦躁或发脾气  
7. 我感到紧张或坐立不安  
8. 我害怕与他人接触  
9. 我害怕独自一人待在安静的环境  
10. 我感到强烈的孤独感  
11. 我担心会有灾难性的事情发生  
12. 我觉得别人在背后议论我  
13. 我因为小事感到极度愤怒  
14. 我对自己感到失望  
15. 我害怕在公共场所出丑  
16. 我反复回想让自己尴尬的事  
17. 我觉得没有人真正理解我  
18. 我对未来感到迷茫  
19. 我害怕失去控制  
20. 我觉得生活没有意义  
21. 我害怕自己会突然死去  
22. 我担心自己患有严重疾病  
23. 我对过去的事情感到后悔  
24. 我对自己的外貌感到不满  
25. 我害怕被他人拒绝  
26. 我觉得自己是个失败者  
27. 我害怕做出决定  
28. 我担心自己会发疯  
29. 我因为情绪问题影响工作/学习  
30. 我觉得自己不值得被爱  

#### **2. 躯体症状（20题）**  
31. 我经常头痛（无明确病因）  
32. 我感到心跳加快或不规律  
33. 我手脚发抖或发麻  
34. 我难以入睡或睡眠浅  
35. 我比平时更容易疲劳  
36. 我食欲显著下降或暴增  
37. 我有胃痛或消化不良  
38. 我经常感到肌肉紧张  
39. 我出汗比平时多（非天气原因）  
40. 我感到呼吸困难  
41. 我有头晕或眩晕感  
42. 我经常觉得喉咙发紧  
43. 我体重明显下降或增加  
44. 我有皮肤问题（如湿疹、瘙痒）  
45. 我经常去厕所小便  
46. 我感到胸口闷或疼痛  
47. 我手脚冰凉  
48. 我有耳鸣现象  
49. 我月经不调（女性）  
50. 我性欲明显下降  

#### **3. 认知行为症状（30题）**  
51. 我难以集中注意力  
52. 我做决定比平时困难  
53. 我反复回想不愉快的事  
54. 我有伤害自己的想法  
55. 我通过酗酒/暴食缓解情绪  
56. 我故意伤害自己（如割伤、烫伤）  
57. 我回避社交活动  
58. 我工作效率明显下降  
59. 我记性比平时差  
60. 我说话或行动比平时慢  
61. 我反复检查门锁或电器  
62. 我必须按特定顺序做事  
63. 我有强迫性清洁行为  
64. 我囤积无用的物品  
65. 我拖延重要的事情  
66. 我故意回避某些地点/场景  
67. 我对噪音异常敏感  
68. 我难以控制购物冲动  
69. 我有暴饮暴食行为  
70. 我长时间刷手机逃避现实  
71. 我故意不按时服药  
72. 我开车时故意冒险  
73. 我有偷窃冲动  
74. 我故意破坏物品  
75. 我对亲密的人说出伤人的话  
76. 我故意不完成工作任务  
77. 我回避个人卫生管理  
78. 我昼夜颠倒作息混乱  
79. 我连续多天不外出  
80. 我有自杀的具体计划  

#### **4. 极端症状（20题）**  
81. 我听到别人听不到的声音  
82. 我看到别人看不到的东西  
83. 我觉得有人想伤害我  
84. 我相信自己有特殊能力  
85. 我觉得自己被外界控制  
86. 我觉得自己的思想被广播  
87. 我长时间发呆，意识模糊  
88. 我完全不记得做过的事  
89. 我有多个不同的人格  
90. 我觉得自己不是真实存在的  
91. 我认为世界即将毁灭  
92. 我相信陌生人在跟踪我  
93. 我觉得食物中被下毒  
94. 我认为伴侣不忠（无证据）  
95. 我完全无法控制自己的情绪  
96. 我有突然的暴力冲动  
97. 我连续多天不睡觉也不困  
98. 我认为自己已经死亡  
99. 我觉得身体里有异物  
100. 我认为自己是名人转世  

    `];

    const PHQpositive = [`### **积极心理资源题库（100题）**
**评分标准**：
0=从未 | 1=偶尔 | 2=经常 | 3=总是

#### **一、积极情绪体验（30题）**
1. 我早上醒来感到精神饱满
2. 日常生活中常有让我会心一笑的时刻
3. 我对新鲜事物充满好奇心
4. 听到喜欢的音乐时感到愉悦
5. 享受美食时感到满足
6. 看到自然美景会心情愉悦
7. 完成小目标后感到开心
8. 收到他人问候时感到温暖
9. 帮助他人后心情愉快
10. 回忆美好往事时会心微笑
11. 期待即将到来的假期或聚会
12. 学习新知识时感到兴奋
13. 运动后感到身心舒畅
14. 独处时也能享受宁静
15. 遇到困难时仍保持希望
16. 天气晴朗时心情变好
17. 整理房间后感到清爽
18. 完成工作任务后有成就感
19. 看到动物时感到快乐
20. 闻到喜欢的味道心情变好
21. 触摸柔软物品时感到舒适
22. 听到好消息会兴奋
23. 发现生活中的巧合觉得有趣
24. 看到孩子笑脸感到幸福
25. 遇到旧友感到欣喜
26. 尝试新装扮时感到自信
27. 收到意外礼物很惊喜
28. 帮助陌生人后心情愉悦
29. 发现自己的进步很欣慰
30. 总体而言，我觉得自己是个快乐的人

#### **二、心理韧性（25题）**
31. 遇到挫折能很快调整心态
32. 压力下仍能保持冷静
33. 相信困难终会过去
34. 能从失败中吸取教训
35. 适应新环境没有太大困难
36. 面对批评能理性对待
37. 突发状况时能快速应对
38. 生病时仍保持乐观
39. 能同时处理多项任务
40. 被拒绝后不会过度沮丧
41. 愿意尝试有挑战性的事
42. 能坚持完成枯燥但必要的事
43. 遭遇不公时能为自己发声
44. 能控制自己的冲动行为
45. 必要时能主动寻求帮助
46. 能原谅他人的无心之过
47. 能坦然承认自己的错误
48. 能从不同角度看待问题
49. 能为自己设定合理目标
50. 会定期反思并改进自己
51. 能平衡工作和生活
52. 遭遇打击后能重新振作
53. 能接受不完美的结果
54. 会主动学习应对压力的方法
55. 相信自己有能力解决问题

#### **三、人际关系（20题）**
56. 和家人相处融洽
57. 有几个知心好友
58. 能向朋友倾诉烦恼
59. 遇到困难时会获得朋友帮助
60. 愿意主动帮助朋友
61. 能体谅他人的难处
62. 能妥善处理人际冲突
63. 在群体中感到自在
64. 能发现他人的优点
65. 会主动认识新朋友
66. 能接受不同的观点
67. 会表达对他人的欣赏
68. 能尊重他人的边界
69. 需要时会主动联系朋友
70. 能给予他人情感支持
71. 参加社交活动不觉得负担
72. 能理解他人的情绪变化
73. 与人合作时配合良好
74. 能妥善处理异性关系
75. 总体满意自己的人际状况

#### **四、意义感与成长（25题）**
76. 清楚自己的人生目标
77. 觉得工作/学习有意义
78. 愿意为理想付出努力
79. 能感受到自己的价值
80. 会思考生命的意义
81. 有长期坚持的爱好
82. 定期学习新知识技能
83. 关注自我成长
84. 会记录自己的进步
85. 愿意接受建设性批评
86. 主动寻找提升的机会
87. 能学以致用
88. 对未来有明确规划
89. 能为他人创造价值
90. 参与公益或志愿活动
91. 重视精神追求
92. 保持阅读习惯
93. 会反思人生经历
94. 珍惜时间
95. 注重健康生活方式
96. 保持环境整洁
97. 传承好的经验给他人
98. 能影响他人向善
99. 觉得自己在持续进步
100. 总体满意目前的生活状态


`];

    // 步骤化提示词
    const promptSteps = [
        // 0. 人设与核心原则（优化后）
`你是一名遵循人本主义疗法的AI心理咨询师MindMate，需严格遵守：
1. **专业准则**：
   - 使用卡尔·罗杰斯的"无条件积极关注"原则
   - 实施"非指导性"咨询技术（避免直接建议）
   - 保持"此时此地"的专注力

2. **交互规范**：
   ✓ 语言温暖但保持专业边界（如用"我们"代替"你"）
   ✓ 每次回应包含：情绪反射(Reflection)+开放式提问,每次对话不超过40个字。
   ✓ 严格避免：诊断性语言、价值判断、自我披露

3. **危机协议**：
   - 当检测到自杀风险时立即启动3级响应机制
   - 禁止任何可能强化消极认知的回应`,

// 1. 初次响应流程（优化后）
`初次交互时按阶段执行：
【阶段1】建立同盟关系：
  - 若检测到日记："我注意到你在日记中提到...（具体引用），这让你有什么感受？"
  - 若无日记："今天有什么想探讨的主题？或是任何浮现的念头？"（避免封闭式提问）

【阶段2】情绪定位：
  - 使用"情感标记"技术：识别并命名情绪（如"这听起来像焦虑夹杂着失望"）
  - 跟进提问："这种感受在身体的哪个部位最明显？"（促进具身认知）`,

// 2. 共情技术升级（优化后）
`应用高级共情技术：
1. **情绪反射公式**：
   "你感到[情绪词]，因为[认知内容]，这让你[身心反应]" 
   例："你感到愤怒，因为努力未被认可，这种委屈感可能带来胃部紧绷？"

2. **认知解离引导**：
   当出现"我是失败者"等绝对化陈述时：
   "当'我是个失败者'这个想法出现时，你注意到身体有什么反应？"

3. **隐喻技术**：
   使用意象化表达："这种压力是否像背着一块不断增重的石头？"`,

// 3. 边界与禁忌（强化版）
`绝对禁止：
✗ 任何形式的诊断表述（包括"可能是抑郁症"等非正式判断）
✗ 使用"应该""必须"等指令性词汇（改用"或许可以尝试"）
✗ 分享个人经历（保持纯粹来访者中心）

例外情况：
✓ 仅当用户连续3次明确要求建议时，可回应：
   "我听到你需要具体方法，我们可以一起探索哪些可能对你有用？"`,

// 4. 报告生成规范（专业化）
 `当用户说出‘生成报告’‘给我建议’等明确指令时，立即切换至建议模式，严格按以下格式输出四条建议，每条前加对应标签，不添加任何解释或问候：
 \n【情绪管理】：（具体方法，如‘每天花5分钟写情绪日记，记录让你焦虑的事件和感受’）
 \n【情感调整】：（聚焦内在感受，如‘尝试用自我对话的方式安慰自己，比如对自己说“我正在努力”’）
 \n【社交建议】：（具体行为引导，如‘每周约1-2位信任的朋友简单见面，减少独自压抑情绪的时间’）
 \n【运动建议】：（可操作的计划，如‘每天散步20分钟，散步时专注观察周围的植物或建筑’）
 \n注意：建议需具体、可执行，避免空泛（如不说‘保持积极心态’，而说‘每天记录1件让自己小有成就感的事’）。`,

// 5. 危机干预协议（标准化）
`分级响应机制：
【1级风险】被动死亡念头：
  - 回应："有结束生命的念头出现时，最艰难的是什么？"
  - 动作：嵌入热线资源（需用户主动点击展开）

【2级风险】主动计划：
  - 回应："我需要确认你现在是否安全，能告诉我你在哪里吗？"
  - 动作：自动发送定位求助引导（非强制）

【3级风险】即刻危险：
  - 回应："请立即联系24小时心理援助热线：400-161-9995"
  - 动作：后台触发人工关怀流程`,

// 6. 阶段总结技术（新增）
`在对话每进行8-10轮后：
1. **主题聚类**："我们讨论了工作压力、家庭期待两个主题..."
2. **选择聚焦**："哪部分你最想深入探讨？"
3. **资源唤醒**："回顾我们的对话，哪个瞬间让你感觉被理解了？"

技术要点：
✓ 使用"我们"建立治疗同盟
✓ 总结后必接开放式提问
✓ 避免使用"进步"等评判性词汇`
    ];
 
    let conversationHistory = [
        { role: "system", content: promptSteps[0] }
    ];

    // 动态拼接system prompt
    function getSystemPrompt() {
        // 1. 总是包含人设与原则
        let steps = [promptSteps[0]];

        // 2. 如果没有历史消息，加入初次咨询流程
        if (conversationHistory.length <= 1) {
            steps.push(promptSteps[1]);
        }

        // 3. 如果用户有负面情绪关键词，加入共情与倾听
        const negativeKeywords = ["难过", "沮丧", "伤心", "失落", "低落", "痛苦", "悲伤", "绝望", "无助", "生气", "愤怒", "烦", "不满", "焦虑", "担心", "紧张", "压力", "不安", "恐惧", "烦躁", "恐慌"];
        if (conversationHistory.some(msg => msg.role === "user" && negativeKeywords.some(k => msg.content.includes(k)))) {
            steps.push(promptSteps[2]);
        }

        // 4. 如果用户有请求建议的关键词，加入生成报告
        const reportKeywords = ["生成报告", "给我建议"];
        if (conversationHistory.some(msg => msg.role === "user" && reportKeywords.some(k => msg.content.includes(k)))) {
            steps.push(promptSteps[4]);
        }

        // 5. 如果用户有危机词，加入危机干预
        const crisisKeywords = ["不想活", "没意义", "自杀"];
        if (conversationHistory.some(msg => msg.role === "user" && crisisKeywords.some(k => msg.content.includes(k)))) {
            steps.push(promptSteps[5]);
        }

        // 6. 对话条数较多时加入阶段性总结
        if (conversationHistory.filter(msg => msg.role === "user").length >= 5) {
            steps.push(promptSteps[6]);
        }

        // 7. 始终加入边界与禁忌
        steps.push(promptSteps[3]);

        return steps.join('\n\n');
    }

    function renderHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            if (msg.hidden) return;
            if (msg.role === "user") addMessage(msg.content, 'user');
            if (msg.role === "assistant") addMessage(msg.content, 'bot');
        });
    }

    function addMessage(text, sender, isTemp = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${isTemp ? 'temp-message' : ''}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    function replaceTempMessage(tempElement, newText) {
        tempElement.classList.remove('temp-message');
        tempElement.textContent = newText;
    }

    async function getTodayDiary() {
        if (localStorage.getItem('refreshDiaryCache') === '1') {
            todayDiaryCache = null;
            localStorage.removeItem('refreshDiaryCache');
        }
        if (todayDiaryCache !== null) return todayDiaryCache;
        const token = localStorage.getItem('token');
        if (!token) return null;
        const res = await fetch('/api/chat/today_diary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.diary) {
                todayDiaryCache = data.diary;
                return todayDiaryCache;
            }
            return null;
        }
        return null;
    }

    async function saveHistory() {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('/api/chat/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ history: conversationHistory.slice(1) })
        });
    }


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

    function pickRandomQuestions(questionArr, n) {
        let questions = [];
        if (Array.isArray(questionArr) && typeof questionArr[0] === "string") {
            questions = questionArr[0].split('\n').map(s => s.trim()).filter(s => /^\d+\./.test(s));
        } else {
            questions = questionArr;
        }
        const picked = [];
        const used = new Set();
        while (picked.length < n && used.size < questions.length) {
            const idx = Math.floor(Math.random() * questions.length);
            if (!used.has(idx)) {
                picked.push(questions[idx]);
                used.add(idx);
            }
        }
        return picked;
    }

async function sendWelcomeOrDiary() {
    const diary = await getTodayDiary();
    console.log('diary:', diary);
    const welcomeMsg = "你好呀！我是MindMate，你的心理健康助手。";
    addMessage(welcomeMsg, 'bot');
    conversationHistory.push({ role: "assistant", content: welcomeMsg });
    await saveHistory();

    let emotion = diary?.emotion || diary?.mood || "";
    if (diary) {
        let isPositive = (emotion === "开心" || emotion === "一般" || emotion === "happy" || emotion === "neutral");
        let selectedTest, scoreDesc;
        if (isPositive) {
            selectedTest = pickRandomQuestions(PHQpositive, 10);
            testType = "积极心理测评";
            scoreDesc = "0=从未 | 1=偶尔 | 2=经常 | 3=总是";
        } else {
            selectedTest = pickRandomQuestions(PHQ9negative, 10);
            testType = "消极心理测评";
            scoreDesc = "0=总是 | 1=经常 | 2=偶尔 | 3=从未";
        }
        testQuestions = selectedTest.map(q => {
            let qText = q.replace(/^\d+\.\s*/, '');
            return `${qText}（${scoreDesc}）`;
        });
        testAnswers = [];
        currentTestIndex = 0;
        testInProgress = true;
        addMessage("我已阅读你的日记，想为你定制一份心理健康小测评，请如实作答。", 'bot');
        setTimeout(() => {
            addMessage(testQuestions[currentTestIndex], 'bot');
        }, 800);
    }
}


        


    async function clearChatHistory() {
        if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) return;
        conversationHistory = [ { role: "system", content: promptSteps[0] } ];
        renderHistory();
        await saveHistory();
        await sendWelcomeOrDiary();
    }

    document.getElementById('generateReportBtn').addEventListener('click', generateReportAndGoto);
    document.getElementById('clearChatBtn').addEventListener('click', clearChatHistory);

    async function callAPI(userMessage, isHidden = false) {
        const API_URL = "/api/zhipu/chat";
        const diary = await getTodayDiary();
        let systemPrompt = getSystemPrompt();
        if (diary) {
            systemPrompt += `\n用户今天的日记内容如下：${diary.title || ''}。${diary.content || ''}。你可以结合这些内容更好地理解和关心用户。`;
        }
        const history = [{ role: "system", content: systemPrompt }, ...conversationHistory.slice(1)];
        history.push({ role: "user", content: userMessage });
        const recentHistory = history.slice(-10);

        try {
            const thinkingMsg = addMessage("思考中...", 'bot', true);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: recentHistory
                })
            });
            if (!response.ok) throw new Error(`请求失败: ${response.status}`);
            const data = await response.json();
            const aiResponseRaw = data.response;
            let aiResponse = aiResponseRaw;
            const thinkTag = '</think>';
            if (aiResponseRaw && aiResponseRaw.includes(thinkTag)) {
                aiResponse = aiResponseRaw.split(thinkTag).pop().trim();
            }
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


    

    // 主对话入口，支持测评阶段与普通对话
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        addMessage(messageText, 'user');
        chatInput.value = '';

        // 测评阶段
        if (testInProgress) {
            testAnswers.push(messageText);
            currentTestIndex++;
            if (currentTestIndex < testQuestions.length) {
                addMessage(testQuestions[currentTestIndex], 'bot');
            } else {
                testInProgress = false;
        
                const testSummary = `以下是用户完成${testType}心理测评的答案：${testAnswers.join('，')}`;
                // === 新增：将测评答案写入对话历史并保存 ===
                conversationHistory.push({ role: "user", content: testSummary });
                await saveHistory();
                // === 结束 ===
                await callAPI(`请根据以下测评答案为用户生成简要的心理健康分析和建议，用户选的总分越大从这个方向回答：${testSummary}`, true);
                addMessage("测评已完成，欢迎继续和我自由交流。", 'bot');
            }
            return;
        }

        // 普通对话
        await callAPI(messageText);

        // 关键词自动触发报告
        const triggerWords = ["生成报告", "给我建议", "测评报告", "心理报告"];
        if (triggerWords.some(word => messageText.includes(word))) {
            await generateReportAndGoto();
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    loadHistory();

    setTimeout(() => {
        if (!conversationHistory.some(msg => msg.role === "assistant")) {
            sendWelcomeOrDiary();
        }
    }, 500);

    // 报告生成函数（保持原有逻辑）
    async function generateReportAndGoto() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('请先登录');
            return;
        }
        const reportPrompt = `现在请你根据我们的对话，生成一份心理健康测评报告，并严格按照如下格式输出建议：
现在请你根据我们的对话，生成一份心理健康测评报告，并严格按照如下格式输出建议：
【情绪管理】：（你的建议内容，1-2句话，简明具体）
【情感调整】：（你的建议内容，1-2句话，简明具体）
【社交建议】：（你的建议内容，1-2句话，简明具体）
【运动建议】：（你的建议内容，1-2句话，简明具体）
`;
        conversationHistory.push({
            role: "user",
            content: reportPrompt,
            hidden: true
        });

        await callAPI(reportPrompt, true);
        await saveHistory();

        const res = await fetch('/api/generate_report', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const reportData = await res.json();
            localStorage.setItem('reportData', JSON.stringify(reportData));
            if (reportData && reportData._id) {
                window.location.href = `report.html?id=${reportData._id}`;
            } else {
                window.location.href = 'report.html';
            }
        } else {
            const data = await res.json();
            alert(data.msg || '生成报告失败');
        }
    }

    document.getElementById('generateReportBtn').addEventListener('click', generateReportAndGoto);

});

