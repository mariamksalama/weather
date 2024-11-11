import React from 'react';
import { Box, Stack, Typography, Tooltip, styled } from "@mui/material";
import { WeatherData } from './WeatherUtil';

interface HourlyWeatherProps {
  hourlyData: WeatherData[];
}

const HorizontalScrollDialog: React.FC<HourlyWeatherProps> = ({ hourlyData }) => {
  const temperatureUnit = localStorage.getItem('temperatureUnit') || 'celsius';

  const displayTemperature = (temp: number) =>
    temperatureUnit === 'fahrenheit' ? parseFloat(((temp * 9) / 5 + 32).toFixed(1)) : temp;

  return (
    <Box sx={{
      width: '80%', padding: '12px', backgroundColor: '#ffffff40', borderRadius: '12px', textAlign: 'center',
      border: '2px solid #2a3946', boxShadow: '0px 4px 10px rgba(0,0,0,0.2)', margin: 'auto'
    }}>
 
      
      <Box sx={{
        display: 'flex', overflowX: 'auto', gap: '12px', alignItems: 'center'
      }}>
        {hourlyData.map((data, index) => (
          <Tooltip
            key={index}
            title={
              <>
              <Typography variant="body2">Temperature: {displayTemperature(data.temperature)} {temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
              </Typography>
                <Typography variant="body2">Humidity: {data.humidity}%</Typography>
                <Typography variant="body2">Wind Speed: {data.wind} m/s</Typography>
              </>
            }
            placement="top"
            arrow
          >
            <TemperatureBlock>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
            {data.time?.slice(11)}
              </Typography>
            </TemperatureBlock>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};


const TemperatureBlock = styled(Box)(({ theme }) => ({
  padding: '12px',
  backgroundColor: theme.palette.grey[800],
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '80px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[700],
    cursor: 'pointer',
    transform: 'scale(1.05)',
    transition: '0.3s',
  },
}));

export default HorizontalScrollDialog;
