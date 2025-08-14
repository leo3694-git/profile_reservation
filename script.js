// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyDrevpcWddVfJRqRcyxqMR70af_GAIXlFQ",
    authDomain: "coach-reservation.firebaseapp.com",
    projectId: "coach-reservation",
    storageBucket: "coach-reservation.firebasestorage.app",
    messagingSenderId: "580815027044",
    appId: "1:580815027044:web:3fc66b1fd0d797d7f31871"
};
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();

    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const yearSelect = document.getElementById('year-select');
    
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.querySelector('.close-button');
    const modalDate = document.getElementById('modal-date');
    const timeSlotsContainer = document.getElementById('time-slots');
    const confirmBookingBtn = document.getElementById('confirm-booking');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    
    // 定義所有可能的預約時段
    const ALL_TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

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

    async function renderCalendar() {
        calendarGrid.innerHTML = '';
        const date = new Date(currentYear, currentMonth, 1);
        const firstDayOfMonth = date.getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        currentMonthYear.textContent = `${currentYear} 年 ${currentMonth + 1} 月`;
        yearSelect.value = currentYear;

        const formattedMonth = String(currentMonth + 1).padStart(2, '0');
        
        // 這次只查詢「isBooked: true」的時段
        const querySnapshot = await db.collection('schedules')
            .where('date', '>=', `${currentYear}-${formattedMonth}-01`)
            .where('date', '<=', `${currentYear}-${formattedMonth}-${daysInMonth}`)
            .where('isBooked', '==', true)
            .get();
        
        const bookedSlotsByDate = {};
        querySnapshot.forEach(doc => {
            const slot = doc.data();
            const slotDate = slot.date;
            if (!bookedSlotsByDate[slotDate]) {
                bookedSlotsByDate[slotDate] = new Set();
            }
            bookedSlotsByDate[slotDate].add(slot.time);
        });
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty-day');
            calendarGrid.appendChild(emptyDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            
            const today = new Date();
            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const currentDayDate = new Date(formattedDate);
            
            // 判斷是否為今天
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                day.classList.add('today');
            }

            // 檢查這一天是否還有未被預約的時段
            const bookedTimesForDay = bookedSlotsByDate[formattedDate] || new Set();
            
            // 找出未被預約的時段
            const unbookedSlots = ALL_TIME_SLOTS.filter(time => !bookedTimesForDay.has(time));

            if (currentDayDate < today.setHours(0,0,0,0)) {
                 day.classList.add('unavailable');
            } else if (unbookedSlots.length > 0) {
                // 如果還有時段，就讓它可點擊
                day.classList.add('has-slots');
                day.addEventListener('click', () => showBookingModal(formattedDate, unbookedSlots));
            } else {
                // 如果所有時段都被預約了，就顯示為不可用
                day.classList.add('unavailable');
            }
            
            calendarGrid.appendChild(day);
        }
    }

    function showBookingModal(date, slots) {
        modal.style.display = 'block';
        modalDate.textContent = date;
        timeSlotsContainer.innerHTML = '';
        confirmBookingBtn.disabled = true;
        selectedDate = date;

        slots.forEach(slotTime => {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = slotTime;
            
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                timeSlot.classList.add('selected');
                confirmBookingBtn.disabled = false;
            });
            timeSlotsContainer.appendChild(timeSlot);
        });
    }
    
    confirmBookingBtn.addEventListener('click', async () => {
        const selectedSlotElement = document.querySelector('.time-slot.selected');
        if (selectedSlotElement) {
            const slotTime = selectedSlotElement.textContent;

            try {
                // 檢查是否已存在同日期同時間的預約，若無則新增
                const docRef = db.collection('schedules').doc();
                await docRef.set({
                    date: selectedDate,
                    time: slotTime,
                    isBooked: true
                });
                
                alert(`恭喜您，已成功預約 ${selectedDate} ${slotTime} 的課程！`);
                modal.style.display = 'none';
                renderCalendar();
            } catch (error) {
                console.error("預約失敗:", error);
                alert("預約失敗，請稍後再試。");
            }
        }
    });

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

    initYearSelect();
    renderCalendar();
});
