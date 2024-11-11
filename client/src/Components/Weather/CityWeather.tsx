import { Box, Stack, Typography, styled } from "@mui/material";
import { WeatherData } from "./WeatherUtil";

interface CityWeatherProps {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  nextHour: WeatherData | undefined;
}

const StyledStack = styled(Stack)({
  width: "75%",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  borderRadius: "5px",
  position: "relative",
  zIndex: 1,
  backgroundColor: "#ffffff59",
  gap: "12px",
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  lineHeight: 1.2,
  fontFamily: '"Roboto", sans-serif',
  textShadow: "none",
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
    <StyledStack>
      <Box display="flex" gap="8px" alignItems="center">
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
          {city}
        </StyledTypography>
      </Box>
      <StyledTypography variant="body1">Temperature: {temperature}°C</StyledTypography>
      <StyledTypography variant="body1">Humidity: {humidity}%</StyledTypography>
      <StyledTypography variant="body1">Wind Speed: {windSpeed} m/s</StyledTypography>
      <Box
        sx={{
          width: "80%",
          backgroundColor: "white",
          padding: "8px",
          borderRadius: "5px",
          textAlign: "center",
          border: "4px solid #2a3946",
        }}
      >
        <StyledTypography
          sx={{
            fontSize: "1rem",
            color: "#222",
            marginBlock: "12px",
          }}
        >
          Your Hourly Weather Update
        </StyledTypography>
        <Box display="flex" gap="8px" alignItems="center" justifyContent="space-evenly">
          <Stack>
            <StyledTypography variant="body1">Temperature</StyledTypography>
            <StyledTypography variant="body2">{nextHour?.temperature} °C</StyledTypography>
          </Stack>
          <Stack>
            <StyledTypography variant="body1">Humidity</StyledTypography>
            <StyledTypography variant="body2">{nextHour?.humidity}%</StyledTypography>
          </Stack>
          <Stack>
            <StyledTypography variant="body1">Wind speed</StyledTypography>
            <StyledTypography variant="body2">{nextHour?.wind} m/s</StyledTypography>
          </Stack>
        </Box>
      </Box>
      <WeatherAnimation condition={condition} />
    </StyledStack>
  );
};

const WeatherAnimation = ({ condition }: { condition: string }) => {
  if (condition === "rain") {
    return <RainAnimation />;
  }
  if (condition === "clear") {
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
      top: "-10px",
      opacity: 0.5,
    },
    "100%": {
      top: "100%",
      opacity: 0,
    },
  },
  animation: "rain 1s linear infinite",
  "::after": {
    content: '""',
    position: "absolute",
    top: "0",
    left: "50%",
    width: "2px",
    height: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    animation: "rain 0.5s linear infinite",
    animationDelay: "0s",
    transform: "translateX(-50%)",
  },
});

const SunAnimation = styled(Box)({
  position: "absolute",
  top: "10%",
  left: "80%",
  width: "100px",
  height: "100px",
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
      opacity: 0,
      transform: "translateY(100%)",
    },
  },
  animation: "snow 3s linear infinite",
  "::before": {
    content: '""',
    position: "absolute",
    top: "0%",
    left: "50%",
    width: "5px",
    height: "5px",
    backgroundColor: "white",
    borderRadius: "50%",
    animation: "snow 3s linear infinite",
    animationDelay: "0s",
    transform: "translateX(-50%)",
  },
});

export default CityWeather;