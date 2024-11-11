export type WeatherCoords = 
{longitude: number, latitude:number}|
{cityName: string};

export type WeatherData={
  time?:string;
  timezone?:number;
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  wind: number;
  longitude: number;
  latitude: number;
  condition: string;

}

export const fetchWeather = async (weatherData: WeatherCoords): Promise<WeatherData | null> => {
  const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    console.error('API key is missing');
    return null;
  }

  let url;
  if ('cityName' in weatherData) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${weatherData.cityName}&appid=${apiKey}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${weatherData.latitude}&lon=${weatherData.longitude}&appid=${apiKey}&units=metric`;
  }
  

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data)
   
    const condition = data.weather[0].main.toLowerCase();

      return {city: data.name, temperature: data.main.temp, weather: data.weather[0].description, humidity: data.main.humidity, wind: data.wind.speed, longitude: data.coord.lon, latitude: data.coord.lat, timezone:data.timezone, condition: condition};
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching weather data: ${error.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    return null;
  }
};
export const fetchHourlyWeather = async (weatherData: {longitude:number, latitude:number}): Promise<any | null> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${weatherData.latitude}&longitude=${weatherData.longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
   
      
      return data;
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching weather data: ${error.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    return null;
  }
}


