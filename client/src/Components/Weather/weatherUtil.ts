export type WeatherCoords = 
  | { longitude: number; latitude: number; cityName?: never }
  | { cityName: string; longitude?: never; latitude?: never };

export const fetchWeather = async (weatherData: WeatherCoords): Promise<string | null> => {
  const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    console.error('API key is missing');
    return null;
  }

  let url = weatherData.cityName 
    ? `https://api.openweathermap.org/data/2.5/weather?q=${weatherData.cityName}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${weatherData.latitude}&lon=${weatherData.longitude}&appid=${apiKey}&units=metric`;
  

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
   
      const weatherInfo = `
        Weather in ${data.name}:
        Temperature: ${data.main.temp}°C
        Weather: ${data.weather[0].description}
        Humidity: ${data.main.humidity}%
        Wind Speed: ${data.wind.speed} m/s
      `;
      return weatherInfo;
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching weather data: ${error.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    return null;
  }
};


