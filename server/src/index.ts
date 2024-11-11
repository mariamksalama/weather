import express from 'express';
import dotenv from 'dotenv';
import cityRoutes from './routes/cityRoutes';
import './services/algolia/cronJobs';
import cors from 'cors';

dotenv.config();
const app = express();

const port = process.env.PORT || 3001;

// Configure CORS to allow requests from your client
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your client's origin
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use CORS middleware with options
app.use(express.json());
app.use('/api', cityRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});