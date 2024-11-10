import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { searchClient } from '@algolia/client-search';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const AlgoliaIndexName = process.env.ALGOLIA_INDEX_NAME!;
const client = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);
const totalCities = 1000;

app.use(express.json());

interface City {
  geonameId: string;
  name: string;
  countryName: string;
  lat: number;
  lng: number;
  highTemperature?: number;
  lowTemperature?: number;
}

const fetchCities = async (): Promise<City[]> => {
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

const pushToAlgolia = async (cities: City[]): Promise<void> => {
  try {
    await client.saveObjects({ indexName: AlgoliaIndexName, objects: cities as Record<string, any>[] });
  } catch (error: any) {
    if (error.response) {
      console.error('Algolia API error:', error.response.data);
    } else {
      console.error('Unknown error:', error.message);
    }
  }
};

const fetchCitiesFromAlgolia = async (): Promise<City[]> => {
  const cities: City[] = [];

  try {
    const hits = await client.searchSingleIndex({
      indexName: AlgoliaIndexName,
      searchParams: {
        query: '',                 

        hitsPerPage: totalCities,
        page: 0,
      },
    });
    hits.hits.map((hit: any) => {
      const { geonameId, name, countryName, lat, lng, highTemperature, lowTemperature } = hit;
      cities.push({ geonameId, name, countryName, lat, lng, highTemperature, lowTemperature });
    });

  } catch (error) {
    console.error('Error fetching cities from Algolia:', error);
  }

  return cities;
};

const fetchWeatherData = async (latitude: number, longitude: number): Promise<any> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await axios.get(url);
  return response.data.daily;
};

const updateCityTemperatures = async (): Promise<void> => {
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

      try {
        await client.saveObjects({ indexName: AlgoliaIndexName, objects: updatedCities});
        console.log(`City temperatures updated in Algolia successfully for chunk starting at index ${i}`);
      } catch (error: any) {
        console.error(`Error updating city temperatures: ${error.message}`);
        break; 
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

app.get('/api/populate-cities', async (req: Request, res: Response) => {
  try {
    const cities = await fetchCities();
    await pushToAlgolia(cities);
    await updateCityTemperatures();
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error fetching cities: ${error.message}`);
    }
  }
});

app.get('/api/hottest-city', async (req: Request, res: Response) => {
  try {
    const cities = await fetchCitiesFromAlgolia();
    const hottestCity = cities.reduce((max: City, city: City) =>
      (city.highTemperature! > max.highTemperature! ? city : max), cities[0]);

    res.json(hottestCity); 
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});

app.get('/api/coldest-city', async (req: Request, res: Response) => {
  try {
    const cities = await fetchCitiesFromAlgolia();
    const coldestCity = cities.reduce((min: City, city: City) =>
      (city.lowTemperature! < min.lowTemperature! ? city : min), cities[0]);

    res.json(coldestCity); 
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});