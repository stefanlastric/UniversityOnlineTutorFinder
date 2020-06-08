const express = require('express');
const connectDB = require('./config/db');
require('./models/Appointment');
require('./models/Role');
require('./models/User');
require('./models/Subject');

// token kreira library unutar aplikacije
const app = express();

const path = require('path');
// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.use('/roles', require('./routes/roles'));
app.use('/students', require('./routes/students'));
app.use('/users', require('./routes/users'));
app.use('/teachers', require('./routes/teachers'));
app.use('/subjects', require('./routes/subjects'));
app.use('/appointments', require('./routes/appointments'));
app.use('/login', require('./routes/login'));

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
