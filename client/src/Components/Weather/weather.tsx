import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, styled } from '@mui/material';
import LottieWeatherAnimation from './LottieWeatherAnimation';
import { WeatherData, fetchHourlyWeather, fetchWeather } from './WeatherUtil';
import { FaSun, FaCloudRain, FaSnowflake, FaCloud } from 'react-icons/fa';
import Search from '../search/search';
import CityWeather from './CityWeather';
import HottestCity from './HottestCity';
import ColdestCity from './ColdestCity';
import HottestAndColdestCities from './HottestAndColdestCities';

interface WeatherProps {
  condition: string;
  isLoading: boolean;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [condition, setCondition] = useState<string>('clear');
  const [wrongCityName, setWrongCityName] = useState<boolean>(false);

  // Geolocation setup for fetching current location weather
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setWeatherInfo({ longitude, latitude });
      },
      (error) => {
        console.error('Error fetching geolocation:', error);
      }
    );
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchHourlyWeather({ longitude, latitude });
    }
  }, [longitude, latitude]);

  const handleSearchSubmit = (city: { lat?: number; lon?: number; name?: string }) => {
    setIsLoading(true);

    if (city.lat !== undefined && city.lon !== undefined) {
      setLatitude(city.lat);
      setLongitude(city.lon);
      setWeatherInfo({ longitude: city.lon, latitude: city.lat });
    } else if (city.name) {
      setCityName(city.name);
      setWeatherInfo({ cityName: city.name });
    }
  };

  // Function to fetch weather info
  const setWeatherInfo = (weatherInfo: { longitude: number; latitude: number } | { cityName: string }) => {
    Promise.all([
      fetchWeather(weatherInfo),
      new Promise((resolve) => setTimeout(resolve, 2000)), 
    ]).then(([weather]) => {
      console.log(condition);
      if (weather) {
        setWeather(weather);
        setCityName(weather.city);
        setLongitude(weather.longitude);
        setLatitude(weather.latitude);
        setCondition(weather.condition);
        setWrongCityName(false);
      } else {
        setWeather(null);
        setWrongCityName(true);
      }
      setIsLoading(false);
    });
  };



  return (
    <WeatherWrapper weatherCondition={condition}>
      {isLoading ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor:'#41657f',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow:'scroll',
            paddingBlock:'24px'
            

          }}
        >
          <LottieWeatherAnimation />
        </Box>
      ) : (
        <Stack     
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor:'#41657f',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow:'auto',
          paddingBlock:'36px'

        }}>
          {wrongCityName ? (
            <Typography variant="h4" color="white">
              City not found
            </Typography>
          ) : (
            <Stack sx={{display:'flex', alignItems:'center' }}gap='24px'>
              <Box sx={{width:'100%'}}>
              <Search  cityName={cityName} onSubmit={handleSearchSubmit} />
              </Box>
              
              {weather && (
                <>
                  <CityWeather
                    city={cityName || ''}
                    temperature={weather.temperature}
                    humidity={weather.humidity}
                    windSpeed={weather.wind}
                    condition={weather.condition}
                  />
                </>
              )}
              <HottestAndColdestCities/>
            
            </Stack>
            
          )}
        </Stack>
      )}
    </WeatherWrapper>
  );
};

interface WeatherWrapperProps {
  weatherCondition: string;
}

// Styled component for the weather icon
const WeatherIcon = styled(Box)({
  fontSize: '4rem',
  marginTop: '1rem',
});

// Styled component for the weather wrapper
const WeatherWrapper = styled(Box)<WeatherWrapperProps>(({ weatherCondition }) => ({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  transition: 'background 0.3s ease-in-out',
  backgroundColor:'#41657f',
  // weatherCondition === 'clear'
  //   ? '#4e90b1'
  //   : weatherCondition === 'rain'
  //   ? '#A9A9A9'
  //   : weatherCondition === 'snow'
  //   ? '#D3D3D3'
  //   : '#87CEEB',
// animation: weatherCondition === 'clear'
//   ? 'sunnyAnimation 5s infinite alternate'
//   : weatherCondition === 'rain'
//   ? 'rainAnimation 3s infinite linear'
//   : weatherCondition === 'snow'
//   ? 'snowAnimation 10s infinite linear'
//   : 'cloudyAnimation 7s infinite alternate',
// '@keyframes rainAnimation': {
//   '0%': {
//     backgroundColor: '#A9A9A9',
//   },
//   '100%': {
//     backgroundColor: '#808080',
//   },
// },
// '@keyframes sunnyAnimation': {
//   '0%': {
//     backgroundColor: '#FADE6B',
//   },
//   '100%': {
//     backgroundColor: '#F6AB2A',
//   },
//   '50%': {
//     backgroundColor: '#F9F3A0',
//     boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
//   },
// },
// '@keyframes snowAnimation': {
//   '0%': {
//     backgroundColor: '#D3D3D3',
//   },
//   '100%': {
//     backgroundColor: '#B0C4DE',
//   },
// },
// '@keyframes cloudyAnimation': {
//   '0%': {
//     backgroundColor: '#87CEEB',
//   },
//   '100%': {
//     backgroundColor: '#4682B4',
//   },
// },
}));


export default Weather;
