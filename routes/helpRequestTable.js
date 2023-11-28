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

// VATTHANA CODE START HERE

// GET request to get all help requests from the database

router.get("/vatthana", (req, res) => {
  const query = `
  SELECT hr.*, s.name AS student_name, s.profile_pic AS student_profile_pic, pronouns AS pronouns
  FROM help_request hr
  LEFT JOIN student s ON hr.student_id = s.student_id;
`;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Database query error: " + err.stack);
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json(results);
    console.log(results);
  });
});

// POST request to mark selected requests as done and chande done to 1 in the database 🦄🦄

router.post("/vatthana/mark-as-done", (req, res) => {
  const { selectedRequests } = req.body;
  console.log(selectedRequests);

  if (
    !selectedRequests ||
    !Array.isArray(selectedRequests) ||
    selectedRequests.length === 0
  ) {
    console.error("Invalid or empty selectedRequests array");
    res.status(400).json({ error: "Invalid or empty selectedRequests  array" });
    return;
  }

  const query = `
    UPDATE help_request
    SET done = 1
    WHERE request_id IN (?);
  `;

  pool.query(query, [selectedRequests], (err, results) => {
    if (err) {
      console.error("Database query error: " + err.stack);
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json({ message: "Selected requests marked as done." });
  });
});

//  POST request to add a new help request 🦄

router.post("/vatthana/add-request", (req, res) => {
  const { student_id, date_created, done } = req.body;
  console.log(req.body);

  // Ensure that required data is provided
  if (
    student_id === undefined ||
    date_created === undefined ||
    done === undefined
  ) {
    res.status(400).json({ error: "Missing required data" });
    console.log("Missing required data");

    return;
  }

  const query = `
    INSERT INTO help_request (student_id, date_created, done)
    VALUES (?, ?, ?);
  `;

  pool.query(query, [student_id, date_created, done], (err, results) => {
    if (err) {
      console.error("Database query error: " + err.stack);
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json({ message: "New help request added successfully" });
    console.log("New help request added successfully");
  });
});

module.exports = router;
