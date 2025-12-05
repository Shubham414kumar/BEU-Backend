const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const materialsRoute = require('./routes/materials');
const resultsRoute = require('./routes/results');
const postsRoute = require('./routes/posts');
const noticesRoute = require('./routes/notices');
const aiRoute = require('./routes/ai');
const attendanceRoute = require('./routes/attendance');

app.use(cors());
app.use(express.json());

app.use('/api/materials', materialsRoute);
app.use('/api/results', resultsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/notices', noticesRoute);
app.use('/api/ai', aiRoute);
app.use('/api/attendance', attendanceRoute);

app.get('/', (req, res) => {
  res.send('BEU Adda API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
