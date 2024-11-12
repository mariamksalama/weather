import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel, Stack, Switch, Typography, styled } from '@mui/material';
import LottieWeatherAnimation from './LottieWeatherAnimation';
import Search from '../search/search';
import CityWeather from './CityWeather';
import HottestAndColdestCities from './HottestAndColdestCities';
import darkImage from '../../assets/images/dark.jpg';
import lightImage from '../../assets/images/light.jpg';
import SunCalc from 'suncalc';
import moment from 'moment-timezone';
import { fetchHourlyWeather, fetchWeather, WeatherData } from './WeatherUtil';

const Weather: React.FC = () => {
  const [weatherState, setWeatherState] = useState({
    weather: null as WeatherData | null,
    cityName: null as string | null,
    longitude: 0,
    latitude: 0,
    wrongCityName: false,
    nextHours: [] as WeatherData[],
    isNightTime: false,
    isLoading: true,
    isCelsius: localStorage.getItem('temperatureUnit') === null || localStorage.getItem('temperatureUnit') === 'celsius',
  });

  const setWeatherInfo = async (weatherInfo: { longitude: number; latitude: number } | { cityName: string }) => {
    try {
      const [weather] = await Promise.all([
        fetchWeather(weatherInfo),
        new Promise((resolve) => setTimeout(resolve, 2000)), // Simulate loading delay
      ]);

      if (weather) {
        setWeatherState((prevState) => ({
          ...prevState,
          weather: {
            ...weather,
            temperature: convertTemperature(weather.temperature, prevState.isCelsius, true),
          },
          cityName: weather.city,
          longitude: weather.longitude,
          latitude: weather.latitude,
          wrongCityName: false,
          isLoading: false,
        }));
      } else {
        setWeatherState((prevState) => ({
          ...prevState,
          weather: null,
          wrongCityName: true,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherState((prevState) => ({
        ...prevState,
        weather: null,
        wrongCityName: true,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    const getGeolocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setWeatherInfo({ longitude, latitude });
        },
        (error) => {
          console.error('Error fetching geolocation:', error);
          setWeatherState((prevState) => ({
            ...prevState,
            isLoading: false,
          }));
        }
      );
    };

    getGeolocation();
  }, []); // Run only once on mount to fetch geolocation

  useEffect(() => {
    if (weatherState.latitude && weatherState.longitude) {
      const updateWeather = async () => {
        // Check if it's night time
        checkIfNightTime(weatherState.latitude, weatherState.longitude);

        // Fetch hourly weather data
        const data = await fetchHourlyWeather({
          longitude: weatherState.longitude,
          latitude: weatherState.latitude,
        });

        if (data && weatherState.weather) {
          const offsetHours = weatherState.weather.timezone! / 3600;
          const currentTimeUtc = moment.utc();
          const timeInOffset = currentTimeUtc.clone().add(offsetHours, 'hours');
          const nextHour = timeInOffset.add(1, 'hours');
          const nextHourTime = nextHour.format('HH:00');

          const dataArray = data.hourly;
          let index = dataArray.time.findIndex((time: string) => time.includes(nextHourTime));

          if (index !== -1) {
            const next6Hours = dataArray.time.slice(index, index + 6).map((time: any, i: any) => ({
              time,
              timezone: weatherState.weather?.timezone || 0,
              temperature: convertTemperature(dataArray.temperature_2m[index + i], weatherState.isCelsius, true),
              humidity: dataArray.relative_humidity_2m[index + i],
              wind: dataArray.wind_speed_10m[index + i],
              city: weatherState.weather?.city || '',
              weather: weatherState.weather?.weather || '',
              longitude: weatherState.weather?.longitude || 0,
              latitude: weatherState.weather?.latitude || 0,
              condition: weatherState.weather?.condition || '',
            }));
            setWeatherState((prevState) => ({
              ...prevState,
              nextHours: next6Hours,
            }));
          }
        }
      };

      updateWeather();

      const intervalId = setInterval(updateWeather, 3600000); // Update every hour

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [weatherState.latitude, weatherState.longitude, weatherState.weather, weatherState.isCelsius]);

  const checkIfNightTime = (latitude: number, longitude: number) => {
    const times = SunCalc.getTimes(new Date(), latitude, longitude);
    const now = new Date();
    setWeatherState((prevState) => ({
      ...prevState,
      isNightTime: now < times.sunrise || now > times.sunset,
    }));
  };

  const convertTemperature = (temperature: number, toCelsius: boolean, isCelsius: boolean) => {
    if (toCelsius && isCelsius) return temperature;
    const temp = toCelsius ? ((temperature - 32) * 5) / 9 : (temperature * 9) / 5 + 32;
    return parseFloat(temp.toFixed(1));
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCelsius = event.target.checked;
    localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    setWeatherState((prevState) => ({
      ...prevState,
      isCelsius,
      weather: prevState.weather ? {
        ...prevState.weather,
        temperature: convertTemperature(prevState.weather.temperature, isCelsius, false),
      } : null,
    }));
  };

  const handleSearchSubmit = (city: { lat?: number; lon?: number; name?: string }) => {
    setWeatherState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    if (city.lat !== undefined && city.lon !== undefined) {
      setWeatherState((prevState) => ({
        ...prevState,
        latitude: city.lat || 0,
        longitude: city.lon ||0,
      }));
      setWeatherInfo({ longitude: city.lon, latitude: city.lat });
    } else if (city.name) {
      setWeatherState((prevState) => ({
        ...prevState,
        cityName: city.name || null,
      }));
      setWeatherInfo({ cityName: city.name });
    }
  };

  return (
    <WeatherWrapper>
      <ToggleWrapper>
        <FormControlLabel
          sx={{ color: 'white' }}
          control={<Switch checked={weatherState.isCelsius} onChange={handleToggleChange} />}
          label={weatherState.isCelsius ? 'Celsius' : 'Fahrenheit'}
        />
      </ToggleWrapper>

      {weatherState.isLoading ? (
        <LoadingBox>
          <LottieWeatherAnimation />
        </LoadingBox>
      ) : (
        <ContentStack isNightTime={weatherState.isNightTime}>
          {weatherState.wrongCityName ? (
            <Typography variant="h4" color="white">
              City not found
            </Typography>
          ) : (
            <Stack sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <StickyBox>
                <Search cityName={weatherState.cityName} onSubmit={handleSearchSubmit} />
              </StickyBox>

              <InnerBox>
                <Box width='60%'>
                {weatherState.weather && (
                  <CityWeather
                    city={weatherState.cityName || ''}
                    temperature={weatherState.weather.temperature}
                    humidity={weatherState.weather.humidity}
                    windSpeed={weatherState.weather.wind}
                    condition={weatherState.weather.condition}
                    nextHour={weatherState.nextHours}
                  />
                )}
                </Box>
                <Box width='60%'>
                <HottestAndColdestCities />
                </Box>
              </InnerBox>
            </Stack>
          )}
        </ContentStack>
      )}
    </WeatherWrapper>
  );
};

const WeatherWrapper = styled(Box) ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  transition: 'background 0.3s ease-in-out',
  backgroundColor: '#41657f',
});

const StickyBox = styled(Box)({
  position: 'sticky',
  top: '0',
  width: '100%', 
  zIndex: 1000,
  padding: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px', });


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

interface ContentStackProps {
  isNightTime: boolean;
}

const ContentStack = styled(Stack)<ContentStackProps>(({ isNightTime }) => ({
  top: 0,
  left: 0,
  paddingTop: '150px',
  minHeight: '100vh',
  width: '100%',
  backgroundImage: isNightTime?`url(${darkImage})`: `url(${lightImage})`, 
  backgroundSize: 'cover',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  paddingBlock: '36px',

})
);


const InnerBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '80%',
  gap: '24px',
  flexDirection: 'column',
  '@media (min-width: 1100px)': {
    flexDirection: 'row',
  },
});

export default Weather;
