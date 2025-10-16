import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherController } from './WeatherController';
import { CityNotFoundError } from '../../domain/errors/CityNotFoundError';

const mockGetCityWeather = {
  execute: vi.fn(),
};

let controller: WeatherController;

beforeEach(() => {
  vi.clearAllMocks();
  controller = new WeatherController(mockGetCityWeather as any);
});

describe('WeatherController', () => {
  it('should return weather data successfully', async () => {
    const weatherData = {
      city: 'Campinas',
      stateUf: 'SP',
      temperature: 25,
      unit: 'C', 
    };

    mockGetCityWeather.execute.mockResolvedValue(weatherData);

    const request = {
      params: { stateUf: 'SP', cityName: 'Campinas' },
      query: { unit: 'C' },
    } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as any;

    await controller.handle(request, reply);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(weatherData);
  });

  it('should return 404 if city not found', async () => {
    mockGetCityWeather.execute.mockRejectedValue(new CityNotFoundError('Cidade não encontrada.'));

    const request = {
      params: { stateUf: 'SP', cityName: 'UnknownCity' },
      query: { unit: 'C' },
    } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as any;

    await controller.handle(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Cidade não encontrada.' });
  });

  it('should return 500 for unexpected errors', async () => {
    mockGetCityWeather.execute.mockRejectedValue(new Error('Erro inesperado'));

    const request = {
      params: { stateUf: 'SP', cityName: 'Campinas' },
      query: { unit: 'C' },
    } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as any;

    await controller.handle(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'Falha interna ao buscar dados do clima para Campinas.',
    });
  });

  it('should decode URI component of city name', async () => {
    const weatherData = {
      city: 'São Paulo',
      stateUf: 'SP',
      temperature: 28,
      unit: 'C',
    };

    mockGetCityWeather.execute.mockResolvedValue(weatherData);

    const request = {
      params: { stateUf: 'SP', cityName: encodeURIComponent('São Paulo') },
      query: { unit: 'C' },
    } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as any;

    await controller.handle(request, reply);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(weatherData);
  });
});
