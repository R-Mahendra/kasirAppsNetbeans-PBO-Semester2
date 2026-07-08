APLIKASI KASIR SEDERHANA (JAVA SWING)
======================================
Tanpa database, tanpa server — semua data disimpan di memory (ArrayList),
cukup dijalankan langsung (localhost / lokal di komputer sendiri).

ISI PROJECT
-----------
src/kasir/Product.java     -> model data barang
src/kasir/CartItem.java    -> model item di keranjang
src/kasir/KasirFrame.java  -> tampilan/GUI utama + semua logika kasir
src/kasir/Main.java        -> class untuk menjalankan aplikasi

CARA IMPORT KE NETBEANS
------------------------
1. Buka NetBeans.
2. File > New Project > Java with Ant > Java Application > Next.
3. Beri nama project, misalnya "POS_Kasir", lalu Finish.
   (NetBeans otomatis membuat folder src/ dan sebuah class Main bawaan)
4. Hapus/kosongkan class bawaan yang otomatis dibuat NetBeans
   (biasanya ada file Main.java kosong di package default).
5. Klik kanan pada folder "Source Packages" > New > Java Package,
   beri nama package: kasir
6. Copy 4 file .java (Product.java, CartItem.java, KasirFrame.java, Main.java)
   dari folder src/kasir project ini, lalu paste/drag ke dalam package
   "kasir" yang baru dibuat di NetBeans (bisa juga drag langsung dari
   File Explorer ke package tersebut di NetBeans).
7. Klik kanan pada Main.java > Run File (atau tekan Shift+F6).
8. Selesai! Jendela aplikasi kasir akan muncul.

CARA MENJALANKAN LANGSUNG DARI TERMINAL (tanpa NetBeans)
----------------------------------------------------------
Pastikan sudah terinstall JDK (bukan hanya JRE), lalu jalankan:

    cd POS_Kasir
    javac -d build src/kasir/*.java
    java -cp build kasir.Main

FITUR APLIKASI
--------------
- Menampilkan daftar produk (kode, nama, harga, stok) - data contoh sudah
  disediakan di dalam kode (bisa diedit langsung di method buatDataProduk()
  pada KasirFrame.java).
- Pilih produk + jumlah, lalu tombol "Tambah ke Keranjang".
- Keranjang belanja menampilkan barang, qty, dan subtotal, serta total
  keseluruhan otomatis terupdate.
- Tombol "Hapus Item" untuk membatalkan salah satu barang di keranjang.
- Tombol "Bayar / Checkout": input nominal uang bayar, sistem menghitung
  kembalian, mengurangi stok produk, dan menampilkan struk belanja.
- Tombol "Transaksi Baru" untuk mengosongkan keranjang.
- Validasi: tidak bisa checkout jika keranjang kosong, tidak bisa beli
  melebihi stok, dan tidak bisa checkout jika uang bayar kurang.

IDE UNTUK MENGEMBANGKAN LEBIH LANJUT
-------------------------------------
Karena ini murni kode Java Swing (tanpa file .form NetBeans khusus),
kode ini juga bisa langsung dibuka/dijalankan di IDE Java lain seperti
IntelliJ IDEA atau Eclipse jika suatu saat dibutuhkan.

IDE UNTUK PENGEMBANGAN LANJUTAN (contoh ide tambahan jika mau dikembangkan)
----------------------------------------------------------------------------
- Simpan riwayat transaksi ke file .txt/.csv (opsional, masih tanpa database)
- Tambah fitur diskon / kategori barang
- Tambah fitur cari produk (search bar)
- Ganti data produk manual dengan input dari file .csv saat aplikasi start
