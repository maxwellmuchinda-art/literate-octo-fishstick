// db.js - creates and exports the PostgreSQL connection pool
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render's EXTERNAL database URL needs SSL; the INTERNAL one does not.
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
});

pool.on("error", (err) => console.error("Unexpected database error:", err.message));

module.exports = pool;
