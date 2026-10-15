# Live 

https://mrsmagic-arc.github.io/taskly-todo-app/

# Taskly

Taskly adalah aplikasi daftar tugas ringan yang berjalan langsung di browser. Aplikasi dibuat dengan HTML, CSS, dan JavaScript murni, tanpa framework, backend, atau proses instalasi dependensi.

## Fitur

- Menambah tugas dengan tombol **Add task** atau tombol `Enter`.
- Menambahkan deadline opsional pada tugas.
- Menandai tugas selesai atau mengaktifkannya kembali.
- Mengedit teks tugas dengan tombol edit atau klik dua kali pada teks.
- Menghapus tugas.
- Memfilter daftar menjadi **All**, **Active**, atau **Completed**.
- Melihat persentase dan jumlah tugas yang selesai melalui **Progress tracker**.
- Melihat deadline di setiap tugas; deadline yang terlewat pada tugas belum selesai diberi penanda.
- Menyimpan dan memuat tugas dari `localStorage`.
- Menggunakan daftar tugas dengan tinggi maksimum dan scrollbar, serta layout responsif.

## Menjalankan aplikasi

1. Buka folder proyek.
2. Buka `index.html` menggunakan browser modern.
3. Tambahkan tugas melalui kolom teks. Deadline boleh dikosongkan.

Tidak diperlukan server lokal atau perintah build. Data disimpan pada browser dan profil yang sama, jadi data tidak otomatis tersinkron ke browser/perangkat lain.

## Struktur berkas

```text
Taskly/
├── index.html
├── style.css
└── script.js
```

- `index.html` menyediakan struktur halaman, form, tracker, filter, dan wadah daftar tugas.
- `style.css` mengatur tema warna hangat, layout, responsivitas, scrollbar, dan keadaan interaktif.
- `script.js` menangani data, render, interaksi tugas, validasi, dan penyimpanan.

## Model data dan penyimpanan

Tugas disimpan dalam array JSON pada `localStorage` dengan key `taskly_app_tasks`:

```json
{
  "id": "id-unik",
  "text": "Selesaikan laporan",
  "completed": false,
  "deadline": "2026-12-31"
}
```

`deadline` menggunakan format tanggal `YYYY-MM-DD`; nilainya string kosong jika tidak ditentukan. Data lama yang belum mempunyai properti `deadline` tetap dapat dimuat. Deadline yang formatnya tidak valid dibersihkan ketika data dibaca. Data local storage hanya tersedia untuk origin/browser yang sama.

## Alur aplikasi

1. `script.js` membaca data tersimpan saat halaman dimuat.
2. `renderTasks()` memperbarui daftar, penghitung, progress bar, dan empty state dari state `tasks`.
3. Event form menambahkan tugas, lalu menyimpan dan merender ulang.
4. Checkbox memperbarui status; aksi edit dan hapus memperbarui teks atau mengeluarkan tugas.
5. Setiap perubahan data disimpan kembali ke `localStorage`. Filter hanya mengubah tampilan dan tidak mengubah data tugas.

## Aksesibilitas dan tampilan

Form dan tombol memiliki label, filter menyampaikan status terpilih melalui `aria-pressed`, progress bar menggunakan atribut ARIA, dan pesan status memakai `aria-live`. Fokus keyboard terlihat, ikon dekoratif disembunyikan dari pembaca layar, dan animasi mengikuti preferensi `prefers-reduced-motion`.

Warna utama tema adalah `#FFB38E`, `#FFCF9D`, `#FFB26F`, dan `#DE8F5F`. Layout menyesuaikan viewport, sedangkan daftar tugas dibatasi maksimal 320 px dan dapat di-scroll.

## Pemeriksaan manual

1. Tambahkan tugas tanpa deadline dan satu tugas dengan deadline.
2. Muat ulang halaman, lalu pastikan tugas dan deadline masih ada.
3. Tandai tugas selesai dan pastikan progress tracker berubah.
4. Uji filter All, Active, dan Completed.
5. Edit dan hapus tugas; pastikan perubahan tetap tersimpan setelah reload.
6. Tambahkan banyak tugas dan pastikan daftar bergulir di dalam wadahnya.
7. Uji viewport mobile dan pastikan halaman tidak melebar secara horizontal.
