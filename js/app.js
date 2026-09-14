// =============================================
// DATA BUKU
// Objek yang menyimpan informasi buku pertama
// =============================================

const bukuPertama = {
  judul: "Laskar Pelangi",
  penulis: "Andrea Hirata",
  tahunTerbit: 2005,
  kategori: "Fiksi",
  jumlahHalaman: 529,
  isbn: "978-979-1477-74-9",
  tersedia: true,
  stok: 3,
  dipinjam: 1,
};

// =============================================
// DATA KOLEKSI
// Statistik ringkasan perpustakaan
// =============================================

const statistikPerpus = {
  totalKoleksi: 1250,
  totalDipinjam: 187,
  totalMember: 842,
};

// =============================================
// FUNGSI RENDER
// Mengubah data menjadi HTML yang tampil di browser
// =============================================

function buatKartuBuku(buku) {
  // Tentukan badge status berdasarkan ketersediaan buku
  const kelasStatus = buku.tersedia ? "badge-tersedia" : "badge-dipinjam";
  const teksStatus = buku.tersedia ? "Tersedia" : "Sedang Dipinjam";

  // Hitung stok yang tersedia sekarang
  const stokTersedia = buku.stok - buku.dipinjam;

  // Bangun string HTML untuk kartu buku
  const htmlKartu = `
    <div class="kartu-buku">
      <h3 class="kartu-judul">${buku.judul}</h3>
      <p class="kartu-penulis">oleh ${buku.penulis}</p>

      <div class="kartu-detail">
        <div class="kartu-item">
          Tahun Terbit: <span>${buku.tahunTerbit}</span>
        </div>
        <div class="kartu-item">
          Kategori: <span>${buku.kategori}</span>
        </div>
        <div class="kartu-item">
          Halaman: <span>${buku.jumlahHalaman} hlm</span>
        </div>
        <div class="kartu-item">
          Stok Tersedia: <span>${stokTersedia} dari ${buku.stok}</span>
        </div>
        <div class="kartu-item">
          ISBN: <span>${buku.isbn}</span>
        </div>
      </div>

      <span class="badge-status ${kelasStatus}">${teksStatus}</span>
    </div>
  `;

  return htmlKartu;
}

function buatRingkasan(statistik) {
  const htmlRingkasan = `
    <div class="ringkasan-grid">
      <div class="ringkasan-item">
        <span class="ringkasan-angka">
          ${statistik.totalKoleksi.toLocaleString("id-ID")}
        </span>
        <p class="ringkasan-label">Total Koleksi</p>
      </div>
      <div class="ringkasan-item">
        <span class="ringkasan-angka">
          ${statistik.totalDipinjam.toLocaleString("id-ID")}
        </span>
        <p class="ringkasan-label">Sedang Dipinjam</p>
      </div>
      <div class="ringkasan-item">
        <span class="ringkasan-angka">
          ${statistik.totalMember.toLocaleString("id-ID")}
        </span>
        <p class="ringkasan-label">Total Member</p>
      </div>
    </div>
  `;

  return htmlRingkasan;
}

// =============================================
// INISIALISASI
// Jalankan saat halaman siap
// =============================================

function inisialisasiHalaman() {
  // Ambil elemen target dari DOM
  const kontainerBuku = document.getElementById("kontainer-buku");
  const kontainerRingkasan = document.getElementById("kontainer-ringkasan");

  // Render kartu buku ke halaman
  kontainerBuku.innerHTML = buatKartuBuku(bukuPertama);

  // Render ringkasan ke halaman
  kontainerRingkasan.innerHTML = buatRingkasan(statistikPerpus);

  // Log konfirmasi ke Console
  console.log("Perpus berhasil diinisialisasi");
  console.log("Buku ditampilkan:", bukuPertama.judul);
  console.log("Total koleksi:", statistikPerpus.totalKoleksi);
}

// Jalankan inisialisasi
inisialisasiHalaman();
