import axios from 'axios';
import { City } from '../../types';
import { saveObjectsToAlgolia, searchAlgolia } from '../algolia/algoliaService';
import { fetchWeatherData } from '../weather/weatherService';

const totalCities = 1000;
import dotenv from 'dotenv';

dotenv.config();
export const fetchCities = async (): Promise<City[]> => {
  const cities: City[] = [];
  const maxRows = 100;
  const username = process.env.GEONAMES_USERNAME;

  for (let startRow = 1; startRow < totalCities; startRow += maxRows) {
    const url = `http://api.geonames.org/citiesJSON?north=90&south=-90&east=180&west=-180&lang=en&maxRows=${maxRows}&startRow=${startRow}&username=${username}`;
    const response = await axios.get(url);
    cities.push(...response.data.geonames);
  }

  return cities;
};

export const pushToAlgolia = async (cities: City[]): Promise<void> => {
  const filteredCities = cities.map(city => ({
    objectID: city.geonameId,
    name: city.name,
    countryName: city.countryName,
    lat: city.lat,
    lng: city.lng,
    highTemperature: city.highTemperature,
    lowTemperature: city.lowTemperature,
  }));

  await saveObjectsToAlgolia(filteredCities);
};

export const fetchCitiesFromAlgolia = async (): Promise<City[]> => {
  return await searchAlgolia('', totalCities, 0);
};

export const updateCityTemperatures = async (): Promise<void> => {
  try {
    const cities = await fetchCitiesFromAlgolia();
    for (let i = 0; i < cities.length; i += 100) {
      const chunk = cities.slice(i, i + 100);
      const updatedCities = await Promise.all(chunk.map(async (city: City) => {
        const weatherData = await fetchWeatherData(city.lat, city.lng);
        return {
          ...city,
          highTemperature: weatherData.temperature_2m_max[0],
          lowTemperature: weatherData.temperature_2m_min[0],
        };
      }));

      await saveObjectsToAlgolia(updatedCities as Record<string, unknown>[]);
      console.log(`City temperatures updated in Algolia successfully for chunk starting at index ${i}`);
    }
  } catch (error: any) {
    console.error(`Error updating city temperatures: ${error.message}`);
  }
};