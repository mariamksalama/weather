import express from 'express';
import dotenv from 'dotenv';
import cityRoutes from './routes/cityRoutes';
import './services/algolia/cronJobs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', cityRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});