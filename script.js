// 將你的 Firebase 設定放在這裡
const firebaseConfig = {
    apiKey: "AIzaSyDrevpcWddVfJRqRcyxqMR70af_GAIXlFQ",
    authDomain: "coach-reservation.firebaseapp.com",
    projectId: "coach-reservation",
    storageBucket: "coach-reservation.firebasestorage.app",
    messagingSenderId: "580815027044",
    appId: "1:580815027044:web:3fc66b1fd0d797d7f31871"
};
firebase.initializeApp(firebaseConfig);

// 你的舊有程式碼...
document.addEventListener('DOMContentLoaded', () => {
    // 這裡不需要再初始化一次 Firebase，因為前面已經做過了
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
        const querySnapshot = await db.collection('schedules')
            .where('date', '>=', `${currentYear}-${formattedMonth}-01`)
            .where('date', '<=', `${currentYear}-${formattedMonth}-${daysInMonth}`)
            .get();
        
        const availableSlotsByDate = {};
        querySnapshot.forEach(doc => {
            const slot = doc.data();
            const slotDate = slot.date;
            if (!availableSlotsByDate[slotDate]) {
                availableSlotsByDate[slotDate] = [];
            }
            availableSlotsByDate[slotDate].push({ id: doc.id, ...slot });
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
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                day.classList.add('today');
            }
            
            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const slotsForDay = availableSlotsByDate[formattedDate] || [];
            const unbookedSlots = slotsForDay.filter(slot => !slot.isBooked);

            if (unbookedSlots.length > 0) {
                day.classList.add('has-slots');
                day.addEventListener('click', () => showBookingModal(formattedDate, unbookedSlots));
            } else {
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

        slots.forEach(slot => {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = slot.time;
            timeSlot.dataset.slotId = slot.id;
            
            timeSlot.addEventListener

});
