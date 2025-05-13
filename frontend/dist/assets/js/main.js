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

// 新增：更新用户状态显示（登录按钮/头像切换）
function updateUserStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatar');
    const avatarImg = document.getElementById('avatarImg');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (isLoggedIn) {
        // 显示头像，隐藏登录按钮
        if (loginBtn) loginBtn.style.display = 'none';
        if (userAvatar) userAvatar.style.display = 'block';
        
        // 加载用户信息
        const username = localStorage.getItem('username') || '用户';
        const savedAvatar = localStorage.getItem('userAvatar');
        
        if (usernameDisplay) usernameDisplay.textContent = username;
        if (avatarImg) {
        avatarImg.src = '/assets/images/default-avatar.png';
        }

    } else {
        // 显示登录按钮，隐藏头像
        if (loginBtn) loginBtn.style.display = 'block';
        if (userAvatar) userAvatar.style.display = 'none';
    }
}

// 新增：头像点击事件委托（处理动态生成的元素）
document.addEventListener('click', function(e) {
    // 点击头像外的区域关闭下拉菜单
    if (!e.target.closest('.user-avatar') && !e.target.closest('.user-dropdown')) {
        const dropdowns = document.querySelectorAll('.user-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
    
    // 处理头像点击
    if (e.target.closest('.user-avatar')) {
        const dropdown = e.target.closest('.user-avatar').querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }
});
