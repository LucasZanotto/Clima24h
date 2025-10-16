import { Temperature, TemperatureUnit } from "../entities/Temperature";
import { WeatherData } from "../../infra/services/ClimaTempoScraper";
import { LocationRepository } from "../../infra/database/repositories/LocationRepository";
import { CityNotFoundError } from "../errors/CityNotFoundError";

export interface IWeatherScraper {
  getTemperatureByCityId(id: number): Promise<WeatherData>;
}

export interface ICityIdFinder {
  findId(cityName: string, stateUf: string): number | null;
}

export interface GetCityWeatherRequest {
  cityName: string;
  stateUf: string;
  unit: TemperatureUnit;
}

export interface GetCityWeatherResponse {
  current: number;
  min: number;
  max: number;
  unit: TemperatureUnit;
}

export class GetCityWeather {
  constructor(
    private locationRepository: LocationRepository,
    private weatherScraper: IWeatherScraper,
    private cityIdFinder: ICityIdFinder
  ) {}

  private async findClimaTempoId(cityName: string, stateUf: string): Promise<number> {
    const city = await this.locationRepository.findCityByNameAndState(cityName, stateUf);
    if (!city) {
      throw new CityNotFoundError(`Cidade '${cityName} - ${stateUf}' não encontrada em nosso banco de dados.`);
    }

    if (city.climatempo_id) {
      console.log(`CACHE HIT: ID ${city.climatempo_id} para ${cityName} encontrado no banco.`);
      return city.climatempo_id;
    }

    console.log(`CACHE MISS: Consultando o mapa manual de IDs para ${cityName}, ${stateUf}...`);
    const foundId = this.cityIdFinder.findId(cityName, stateUf);
    
    if (!foundId) {
      throw new CityNotFoundError(`Não foi possível encontrar um ID do Clima Tempo para a cidade "${cityName}, ${stateUf}".`);
    }

    console.log(`ID encontrado no mapa: ${foundId}. Atualizando o cache no banco de dados...`);
    await this.locationRepository.updateCityClimaTempoId(city.id, foundId);
    
    return foundId;
  }

  public async execute({ cityName, stateUf, unit }: GetCityWeatherRequest): Promise<GetCityWeatherResponse> {
    const climaTempoId = await this.findClimaTempoId(cityName, stateUf);

    const rawData = await this.weatherScraper.getTemperatureByCityId(climaTempoId);

    const tempCurrent = Temperature.fromCelsius(rawData.current).convertTo(unit).round();
    const tempMin = Temperature.fromCelsius(rawData.min).convertTo(unit).round();
    const tempMax = Temperature.fromCelsius(rawData.max).convertTo(unit).round();

    return {
      current: tempCurrent.value,
      min: tempMin.value,
      max: tempMax.value,
      unit: unit,
    };
  }
}