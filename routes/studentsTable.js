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

router.get("/benson/student_projects", (req, res) => {
  pool.query("SELECT * FROM student_project;", (error, results) => {
    if (error) {
      console.error("Error", error);
      res.status(500).send("Error detected while retriveing data");
      return;
    }
    res.json(results);
  });
});

router.get("/benson/projects", (req, res) => {
  pool.query("SELECT * FROM project;", (error, results) => {
    if (error) {
      console.error("Error", error);
      res.status(500).send("Error detected while retriveing data");
      return;
    }
    res.json(results);
  });
});

// VATTHANA CODE START HERE
// get all students from database
router.get("/vatthana/", (req, res) => {
  const query = `SELECT * FROM student;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error querying the database:", error);
      res.status(500).send("Internal server error");
      return;
    }
    console.log(results);
    res.json(results);
  });
});

// get student id with email as input from database
router.get("/vatthana/email/:email", (req, res) => {
  const { email } = req.params;
  pool.query(
    "SELECT * FROM student WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal server error");
        return;
      }

      if (results.length > 0) {
        res.json({ success: true, student: results[0].student_id });
        console.log(results[0].student_id);
      } else {
        res.json({ success: false, message: "Teacher not found" });
      }
    }
  );
});

// get request for student by id from database
router.get("/vatthana/id/:id", (req, res) => {
  const id = req.params.id;
  const query = `SELECT 
  s.*,
  t.name AS teacher_name
FROM student s
LEFT JOIN teacher t ON s.teacher_id = t.teacher_id
WHERE s.student_id = ?;`;

  "SELECT * FROM student WHERE student_id = ?;",
    pool.query(query, [id], (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal server error");
        return;
      }

      if (results.length === 0) {
        res.status(404).send("Student not found");
        return;
      }

      res.json(results[0]);
    });
});

//   post request for add student to database 🦄
router.post("/vatthana/add", (req, res) => {
  const {
    name,
    email,
    password,
    school,
    profile_pic,
    date_of_birth,
    contact_number,
    course,
    teacher_id,
  } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Internal server error");
      return;
    }

    // check if teacher email exists in database return error if it does
    pool.query(
      "SELECT * FROM student WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.error("Error querying the database:", error);
          res.status(500).send("Internal server error");
          return;
        }
        // check if student email exists in database return error if it does
        if (results.length > 0) {
          res.status(400).json({ message: "Email already exists" });
          return;
        } else {
          pool.query(
            "INSERT INTO student (name, email, password, school, profile_pic, date_of_birth, contact_number, course, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [
              name,
              email,
              hashedPassword,
              school,
              profile_pic,
              date_of_birth,
              contact_number,
              course,
              teacher_id,
            ],
            (error, results) => {
              if (error) {
                console.error("Error querying the database:", error);
                res.status(500).send("Internal server error");
                return;
              }

              res.json({
                student_id: results.insertId,
                name,
                email,
                password: hashedPassword,
                school,
                profile_pic,
                date_of_birth,
                contact_number,
                course,
                teacher_id,
              });
            }
          );
        }
      }
    );
  });
});

//  post request for login , check if email and password match in database🦄
router.post("/vatthana/login", (req, res) => {
  const { email, password } = req.body;
  pool.query(
    "SELECT * FROM student WHERE email = ?",
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
          console.log(" Student token", token);
          res.json({ success: true, token });
        } else {
          res.json({ success: false });
        }
      });
    }
  );
});

//  Function to verify token from client 🦄

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

// Protected route to test token for student 🦄
router.get("/vatthana/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "Protected route", user: req.user });
});

//  EXPORT

module.exports = router;
