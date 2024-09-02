const { Pool } = require('pg');

// Konfigurasi koneksi database PostgreSQL
const pool = new Pool({
  user: 'postgres', // Username PostgreSQL
  host: 'localhost', // Host database
  database: 'cherry-blossom', // Nama database
  password: 'admin', // Password PostgreSQL
  port: 5432, // Port PostgreSQL default
});

// Fungsi untuk menguji koneksi ke database
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    client.release(); // Lepaskan koneksi setelah digunakan
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err);
  }
};

// Jalankan tes koneksi (opsional, bisa dihapus jika tidak diperlukan)
testConnection();

module.exports = pool; // Ekspor pool untuk digunakan dalam aplikasi Anda
