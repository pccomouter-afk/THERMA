# SEJUKA

SEJUKA adalah website front-end yang mengangkat isu urban heat (panas berlebih di lingkungan perkotaan). Project ini menyajikan data lingkungan dalam bentuk simulasi front-end untuk membantu pengguna memahami kondisi panas di suatu area, menemukan rute yang lebih sejuk, melihat gambaran hotspot, serta mendorong tindakan komunitas untuk menciptakan lingkungan yang lebih nyaman.

## Tentang SEJUKA

Lingkungan perkotaan dengan sedikit pohon, minim keteduhan, dan banyak permukaan beraspal cenderung terasa lebih panas dibanding area hijau di sekitarnya, meskipun berada di jam yang sama. Kondisi ini sering kali tidak terlihat secara langsung oleh warga karena tidak ada cara mudah untuk membandingkan kondisi antar wilayah.

SEJUKA dibangun untuk menjawab masalah tersebut dengan menghadirkan gambaran visual mengenai kondisi panas di beberapa area kota, menampilkan indeks panas, tutupan pohon, dan tingkat keteduhan pada tiap zona, menyediakan simulasi dampak jika kondisi lingkungan (pohon, ruang hijau, struktur peneduh, permukaan reflektif, fitur air) diubah, membantu pengguna membandingkan rute perjalanan berdasarkan tingkat paparan panas, bukan hanya kecepatan, serta menghubungkan data lingkungan dengan aksi nyata melalui fitur komunitas, laporan warga, dan forum diskusi.

Dengan pendekatan ini, SEJUKA memposisikan dirinya sebagai platform community intelligence untuk urban cooling, yaitu ruang yang menggabungkan data lingkungan dengan partisipasi warga agar tindakan pendinginan kota dapat diarahkan pada lokasi yang benar-benar membutuhkan.

Project ini dirancang dan dibangun sebagai karya untuk ITCC 2026 Web Design Competition, kategori SMA/SMK, dengan tema Eco-Connect: Portal Web Interaktif untuk Komunitas Cerdas dan Berkelanjutan.

## Fitur Utama

Seluruh fitur di bawah ini merupakan implementasi front-end. Data yang ditampilkan (nilai sensor, indeks panas, statistik komunitas, dan lainnya) adalah data simulasi yang ditulis langsung di dalam kode, bukan data real-time dari perangkat atau server sungguhan.

### Beranda
Halaman utama (`index.html`) yang merangkum seluruh konsep SEJUKA dalam satu alur, mulai dari hero section, cuplikan peta panas, cara kerja sistem, cuplikan rute sejuk, simulator, penasihat komunitas, titik pendinginan, laporan komunitas, dampak komunitas, misi komunitas, cuplikan portofolio, hingga cuplikan forum.

### Peta Panas
Halaman `pages/heatmap.html` menampilkan peta interaktif berbasis SVG dengan beberapa zona kota (misalnya Central District, North Avenue, Riverside Community, Green Park, East Industrial Belt). Setiap zona memiliki data simulasi seperti indeks panas, suhu permukaan, persentase tutupan pohon, keteduhan, kelembapan, kualitas udara (PM2.5), serta penyebab dan rekomendasi tindakan. Pengguna dapat memilih zona untuk melihat detail, mengaktifkan/menonaktifkan layer peta (panas, pohon, titik pendinginan, laporan), serta melakukan zoom in, zoom out, dan reset zoom.

### Rute Sejuk (Cooler Route)
Halaman `pages/cool-route.html` membandingkan dua opsi rute, yaitu rute tercepat dan rute tersejuk, lengkap dengan estimasi waktu tempuh, tingkat paparan panas, jarak, dan persentase keteduhan. Rute divisualisasikan dalam bentuk jalur SVG yang digambar secara dinamis melalui JavaScript.

### Simulator Pendinginan Perkotaan
Halaman `pages/simulator.html` (juga tersedia sebagai cuplikan di beranda) memungkinkan pengguna mengatur beberapa parameter melalui slider, yaitu tutupan pohon, ruang hijau, struktur peneduh, permukaan reflektif, dan fitur air. Perubahan parameter ini menghitung ulang indeks panas simulasi dan menampilkan estimasi peningkatan kondisi menggunakan rumus perhitungan sederhana yang ditulis di `js/simulator.js`.

### Penasihat Komunitas (Rekomendasi Berbasis Isu)
Fitur ini menampilkan daftar rekomendasi tindakan berdasarkan isu yang dipilih pengguna, seperti terlalu panas, tutupan pohon rendah, kurang keteduhan, area beton luas, atau ruang publik kurang baik. Daftar rekomendasi beserta estimasi dampaknya (perubahan paparan panas dan cakupan keteduhan) sudah didefinisikan sebelumnya di `js/community.js` dan ditampilkan sesuai isu yang dipilih.

### Heat Hotspot Detail
Bagian pada halaman peta panas yang menampilkan detail tambahan dari zona yang dipilih, termasuk penyebab kondisi panas dan rekomendasi pendinginan yang spesifik untuk area tersebut.

### Data Flow
Bagian yang menjelaskan alur konseptual bagaimana data lingkungan diperoleh dan diolah pada SEJUKA, ditampilkan sebagai rangkaian langkah (step) mulai dari Sensor Node hingga Heat Map SEJUKA. Konten ini bersifat penjelasan alur sistem, bukan implementasi backend nyata.

### Sensor Node
Bagian yang menjelaskan jenis sensor yang menjadi dasar konsep SEJUKA, yaitu SHT31 untuk suhu dan kelembapan, BH1750 untuk intensitas cahaya, sensor PM2.5 untuk kualitas udara, serta modul LoRa untuk transmisi data. Bagian ini disertai video ilustrasi (`assets/videos/sensor-node.webm`) dan bersifat penjelasan konsep perangkat, tanpa integrasi perangkat keras nyata pada website.

### Komunitas
Halaman `pages/community.html` menggabungkan beberapa fitur, yaitu penasihat komunitas AI, pencarian titik pendinginan terdekat, laporan komunitas, misi komunitas dengan target dan papan peringkat, serta ringkasan dampak komunitas.

### Forum
Halaman `pages/forum.html` menampilkan daftar diskusi warga dalam bentuk kartu thread. Terdapat fitur pencarian judul thread dan filter berdasarkan kategori, yang diimplementasikan di `js/forum.js` dengan menyaring elemen yang sudah ada di halaman (tanpa pemanggilan data dari server).

### Portofolio
Halaman `pages/portfolio.html` menampilkan proyek-proyek pendinginan komunitas yang sudah dilakukan, seperti penghijauan koridor sekolah, jalur teduh riverside, dan pemasangan sensor di plaza. Terdapat filter kategori proyek yang diimplementasikan di `js/portfolio.js`.

### Tentang (About)
Halaman `pages/about.html` menjelaskan latar belakang masalah urban heat, cara kerja SEJUKA secara konseptual, serta konteks project sebagai karya kompetisi ITCC 2026.

### Responsive Design
Seluruh halaman menggunakan media query pada berkas CSS di folder `css/pages` dan `css/sections` sehingga tampilan menyesuaikan lebar layar, termasuk pada navigasi (menu mobile dengan tombol burger) yang diimplementasikan di `js/navigation.js`.

## Alur Sistem

SEJUKA menjelaskan alur sistem secara konseptual melalui bagian Data Flow, dengan tahapan sebagai berikut:

```
Sensor Node
  -> ESP32 (pengolahan data lokal)
  -> LoRa (transmisi data jarak jauh berdaya rendah)
  -> LoRa Gateway (pengumpulan sinyal dari banyak node)
  -> Internet
  -> Cloud Server (penyimpanan data)
  -> Analisis Data (pengolahan menjadi indeks panas)
  -> Heat Map SEJUKA (visualisasi hasil)
```

Pada implementasi website yang tersedia saat ini, seluruh tahapan tersebut ditampilkan sebagai penjelasan alur dan ilustrasi konsep. Data yang digunakan di halaman peta panas, rute sejuk, simulator, dan komunitas adalah data simulasi yang telah ditentukan langsung di dalam berkas JavaScript, bukan hasil pembacaan sensor nyata, bukan hasil pemrosesan dari backend, dan bukan hasil pemanggilan API eksternal.

## Teknologi yang Digunakan

Berikut teknologi yang benar-benar digunakan pada project ini:

- HTML sebagai struktur halaman.
- CSS untuk seluruh styling, disusun secara modular dan digabungkan melalui `css/main.css` menggunakan `@import`.
- JavaScript (vanilla, tanpa framework) untuk seluruh interaktivitas, animasi, dan manipulasi DOM.
- Boxicons, dimuat melalui CDN Cloudflare, digunakan sebagai pustaka ikon di seluruh halaman.
- GSAP (GreenSock Animation Platform), dimuat melalui CDN Cloudflare, digunakan untuk animasi tampilan pada beberapa halaman.
- Google Fonts (Space Grotesk, Inter, IBM Plex Mono), dimuat melalui `@import` pada `css/main.css`, digunakan sebagai tipografi utama.

Tidak ditemukan penggunaan backend, database, framework JavaScript (seperti React atau Vue), maupun pemanggilan API eksternal pada project ini.

## Struktur Folder

```text
SEJUKA-main/
├── index.html
├── components/
│   ├── navbar.html
│   └── footer.html
├── pages/
│   ├── about.html
│   ├── community.html
│   ├── cool-route.html
│   ├── forum.html
│   ├── heatmap.html
│   ├── portfolio.html
│   └── simulator.html
├── css/
│   ├── main.css
│   ├── base/
│   │   ├── layout.css
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── variables.css
│   ├── components/
│   │   ├── badge.css
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── footer.css
│   │   ├── loader.css
│   │   ├── modal.css
│   │   └── navbar.css
│   ├── pages/
│   │   ├── community-page.css
│   │   ├── forum-page.css
│   │   ├── heatmap-page.css
│   │   ├── page-header.css
│   │   ├── portfolio-page.css
│   │   ├── route-page.css
│   │   └── simulator-page.css
│   └── sections/
│       ├── community.css
│       ├── cooler-route-finder.css
│       ├── data-flow.css
│       ├── heatmap.css
│       ├── hero-network.css
│       ├── hero.css
│       ├── historical-trend.css
│       ├── hotspot-detail.css
│       ├── impact.css
│       ├── portfolio.css
│       ├── route.css
│       ├── sensor-node.css
│       └── simulator.css
├── js/
│   ├── main.js
│   ├── animations.js
│   ├── community.js
│   ├── components.js
│   ├── cool-route.js
│   ├── data-flow.js
│   ├── forum.js
│   ├── heatmap.js
│   ├── hero-network.js
│   ├── navigation.js
│   ├── portfolio.js
│   ├── sensor-node.js
│   └── simulator.js
└── assets/
    ├── images/
    ├── logo/
    └── videos/
```

## Cara Menjalankan

Karena SEJUKA merupakan website statis berbasis HTML, CSS, dan JavaScript murni, project ini dapat dijalankan dengan membuka `index.html` melalui local server (misalnya Live Server pada VS Code), agar pemuatan komponen `navbar.html` dan `footer.html` melalui `fetch` pada `js/components.js` dapat berjalan dengan baik. Membuka `index.html` langsung melalui protokol `file://` berpotensi menyebabkan komponen navbar dan footer tidak termuat karena keterbatasan `fetch` pada beberapa browser saat diakses tanpa server.
