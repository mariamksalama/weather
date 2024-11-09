import React, { useEffect, useState } from 'react';

const Homepage: React.FC = () => {
  const [weather, setWeather] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

      console.log(apiKey);
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const weatherInfo = `
          Weather in ${data.name}:
          Temperature: ${data.main.temp}°C
          Weather: ${data.weather[0].description}
          Humidity: ${data.main.humidity}%
          Wind Speed: ${data.wind.speed} m/s
        `;
        setWeather(weatherInfo);
      } catch (error) {
        if (error instanceof Error) {
            setError(`Error fetching weather data: ${error.message}`);
          } else {
            setError('An unknown error occurred.');
          }
          }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchWeather(latitude, longitude);
          },
          error => {
            setError(`Error getting location: ${error.message}`);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  return (
    <div>
      <h1>Weather App</h1>
      {weather && <pre>{weather}</pre>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Homepage;