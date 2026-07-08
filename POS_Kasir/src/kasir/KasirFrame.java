package kasir;

import java.awt.*;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

/**
 * Jendela utama Aplikasi Kasir Sederhana.
 * Semua data (produk & transaksi) disimpan di memory (ArrayList),
 * tidak menggunakan database ataupun server.
 */
public class KasirFrame extends JFrame {

    private final List<Product> daftarProduk = new ArrayList<>();
    private final List<CartItem> keranjang = new ArrayList<>();
    private final DecimalFormat rupiah = new DecimalFormat("Rp #,###");

    private JTable tabelProduk;
    private DefaultTableModel modelProduk;

    private JTable tabelKeranjang;
    private DefaultTableModel modelKeranjang;

    private JSpinner spinnerQty;
    private JLabel labelTotal;

    public KasirFrame() {
        setTitle("Aplikasi Kasir Sederhana");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(950, 550);
        setLocationRelativeTo(null);

        buatDataProduk();
        buatKomponen();
    }

    /** Data produk contoh, hardcode di memory */
    private void buatDataProduk() {
        daftarProduk.add(new Product("P001", "Indomie Goreng", 3500, 50));
        daftarProduk.add(new Product("P002", "Aqua Botol 600ml", 4000, 40));
        daftarProduk.add(new Product("P003", "Teh Pucuk 350ml", 5000, 30));
        daftarProduk.add(new Product("P004", "Roti Tawar", 15000, 20));
        daftarProduk.add(new Product("P005", "Kopi Kapal Api Sachet", 1500, 100));
        daftarProduk.add(new Product("P006", "Beras 1kg", 13000, 25));
        daftarProduk.add(new Product("P007", "Minyak Goreng 1L", 18000, 15));
        daftarProduk.add(new Product("P008", "Gula Pasir 1kg", 14000, 20));
        daftarProduk.add(new Product("P009", "Sabun Mandi", 3000, 35));
        daftarProduk.add(new Product("P010", "Snack Chitato", 10000, 40));
    }

    private void buatKomponen() {
        setLayout(new BorderLayout(10, 10));

        JLabel judul = new JLabel("APLIKASI KASIR SEDERHANA", SwingConstants.CENTER);
        judul.setFont(new Font("SansSerif", Font.BOLD, 20));
        judul.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        add(judul, BorderLayout.NORTH);

        JPanel panelUtama = new JPanel(new GridLayout(1, 2, 10, 10));
        panelUtama.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panelUtama.add(buatPanelProduk());
        panelUtama.add(buatPanelKeranjang());

        add(panelUtama, BorderLayout.CENTER);
    }

    // ================= PANEL DAFTAR PRODUK (KIRI) =================
    private JPanel buatPanelProduk() {
        JPanel panel = new JPanel(new BorderLayout(5, 5));
        panel.setBorder(BorderFactory.createTitledBorder("Daftar Produk"));

        modelProduk = new DefaultTableModel(
                new Object[]{"Kode", "Nama Barang", "Harga", "Stok"}, 0) {
            @Override
            public boolean isCellEditable(int row, int col) {
                return false;
            }
        };
        for (Product p : daftarProduk) {
            modelProduk.addRow(new Object[]{p.getKode(), p.getNama(), rupiah.format(p.getHarga()), p.getStok()});
        }

        tabelProduk = new JTable(modelProduk);
        tabelProduk.setRowHeight(24);
        panel.add(new JScrollPane(tabelProduk), BorderLayout.CENTER);

        JPanel panelBawah = new JPanel(new FlowLayout(FlowLayout.LEFT));
        panelBawah.add(new JLabel("Jumlah:"));
        spinnerQty = new JSpinner(new SpinnerNumberModel(1, 1, 999, 1));
        panelBawah.add(spinnerQty);

        JButton btnTambah = new JButton("Tambah ke Keranjang ->");
        btnTambah.addActionListener(e -> tambahKeKeranjang());
        panelBawah.add(btnTambah);

        panel.add(panelBawah, BorderLayout.SOUTH);
        return panel;
    }

    // ================= PANEL KERANJANG (KANAN) =================
    private JPanel buatPanelKeranjang() {
        JPanel panel = new JPanel(new BorderLayout(5, 5));
        panel.setBorder(BorderFactory.createTitledBorder("Keranjang Belanja"));

        modelKeranjang = new DefaultTableModel(
                new Object[]{"Kode", "Nama Barang", "Harga", "Qty", "Subtotal"}, 0) {
            @Override
            public boolean isCellEditable(int row, int col) {
                return false;
            }
        };
        tabelKeranjang = new JTable(modelKeranjang);
        tabelKeranjang.setRowHeight(24);
        panel.add(new JScrollPane(tabelKeranjang), BorderLayout.CENTER);

        JPanel panelBawah = new JPanel();
        panelBawah.setLayout(new BoxLayout(panelBawah, BoxLayout.Y_AXIS));

        JPanel panelTombol = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton btnHapus = new JButton("Hapus Item");
        btnHapus.addActionListener(e -> hapusItemKeranjang());
        JButton btnBaru = new JButton("Transaksi Baru");
        btnBaru.addActionListener(e -> transaksiBaru());
        JButton btnBayar = new JButton("Bayar / Checkout");
        btnBayar.setFont(btnBayar.getFont().deriveFont(Font.BOLD));
        btnBayar.addActionListener(e -> prosesBayar());

        panelTombol.add(btnHapus);
        panelTombol.add(btnBaru);
        panelTombol.add(btnBayar);

        labelTotal = new JLabel("Total: Rp 0", SwingConstants.RIGHT);
        labelTotal.setFont(new Font("SansSerif", Font.BOLD, 18));
        labelTotal.setBorder(BorderFactory.createEmptyBorder(5, 0, 5, 10));

        panelBawah.add(labelTotal);
        panelBawah.add(panelTombol);
        panel.add(panelBawah, BorderLayout.SOUTH);

        return panel;
    }

    // ================= LOGIKA APLIKASI =================

    private void tambahKeKeranjang() {
        int baris = tabelProduk.getSelectedRow();
        if (baris == -1) {
            JOptionPane.showMessageDialog(this, "Pilih produk terlebih dahulu.", "Peringatan", JOptionPane.WARNING_MESSAGE);
            return;
        }

        Product produk = daftarProduk.get(baris);
        int qty = (int) spinnerQty.getValue();

        // Cek total qty yang sudah ada di keranjang untuk produk ini
        int qtyDiKeranjang = 0;
        CartItem itemLama = null;
        for (CartItem ci : keranjang) {
            if (ci.getProduct().getKode().equals(produk.getKode())) {
                qtyDiKeranjang = ci.getQty();
                itemLama = ci;
                break;
            }
        }

        if (qtyDiKeranjang + qty > produk.getStok()) {
            JOptionPane.showMessageDialog(this,
                    "Stok tidak mencukupi.\nStok tersedia: " + produk.getStok() + ", sudah di keranjang: " + qtyDiKeranjang,
                    "Stok Tidak Cukup", JOptionPane.ERROR_MESSAGE);
            return;
        }

        if (itemLama != null) {
            itemLama.setQty(itemLama.getQty() + qty);
        } else {
            keranjang.add(new CartItem(produk, qty));
        }

        refreshTabelKeranjang();
    }

    private void hapusItemKeranjang() {
        int baris = tabelKeranjang.getSelectedRow();
        if (baris == -1) {
            JOptionPane.showMessageDialog(this, "Pilih item di keranjang yang ingin dihapus.", "Peringatan", JOptionPane.WARNING_MESSAGE);
            return;
        }
        keranjang.remove(baris);
        refreshTabelKeranjang();
    }

    private void transaksiBaru() {
        if (keranjang.isEmpty()) {
            return;
        }
        int pilih = JOptionPane.showConfirmDialog(this,
                "Kosongkan keranjang dan mulai transaksi baru?",
                "Transaksi Baru", JOptionPane.YES_NO_OPTION);
        if (pilih == JOptionPane.YES_OPTION) {
            keranjang.clear();
            refreshTabelKeranjang();
        }
    }

    private void refreshTabelKeranjang() {
        modelKeranjang.setRowCount(0);
        double total = 0;
        for (CartItem ci : keranjang) {
            modelKeranjang.addRow(new Object[]{
                    ci.getProduct().getKode(),
                    ci.getProduct().getNama(),
                    rupiah.format(ci.getProduct().getHarga()),
                    ci.getQty(),
                    rupiah.format(ci.getSubtotal())
            });
            total += ci.getSubtotal();
        }
        labelTotal.setText("Total: " + rupiah.format(total));
    }

    private double hitungTotal() {
        double total = 0;
        for (CartItem ci : keranjang) {
            total += ci.getSubtotal();
        }
        return total;
    }

    private void prosesBayar() {
        if (keranjang.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Keranjang masih kosong.", "Peringatan", JOptionPane.WARNING_MESSAGE);
            return;
        }

        double total = hitungTotal();
        String input = JOptionPane.showInputDialog(this,
                "Total belanja: " + rupiah.format(total) + "\nMasukkan jumlah uang bayar:",
                "Pembayaran", JOptionPane.PLAIN_MESSAGE);

        if (input == null) {
            return; // dibatalkan
        }

        double bayar;
        try {
            bayar = Double.parseDouble(input.trim().replace(",", ""));
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Masukkan angka yang valid.", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        if (bayar < total) {
            JOptionPane.showMessageDialog(this, "Uang tidak cukup!", "Pembayaran Gagal", JOptionPane.ERROR_MESSAGE);
            return;
        }

        double kembalian = bayar - total;

        // Kurangi stok produk sesuai qty yang dibeli
        for (CartItem ci : keranjang) {
            ci.getProduct().setStok(ci.getProduct().getStok() - ci.getQty());
        }
        refreshTabelProduk();

        tampilkanStruk(total, bayar, kembalian);

        keranjang.clear();
        refreshTabelKeranjang();
    }

    private void refreshTabelProduk() {
        for (int i = 0; i < daftarProduk.size(); i++) {
            modelProduk.setValueAt(daftarProduk.get(i).getStok(), i, 3);
        }
    }

    private void tampilkanStruk(double total, double bayar, double kembalian) {
        StringBuilder sb = new StringBuilder();
        sb.append("======== STRUK BELANJA ========\n");
        sb.append(String.format("%-16s %4s %10s%n", "Nama Barang", "Qty", "Subtotal"));
        sb.append("--------------------------------\n");
        for (CartItem ci : keranjang) {
            sb.append(String.format("%-16s %4d %10s%n",
                    potong(ci.getProduct().getNama(), 16),
                    ci.getQty(),
                    rupiah.format(ci.getSubtotal())));
        }
        sb.append("--------------------------------\n");
        sb.append(String.format("%-16s %14s%n", "TOTAL", rupiah.format(total)));
        sb.append(String.format("%-16s %14s%n", "BAYAR", rupiah.format(bayar)));
        sb.append(String.format("%-16s %14s%n", "KEMBALI", rupiah.format(kembalian)));
        sb.append("================================\n");
        sb.append("     Terima kasih telah belanja!");

        JTextArea area = new JTextArea(sb.toString());
        area.setEditable(false);
        area.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 13));

        JOptionPane.showMessageDialog(this, new JScrollPane(area), "Struk Pembayaran", JOptionPane.PLAIN_MESSAGE);
    }

    private String potong(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }
}
