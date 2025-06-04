document.addEventListener('DOMContentLoaded', function() {
    // 默认值配置
    const DEFAULT_VALUES = {
        username: '未设置',
        age: 18,
        gender: 'other',
        phone: '',
        bio: '这个人很懒，什么都没写'
    };

    // 从本地存储获取用户数据
    let userData = JSON.parse(localStorage.getItem('userData')) || {};
    
    // 初始化表单数据
    function initForm() {
        document.getElementById('profileUsername').value = userData.username || DEFAULT_VALUES.username;
        document.getElementById('profileAge').value = userData.age || DEFAULT_VALUES.age;
        document.getElementById('profileGender').value = userData.gender || DEFAULT_VALUES.gender;
        document.getElementById('profilePhone').value = userData.phone || DEFAULT_VALUES.phone;
        document.getElementById('profileBio').value = userData.bio || DEFAULT_VALUES.bio;
    }

    initForm();

    // 添加修改用户名按钮事件
    const changeUsernameBtn = document.getElementById('changeUsernameBtn');
    if (changeUsernameBtn) {
        changeUsernameBtn.addEventListener('click', function() {
            const newUsername = prompt('请输入新的用户名:', userData.username || '');
            if (newUsername && newUsername !== userData.username) {
                document.getElementById('profileUsername').value = newUsername;
            }
        });
    }

    // 表单提交处理
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 确认修改提示
            const isConfirmed = confirm('确定要保存这些修改吗？');
            if (!isConfirmed) return;

            const formData = {
                username: document.getElementById('profileUsername').value,
                age: document.getElementById('profileAge').value,
                gender: document.getElementById('profileGender').value,
                phone: document.getElementById('profilePhone').value,
                bio: document.getElementById('profileBio').value
            };

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('未登录或会话已过期');
                }

                // 显示加载状态
                const submitBtn = document.querySelector('#profileForm button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = '保存中...';

                const response = await fetch('/api/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || '更新失败');
                }

                // 更新本地存储的用户数据
                userData = {...userData, ...formData};
                localStorage.setItem('userData', JSON.stringify(userData));

                alert('个人信息更新成功');

                // 同步更新首页显示
                if (window.opener) {
                    window.opener.updateUserStatus();
                }
            } catch (error) {
                alert(error.message || '更新失败，请稍后重试');
                console.error('更新错误:', error);
            } finally {
                // 恢复按钮状态
                const submitBtn = document.querySelector('#profileForm button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '保存';
                }
            }
        });
    }
});