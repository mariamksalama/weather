import { Box, Stack, Typography, styled } from "@mui/material";

interface CityWeatherProps {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

const CityWeather: React.FC<CityWeatherProps> = ({
  city,
  temperature,
  humidity,
  windSpeed,
  condition,
}) => {
  return (
    <Stack
      sx={{
        width: "75%",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        borderRadius: "5px",
        position: "relative",
        zIndex: 1,
        backgroundColor: "#ffffff59",
      }}
      gap="12px"
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "2rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          lineHeight: 1.2,
          color: "white",
          fontFamily: '"Roboto", sans-serif',
          textShadow: "none",
        }}
        variant="h5"
      >
        {city}
      </Typography>
      <Typography variant="h6">Temperature: {temperature}°C</Typography>
      <Typography variant="h6">Humidity: {humidity}%</Typography>
      <Typography variant="h6">Wind Speed: {windSpeed} m/s</Typography>

      {/* Weather condition animations */}
      <WeatherAnimation condition={condition} />
    </Stack>
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
