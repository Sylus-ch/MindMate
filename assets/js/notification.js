// 通知中心功能
document.addEventListener('DOMContentLoaded', async function() {
    // 获取通知数据（从后端接口）
    const notifications = await fetchNotifications();

    // 渲染通知列表
    renderNotifications(notifications);

    // 筛选功能
    document.getElementById('filter-type')?.addEventListener('change', function() {
        const type = this.value;
        const filtered = type === 'all' ? notifications : notifications.filter(n => n.type === type);
        renderNotifications(filtered);
    });
});

// 从后端获取通知
async function fetchNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            return data.notifications || [];
        }
    } catch (e) {
        console.error('获取通知失败', e);
    }
    return [];
}

function renderNotifications(notifications) {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    notificationList.innerHTML = '';
    notifications.forEach(notification => {
        const item = document.createElement('li');
        item.classList.add('notification-item');
        // 高亮测试报告通知
        if (notification.type === '测试报告' || notification.title?.includes('报告')) {
            item.classList.add('highlight-report');
        }
        item.innerHTML = `
            <div class="notification-icon">${notification.type || ''}</div>
            <div class="notification-content">
                <h3 class="notification-title">${notification.title || notification.type}</h3>
                <p class="notification-date">${notification.date || notification.created_at || ''}</p>
                <p class="notification-message">${notification.message || notification.content || ''}</p>
            </div>
        `;
        // 跳转到 link
        if (notification.link) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                window.location.href = notification.link;
            });
        }
        notificationList.appendChild(item);
    });
}