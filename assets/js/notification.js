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
        // 标题（AI系统通知没有title时显示type）
        let titleHtml = '';
        if (notification.title) {
            titleHtml = `<h3 class="notification-title">${notification.title}</h3>`;
        } else if (notification.type) {
            titleHtml = `<h3 class="notification-title">${notification.type}</h3>`;
        }
        item.innerHTML = `
            <div class="notification-icon">${notification.type || ''}</div>
            <div class="notification-content">
                ${titleHtml}
                <p class="notification-date">${notification.date || notification.created_at || ''}</p>
                <p class="notification-message">${notification.content || notification.message || ''}</p>
            </div>
        `;
        // 跳转按钮分类
        if (notification.type === '安全提醒') {
            // 不显示按钮
        } else if (notification.type === '测试报告' || notification.title?.includes('报告')) {
            // 测试报告，跳转到 report.html
            const btn = document.createElement('a');
            btn.className = 'notif-link-btn';
            // 若有 reportId，拼接参数，否则跳转到 report.html
            if (notification.link && notification.link.startsWith('/report/')) {
                // 假设 link 格式为 /report/xxxx
                const reportId = notification.link.split('/').pop();
                btn.href = `report.html?id=${reportId}`;
            } else {
                btn.href = 'report.html';
            }
            btn.innerText = '去查看';
            item.querySelector('.notification-content').appendChild(btn);
        } else if (notification.type === '日记记录提醒') {
            // 日记记录提醒，跳转到 calendar.html
            const btn = document.createElement('a');
            btn.className = 'notif-link-btn';
            btn.href = 'calendar.html';
            btn.innerText = '去记录';
            item.querySelector('.notification-content').appendChild(btn);
        } else if (notification.type === '系统通知') {
            // 系统通知，跳转到 chat.html
            const btn = document.createElement('a');
            btn.className = 'notif-link-btn';
            btn.href = 'chat.html';
            btn.innerText = '去聊天';
            item.querySelector('.notification-content').appendChild(btn);
        }

        // === 新增：点击时标记为已读 ===
        item.addEventListener('click', async function() {
            if (!notification.read) {
                const token = localStorage.getItem('token');
                await fetch(`/api/notifications/read/${notification._id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // 刷新红点
                if (window.updateNotifDot) window.updateNotifDot();
            }
        });


        notificationList.appendChild(item);
    });
}

