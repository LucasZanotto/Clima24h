import axios from 'axios';

export type TemperatureUnit = 'C' | 'F' | 'K';

export interface WeatherResponse {
  current: number;
  min: number;
  max: number;
  unit: TemperatureUnit;
}

export interface State {
  uf: string;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

const apiClient = axios.create({
  baseURL: baseURL,
});

console.log(`API Base URL: ${baseURL}`); 

export async function fetchWeather(
  cityName: string,
  stateUf: string,
  unit: TemperatureUnit
): Promise<WeatherResponse> {
  const encodedCity = encodeURIComponent(cityName);
  const encodedUf = encodeURIComponent(stateUf);
  
  const response = await apiClient.get<WeatherResponse>(`/weather/${encodedUf}/${encodedCity}`, {
    params: { unit },
  });
  return response.data;
}

export async function fetchStates(): Promise<State[]> {
  const response = await apiClient.get<State[]>('/states');
  return response.data;
}

export async function fetchCitiesByState(uf: string): Promise<City[]> {
  const response = await apiClient.get<City[]>(`/states/${uf}/cities`);
  return response.data;
}