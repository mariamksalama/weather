import { Router } from 'express';
import { getColdestCity, getHottestCity, populateCities } from '../controllers/cityController';

const router = Router();

router.get('/populate-cities', populateCities);
router.get('/hottest-city', getHottestCity);
router.get('/coldest-city', getColdestCity);

export default router;