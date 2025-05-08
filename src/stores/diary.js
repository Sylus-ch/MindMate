// 心情日记功能
document.addEventListener('DOMContentLoaded', function() {
    // 选择心情
    const moodButtons = document.querySelectorAll('.mood-options button');
    let selectedMood = '';
    
    moodButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            moodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    // 保存日记
    const diaryForm = document.getElementById('diaryForm');
    if (diaryForm) {
        diaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('diaryTitle').value;
            const content = document.getElementById('diaryContent').value;
            
            if (!selectedMood) {
                alert('请选择今天的心情');
                return;
            }
            
            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }
            
            // 获取当前日期
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            // 保存日记数据
            let diaries = JSON.parse(localStorage.getItem('diaries')) || [];
            diaries.push({
                date: dateStr,
                mood: selectedMood,
                title: title,
                content: content
            });
            localStorage.setItem('diaries', JSON.stringify(diaries));
            
            alert('日记保存成功！');
            window.location.href = 'calendar.html';
        });
    }
    
    // 加载已有的日记数据
    loadDiaryData();
});

function loadDiaryData() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    
    if (date) {
        const diaries = JSON.parse(localStorage.getItem('diaries')) || [];
        const diary = diaries.find(d => d.date === date);
        
        if (diary) {
            document.getElementById('diaryTitle').value = diary.title;
            document.getElementById('diaryContent').value = diary.content;
            
            // 设置心情
            const moodBtn = document.querySelector(`.mood-options button[data-mood="${diary.mood}"]`);
            if (moodBtn) {
                moodBtn.click();
            }
        }
    }
}