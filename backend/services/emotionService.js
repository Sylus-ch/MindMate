const natural = require('natural');
const sentiment = require('sentiment');
const { Emotion } = require('../models');

class EmotionService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.analyzer = new sentiment();
        this.emotionKeywords = {
            happy: ['开心', '高兴', '快乐', '幸福'],
            sad: ['难过', '伤心', '悲伤', '抑郁'],
            angry: ['生气', '愤怒', '恼火', '烦躁'],
            anxious: ['焦虑', '紧张', '担心', '害怕']
        };
    }

    async analyzeText(text) {
        // 基础情感分析
        const sentimentResult = this.analyzer.analyze(text);
        
        // 关键词分析
        const tokens = this.tokenizer.tokenize(text);
        const detectedEmotions = {};
        
        for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
            detectedEmotions[emotion] = keywords.some(keyword => 
                tokens.includes(keyword)
            );
        }

        // 综合结果
        return {
            sentimentScore: sentimentResult.score,
            detectedEmotions,
            dominantEmotion: this.getDominantEmotion(sentimentResult, detectedEmotions)
        };
    }

    getDominantEmotion(sentimentResult, detectedEmotions) {
        if (sentimentResult.score > 3) return 'happy';
        if (sentimentResult.score < -3) return 'sad';

        for (const [emotion, detected] of Object.entries(detectedEmotions)) {
            if (detected) return emotion;
        }

        return 'neutral';
    }
}

module.exports = new EmotionService();