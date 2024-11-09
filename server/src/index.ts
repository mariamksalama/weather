import express from 'express';

const app = express();
const port = 3001;

app.get('/api/weather', (req, res) => {
  res.json({ message: 'Hello from the weather API!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});