const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'malazone'
  });

  try {
    const query = `
      CREATE TABLE IF NOT EXISTS translations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        text_key VARCHAR(100) NOT NULL UNIQUE,
        en_value TEXT NOT NULL,
        am_value TEXT NOT NULL,
        section VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_section (section)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await connection.execute(query);
    console.log('Translations table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await connection.end();
  }
}

runMigration();
