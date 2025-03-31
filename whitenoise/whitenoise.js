// 白噪音功能
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const volumeControl = document.getElementById('volume');
    const durationSelect = document.getElementById('duration');
    let currentSound = null;
    let timer = null;
    
    // 设置音量
    volumeControl.addEventListener('input', function() {
        audioPlayer.volume = this.value;
    });
    
    // 设置定时关闭
    durationSelect.addEventListener('change', function() {
        const minutes = parseInt(this.value);
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        
        if (minutes > 0 && audioPlayer.src) {
            timer = setTimeout(() => {
                audioPlayer.pause();
                resetPlayButtons();
            }, minutes * 60 * 1000);
        }
    });
    
    // 播放按钮点击事件
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', function() {
            const soundCard = this.closest('.sound-card');
            const soundType = soundCard.getAttribute('data-sound');
            
            if (currentSound === soundType) {
                // 如果点击的是当前正在播放的声音，则暂停
                audioPlayer.pause();
                currentSound = null;
                resetPlayButtons();
            } else {
                // 否则播放新声音
                currentSound = soundType;
                playSound(soundType);
                resetPlayButtons();
                this.textContent = '暂停';
            }
        });
    });
    
    function playSound(soundType) {
        // 在实际应用中，这里应该链接到真实的音频文件
        // 这里我们只是模拟
        const soundFiles = {
            'rain': 'sounds/rain.mp3',
            'waves': 'sounds/waves.mp3',
            'forest': 'sounds/forest.mp3',
            'wind': 'sounds/wind.mp3',
            'fire': 'sounds/fire.mp3',
            'coffee': 'sounds/coffee.mp3',
            'city': 'sounds/city.mp3',
            'cat': 'sounds/cat.mp3'
        };
        
        audioPlayer.src = soundFiles[soundType];
        audioPlayer.loop = true;
        audioPlayer.play();
    }
    
    function resetPlayButtons() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.textContent = '播放';
        });
    }
    
    // 初始化音量
    audioPlayer.volume = volumeControl.value;
});