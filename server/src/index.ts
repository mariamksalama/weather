import express from 'express';
import dotenv from 'dotenv';
import cityRoutes from './routes/cityRoutes';
import './services/algolia/cronJobs';
import cors from 'cors';

dotenv.config();
const app = express();

const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); 
app.use('/api', cityRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});