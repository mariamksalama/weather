import { searchClient } from '@algolia/client-search';
import { City } from '../../types';
import dotenv from 'dotenv';

dotenv.config();
const AlgoliaIndexName = process.env.ALGOLIA_INDEX_NAME!;
const client = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);

export const saveObjectsToAlgolia = async (objects: Record<string, unknown>[]) => {
  try {
    await client.saveObjects({ indexName:AlgoliaIndexName, objects });
    console.log('Objects saved to Algolia successfully');
  } catch (error: any) {
    if (error.response) {
      console.error('Algolia API error:', error.response.data);
    } else {
      console.error('Unknown error:', error.message);
    }
  }
};

export const searchAlgolia = async (query: string, hitsPerPage: number, page: number): Promise<City[]> => {
  const cities: City[] = [];
  try {
    const result = await client.searchSingleIndex({
      indexName: AlgoliaIndexName,
      searchParams: {
        query:'',
        hitsPerPage,
        page,
      },
    });
    cities.push(...result.hits.map((hit: any) => ({
      geonameId: hit.objectID,
      name: hit.name,
      countryName: hit.countryName,
      lat: hit.lat,
      lng: hit.lng,
      population: hit.population
    })));
  } catch (error) {
    console.error('Error fetching cities from Algolia:', error);
  }
  return cities;
};