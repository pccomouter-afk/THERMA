# THERMA — Urban Thermal Intelligence

THERMA adalah platform web untuk memetakan, memahami, dan menindaklanjuti panas perkotaan di Bali. Tagline: READ THE HEAT. CHANGE THE CITY. Seluruh antarmuka berbahasa Indonesia.

Alur utama: MAP → UNDERSTAND → MOVE → COOL (lihat → pahami → bergerak → dinginkan).

## Struktur halaman

- `index.html` — Home: hero, ringkasan termal live, cara kerja, pratinjau peta/rute/aksi, CTA
- `pages/map.html` — Peta Termal: Leaflet tanpa kontrol zoom, permukaan termal kontinu dari data aktual, lapisan Suhu/Kelembapan/Kualitas Udara, pencarian, lokasi, detail area, tanpa preset lokasi
- `pages/cool-route.html` — Rute Sejuk: geocoding Nominatim + routing OSRM (alternatif nyata, maks 2 rute) + suhu paparan °C dari interpolasi suhu aktual + label dinamis Rute Lebih Sejuk/Panas
- `pages/action.html` — Cooling Action: pilih area, baca kondisi aktual, simulasi intervensi (estimasi, bukan fakta lapangan)
- `pages/data.html` — Thermal Data: tabel live temperatur/kelembapan/kualitas udara/cuaca per wilayah
- `pages/login.html`, `pages/register.html`, `pages/profile.html` — auth localStorage + profil yang bisa diedit
- `pages/about.html` — tentang THERMA dan sumber data

## API yang digunakan (tanpa key, via HTTPS di browser)

- Open-Meteo Forecast — `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `wind_speed_10m`, `cloud_cover`, `precipitation`
- Open-Meteo Air Quality — `pm2_5`, `pm10`, `european_aqi`
- Nominatim OpenStreetMap — pencarian lokasi (`countrycodes=id`)
- OSRM demo server — rute jalan kaki + alternatif (`overview=full&geometries=geojson`)
- Tile OpenStreetMap — basemap dengan atribusi © OpenStreetMap contributors

Semua angka lingkungan berasal dari API/kalkulasi/koordinat nyata/user state. Jika API gagal, UI menampilkan status jujur ("Data sementara tidak tersedia"), bukan angka karangan.

## Library

- Leaflet 1.9.4 (peta), GSAP 3.12.5 (animasi optional), FontAwesome 6.5.2 (ikon), Google Fonts (Space Grotesk + Inter)
- Tanpa React/Vue/Three.js/Mapbox, tanpa plugin heatmap/routing frontend tambahan

## Auth (frontend only, localStorage)

- Keys: `therma_users`, `therma_session`, `therma_preferences`, `therma_cached_weather` (cache cuaca 10 menit + expiry)
- Register: validasi nama/email/password min 8/konfirmasi cocok/email unik → hash SHA-256 (fallback hash lokal bila SubtleCrypto tak tersedia) → session → redirect profil
- Login: cek email + hash → session → navbar berubah menjadi Profile
- Logout: hapus session → navbar kembali Register/Login; halaman profil redirect ke login saat belum masuk
- Profil: edit nama/email (validasi + duplikat), upload avatar (resize canvas → JPEG dataURL ≤2MB), preferensi lapisan + wilayah bawaan, tanggal bergabung

## Cara menjalankan

Website statis + `fetch` untuk komponen navbar/footer, jadi harus lewat local server (mis. Live Server VS Code) dari folder repo, bukan `file://`.
