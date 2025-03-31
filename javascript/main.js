// 全局功能
document.addEventListener('DOMContentLoaded', function() {
    // 退出功能
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }
    
    // 检查登录状态
    checkLoginStatus();
    
    // 更新导航栏活动状态
    updateNavActiveState();
});

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
            window.location.href = 'diary.html';
        }
    }
    
    // 显示用户名
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