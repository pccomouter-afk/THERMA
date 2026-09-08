# Alat dan Komponen Sensor Node SEJUKA

## 1. Komponen Utama

| No. | Komponen | Fungsi |
|---|---|---|
| 1 | Panel Surya (Solar Panel) | Mengubah energi matahari menjadi energi listrik untuk sistem. |
| 2 | Battery / Baterai | Menyimpan energi dari panel surya agar sistem dapat tetap bekerja. |
| 3 | ESP32 | Mikrokontroler yang membaca, mengolah, dan mengatur data dari sensor. |
| 4 | Modul LoRa | Mengirim data sensor dari Sensor Node menuju LoRa Gateway. |
| 5 | Antena LoRa | Membantu komunikasi nirkabel LoRa agar jangkauan pengiriman data lebih jauh. |
| 6 | Outdoor Enclosure | Melindungi komponen elektronik dari hujan, debu, dan kondisi lingkungan luar. |
| 7 | Radiation Shield | Melindungi sensor suhu dan kelembapan dari radiasi matahari langsung agar pembacaan lebih akurat. |
| 8 | Mounting Base | Dudukan untuk memasang Sensor Node pada tiang atau permukaan tertentu. |
| 9 | Pole / Tiang | Struktur tempat Sensor Node dipasang. |
| 10 | Kabel & Konektor | Menghubungkan panel, baterai, mikrokontroler, sensor, dan modul komunikasi. |

## 2. Sensor yang Digunakan

### SHT31

Digunakan untuk mengukur:

- Suhu
- Kelembapan udara

### BH1750

Digunakan untuk mengukur:

- Intensitas cahaya

### PM2.5 Sensor

Digunakan untuk mengukur:

- Konsentrasi partikel PM2.5
- Kondisi kualitas udara berdasarkan partikel halus

## 3. Alur Sistem

```text
Panel Surya
     ↓
  Baterai
     ↓
   ESP32
     ↓
┌────┼─────┐
↓    ↓     ↓
SHT31 BH1750 PM2.5
└────┼─────┘
     ↓
  Modul LoRa
     ↓
  Antena LoRa
     ↓
 LoRa Gateway
     ↓
  Internet
     ↓
 Cloud Server
     ↓
Platform SEJUKA
     ↓
Heat Map & Analisis
```

## 4. Susunan Pada Sensor Node

### Bagian Atas

- Panel surya
- Radiation shield
- Sensor lingkungan

### Bagian Tengah

- Outdoor enclosure
- ESP32
- Baterai

### Bagian Komunikasi

- Modul LoRa
- Antena LoRa

### Bagian Bawah

- Mounting base
- Tiang pemasangan
- Kabel

## 5. Penjelasan Singkat untuk Presentasi

> SEJUKA menggunakan Sensor Node bertenaga surya yang terdiri dari sensor SHT31 untuk mengukur suhu dan kelembapan, BH1750 untuk mengukur intensitas cahaya, serta sensor PM2.5 untuk memantau kualitas udara. ESP32 mengolah data dari sensor, kemudian data dikirim menggunakan LoRa menuju gateway dan diteruskan ke platform SEJUKA untuk divisualisasikan sebagai informasi kondisi lingkungan dan heat map.

## 6. Catatan Implementasi

Komponen-komponen di atas merupakan rancangan Sensor Node SEJUKA. Dalam presentasi atau perlombaan, bedakan antara desain/prototipe dengan perangkat yang sudah benar-benar dirakit dan diuji.

Jangan menyatakan bahwa seluruh komponen sudah berfungsi secara nyata apabila belum dilakukan perakitan dan pengujian.
