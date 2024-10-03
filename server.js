const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config()


const app = express();

const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
});

db.connect(err => {
    if (err) {
        console.log("db connection failed: ", err);
    } else {
        console.log("db connection successful");
    }
});


app.listen(PORT, () => {
    console.log(`server is running on ${PORT} port`)
});



app.post('/users', (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
        return res.status(400).send('Name and address are required.');
    }

   
    const userQuery = `INSERT INTO User (name) VALUES (?)`;

    db.query(userQuery, [name], (err, result) => {
        if (err) {
            return res.status(500).send('Error saving user');
        }

        const userId = result.insertId;

        const addressQuery = `INSERT INTO Address (userId, address) VALUES (?, ?)`;

        db.query(addressQuery, [userId, address], (err, result) => {
            if (err) {
                return res.status(500).send('Error saving address');
            }
            res.status(201).send('User and address saved successfully');
        });
    });
});



app.get('/users', (req, res) => {
    const query = `
        SELECT u.id, u.name, a.address 
        FROM user u
        LEFT JOIN address a ON u.id = a.userId
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving users');        
        }
      
        res.json(results);
    });
});


