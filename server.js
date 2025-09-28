import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway gives this automatically
  ssl: { rejectUnauthorized: false }
});

// Create table if not exists
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        temperature FLOAT,
        humidity FLOAT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
};
initDB();

// Routes
app.get("/", (req, res) => {
  res.send("ESP32 Backend is running 🚀");
});

app.get("/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 20");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

app.post("/data", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    await pool.query(
      "INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2)",
      [temperature, humidity]
    );
    res.send("Data stored successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting data");
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
