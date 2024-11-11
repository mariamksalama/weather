import { Stack, Typography, Box, styled } from "@mui/material";
import ColdestCity from "./ColdestCity";
import HottestCity from "./HottestCity";

const StyledStack = styled(Stack)({
  width: '100%',
  paddingInline: '24px',
  display: 'flex',
  flexDirection: 'column', // Stack items vertically
  alignItems: 'center',
  borderRadius: '8px',
  gap: '24px', // Add spacing between widgets
  marginTop: '24px',
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.15rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
  color: '#222',
  fontFamily: '"Roboto", sans-serif',
  textShadow: 'none',
  textAlign: 'center',
  marginTop: '24px',
}));

const HottestAndColdestCities: React.FC = () => (
  <StyledStack>
    
    <HottestCity />
    <ColdestCity />
  </StyledStack>
);

export default HottestAndColdestCities;
