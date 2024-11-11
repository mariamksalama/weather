import { Request, Response } from 'express';
import { fetchCities, pushToAlgolia, updateCityTemperatures, fetchCitiesFromAlgolia } from '../services/city/cityService';

export const populateCities = async (req: Request, res: Response) => {
  try {
    const cities = await fetchCities();
    await pushToAlgolia(cities);
    await updateCityTemperatures();
    res.json({ message: 'Cities populated and temperatures updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
};

export const getHottestCity = async (req: Request, res: Response) => {
  try {
    const cities = await fetchCitiesFromAlgolia();
    const filteredCities = cities.filter((city)=>city.highTemperature!=null&& city.highTemperature!=undefined && city.highTemperature.toString()!=='undefined');
    const hottestCity = filteredCities.reduce((max, city) =>
      (city.highTemperature! > max.highTemperature! ? city : max), cities[0]);

    res.json(hottestCity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
};

export const getColdestCity = async (req: Request, res: Response) => {
  try {
    const cities = await fetchCitiesFromAlgolia();
    const filteredCities = cities.filter((city)=>city.lowTemperature!=null&& city.lowTemperature!=undefined && city.lowTemperature.toString()!=='undefined');

    const coldestCity = filteredCities.reduce((min, city) =>
      (city.lowTemperature! < min.lowTemperature! ? city : min), cities[0]);

    res.json(coldestCity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
};