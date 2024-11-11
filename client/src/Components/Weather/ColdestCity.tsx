import React, { useEffect, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import axios from 'axios';
import coldImage from '../../assets/images/cold.jpg'; 

const BackgroundBox = styled(Box)({
  width: '48%',
  height: '300px',
  backgroundImage: `url(${coldImage})`, 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

interface CityData {
  name: string;
  temperature: number;
}

const ColdestCity: React.FC = () => {
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/coldest-city');
        setCityData({name:response.data.name, temperature:response.data.lowTemperature});
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch city data');
        setLoading(false);
      }
    };

    fetchCityData();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  return (
    <BackgroundBox>
      {cityData && (
        <Box textAlign="center">
          <Typography variant="h4">{cityData.name}</Typography>
          <Typography variant="h6">{cityData.temperature}°C</Typography>
        </Box>
      )}
    </BackgroundBox>
  );
};

export default ColdestCity;