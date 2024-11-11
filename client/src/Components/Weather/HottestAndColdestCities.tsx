import { Stack, Typography, Box } from "@mui/material";
import ColdestCity from "./ColdestCity";
import HottestCity from "./HottestCity";

const HottestAndColdestCities: React.FC = () => (
  <Stack sx={{width:'75%', padding:'24px', backgroundColor:'#ffffff59', display:'flex', alignItems:'center', borderRadius:'5px'}} gap='12px'>
    <Typography sx={{
      fontWeight: 600,           
      fontSize: '1.5rem',          
      letterSpacing: '0.05em',   
      textTransform: 'uppercase', 
      lineHeight: 1.2,          
      color: '#222',           
      fontFamily: '"Roboto", sans-serif', 
      textShadow: 'none',       
    }} variant='h5'>
      Around the World: Hottest and Coldest Cities of the Day
    </Typography> 
    <Box sx={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px'}}>
      <HottestCity/>
      <ColdestCity/>
    </Box>
  </Stack>
);
export default HottestAndColdestCities;