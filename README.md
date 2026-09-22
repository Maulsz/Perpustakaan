# 📚 Perpus Hebat — Perpustakaan Digital

Aplikasi web sederhana (vanilla HTML/CSS/JS, tanpa framework) untuk menampilkan
koleksi buku, dengan fitur filter kategori dan pencarian judul/penulis.

## Struktur File

```
perpustakaan/
├── index.html      # Struktur halaman (markup)
├── css/style.css   # Semua styling/tampilan
└── js/app.js       # Data buku + seluruh logic aplikasi
```

Tidak ada backend/database — semua data buku disimpan langsung di dalam
`app.js` sebagai array of objects (`koleksiBuku`).

---

## 1. `index.html` — Struktur Halaman

Bagian penting:

- `<header>` — judul & tagline.
- `#input-search` + `#tombol-hapus-search` — kotak pencarian dan tombol "✕"
  untuk menghapus kata kunci (tombol ini disembunyikan lewat `style="display:none"`
  sampai user mengetik sesuatu).
- `#tombol-filter` — kontainer kosong, tombol-tombol kategori (Semua, Fiksi,
  Sains, dst.) di-render oleh JavaScript, bukan ditulis manual di HTML.
- `#info-jumlah` — teks kecil yang menampilkan berapa buku sedang ditampilkan.
- `#kontainer-buku` — kontainer kosong tempat kartu-kartu buku di-render.
- Ada beberapa blok `<!-- komentar -->` berisi kode section "Ringkasan Koleksi"
  yang sengaja dinonaktifkan (belum dipakai) — sisa dari versi sebelumnya.

**Prinsip di sini:** HTML hanya menyediakan "wadah" kosong (`div`/`section`
dengan `id`), lalu JavaScript yang mengisi kontennya secara dinamis. Ini pola
umum di vanilla JS: render via `innerHTML`.

---

## 2. `css/style.css` — Styling

Tidak ada logic, murni tampilan. Beberapa hal yang perlu diketahui karena
berhubungan langsung dengan class yang dipakai `app.js`:

| Class CSS                                    | Fungsi                                                         |
| -------------------------------------------- | -------------------------------------------------------------- |
| `.tombol-filter.aktif`                       | Menandai tombol kategori yang sedang dipilih (background biru) |
| `.badge-stok-tersedia` / `.badge-stok-habis` | Warna badge stok (hijau/merah)                                 |
| `.highlight`                                 | Background kuning untuk kata kunci yang cocok saat searching   |
| `.pesan-kosong`                              | Tampilan saat hasil filter/pencarian kosong                    |
| `.grid-buku`                                 | Grid responsif (`auto-fill`, minimal 280px per kartu)          |

Catatan: ada beberapa class "sisa" (`.kartu-judul`, `.kartu-detail`,
`.badge-status`, `.ringkasan-*`) yang didefinisikan tapi **tidak dipakai** lagi
oleh HTML/JS saat ini — kemungkinan peninggalan dari desain versi awal
sebelum diganti menjadi `.kartu-buku` / `.kartu-judul-buku`.

---

## 3. `js/app.js` — Otak Aplikasi (Penjelasan Rinci per Baris)

### a. Data (`koleksiBuku`) — baris 4-69

```js
const koleksiBuku = [
  { id: 1, judul: "Laskar Pelangi", penulis: "Andrea Hirata",
    kategori: "Fiksi", stok: 3, rating: 4.8 },
  ...
];
```

- Ini adalah **array of objects**: satu array (`[...]`) yang isinya banyak
  object (`{...}`), tiap object mewakili satu buku.
- Anggap saja seperti tabel Excel: tiap baris = 1 object, tiap kolom = 1
  properti (`judul`, `penulis`, `kategori`, `stok`, `rating`).
- Ini **satu-satunya sumber data** di seluruh aplikasi. Tidak ada database,
  tidak ada `fetch()` ke server — semua "hardcoded" langsung di file JS.
- Semua fungsi di bawah **hanya membaca** array ini (pakai `.map()`,
  `.filter()`, dll) dan **tidak pernah mengubah isinya langsung**. Yang
  berubah hanya _tampilan_ di layar, datanya tetap sama dari awal sampai akhir.

---

### b. Utility Functions (logic murni, tidak menyentuh HTML/DOM)

Fungsi-fungsi di bagian ini sifatnya "hitung-hitungan" saja: terima data
masuk, hasilkan data baru keluar. Tidak ada `document.getElementById` di sini.

#### `ambilKategori(koleksi)` — baris 75-78

```js
function ambilKategori(koleksi) {
  const kategoriSet = new Set(koleksi.map((b) => b.kategori));
  return ["Semua", ...kategoriSet];
}
```

Dibaca selangkah demi selangkah:

1. `koleksi.map((b) => b.kategori)` → dari array buku, ambil **hanya**
   properti `kategori` dari tiap buku → hasilnya array seperti
   `["Fiksi", "Fiksi", "Sains", "Non-fiksi", "Fiksi", "Non-fiksi", "Sains", "Fiksi"]`
   (banyak yang double/duplikat).
2. `new Set(...)` → `Set` adalah struktur data yang **otomatis membuang
   duplikat**. Jadi hasil di atas jadi cuma: `{"Fiksi", "Sains", "Non-fiksi"}`.
3. `["Semua", ...kategoriSet]` → tanda `...` (spread operator) "membongkar"
   isi Set jadi elemen-elemen array biasa, lalu ditaruh **setelah** `"Semua"`.
   Hasil akhir: `["Semua", "Fiksi", "Sains", "Non-fiksi"]`.

- **Kenapa penting:** array inilah yang nanti dipakai untuk membuat tombol
  filter kategori secara otomatis — kalau suatu saat ada kategori baru
  ditambahkan ke `koleksiBuku`, tombol filternya **otomatis muncul**, tidak
  perlu edit HTML manual.

#### `filterBukuByKategori(koleksi, kategori)` — baris 80-83

```js
function filterBukuByKategori(koleksi, kategori) {
  if (kategori === "Semua") return koleksi;
  return koleksi.filter((buku) => buku.kategori === kategori);
}
```

1. Kalau parameter `kategori` yang dikirim adalah string `"Semua"` → langsung
   kembalikan seluruh `koleksi` apa adanya (tidak perlu difilter).
2. Kalau bukan `"Semua"` (misal `"Fiksi"`) → pakai `.filter()`, yaitu method
   array yang **menyaring** elemen: untuk tiap `buku`, cek apakah
   `buku.kategori === kategori` benar. Kalau benar, buku itu dipertahankan;
   kalau salah, dibuang. Hasilnya array baru yang lebih pendek (atau sama).

#### `filterGabungan(koleksi, kategori, keyword)` — baris 85-96

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

Ini fungsi filter **paling penting** karena menggabungkan 2 jenis filter
sekaligus (kategori + kata kunci pencarian). Langkah-langkahnya:

1. `let hasil = filterBukuByKategori(...)` → filter dulu berdasarkan
   kategori (manggil fungsi sebelumnya). Kalau kategori `"Semua"`, `hasil`
   ini sama dengan `koleksi` utuh.
2. `if (!keyword.trim()) return hasil;` → `.trim()` menghapus spasi kosong
   di depan/belakang teks. Jadi kalau user cuma ngetik spasi atau memang
   tidak ngetik apa-apa, keyword dianggap kosong → **langsung berhenti**
   dan kembalikan `hasil` filter kategori saja (tidak perlu filter keyword).
3. `const kw = keyword.trim().toLowerCase();` → keyword dibersihkan spasi,
   lalu diubah semua jadi huruf kecil. Ini supaya pencarian **tidak peka
   huruf besar/kecil** — user ketik "BUMI" atau "bumi" hasilnya sama.
4. `hasil.filter((b) => b.judul.toLowerCase().includes(kw) || b.penulis.toLowerCase().includes(kw))`
   → dari `hasil` (yang sudah difilter kategori), saring lagi: pertahankan
   buku HANYA jika judulnya **mengandung** `kw`, ATAU (`||`) penulisnya
   mengandung `kw`. `.includes()` mengecek apakah suatu teks memuat potongan
   teks lain di dalamnya (bukan harus sama persis).

- **Alur datanya:** `Semua Buku` → (disaring kategori) → (disaring keyword)
  → `Hasil Akhir`. Kedua filter ini **selalu jalan berurutan**, tidak
  pernah tumpang tindih atau saling menimpa.

#### `highlightKeyword(teks, keyword)` — baris 98-104

```js
function highlightKeyword(teks, keyword) {
  if (!keyword.trim()) return teks;
  const kw = keyword.trim();
  const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${kwEscaped})`, "gi");
  return teks.replace(regex, '<span class="highlight">$1</span>');
}
```

Fungsi ini yang bikin kata yang dicari jadi **berwarna kuning** di layar.

1. `if (!keyword.trim()) return teks;` → kalau tidak ada keyword, kembalikan
   teks aslinya tanpa diubah (tidak ada yang perlu di-highlight).
2. `const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` → ini bagian
   paling rumit. Regex (Regular Expression) punya karakter-karakter spesial
   seperti `. * + ? ( )` yang punya arti khusus. Kalau user kebetulan
   mengetik salah satu simbol itu di kotak pencarian (misal cari buku yang
   judulnya ada tanda "?"), regex bisa error atau salah tangkap. Baris ini
   "meng-escape" (menambahkan `\` di depan) semua karakter spesial itu
   supaya diperlakukan sebagai **teks biasa**, bukan perintah regex.
   `$&` artinya "karakter yang barusan cocok" (dipakai di dalam `replace`).
3. `const regex = new RegExp(\`(${kwEscaped})\`, "gi")`→ membuat pola
pencarian dari keyword yang sudah aman tadi, dibungkus tanda kurung`(...)`supaya bisa "ditangkap" dan dipakai lagi nanti (lihat`$1`di
bawah). Flag`g`= *global* (cari semua kemunculan, bukan cuma yang
pertama), flag`i` = _insensitive_ (tidak peduli besar/kecil huruf).
4. `teks.replace(regex, '<span class="highlight">$1</span>')` → setiap
   bagian teks yang cocok dengan regex, dibungkus tag `<span
class="highlight">...</span>`. `$1` artinya "isi yang ditangkap tadi
   di dalam kurung `(...)`" — jadi tulisan aslinya (dengan huruf besar/kecil
   apa adanya) tetap ditampilkan, cuma dibungkus span kuning.

- Contoh: `highlightKeyword("Bumi Manusia", "bumi")` menghasilkan
  `'<span class="highlight">Bumi</span> Manusia'`.

---

### c. Render Functions (fungsi yang "menggambar" HTML ke layar)

Bagian ini beda dari bagian _b_: fungsi-fungsi di sini **menyentuh DOM**
(elemen HTML di halaman), lewat `document.getElementById(...)` dan
`.innerHTML = ...`.

#### `renderKartuBuku(buku, keyword = "")` — baris 110-129

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

Fungsi ini menerima **satu** buku, dan mengubahnya jadi **satu string HTML**
(bukan langsung ditampilkan — cuma "dicetak" jadi teks HTML dulu).

1. `buku.stok > 0 ? "badge-stok-tersedia" : "badge-stok-habis"` → ini
   **ternary operator**, singkatan dari if/else. Artinya: "kalau `stok`
   lebih dari 0, pakai class hijau; kalau tidak (stok 0), pakai class merah".
2. Baris sama untuk `badgeStokTeks`: kalau stok > 0 tampilkan
   `"3 tersisa"` (pakai template literal `${buku.stok}` untuk menyisipkan
   angka ke dalam teks), kalau 0 tampilkan `"Habis"`.
3. `judulTampil` dan `penulisTampil` diproses dulu lewat `highlightKeyword()`
   sebelum dipakai — supaya kalau user sedang mencari sesuatu, kata yang
   cocok sudah otomatis ter-highlight duluan sebelum ditaruh ke HTML.
4. Fungsi ini `return` sebuah **template literal** (string yang pakai
   backtick `` ` ``, bukan kutip biasa) berisi markup HTML kartu buku,
   dengan variabel-variabel di atas disisipkan pakai `${...}`.

- **Default parameter** `keyword = ""` di judul fungsi artinya: kalau
  fungsi ini dipanggil tanpa argumen kedua, `keyword` otomatis dianggap
  string kosong (jadi highlight tidak jalan, aman).

#### `renderTombolFilter(kategoriList, kategoriAktif)` — baris 132-146

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

1. `document.getElementById("tombol-filter")` → mengambil elemen `<div
id="tombol-filter">` yang ada di `index.html` (masih kosong di HTML,
   akan diisi di sini).
2. `kategoriList.map((kat) => \`...\`)`→ untuk **setiap** kategori dalam
array (misal`["Semua", "Fiksi", "Sains", "Non-fiksi"]`), buat satu
string `<button>...</button>`. Hasil `.map()` adalah array berisi
   4 string HTML (satu per kategori).
3. Di dalam template button: `${kat === kategoriAktif ? "aktif" : ""}` →
   kalau kategori ini **sama dengan** kategori yang sedang aktif, tambahkan
   class `"aktif"` (supaya tombolnya jadi warna biru terisi sesuai CSS),
   kalau tidak, tambahkan string kosong (class biasa saja).
4. `data-kategori="${kat}"` → ini **data attribute**, semacam "label
   tersembunyi" yang ditempel ke tombol HTML supaya nanti JavaScript bisa
   tahu kategori apa yang diwakili tombol ini, ketika tombolnya diklik.
5. `.join("")` → `.map()` hasilnya array of string, `.join("")` menyatukan
   semua string itu jadi **satu** string panjang tanpa pemisah apa pun.
6. `kontainer.innerHTML = ...` → string HTML gabungan tadi dimasukkan ke
   dalam elemen `#tombol-filter`, sehingga tombol-tombol **muncul di layar**.

#### `renderDaftarBuku(koleksi, keyword = "", kategori = "Semua")` — baris 148-175

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

Ini fungsi yang benar-benar "menggambar" daftar buku ke layar. Langkahnya:

1. Ambil 2 elemen HTML yang akan diisi: kontainer kartu buku dan teks info
   jumlah.
2. `const filterAktif = []` → array kosong, dipakai untuk menampung
   **potongan teks keterangan** filter apa saja yang sedang aktif.
   - Kalau `kategori` bukan `"Semua"`, tambahkan teks `kategori: "Fiksi"`
     ke array itu (`.push()` = menambah elemen di akhir array).
   - Kalau ada `keyword`, tambahkan juga teks `kata kunci: "bumi"`.
   - Jadi array ini bisa kosong (tidak ada filter), berisi 1 potong, atau
     2 potong keterangan sekaligus.
3. `infoFilter` → kalau `filterAktif` punya isi, gabungkan semua potongan
   itu dengan koma (`.join(", ")`) dan bungkus dalam kurung, misal:
   `" (filter: kategori: \"Fiksi\", kata kunci: \"bumi\")"`. Kalau
   `filterAktif` kosong, `infoFilter` jadi string kosong `""`.
4. **Cek kondisi kosong:** `if (koleksi.length === 0)` → kalau tidak ada
   satu buku pun yang lolos filter, tampilkan pesan "Tidak ada buku yang
   cocok" beserta ikon 🔍, update teks info jumlah jadi `"0 buku
ditemukan..."`, lalu **`return`** — perintah `return` di sini menghentikan
   fungsi supaya baris-baris di bawahnya (yang merender kartu buku) **tidak
   ikut dijalankan**.
5. Kalau lolos (tidak kosong): `koleksi.map((b) => renderKartuBuku(b,
keyword))` → ubah setiap object buku jadi string HTML kartu (memanggil
   fungsi `renderKartuBuku` yang sudah dijelaskan sebelumnya), lalu
   `.join("")` menyatukan semuanya jadi satu string besar, dan
   `kontainer.innerHTML = ...` menampilkannya di layar.
6. Terakhir, update teks info jumlah jadi misal `"Menampilkan 3 buku
(filter: kategori: \"Fiksi\")"`.

---

### d. Event Handling (bagian yang "mendengarkan" aksi user)

#### `debounce(fn, delay)` — baris 182-188

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

Ini fungsi generik (tidak spesifik untuk buku, bisa dipakai untuk apa saja).
Konsepnya seperti tombol lift/elevator: pintu tidak langsung menutup begitu
ditekan sekali, tapi menunggu sebentar kalau-kalau ada yang menekan lagi.

1. `debounce` menerima fungsi apa saja (`fn`) dan jeda waktu (`delay`, dalam
   milidetik) yang diinginkan.
2. `let timer;` → variabel untuk menyimpan "jam alarm" (`setTimeout`) yang
   sedang berjalan.
3. `debounce` **mengembalikan fungsi baru** (bukan langsung menjalankan
   `fn`). Fungsi baru inilah yang nantinya dipasang sebagai event listener.
4. Setiap kali fungsi baru ini dipanggil (misal tiap user menekan tombol
   keyboard): `clearTimeout(timer)` **membatalkan** alarm sebelumnya (kalau
   ada), lalu `setTimeout(..., delay)` memasang alarm **baru** yang baru
   akan berbunyi (menjalankan `fn`) setelah `delay` ms tanpa ada pemanggilan
   baru lagi.
5. Efeknya: kalau user mengetik cepat 5 huruf berturut-turut dalam waktu
   kurang dari 300ms, `fn` **hanya dijalankan sekali** (setelah huruf
   terakhir + jeda 300ms), bukan 5 kali. Ini menghemat proses filter/render
   yang tidak perlu.

- ⚠️ Catatan: di kode ini, `debounce` **didefinisikan** tapi (di luar bug
  yang dibahas di bawah) sebenarnya tidak dipakai dengan benar di alur
  utama — lihat bagian "Bug" di bawah.

#### `setupSearchEvents(getStateAktif)` — baris 190-215

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

Parameter `getStateAktif` adalah **sebuah fungsi** (callback) yang kalau
dipanggil (`getStateAktif()`) akan mengembalikan object `state` yang
**terkini** — ini penting karena state (kategori aktif) bisa berubah
kapan saja lewat klik tombol filter, jadi tidak bisa disimpan sebagai
nilai tetap, harus selalu "ditanya ulang" tiap dibutuhkan.

**Listener pertama — mengetik di kotak pencarian:**

1. `"input"` adalah event yang terpicu **setiap kali** isi kotak teks
   berubah (per ketukan huruf, termasuk hapus/paste).
2. `const keyword = this.value;` → `this` di sini merujuk ke elemen yang
   memicu event, yaitu `inputSearch`. `.value` adalah teks yang sedang
   diketik user saat ini.
3. `const { kategori } = getStateAktif();` → ini **object destructuring**:
   memanggil `getStateAktif()` yang mengembalikan object seperti
   `{ kategori: "Fiksi" }`, lalu langsung mengambil propertinya dan
   menyimpannya ke variabel `kategori`.
4. `tombolHapus.style.display = keyword ? "block" : "none";` → kalau ada
   isi keyword (truthy), tombol "✕" dimunculkan; kalau kosong (falsy),
   disembunyikan lagi.
5. `filterGabungan(...)` lalu `renderDaftarBuku(...)` → filter data sesuai
   kategori aktif + keyword terbaru, lalu render ulang ke layar.

- Listener ini **langsung** jalan tanpa debounce — jadi tiap 1 huruf
  diketik, langsung difilter & dirender ulang (tidak masalah untuk data
  sekecil ini, tapi kalau datanya ribuan baris idealnya pakai debounce).

**Listener kedua — klik tombol "✕" (hapus pencarian):**

1. `inputSearch.value = ""` → mengosongkan isi kotak teks.
2. `this.style.display = "none"` → `this` di sini adalah `tombolHapus`
   (karena listener dipasang di situ) → tombol disembunyikan lagi.
3. `inputSearch.focus()` → kursor otomatis pindah/aktif kembali ke kotak
   pencarian, supaya user bisa langsung ngetik lagi tanpa perlu klik dulu.
4. Filter & render ulang, tapi kali ini keyword dipaksa `""` (kosong).

#### `inisialisasi()` — baris 220-254

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
  // ...lihat bagian Bug di bawah
}

inisialisasi();
```

Ini fungsi "sutradara" yang mengatur semua yang terjadi saat halaman
pertama kali dibuka.

1. `const kategoriList = ambilKategori(koleksiBuku);` → siapkan daftar
   kategori sekali di awal (`["Semua", "Fiksi", "Sains", "Non-fiksi"]`).
2. `const state = { kategori: "Semua" };` → ini **satu-satunya "memori"**
   aplikasi ini: object sederhana yang menyimpan kategori mana yang
   sedang aktif. Karena dideklarasikan dengan `const`, variabel `state`
   sendiri tidak bisa diganti jadi object lain — tapi **isi propertinya**
   (`state.kategori`) tetap bisa diubah kapan saja (ini bukan pelanggaran
   aturan `const`, karena `const` hanya mengunci _referensi_, bukan isi
   object-nya).
3. Render awal (baris `renderTombolFilter` + `renderDaftarBuku`) →
   menampilkan tombol filter dan semua buku untuk pertama kali begitu
   halaman dibuka.
4. `kontainerFilter.addEventListener("click", ...)` → ini contoh **event
   delegation**: alih-alih memasang listener klik di **setiap** tombol
   filter satu-satu (padahal tombolnya dibuat dinamis dan bisa berubah
   jumlahnya), listener dipasang **sekali saja** di elemen induknya
   (`#tombol-filter`). Ketika area itu diklik (di mana pun, termasuk
   tombol di dalamnya), listener ini yang menangkap.
   - `event.target` → elemen paling spesifik yang benar-benar diklik user.
   - `.closest(".tombol-filter")` → naik ke atas dari `event.target`
     mencari elemen terdekat yang punya class `.tombol-filter` (bisa jadi
     `event.target` itu sendiri, atau salah satu "orang tua"-nya).
   - `if (!tombol) return;` → kalau user mengklik area kosong di dalam
     `#tombol-filter` (bukan tombolnya), `.closest()` akan mengembalikan
     `null` → fungsi dihentikan di sini, tidak melakukan apa-apa.
5. `state.kategori = tombol.dataset.kategori;` → update "memori" kategori
   aktif sesuai `data-kategori` milik tombol yang baru diklik (ingat,
   atribut ini ditulis di `renderTombolFilter`).
6. Ambil `keyword` yang sedang ada di kotak pencarian (supaya ganti
   kategori **tidak menghapus** kata kunci yang sedang dicari — dua
   filter tetap berjalan bersamaan).
7. Render ulang tombol filter (supaya class `"aktif"` pindah ke tombol
   yang baru diklik) dan render ulang daftar buku sesuai kategori +
   keyword terbaru.
8. `setupSearchEvents(() => state);` → memasang event listener pencarian,
   sambil mengoper sebuah **arrow function** `() => state` sebagai
   `getStateAktif`. Fungsi kecil ini, tiap dipanggil, akan selalu
   mengembalikan `state` yang **paling baru** (bukan salinan/snapshot lama),
   karena `state` diakses lewat _closure_ — konsep JavaScript di mana
   fungsi bagian dalam "ingat" variabel dari fungsi luar tempat ia dibuat.
9. Baris terakhir file, `inisialisasi();` (baris 258, di luar semua
   fungsi) → ini yang benar-benar **menjalankan** semuanya begitu file
   `app.js` selesai dimuat oleh browser.

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

- `inputSearch`, `tombolHapus`, dan `getStateAktif` **tidak pernah dideklarasikan**
  di scope `inisialisasi()` — variabel-variabel itu hanya ada di dalam
  `setupSearchEvents()`, bukan di sini.
- Akibatnya, dua listener `input` terpasang pada kotak pencarian: satu yang
  benar (dari `setupSearchEvents`, langsung tanpa debounce) dan satu lagi
  yang rusak (`handleSearch`, memakai debounce tapi variabelnya undefined).
- Fitur pencarian akan **tetap berfungsi** (karena listener pertama yang
  benar tetap jalan), tapi setiap kali user mengetik, setelah jeda 300ms
  akan muncul error di console browser dari listener kedua.

**Cara memperbaiki:** hapus blok `handleSearch` + `addEventListener` tambahan
itu, karena fungsinya sudah ter-cover oleh `setupSearchEvents()`. Kalau memang
ingin pakai debounce, sebaiknya debounce dipasang _di dalam_ `setupSearchEvents()`
langsung membungkus listener `input` yang sudah ada di sana.

---

## Bonus: Penjelasan Simpel Array Method (`.map()`, `.filter()`, `.join()`)

Tiga method ini paling sering muncul di `app.js`, jadi penting dipahami
dulu supaya bagian-bagian di atas lebih gampang nyambung.

### `.map()` — "ubah setiap barang jadi barang baru"

Bayangin kamu punya keranjang buah, terus tiap buah kamu bungkus pakai
plastik. **Jumlah buahnya tetap sama**, cuma bentuknya berubah.

```js
const angka = [1, 2, 3];
const hasil = angka.map((n) => n * 2);
// hasil = [2, 4, 6]
```

Di kode kamu:

```js
koleksi.map((b) => b.kategori);
```

Dari array **buku** (object lengkap), diubah jadi array **kategori** saja
(cuma string). 8 buku masuk → 8 kategori keluar. Jumlahnya tetap 8, cuma
isinya berubah dari "object buku" jadi "string kategori".

Contoh lain:

```js
koleksi.map((b) => renderKartuBuku(b, keyword));
```

8 object buku masuk → 8 string HTML `<div class="kartu-buku">...</div>` keluar.

**Intinya:** `.map()` dipakai kalau kamu mau **jumlah data tetap sama**,
tapi bentuknya diubah.

### `.filter()` — "saring, buang yang gak lolos"

Bayangin nyaring pasir pakai ayakan — cuma butiran yang cukup kecil yang
lolos, sisanya ketahan. **Jumlah datanya bisa berkurang** (atau tetap kalau
semua lolos).

```js
const angka = [1, 2, 3, 4, 5];
const genap = angka.filter((n) => n % 2 === 0);
// genap = [2, 4]
```

Di kode kamu:

```js
koleksi.filter((buku) => buku.kategori === kategori);
```

Tiap buku dicek satu-satu: "kategorinya cocok gak sama yang dicari?".
Kalau `true` → buku itu **lolos**, masuk hasil. Kalau `false` → buku itu
**dibuang**.

Cara gampang inget bedanya sama `.map()`:

|                    | `.map()`        | `.filter()`                     |
| ------------------ | --------------- | ------------------------------- |
| Fungsi di dalamnya | mengubah bentuk | jawab ya/tidak (`true`/`false`) |
| Jumlah hasil       | selalu sama     | bisa lebih sedikit              |
| Analoginya         | bungkus plastik | ayakan pasir                    |

### `.join()` — "satukan jadi satu string, dikasih lem di antaranya"

Ini yang paling sederhana. `.join()` cuma bekerja di **array**, mengubahnya
jadi **satu string panjang**, dengan "lem" (separator) di antara tiap elemen.

```js
const buah = ["apel", "jeruk", "mangga"];
buah.join(", "); // "apel, jeruk, mangga"
buah.join(" - "); // "apel - jeruk - mangga"
buah.join(""); // "apeljerukmangga"  (tanpa lem sama sekali)
```

Di kode kamu:

```js
koleksi.map((b) => renderKartuBuku(b, keyword)).join("");
```

1. `.map()` dulu → hasilnya array berisi 8 string HTML terpisah:
   `["<div>buku1</div>", "<div>buku2</div>", ...]`
2. `.join("")` → semua string itu digabung jadi **satu string besar**
   tanpa pemisah apa-apa (karena kalau ada koma/spasi, akan merusak
   tampilan HTML-nya). Hasilnya baru bisa dimasukkan ke `innerHTML`.

**Kenapa harus `.join("")` dulu, gak langsung dari `.map()`?** Karena
`.map()` hasilnya **array** (kumpulan string terpisah), sedangkan
`innerHTML` cuma bisa menerima **satu string**, bukan array. Jadi
`.join("")` tugasnya "meleburkan" array itu jadi satu string utuh.

### Ringkasan Super Simpel

| Method      | Analoginya          | Pertanyaan yang dijawab                 |
| ----------- | ------------------- | --------------------------------------- |
| `.map()`    | Bungkus tiap barang | "Tiap item mau diubah jadi apa?"        |
| `.filter()` | Ayak/saring         | "Item ini dipertahankan atau dibuang?"  |
| `.join()`   | Rekatkan jadi satu  | "Gimana cara gabungin array jadi teks?" |

Pola yang sering dipakai berulang di kode kamu:

```js
array.map(...).join("");
```

artinya: **"ubah tiap item jadi HTML, lalu satukan semuanya jadi satu blok
teks HTML."**

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

Singkatnya: **satu sumber data (`koleksiBuku`) → dua filter yang bisa
digabung (kategori + keyword) → hasil filter dirender ulang ke DOM setiap
ada perubahan.** Tidak ada state management library — semua state hanya
disimpan di satu object `state` biasa di dalam `inisialisasi()`.
