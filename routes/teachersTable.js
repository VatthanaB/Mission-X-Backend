const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenKey = process.env.TOKEN_KEY;
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

// BENSON CODE START HERE

// POUTAMA CODE START HERE

// VATTHANA CODE START HERE

// get request for all teachers from database
router.get("/vatthana/", (req, res) => {
  pool.query("SELECT * FROM teacher;", (error, results) => {
    if (error) {
      console.error("Error querying the database:", error);
      res.status(500).send("Internal server error");
      return;
    }

    res.json(results);
  });
});

// get data from teacher table using teacher email
router.get("/vatthana/email/:email", (req, res) => {
  const { email } = req.params;
  pool.query(
    "SELECT * FROM teacher WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal server error");
        return;
      }

      if (results.length > 0) {
        res.json({
          success: true,
          teacher_id: results[0].teacher_id,
          name_email: results[0].name,
          email: results[0].email,
          school: results[0].school,
          profile_pic: results[0].profile_pic,
          date_of_birth: results[0].date_of_birth,
          contact_number: results[0].contact_number,
        });
        console.log(results[0].teacher_id);
      } else {
        res.json({ success: false, message: "Teacher not found" });
      }
    }
  );
});

// get data from teacher table using teacher id
router.get("/vatthana/id/:id", (req, res) => {
  const id = req.params.id;

  pool.query(
    "SELECT * FROM teacher WHERE teacher_id = ?;",
    [id],
    (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal server error");
        return;
      }

      //  check if teacher email exists in database return error if it does
      if (results.length === 0) {
        res.status(404).send("Teacher not found");
        return;
      }

      res.json(results[0]);
    }
  );
});

// Add a new teacher to the database 🦄
router.post("/vatthana/add", (req, res) => {
  const { name, email, password, profile_pic, contact_number } = req.body;

  // check if teacher email exists in database return error if it does
  pool.query(
    "SELECT * FROM teacher WHERE email = ?",
    [email],
    (error, results) => {
      if (results.length > 0) {
        res.status(400).send("Email already exists");
        console.log("Email already exists");
        return;
      }
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal server error");
        return;
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          res.status(500).send("Internal server error");
          return;
        }

        pool.query(
          "INSERT INTO teacher (name, email, password, profile_pic, contact_number) VALUES (?, ?, ?, ?, ?);",
          [name, email, hash, profile_pic, contact_number],
          (error, results) => {
            if (error) {
              console.error("Error querying the database:", error);
              res.status(500).send("Internal server error");
              return;
            }

            res.json({
              teacher_id: results.insertId,
              name,
              email,
              password: hash,
              profile_pic,
              contact_number,
            });
          }
        );
      });
    }
  );
});
// Check validity of email and password 🦄🦄🦄

router.post("/vatthana/login", (req, res) => {
  const { email, password } = req.body;
  pool.query(
    "SELECT * FROM teacher WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).json({ success: false });
        return;
      }

      if (results.length === 0) {
        res.json({ success: false });
        return;
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).json({ success: false });
          return;
        }

        if (result) {
          // Create a token and send it to the client
          const token = jwt.sign({ email: user.email }, tokenKey, {
            expiresIn: "1h",
          });
          console.log(" Teacher token", token);
          res.json({ success: true, token });
        } else {
          res.json({ success: false });
        }
      });
    }
  );
});

// Function to verify token from client 🦄🦄

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  jwt.verify(token, tokenKey, (err, decoded) => {
    if (err) {
      console.error("Error verifying token:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to authenticate token" });
      return;
    }

    req.user = decoded;
    next();
  });
}

// Protected route to test token 🦄🦄
router.get("/vatthana/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "Protected route", user: req.user });
});

// EXPORTS ROUTER
module.exports = router;
