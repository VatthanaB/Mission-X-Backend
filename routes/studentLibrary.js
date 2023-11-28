const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const router = express.Router();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// PROJECT REQUESTS

// Request to get all projects
router.get("/vatthana/projects", (req, res) => {
  const query = "SELECT * FROM project";

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Database query error: " + err.stack);
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json(results);
  });
});

// Request to sort out end return the projects based on the selected filters
router.get("/vatthana/sort", (req, res) => {
  const {
    subscription,
    activity_type,
    year_level,
    subject_matter,
    course,
    activeLevelButtonNumber,
  } = req.query;

  // Define the base query
  let query = "SELECT * FROM project WHERE 1 = 1"; // The "1 = 1" is always true to allow for easy appending of conditions

  // Add filtering conditions based on selected filters
  if (subscription) {
    query += ` AND subscription IN ('${subscription.join("','")}')`;
  }
  if (activity_type) {
    query += ` AND activity_type IN ('${activity_type.join("','")}')`;
  }
  if (year_level) {
    query += ` AND year_level IN ('${year_level.join("','")}')`;
  }
  if (subject_matter) {
    query += ` AND subject_matter IN ('${subject_matter.join("','")}')`;
  }

  if (course) {
    query += ` AND course IN ('${course}')`;
  }

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Database query error: " + err.stack);
      res.status(500).json({ error: "Database error" });
      return;
    }
    if (activeLevelButtonNumber === "5") {
      // Assign the sliced results back to the variable
      results = results.slice(0, 5);
    } else if (activeLevelButtonNumber === "10") {
      // Assign the sliced results back to the variable
      results = results.slice(0, 10);
    }
    res.json(results);
    console.log(results);
  });
});

module.exports = router;
