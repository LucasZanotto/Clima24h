import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomePage } from './HomePage';
import * as api from '../services/api';
import type { WeatherResponse } from '../services/api';

vi.mock('../services/api');

const mockStates = [{ uf: 'SP', name: 'São Paulo' }];
const mockCities = [{ id: 1, name: 'Campinas' }];
const mockWeather: WeatherResponse = { current: 25, min: 20, max: 30, unit: 'C' };

describe('HomePage Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the initial state correctly', async () => {
    vi.mocked(api.fetchStates).mockResolvedValue(mockStates);
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /clima24h/i })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /são paulo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeDisabled();
  });

  it('should allow a full user flow and show loading state', async () => {
    const user = userEvent.setup();

    let resolveWeatherPromise: (value: any) => void;
    const weatherPromise = new Promise(resolve => {
      resolveWeatherPromise = resolve;
    });
    vi.mocked(api.fetchWeather).mockReturnValue(weatherPromise as Promise<WeatherResponse>);
    // ------------------------------------

    vi.mocked(api.fetchStates).mockResolvedValue(mockStates);
    vi.mocked(api.fetchCitiesByState).mockResolvedValue(mockCities);

    render(<HomePage />);

    const stateSelect = await screen.findByLabelText(/estado/i);
    await user.selectOptions(stateSelect, 'SP');
    const citySelect = await screen.findByLabelText(/cidade/i);
    await user.selectOptions(citySelect, 'Campinas');
    
    const submitButton = screen.getByRole('button', { name: /consultar/i });
    await act(async () => {
      await user.click(submitButton);
    });

    expect(screen.getByText(/consultando.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(api.fetchWeather).toHaveBeenCalledWith('Campinas', 'SP', 'C');

    await act(async () => {
      resolveWeatherPromise(mockWeather);
      await weatherPromise;
    });

    expect(await screen.findByRole('heading', { name: /campinas/i })).toBeInTheDocument();

    const tempAtual = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && element.textContent === 'Atual: 25°C';
    });
    expect(tempAtual).toBeInTheDocument();

    expect(screen.getByText((c, el) => el?.textContent === 'Mínima: 20°C')).toBeInTheDocument();
    expect(screen.getByText((c, el) => el?.textContent === 'Máxima: 30°C')).toBeInTheDocument();

    expect(submitButton).toBeEnabled();
  });
});