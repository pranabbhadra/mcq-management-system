
const express = require('express');
const mongoose = require('./config/db'); // MongoDB connection
const session = require('express-session');
require('dotenv').config(); // Load environment variables from .env file
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3000;
const router = require("./routes")

const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views')); // Views directory
app.use(express.static(path.join(__dirname, 'public'))); // Static files directory

app.use(
    session({
      secret: 'your_secret_key', // Replace with a strong secret
      resave: false, // Don't save session if it hasn't been modified
      saveUninitialized: false, // Don't save uninitialized sessions
      store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/your_database_name', // Your MongoDB connection string
        collectionName: 'sessions', // Optional: Customize the collection name for sessions
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        //httpOnly: true, // Helps prevent XSS
      },
    })
  );
// Router
app.use(router)
// Handle 404 - Route Not Found
app.use((req, res, next) => {
    res.status(404).render('404', { errorMessage: 'Page not found' });
});

 mongoose();
// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

