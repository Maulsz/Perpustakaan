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

/**
 * FUNGSI: membuat struktur HTML untuk kartu buku
 * PARAMETER: objek 'buku' yang berisi detail buku
 * RETURN: string HTML yang siap dimasukkan ke DOM
 */
function buatKartuBuku(buku) {
  // 1. Logika Kondisi: Tentukan nama kelas CSS & teks status berdasarkan ketersediaan (true/false)
  const kelasStatus = buku.tersedia ? "badge-tersedia" : "badge-dipinjam";
  const teksStatus = buku.tersedia ? "Tersedia" : "Sedang Dipinjam";

  // 2. Kalkulasi: Hitung sisa stok buku fisik yang belum dipinjam
  const stokTersedia = buku.stok - buku.dipinjam;

  // 3. Template HTML: Merakit layout kartu dengan menyisipkan data variabel menggunakan ${}
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

/**
 * FUNGSI: membuat struktur HTML untuk statistik/ringkasan perpustakaan
 * PARAMETER: objek 'statistik' yang berisi data total angka
 * RETURN: string HTML yang siap dimasukkan ke DOM
 */
function buatRingkasan(statistik) {
  // Template HTML: Merakit tampilan grid angka statistik
  const htmlRingkasan = `
  <div class="ringkasan-grid">
      <div class="ringkasan-item">
        <span class="ringkasan-angka">
          <!-- .toLocaleString("id-ID") mengubah angka biasa menjadi format ribuan Indonesia (contoh: 1250 -> 1.250) -->
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

  // .innerHTML adalah properti DOM yang berfungsi menyuntikkan/menampilkan string HTML ke dalam elemen target di halaman web
  kontainerBuku.innerHTML = buatKartuBuku(bukuPertama);

  // Render ringkasan ke halaman
  kontainerRingkasan.innerHTML = buatRingkasan(statistikPerpus);

  // Log konfirmasi ke console
  console.log("Perpus berhasil di inisialisasi");
  console.log("Buku ditampilkan: ", bukuPertama.judul);
  console.log("Total koleksi: ", statistikPerpus.totalKoleksi);
}

// Jalankan inisialisasi
inisialisasiHalaman();
