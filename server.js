import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";

const { Pool } = pkg;  // ✅ import Pool from pg

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json());

// POST endpoint for ESP32
app.post("/data", async (req, res) => {
  const { temperature, humidity } = req.body;
  try {
    await pool.query(
      "INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2)",
      [temperature, humidity]
    );
    res.status(200).send("Data stored successfully!");
  } catch (err) {
    console.error("Database insert error:", err);
    res.status(500).send("Database error");
  }
});

// GET endpoint for frontend
app.get("/data", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sensor_data ORDER BY id DESC LIMIT 20"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database fetch error:", err);
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
