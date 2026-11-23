// init.js - runs schema.sql and seed.sql (both are safe to run again)
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  await pool.query(schema);
  await pool.query(seed);
}

module.exports = { initDb };
