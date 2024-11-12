import { Box, Stack, Typography, styled } from "@mui/material";
import HorizontalScrollDialog from "./HorizontalScrollDialog";
import { WeatherData } from "./WeatherUtil";

interface CityWeatherProps {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  nextHour: WeatherData[] | undefined;
}

const StyledStack = styled(Stack)({
  padding: "24px",
  display: "flex",
  alignItems: "center",
  borderRadius: "18px",
  position: "relative",
  zIndex: 1,
  maxWidth: "80vw",
  backgroundColor: "#ffffff59",
  gap: "12px",
});

const StyledTypography = styled(Typography)(() => ({
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  lineHeight: 1.2,
  fontFamily: '"Roboto", sans-serif',
  textShadow: "none",
}));
const TitleTypography = styled(Typography)(() => ({
    fontWeight: 700,
    fontSize: "3rem",
        textTransform: "uppercase",
    fontFamily: '"Roboto", sans-serif',
    textShadow: "grey",
    color:'#ffffffad'
  }));
const CityWeather: React.FC<CityWeatherProps> = ({
  city,
  temperature,
  humidity,
  windSpeed,
  condition,
  nextHour,
}) => {
  return (
    <Stack sx={{ textAlign:'center'}}>


        
    <StyledStack>
        
     
        <Stack display='flex'   width='80%' justifyContent='space-evenly'   height='fit-content' marginBlock='12px'>
       
            <Box textAlign='left' >
            <TitleTypography >{city}</TitleTypography>

            <TitleTypography >{temperature}{localStorage.getItem('temperatureUnit')==='fahrenheit'?'°F':'°C'}</TitleTypography>
            </Box>
            <Stack display='flex' alignItems='flex-start'   gap='12px' padding='24px'>
            <DataBox display='flex' gap='8px'>
                <StyledTypography variant="body1" sx={{color:'grey'}}>Humidity</StyledTypography>
                <StyledTypography variant="body2" sx={{color:'white'}}> {humidity}%</StyledTypography>
            </DataBox>
            <DataBox display='flex'  gap='8px'>
                <StyledTypography variant="body1" sx={{color:'grey'}}>Wind speed</StyledTypography>
                <StyledTypography variant="body2"  sx={{color:'white'}}>{windSpeed} m/s</StyledTypography>
                </DataBox>
            </Stack>
        </Stack>
       
        <HorizontalScrollDialog hourlyData={nextHour ||[]}/>
      <WeatherAnimation condition={condition} />
    </StyledStack>
    </Stack>

  );
};

const WeatherAnimation = ({ condition }: { condition: string }) => {
  if (condition === "haze") {
    return <RainAnimation />;
  }
  if (condition === "haze") {
    return <SunAnimation />;
  }
  if (condition === "snow") {
    return <SnowAnimation />;
  }
  return null;
};

const RainAnimation = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "transparent",
  pointerEvents: "none",
  zIndex: -1,
  "@keyframes rain": {
    "0%": {
      top: "-20px",
      opacity: 0.8,
    },
    "100%": {
      top: "100%",
      opacity: 0,
    },
  },
  animation: "rain 1s linear infinite",
  "::before": {
    content: '""',
    position: "absolute",
    top: "0%",
    left: "50%", // Centered horizontally, will adjust with randomize
    width: "4px", // Increased width for larger raindrops
    height: "20px", // Increased height for longer raindrops
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Increased opacity for visibility
    animation: "rain 0.5s linear infinite",
    animationDelay: "0s",
    transform: "translateX(-50%)",
  },
  "::after": {
    content: '""',
    position: "absolute",
    top: "0%",
    left: "30%", // Another position for variation
    width: "6px", // Larger snowflakes
    height: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    animation: "rain 0.5s linear infinite",
    animationDelay: "1s", // Delayed start for variety
    transform: "translateX(-50%)",
  },
  "::nth-child(odd)::before": {
    left: "calc(100% * random())", // Randomize horizontal position
  },
  "::nth-child(even)::after": {
    left: "calc(100% * random())",
  },
});



const DataBox = styled(Box)(({ theme }) => ({
    background: theme.palette.grey[900],
    padding: '16px 24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width:'80%',
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
    color: theme.palette.text.primary,
    gap: "12px",
    '&:hover': {
      transform: 'scale(1.05)',
      transition: 'transform 0.3s ease',
    },
    "& .dataValue": {
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "#fff",
    },
    "& .dataLabel": {
      fontSize: "1rem",
      fontWeight: 500,
      color: theme.palette.text.secondary,
    },
  }));
  
const SunAnimation = styled(Box)({
  position: "absolute",
  top: "15%",
  left: "70%",
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "rgb(245 180 50 / 64%)",
  boxShadow: "0 0 50px rgba(255, 255, 0, 0.6)",
  animation: "pulse 2s ease-in-out infinite",
  transform: "translate(-50%, -50%)",
  "@keyframes pulse": {
    "0%": {
      transform: "scale(0.9)",
      opacity: 0.8,
    },
    "50%": {
      transform: "scale(1.2)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(0.9)",
      opacity: 0.8,
    },
  },
});

const SnowAnimation = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "transparent",
  pointerEvents: "none",
  zIndex: -1,
  "@keyframes snow": {
    "0%": {
      opacity: 1,
      transform: "translateY(-100%)",
    },
    "100%": {
      opacity: 0.5, 
      transform: "translateY(100%)",
    },
  },
  animation: "snow 3s linear infinite",
  "::before": {
    content: '""',
    position: "absolute",
    top: "0%",
    left: "50%",
    width: "18px", 
    height: "18px", 
    backgroundColor: "white",
    borderRadius: "50%",
    animation: "snow 3s linear infinite",
    animationDelay: "0s",
    transform: "translateX(-50%)",
  },
  "::after": {
    content: '""',
    position: "absolute",
    top: "0%",
    left: "30%",
    width: "6px", 
    height: "6px", 
    backgroundColor: "white",
    borderRadius: "50%",
    animation: "snow 4s linear infinite", 
    animationDelay: "1s", 
    transform: "translateX(-50%)",
  },
  "::nth-of-type(odd)": {
    "::before": {
      animationDelay: "0.5s",
    },
  },
});



export default CityWeather;