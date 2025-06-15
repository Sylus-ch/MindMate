// 心情日记功能（支持图片上传和多语言、语音识别）
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL中的日期参数
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date') || getCurrentDateString();

    // 显示当前编辑的日期
    displayCurrentDate(selectedDate);

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

    // 图片预览功能
    const imageInput = document.getElementById('diaryImages');
    const imagePreview = document.getElementById('imagePreview');
    let selectedImages = [];
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            imagePreview.innerHTML = '';
            selectedImages = [];
            const files = Array.from(this.files).slice(0, 3); // 限制最多3张
            if (files.length > 3) {
                alert('最多只能上传3张图片');
                this.value = '';
                return;
            }
            files.forEach(file => {
                if (!file.type.match('image.*')) return;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-image';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    // 添加删除按钮
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-image';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.addEventListener('click', () => {
                        imgContainer.remove();
                        selectedImages = selectedImages.filter(f => f !== file);
                        imageInput.value = ''; // 重置input以便重新选择
                    });
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(deleteBtn);
                    imagePreview.appendChild(imgContainer);
                    selectedImages.push(file);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // 保存日记
    const diaryForm = document.getElementById('diaryForm');
    if (diaryForm) {
        diaryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('diaryTitle').value;
            const content = document.getElementById('diaryContent').value;
            const language = document.getElementById('language').value;
            if (!selectedMood) {
                alert('请选择今天的心情');
                return;
            }
            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }
            // 保存日记数据（包含图片上传）
            await saveDiaryData(selectedDate, selectedMood, title, content, language, selectedImages);
        });
    }

    // 加载已有日记数据（包含图片）
    loadDiaryData(selectedDate);

    // 语音识别功能
    const voiceBtn = document.getElementById('voiceInputBtn');
    const contentInput = document.getElementById('diaryContent');
    let recognition;
    if (voiceBtn && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        voiceBtn.addEventListener('click', function() {
            voiceBtn.disabled = true;
            voiceBtn.textContent = '🎤 识别中...';
            recognition.start();
        });
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            contentInput.value += transcript;
        };
        recognition.onerror = function() {
            alert('语音识别失败，请重试');
        };
        recognition.onend = function() {
            voiceBtn.disabled = false;
            voiceBtn.textContent = '🎤';
        };
    } else if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.title = '当前浏览器不支持语音识别';
    }
});

// 获取当前日期字符串（YYYY-MM-DD格式）
function getCurrentDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 显示当前编辑的日期
function displayCurrentDate(dateStr) {
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        const dateObj = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateDisplay.textContent = dateObj.toLocaleDateString('zh-CN', options);
    }
}

// 保存日记（支持图片上传和多语言）
async function saveDiaryData(date, mood, title, content, language, images = []) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未登录或会话已过期');
        }
        const formData = new FormData();
        formData.append('date', date);
        formData.append('mood', mood);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('language', language);
        images.forEach((file) => {
            formData.append('images', file);
        });
        const response = await fetch('/api/diaries', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // 不要设置Content-Type，浏览器会自动设置
            },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || '保存失败');
        }
        // 保存成功后弹窗确认，用户点击确定后跳转
        if (window.confirm('日记保存成功！是否返回日历页面？')) {
            window.location.href = 'calendar.html';
        }
    } catch (error) {
        alert(error.message || '保存失败，请稍后重试');
        console.error('保存错误:', error);
    }
}

// 加载日记（支持图片显示和多语言）
async function loadDiaryData(date) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`/api/diaries/${date}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok && data.diary) {
            const diary = data.diary;
            document.getElementById('diaryTitle').value = diary.title || '';
            document.getElementById('diaryContent').value = diary.content || '';
            if (diary.language) {
                document.getElementById('language').value = diary.language;
            }
            const moodBtn = document.querySelector(`.mood-options button[data-mood="${diary.mood}"]`);
            if (moodBtn) moodBtn.click();
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview && diary.images && diary.images.length > 0) {
                imagePreview.innerHTML = '';
                diary.images.forEach(imgUrl => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-image';
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    imgContainer.appendChild(img);
                    imagePreview.appendChild(imgContainer);
                });
            }
        }
    } catch (error) {
        console.error('加载日记错误:', error);
    }
}

