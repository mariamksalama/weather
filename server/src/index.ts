import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { searchClient } from '@algolia/client-search';



dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const AlgoliaIndexName = process.env.ALGOLIA_INDEX_NAME!;
const client = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);


app.use(express.json());

const fetchCities = async () => {
  const cities = [];
  const maxRows = 100;
  const totalCities = 1000;
  const username = process.env.GEONAMES_USERNAME;

  for (let startRow = 1; startRow < totalCities; startRow += maxRows) {
    const url = `http://api.geonames.org/citiesJSON?north=90&south=-90&east=180&west=-180&lang=en&maxRows=${maxRows}&startRow=${startRow}&username=${username}`;
    const response = await axios.get(url);
    cities.push(...response.data.geonames);
  }

  return cities;
};

const pushToAlgolia = async (cities: any[]) => {
  
    try {
      await client.saveObjects({ indexName: AlgoliaIndexName, objects: cities });

    } catch (error: any) {
      if (error.response) {
        console.error('Algolia API error:', error.response.data);
      } else {
        console.error('Unknown error:', error.message);
      }}
};

const fetchWeatherData = async (latitude: number, longitude: number) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await axios.get(url);
  return response.data.daily;
};

const updateCityTemperatures = async () => {
  try {
    const { hits: cities } = await  client.searchSingleIndex({ indexName: 'indexNameeather'});
    const updatedCities = await Promise.all(cities.map(async (city: any) => {
      const weatherData = await fetchWeatherData(city.lat, city.lng);
      return {
        ...city,
        highTemperature: weatherData.temperature_2m_max[0],
        lowTemperature: weatherData.temperature_2m_min[0],
      };
    }));

    await client.saveObjects({ indexName: AlgoliaIndexName, objects: updatedCities });

    console.log('City temperatures updated in Algolia successfully');
  } catch (error: any) {
    console.error(`Error updating city temperatures: ${error.message}`);
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  updateCityTemperatures();
});



const updateAlgoliaCities=async () =>{
  try {
    const cities = await fetchCities();
    await pushToAlgolia(cities);
    updateCityTemperatures();

  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error fetching cities: ${error.message}`);
    } 
  }
};

updateAlgoliaCities();


app.listen(port, () => {});
