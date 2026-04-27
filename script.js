// ============================================================
//  FIREBASE CONFIG
//  Ganti nilai di bawah ini dengan config Firebase Anda sendiri.
//  Cara mendapatkan: console.firebase.google.com → Project Settings → Your Apps
// ============================================================
const FB_URL = "https://belajar-lho-default-rtdb.firebaseio.com"; 
// Ganti URL di atas dengan Realtime Database URL project Firebase Anda.
// Contoh: "https://nama-project-anda-default-rtdb.firebaseio.com"

// ============================================================
//  STATE
// ============================================================
let currentUser = '';
let currentQ    = 0;
let score       = 0;
let answered    = false;
let shuffled    = [];
let startTime   = null;

const ADMIN_PW  = 'guru123';

// ============================================================
//  FIREBASE HELPERS (REST API – tidak perlu SDK)
// ============================================================
async function fbGet(path) {
  try {
    const r = await fetch(`${FB_URL}/${path}.json`);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

async function fbPush(path, data) {
  try {
    const r = await fetch(`${FB_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch(e) { return false; }
}

async function fbDelete(path) {
  try {
    await fetch(`${FB_URL}/${path}.json`, { method: 'DELETE' });
    return true;
  } catch(e) { return false; }
}

// ============================================================
//  BANK SOAL – 15 PERTANYAAN
// ============================================================
const allQ = [
  {
    q: "Apa yang dimaksud dengan Teks Laporan Hasil Observasi (LHO)?",
    opts: ["Teks yang berisi pendapat penulis tentang suatu objek","Teks faktual yang menyajikan informasi berdasarkan pengamatan langsung","Teks cerita imajinatif yang dibuat berdasarkan imajinasi penulis","Teks yang berisi ajakan kepada pembaca untuk melakukan sesuatu"],
    ans: 1, ex: "LHO adalah teks faktual yang menyajikan informasi secara objektif dan sistematis berdasarkan pengamatan langsung."
  },
  {
    q: "Manakah yang termasuk karakteristik utama teks LHO?",
    opts: ["Subjektif, imajinatif, dan menghibur","Objektif, faktual, universal, dan terstruktur","Persuasif, emosional, dan menarik","Naratif, kronologis, dan dramatis"],
    ans: 1, ex: "Karakteristik utama LHO meliputi sifat objektif, faktual, universal, dan terstruktur."
  },
  {
    q: "Apa perbedaan utama antara fakta dan opini dalam teks LHO?",
    opts: ["Fakta lebih panjang dari opini","Opini dapat dibuktikan, fakta tidak","Fakta dapat dibuktikan dan objektif, opini adalah pandangan subjektif","Keduanya sama-sama tidak bisa dibuktikan"],
    ans: 2, ex: "Fakta dapat diverifikasi, benar terjadi, dan objektif. Opini adalah pandangan subjektif yang bisa diperdebatkan."
  },
  {
    q: "Manakah contoh kalimat FAKTA yang tepat dalam teks LHO?",
    opts: ["Kucing adalah hewan yang sangat lucu dan menggemaskan","Menurut saya, kucing lebih baik dari anjing","Kucing memiliki empat kaki dan tubuh yang dilapisi bulu","Kucing adalah hewan terbaik untuk dipelihara di rumah"],
    ans: 2, ex: "Kalimat 'Kucing memiliki empat kaki dan tubuh yang dilapisi bulu' adalah fakta karena dapat dibuktikan secara objektif."
  },
  {
    q: "Manakah urutan struktur teks LHO yang benar?",
    opts: ["Deskripsi Bagian → Pernyataan Umum → Deskripsi Manfaat","Pernyataan Umum → Deskripsi Bagian → Deskripsi Manfaat","Deskripsi Manfaat → Deskripsi Bagian → Pernyataan Umum","Pernyataan Umum → Deskripsi Manfaat → Deskripsi Bagian"],
    ans: 1, ex: "Struktur LHO yang benar: Pernyataan Umum → Deskripsi Bagian → Deskripsi Manfaat/Simpulan."
  },
  {
    q: "Apa fungsi bagian 'Pernyataan Umum' dalam teks LHO?",
    opts: ["Menutup pembahasan dan menyimpulkan manfaat objek","Menjelaskan rincian bagian-bagian objek secara detail","Membuka teks dengan memperkenalkan objek yang diamati secara umum","Menyampaikan pendapat penulis tentang objek"],
    ans: 2, ex: "Pernyataan Umum berfungsi sebagai pembuka yang memperkenalkan objek dan pengklasifikasiannya."
  },
  {
    q: "Mengapa teks LHO harus ditulis secara objektif?",
    opts: ["Agar teks lebih panjang dan informatif","Agar pembaca mendapatkan data yang benar, valid, dan dapat dipertanggungjawabkan","Agar penulis terlihat pintar","Agar lebih mudah dihafal oleh pembaca"],
    ans: 1, ex: "Objektivitas LHO bertujuan agar pembaca mendapatkan data yang benar, valid, dan dapat dipertanggungjawabkan."
  },
  {
    q: "Kalimat manakah yang TIDAK sesuai dengan kaidah teks LHO?",
    opts: ["Perpustakaan sekolah memiliki koleksi 2.500 buku pelajaran","Ruang kelas tersebut berukuran 8 meter × 9 meter","Menurut saya, taman sekolah kami adalah yang terindah di kota ini","Taman sekolah memiliki 15 jenis tanaman hias"],
    ans: 2, ex: "'Menurut saya, taman sekolah kami adalah yang terindah di kota ini' adalah opini pribadi, tidak sesuai kaidah LHO."
  },
  {
    q: "Apa yang dimaksud dengan 'Deskripsi Bagian' dalam struktur teks LHO?",
    opts: ["Pengantar yang memperkenalkan objek secara umum","Bagian yang menjelaskan rincian objek secara detail (bagian, karakteristik, sifat)","Kesimpulan yang merangkum hasil pengamatan","Bagian yang berisi saran penulis kepada pembaca"],
    ans: 1, ex: "Deskripsi Bagian adalah isi teks yang menjelaskan rincian objek: bagian, karakteristik, perilaku, atau sifat."
  },
  {
    q: "Langkah pertama dalam menyusun teks LHO adalah...",
    opts: ["Menulis kesimpulan","Mengelompokkan informasi","Menentukan objek yang akan diamati","Membuat daftar pertanyaan"],
    ans: 2, ex: "Langkah pertama adalah menentukan objek yang akan diamati secara spesifik."
  },
  {
    q: "Istilah manakah yang TEPAT digunakan dalam kaidah kebahasaan teks LHO?",
    opts: ["Wah, keren banget ekosistemnya!","Habitat tersebut mendukung keberagaman flora dan fauna","Menurutku, tempat ini sangat bagus banget","Kayaknya sih, banyak hewan di sini"],
    ans: 1, ex: "LHO menggunakan istilah ilmiah seperti 'habitat', 'ekosistem', 'flora dan fauna', serta bahasa baku."
  },
  {
    q: "Tujuan penulisan teks LHO adalah...",
    opts: ["Menghibur pembaca dengan kisah menarik","Meyakinkan pembaca untuk setuju dengan pendapat penulis","Menyampaikan informasi faktual secara objektif dan sistematis kepada pembaca","Mengekspresikan perasaan penulis terhadap objek"],
    ans: 2, ex: "Tujuan LHO: menyampaikan informasi faktual, memberikan gambaran objek, dan menyajikan data secara ilmiah."
  },
  {
    q: "Dalam teks LHO tentang kelas, manakah data yang paling sesuai?",
    opts: ["Kelas kami sangat nyaman dan menyenangkan untuk belajar","Sepertinya kelas ini punya sekitar 30-an meja","Ruang kelas memiliki luas 72 m², dilengkapi 36 set meja-kursi, dan 2 unit AC","Kelas ini adalah kelas terbagus yang pernah saya lihat"],
    ans: 2, ex: "Data 'luas 72 m², 36 set meja-kursi, 2 unit AC' bersifat faktual dan terukur sesuai kaidah LHO."
  },
  {
    q: "Apa yang dimaksud dengan 'Deskripsi Manfaat' dalam teks LHO?",
    opts: ["Bagian awal yang memperkenalkan objek secara umum","Bagian tengah yang menjelaskan rincian objek","Bagian penutup yang meringkas hasil pengamatan dan menegaskan manfaat objek","Bagian yang berisi teori-teori ilmiah pendukung"],
    ans: 2, ex: "Deskripsi Manfaat adalah bagian penutup yang meringkas pengamatan dan menegaskan manfaat objek."
  },
  {
    q: "Manakah pernyataan yang BENAR tentang cara menulis teks LHO yang baik?",
    opts: ["Boleh menambahkan opini pribadi selama menarik","Data tidak perlu terukur, yang penting informatif","Gunakan bahasa baku, data spesifik, terukur, dan hindari opini subjektif","LHO boleh ditulis berdasarkan imajinasi jika tidak bisa observasi langsung"],
    ans: 2, ex: "LHO yang baik: bahasa baku, objektif, data spesifik dan terukur, disusun dari umum ke khusus."
  }
];

// ============================================================
//  UTIL
// ============================================================
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function fmtDur(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })
       + ', ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

// ============================================================
//  NAVIGASI
// ============================================================
function goTo(pg) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('pg-' + pg).classList.add('active');
  window.scrollTo(0, 0);
  if (pg === 'quiz') initQuiz();
  if (pg === 'ranking') loadFullRanking();
}

function showTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ============================================================
//  LOGIN
// ============================================================
async function doLogin() {
  const val = document.getElementById('inp-user').value.trim();
  const err = document.getElementById('login-err');
  const sm  = document.getElementById('status-msg');
  const btn = document.getElementById('login-btn');

  if (!val) { err.style.display = 'block'; return; }
  err.style.display = 'none';

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';
  sm.textContent = '⏳ Menghubungkan ke server...';

  currentUser = val;
  document.getElementById('user-display').textContent = '👤 ' + currentUser;

  // Simpan log login ke Firebase
  const ok = await fbPush('login_log', {
    name: currentUser,
    time: new Date().toISOString()
  });

  if (ok) {
    sm.textContent = '✅ Berhasil masuk!';
  } else {
    sm.textContent = '⚠️ Offline – data tidak tersinkron ke server.';
  }

  btn.disabled = false;
  btn.textContent = 'Mulai Belajar 🚀';

  setTimeout(() => goTo('home'), 800);
}

// ============================================================
//  QUIZ
// ============================================================
function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

function initQuiz() {
  shuffled  = shuffle(allQ);
  currentQ  = 0;
  score     = 0;
  startTime = Date.now();
  renderQ();
}

function renderQ() {
  answered = false;
  const q   = shuffled[currentQ];
  const tot = shuffled.length;

  document.getElementById('q-prog').textContent    = `Soal ${currentQ + 1} dari ${tot}`;
  document.getElementById('q-sc-lbl').textContent  = `Benar: ${score}`;
  document.getElementById('q-bar').style.width     = `${(currentQ / tot) * 100}%`;
  document.getElementById('q-num').textContent     = `Pertanyaan ${currentQ + 1}`;
  document.getElementById('q-text').textContent    = q.q;

  const oc = document.getElementById('q-opts');
  oc.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className   = 'opt-btn';
    b.textContent = opt;
    b.onclick     = () => selectAns(i);
    oc.appendChild(b);
  });

  const fb = document.getElementById('q-fb');
  fb.className   = 'q-feedback';
  fb.textContent = '';

  const nb = document.getElementById('q-next');
  nb.className   = 'q-next-btn';
  nb.textContent = (currentQ === shuffled.length - 1) ? 'Lihat Hasil 🎉' : 'Soal Berikutnya →';
}

function selectAns(i) {
  if (answered) return;
  answered = true;

  const q    = shuffled[currentQ];
  const btns = document.querySelectorAll('.opt-btn');
  btns.forEach(b => b.disabled = true);

  const fb = document.getElementById('q-fb');
  if (i === q.ans) {
    score++;
    btns[i].classList.add('correct');
    fb.className   = 'q-feedback correct show';
    fb.textContent = '✅ Benar! ' + q.ex;
  } else {
    btns[i].classList.add('wrong');
    btns[q.ans].classList.add('correct');
    fb.className   = 'q-feedback wrong show';
    fb.textContent = '❌ Salah. ' + q.ex;
  }
  document.getElementById('q-next').classList.add('show');
}

function nextQ() {
  currentQ++;
  if (currentQ >= shuffled.length) showResult();
  else renderQ();
}

function confirmBack() {
  if (confirm('Kembali ke beranda? Progress kuis akan hilang.')) goTo('home');
}

// ============================================================
//  RESULT
// ============================================================
async function showResult() {
  const tot  = shuffled.length;
  const pct  = Math.round((score / tot) * 100);
  const wrong = tot - score;
  const dur  = Math.round((Date.now() - startTime) / 1000);

  let emoji = '😢', title = 'Perlu Belajar Lagi', msg = 'Jangan menyerah! Baca materinya sekali lagi ya.';
  if (pct >= 90) { emoji = '🏆'; title = 'Luar Biasa!';    msg = 'Kamu sangat menguasai materi LHO!'; }
  else if (pct >= 75) { emoji = '🎉'; title = 'Bagus Sekali!';  msg = 'Pemahamanmu tentang LHO sudah sangat baik!'; }
  else if (pct >= 60) { emoji = '😊'; title = 'Cukup Baik!';   msg = 'Kamu sudah paham sebagian besar materi. Terus belajar!'; }
  else if (pct >= 40) { emoji = '🤔'; title = 'Lumayan!';      msg = 'Masih ada beberapa materi yang perlu dipelajari lagi.'; }

  document.getElementById('r-emoji').textContent  = emoji;
  document.getElementById('r-title').textContent  = title;
  document.getElementById('r-score').innerHTML    = `${pct} <span>/ 100</span>`;
  document.getElementById('r-msg').textContent    = msg;
  document.getElementById('r-name').textContent   = currentUser;
  document.getElementById('r-correct').textContent = `${score} / ${tot}`;
  document.getElementById('r-wrong').textContent  = wrong;
  document.getElementById('r-dur').textContent    = fmtDur(dur);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('pg-result').classList.add('active');
  window.scrollTo(0, 0);

  document.getElementById('rank-list').innerHTML = '<div class="rank-loading">Menyimpan skor...</div>';

  // Simpan skor ke Firebase
  await fbPush('leaderboard', {
    name: currentUser,
    score, pct, tot, dur,
    time: new Date().toISOString()
  });

  // Ambil & tampilkan leaderboard
  await renderResultRanking();
}

async function renderResultRanking() {
  const raw = await fbGet('leaderboard');
  const el  = document.getElementById('rank-list');

  if (!raw) {
    el.innerHTML = '<div class="rank-loading">Tidak bisa memuat ranking.</div>';
    return;
  }

  const lb = Object.values(raw).sort((a, b) => b.pct - a.pct || a.dur - b.dur);
  renderRankRows(lb, el, 10, currentUser);
}

function renderRankRows(lb, container, limit, highlightUser) {
  container.innerHTML = '';
  if (!lb || lb.length === 0) {
    container.innerHTML = '<div class="rank-loading">Belum ada data ranking.</div>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  lb.slice(0, limit).forEach((e, i) => {
    const isMe = highlightUser && e.name === highlightUser;
    const row  = document.createElement('div');
    row.className = 'rank-row' + (isMe ? ' rank-me' : '');
    row.innerHTML = `
      <span class="rank-pos">${medals[i] || (i + 1 + '.')}</span>
      <span class="rank-name">${esc(e.name)}${isMe ? '<span class="you-tag">Kamu</span>' : ''}</span>
      <span class="rank-sc">${e.pct}<small>/100</small></span>
      <span class="rank-dur">${fmtDur(e.dur)}</span>
    `;
    container.appendChild(row);
  });
}

// ============================================================
//  RANKING PAGE
// ============================================================
async function loadFullRanking() {
  const el  = document.getElementById('rank-full-wrap');
  el.innerHTML = '<div class="rank-loading">Memuat data peringkat...</div>';

  const raw = await fbGet('leaderboard');
  if (!raw) {
    el.innerHTML = '<div class="rank-loading">Tidak bisa memuat data. Cek koneksi internet.</div>';
    return;
  }

  const lb = Object.values(raw).sort((a, b) => b.pct - a.pct || a.dur - b.dur);

  el.innerHTML = '';

  // Header
  const hdr = document.createElement('div');
  hdr.className = 'rank-hdr-row';
  hdr.innerHTML = '<span>Pos</span><span>Nama</span><span>Skor</span><span>Durasi</span>';
  el.appendChild(hdr);

  renderRankRows(lb, el, 50, currentUser);
}

// ============================================================
//  ADMIN PANEL
// ============================================================
async function openAdmin() {
  const pw = prompt('🔐 Masukkan password admin:');
  if (pw === null) return;
  if (pw !== ADMIN_PW) { alert('❌ Password salah!'); return; }
  await renderAdmin();
  document.getElementById('admin-overlay').classList.add('active');
}

function closeAdmin() {
  document.getElementById('admin-overlay').classList.remove('active');
}

async function renderAdmin() {
  // Login log
  const logRaw = await fbGet('login_log');
  const log    = logRaw ? Object.values(logRaw) : [];
  log.sort((a, b) => new Date(b.time) - new Date(a.time));

  document.getElementById('a-n-login').textContent = log.length;

  const ltb = document.getElementById('a-login-tbody');
  ltb.innerHTML = '';
  if (log.length === 0) {
    ltb.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#c49a6c">Belum ada peserta yang login.</td></tr>';
  } else {
    log.forEach((e, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i + 1}</td><td><strong>${esc(e.name)}</strong></td><td>${fmtTime(e.time)}</td>`;
      ltb.appendChild(tr);
    });
  }

  // Leaderboard
  const lbRaw = await fbGet('leaderboard');
  const lb    = lbRaw ? Object.values(lbRaw).sort((a, b) => b.pct - a.pct || a.dur - b.dur) : [];

  document.getElementById('a-n-kuis').textContent = lb.length;
  const avg = lb.length ? Math.round(lb.reduce((s, e) => s + e.pct, 0) / lb.length) : '-';
  document.getElementById('a-n-avg').textContent  = avg + (lb.length ? '/100' : '');

  const medals = ['🥇', '🥈', '🥉'];
  const atb = document.getElementById('a-lb-tbody');
  atb.innerHTML = '';
  if (lb.length === 0) {
    atb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c49a6c">Belum ada data kuis.</td></tr>';
  } else {
    lb.forEach((e, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${medals[i] || (i + 1)}</td><td><strong>${esc(e.name)}</strong></td><td><b>${e.pct}</b>/100</td><td>${fmtDur(e.dur)}</td><td>${fmtTime(e.time)}</td>`;
      atb.appendChild(tr);
    });
  }
}

async function clearAllData() {
  if (!confirm('⚠️ Hapus SEMUA data login dan leaderboard? Tindakan ini tidak bisa dibatalkan.')) return;
  await fbDelete('login_log');
  await fbDelete('leaderboard');
  await renderAdmin();
  alert('✅ Semua data berhasil dihapus.');
}

// Shortcut Ctrl+Shift+A untuk buka admin
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') openAdmin();
});