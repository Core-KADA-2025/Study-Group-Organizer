const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { signToken } = require('./utils/jwt');

require('./passport'); 
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Study Group API');
});

app.use('/groups', require('./routes/Groups'));
app.use('/rooms', require('./routes/Rooms'));
app.use('/notes', require('./routes/Notes'));
app.use('/auth', require('./routes/Auth'));

// MongoDB connection
mongoose.connect('mongodb+srv://CORE:core@database.vmq2udh.mongodb.net/studygroup?retryWrites=true&w=majority&appName=database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB error:', err));

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:5000');
});
