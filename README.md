<div align="center">

# Patungan

**Pembagian tagihan sesuai pesanan — pajak proporsional dan pembulatan tanpa selisih.**

[![Demo](https://img.shields.io/badge/demo-live-b45309?style=flat-square)](https://atmajadesna.github.io/patungan/)
![Tanpa build step](https://img.shields.io/badge/build-tanpa%20build%20step-2f6f4f?style=flat-square)
![Lisensi MIT](https://img.shields.io/badge/lisensi-MIT-1f4e79?style=flat-square)

<a href="https://atmajadesna.github.io/patungan/"><img src="docs/screenshot.jpg" alt="Tangkapan layar Patungan" width="100%"></a>

</div>

## Latar Belakang

Membagi tagihan secara rata mudah dilakukan, tetapi menjadi tidak adil apabila peserta yang hanya memesan minuman menanggung pajak sebesar peserta yang memesan makanan utama.

## Poin Teknis

**Pajak proporsional.** Setiap peserta menanggung pajak dan biaya layanan sebesar porsi pesanannya, bukan dibagi secara merata.

**Metode largest remainder.** Sisa pembulatan dialokasikan kepada peserta dengan nilai desimal terbesar, sehingga jumlah seluruh bagian tepat sama dengan total tagihan — tanpa selisih.

**Kelipatan pembulatan dapat diatur.** Tersedia pilihan Rp1, Rp100, Rp500, dan Rp1.000 sesuai kebiasaan transfer.

## Menjalankan

Berkas `index.html` dapat dibuka langsung pada peramban:

```bash
python3 -m http.server 8000
```

Tidak diperlukan dependensi maupun proses build. Seluruh proses berjalan pada peramban.

## Struktur Berkas

```
index.html    struktur halaman dan tampilan
app.js        seluruh logika: data, perhitungan, dan penyimpanan
styles.css    tata letak dan komponen antarmuka
tokens.css    warna, ukuran teks, dan spasi sebagai variabel
```

## Catatan

Contoh: tagihan Rp128.800 menghasilkan total terkumpul Rp129.000 dengan pembagian 30.500 / 30.500 / 68.000, tepat tanpa selisih.

Dibangun menggunakan JavaScript, HTML, dan CSS, tanpa kerangka kerja.
