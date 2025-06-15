// 登录功能（对接真实后端）
document.addEventListener('DOMContentLoaded', function() {
    // ==================== 登录处理 ====================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // 基础验证
            if (!username || !password) {
                showAlert('请输入用户名和密码', 'error');
                return;
            }

            try {
                // 调用真实登录接口
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.msg || '登录失败');
                }

                // 登录成功处理
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // 跳转时清除URL参数
                window.location.href = 'index.html';

            } catch (error) {
                showAlert(error.message || '登录失败，请检查网络连接', 'error');
                console.error('登录错误:', error);
            }
        });
    }

    // ==================== 注册处理 ====================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('regUsername').value,
                phone: document.getElementById('phone').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                password: document.getElementById('regPassword').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            // 客户端验证
            if (formData.password !== formData.confirmPassword) {
                showAlert('两次输入的密码不一致', 'error');
                return;
            }

            if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
                showAlert('请输入有效的手机号', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        phone: formData.phone,
                        age: parseInt(formData.age),
                        gender: formData.gender
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.msg || '注册失败');
                }

                // 存储完整的用户数据（包含默认值）
                localStorage.setItem('userData', JSON.stringify(data.user));

                showAlert('注册成功，即将跳转到登录页面', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                showAlert(error.message || '注册失败，请检查输入信息', 'error');
                console.error('注册错误:', error);
            }
        });
    }

    // ==================== 忘记密码 ====================
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', async function(e) {
            e.preventDefault();
            const phone = prompt('请输入注册手机号：');
            
            if (!phone) return;

            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone: phone })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.msg || '验证码发送失败');
                }

                const code = prompt('请输入收到的验证码：');
                if (!code) return;

                // 验证验证码并重置密码
                const newPassword = prompt('请输入新密码：');
                if (!newPassword) return;

                const resetResponse = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: phone,
                        code: code,
                        new_password: newPassword
                    })
                });

                const resetData = await resetResponse.json();
                
                if (!resetResponse.ok) {
                    throw new Error(resetData.msg || '密码重置失败');
                }

                showAlert('密码重置成功，请重新登录', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                showAlert(error.message || '操作失败，请稍后重试', 'error');
                console.error('密码重置错误:', error);
            }
        });
    }

    // ==================== 辅助函数 ====================
    function showAlert(message, type = 'info') {
        const alertBox = document.createElement('div');
        alertBox.className = `alert ${type}`;
        alertBox.textContent = message;
        
        document.body.appendChild(alertBox);
        
        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    }
});

// ==================== 全局登出功能 ====================
function logoutUser() {
    const token = localStorage.getItem('token');
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(() => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('登出失败:', error);
    });
}