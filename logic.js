// Data Waktu Sholat (Bisa diubah manual kapan saja)
const prayerTimes = {
    subuh: "04:35",
    dzuhur: "11:58",
    ashar: "15:19",
    maghrib: "17:54",
    isya: "19:08"
};

let alarmEnabled = true;
let lastTriggeredMinute = "";

// Fungsi Bunyi Alarm (Beep Komputer)
function playAlarmSound() {
    if (!alarmEnabled) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let count = 0;
    const interval = setInterval(() => {
        if (count >= 5) {
            clearInterval(interval);
            return;
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        count++;
    }, 1000);

    alert("Waktu adzan untuk wilayah Kota Bandung telah tiba!");
}

// Toggle Aktif/Nonaktifkan Alarm
function setupAlarmToggle() {
    const toggleBtn = document.getElementById('toggle-alarm');
    const alarmIcon = document.getElementById('alarm-icon');
    const alarmText = document.getElementById('alarm-text');

    toggleBtn.addEventListener('click', () => {
        alarmEnabled = !alarmEnabled;
        if (alarmEnabled) {
            toggleBtn.className = "opacity-0 hover:opacity-100 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-950/50";
            alarmIcon.className = "fa-solid fa-bell";
            alarmText.innerText = "Alarm: Aktif";
        } else {
            toggleBtn.className = "opacity-0 hover:opacity-100 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-rose-950/50";
            alarmIcon.className = "fa-solid fa-bell-slash";
            alarmText.innerText = "Alarm: Senyap";
        }
    });
}

// Konversi waktu string menjadi menit
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Fungsi Highlight otomatis berdasarkan rentang waktu sholat yang sedang berjalan
function updateActivePrayerAndCountdown(currentMinutes) {
    const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    let activePrayer = 'isya';
    let nextPrayer = 'subuh';

    const minutesMap = {
        subuh: timeToMinutes(prayerTimes.subuh),
        dzuhur: timeToMinutes(prayerTimes.dzuhur),
        ashar: timeToMinutes(prayerTimes.ashar),
        maghrib: timeToMinutes(prayerTimes.maghrib),
        isya: timeToMinutes(prayerTimes.isya)
    };

    if (currentMinutes >= minutesMap.subuh && currentMinutes < minutesMap.dzuhur) {
        activePrayer = 'subuh';
        nextPrayer = 'dzuhur';
    } else if (currentMinutes >= minutesMap.dzuhur && currentMinutes < minutesMap.ashar) {
        activePrayer = 'dzuhur';
        nextPrayer = 'ashar';
    } else if (currentMinutes >= minutesMap.ashar && currentMinutes < minutesMap.maghrib) {
        activePrayer = 'ashar';
        nextPrayer = 'maghrib';
    } else if (currentMinutes >= minutesMap.maghrib && currentMinutes < minutesMap.isya) {
        activePrayer = 'maghrib';
        nextPrayer = 'isya';
    } else {
        activePrayer = 'isya';
        nextPrayer = 'subuh';
    }

    // Atur ulang gaya semua kartu ke default
    prayers.forEach(p => {
        const card = document.getElementById(`card-${p}`);
        card.classList.remove('border-emerald-500', 'bg-emerald-950/30', 'shadow-lg', 'shadow-emerald-950/40');
        card.classList.add('border-slate-700/50', 'bg-slate-800/50');
    });

    // Berikan highlight menyala pada sholat yang saat ini aktif
    const activeCard = document.getElementById(`card-${activePrayer}`);
    activeCard.classList.remove('border-slate-700/50', 'bg-slate-800/50');
    activeCard.classList.add('border-emerald-500', 'bg-emerald-950/30', 'shadow-lg', 'shadow-emerald-950/40');

    // Hitung mundur waktu sholat berikutnya
    let diff = minutesMap[nextPrayer] - currentMinutes;
    if (nextPrayer === 'subuh' && currentMinutes >= minutesMap.isya) {
        diff = (24 * 60 - currentMinutes) + minutesMap.subuh;
    }

    const diffHours = Math.floor(diff / 60);
    const diffMins = diff % 60;
    const nextPrayerUpper = nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1);

    document.getElementById('next-prayer-countdown').innerText =
        `Menuju ${nextPrayerUpper}: ${diffHours} jam ${diffMins} menit lagi`;
}

// Fungsi utama untuk update jam, tanggal, dan pemicu alarm
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTimeString = `${hours}:${minutes}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Titik dua tetap statis (tidak berkedip lagi)
    document.getElementById('current-time').innerText = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = now.toLocaleDateString('id-ID', options);

    // Perbarui visual kartu sholat aktif
    updateActivePrayerAndCountdown(currentMinutes);

    // Pemicu Alarm tepat pada menit adzan
    if (lastTriggeredMinute !== currentTimeString) {
        Object.keys(prayerTimes).forEach(prayer => {
            if (prayerTimes[prayer] === currentTimeString) {
                lastTriggeredMinute = currentTimeString;
                playAlarmSound();
            }
        });
    }
}

// Inisialisasi aplikasi
function initializeApp() {
    setupAlarmToggle();
    setInterval(updateClock, 1000);
    updateClock();
}

// Jalankan aplikasi saat DOM sudah siap
document.addEventListener('DOMContentLoaded', initializeApp);
