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

// ----------------------------------------------------------------
// 新增的程式碼: 引入 Firebase 認證服務並處理匿名登入
// ----------------------------------------------------------------
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
const auth = getAuth();

signInAnonymously(auth).then(() => {
    console.log("匿名登入成功！");
}).catch((error) => {
    console.error("匿名登入失敗:", error);
});
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 現在可以在 DOMContentLoaded 之後取得 Firestore 服務
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
        
        try {
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
                
                if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    day.classList.add('today');
                }

                const bookedTimesForDay = bookedSlotsByDate[formattedDate] || new Set();
                const unbookedSlots = ALL_TIME_SLOTS.filter(time => !bookedTimesForDay.has(time));

                if (currentDayDate < today.setHours(0,0,0,0)) {
                     day.classList.add('unavailable');
                } else if (unbookedSlots.length > 0) {
                    day.classList.add('has-slots');
                    day.addEventListener('click', () => showBookingModal(formattedDate, unbookedSlots));
                } else {
                    day.classList.add('unavailable');
                }
                
                calendarGrid.appendChild(day);
            }
        } catch (error) {
            console.error("渲染日曆失敗:", error);
            // 這裡可以選擇性地在頁面上顯示錯誤訊息
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
                // 這裡會顯示寫入失敗的詳細錯誤訊息
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

    initYearSelect();
    renderCalendar();
});

