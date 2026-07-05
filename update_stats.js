const db = require('./database/db');
async function run() {
  await db.execute("INSERT IGNORE INTO site_stats (key_name, value_int, description_en, description_am) VALUES ('electronics', 5890, 'Total electronics listed', 'ጠቅላላ የኤሌክትሮኒክስ እቃዎች')");
  console.log('Stats updated');
  process.exit(0);
}
run();
