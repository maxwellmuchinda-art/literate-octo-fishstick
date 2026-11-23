// routes/records.js - the five record routes
const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const MAX_ID = 2147483647; // largest value of a PostgreSQL SERIAL column
const COLUMNS = "id, title, category, description, status";

// Returns { value } with trimmed fields, or { error } with a clear message.
function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }
  const rules = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];
  const clean = {};
  for (const [key, label, min, max] of rules) {
    const raw = body[key];
    if (raw === undefined || raw === null) return { error: `${label} is required.` };
    if (typeof raw !== "string") return { error: `${label} must be text.` };
    const text = raw.trim();
    if (text.length < min || text.length > max) {
      return { error: `${label} must have ${min} to ${max} characters.` };
    }
    clean[key] = text;
  }
  if (body.status === undefined || body.status === null) return { error: "Status is required." };
  if (typeof body.status !== "string") return { error: "Status must be text." };
  const status = body.status.trim();
  if (!STATUSES.includes(status)) return { error: "Status must be Pending, In progress or Completed." };
  clean.status = status;
  return { value: clean }; // any client-supplied id is ignored
}

// Sends the error itself and returns null when the id is not usable.
function readId(req, res) {
  const raw = req.params.id;
  if (!/^[1-9]\d*$/.test(raw)) {
    res.status(400).json({ message: "Id must be a positive whole number." });
    return null;
  }
  const id = Number(raw);
  if (id > MAX_ID) {
    res.status(404).json({ message: "Record not found." });
    return null;
  }
  return id;
}

// GET /api/records - read all
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id - read one
router.get("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/records - create
router.post("/", async (req, res, next) => {
  try {
    const { value, error } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
      `VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/records/:id - replace the four editable fields
router.put("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const { value, error } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
      `WHERE id = $5 RETURNING ${COLUMNS}`,
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/records/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
