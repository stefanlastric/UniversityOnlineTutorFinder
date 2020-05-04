const express = require('express');
const connectDB = require('./config/db');

// token kreira library unutar aplikacije
const app = express();

const path = require('path');
// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.use('/admins', require('./routes/admins'));
app.use('/students', require('./routes/students'));
app.use('/teachers', require('./routes/teachers'));
//app.use('/appointments', require('./routes/appointments'));
app.use('/adminlogin', require('./routes/adminlogin'));
app.use('/teacherlogin', require('./routes/teacherlogin'));
app.use('/studentlogin', require('./routes/studentlogin'));

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
