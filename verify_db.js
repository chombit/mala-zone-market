const db = require('./database/db');

async function checkColumns() {
  try {
    const [rows] = await db.execute('SHOW COLUMNS FROM listings');
    console.log("COLUMNS:");
    rows.forEach(r => console.log(r.Field + " (" + r.Type + ")"));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkColumns();
