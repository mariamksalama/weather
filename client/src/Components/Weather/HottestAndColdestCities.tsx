import { Stack,  styled } from "@mui/material";
import ColdestCity from "./ColdestCity";
import HottestCity from "./HottestCity";

const StyledStack = styled(Stack)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column', 
  alignItems: 'center',
  borderRadius: '8px',
  gap: '24px', 
  marginTop: '24px',
});



const HottestAndColdestCities: React.FC = () => (
  <StyledStack>
    
    <HottestCity />
    <ColdestCity />
  </StyledStack>
);

export default HottestAndColdestCities;
