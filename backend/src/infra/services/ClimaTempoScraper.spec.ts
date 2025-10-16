import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ClimaTempoScraper, WeatherData } from './ClimaTempoScraper';

vi.mock('axios');

describe('ClimaTempoScraper', () => {
  let scraper: ClimaTempoScraper;

  beforeEach(() => {
    scraper = new ClimaTempoScraper();
    vi.resetAllMocks();
  });

  it('should parse temperatures correctly from HTML', async () => {
    const htmlMock = `
      <div id="wrapper-chart-1" data-infos='[{"date":"2025-10-16T12:00:00","temperature":{"temperature":25}}]'></div>
      <span id="min-temp-1">18°</span>
      <span id="max-temp-1">28°</span>
    `;

    (axios.get as any).mockResolvedValue({ data: htmlMock });

    const result: WeatherData = await scraper.getTemperatureByCityId(123);

    expect(result).toEqual({ current: 25, min: 18, max: 28 });
    expect(axios.get).toHaveBeenCalledWith('https://www.climatempo.com.br/previsao-do-tempo/cidade/123');
  });

  it('should throw an error if data-infos is missing', async () => {
    const htmlMock = `<div id="wrapper-chart-1"></div>`;
    (axios.get as any).mockResolvedValue({ data: htmlMock });

    await expect(scraper.getTemperatureByCityId(123))
      .rejects.toThrow('Falha ao obter dados de temperatura do Clima Tempo para a cidade de ID 123.');
  });
});
