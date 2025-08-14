document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const yearSelect = document.getElementById('year-select');
    
    // 預約彈窗相關元素
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.querySelector('.close-button');
    const modalDate = document.getElementById('modal-date');
    const timeSlotsContainer = document.getElementById('time-slots');
    const confirmBookingBtn = document.getElementById('confirm-booking');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // 模擬後端的可預約時段資料
    // 格式為：'YYYY-MM-DD': ['HH:MM', 'HH:MM', ...]
    const availableSlots = {
        '2025-08-15': ['10:00', '11:00', '14:00', '15:00'],
        '2025-08-16': ['09:00', '10:00'],
        '2025-08-18': ['16:00', '17:00'],
        // 更多可預約日期...
    };

    // 初始化年份下拉選單，從當前年份到 2050 年
    function initYearSelect() {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i <= 2050; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }

    // 渲染日曆
    function renderCalendar() {
        calendarGrid.innerHTML = ''; // 清空舊的日曆
        const date = new Date(currentYear, currentMonth, 1);
        const firstDayOfMonth = date.getDay(); // 獲取本月第一天是星期幾 (0-6)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // 獲取本月總天數
        
        currentMonthYear.textContent = `${currentYear} 年 ${currentMonth + 1} 月`;
        yearSelect.value = currentYear;

        // 填補月初的空白
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty-day');
            calendarGrid.appendChild(emptyDay);
        }

        // 渲染每一天
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            
            const today = new Date();
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                day.classList.add('today');
            }

            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (availableSlots[formattedDate]) {
                day.classList.add('has-slots');
                day.addEventListener('click', () => showBookingModal(formattedDate));
            } else {
                day.classList.add('unavailable');
            }
            
            calendarGrid.appendChild(day);
        }
    }

    // 顯示預約彈窗
    function showBookingModal(date) {
        modal.style.display = 'block';
        modalDate.textContent = date;
        timeSlotsContainer.innerHTML = '';
        confirmBookingBtn.disabled = true;

        const slots = availableSlots[date] || [];
        slots.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = time;
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                timeSlot.classList.add('selected');
                confirmBookingBtn.disabled = false;
            });
            timeSlotsContainer.appendChild(timeSlot);
        });

        // 確認預約按鈕的事件
        confirmBookingBtn.onclick = () => {
            const selectedSlot = document.querySelector('.time-slot.selected');
            if (selectedSlot) {
                alert(`您已預約 ${date} ${selectedSlot.textContent} 的課程！`);
                modal.style.display = 'none';
            }
        };
    }

    // 事件監聽
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        renderCalendar();
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 頁面加載時執行
    initYearSelect();
    renderCalendar();
});