// 通知中心功能
document.addEventListener('DOMContentLoaded', function() {
    // 模拟通知数据
    const notifications = [
        {
            type: 'system',
            title: '系统维护通知',
            date: '2024-01-18 10:30',
            message: '尊敬的用户，系统将于今晚23:00-次日02:00进行所有维护升级，期间部分功能可能暂时无法使用，请提前做好相关安排。'
        },
        {
            type: 'security',
            title: '异地登录提醒',
            date: '2024-01-17 14:20',
            message: '您的账号于今日14:20在北京市登录，如非本人操作，请及时将数据转开后重新认证。'
        },
        {
            type: 'health',
            title: '为您推荐一篇心理疏导文章',
            date: '2024-01-18 09:30',
            message: '根据您最近的情绪状态，我们为您推荐了一篇心理疏导文章，点击查看详情。'
        },
        {
            type: 'system',
            title: '您的心理健康测试报告已生成！',
            date: '2024-01-18 08:45',
            message: '您最近完成的心理健康测试报告已经生成，点击查看详细结果和建议。'
        },
        {
            type: 'health',
            title: '今天的心情如何？',
            date: '2024-01-18 08:00',
            message: '别忘了记录今天的心情哦！点击这里开始记录，帮助我们更好地了解您的情绪变化。'
        },
        {
            type: 'health',
            title: '你最近心情不好吗，是否需要帮助？',
            date: '2024-01-17 16:30',
            message: '我们注意到您最近的情绪有些波动，你想要和mindmate聊聊天吗，点击这里开始聊天。'
        }
    ];
    
    // 渲染通知列表
    renderNotifications(notifications);
    
    // 筛选功能
    document.getElementById('filter-type')?.addEventListener('change', function() {
        const type = this.value;
        const filtered = type === 'all' ? notifications : notifications.filter(n => n.type === type);
        renderNotifications(filtered);
    });
});

function renderNotifications(notifications) {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    notifications.forEach(notification => {
        const item = document.createElement('li');
        item.classList.add('notification-item');
        
        let iconClass = '';
        switch (notification.type) {
            case 'system':
                iconClass = 'system';
                break;
            case 'security':
                iconClass = 'security';
                break;
            case 'health':
                iconClass = 'health';
                break;
        }
        
        item.innerHTML = `
            <div class="notification-icon ${iconClass}">●</div>
            <div class="notification-content">
                <h3 class="notification-title">${notification.title}</h3>
                <p class="notification-date">${notification.date}</p>
                <p class="notification-message">${notification.message}</p>
            </div>
        `;
        
        notificationList.appendChild(item);
    });
}