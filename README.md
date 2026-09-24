# 📚 Perpus Hebat — Perpustakaan Digital

Aplikasi web sederhana (vanilla HTML/CSS/JS, tanpa framework) untuk menampilkan koleksi buku, dengan fitur filter kategori dan pencarian judul/penulis.

---

## Struktur File

```
perpustakaan/
├── index.html      # Struktur halaman (markup)
├── css/style.css   # Semua styling/tampilan
└── js/app.js       # Data buku + seluruh logic aplikasi
```

Tidak ada backend/database — semua data buku disimpan langsung di dalam `app.js` sebagai array of objects (`koleksiBuku`).

---

## 1. `index.html` — Struktur Halaman

Bagian penting:

- `<header>` — judul & tagline.
- `#input-search` + `#tombol-hapus-search` — kotak pencarian dan tombol "✕" untuk menghapus kata kunci (tombol ini disembunyikan lewat `style="display:none"` sampai user mengetik sesuatu).
- `#tombol-filter` — kontainer kosong, tombol-tombol kategori (Semua, Fiksi, Sains, dst.) di-render oleh JavaScript, bukan ditulis manual di HTML.
- `#info-jumlah` — teks kecil yang menampilkan berapa buku sedang ditampilkan.
- `#kontainer-buku` — kontainer kosong tempat kartu-kartu buku di-render.
- Ada beberapa blok `<!-- komentar -->` berisi kode section "Ringkasan Koleksi" yang sengaja dinonaktifkan (belum dipakai) — sisa dari versi sebelumnya.

**Prinsip di sini:** HTML hanya menyediakan "wadah" kosong (`div`/`section` dengan `id`), lalu JavaScript yang mengisi kontennya secara dinamis. Ini pola umum di vanilla JS: render via `innerHTML`.

---

## 2. `css/style.css` — Styling

Tidak ada logic, murni tampilan. Beberapa hal yang perlu diketahui karena berhubungan langsung dengan class yang dipakai `app.js`:

| Class CSS                                    | Fungsi                                                         |
| -------------------------------------------- | -------------------------------------------------------------- |
| `.tombol-filter.aktif`                       | Menandai tombol kategori yang sedang dipilih (background biru) |
| `.badge-stok-tersedia` / `.badge-stok-habis` | Warna badge stok (hijau/merah)                                 |
| `.highlight`                                 | Background kuning untuk kata kunci yang cocok saat searching   |
| `.pesan-kosong`                              | Tampilan saat hasil filter/pencarian kosong                    |
| `.grid-buku`                                 | Grid responsif (`auto-fill`, minimal 280px per kartu)          |

> **Catatan:** ada beberapa class "sisa" (`.kartu-judul`, `.kartu-detail`, `.badge-status`, `.ringkasan-*`) yang didefinisikan tapi **tidak dipakai** lagi oleh HTML/JS saat ini — kemungkinan peninggalan dari desain versi awal sebelum diganti menjadi `.kartu-buku` / `.kartu-judul-buku`.

---

## 3. `js/app.js` — Otak Aplikasi

### a. Data (`koleksiBuku`) — baris 4–69

```js
const koleksiBuku = [
  { id: 1, judul: "Laskar Pelangi", penulis: "Andrea Hirata",
    kategori: "Fiksi", stok: 3, rating: 4.8 },
  ...
];
```

- Ini adalah **array of objects**: satu array (`[...]`) yang isinya banyak object (`{...}`), tiap object mewakili satu buku.
- Anggap saja seperti tabel Excel: tiap baris = 1 object, tiap kolom = 1 properti (`judul`, `penulis`, `kategori`, `stok`, `rating`).
- Ini **satu-satunya sumber data** di seluruh aplikasi. Tidak ada database, tidak ada `fetch()` ke server — semua "hardcoded" langsung di file JS.
- Semua fungsi di bawah **hanya membaca** array ini (pakai `.map()`, `.filter()`, dll) dan **tidak pernah mengubah isinya langsung**. Yang berubah hanya _tampilan_ di layar, datanya tetap sama dari awal sampai akhir.

### b. Utility Functions (logic murni, tidak menyentuh DOM)

Fungsi-fungsi di bagian ini sifatnya "hitung-hitungan" saja: terima data masuk, hasilkan data baru keluar. Tidak ada `document.getElementById` di sini.

#### `ambilKategori(koleksi)` — baris 75–78

```js
function ambilKategori(koleksi) {
  const kategoriSet = new Set(koleksi.map((b) => b.kategori));
  return ["Semua", ...kategoriSet];
}
```

1. `koleksi.map((b) => b.kategori)` → dari array buku, ambil **hanya** properti `kategori` dari tiap buku → hasilnya array seperti `["Fiksi", "Fiksi", "Sains", "Non-fiksi", "Fiksi", "Non-fiksi", "Sains", "Fiksi"]` (banyak yang double/duplikat).
2. `new Set(...)` → `Set` adalah struktur data yang **otomatis membuang duplikat**. Jadi hasil di atas jadi cuma: `{"Fiksi", "Sains", "Non-fiksi"}`.
3. `["Semua", ...kategoriSet]` → tanda `...` (spread operator) "membongkar" isi Set jadi elemen-elemen array biasa, lalu ditaruh **setelah** `"Semua"`. Hasil akhir: `["Semua", "Fiksi", "Sains", "Non-fiksi"]`.

**Kenapa penting:** array inilah yang nanti dipakai untuk membuat tombol filter kategori secara otomatis — kalau suatu saat ada kategori baru ditambahkan ke `koleksiBuku`, tombol filternya **otomatis muncul**, tidak perlu edit HTML manual.

#### `filterBukuByKategori(koleksi, kategori)` — baris 80–83

```js
function filterBukuByKategori(koleksi, kategori) {
  if (kategori === "Semua") return koleksi;
  return koleksi.filter((buku) => buku.kategori === kategori);
}
```

1. Kalau parameter `kategori` adalah string `"Semua"` → langsung kembalikan seluruh `koleksi` apa adanya.
2. Kalau bukan `"Semua"` (misal `"Fiksi"`) → pakai `.filter()`: untuk tiap `buku`, cek apakah `buku.kategori === kategori` benar. Kalau benar, buku itu dipertahankan; kalau salah, dibuang.

#### `filterGabungan(koleksi, kategori, keyword)` — baris 85–96

```js
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
```

Ini fungsi filter **paling penting** karena menggabungkan 2 jenis filter sekaligus (kategori + kata kunci pencarian):

1. `let hasil = filterBukuByKategori(...)` → filter dulu berdasarkan kategori. Kalau kategori `"Semua"`, `hasil` sama dengan `koleksi` utuh.
2. `if (!keyword.trim()) return hasil;` → `.trim()` menghapus spasi kosong di depan/belakang teks. Kalau user tidak mengetik apa-apa, langsung kembalikan `hasil` filter kategori saja.
3. `const kw = keyword.trim().toLowerCase();` → keyword dibersihkan spasi, lalu diubah semua jadi huruf kecil, supaya pencarian **tidak peka huruf besar/kecil**.
4. `hasil.filter((b) => b.judul.toLowerCase().includes(kw) || b.penulis.toLowerCase().includes(kw))` → pertahankan buku HANYA jika judulnya **mengandung** `kw`, ATAU penulisnya mengandung `kw`.

**Alur datanya:** `Semua Buku` → (disaring kategori) → (disaring keyword) → `Hasil Akhir`. Kedua filter ini **selalu jalan berurutan**, tidak pernah tumpang tindih atau saling menimpa.

#### `highlightKeyword(teks, keyword)` — baris 98–104

```js
function highlightKeyword(teks, keyword) {
  if (!keyword.trim()) return teks;
  const kw = keyword.trim();
  const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${kwEscaped})`, "gi");
  return teks.replace(regex, '<span class="highlight">$1</span>');
}
```

Fungsi ini yang bikin kata yang dicari jadi **berwarna kuning** di layar:

1. `if (!keyword.trim()) return teks;` → kalau tidak ada keyword, kembalikan teks aslinya.
2. `kwEscaped` → meng-_escape_ karakter spesial regex (`. * + ? ( )` dst) supaya diperlakukan sebagai teks biasa, bukan perintah regex. `$&` artinya "karakter yang barusan cocok".
3. `new RegExp(\`(${kwEscaped})\`, "gi")`→ membuat pola pencarian, dibungkus tanda kurung`(...)`supaya bisa "ditangkap" dan dipakai lagi (lihat`$1`). Flag `g`= *global* (semua kemunculan), flag`i` = _insensitive_ (tidak peduli besar/kecil huruf).
4. `teks.replace(regex, '<span class="highlight">$1</span>')` → setiap bagian teks yang cocok dibungkus `<span class="highlight">...</span>`. `$1` = isi yang ditangkap tadi.

Contoh: `highlightKeyword("Bumi Manusia", "bumi")` → `'<span class="highlight">Bumi</span> Manusia'`.

### c. Render Functions (fungsi yang "menggambar" HTML ke layar)

Fungsi-fungsi di sini **menyentuh DOM**, lewat `document.getElementById(...)` dan `.innerHTML = ...`.

#### `renderKartuBuku(buku, keyword = "")` — baris 110–129

```js
function renderKartuBuku(buku, keyword = "") {
  const badgeStokKelas =
    buku.stok > 0 ? "badge-stok-tersedia" : "badge-stok-habis";
  const badgeStokTeks = buku.stok > 0 ? `${buku.stok} tersisa` : "Habis";

  const judulTampil = highlightKeyword(buku.judul, keyword);
  const penulisTampil = highlightKeyword(buku.penulis, keyword);

  return `
  <div class="kartu-buku"> ... </div>
  `;
}
```

Fungsi ini menerima **satu** buku, dan mengubahnya jadi **satu string HTML** (belum ditampilkan, cuma "dicetak" jadi teks dulu).

1. Ternary operator (`kondisi ? nilaiJikaTrue : nilaiJikaFalse`) dipakai untuk menentukan class badge dan teks badge berdasarkan `stok`.
2. `judulTampil` dan `penulisTampil` diproses dulu lewat `highlightKeyword()` sebelum dipakai.
3. Fungsi ini `return` sebuah **template literal** (backtick `` ` ``) berisi markup HTML kartu buku, dengan variabel disisipkan pakai `${...}`.
4. **Default parameter** `keyword = ""` artinya: kalau fungsi dipanggil tanpa argumen kedua, `keyword` otomatis string kosong (highlight tidak jalan, aman).

#### `renderTombolFilter(kategoriList, kategoriAktif)` — baris 132–146

```js
function renderTombolFilter(kategoriList, kategoriAktif) {
  const kontainer = document.getElementById("tombol-filter");
  kontainer.innerHTML = kategoriList
    .map(
      (kat) => `
      <button class="tombol-filter ${kat === kategoriAktif ? "aktif" : ""}"
        data-kategori="${kat}">
        ${kat}
      </button>
    `,
    )
    .join("");
}
```

1. Ambil elemen `<div id="tombol-filter">` dari `index.html` (kosong, akan diisi di sini).
2. `.map()` — untuk setiap kategori dalam array, buat satu string `<button>...</button>`.
3. `${kat === kategoriAktif ? "aktif" : ""}` → kalau kategori ini sama dengan kategori aktif, tambahkan class `"aktif"` (tombol jadi biru sesuai CSS).
4. `data-kategori="${kat}"` → _data attribute_, "label tersembunyi" supaya JavaScript tahu kategori apa yang diwakili tombol ini saat diklik.
5. `.join("")` → menyatukan array string jadi satu string panjang.
6. `kontainer.innerHTML = ...` → tombol-tombol **muncul di layar**.

#### `renderDaftarBuku(koleksi, keyword = "", kategori = "Semua")` — baris 148–175

```js
function renderDaftarBuku(koleksi, keyword = "", kategori = "Semua") {
  const kontainer = document.getElementById("kontainer-buku");
  const infoJumlah = document.getElementById("info-jumlah");

  const filterAktif = [];
  if (kategori !== "Semua") filterAktif.push(`kategori: "${kategori}"`);
  if (keyword.trim()) filterAktif.push(`kata kunci: "${keyword.trim()}"`);

  const infoFilter =
    filterAktif.length > 0 ? ` (filter: ${filterAktif.join(", ")})` : "";

  if (koleksi.length === 0) {
    kontainer.innerHTML = `<div class="pesan-kosong">...</div>`;
    infoJumlah.textContent = `0 buku ditemukan${infoFilter}`;
    return;
  }

  kontainer.innerHTML = koleksi
    .map((b) => renderKartuBuku(b, keyword))
    .join("");
  infoJumlah.textContent = `Menampilkan ${koleksi.length} buku${infoFilter}`;
}
```

1. Ambil 2 elemen HTML yang akan diisi: kontainer kartu buku dan teks info jumlah.
2. `filterAktif` → array kosong yang menampung potongan teks keterangan filter yang sedang aktif (kategori dan/atau keyword).
3. `infoFilter` → gabungkan potongan itu dengan koma dan bungkus dalam kurung, atau string kosong kalau tidak ada filter aktif.
4. **Cek kondisi kosong:** kalau tidak ada buku yang lolos filter, tampilkan pesan "Tidak ada buku yang cocok" + update info jumlah, lalu `return` (menghentikan fungsi, baris di bawahnya tidak dijalankan).
5. Kalau lolos: `.map()` ubah tiap object buku jadi string HTML kartu, `.join("")` satukan, lalu tampilkan via `innerHTML`.
6. Update teks info jumlah.

### d. Event Handling (bagian yang "mendengarkan" aksi user)

#### `debounce(fn, delay)` — baris 182–188

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

Fungsi generik (tidak spesifik untuk buku). Konsepnya seperti tombol lift/elevator: pintu tidak langsung menutup begitu ditekan sekali, tapi menunggu sebentar kalau-kalau ada yang menekan lagi.

1. Menerima fungsi apa saja (`fn`) dan jeda waktu (`delay`, dalam milidetik).
2. `let timer;` → variabel untuk menyimpan "jam alarm" (`setTimeout`) yang sedang berjalan.
3. `debounce` **mengembalikan fungsi baru** (bukan langsung menjalankan `fn`). Fungsi baru inilah yang dipasang sebagai event listener.
4. Tiap kali fungsi baru dipanggil: `clearTimeout(timer)` **membatalkan** alarm sebelumnya, lalu `setTimeout(..., delay)` memasang alarm **baru** yang baru berbunyi setelah `delay` ms tanpa pemanggilan baru lagi.
5. Efeknya: kalau user mengetik cepat 5 huruf berturut-turut dalam waktu kurang dari 300ms, `fn` **hanya dijalankan sekali**, bukan 5 kali.

> ⚠️ Catatan: `debounce` **didefinisikan** tapi tidak dipakai dengan benar di alur utama — lihat bagian "Bug" di bawah.

#### `setupSearchEvents(getStateAktif)` — baris 190–215

```js
function setupSearchEvents(getStateAktif) {
  const inputSearch = document.getElementById("input-search");
  const tombolHapus = document.getElementById("tombol-hapus-search");

  inputSearch.addEventListener("input", function () {
    const keyword = this.value;
    const { kategori } = getStateAktif();
    tombolHapus.style.display = keyword ? "block" : "none";
    const hasil = filterGabungan(koleksiBuku, kategori, keyword);
    renderDaftarBuku(hasil, keyword, kategori);
  });

  tombolHapus.addEventListener("click", function () {
    inputSearch.value = "";
    this.style.display = "none";
    inputSearch.focus();
    const { kategori } = getStateAktif();
    const hasil = filterGabungan(koleksiBuku, kategori, "");
    renderDaftarBuku(hasil, "", kategori);
  });
}
```

Parameter `getStateAktif` adalah **sebuah fungsi** (callback) yang kalau dipanggil (`getStateAktif()`) akan mengembalikan object `state` yang **terkini** — penting karena state (kategori aktif) bisa berubah kapan saja lewat klik tombol filter, jadi harus selalu "ditanya ulang" tiap dibutuhkan.

**Listener pertama — mengetik di kotak pencarian:**

1. `"input"` → event yang terpicu **setiap kali** isi kotak teks berubah (per ketukan huruf, termasuk hapus/paste).
2. `const keyword = this.value;` → `this` merujuk ke elemen yang memicu event (`inputSearch`); `.value` adalah teks yang sedang diketik.
3. `const { kategori } = getStateAktif();` → _object destructuring_: memanggil `getStateAktif()` yang mengembalikan `{ kategori: "Fiksi" }`, lalu langsung mengambil propertinya.
4. `tombolHapus.style.display = keyword ? "block" : "none";` → tombol "✕" muncul kalau ada isi keyword, sembunyi kalau kosong.
5. `filterGabungan(...)` lalu `renderDaftarBuku(...)` → filter data sesuai kategori aktif + keyword terbaru, lalu render ulang.

> Listener ini **langsung** jalan tanpa debounce — tiap 1 huruf diketik langsung difilter & dirender ulang (tidak masalah untuk data sekecil ini, tapi kalau datanya ribuan baris idealnya pakai debounce).

**Listener kedua — klik tombol "✕" (hapus pencarian):**

1. `inputSearch.value = ""` → mengosongkan isi kotak teks.
2. `this.style.display = "none"` → `this` adalah `tombolHapus` → tombol disembunyikan lagi.
3. `inputSearch.focus()` → kursor otomatis kembali ke kotak pencarian.
4. Filter & render ulang dengan keyword dipaksa `""` (kosong).

#### `inisialisasi()` — baris 220–254

```js
function inisialisasi() {
  const kategoriList = ambilKategori(koleksiBuku);
  const state = { kategori: "Semua" };

  renderTombolFilter(kategoriList, state.kategori);
  renderDaftarBuku(koleksiBuku, "", state.kategori);

  const kontainerFilter = document.getElementById("tombol-filter");
  kontainerFilter.addEventListener("click", function (event) {
    const tombol = event.target.closest(".tombol-filter");
    if (!tombol) return;

    state.kategori = tombol.dataset.kategori;
    const keyword = document.getElementById("input-search").value;

    renderTombolFilter(kategoriList, state.kategori);
    const hasil = filterGabungan(koleksiBuku, state.kategori, keyword);
    renderDaftarBuku(hasil, keyword, state.kategori);
  });

  setupSearchEvents(() => state);
}

inisialisasi();
```

Fungsi "sutradara" yang mengatur semua yang terjadi saat halaman pertama kali dibuka.

1. `kategoriList` → siapkan daftar kategori sekali di awal.
2. `const state = { kategori: "Semua" };` → **satu-satunya "memori"** aplikasi ini. Karena `const`, variabel `state` sendiri tidak bisa diganti jadi object lain — tapi **isi propertinya** (`state.kategori`) tetap bisa diubah kapan saja (bukan pelanggaran aturan `const`, karena `const` hanya mengunci _referensi_, bukan isi object-nya).
3. Render awal → menampilkan tombol filter dan semua buku untuk pertama kali.
4. `kontainerFilter.addEventListener("click", ...)` → contoh **event delegation**: listener dipasang **sekali saja** di elemen induk (`#tombol-filter`), bukan di setiap tombol satu-satu (karena tombol dibuat dinamis).
   - `event.target` → elemen paling spesifik yang benar-benar diklik user.
   - `.closest(".tombol-filter")` → naik ke atas dari `event.target` mencari elemen terdekat yang punya class `.tombol-filter`.
   - `if (!tombol) return;` → kalau user mengklik area kosong, `.closest()` mengembalikan `null` → fungsi dihentikan.
5. `state.kategori = tombol.dataset.kategori;` → update "memori" kategori aktif.
6. Ambil `keyword` yang sedang ada di kotak pencarian (supaya ganti kategori **tidak menghapus** kata kunci yang sedang dicari).
7. Render ulang tombol filter dan daftar buku sesuai kategori + keyword terbaru.
8. `setupSearchEvents(() => state);` → pasang event listener pencarian, mengoper arrow function `() => state` sebagai `getStateAktif`. Fungsi ini selalu mengembalikan `state` **paling baru** (bukan salinan lama), karena `state` diakses lewat _closure_ — konsep JavaScript di mana fungsi bagian dalam "ingat" variabel dari fungsi luar tempat ia dibuat.
9. `inisialisasi();` (di luar semua fungsi) → ini yang benar-benar **menjalankan** semuanya begitu `app.js` selesai dimuat.

---

## ⚠️ Bug yang Ditemukan di `inisialisasi()`

Di akhir `inisialisasi()`, ada kode tambahan:

```js
const handleSearch = debounce(function () {
  const keyword = inputSearch.value;
  const { kategori } = getStateAktif();
  tombolHapus.style.display = keyword ? "block" : "none";
  ...
}, 300);
inputSearch.addEventListener("input", handleSearch);
```

Ini **akan error** (`ReferenceError`) saat dijalankan, karena:

- `inputSearch`, `tombolHapus`, dan `getStateAktif` **tidak pernah dideklarasikan** di scope `inisialisasi()` — variabel-variabel itu hanya ada di dalam `setupSearchEvents()`, bukan di sini.
- Akibatnya, dua listener `input` terpasang pada kotak pencarian: satu yang benar (dari `setupSearchEvents`, langsung tanpa debounce) dan satu lagi yang rusak (`handleSearch`, memakai debounce tapi variabelnya undefined).
- Fitur pencarian akan **tetap berfungsi** (listener pertama tetap jalan), tapi setiap kali user mengetik, setelah jeda 300ms akan muncul error di console browser dari listener kedua.

**Cara memperbaiki:** hapus blok `handleSearch` + `addEventListener` tambahan itu, karena fungsinya sudah ter-cover oleh `setupSearchEvents()`. Kalau ingin pakai debounce, sebaiknya debounce dipasang _di dalam_ `setupSearchEvents()`, langsung membungkus listener `input` yang sudah ada di sana.

---

## Bonus: Penjelasan Simpel Array Method (`.map()`, `.filter()`, `.join()`)

Tiga method ini paling sering muncul di `app.js`.

### `.map()` — "ubah setiap barang jadi barang baru"

Bayangin kamu punya keranjang buah, terus tiap buah kamu bungkus pakai plastik. **Jumlah buahnya tetap sama**, cuma bentuknya berubah.

```js
const angka = [1, 2, 3];
const hasil = angka.map((n) => n * 2);
// hasil = [2, 4, 6]
```

Di kode kamu: `koleksi.map((b) => b.kategori)` — dari array **buku** (object lengkap), diubah jadi array **kategori** saja (string). 8 buku masuk → 8 kategori keluar.

**Intinya:** `.map()` dipakai kalau kamu mau **jumlah data tetap sama**, tapi bentuknya diubah.

### `.filter()` — "saring, buang yang gak lolos"

Bayangin nyaring pasir pakai ayakan — cuma butiran yang cukup kecil yang lolos. **Jumlah datanya bisa berkurang**.

```js
const angka = [1, 2, 3, 4, 5];
const genap = angka.filter((n) => n % 2 === 0);
// genap = [2, 4]
```

Di kode kamu: `koleksi.filter((buku) => buku.kategori === kategori)` — tiap buku dicek satu-satu, kalau cocok masuk hasil, kalau tidak dibuang.

|                    | `.map()`        | `.filter()`                     |
| ------------------ | --------------- | ------------------------------- |
| Fungsi di dalamnya | mengubah bentuk | jawab ya/tidak (`true`/`false`) |
| Jumlah hasil       | selalu sama     | bisa lebih sedikit              |
| Analoginya         | bungkus plastik | ayakan pasir                    |

### `.join()` — "satukan jadi satu string, dikasih lem di antaranya"

`.join()` bekerja di **array**, mengubahnya jadi **satu string panjang**, dengan "lem" (separator) di antara tiap elemen.

```js
const buah = ["apel", "jeruk", "mangga"];
buah.join(", "); // "apel, jeruk, mangga"
buah.join(""); // "apeljerukmangga"  (tanpa lem sama sekali)
```

Di kode kamu: `koleksi.map((b) => renderKartuBuku(b, keyword)).join("")`:

1. `.map()` dulu → array berisi 8 string HTML terpisah.
2. `.join("")` → semua string digabung jadi **satu string besar** tanpa pemisah (kalau ada koma/spasi, akan merusak tampilan HTML). Hasilnya baru bisa dimasukkan ke `innerHTML`.

**Kenapa harus `.join("")` dulu, gak langsung dari `.map()`?** Karena `.map()` hasilnya **array**, sedangkan `innerHTML` cuma bisa menerima **satu string**, bukan array.

### Ringkasan Super Simpel

| Method      | Analoginya          | Pertanyaan yang dijawab                 |
| ----------- | ------------------- | --------------------------------------- |
| `.map()`    | Bungkus tiap barang | "Tiap item mau diubah jadi apa?"        |
| `.filter()` | Ayak/saring         | "Item ini dipertahankan atau dibuang?"  |
| `.join()`   | Rekatkan jadi satu  | "Gimana cara gabungin array jadi teks?" |

Pola yang sering dipakai berulang: `array.map(...).join("")` — artinya **"ubah tiap item jadi HTML, lalu satukan semuanya jadi satu blok teks HTML."**

---

## Alur Kerja Aplikasi Secara Keseluruhan

```
Halaman dimuat
   └─▶ inisialisasi()
         ├─▶ render tombol filter kategori
         ├─▶ render semua buku (state awal: kategori "Semua", tanpa keyword)
         ├─▶ pasang listener klik pada tombol-tombol filter
         └─▶ pasang listener pada kotak search + tombol hapus

User klik tombol kategori
   └─▶ state.kategori diperbarui
         └─▶ filterGabungan() → renderDaftarBuku() (ikut keyword yang sedang aktif)

User mengetik di kotak search
   └─▶ filterGabungan() (kategori aktif + keyword baru) → renderDaftarBuku()
         └─▶ highlightKeyword() menandai kata yang cocok di judul/penulis

User klik tombol "✕"
   └─▶ keyword dikosongkan → render ulang tanpa keyword
```

Singkatnya: **satu sumber data (`koleksiBuku`) → dua filter yang bisa digabung (kategori + keyword) → hasil filter dirender ulang ke DOM setiap ada perubahan.** Tidak ada state management library — semua state hanya disimpan di satu object `state` biasa di dalam `inisialisasi()`.

---

## 4. DOM dan Async dalam Aplikasi

### 4.1 DOM (Document Object Model)

#### 4.1.1 Apa itu DOM, sebenarnya?

DOM adalah **antarmuka pemrograman** (programming interface) berbasis objek yang disediakan oleh browser — bukan bagian dari bahasa JavaScript itu sendiri. JavaScript sebagai bahasa tidak tahu apa-apa soal HTML atau halaman web; kemampuan itu "dipinjamkan" oleh browser lewat objek global `window` dan `document`. Karena itu DOM disebut **Web API**, bukan fitur inti JavaScript (mirip seperti `fetch`, `setTimeout`, atau `localStorage` — semuanya "titipan" browser).

Ketika browser memuat `index.html`, ia melewati beberapa tahap:

1. **Parsing HTML** — browser membaca teks HTML karakter demi karakter, mengenali tag-tag pembuka/penutup, atribut, dan teks di antaranya.
2. **Membangun DOM tree** — dari hasil parsing itu, browser menyusun **struktur pohon (tree)** di memori. Setiap bagian dari HTML menjadi sebuah **node** (objek), dan ada beberapa jenis node:
   - **Element node** — mewakili tag, misal `<div>`, `<button>`, `<input>`.
   - **Text node** — mewakili teks polos di antara tag, misal kata "Perpus Hebat" di dalam `<h1>`.
   - **Attribute node** — mewakili atribut seperti `id="kontainer-buku"` atau `class="tombol-filter"` (di JS modern biasanya diakses lewat properti seperti `.id`, `.className`, bukan sebagai node terpisah).
   - **Comment node** — mewakili `<!-- komentar -->` (inilah kenapa blok "Ringkasan Koleksi" yang dikomentari di `index.html` tetap "ada" di DOM sebagai comment node, walau tidak tampil di layar).
3. **Membangun CSSOM** — secara paralel, browser juga mem-parsing `style.css` menjadi struktur objek serupa untuk styling (CSS Object Model).
4. **Render tree, layout, paint** — DOM tree + CSSOM digabung jadi _render tree_ (hanya elemen yang benar-benar akan tampil), lalu browser menghitung posisi & ukuran tiap elemen (_layout_/_reflow_), baru akhirnya menggambar piksel-piksel ke layar (_paint_).

```
document
 └── html
      ├── head
      │    └── title
      └── body
           ├── header
           ├── div#input-search
           ├── div#tombol-filter      ← kosong di HTML, diisi JS
           └── div#kontainer-buku     ← kosong di HTML, diisi JS
```

Karena struktur ini berupa **objek JavaScript** yang hidup di memori (bukan lagi teks HTML), ia bisa dibaca, diubah, ditambah, atau dihapus lewat kode kapan saja **setelah** halaman selesai dimuat — inilah yang membuat halaman web bisa jadi "hidup" dan interaktif, bukan sekadar dokumen statis yang dibaca sekali lalu diam.

> **Penting dibedakan:** mengubah DOM (lewat JS) **tidak** mengubah file `index.html` yang tersimpan di disk. Perubahan hanya terjadi di "salinan hidup" yang ada di memori browser saat itu — kalau halaman di-refresh, semua perubahan JS hilang dan DOM dibangun ulang dari `index.html` yang asli.

#### 4.1.2 Kenapa `index.html` di proyek ini sengaja "kosong"?

Lihat lagi `#tombol-filter` dan `#kontainer-buku` — keduanya cuma `<div>` kosong di HTML. Ini **pola yang disengaja**, sering disebut _"HTML sebagai kerangka, JS sebagai pengisi"_: HTML hanya menyediakan "titik jangkar" (anchor point) lewat `id`, sedangkan **isi sebenarnya dibangun oleh JavaScript saat halaman berjalan**. Keuntungannya:

- Data (`koleksiBuku`) bisa berubah/bertambah tanpa perlu mengedit HTML sama sekali.
- Konten bisa dibuat ulang (re-render) kapan saja sesuai state terbaru, tanpa reload halaman.
- Satu template HTML kartu buku (di `renderKartuBuku`) dipakai berulang untuk semua data, bukan ditulis manual 8 kali di HTML.

#### 4.1.3 Operasi dasar DOM: mengakses elemen

```js
const kontainer = document.getElementById("kontainer-buku");
```

`document` adalah pintu masuk ke seluruh tree DOM. Beberapa cara mengakses elemen, dari yang dipakai di `app.js` sampai yang umum dipakai proyek lain:

| Method                        | Contoh                                          | Catatan                                                                                                                                           |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getElementById(id)`          | `document.getElementById("kontainer-buku")`     | Dipakai di `app.js`. Cari berdasarkan `id`, harus unik, hasilnya satu elemen atau `null`. Paling cepat secara performa.                           |
| `querySelector(selector)`     | `document.querySelector(".kartu-buku")`         | Pakai selector CSS apa saja (class, id, tag, kombinasi). Mengembalikan elemen **pertama** yang cocok, atau `null`.                                |
| `querySelectorAll(selector)`  | `document.querySelectorAll(".kartu-buku")`      | Sama seperti di atas tapi mengembalikan **semua** yang cocok, berupa `NodeList` (mirip array, bisa di-`.forEach()` tapi bukan array asli).        |
| `getElementsByClassName(cls)` | `document.getElementsByClassName("kartu-buku")` | Mengembalikan `HTMLCollection` yang **live** (otomatis update kalau DOM berubah) — jarang dipakai lagi karena `querySelectorAll` lebih fleksibel. |

Proyek ini hanya memakai `getElementById` karena semua target elemen (`#tombol-filter`, `#kontainer-buku`, `#input-search`, `#tombol-hapus-search`, `#info-jumlah`) sudah punya `id` unik dan hanya perlu diambil satu kali di awal, disimpan ke variabel (`const`), lalu dipakai berulang.

#### 4.1.4 Operasi dasar DOM: mengubah konten & atribut

**a. `innerHTML` — mengganti seluruh isi HTML di dalam elemen**

```js
kontainer.innerHTML = "<div>...</div>";
```

`innerHTML` adalah properti yang mewakili **seluruh isi HTML di dalam** suatu elemen (semua node anaknya). Menimpa properti ini artinya: "hapus semua isi lama elemen ini, lalu bangun ulang node-node baru dari string HTML yang saya kasih". Browser otomatis mem-parsing ulang string itu jadi node-node DOM yang sesungguhnya — persis seperti tahap parsing awal, tapi dijalankan lagi di tengah jalan.

Ini teknik yang dipakai berulang di `app.js`: `renderTombolFilter()` dan `renderDaftarBuku()` sama-sama membangun satu string HTML besar (lewat `.map().join("")`) lalu menimpakannya sekaligus ke `innerHTML`.

> ⚠️ **Konsekuensi performa:** seluruh isi kontainer **dibongkar total dan dibangun ulang dari nol** setiap kali `innerHTML` ditimpa — walaupun sebenarnya cuma 1 dari 8 kartu buku yang berubah. Proses bongkar-pasang ini memicu **reflow** (browser menghitung ulang posisi/ukuran semua elemen) dan **repaint** (menggambar ulang piksel), yang relatif "mahal" secara komputasi. Untuk 8 buku ini tidak terasa sama sekali, tapi kalau datanya ribuan baris dan di-render ulang tiap ketukan keyboard, bisa mulai terasa lag. Ini salah satu alasan utama framework seperti React/Vue populer — mereka memakai _virtual DOM diffing_: membandingkan versi lama vs baru di memori dulu, lalu hanya menyentuh bagian DOM asli yang benar-benar berubah.
>
> ⚠️ **Risiko keamanan:** kalau string yang dimasukkan ke `innerHTML` berasal dari **input user** (bukan data terpercaya seperti `koleksiBuku` yang hardcoded), ini berisiko **XSS** (_Cross-Site Scripting_) — user jahat bisa menyisipkan `<script>` atau atribut event (`onerror="..."`) yang akan ikut dieksekusi browser. Untungnya di proyek ini, satu-satunya input user (`keyword` pencarian) hanya dipakai untuk **membandingkan** teks (`.includes()`), bukan langsung disuntikkan mentah-mentah ke HTML — jadi relatif aman.

**b. `textContent` — mengubah teks polos saja**

```js
infoJumlah.textContent = `Menampilkan ${koleksi.length} buku${infoFilter}`;
```

Dipakai di `renderDaftarBuku()` untuk mengisi teks info jumlah. Beda dengan `innerHTML`, `textContent` **tidak mem-parsing tag HTML sama sekali** — semua karakter (termasuk `<` dan `>`) diperlakukan sebagai teks polos apa adanya. Ini menjadikannya pilihan yang **lebih aman** dan **lebih cepat** dibanding `innerHTML`, kapan pun kamu memang hanya butuh menampilkan teks tanpa markup.

**c. Class dan atribut**

Walau `app.js` menulis class langsung di dalam template string (`class="tombol-filter ${...}"`), cara lain yang umum dipakai untuk mengubah class secara terpisah adalah lewat `classList`:

```js
elemen.classList.add("aktif"); // menambah satu class
elemen.classList.remove("aktif"); // menghapus satu class
elemen.classList.toggle("aktif"); // tambah kalau belum ada, hapus kalau sudah ada
elemen.classList.contains("aktif"); // cek apakah class itu ada → true/false
```

Untuk atribut umum (bukan `class`), ada `setAttribute()`/`getAttribute()`. Khusus atribut yang diawali `data-` (seperti `data-kategori` di proyek ini), browser menyediakan jalan pintas lewat properti `.dataset`:

```js
tombol.dataset.kategori; // otomatis membaca atribut data-kategori
```

Inilah yang dipakai di `inisialisasi()`: `tombol.dataset.kategori` membaca nilai `data-kategori="Fiksi"` yang sebelumnya ditulis oleh `renderTombolFilter()`.

#### 4.1.5 Operasi dasar DOM: membuat elemen secara manual

Alternatif dari `innerHTML` adalah membuat node satu-satu secara eksplisit lewat method DOM asli:

```js
const paragrafBaru = document.createElement("p");
paragrafBaru.textContent = "Data buku berhasil diperbarui secara real-time.";
paragrafBaru.className = "teks-notifikasi";

const containerUtama = document.getElementById("info-status");
containerUtama.appendChild(paragrafBaru);
```

Langkah demi langkah:

1. `document.createElement("p")` → membuat node `<p>` baru **di memori saja**, belum tersambung ke tree DOM yang tampil, jadi belum kelihatan di layar sama sekali.
2. `.textContent = "..."` → mengisi teksnya (aman dari risiko XSS seperti dijelaskan di atas).
3. `.className = "..."` → menempelkan class CSS ke elemen itu (setara `classList.add(...)` untuk penulisan class pertama kali).
4. `containerUtama.appendChild(paragrafBaru)` → baru di langkah ini elemen benar-benar **disisipkan** sebagai anak dari `containerUtama` di dalam tree DOM yang sedang tampil, sehingga langsung muncul di layar.

Method terkait lain yang sering dipakai bersamaan: `removeChild(node)` / `node.remove()` untuk menghapus elemen dari DOM, `insertBefore()` untuk menyisipkan di posisi tertentu (bukan selalu di akhir seperti `appendChild`), dan `parentNode` / `children` / `nextElementSibling` untuk "menjelajah" tree dari satu node ke node tetangganya.

Pendekatan `createElement` + `appendChild` ini lebih "manual" dan lebih banyak baris dibanding pola `.map().join("")` + `innerHTML` yang dipakai `app.js` untuk 8 kartu buku sekaligus — tapi lebih presisi, karena **hanya menambah satu elemen baru**, tanpa membongkar ulang seluruh isi kontainer yang sudah ada.

#### 4.1.6 Event — menjembatani aksi user dan kode

```js
inputSearch.addEventListener("input", function () { ... });
```

`addEventListener(namaEvent, fungsiHandler)` memberitahu browser: "kalau event `namaEvent` terjadi di elemen ini, jalankan `fungsiHandler`". Ini jembatan antara **aksi user** (mengetik, klik, scroll, dll) dan **kode JavaScript** yang meresponsnya — inilah yang membuat halaman terasa interaktif tanpa reload.

Event yang relevan di proyek ini:

| Event     | Terpicu saat                                               | Dipakai di                                   |
| --------- | ---------------------------------------------------------- | -------------------------------------------- |
| `"input"` | Isi `<input>` berubah (tiap ketukan, termasuk paste/hapus) | kotak pencarian                              |
| `"click"` | Elemen diklik                                              | tombol filter (lewat delegation), tombol "✕" |

**Objek `event`:** setiap kali handler dipanggil, browser otomatis mengirim satu argumen — objek `event` — berisi informasi soal kejadian itu. Dua propertinya yang penting dan sering tertukar:

- `event.target` → elemen **paling spesifik** yang **sungguh-sungguh** memicu event (misal, kalau `<button>` punya `<span>` ikon di dalamnya dan user mengklik tepat di ikon itu, `event.target` adalah `<span>`-nya, bukan `<button>`-nya).
- `event.currentTarget` (sama dengan `this` di dalam `function` biasa, bukan arrow function) → elemen tempat listener **dipasang**, selalu tetap sama berapa pun dalam-nya elemen yang sebenarnya diklik.

Perbedaan inilah yang membuat teknik `.closest(".tombol-filter")` di `inisialisasi()` diperlukan — untuk "naik" dari `event.target` (bisa jadi teks di dalam tombol) ke elemen `<button class="tombol-filter">` terdekat.

**Bubbling — kenapa event delegation bisa bekerja:** ketika sebuah event terjadi di elemen anak (misal klik pada `<button>`), browser tidak hanya menjalankan listener yang menempel langsung di `<button>` itu — event itu juga "menggelembung naik" (_bubble up_) melalui setiap elemen induknya secara berurutan, sampai ke `document`. Karena itulah listener yang dipasang di `#tombol-filter` (induk) tetap bisa "mendengar" klik yang sebenarnya terjadi di salah satu `<button>` anaknya.

**Event delegation** (dipakai di `inisialisasi()`) memanfaatkan sifat bubbling ini: menempelkan **satu** listener di elemen induk (`#tombol-filter`), bukan di setiap tombol anak satu-satu. Ini penting karena tombol-tombol filter dibuat ulang secara dinamis (lewat `innerHTML`) — kalau listener dipasang langsung ke tombol lama, listener itu **hilang total** begitu tombol lama dihapus dan diganti tombol baru oleh `renderTombolFilter()`. Dengan event delegation, listener menempel di elemen induk yang tidak pernah diganti, lalu memakai `event.target.closest(...)` untuk mencari tahu elemen anak spesifik mana yang sebenarnya diklik saat itu.

---

### 4.2 Async (Asynchronous)

#### 4.2.1 Masalah yang diselesaikan Async

JavaScript, secara default, berjalan **sinkron dan satu-arah di satu thread saja** (_single-threaded_): baris kode dieksekusi satu per satu dari atas ke bawah, dan baris berikutnya **harus menunggu** baris sebelumnya selesai total sebelum dijalankan. Berbeda dengan bahasa lain yang bisa menjalankan banyak thread sekaligus, JavaScript di browser hanya punya **satu** _call stack_ (tumpukan pemanggilan fungsi yang sedang berjalan) untuk semua kode — termasuk kode yang merender tampilan dan merespons klik.

Ini bukan masalah untuk operasi cepat (menjumlahkan angka, memfilter array kecil seperti `koleksiBuku` yang cuma 8 item). Tapi jadi masalah besar untuk operasi yang **memakan waktu tidak pasti**, terutama:

- **Permintaan jaringan** (network request) ke server — kecepatannya tergantung koneksi internet, jarak server, beban server, dll.
- Membaca file besar, animasi kompleks yang perlu menunggu, atau `setTimeout`/`setInterval` yang sengaja menunda eksekusi.

Kalau operasi lambat ini dijalankan secara sinkron biasa, **thread utama browser (yang sama dipakai untuk menggambar layar dan merespons klik) akan tersita penuh** sampai operasi itu selesai — istilahnya _blocking_. Akibatnya seluruh halaman terasa "hang": tombol tidak bisa diklik, animasi berhenti, scroll macet, sampai proses itu tuntas. Ini pengalaman pengguna yang sangat buruk, apalagi kalau request jaringan butuh beberapa detik.

**Solusi:** jalankan operasi lambat itu secara **asinkron (non-blocking)** — dilempar ke "luar" thread utama (ditangani browser lewat mekanisme _Web API_, bukan oleh JavaScript engine itu sendiri), sementara thread utama tetap bebas mengerjakan hal lain. Begitu operasi latar belakang selesai, hasilnya "dilaporkan balik" ke antrean kode yang menunggunya, untuk dieksekusi begitu thread utama sedang kosong.

#### 4.2.2 Sekilas cara kerjanya: Call Stack, Web API, dan Event Loop

Untuk memahami _kenapa_ baris di luar `await` bisa jalan duluan, ada baiknya tahu gambaran kasar mesin di baliknya (ini yang disebut **Event Loop** di JavaScript):

1. **Call Stack** — tempat fungsi-fungsi yang sedang berjalan "ditumpuk". Kode sinkron biasa (seperti semua fungsi di `app.js`) berjalan sepenuhnya di sini, satu per satu.
2. Ketika kode memanggil sesuatu yang asinkron (`fetch()`, `setTimeout()`, dll), tugas itu **diserahkan ke Web API** milik browser (bukan dikerjakan oleh call stack) — call stack langsung lanjut ke baris berikutnya, tidak menunggu.
3. Setelah tugas asinkron itu selesai di "belakang layar" (misal respons server sudah datang), hasilnya tidak langsung disuntikkan paksa ke call stack — ia dimasukkan dulu ke sebuah **antrean (queue)**.
4. **Event Loop** terus-menerus mengecek: "apakah call stack sudah kosong?" Begitu kosong (semua kode sinkron sudah selesai dijalankan), Event Loop mengambil tugas paling depan dari antrean tadi dan menjalankannya di call stack.

Inilah kenapa di contoh kode `ambilDataProdukDariAPI()`, baris `console.log("Kode ini tetap berjalan duluan...")` yang **ditulis di bawah** justru **tercetak lebih dulu** di console — karena begitu `fetch()` diserahkan ke Web API, call stack langsung lanjut mengeksekusi baris-baris sinkron berikutnya tanpa menunggu, dan hasil `fetch()` baru "masuk giliran" setelah semua kode sinkron di level teratas selesai.

#### 4.2.3 `Promise` — fondasi di balik async

Sebelum `async`/`await` ada (dan tetap jadi fondasinya sampai sekarang), JavaScript memakai objek `Promise` untuk merepresentasikan **"nilai yang _akan_ ada di masa depan"** (belum tentu sekarang). Sebuah Promise punya 3 kemungkinan status, dan hanya bisa berpindah status **satu kali** (sekali selesai, statusnya terkunci):

- **pending** — status awal, masih diproses, belum tahu hasilnya.
- **fulfilled** — berhasil; Promise "resolve" dengan sebuah nilai hasil.
- **rejected** — gagal; Promise "reject" dengan sebuah alasan/error.

Sebelum `async`/`await` populer, Promise biasa dipakai lewat method `.then()` (untuk kasus fulfilled) dan `.catch()` (untuk kasus rejected):

```js
fetch("https://api.tokopedia.com/v1/produk-terbaru")
  .then((response) => response.json())
  .then((dataProduk) => console.log("Data berhasil diterima:", dataProduk))
  .catch((error) => console.error("Gagal terhubung ke server:", error));
```

Cara ini disebut **Promise chaining** — tiap `.then()` mengembalikan Promise baru, sehingga bisa "disambung" berantai. Cara ini valid dan masih dipakai, tapi kalau rantainya panjang, kode jadi menumpuk ke samping (kadang disebut _"callback hell"_ versi Promise) dan agak lebih sulit dibaca dibanding versi `async`/`await`.

`fetch()` (dipakai untuk request HTTP) adalah salah satu fungsi bawaan browser yang **mengembalikan Promise** — begitu juga banyak Web API asinkron lain seperti membaca file, animasi, atau `setTimeout` versi Promise.

#### 4.2.4 `async`/`await` — cara menulis kode asinkron yang terlihat sinkron

`async` dan `await` adalah **sintaks pemanis** (syntactic sugar) di atas Promise, supaya kode asinkron bisa ditulis dan dibaca **seolah-olah** berurutan dari atas ke bawah (seperti kode sinkron biasa), padahal di baliknya tetap non-blocking dan tetap memakai mekanisme Promise + Event Loop yang sama.

```js
async function ambilDataProdukDariAPI() {
  console.log("Memulai proses mengambil data...");

  try {
    const response = await fetch("https://api.tokopedia.com/v1/produk-terbaru");
    const dataProduk = await response.json();
    console.log("Data berhasil diterima:", dataProduk);
  } catch (error) {
    console.error("Gagal terhubung ke server:", error);
  }
}

ambilDataProdukDariAPI();
console.log("Kode ini tetap berjalan duluan tanpa menunggu server merespons!");
```

Dibaca selangkah demi selangkah:

1. **Kata kunci `async`** di depan `function` menandai bahwa fungsi ini **boleh** memakai `await` di dalamnya, dan otomatis membuat fungsi ini **selalu mengembalikan sebuah Promise** — walau di dalam fungsinya tidak terlihat eksplisit menulis `return new Promise(...)`. Kalau fungsi `async` ini di-`return` suatu nilai biasa (misal `return dataProduk`), nilai itu otomatis dibungkus jadi Promise yang fulfilled dengan nilai tersebut.
2. **`await fetch(...)`** — `fetch()` langsung mengirim request ke server dan segera mengembalikan sebuah Promise (statusnya masih _pending_). Kata `await` di depannya memberitahu JavaScript: "jeda dulu **eksekusi fungsi `async` ini saja** (bukan seluruh program, hanya fungsi ini) sampai Promise tadi berubah status jadi fulfilled/rejected, baru lanjut ke baris berikutnya di dalam fungsi ini". Selama menunggu, thread utama browser **tidak diblokir sama sekali** — user tetap bisa scroll, klik, mengetik di tempat lain, karena `await` hanya "menjeda" fungsi itu sendiri, bukan seluruh program.
3. **`const dataProduk = await response.json();`** — respons mentah dari server (`response`) berisi data dalam bentuk _stream_ biner yang belum tentu langsung siap dibaca; `.json()` adalah operasi yang **juga asinkron** (karena mem-parsing body respons menjadi objek JavaScript butuh waktu, walau biasanya sangat singkat), makanya perlu di-`await` lagi secara terpisah.
4. **`try { ... } catch (error) { ... }`** — blok `try/catch` menangkap error yang mungkin terjadi selama proses `await` di dalamnya (misalnya: tidak ada koneksi internet, server mati/timeout, respons bukan JSON yang valid). Kalau salah satu `await` di dalam `try` menghasilkan Promise yang _rejected_, eksekusi langsung melompat ke blok `catch`, sehingga error tertangani rapi tanpa menghentikan seluruh program secara paksa. Tanpa `try/catch`, error semacam ini akan muncul sebagai _"Uncaught (in promise)"_ di console dan berpotensi membuat alur program berhenti tak terduga.
5. **Baris terakhir, `console.log("Kode ini tetap berjalan duluan...")`**, adalah bukti nyata sifat _non-blocking_: baris ini dijalankan **lebih dulu** daripada `console.log("Data berhasil diterima:", ...)` di dalam fungsi `async`, meskipun secara urutan penulisan kode ia ada **di bawah** pemanggilan `ambilDataProdukDariAPI()`. Ini terjadi karena begitu JavaScript sampai di baris `await` pertama (lihat penjelasan Event Loop di atas), ia "menitipkan" sisa fungsi itu untuk dilanjutkan nanti lewat antrean, dan langsung melanjutkan mengeksekusi baris-baris sinkron berikutnya di luar fungsi tanpa menunggu.

#### 4.2.5 Kesalahan umum seputar `async`/`await`

Beberapa jebakan yang sering dialami pemula, relevan untuk dipahami meski belum muncul di `app.js`:

- **Lupa menulis `await`** — memanggil fungsi `async` atau `fetch()` tanpa `await` di depannya membuat variabel hasilnya berisi **objek Promise itu sendiri**, bukan nilai yang sebenarnya diharapkan. Contoh salah: `const data = fetch(url);` — `data` di sini adalah `Promise { <pending> }`, bukan hasil datanya.
- **`await` di dalam `.forEach()`** — `.forEach()` tidak menunggu Promise selesai per iterasi (ia tidak dirancang untuk `async`), sehingga semua panggilan async di dalamnya justru berjalan "serentak tak terkendali" tanpa urutan yang pasti. Untuk memproses array secara asinkron berurutan biasanya dipakai `for...of` biasa yang memang mendukung `await` di dalamnya.
- **Menjalankan beberapa `await` secara berurutan padahal tidak saling bergantung** — kalau ada 3 `fetch()` yang tidak saling membutuhkan hasil satu sama lain, menulisnya berurutan (`await fetch1(); await fetch2(); await fetch3();`) membuatnya berjalan **satu-satu**, padahal bisa lebih cepat kalau dijalankan **bersamaan** lewat `Promise.all([fetch1(), fetch2(), fetch3()])`, yang menunggu ketiganya selesai secara paralel dan baru lanjut setelah **semuanya** fulfilled (atau langsung reject kalau salah satu gagal).

#### 4.2.6 Kenapa `koleksiBuku` di `app.js` **tidak** butuh async?

Ini poin penting yang membedakan proyek Perpus Hebat dari aplikasi dunia nyata: `koleksiBuku` adalah **array yang sudah ada penuh di memori** sejak file `app.js` dimuat — tidak ada jeda waktu, tidak ada ketidakpastian, tidak ada kemungkinan gagal karena jaringan, tidak perlu "menunggu" apa pun dari luar. Membaca/memfilter array yang sudah ada di memori adalah operasi yang **sangat cepat** (hitungan mikrodetik, selesai dalam satu "putaran" call stack yang sama), sehingga aman dilakukan secara sinkron biasa seperti yang sudah dilakukan `filterGabungan()`, `renderDaftarBuku()`, dst — tanpa perlu `async`/`await` sama sekali.

Async **baru dibutuhkan** kalau, misalnya, proyek ini dikembangkan lebih lanjut supaya `koleksiBuku` diambil dari server sungguhan (database buku), bukan hardcoded. Contoh seandainya diterapkan di proyek ini:

```js
async function muatKoleksiDariServer() {
  const response = await fetch("https://contoh-api-perpustakaan.com/buku");
  const koleksiBuku = await response.json();

  const kategoriList = ambilKategori(koleksiBuku);
  renderTombolFilter(kategoriList, "Semua");
  renderDaftarBuku(koleksiBuku, "", "Semua");
}
```

Kalau ini diterapkan, `inisialisasi()` juga perlu jadi `async function inisialisasi()` dan memakai `await muatKoleksiDariServer()` di dalamnya, supaya pemanggilan render awal benar-benar menunggu data datang dulu sebelum dijalankan — biasanya disertai indikator "Memuat data..." di layar selama proses `await` berjalan, supaya user tahu aplikasi sedang bekerja di latar belakang, bukan sekadar macet.

#### 4.2.7 Ringkasan Perbandingan

|                                    | **Sinkron** (kode `app.js` saat ini)                          | **Asinkron** (`async`/`await`, `fetch`)                                                       |
| ---------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Sumber data                        | Sudah ada di memori (`koleksiBuku`)                           | Harus diminta dari server, butuh waktu tak pasti                                              |
| Urutan eksekusi                    | Baris demi baris, tunggu selesai, semua di call stack         | Bisa "melompat" — kode di luar `await` jalan duluan, sisa fungsi dilanjutkan lewat Event Loop |
| Risiko macet UI (blocking)         | Tidak ada (operasi sangat cepat)                              | Ada kalau ditulis sinkron biasa — makanya perlu `async` agar tetap _non-blocking_             |
| Penanganan gagal                   | Tidak perlu (tidak ada yang bisa gagal secara wajar)          | Perlu `try/catch` (jaringan bisa putus, server bisa error/timeout)                            |
| Menjalankan banyak tugas sekaligus | Otomatis berurutan (tidak relevan, semua instan)              | Bisa paralel lewat `Promise.all([...])` kalau tugas-tugas tidak saling bergantung             |
| Contoh di proyek                   | `filterGabungan()`, `renderDaftarBuku()`, semua fungsi render | (belum dipakai, tapi relevan untuk pengembangan lanjutan seperti mengambil data dari API)     |
