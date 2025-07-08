const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Study Group API');
});
app.use('/groups', require('./routes/groupRoutes'));
app.use('/rooms', require('./routes/roomRoutes'));
app.use('/notes', require('./routes/noteRoutes'));

mongoose.connect('mongodb://127.0.0.1:27017/studygroup', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB error:', err));

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:5000');
});
