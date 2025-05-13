const { KnowledgeBase } = require('../models');
const EmotionService = require('./emotionService');
const axios = require('axios'); // 引入axios库
require('dotenv').config(); // 加载环境变量

class TestGenerator {
    constructor() {
        this.testTemplates = {
            depression: {
                title: "抑郁情绪评估",
                questions: [
                    "过去两周，您感到情绪低落、沮丧或绝望的频率是？",
                    "您对日常活动失去兴趣或乐趣的程度如何？"
                ],
                options: ["几乎没有", "几天", "一半以上天数", "几乎每天"]
            },
            anxiety: {
                title: "焦虑水平测试",
                questions: [
                    "您感到不安、担心或烦躁的频率是？",
                    "您难以停止或控制担忧的程度如何？"
                ],
                options: ["从不", "偶尔", "经常", "几乎总是"]
            }
        };
    }

    async generateTest(emotionAnalysis, conversationHistory) {
        const { dominantEmotion } = emotionAnalysis;
        
        // 根据主导情绪选择测试模板
        let testType;
        if (['sad', 'depressed'].includes(dominantEmotion)) {
            testType = 'depression';
        } else if (['anxious', 'stressed'].includes(dominantEmotion)) {
            testType = 'anxiety';
        } else {
            return null; // 不需要测试
        }
        
        const template = this.testTemplates[testType];
        
        // 使用AI增强测试问题
        const enhancedQuestions = await this.enhanceQuestionsWithAI(
            template.questions, 
            conversationHistory
        );
        
        return {
            ...template,
            questions: enhancedQuestions,
            emotion: dominantEmotion
        };
    }

    async enhanceQuestionsWithAI(questions, context) {
        const prompt = `基于以下对话上下文，请改进这些心理测试问题，使其更贴合用户情况：
        
        上下文: ${JSON.stringify(context.slice(-3))}
        
        原始问题: ${questions.join('\n')}
        
        请返回改进后的问题数组，保持相同数量:`;

        const API_KEY = process.env.GLM_API_KEY;
        const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

        try {
            const response = await axios.post(API_URL, {
                model: "GLM-4-Flash-250414",
                messages: [
                    { role: "system", content: "你是一个帮助改进心理测试问题的助手。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const enhancedQuestions = JSON.parse(response.data.choices[0].message.content);
            return enhancedQuestions;
        } catch (error) {
            console.error('调用GLM API时出错:', error.message);
            return questions;
        }
    }
}

module.exports = new TestGenerator();