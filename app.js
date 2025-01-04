const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mainRoutes = require('./src/routes/mainRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Use the mainRoutes for specific routes
app.use('/', mainRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});