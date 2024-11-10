import express from 'express';
import axios from 'axios';
import dotenv, { populate } from 'dotenv';
import cron from 'node-cron';

import { searchClient } from '@algolia/client-search';



dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const AlgoliaIndexName = process.env.ALGOLIA_INDEX_NAME!;
const client = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);
const totalCities = 1000;

app.use(express.json());

const fetchCities = async () => {
  const cities = [];
  const maxRows = 100;
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
const fetchCitiesFromAlgolia = async (): Promise<any[]> => {
  const cities: any[] = [];

    try {
      console.log('try');


      const hits = await client.searchSingleIndex(
          {
            indexName: 'citiesWeather',  
            searchParams: ({
              query: '',                 
              hitsPerPage: totalCities, 
              page: 0,                  
            }),
          },
        
        
      );
      cities.push(...hits.hits);  
    } catch (error) {
      console.error('Error fetching cities from Algolia:', error);
    }
    return cities;
  };  
const fetchWeatherData = async (latitude: number, longitude: number) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await axios.get(url);
  return response.data.daily;
};

const updateCityTemperatures = async () => {
  const maxRetries = 5;

  try {
    const cities = await fetchCitiesFromAlgolia();
    for (let i = 0; i < cities.length; i += 100) {
      const chunk = cities.slice(i, i + 100);
      const updatedCities = await Promise.all(chunk.map(async (city: any) => {
        const weatherData = await fetchWeatherData(city.lat, city.lng);
        return {
          ...city,
          highTemperature: weatherData.temperature_2m_max[0],
          lowTemperature: weatherData.temperature_2m_min[0],
        };
      }));

      let retries = 0;
      while (retries < maxRetries) {
        try {
          await client.saveObjects({ indexName: AlgoliaIndexName, objects: updatedCities });
          console.log(`City temperatures updated in Algolia successfully for chunk starting at index ${i}`);
          break; // Exit the retry loop on success
        } catch (error: any) {
          if (error.response && error.response.status === 429) {
            retries++;
            const delay = Math.pow(2, retries) * 1000; // Exponential backoff
            console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error(`Error updating city temperatures: ${error.message}`);
            break; // Exit the retry loop on non-rate-limit errors
          }
        }
      }
    }
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

app.get('/api/hottest-city', async (req: express.Request, res: express.Response) => {
  try {
    const cities = await fetchCitiesFromAlgolia();


    const hottestCity = cities.reduce((max: any, city: any) =>
      (city.highTemperature! > max.highTemperature! ? city : max), cities[0]);

    res.json(hottestCity); // Respond with the hottest city
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});

app.get('/api/coldest-city', async (req: express.Request, res: express.Response) => {
  try {
   const cities = await fetchCitiesFromAlgolia();
    const coldestCity = cities.reduce((min: any, city: any) =>
      (city.lowTemperature! < min.lowTemperature! ? city : min), cities[0]);

    res.json(coldestCity); // Respond with the coldest city
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});

//to populate algolia
// updateAlgoliaCities();

// updateCityTemperatures();


app.listen(port, () => {});
