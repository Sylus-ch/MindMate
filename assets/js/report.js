function getReportIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener('DOMContentLoaded', async function() {
    const reportId = getReportIdFromUrl();
    let reportData;

    if (reportId) {
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
                reportData = loadReportData();
            }
        } catch (e) {
            alert('网络错误，无法加载报告');
            reportData = loadReportData();
        }
    } else {
        reportData = loadReportData();
    }

    renderReport(reportData);

    document.getElementById('save-report')?.addEventListener('click', function() {
        alert('报告已保存到您的账户中');
    });

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
    return {};
}

function renderReport(data) {
    document.getElementById('report-date').textContent = data.date || '';

    // 支持9题（PHQ-9）和10题自定义测评
    let html = '';
    if (data.test_answers && Array.isArray(data.test_answers)) {
        let total = 0;
        for (let i = 0; i < data.test_answers.length; i++) {
            total += Number(data.test_answers[i]);
        }
        if (data.test_answers.length === 9) {
            let level = '';
            if (total <= 4) level = '无抑郁';
            else if (total <= 9) level = '轻度抑郁';
            else if (total <= 14) level = '中度抑郁';
            else if (total <= 19) level = '中重度抑郁';
            else level = '重度抑郁';
            html = `<div class="report-section"><h2>本次PHQ-9测评结果</h2>
                <p><strong>PHQ-9总分：</strong>${total}，<strong>等级：</strong>${level}</p></div>`;
        } else if (data.test_answers.length === 10) {
            html = `<div class="report-section"><h2>本次心理测评结果</h2>
                <p><strong>测评总分：</strong>${total} / 30</p>
                <p>分数越高，代表该心理特征越明显，仅供自我参考。</p></div>`;
        } else if (data.test_answers.length > 0) {
            html = `<div class="report-section"><h2>本次心理测评结果</h2>
                <p><strong>测评总分：</strong>${total}</p></div>`;
        }
        document.getElementById('phq9-answers-block').innerHTML = html;
    } else {
        document.getElementById('phq9-answers-block').innerHTML = '';
    }

    // 总体评分
    document.getElementById('overall-score').textContent = data.overallScore || '';
    document.getElementById('score-description').textContent = getScoreDesc(data.overallScore);

    // 趋势图
    if (data.trendData && data.trendData.length) renderCharts(data);


    // 专业建议
    let aiSuggestion = '';
    if (data.history && Array.isArray(data.history)) {
        for (let i = data.history.length - 1; i >= 0; i--) {
            const msg = data.history[i];
            if (msg.role === 'assistant' && /【情绪管理】/.test(msg.content)) {
                aiSuggestion = msg.content;
                break;
            }
        }
    }
    if (!aiSuggestion) {
        const local = localStorage.getItem('chatHistory');
        if (local) {
            const history = JSON.parse(local);
            for (let i = history.length - 1; i >= 0; i--) {
                const msg = history[i];
                if (msg.role === 'assistant' && /【情绪管理】/.test(msg.content)) {
                    aiSuggestion = msg.content;
                    break;
                }
            }
        }
    }
    if (aiSuggestion) {
        document.getElementById('ai-suggestion-block').style.display = '';
        document.getElementById('ai-suggestion-content').textContent = aiSuggestion;
        document.getElementById('suggestion-list').style.display = 'none';
    } else if (data.suggestions && data.suggestions.length) {
        document.getElementById('ai-suggestion-block').style.display = 'none';
        const sugList = document.getElementById('suggestion-list');
        sugList.style.display = '';
        sugList.innerHTML = '';
        data.suggestions.forEach(item => {
            sugList.innerHTML += `<li><strong>${item.title}：</strong>${item.content}</li>`;
        });
    }
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
}