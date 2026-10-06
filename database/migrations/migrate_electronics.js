const db = require('../db');

async function run() {
  try {
    // 1. Alter listings table
    console.log("Altering listings table...");
    await db.execute(`
      ALTER TABLE listings 
      MODIFY COLUMN category ENUM('property', 'motors', 'stay', 'ceremony', 'heavy', 'electronics') NOT NULL
    `);

    // 2. Insert into categories table
    console.log("Inserting into categories...");
    await db.execute(`
      INSERT IGNORE INTO categories (key_name, label_en, label_am, description_en, description_am, display_order, is_active)
      VALUES ('electronics', 'Electronics', 'ኤሌክትሮኒክስ', 'Phones, computers, and appliances', 'ስልኮች፣ ኮምፒውተሮች', 5, 1)
    `);

    // 3. Insert into hero_slides
    console.log("Inserting into hero_slides...");
    await db.execute(`
      INSERT INTO hero_slides (image_url, pillar_key, category_id, label_en, label_am, display_order, is_active)
      VALUES ('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&q=90&fm=webp', 'nav.cat6', 'electronics', 'Electronics Zone', 'ኤሌክትሮኒክስ ዞን', 5, 1)
    `);

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

run();
