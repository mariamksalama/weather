import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchWeather } from '../Weather/weatherUtil';
import Search from '../Search/search';


const Weather: React.FC = () => {
  const [weather, setWeather] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
         fetchWeather({latitude, longitude}).then((weather) => {
          if(weather){
            setWeather(weather);
          }
        });
        
      });
  }, []);
    
  const handleSearchSubmit = (cityName: string) => {
    setCityName(cityName);
    fetchWeather({cityName}).then((weather) => {
        if(weather){
            console.log(weather);
          setWeather(weather);
        }
      });
  };

  


  return (
    <Box>
      <Search cityName={cityName} onSubmit={handleSearchSubmit}/>
      {weather && <Box>{weather}</Box>}
    </Box>
  );
};

export default Weather;