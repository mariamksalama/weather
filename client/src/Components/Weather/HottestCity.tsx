import React, { useEffect, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import axios from 'axios';
import hotImage from '../../assets/images/hot.jpg'; // Adjust for correct image path

const BackgroundBox = styled(Box)({
  width: '100%', 
  height: '200px',
  backgroundImage: `url(${hotImage})`, 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  position: 'relative', // Ensure we can position the banner inside this box
});

const Banner = styled(Box)({
  position: 'absolute', 
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  color: '#fff',
   paddingBlock: '8px',
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
});

interface CityData {
  name: string;
  temperature: number;
}

const HottestCity: React.FC = () => {
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/hottest-city');
        setCityData({name: response.data.name, temperature: response.data.highTemperature});
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
      <Banner>Hottest Around the World</Banner>
      {cityData && (
        <Box textAlign="center">
          <Typography variant="h4">{cityData.name}</Typography>
          <Typography variant="h6">{cityData.temperature}°C</Typography>
        </Box>
      )}
    </BackgroundBox>
  );
};

export default HottestCity;
