import React, { useState, useEffect } from 'react';
import type { WeatherResponse, State, City } from '../services/api';
import { fetchWeather, fetchStates, fetchCitiesByState } from '../services/api';
import { Temperature, type TemperatureUnit } from '../services/Temperature';

export function HomePage() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [baseWeatherData, setBaseWeatherData] = useState<WeatherResponse | null>(null);

  const [displayUnit, setDisplayUnit] = useState<TemperatureUnit>('C'); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStates()
      .then(setStates)
      .catch(() => setError('Não foi possível carregar a lista de estados.'));
  }, []);

  useEffect(() => {
    if (selectedState) {
      setIsLoading(true);
      setCities([]);
      setSelectedCity('');
      setBaseWeatherData(null); 
      setError(null);     
      
      fetchCitiesByState(selectedState)
        .then(setCities)
        .catch(() => setError('Não foi possível carregar a lista de cidades.'))
        .finally(() => setIsLoading(false));
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      setBaseWeatherData(null);
      setError(null);
    }
  }, [selectedCity]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCity) return;
    
    setIsLoading(true);
    setBaseWeatherData(null);
    setError(null);

    try {
      const data = await fetchWeather(selectedCity, selectedState, 'C');
      setBaseWeatherData(data);
      setDisplayUnit(formUnit); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar dados do clima.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayData = () => {
    if (!baseWeatherData) return null;

    return {
      current: Temperature.fromCelsius(baseWeatherData.current).convertTo(displayUnit).round().value,
      min: Temperature.fromCelsius(baseWeatherData.min).convertTo(displayUnit).round().value,
      max: Temperature.fromCelsius(baseWeatherData.max).convertTo(displayUnit).round().value,
      unit: displayUnit,
    };
  };

  const displayData = getDisplayData();

  const [formUnit, setFormUnit] = useState<TemperatureUnit>('C'); 
  const handleUnitChange = (unit: TemperatureUnit) => {
    setFormUnit(unit); 
    if (baseWeatherData) {
      setDisplayUnit(unit);
    }
  };

  return (
    <div className="app-container">
      <h2>Clima24h</h2>
      <form onSubmit={handleSubmit} className="weather-form">
        <div className="form-group">
          <label htmlFor="state">Estado</label>
          <select id="state" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required>
            <option value="" disabled>Selecione um estado</option>
            {states.map(state => <option key={state.uf} value={state.uf}>{state.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">Cidade</label>
          <select id="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} required disabled={cities.length === 0 || isLoading}>
            <option value="" disabled>Selecione uma cidade</option>
            {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
          </select>
        </div>

        <fieldset className="unit-options">
          <legend>Unidade</legend>
          <div className="unit-toggle">
            <input type="radio" id="celsius" name="unit" value="C" checked={formUnit === 'C'} onChange={() => handleUnitChange('C')} />
            <label htmlFor="celsius">°C</label>
            <input type="radio" id="fahrenheit" name="unit" value="F" checked={formUnit === 'F'} onChange={() => handleUnitChange('F')} />
            <label htmlFor="fahrenheit">°F</label>
            <input type="radio" id="kelvin" name="unit" value="K" checked={formUnit === 'K'} onChange={() => handleUnitChange('K')} />
            <label htmlFor="kelvin">K</label>
          </div>
        </fieldset>

        <button type="submit" className="submit-button" disabled={isLoading || !selectedCity}>
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      <div className="results-container">
        {isLoading && <div className="loader"></div>}
        {error && !isLoading && <div className="error-message">{error}</div>}
        {displayData && !isLoading && (
          <div>
            <h3>{selectedCity.toUpperCase()}</h3>
            <p><strong>Atual:</strong> {displayData.current}°{displayData.unit}</p>
            <p><strong>Mínima:</strong> {displayData.min}°{displayData.unit}</p>
            <p><strong>Máxima:</strong> {displayData.max}°{displayData.unit}</p>
          </div>
        )}
      </div>
    </div>
  );
}