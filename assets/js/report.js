// 心理测评报告功能

function getReportIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener('DOMContentLoaded', async function() {
    const reportId = getReportIdFromUrl();
    let reportData;

    if (reportId) {
        // 如果有id参数，则从后端获取对应报告
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/report/${reportId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.report) {
                reportData = data.report;
            } else {
                alert(data.msg || '报告加载失败');
                reportData = loadReportData(); // 回退到本地
            }
        } catch (e) {
            alert('网络错误，无法加载报告');
            reportData = loadReportData();
        }
    } else {
        // 没有id参数，加载本地数据
        reportData = loadReportData();
    }

    renderReport(reportData);

    // 保存报告
    document.getElementById('save-report')?.addEventListener('click', function() {
        alert('报告已保存到您的账户中');
    });

    // 重新测试
    document.getElementById('retake-test')?.addEventListener('click', function() {
        if (confirm('确定要重新进行心理健康测试吗？')) {
            window.location.href = 'chat.html'; 
        }
    });
});

function loadReportData() {
    const data = localStorage.getItem('reportData');
    if (data) {
        return JSON.parse(data);
    }
    // 没有本地数据时返回空对象，防止报错
    return {};
}

function renderReport(data) {
    // 设置报告日期
    document.getElementById('report-date').textContent = data.date || '';

    // 设置总体评分
    document.getElementById('overall-score').textContent = data.overallScore || '';

    // 总体评分描述（可根据分数自定义）
    document.getElementById('score-description').textContent = getScoreDesc(data.overallScore);

    // 各项分数
    setBar('emotion', data.emotionScore);
    setBar('stress', data.stressScore);
    setBar('social', data.socialScore);

    // 渲染图表
    if (data.trendData && data.trendData.length) renderCharts(data);

    // 渲染建议
    const suggestionList = document.getElementById('suggestion-list');
    if (suggestionList && data.suggestions) {
        suggestionList.innerHTML = '';
        data.suggestions.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.title}：</strong>${item.content}`;
            suggestionList.appendChild(li);
        });
    }
}

function setBar(type, score) {
    document.getElementById(`${type}-bar`).style.width = (score || 0) + '%';
    document.getElementById(`${type}-score`).textContent = (score !== undefined ? score : '') + '/100';
    // 你可以根据分数自定义描述
    let desc = '';
    if (score >= 85) desc = '非常优秀';
    else if (score >= 70) desc = '良好';
    else if (score >= 60) desc = '一般';
    else desc = '需关注';
    document.getElementById(`${type}-text`).textContent = desc;
}

function getScoreDesc(score) {
    if (score === undefined) return '';
    if (score >= 85) return '心理健康状况非常优秀';
    if (score >= 70) return '心理健康状况良好';
    if (score >= 60) return '心理健康状况一般';
    return '心理健康状况需关注';
}

function renderCharts(data) {
    // 趋势图表
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
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
                    data.emotionData?.happy || 0,
                    data.emotionData?.neutral || 0,
                    data.emotionData?.sad || 0,
                    data.emotionData?.angry || 0,
                    data.emotionData?.anxious || 0
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