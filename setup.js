// Run with: npm run setup   (creates the table and inserts the starting records)
const pool = require("./db");
const { initDb } = require("./init");

initDb()
  .then(() => console.log("Database ready: table created and starting records inserted (once)."))
  .catch((err) => { console.error("Setup failed:", err.message); process.exitCode = 1; })
  .finally(() => pool.end());
