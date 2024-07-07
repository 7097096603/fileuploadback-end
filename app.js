const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '3699',
        database: 'files'
    }
);

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});


  const upload = multer({ storage: multer.memoryStorage() });

  app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
      const sql = "INSERT INTO files (file_name,filedata) VALUES (?,?)";
      connection.query(sql, [req.file.originalname, req.file.buffer], (err, result) => {
        if (err) throw err;
        res.json({ message: 'File uploaded successfully', file: req.file });
      });
    } else {
      res.status(400).send('No file uploaded');
    }
  });

  app.get('/files', (req, res) => {
    const sql = "SELECT id, file_name FROM files";
    connection.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

  app.get('/files/:id', (req, res) => {
    const sql = "SELECT file_name, filedata FROM files WHERE id = ?";
    connection.query(sql, [req.params.id], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const filedata = results[0].filedata;
        const filename = results[0].file_name;
        const mimetype = path.extname(filename).toLowerCase() === '.mp4' ? 'video/mp4' : 'application/octet-stream';
  
        res.setHeader('Content-Disposition', `inline; filename=${filename}`);
        res.setHeader('Content-Type', mimetype);
        res.send(filedata);
      } else {
        res.status(404).send('File not found');
      }
    });
  });


app.listen(3000, (err) => {
    if (err) throw err;
    console.log('Server is running on port 3000');
});