let selectedBug = 'delay_high';
let isPremium = false;

// Logic Trial 7 Hari
const TRIAL_DAYS = 7;
let installDate = localStorage.getItem('barx_install_date');
if (!installDate) {
    installDate = new Date().getTime();
    localStorage.setItem('barx_install_date', installDate);
}
const daysPassed = (new Date().getTime() - installDate) / (1000 * 60 * 60 * 24);
isPremium = daysPassed <= TRIAL_DAYS;

// Setup UI
document.addEventListener('DOMContentLoaded', () => {
    updateTrialUI();
    setInterval(checkStatus, 2000);
    checkStatus();
});

function updateTrialUI() {
    const proBadges = document.querySelectorAll('.pro-badge');
    if (isPremium) {
        document.getElementById('trial-status').innerText = "Free Trial (Semua Terbuka)";
        proBadges.forEach(b => b.innerText = "TRIAL");
    } else {
        document.getElementById('trial-status').innerText = "Trial Habis (PRO Terkunci)";
        proBadges.forEach(b => b.innerText = "LOCKED 🔒");
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('nav-' + tab).classList.add('active');
}

function openBugModal() { document.getElementById('bug-modal').style.display = 'flex'; }
function closeBugModal() { document.getElementById('bug-modal').style.display = 'none'; }

function selectBug(type) {
    if (!isPremium && type !== 'delay_high') {
        return alert('Masa trial habis. Fitur ini butuh PRO.');
    }
    selectedBug = type;
    document.querySelectorAll('.bug-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.bug-item[data-type="${type}"]`).classList.add('active');
    document.querySelector('.bug-text h4').innerText = type.toUpperCase().replace('_', ' ');
    closeBugModal();
}

async function checkStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        const el = document.getElementById('status');
        if (data.connected) {
            el.innerText = 'Online'; el.className = 'status online';
            document.getElementById('gs-status').className = 'badge on';
            document.getElementById('gs-status').innerText = 'STATUS GS : ON';
        } else {
            el.innerText = 'Offline'; el.className = 'status offline';
        }
    } catch (e) {}
}

async function requestPairing() {
    const phone = document.getElementById('phone').value;
    if (!phone) return alert('Isi nomor!');
    document.getElementById('pair-status').innerText = 'Meminta kode...';
    try {
        const res = await fetch('/api/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
        const data = await res.json();
        if (data.code) document.getElementById('pair-status').innerText = 'Kode: ' + data.code.match(/.{1,4}/g).join('-');
        else document.getElementById('pair-status').innerText = data.error;
    } catch (e) { document.getElementById('pair-status').innerText = 'Koneksi gagal'; }
}

async function sendBug() {
    const target = document.getElementById('target').value;
    if (!target) return alert('Isi target!');
    if (!isPremium && selectedBug !== 'delay_high') return alert('Fitur PRO terkunci.');
    
    document.querySelector('.btn-send').innerText = 'MENGIRIM...';
    try {
        const res = await fetch('/api/attack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, bugType: selectedBug, count: 10, isGroup: false }) });
        const data = await res.json();
        alert(data.message || data.error);
    } catch (e) { alert('Gagal mengirim'); } finally { document.querySelector('.btn-send').innerText = '➢ SEND'; }
}

function redeemCode() {
    const code = document.getElementById('redeem-code').value;
    if (code === 'BARXPRO') {
        isPremium = true;
        localStorage.setItem('barx_install_date', new Date().getTime()); // Reset trial
        alert('Kode Redeem Berhasil! PRO unlocked.');
        updateTrialUI();
    } else {
        alert('Kode salah.');
    }
}
