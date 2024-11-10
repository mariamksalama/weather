export interface City {
    geonameId: string;
    name: string;
    countryName: string;
    lat: number;
    lng: number;
    population: number;
    highTemperature?: number;
    lowTemperature?: number;
  }