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
  
  pool.query("SELECT * FROM student;", (error, results) => {
    if (error) {
      console.error("Error getting data from database:", error);
      res.status(500).send("Server error");
      return;
    }
console.log(results)
    res.json(results);
  });
});

module.exports = router;

router.get("/poutama/:id", (req, res) => {
  const id = req.params.id;
  pool.query("SELECT * FROM student WHERE student_id = ?;", [id], (error, results) => {
    
    if (error) {
      console.error("Error getting data from database", error);
      res.status(500).send("Server error");
      return;
    }

    res.json(results);
  });
});
