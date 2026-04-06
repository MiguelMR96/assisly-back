require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* TEST ROUTE */
app.get('/', (req, res) => {
  res.send('Assisly API running');
});

/* GET ALL STUDENTS */
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

/* CREATE STUDENT */
app.post('/students', (req, res) => {
  const { first_name, last_name, email } = req.body;

  const sql = `
    INSERT INTO students (first_name, last_name, email)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [first_name, last_name, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student created', id: result.insertId });
  });
});

/* CREATE SESSION */
app.post('/sessions', (req, res) => {
  const { session_date, start_time, end_time } = req.body;

  const sql = `
    INSERT INTO sessions (session_date, start_time, end_time)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [session_date, start_time, end_time], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Session created' });
  });
});

/* RECORD ATTENDANCE */
app.post('/attendance', (req, res) => {
  const { student_id, session_id, status, confidence } = req.body;

  const sql = `
    INSERT INTO attendance (student_id, session_id, status, confidence)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [student_id, session_id, status, confidence], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Attendance recorded' });
  });
});

app.post('/upload-face', (req, res) => {
  const { student_id, face_image } = req.body;

  console.log("BODY:", req.body); // 👈 DEBUG

  if (!student_id || !face_image) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql = `
    UPDATE students
    SET face_image_path = ?
    WHERE student_id = ?
  `;

  db.query(sql, [face_image, student_id], (err, result) => {
    if (err) {
      console.error("🔥 ERROR SQL:", err); // 👈 CLAVE
      return res.status(500).json({ error: err.message });
    }

    console.log("RESULT:", result); // 👈 DEBUG

    res.json({ message: "Face saved" });
  });
});

app.get('/student/:id', (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM students WHERE student_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);

    res.json(result[0]);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});