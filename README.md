# Patungan

Bagi tagihan makan bersama **sampai rupiah terakhir**. Bukan cuma "total dibagi
jumlah orang" — tiap item bisa punya peserta sendiri, pajak dan service
dihitung proporsional, dan pembulatan dibagi supaya jumlah semua bagian pas
dengan total yang ditagih.

## Masalah yang diselesaikan

Bagi rata itu gampang kalau semua orang pesan hal yang sama. Kenyataannya tidak:

- satu orang cuma pesan es teh, yang lain pesan ayam bakar;
- pajak 10% dan service 5% harus ikut, bukan cuma subtotal;
- setelah dibulatkan ke Rp 500, jumlahnya jadi lebih atau kurang dari struk.

Kalkulator biasa berhenti di "Rp 47.500 per orang" dan menyisakan selisih yang
harus ditambal seseorang.

## Cara menghitung

1. **Porsi dasar** — tiap item dibagi rata ke pesertanya:
   `porsi = harga item / jumlah peserta`.
2. **Pajak & service** — dikalikan ke total porsi tiap orang:
   `nilai = porsi × (1 + (pajak + service) / 100)`.
3. **Pembulatan** — setiap orang dibulatkan ke bawah ke kelipatan `step`
   (Rp 1 / 100 / 500 / 1.000).
4. **Sisa dibagikan** — selisih antara target dan jumlah unit yang sudah
   dibagikan diberikan ke orang dengan **pecahan terbesar** (largest remainder).
   Hasilnya: `Σ bagian = total target`, tanpa selisih.

Contoh dengan data bawaan: subtotal Rp 112.000, pajak+service 15% →
Rp 128.800. Dibulatkan ke atas Rp 500 → Rp 129.000, terbagi
Rp 30.500 / Rp 30.500 / Rp 68.000.

## Fitur

- Dua mode: **bagi rata** (cukup total struk) atau **sesuai pesanan**.
- Tiap item punya peserta sendiri, bisa diubah dengan klik chip nama.
- Nama orang bisa ditambah dan dihapus; item ikut menyesuaikan.
- Pilihan pembulatan Rp 1 / 100 / 500 / 1.000.
- Selisih pembulatan ditampilkan terang-terangan, bukan disembunyikan.
- Data tersimpan di `localStorage`, tidak ada yang dikirim ke server.

## Struktur berkas

| Berkas | Isi |
|---|---|
| `index.html` | hero angka, panel tagihan, panel hasil |
| `tokens.css` | token warna, huruf, jarak, easing |
| `styles.css` | tata letak dan komponen |
| `app.js` | perhitungan proporsional + pembagian sisa |

Tanpa dependensi, tanpa build step. Buka `index.html` langsung.

## Batasan

- Belum ada fitur "siapa transfer ke siapa" (penyederhanaan utang).
- Diskon per item belum didukung; kalau ada diskon, masukkan harga setelah diskon.
- Pembulatan selalu ke atas. Kalau butuh ke bawah, ubah `Math.ceil` di `hitung()`.

## Lisensi

MIT.
