import axios from "axios";

export const fetchWeatherData = async (latitude: number, longitude: number): Promise<any> => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await axios.get(url);
    return response.data.daily;
  };
  