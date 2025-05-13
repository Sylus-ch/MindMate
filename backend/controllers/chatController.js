const EmotionService = require('../services/emotionService');
const TestGenerator = require('../services/testGenerator');
const { Conversation } = require('../models');
const axios = require('axios');
require('dotenv').config();

class ChatController {
    async processMessage(req, res) {
        const { message, userId } = req.body;

        try {
            // 1. 保存消息到对话历史
            const conversation = await Conversation.findOneAndUpdate(
                { userId },
                { $push: { messages: { content: message, role: 'user' } } },
                { new: true, upsert: true }
            );

            // 2. 情绪分析
            const emotionAnalysis = await EmotionService.analyzeText(message);

            // 3. 生成心理测试(如果需要)
            const test = await TestGenerator.generateTest(
                emotionAnalysis,
                conversation.messages
            );

            // 4. 调用GLM API生成回复
            const aiResponse = await this.generateAIResponse(
                message,
                conversation.messages,
                emotionAnalysis,
                test
            );

            // 5. 更新对话历史
            await Conversation.updateOne(
                { userId },
                { $push: { messages: { content: aiResponse, role: 'assistant' } } }
            );

            // 6. 调用大模型推荐资源
            const resources = await this.getRecommendedResources(
                conversation.messages,
                emotionAnalysis
            );

            res.json({
                response: aiResponse,
                emotion: emotionAnalysis.dominantEmotion || 'neutral',
                test,
                resources
            });

        } catch (error) {
            console.error('Error processing message:', error);
            res.status(500).json({ error: 'Failed to process message' });
        }
    }

    async generateAIResponse(message, history, emotionAnalysis, test) {
        const API_KEY = process.env.GLM_API_KEY;
        const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

        const prompt = this.buildPrompt(message, history, emotionAnalysis, test);

        try {
            const response = await axios.post(API_URL, {
                model: "GLM-4-Flash-250414",
                messages: [
                    { role: "system", content: "你是一个心理健康助手MindMate。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('调用GLM API时出错:', error.message);
            return "抱歉，我暂时无法提供帮助，请稍后再试。";
        }
    }

    buildPrompt(message, history, emotionAnalysis, test) {
        let prompt = `你是一个心理健康助手MindMate。用户当前情绪状态: ${emotionAnalysis.dominantEmotion || 'neutral'}。`;

        if (test) {
            prompt += ` 用户可能需要${test.title}评估。`;
        }

        prompt += ` 对话历史:\n${JSON.stringify(history.slice(-3))}\n\n用户最新消息: ${message}\n\n请生成有帮助的回复:`;

        return prompt;
    }

    async getRecommendedResources(history, emotionAnalysis) {
        const API_KEY = process.env.GLM_API_KEY;
        const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

        const prompt = `你是一个心理健康助手MindMate。根据用户的情绪状态 (${emotionAnalysis.dominantEmotion || 'neutral'}) 和以下对话历史，推荐一些适合用户的心理健康资源（如文章、活动、练习等）。请提供具体的建议：\n\n对话历史:\n${JSON.stringify(history.slice(-3))}`;

        try {
            const response = await axios.post(API_URL, {
                model: "GLM-4-Flash-250414",
                messages: [
                    { role: "system", content: "你是一个心理健康助手，专注于为用户推荐心理健康资源。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('调用GLM API推荐资源时出错:', error.message);
            return "抱歉，我暂时无法推荐资源，请稍后再试。";
        }
    }
}

module.exports = new ChatController();