const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session
app.use(
    session({
        secret: 'your_secret_key', // Replace with a strong secret key
        resave: false,
        saveUninitialized: false,
    })
);

// Path to JSON file
const dataFilePath = path.join(__dirname, 'data', 'users.json');

// Handle registration
app.post('/submit-form', (req, res) => {
    const userData = req.body;

    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading user data.');
        }

        let users = [];
        if (data.length) {
            users = JSON.parse(data); // Parse existing data
        }

        users.push(userData);

        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving user data.');
            }
            res.send('User registered successfully!');
        });
    });
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading user data.');
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            req.session.user = user; // Store user in session
            res.redirect('/profile');
        } else {
            res.status(401).send('Invalid email or password.');
        }
    });
});

// Serve profile page
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    const user = req.session.user;
    res.send(`
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <style>
    body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(120deg, #2980b9, #6dd5fa);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url(Mountain.jpg);
    background-size:cover;
}

#profile-center {
    text-align: center;
    background: transparent;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    padding: 20px;
    width: 350px;
    border: 1px solid white;
}

#profile-box {
    color:white;
    /* box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); */
}
#blur-box{
    border-radius:10px;
    width: 345px;
    height: 330px;
    filter: blur(5px);
    border: 2px solid white;
    position:fixed;
    backdrop-filter: blur(0.5px);
    z-index: -1;
    padding: 22px;
    margin-left: -20px;
    margin-top: -20px;
}

#profile-heading {
    font-size: 24px;
    margin-bottom: 20px;
    color: white;
}

#profile-info p {
    margin: 10px 0;
    font-size: 16px;
    text-align: left;
    padding: 0 10px;
    line-height: 1.6;
}

#logout-btn {
    margin-top: 20px;
    background: white;
    color: black;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.8s;
}

#logout-btn:hover {
    background: linear-gradient(90deg, white, silver);
    color: black;
}

#logout-btn:focus {
    outline: none;
}

#infoline{
    font-style: italic;
    margin: 10px 0; 
    font-size: 18px; 
    text-align: left; 
    padding: 0 15px; 
    line-height: 1.6; 
    border-left: 7px solid rgb(84, 89, 184); 
    background-color: white;
    /* border: 1px solid white; */
    border-radius: 5px; 
    padding-left: 10px;
    color: black;
}

    </style>
</head>
<body>
    <div id="profile-center">
        <div id="blur-box"></div>
        <div id="profile-box">
            <h1 id="profile-heading">Welcome, <span id="user-name">${user.fname}</span></h1>
            <div id="profile-info">
                <p id="infoline"><strong>Email:</strong> <span id="user-email">${user.email}</span></p>
                <p id="infoline"><strong>Phone Number:</strong> <span id="user-phone">${user.number}</span></p>
                <p id="infoline"><strong>Gender:</strong> <span id="user-gender">${user.gender}</span></p>
                <p id="infoline"><strong>Birthday:</strong> <span id="user-birthday">${user.date}</span></p>
                <p id="infoline"><strong>Degree:</strong> <span id="user-degree">${user.degree}</span></p>
                <p id="infoline"><strong>Year:</strong> <span id="user-year">${user.year}</span></p>
            </div>
            <button id="logout-btn" onclick="window.location.href='/logout'">Logout</button>
        </div>
    </div>
</body>
</html>
    `);
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
