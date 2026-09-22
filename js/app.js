// =============================================
// DATA KOLEKSI BUKU PERPUS (Array of Objects)
// =============================================
const koleksiBuku = [
  {
    id: 1,
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    kategori: "Fiksi",
    stok: 3,
    rating: 4.8,
  },
  {
    id: 2,
    judul: "Bumi Manusia",
    penulis: "Pramoedya Ananta Toer",
    kategori: "Fiksi",
    stok: 0,
    rating: 4.9,
  },
  {
    id: 3,
    judul: "Sapiens",
    penulis: "Yuval Noah Harari",
    kategori: "Sains",
    stok: 2,
    rating: 4.7,
  },
  {
    id: 4,
    judul: "Atomic Habits",
    penulis: "James Clear",
    kategori: "Non-fiksi",
    stok: 5,
    rating: 4.6,
  },
  {
    id: 5,
    judul: "Negeri 5 Menara",
    penulis: "Ahmad Fuadi",
    kategori: "Fiksi",
    stok: 1,
    rating: 4.5,
  },
  {
    id: 6,
    judul: "Deep Work",
    penulis: "Cal Newport",
    kategori: "Non-fiksi",
    stok: 0,
    rating: 4.4,
  },
  {
    id: 7,
    judul: "A Brief History of Time",
    penulis: "Stephen Hawking",
    kategori: "Sains",
    stok: 3,
    rating: 4.6,
  },
  {
    id: 8,
    judul: "Pulang",
    penulis: "Tere Liye",
    kategori: "Fiksi",
    stok: 2,
    rating: 4.3,
  },
];

// =============================================
// UTILITY FUNCTIONS
// =============================================

function ambilKategori(koleksi) {
  const kategoriSet = new Set(koleksi.map((b) => b.kategori));
  return ["Semua", ...kategoriSet];
}

function filterBukuByKategori(koleksi, kategori) {
  if (kategori === "Semua") return koleksi;
  return koleksi.filter((buku) => buku.kategori === kategori);
}

function filterGabungan(koleksi, kategori, keyword) {
  let hasil = filterBukuByKategori(koleksi, kategori);

  if (!keyword.trim()) return hasil;

  const kw = keyword.trim().toLowerCase();
  return hasil.filter(
    (b) =>
      b.judul.toLowerCase().includes(kw) ||
      b.penulis.toLowerCase().includes(kw),
  );
}

function highlightKeyword(teks, keyword) {
  if (!keyword.trim()) return teks;
  const kw = keyword.trim();
  const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${kwEscaped})`, "gi");
  return teks.replace(regex, '<span class="highlight">$1</span>');
}

// =============================================
// RENDER FUNCTIONS
// =============================================

function renderKartuBuku(buku, keyword = "") {
  const badgeStokKelas =
    buku.stok > 0 ? "badge-stok-tersedia" : "badge-stok-habis";
  const badgeStokTeks = buku.stok > 0 ? `${buku.stok} tersisa` : "Habis";

  const judulTampil = highlightKeyword(buku.judul, keyword);
  const penulisTampil = highlightKeyword(buku.penulis, keyword);

  return `
  <div class="kartu-buku">
    <h3 class="kartu-judul-buku">${judulTampil}</h3>
    <p class="kartu-penulis-buku">${penulisTampil}</p>
    <div class="kartu-meta">
      <span class="badge-kategori">${buku.kategori}</span>
      <span class="${badgeStokKelas}">${badgeStokTeks}</span>
      <span class="kartu-rating">★ ${buku.rating}</span>
    </div>
  </div>
  `;
}

// FUNGSI INI SEBELUMNYA TERKOMENTAR
function renderTombolFilter(kategoriList, kategoriAktif) {
  const kontainer = document.getElementById("tombol-filter");
  kontainer.innerHTML = kategoriList
    .map(
      (kat) => `
      <button
        class="tombol-filter ${kat === kategoriAktif ? "aktif" : ""}"
        data-kategori="${kat}"
      >
        ${kat}
      </button>
    `,
    )
    .join("");
}

function renderDaftarBuku(koleksi, keyword = "", kategori = "Semua") {
  const kontainer = document.getElementById("kontainer-buku");
  const infoJumlah = document.getElementById("info-jumlah");

  const filterAktif = [];
  if (kategori !== "Semua") filterAktif.push(`kategori: "${kategori}"`);
  if (keyword.trim()) filterAktif.push(`kata kunci: "${keyword.trim()}"`);

  const infoFilter =
    filterAktif.length > 0 ? ` (filter: ${filterAktif.join(", ")})` : "";

  if (koleksi.length === 0) {
    kontainer.innerHTML = `
      <div class="pesan-kosong">
        <span class="pesan-kosong-ikon">🔍</span>
        <p>Tidak ada buku yang cocok${infoFilter}</p>
      </div>
    `;
    infoJumlah.textContent = `0 buku ditemukan${infoFilter}`;
    return;
  }

  kontainer.innerHTML = koleksi
    .map((b) => renderKartuBuku(b, keyword))
    .join("");

  infoJumlah.textContent = `Menampilkan ${koleksi.length} buku${infoFilter}`;
}

// =============================================
// EVENT HANDLING
// =============================================

// Tambahkan utility function ini di atas setupSearchEvents
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setupSearchEvents(getStateAktif) {
  const inputSearch = document.getElementById("input-search");
  const tombolHapus = document.getElementById("tombol-hapus-search");

  inputSearch.addEventListener("input", function () {
    const keyword = this.value;
    const { kategori } = getStateAktif();

    tombolHapus.style.display = keyword ? "block" : "none";

    // PERBAIKAN: Menggunakan 'koleksiBuku' bukan 'KOLEKSI_BUKU'
    const hasil = filterGabungan(koleksiBuku, kategori, keyword);
    renderDaftarBuku(hasil, keyword, kategori);
  });

  tombolHapus.addEventListener("click", function () {
    inputSearch.value = "";
    this.style.display = "none";
    inputSearch.focus();

    const { kategori } = getStateAktif();
    // PERBAIKAN: Menggunakan 'koleksiBuku' bukan 'KOLEKSI_BUKU'
    const hasil = filterGabungan(koleksiBuku, kategori, "");
    renderDaftarBuku(hasil, "", kategori);
  });
}

// =============================================
// INISIALISASI
// =============================================
function inisialisasi() {
  const kategoriList = ambilKategori(koleksiBuku);
  const state = { kategori: "Semua" };

  // Render awal
  renderTombolFilter(kategoriList, state.kategori);
  // PERBAIKAN: Menggunakan 'koleksiBuku'
  renderDaftarBuku(koleksiBuku, "", state.kategori);

  // Event listener filter kategori
  const kontainerFilter = document.getElementById("tombol-filter");
  kontainerFilter.addEventListener("click", function (event) {
    const tombol = event.target.closest(".tombol-filter");
    if (!tombol) return;

    state.kategori = tombol.dataset.kategori;
    const keyword = document.getElementById("input-search").value;

    renderTombolFilter(kategoriList, state.kategori);
    // PERBAIKAN: Menggunakan 'koleksiBuku'
    const hasil = filterGabungan(koleksiBuku, state.kategori, keyword);
    renderDaftarBuku(hasil, keyword, state.kategori);
  });

  // Setup search
  setupSearchEvents(() => state);
  const handleSearch = debounce(function () {
    const keyword = inputSearch.value;
    const { kategori } = getStateAktif();
    tombolHapus.style.display = keyword ? "block" : "none";
    const hasil = filterGabungan(koleksiBuku, kategori, keyword);
    renderDaftarBuku(hasil, keyword, kategori);
  }, 300);
  inputSearch.addEventListener("input", handleSearch);
}

// Jalankan saat DOM siap

inisialisasi();
