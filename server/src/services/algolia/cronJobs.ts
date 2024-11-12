import cron from 'node-cron';
import { updateCityTemperatures } from '../city/cityService';

cron.schedule('0 0 * * *', () => {
  updateCityTemperatures();
});