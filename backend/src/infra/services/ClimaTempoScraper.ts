import axios from 'axios';
import * as cheerio from 'cheerio';
import { IWeatherScraper } from '../../domain/use-cases/GetCityWeather';

const BASE_URL = 'https://www.climatempo.com.br/previsao-do-tempo/cidade';

export interface WeatherData {
  current: number;
  min: number;
  max: number;
}

interface HourlyForecast {
  date: string;
  temperature: { temperature: number };
}

export class ClimaTempoScraper implements IWeatherScraper {

  private parseTemperature(text: string | undefined): number {
    if (!text) {
      throw new Error('Texto da temperatura (min/max) está vazio ou indefinido.');
    }
    const temperature = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(temperature)) {
      throw new Error(`Não foi possível converter "${text}" para um número.`);
    }
    return temperature;
  }

  public async getTemperatureByCityId(id: number): Promise<WeatherData> {
    const cityUrl = `${BASE_URL}/${id}`; 

    try {
      console.log(`Scraper: Acessando a URL: ${cityUrl}`);

      const response = await axios.get(cityUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      const hourlyDataString = $('#wrapper-chart-1').attr('data-infos');
      if (!hourlyDataString) {
        throw new Error(`Atributo data-infos não encontrado para a cidade de ID ${id}.`);
      }

      const hourlyForecasts: HourlyForecast[] = JSON.parse(hourlyDataString);
      if (!hourlyForecasts || hourlyForecasts.length === 0) {
        throw new Error('Os dados de previsão horária estão vazios ou em formato inválido.');
      }

      const now = new Date();
      const pastForecasts = hourlyForecasts.filter(f => new Date(f.date) <= now);
      const mostRecentForecast = pastForecasts.pop() || hourlyForecasts[0];
      
      const current = mostRecentForecast.temperature.temperature;
      const min = this.parseTemperature($('#min-temp-1').text());
      const max = this.parseTemperature($('#max-temp-1').text());

      return { current, min, max };

    } catch (error) {
      if (error instanceof Error) {
        console.error(`Scraper: Ocorreu um erro para a URL ${cityUrl}:`, error.message);
      }
      throw new Error(`Falha ao obter dados de temperatura do Clima Tempo para a cidade de ID ${id}.`);
    }
  }
}