// 心理测评报告功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载报告数据
    const reportData = loadReportData();
    renderReport(reportData);
    
    // 保存报告
    document.getElementById('save-report')?.addEventListener('click', function() {
        alert('报告已保存到您的账户中');
    });
    
    // 重新测试
    document.getElementById('retake-test')?.addEventListener('click', function() {
        if (confirm('确定要重新进行心理健康测试吗？')) {
            window.location.href = 'test.html'; // 假设有一个测试页面
        }
    });
});

function loadReportData() {
    // 模拟报告数据
    return {
        date: '2024-01-18 08:45',
        overallScore: 85,
        emotionScore: 78,
        stressScore: 82,
        socialScore: 90,
        trendData: [65, 70, 75, 80, 78, 82, 85],
        emotionData: {
            happy: 25,
            neutral: 40,
            sad: 15,
            angry: 10,
            anxious: 10
        },
        suggestions: [
            {
                title: '情绪管理',
                content: '建议通过冥想、深呼吸等方式来缓解压力，每天保持15-20分钟的放松练习。可以尝试使用专业的冥想APP来辅助练习。'
            },
            {
                title: '情感调整',
                content: '保持规律的作息时间，每天保证7-8小时的充足睡眠。睡前避免使用电子设备，创造良好的睡眠环境。'
            },
            {
                title: '社交建议',
                content: '可以适当参加一些社交活动，与朋友保持联系。建议每周至少安排1-2次与朋友见面或参加集体活动的时间。'
            },
            {
                title: '运动建议',
                content: '每周进行3-4次中等强度的运动，每次30-45分钟。可以选择慢跑、游泳或瑜伽等适合自己的运动方式。'
            }
        ]
    };
}

function renderReport(data) {
    // 设置报告日期
    document.getElementById('report-date').textContent = data.date;
    
    // 设置总体评分
    document.querySelector('.score-value').textContent = data.overallScore;
    
    // 设置各项评分
    document.querySelectorAll('.score-bar .bar-fill').forEach((bar, index) => {
        let width;
        switch (index) {
            case 0:
                width = data.emotionScore;
                bar.nextElementSibling.textContent = `${data.emotionScore}/100`;
                break;
            case 1:
                width = data.stressScore;
                bar.nextElementSibling.textContent = `${data.stressScore}/100`;
                break;
            case 2:
                width = data.socialScore;
                bar.nextElementSibling.textContent = `${data.socialScore}/100`;
                break;
        }
        bar.style.width = `${width}%`;
    });
    
    // 渲染图表
    renderCharts(data);
}

function renderCharts(data) {
    // 趋势图表
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['1月12日', '1月13日', '1月14日', '1月15日', '1月16日', '1月17日', '1月18日'],
            datasets: [{
                label: '心理健康指数',
                data: data.trendData,
                borderColor: '#5D9CEC',
                backgroundColor: 'rgba(93, 156, 236, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 100
                }
            }
        }
    });
    
    // 情绪图表
    const emotionCtx = document.getElementById('emotionChart').getContext('2d');
    new Chart(emotionCtx, {
        type: 'doughnut',
        data: {
            labels: ['开心', '一般', '难过', '生气', '焦虑'],
            datasets: [{
                data: [
                    data.emotionData.happy,
                    data.emotionData.neutral,
                    data.emotionData.sad,
                    data.emotionData.angry,
                    data.emotionData.anxious
                ],
                backgroundColor: [
                    '#48CFAD',
                    '#5D9CEC',
                    '#656D78',
                    '#FC6E51',
                    '#FFCE54'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}