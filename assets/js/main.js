// 全局功能
document.addEventListener('DOMContentLoaded', function() {
    // 退出功能（更新为新的头像下拉菜单中的退出按钮）
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    // 检查登录状态
    checkLoginStatus();
    
    // 更新导航栏活动状态
    updateNavActiveState();
    
    // 新增：更新用户状态显示
    updateUserStatus();
});


// 新增：统一退出函数
function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    window.location.href = 'index.html';
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const protectedPages = ['diary.html', 'calendar.html', 'chat.html', 'notifications.html', 'profile.html', 'whitenoise.html', 'report.html'];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    } else if (currentPage === 'login.html' || currentPage === 'register.html') {
        if (isLoggedIn) {
            window.location.href = 'index.html';
        }
    }
    
    // 显示用户名（更新为同时处理用户名和头像）
    const usernameElements = document.querySelectorAll('.username-display');
    if (usernameElements.length > 0 && isLoggedIn) {
        const username = localStorage.getItem('username') || '用户';
        usernameElements.forEach(el => {
            el.textContent = username;
        });
    }
}

function updateNavActiveState() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
}

// 更新用户状态显示
function updateUserStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('userProfileBtn');
    const usernameDisplay = document.querySelector('.profile-btn .username');

    if (isLoggedIn) {
        // 显示个人信息按钮，隐藏登录按钮
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'block';
        
        // 加载用户名
        const username = localStorage.getItem('username') || '用户';
        if (usernameDisplay) usernameDisplay.textContent = username;
    } else {
        // 显示登录按钮，隐藏个人信息按钮
        if (loginBtn) loginBtn.style.display = 'block';
        if (profileBtn) profileBtn.style.display = 'none';
    }
}

// 更新点击事件处理
document.addEventListener('click', function(e) {
    // 点击个人信息按钮外的区域关闭下拉菜单
    if (!e.target.closest('.profile-btn') && !e.target.closest('.profile-dropdown')) {
        const dropdowns = document.querySelectorAll('.profile-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
    
    // 处理个人信息按钮点击
    if (e.target.closest('.btn-profile')) {
        const dropdown = e.target.closest('.profile-btn').querySelector('.profile-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }
});

window.updateNotifDot = async function() {
    const token = localStorage.getItem('token');
    const dot = document.getElementById('notifDot');
    if (!dot) return;
    if (!token) {
        dot.style.display = 'none';
        return;
    }
    try {
        const res = await fetch('/api/notifications/unread_count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.unread_count > 0) {
                dot.style.display = 'inline-block';
                dot.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
            } else {
                dot.style.display = 'none';
            }
        } else {
            dot.style.display = 'none';
        }
    } catch (e) {
        dot.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (window.updateNotifDot) window.updateNotifDot();
});

// main.js 推荐写法
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('reportData');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('diary');
    localStorage.removeItem('notifications');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    // ...如有其它用户相关缓存也一并清理
    window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    logoutUser();
});