import { Stack, Typography, Box, styled } from "@mui/material";
import ColdestCity from "./ColdestCity";
import HottestCity from "./HottestCity";

const StyledStack = styled(Stack)({
  width: '80%',
  padding: '24px',
  backgroundColor: '#ffffff59',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '5px',
  gap: '12px',
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.25rem', 
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
  color: '#222',
  fontFamily: '"Roboto", sans-serif',
  textShadow: 'none',
  textAlign: 'center',
}));

const StyledBox = styled(Box)({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px',
});

const HottestAndColdestCities: React.FC = () => (
  <StyledStack>
    <StyledTypography variant='h5'>
      Around the World: Hottest and Coldest Cities of the Day
    </StyledTypography>
    <StyledBox>
      <HottestCity />
      <ColdestCity />
    </StyledBox>
  </StyledStack>
);

export default HottestAndColdestCities;