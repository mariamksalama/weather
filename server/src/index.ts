import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { searchClient } from '@algolia/client-search';



dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Algolia client
const client = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);


app.use(express.json());

const fetchCities = async () => {
  console.log('Fetching cities from Geonames API');
  const cities = [];
  const maxRows = 1000;
  const totalCities = 10000;
  const username = process.env.GEONAMES_USERNAME;

  for (let startRow = 0; startRow < totalCities; startRow += maxRows) {
    console.log(username);
    const url = `http://api.geonames.org/citiesJSON?north=90&south=-90&east=180&west=-180&lang=en&maxRows=1000&startRow=1000&username=mariamksalama`;
    const response = await axios.get(url);
    cities.push(...response.data.geonames);
  }

  return cities;
};

const pushToAlgolia = async (cities: any[]) => {
  const chunkSize = 1000;
  for (let i = 0; i < cities.length; i += chunkSize) {
    const chunk = cities.slice(i, i + chunkSize);
    const cityData = chunk.map(city => ({
      objectID: city.geonameId,
      name: city.name,
      country: city.countryName,
      latitude: city.lat,
      longitude: city.lng,
      population: city.population,
      highTemperalure: city.highTemperature,
      lowTemperature: city.lowTemperature,
    }));

    try {
       await client.saveObjects({ indexName: 'cities', objects: cityData });

      console.log(`Cities batch pushed to Algolia: ${i + chunkSize}`);
    } catch (error: any) {
      if (error.response) {
        console.error('Algolia API error:', error.response.data);
      } else {
        console.error('Unknown error:', error.message);
      }
    }
  }
};

const fetchWeatherData = async (latitude: number, longitude: number) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await axios.get(url);
  return response.data.daily;
};

const updateCityTemperatures = async () => {
  try {
    const { hits: cities } = await  client.searchSingleIndex({ indexName: 'cities'});
    const updatedCities = await Promise.all(cities.map(async (city: any) => {
      const weatherData = await fetchWeatherData(city.latitude, city.longitude);
      return {
        ...city,
        highTemperature: weatherData.temperature_2m_max[0],
        lowTemperature: weatherData.temperature_2m_min[0],
      };
    }));
    console.log(updatedCities);

    await client.saveObjects({ indexName: 'cities', objects: updatedCities });

    console.log('City temperatures updated in Algolia successfully');
  } catch (error: any) {
    console.error(`Error updating city temperatures: ${error.message}`);
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running cron job to update city temperatures');
  updateCityTemperatures();
});

updateCityTemperatures();

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await fetchCities();
    console.log(`Fetched ${cities.length} cities`);
    await pushToAlgolia(cities);
    res.json({ message: 'Cities fetched and pushed to Algolia successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
