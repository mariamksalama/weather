import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchWeather } from '../Weather/weatherUtil';
import Search from '../Search/search';
import LottieWeatherAnimation from './lottieWeatherAnimation';


const Weather: React.FC = () => {
  const [weather, setWeather] = useState<string | null>(null);
  const [isLoading , setIsLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setWeatherInfo({ longitude, latitude });

        
      });
  }, []);
    
  const handleSearchSubmit = (cityName: string) => {
    setIsLoading(true);
    setCityName(cityName);
    setWeatherInfo({cityName});
   
   
  };

  const setWeatherInfo = (weatherInfo: {longitude: number, latitude:number}|
    {cityName: string}
  ) => {
    Promise.all([
        fetchWeather(weatherInfo),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]).then(([weather]) => {
        if (weather) {
          setWeather(weather);
        } else {
          setWeather(null);
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
      {weather && <Box>{weather}</Box>}
        </>
            )}
    
        
    </Box>
  );
};

export default Weather;