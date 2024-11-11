import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel, Stack, Switch, Typography, styled } from '@mui/material';
import LottieWeatherAnimation from './LottieWeatherAnimation';
import { WeatherData, fetchHourlyWeather, fetchWeather } from './WeatherUtil';
import Search from '../search/search';
import CityWeather from './CityWeather';
import HottestAndColdestCities from './HottestAndColdestCities';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [condition, setCondition] = useState<string>('clear');
  const [wrongCityName, setWrongCityName] = useState<boolean>(false);
  const [nextHour, setNextHour] = useState<WeatherData>();
  const [isCelsius, setIsCelsius] = useState<boolean>(localStorage.getItem('temperatureUnit') === null || localStorage.getItem('temperatureUnit') === 'celsius');
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
    if (weather) {
      setWeather({
        ...weather,
        temperature: convertTemperature(weather.temperature, isCelsius,false),
      });
    }
  },[isCelsius])

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCelsius = event.target.checked;
    localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');

    setIsCelsius(isCelsius);
  };
  const convertTemperature = (temperature: number, toCelsius: boolean, isCelsius:boolean) => {
    if(toCelsius && isCelsius)
      return temperature;
    const temp= toCelsius ? ((temperature - 32) * 5) / 9 : (temperature * 9) / 5 + 32;
    return parseFloat(temp.toFixed(1));
  };

  useEffect(() => {
    const updateWeather = () => {
      if (latitude && longitude) {
        fetchHourlyWeather({ longitude, latitude }).then((data) => {
          if (data && weather) {
            const now = new Date();
            const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // Add one hour
            const nextHourTime = nextHour.toISOString().slice(0, 13) + ':00';
            const index = data.hourly.time.indexOf(nextHourTime);
            const dataArray = data.hourly;
            setNextHour({
              temperature:convertTemperature (dataArray.temperature_2m[index],isCelsius, true),
              humidity: dataArray.relative_humidity_2m[index],
              wind: dataArray.wind_speed_10m[index],
              city: weather.city,
              weather: weather.weather,
              longitude: weather.longitude,
              latitude: weather.latitude,
              condition: weather.condition,
            });
          }
        });
      }
    };

    updateWeather();

    const intervalId = setInterval(updateWeather, 3600000); 

    return () => clearInterval(intervalId); 
  }, [longitude, latitude, weather]);

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

  const setWeatherInfo = (weatherInfo: { longitude: number; latitude: number } | { cityName: string }) => {
    Promise.all([
      fetchWeather(weatherInfo),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]).then(([weather]) => {
      if (weather) {
        setWeather({
          ...weather,
          temperature: convertTemperature(weather.temperature, isCelsius, true),
        });
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
       <ToggleWrapper>
        <FormControlLabel
          control={<Switch checked={isCelsius} onChange={handleToggleChange} />}
          label={isCelsius ? 'Celsius' : 'Fahrenheit'}
        />
      </ToggleWrapper>
      {isLoading ? (
        <LoadingBox>
          <LottieWeatherAnimation />
        </LoadingBox>
      ) : (
        <ContentStack>
          {wrongCityName ? (
            <Typography variant="h4" color="white">
              City not found
            </Typography>
          ) : (
            <InnerStack>
              <Box sx={{ width: '100%' }}>
                <Search cityName={cityName} onSubmit={handleSearchSubmit} />
              </Box>
              {weather && (
                <CityWeather
                  city={cityName || ''}
                  temperature={weather.temperature}
                  humidity={weather.humidity}
                  windSpeed={weather.wind}
                  condition={weather.condition}
                  nextHour={nextHour}
                />
              )}
              <HottestAndColdestCities />
            </InnerStack>
          )}
        </ContentStack>
      )}
    </WeatherWrapper>
  );
};

interface WeatherWrapperProps {
  weatherCondition: string;
}

const WeatherWrapper = styled(Box)<WeatherWrapperProps>(({ weatherCondition }) => ({

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  transition: 'background 0.3s ease-in-out',
  backgroundColor: '#41657f',
}));

const LoadingBox = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#41657f',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  paddingBlock: '24px',
});

const ToggleWrapper = styled(Box)({
  position: 'absolute',
  top: '10px',
  right: '10px',
});

const ContentStack = styled(Stack)({
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: '#41657f',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  paddingBlock: '36px',
});

const InnerStack = styled(Stack)({
  display: 'flex',
  alignItems: 'center',
  width: '80%',
  gap: '24px',
});

export default Weather;
