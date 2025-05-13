document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // 初始化表单 - 修正ID以匹配HTML
    const usernameInput = document.getElementById('profileUsername');
    const ageInput = document.getElementById('age'); // 改为age
    const genderInput = document.getElementById('gender'); // 改为gender
    const phoneInput = document.getElementById('phone'); // 改为phone
    const bioInput = document.getElementById('bio'); // 改为bio
    const saveBtn = document.getElementById('saveProfile');
    const toast = document.getElementById('profile-toast');

    // 显示弹窗
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 获取用户信息
    try {
        const res = await fetch('/api/user/info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await res.json();
        if (res.ok && data.user) {
            const { username, age, gender, phone, bio } = data.user;
            usernameInput.value = username || '';
            ageInput.value = age || '';
            genderInput.value = gender || '';
            phoneInput.value = phone || '';
            bioInput.value = bio || '';
        } else {
            showToast(data.msg || '加载失败');
        }
    } catch (err) {
        showToast('加载用户信息出错');
    }

    // 保存信息
    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const updatedData = {
            username: usernameInput.value,
            age: ageInput.value,
            gender: genderInput.value,
            phone: phoneInput.value,
            bio: bioInput.value
        };

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(updatedData)
            });

            const data = await res.json();
            if (res.ok) {
                showToast('保存成功！');
            } else {
                showToast(data.msg || '保存失败');
            }
        } catch (err) {
            showToast('保存出错');
        }
    });
});