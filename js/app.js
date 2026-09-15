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
// UTILITY FUNCTIONS (Fungsi Bantuan Logika Data)
// =============================================

// Mengambil daftar nama kategori tanpa ada yang duplikat
function ambilKategori(koleksi) {
  // 1. koleksi.map((b) => b.kategori) mengambil hanya string kategorinya saja
  //    Hasilnya: ["Fiksi", "Fiksi", "Sains", "Non-fiksi", ...]
  // 2. new Set(...) otomatis menghapus nilai yang sama/duplikat
  //    Hasilnya: Set { "Fiksi", "Sains", "Non-fiksi" }
  const kategoriSet = new Set(koleksi.map((b) => b.kategori));

  // 3. [...kategoriSet] mengubah Set kembali menjadi Array biasa
  //    Lalu kita tambah opsi "Semua" di paling depan array
  return ["Semua", ...kategoriSet];
  // Output akhir: ["Semua", "Fiksi", "Sains", "Non-fiksi"]
}

// Logika memfilter buku berdasarkan kategori yang dipilih user
function filterBukuByKategori(koleksi, kategori) {
  // JIKA user memilih tombol "Semua"
  if (kategori === "Semua") {
    return koleksi; // Kembalikan seluruh array buku tanpa ada yang dibuang
  }

  // JIKA user memilih kategori tertentu (misal: "Sains")
  // .filter() akan mengecek tiap buku satu persatu:
  // Kalau kategorinya cocok, disimpan ke array baru. Kalau beda, dibuang.
  return koleksi.filter((buku) => buku.kategori === kategori);
}

// =============================================
// RENDER FUNCTIONS (Fungsi Mengubah Data ke HTML)
// =============================================

// Fungsi ini bertugas mengubah 1 objek buku menjadi 1 potong teks HTML (String)
function renderKartuBuku(buku) {
  // Ternary operator: jika stok > 0 pakai class 'badge-stok-tersedia', jika 0 pakai 'badge-stok-habis'
  const badgeStokKelas =
    buku.stok > 0 ? "badge-stok-tersedia" : "badge-stok-habis";

  // Tentukan teks tampilan stoknya
  const badgeStokTeks = buku.stok > 0 ? `${buku.stok} tersisa` : "Habis";

  // Kembalikan susunan elemen HTML dalam bentuk String (Template Literals)
  return `
  <div class="kartu-buku">
    <h3 class="kartu-judul-buku">${buku.judul}</h3>
    <p class="kartu-penulis-buku">${buku.penulis}</p>
    <div class="kartu-meta">
      <span class="badge-kategori">${buku.kategori}</span>
      <span class="${badgeStokKelas}">${badgeStokTeks}</span>
      <span class="kartu-rating">★ ${buku.rating}</span>
    </div>
  </div>
  `;
}

// Fungsi menampilkan daftar seluruh kartu buku ke layar HTML
function renderDaftarBuku(koleksi) {
  const kontainer = document.getElementById("kontainer-buku");
  const infoJumlah = document.getElementById("info-jumlah");

  // Jika hasil filter kosong / tidak ada buku
  if (koleksi.length === 0) {
    kontainer.innerHTML = `
      <div class="pesan-kosong">
        <span class="pesan-kosong-ikon">📭</span>
        <p>Tidak ada buku di kategori ini</p>
      </div>
    `;
    infoJumlah.textContent = "0 Buku Ditemukan";
    return; // Berhenti di sini, tidak perlu lanjut ke bawah
  }

  // ------------------------------------------------------------------------
  // PENJELASAN LOGIKA MAP DAN JOIN DI SINI:
  // ------------------------------------------------------------------------
  // 1. koleksi.map(renderKartuBuku)
  //    .map() memproses setiap item di array koleksi, lalu memanggil fungsi renderKartuBuku.
  //    Hasilnya adalah Array berisi String-String HTML:
  //    ["<div class=...>", "<div class=...>", "<div class=...>"]
  //
  // 2. .join("")
  //    .join("") menggabungkan seluruh elemen array string di atas menjadi 1 Teks Panjang tanpa pemisah.
  //    Dari: ["<div>A</div>", "<div>B</div>"] -> Menjadi: "<div>A</div><div>B</div>"
  //
  // 3. kontainer.innerHTML = ...
  //    Browser mengambil string HTML tersebut dan merendernya jadi tampilan visual kartu di web.
  // ------------------------------------------------------------------------
  kontainer.innerHTML = koleksi.map(renderKartuBuku).join("");

  // Update teks info jumlah buku (misal: "Menampilkan 8 Buku")
  infoJumlah.textContent = `Menampilkan ${koleksi.length} Buku`;
}

// Fungsi menampilkan tombol-tombol filter kategori di layar
function renderTombolFilter(kategoriList, kategoriAktif) {
  const kontainer = document.getElementById("tombol-filter");

  // .map() merubah array string nama kategori menjadi array string elemen <button>
  // .join("") menggabungkan array tombol tersebut jadi 1 string HTML
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

// =============================================
// EVENT HANDLING (Interaksi Klik Usert)
// =============================================

function setUpFilterEvents(kategoriList) {
  const kontainer = document.getElementById("tombol-filter");

  // Menggunakan Event Delegation:
  // Kita pasang 1 listener saja pada kontainer induknya (#tombol-filter)
  kontainer.addEventListener("click", function (event) {
    // Cek apakah elemen yang diklik (atau elemen terdekatnya) adalah tombol filter
    const tombol = event.target.closest(".tombol-filter");

    // Jika yang diklik bukan tombol (misal klik area kosong di samping tombol), hiraukan/berhenti
    if (!tombol) return;

    // Ambil nilai kategori dari attribute data-kategori="..." pada tombol yang diklik
    const kategoriYangDipilih = tombol.dataset.kategori;

    // 1. Render ulang tombol filter agar status kelas 'aktif' pindah ke tombol yang baru diklik
    renderTombolFilter(kategoriList, kategoriYangDipilih);

    // 2. Saring data buku sesuai kategori yang baru dipilih
    const bukuFiltered = filterBukuByKategori(koleksiBuku, kategoriYangDipilih);

    // 3. Render ulang tampilan daftar buku di layar dengan data yang sudah disaring
    renderDaftarBuku(bukuFiltered);
  });
}

// =============================================
// INISIALISASI (Aplikasi Pertama Kali Jalan)
// =============================================

function inisialisasi() {
  // 1. Ambil list kategori unik dari data buku
  const kategoriList = ambilKategori(koleksiBuku);

  // 2. Render tombol filter pertama kali (default aktif: "Semua")
  renderTombolFilter(kategoriList, "Semua");

  // 3. Render daftar seluruh buku pertama kali
  renderDaftarBuku(koleksiBuku);

  // 4. Pasang event listener untuk menangani klik tombol filter
  setUpFilterEvents(kategoriList);

  console.log("Aplikasi Perpustakaan Siap!");
}

// Jalankan fungsi inisialisasi
inisialisasi();
