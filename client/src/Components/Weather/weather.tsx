import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import LottieWeatherAnimation from './LottieWeatherAnimation';
import { WeatherData, fetchHourlyWeather, fetchWeather } from './WeatherUtil';
import Search from '../search/search';


const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading , setIsLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number >(0);
  const [latitude, setLatitude] = useState<number >(0);
  const [wrongCityName, setWrongCityName] = useState<boolean>(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setWeatherInfo({ longitude, latitude });

        
      });
  }, []);
    
  useEffect(() => {
    fetchHourlyWeather({longitude,latitude}).then(data => {console.log(data)});
  }, [longitude,latitude]);
  
  const handleSearchSubmit = (city:{lat?:number, lon?:number, name?: string}) => {
    console.log('in', city)
    setIsLoading(true);
    console.log(city);

    if (city.lat !== undefined && city.lon !== undefined) {
      setLatitude(city.lat);
      setLongitude(city.lon);
      setWeatherInfo({ longitude: city.lon, latitude: city.lat });
    } else if (city.name) {
      setCityName(city.name);
      setWeatherInfo({ cityName: city.name });
    }
   
   
  };

  const setWeatherInfo = (weatherInfo: {longitude: number, latitude:number}|{cityName: string}
  ) => {
    Promise.all([
        fetchWeather(weatherInfo),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]).then(([weather]) => {
        if (weather) {
          setWeather(weather);
          setCityName(weather.city);
          setLongitude(weather.longitude);
          setLatitude(weather.latitude);
          setWrongCityName(false);

        } else {
          setWeather(null);
          setWrongCityName(true);
        }
        setIsLoading(false);
      });
  };

  


  return (
    <Box>
        
        {isLoading? (<Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <LottieWeatherAnimation />
        </Box>):
        (
            <>
      <Search cityName={cityName} onSubmit={handleSearchSubmit}/>
      <Typography variant='h4'> Weather in {cityName}</Typography>
      {weather && 
      <Stack>
        <Typography variant='h6'>Temperature: {weather.temperature}</Typography>
        <Typography variant='h6'>Humidity: {weather.humidity}</Typography>
        <Typography variant='h6'>Wind Speed: {weather.wind}</Typography>



        </Stack>}
        </>
            )}
    
        
    </Box>
  );
};

export default Weather;