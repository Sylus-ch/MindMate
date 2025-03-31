// 登录功能
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 简单验证
            if (username && password) {
                // 模拟登录成功
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = 'diary.html';
            } else {
                alert('请输入用户名和密码');
            }
        });
    }
    
    // 注册功能
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value;
            const phone = document.getElementById('phone').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 简单验证
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            if (username && phone && age && gender && password) {
                // 模拟注册成功
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                
                // 保存用户信息
                const userInfo = {
                    username: username,
                    phone: phone,
                    age: age,
                    gender: gender
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                alert('注册成功！');
                window.location.href = 'diary.html';
            } else {
                alert('请填写所有必填字段');
            }
        });
    }
    
    // 忘记密码功能
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('请通过注册手机号找回密码，验证码已发送至您的手机。');
        });
    }
});