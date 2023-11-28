const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const progressTrackerRouter = require("./routes/progressTrackerTable");
const studentProfileRouter = require("./routes/studentProfileTable");

const studentsRouter = require("./routes/studentsTable");
const teachersRouter = require("./routes/teachersTable");
const helpRequestRouter = require("./routes/helpRequestTable");
const studentLibraryRouter = require("./routes/studentLibrary");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ROUTES

// Mount the students router
app.use("/students", studentsRouter);

// Mount the teachers router
app.use("/teachers", teachersRouter);

// Mount the help request router
app.use("/help-requests", helpRequestRouter);

//Mount the progress tracker router
app.use("/progress-tracker", progressTrackerRouter);

//Mount the student profile router
app.use("/student-profile", studentProfileRouter);

// Mount the student library router
app.use("/student-library", studentLibraryRouter);

// Start the server

app.listen(port, (error) => {
  if (error) {
    console.error(`Failed to start server: ${error}`);
  } else {
    console.log(`Server is listening on port ${port}`);
  }
});
