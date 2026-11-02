const statusEl = document.getElementById('status'), mainSection = document.getElementById('main-section'), loginSection = document.getElementById('login-section');
const btnQr = document.getElementById('btn-qr'), btnPair = document.getElementById('btn-pair');
const qrContainer = document.getElementById('qr-container'), qrImg = document.getElementById('qr-img'), qrText = document.getElementById('qr-text');
const pairContainer = document.getElementById('pair-container'), btnRequest = document.getElementById('btn-request');
const phoneInput = document.getElementById('phone'), pairCodeEl = document.getElementById('pair-code'), pairErrorEl = document.getElementById('pair-error');
const attackBtn = document.getElementById('attack-btn');
let selectedBug = 'delay_high';

btnQr.onclick = () => { btnQr.style.background = '#9d4edd'; btnPair.style.background = '#333'; qrContainer.style.display = 'block'; pairContainer.style.display = 'none'; };
btnPair.onclick = () => { btnPair.style.background = '#9d4edd'; btnQr.style.background = '#333'; pairContainer.style.display = 'block'; qrContainer.style.display = 'none'; };

btnRequest.onclick = async () => {
    const phone = phoneInput.value.replace(/[^0-9]/g, '');
    if (phone.length < 10) return pairErrorEl.textContent = 'Nomor tidak valid!';
    btnRequest.textContent = 'Meminta kode...';
    pairErrorEl.textContent = ''; pairCodeEl.textContent = '';
    try {
        const res = await fetch('/api/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
        const data = await res.json();
        if (data.code) pairCodeEl.textContent = data.code.match(/.{1,4}/g).join('-');
        else pairErrorEl.textContent = data.error || 'Gagal dapet kode';
    } catch (e) { pairErrorEl.textContent = 'Koneksi ke server gagal'; } finally { btnRequest.textContent = 'Minta Kode'; }
};

document.querySelectorAll('.bug-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.bug-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedBug = btn.getAttribute('data-type');
    });
});

setInterval(async () => {
    try {
        const data = await (await fetch('/api/status')).json();
        if (data.connected) {
            statusEl.textContent = 'Online'; statusEl.className = 'status online';
            loginSection.style.display = 'none'; mainSection.style.display = 'block';
        } else {
            statusEl.textContent = 'Offline'; statusEl.className = 'status offline';
            loginSection.style.display = 'block'; mainSection.style.display = 'none';
            if (data.qr) { qrImg.src = data.qr; qrImg.style.display = 'block'; qrText.textContent = 'Scan QR ini:'; }
        }
    } catch (e) {}
}, 3000);

attackBtn.addEventListener('click', async () => {
    const target = document.getElementById('target').value, count = document.getElementById('count').value, isGroup = document.getElementById('isGroup').checked;
    if (!target) return alert('Isi target!');
    attackBtn.textContent = 'LOADING...'; attackBtn.disabled = true;
    try {
        const data = await (await fetch('/api/attack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, bugType: selectedBug, count, isGroup }) })).json();
        alert(data.message || data.error);
    } catch (err) { alert('Gagal'); } finally { attackBtn.textContent = 'LAUNCH ATTACK'; attackBtn.disabled = false; }
});
