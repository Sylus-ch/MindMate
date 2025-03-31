// 个人资料功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载用户信息
    loadUserInfo();
    
    // 保存个人信息
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const phone = document.getElementById('phone').value;
            const bio = document.getElementById('bio').value;
            
            // 保存用户信息
            const userInfo = {
                username: username,
                age: age,
                gender: gender,
                phone: phone,
                bio: bio
            };
            
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            localStorage.setItem('username', username);
            
            alert('个人信息保存成功！');
        });
    }
});

function loadUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    
    document.getElementById('username')?.value = userInfo.username || '';
    document.getElementById('age')?.value = userInfo.age || '';
    document.getElementById('gender')?.value = userInfo.gender || '';
    document.getElementById('phone')?.value = userInfo.phone || '';
    document.getElementById('bio')?.value = userInfo.bio || '';
}