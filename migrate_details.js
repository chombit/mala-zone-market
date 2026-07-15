const db = require('./database/db');

async function migrate() {
  try {
    console.log("Checking and adding new columns to listings table...");

    const newColumns = [
      "ADD COLUMN title_deed VARCHAR(100) COMMENT 'Title deed / Carta type'",
      "ADD COLUMN description_am TEXT COMMENT 'Amharic description'",
      "ADD COLUMN description_en TEXT COMMENT 'English description'",
      "ADD COLUMN is_negotiable TINYINT(1) DEFAULT 0 COMMENT 'If price is negotiable'",
      "ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0 COMMENT 'Listing rating'"
    ];

    for (const col of newColumns) {
      try {
        await db.execute(`ALTER TABLE listings ${col}`);
        console.log(`Successfully executed: ALTER TABLE listings ${col}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists: ${col}`);
        } else {
          throw err;
        }
      }
    }

    console.log("Migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
