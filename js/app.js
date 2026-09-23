//
// DATA & STATE
//
const KOLEKSI_BUKU = [
  {
    id: 1,
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    kategori: "Fiksi",
    stok: 3,
    rating: 4.8,
    favorit: false,
  },
  {
    id: 2,
    judul: "Bumi Manusia",
    penulis: "Pramoedya Ananta Toer",
    kategori: "Fiksi",
    stok: 0,
    rating: 4.9,
    favorit: false,
  },
  {
    id: 3,
    judul: "Sapiens",
    penulis: "Yuval Noah Harari",
    kategori: "Sains",
    stok: 2,
    rating: 4.7,
    favorit: false,
  },
  {
    id: 4,
    judul: "Atomic Habits",
    penulis: "James Clear",
    kategori: "Non-fiksi",
    stok: 5,
    rating: 4.6,
    favorit: false,
  },
  {
    id: 5,
    judul: "Negeri 5 Menara",
    penulis: "Ahmad Fuadi",
    kategori: "Fiksi",
    stok: 1,
    rating: 4.5,
    favorit: false,
  },
  {
    id: 6,
    judul: "Deep Work",
    penulis: "Cal Newport",
    kategori: "Non-fiksi",
    stok: 0,
    rating: 4.4,
    favorit: false,
  },
  {
    id: 7,
    judul: "A Brief History of Time",
    penulis: "Stephen Hawking",
    kategori: "Sains",
    stok: 3,
    rating: 4.6,
    favorit: false,
  },
  {
    id: 8,
    judul: "Pulang",
    penulis: "Tere Liye",
    kategori: "Fiksi",
    stok: 2,
    rating: 4.3,
    favorit: false,
  },
];

let state = {
  buku: KOLEKSI_BUKU.map((buku) => ({ ...buku })),
  kategori: "Semua",
  keyword: "",
};

//
// UTILITY & LOGIKA
//
function ambilKategori(koleksi) {
  const kategoriSet = new Set(koleksi.map((b) => b.kategori));
  return ["Semua", ...kategoriSet];
}

function filterGabungan(koleksi, kategori, keyword) {
  let hasil =
    kategori === "Semua"
      ? koleksi
      : koleksi.filter((b) => b.kategori === kategori);
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
  const kwEscaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${kwEscaped})`, "gi");
  return teks.replace(regex, '<span class="highlight">$1</span>');
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function hitungStatistik(koleksi) {
  const total = koleksi.length;
  const tersedia = koleksi.filter((b) => b.stok > 0).length;
  const habis = total - tersedia;
  const rataRating =
    total > 0 ? koleksi.reduce((acc, b) => acc + b.rating, 0) / total : 0;
  return { total, tersedia, habis, rataRating };
}

// Logika Interaksi Favorit (TANPA REFRESH SEMUA BUKU)
function toggleFavorit(id, elemenTombol) {
  const buku = state.buku.find((b) => b.id === id);
  if (!buku) return;
  buku.favorit = !buku.favorit;

  const kartu = elemenTombol.closest(".kartu-buku");
  if (buku.favorit) {
    elemenTombol.classList.add("aktif");
    elemenTombol.textContent = "❤️";
    kartu.classList.add("favorit");
  } else {
    elemenTombol.classList.remove("aktif");
    elemenTombol.textContent = "🤍";
    kartu.classList.remove("favorit");
  }

  // Hanya render ulang statistik untuk update jumlah favorit
  renderStatistik();
}

function hapusSemuaFavorit() {
  state.buku = state.buku.map((b) => ({ ...b, favorit: false }));
  reRender(); // Ini perlu render semua karena banyak yang berubah
}

//
// FUNGSI RENDER
//
function renderStatistik() {
  const { total, tersedia, habis, rataRating } = hitungStatistik(state.buku);
  const jumlahFavorit = state.buku.filter((b) => b.favorit).length;

  const kartuData = [
    { angka: total, label: "Total Buku", warna: "biru" },
    { angka: tersedia, label: "Tersedia", warna: "hijau" },
    { angka: habis, label: "Habis", warna: "merah" },
    { angka: rataRating.toFixed(1), label: "Rata-rata", warna: "kuning" },
    { angka: jumlahFavorit, label: "Favorit", warna: "biru" },
  ];

  const kontainer = document.getElementById("ringkasan-statistik");
  kontainer.innerHTML = kartuData
    .map(
      (k) => `
    <div class="kartu-statistik statistik-${k.warna}">
      <span class="statistik-angka">${k.angka}</span>
      <span class="statistik-label">${k.label}</span>
    </div>
  `,
    )
    .join("");

  if (jumlahFavorit > 0) {
    kontainer.innerHTML += `
      <div style="width: 100%; text-align: right; margin-top: 10px; grid-column: 1/1; display: grid; place-item: start;">
        <button onclick="hapusSemuaFavorit()" style="padding: 6px 14px; cursor: pointer; color: #EE5D50; background: #FEEDED; border: none; border-radius: 8px; font-weight: 600;">
          Hapus Semua Favorit
        </button>
      </div>
    `;
  }
}

function renderTombolFilter() {
  const kategoriList = ambilKategori(state.buku);
  const kontainer = document.getElementById("tombol-filter");
  kontainer.innerHTML = kategoriList
    .map(
      (kat) => `
    <button class="tombol-filter ${kat === state.kategori ? "aktif" : ""}" data-kategori="${kat}">
      ${kat}
    </button>
  `,
    )
    .join("");
}

function renderDaftarBuku() {
  const hasilFilter = filterGabungan(state.buku, state.kategori, state.keyword);
  const kontainer = document.getElementById("kontainer-buku");
  const infoJumlah = document.getElementById("info-jumlah");

  const filterAktif = [];
  if (state.kategori !== "Semua")
    filterAktif.push(`kategori: "${state.kategori}"`);
  if (state.keyword.trim())
    filterAktif.push(`kata kunci: "${state.keyword.trim()}"`);
  const infoFilter =
    filterAktif.length > 0 ? ` (filter: ${filterAktif.join(", ")})` : "";

  if (hasilFilter.length === 0) {
    kontainer.innerHTML = `
      <div class="pesan-kosong">
        <span class="pesan-kosong-ikon">📚</span>
        <p>Tidak ada buku yang cocok${infoFilter}</p>
      </div>
    `;
    infoJumlah.textContent = `0 buku ditemukan${infoFilter}`;
    return;
  }

  kontainer.innerHTML = hasilFilter
    .map((buku) => {
      const tersedia = buku.stok > 0;
      const kelasKartu = [
        "kartu-buku",
        tersedia ? "" : "habis",
        buku.favorit ? "favorit" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const badgeStokKelas = tersedia
        ? "badge-stok-tersedia"
        : "badge-stok-habis";
      const badgeStokTeks = tersedia ? `${buku.stok} tersisa` : "Habis";
      const tambahanStokKritis =
        buku.stok === 1
          ? `<span style="background-color: #FFCE20; color: #2b3674; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">Stok Kritis</span>`
          : "";

      const judulTampil = highlightKeyword(buku.judul, state.keyword);
      const penulisTampil = highlightKeyword(buku.penulis, state.keyword);
      const ikonFavorit = buku.favorit ? "❤️" : "🤍";

      return `
      <div class="${kelasKartu}" data-id="${buku.id}">
        <div class="kartu-header">
          <h3 class="kartu-judul-buku">${judulTampil}</h3>
          <button class="tombol-favorit ${buku.favorit ? "aktif" : ""}" data-id="${buku.id}">${ikonFavorit}</button>
        </div>
        <p class="kartu-penulis-buku">${penulisTampil}</p>
        <div class="kartu-meta">
          <span class="badge-kategori">${buku.kategori}</span>
          <span class="${badgeStokKelas}">${badgeStokTeks}</span>
          ${tambahanStokKritis}
          <span class="kartu-rating">${buku.rating}</span>
        </div>
      </div>
    `;
    })
    .join("");

  infoJumlah.textContent = `Menampilkan ${hasilFilter.length} buku${infoFilter}`;
}

function reRender() {
  renderStatistik();
  renderTombolFilter();
  renderDaftarBuku();
}

//
// EVENT HANDLING & INISIALISASI
//
function inisialisasi() {
  // Event Kategori
  document
    .getElementById("tombol-filter")
    .addEventListener("click", function (event) {
      const tombol = event.target.closest(".tombol-filter");
      if (!tombol) return;
      state.kategori = tombol.dataset.kategori;
      reRender();
    });

  // Event Favorit
  document
    .getElementById("kontainer-buku")
    .addEventListener("click", function (event) {
      const tombol = event.target.closest(".tombol-favorit");
      if (!tombol) return;
      toggleFavorit(Number(tombol.dataset.id), tombol);
    });

  // Event Pencarian (Search)
  const inputSearch = document.getElementById("input-search");
  const tombolHapus = document.getElementById("tombol-hapus-search");

  const handleSearch = debounce(function () {
    state.keyword = inputSearch.value;
    tombolHapus.style.display = state.keyword ? "block" : "none";
    reRender();
  }, 300);

  inputSearch.addEventListener("input", handleSearch);

  tombolHapus.addEventListener("click", function () {
    inputSearch.value = "";
    this.style.display = "none";
    inputSearch.focus();
    state.keyword = "";
    reRender();
  });

  // Render Awal
  reRender();
  console.log("Perpus siap - Semua modul tergabung");
}

inisialisasi();
