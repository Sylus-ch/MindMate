document.addEventListener('DOMContentLoaded', function() {
    // 声音文件映射
    const soundMap = {
        rain:    "assets/audio/rain.mp3",
        waves:   "assets/audio/waves.mp3",
        forest:  "assets/audio/forest.mp3",
        wind:    "assets/audio/wind.mp3",
        fire:    "assets/audio/fire.mp3",
        coffee:  "assets/audio/coffee.mp3",
        city:    "assets/audio/city.mp3",
        cat:     "assets/audio/flower.mp3"
    };

    const audioPlayer = document.getElementById('audioPlayer');
    const volumeSlider = document.getElementById('volume');
    const durationSelect = document.getElementById('duration');
    const playBtns = document.querySelectorAll('.play-btn');
    let timer = null;
    let currentSound = null;

    // 播放/暂停逻辑
    playBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.sound-card');
            const sound = card.getAttribute('data-sound');
            const src = soundMap[sound];

            if (currentSound === sound && !audioPlayer.paused) {
                // 正在播放当前声音，点击则暂停
                audioPlayer.pause();
                btn.textContent = "播放";
                currentSound = null;
                clearTimer();
            } else {
                // 切换到新声音
                playBtns.forEach(b => b.textContent = "播放");
                audioPlayer.src = src;
                audioPlayer.currentTime = 0;
                audioPlayer.loop = true;
                audioPlayer.volume = volumeSlider.value;
                audioPlayer.play();
                btn.textContent = "暂停";
                currentSound = sound;
                clearTimer();
                setTimer();
            }
        });
    });

    // 音量调节
    volumeSlider.addEventListener('input', function() {
        audioPlayer.volume = volumeSlider.value;
    });

    // 定时关闭
    function setTimer() {
        const minutes = parseInt(durationSelect.value, 10);
        if (minutes > 0) {
            timer = setTimeout(() => {
                audioPlayer.pause();
                playBtns.forEach(b => b.textContent = "播放");
                currentSound = null;
            }, minutes * 60 * 1000);
        }
    }
    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    durationSelect.addEventListener('change', function() {
        if (!audioPlayer.paused) {
            clearTimer();
            setTimer();
        }
    });

    // 播放/暂停时按钮状态同步
    audioPlayer.addEventListener('pause', function() {
        playBtns.forEach(b => b.textContent = "播放");
        currentSound = null;
        clearTimer();
    });
    audioPlayer.addEventListener('play', function() {
        if (currentSound) {
            const btn = document.querySelector(`.sound-card[data-sound="${currentSound}"] .play-btn`);
            if (btn) btn.textContent = "暂停";
        }
    });
});