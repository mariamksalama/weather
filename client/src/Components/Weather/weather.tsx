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
import { WeatherData, fetchHourlyWeather, fetchWeather } from './WeatherUtil';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [condition, setCondition] = useState<string>('clear');
  const [wrongCityName, setWrongCityName] = useState<boolean>(false);
  const [nextHour, setNextHour] = useState<WeatherData[]>([]);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);
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
  const checkIfNightTime = (latitude: number, longitude: number) => {
    const times = SunCalc.getTimes(new Date(), latitude, longitude);
    const now = new Date();
    setIsNightTime( (now < times.sunrise || now > times.sunset));
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
        checkIfNightTime(latitude, longitude);

        fetchHourlyWeather({ longitude, latitude }).then((data) => {
          if (data && weather) {
            const now = new Date();
            console.log(weather.timezone)
            const offsetHours = weather.timezone! / 3600; 
    
            console.log(offsetHours)
            const currentTimeUtc = moment.utc(); 
    
            const timeInOffset = currentTimeUtc.clone().add(offsetHours, 'hours');
    
            const nextHour = timeInOffset.add(1, "hours");
    
          
            const nextHourTime = (nextHour.format("YYYY-MM-DDTHH")+':00');
            console.log(nextHourTime)

            let index = data.hourly.time.indexOf(nextHourTime);
            const maxIndex = index+6;
            const dataArray = data.hourly;
            let next6Hours=[];
            while(index<maxIndex){
              console.log(index)
              next6Hours.push({
                time: dataArray.time[index],
                temperature:convertTemperature (dataArray.temperature_2m[index],isCelsius, true),
                humidity: dataArray.relative_humidity_2m[index],
                wind: dataArray.wind_speed_10m[index],
                city: weather.city,
                weather: weather.weather,
                longitude: weather.longitude,
                latitude: weather.latitude,
                condition: weather.condition,
              });
              index++;
            }
            console.log( next6Hours)
            setNextHour(next6Hours);
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
      checkIfNightTime(city.lat, city.lon);
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
        <ContentStack isNightTime={isNightTime}>
          {wrongCityName ? (
            <Typography variant="h4" color="white">
              City not found
            </Typography>
          ) : (
            <Stack sx={{ width: '100%' , display:'flex', alignItems:'center' ,gap:'24px'}}>
               <Box width='80%' >
                <Search cityName={cityName} onSubmit={handleSearchSubmit} />
              </Box>
              <Box display="flex" gap="8px" alignItems="center" width='100%' justifyContent='center' padding='12px'>
        
 
        <StyledTypography
          sx={{
            fontSize: "1.5rem",
            color: "#222",
          }}
          variant="h5"
        >
          Now in
        </StyledTypography>
        <StyledTypography
          sx={{
            fontSize: "2rem",
            color: "white",
          }}
          variant="h5"
        >
          {cityName}
        </StyledTypography>
      </Box>
              <></>
            <InnerBox>
     
             
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
            </InnerBox>
            </Stack>
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

interface ContentStackProps {
  isNightTime: boolean;
}

const ContentStack = styled(Stack)<ContentStackProps>(({ isNightTime }) => ({
  top: 0,
  left: 0,
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
const StyledTypography = styled(Typography)(() => ({
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  lineHeight: 1.2,
  fontFamily: '"Roboto", sans-serif',
  textShadow: "none",
}));

const InnerBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '80%',
  gap: '24px',
});

export default Weather;
