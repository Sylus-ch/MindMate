// assets/js/calendar.js

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const controlsContainer = document.getElementById('calendar-controls');

    if (!calendarEl) {
        console.error('错误: 找不到 #calendar 元素');
        return;
    }

    let currentDate = new Date();
    currentDate.setDate(1);

    setupControls();
    renderCalendar(currentDate);

    function setupControls() {
        const controlsHTML = `
            <button id="prevMonthBtn">◀ 上个月</button>
            <button id="todayBtn">今天</button>
            <button id="nextMonthBtn">下个月 ▶</button>
        `;
        controlsContainer.innerHTML = controlsHTML;

        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            currentDate.setDate(1);
            renderCalendar(currentDate);
        });
        document.getElementById('todayBtn').addEventListener('click', () => {
            currentDate = new Date();
            currentDate.setDate(1);
            renderCalendar(currentDate);
        });
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            currentDate.setDate(1);
            renderCalendar(currentDate);
        });
    }

    // 改为每次请求后台API获取最新日记
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        // 请求后台API获取月度日记
        fetch(`/api/diaries/month/${year}-${(month + 1).toString().padStart(2, '0')}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            const diaries = data.diaries || [];
            generateCalendarHTML(year, month, diaries);
        })
        .catch(err => {
            console.error('请求日记失败', err);
            // 出现错误时，也可以显示空日历
            generateCalendarHTML(year, month, []);
        });
    }

    function generateCalendarHTML(year, month, diaries) {
        const firstDay = new Date(year, month, 1).getDay(); // 0-6
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div class="calendar-header">
                <h2>${year}年 ${month + 1}月</h2>
            </div>
            <div class="calendar-grid">
                <div class="day-name">日</div>
                <div class="day-name">一</div>
                <div class="day-name">二</div>
                <div class="day-name">三</div>
                <div class="day-name">四</div>
                <div class="day-name">五</div>
                <div class="day-name">六</div>
        `;

        const today = new Date();

        for (let i = 0; i < 42; i++) {
            if (i < firstDay || i >= firstDay + daysInMonth) {
                // 空白格（非本月）
                html += `<div class="day other-month"></div>`;
            } else {
                const dayNum = i - firstDay + 1;
                const dateStr = `${year}-${(month + 1).toString().padStart(2,'0')}-${dayNum.toString().padStart(2,'0')}`;
                const isToday = today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
                const diary = diaries.find(d => d.date === dateStr);
                const moodClass = diary ? `mood-${diary.mood}` : '';

                html += `
                    <div class="day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                        <div class="day-number">${dayNum}</div>
                        ${diary ? `<div class="mood-indicator ${moodClass}"><div class="mood-icon ${moodClass}"></div></div>` : ''}
                    </div>
                `;
            }
        }

        html += `</div>`;
        calendarEl.innerHTML = html;

        bindDayClickEvents();
    }

    function bindDayClickEvents() {
        document.querySelectorAll('.day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                const dateStr = day.getAttribute('data-date');
                showDateConfirmBox(dateStr);
            });
        });
    }

    function showDateConfirmBox(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const confirmBox = document.createElement('div');
        confirmBox.className = 'date-confirm-box';
        confirmBox.innerHTML = `
            <p>${year}年${month}月${day}日</p>
            <button class="confirm-btn">去写心情日记</button>
            <button class="cancel-btn">取消</button>
        `;
        document.body.appendChild(confirmBox);

        confirmBox.querySelector('.confirm-btn').addEventListener('click', () => {
            window.location.href = `diary.html?date=${dateStr}`;
        });
        confirmBox.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(confirmBox);
        });
    }
});
