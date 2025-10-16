import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCityWeather, GetCityWeatherRequest, GetCityWeatherResponse } from './GetCityWeather';
import { LocationRepository } from '../../infra/database/repositories/LocationRepository';

describe('GetCityWeather', () => {
  let repo: {
    findCityByNameAndState: ReturnType<typeof vi.fn>;
    updateCityClimaTempoId: ReturnType<typeof vi.fn>;
  };
  let scraper: {
    getTemperatureByCityId: ReturnType<typeof vi.fn>;
  };
  let idFinder: {
    findId: ReturnType<typeof vi.fn>;
  };
  let useCase: GetCityWeather;

  beforeEach(() => {
    repo = {
      findCityByNameAndState: vi.fn(),
      updateCityClimaTempoId: vi.fn(),
    };

    scraper = {
      getTemperatureByCityId: vi.fn(),
    };

    idFinder = {
      findId: vi.fn(),
    };

    useCase = new GetCityWeather(
      repo as unknown as LocationRepository,
      scraper,
      idFinder
    );

    vi.clearAllMocks();
  });

  it('should return weather for a city with cache', async () => {
    // Mocka o retorno do banco
    (repo.findCityByNameAndState as any).mockResolvedValue({
      id: 1,
      name: 'São Paulo',
      climatempo_id: 558,
    });

    // Mocka o retorno do scraper (dados de clima)
    (scraper.getTemperatureByCityId as any).mockResolvedValue({
      current: 25,
      min: 20,
      max: 30,
    });

    const req: GetCityWeatherRequest = {
      cityName: 'São Paulo',
      stateUf: 'SP',
      unit: 'C',
    };

    const res: GetCityWeatherResponse = await useCase.execute(req);

    expect(res.current).toBe(25);
    expect(res.min).toBe(20);
    expect(res.max).toBe(30);
  });
});
