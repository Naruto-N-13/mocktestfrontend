const express = require('express');
const cors = require('cors');
const examRoutes = require('./routes/examRoutes'); // Route definition modules link register map

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Base root endpoint allocation rule definitions reference pipeline context matrix registry rules trace 
app.use('/api/exams', examRoutes);

app.listen(PORT, () => {
  console.log(`[MVC Architecture Engine] Server runs listening actively on path location mapping: http://localhost:${PORT}`);
});
