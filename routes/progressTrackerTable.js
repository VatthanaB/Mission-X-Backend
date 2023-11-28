require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 2,
});

router.get("/poutama", (req, res) => {
  pool.query("SELECT * FROM project;", (error, results) => {
    if (error) {
      console.error("Error getting data from database:", error);
      res.status(500).send("Server error");
      return;
    }

    res.json(results);
  });
});

module.exports = router;

router.get("/poutama/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM project WHERE project_id = ?;",
    [id],
    (error, results) => {
      const file = `2307-L4FT11-missionx-backend-t3\progressTrackerTable.js`;

      if (error) {
        console.error("Error getting data from database", error);
        res.status(500).send("Server error");
        return;
      }
      res.download(file);

      res.json(results);
    }
  );
});
