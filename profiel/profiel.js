document.addEventListener('DOMContentLoaded', function() {
    // 显示用户信息
    const username = localStorage.getItem('username') || '未登录';
    document.getElementById('profileUsername').textContent = username;

    // 头像上传
    const avatarUpload = document.getElementById('avatarUpload');
    const profileAvatar = document.getElementById('profileAvatar');
    const savedAvatar = localStorage.getItem('userAvatar');

    if (savedAvatar) {
        profileAvatar.src = savedAvatar;
    }

    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profileAvatar.src = event.target.result;
                localStorage.setItem('userAvatar', event.target.result);
                // 同步更新首页头像
                if (window.opener) {
                    window.opener.updateUserStatus();
                }
            };
            reader.readAsDataURL(file);
        }
    });
    

});