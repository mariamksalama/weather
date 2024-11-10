import cron from 'node-cron';
import { updateCityTemperatures } from '../city/cityService';

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  updateCityTemperatures();
});