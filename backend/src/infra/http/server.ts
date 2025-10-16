import fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';
import { ClimaTempoScraper } from '../services/ClimaTempoScraper';
import { ClimaTempoIdFinder } from '../services/ClimaTempoIdFinder';
import { LocationRepository } from '../database/repositories/LocationRepository';
import { GetCityWeather } from '../../domain/use-cases/GetCityWeather';
import { ListStates } from '../../domain/use-cases/ListStates';
import { ListCities } from '../../domain/use-cases/ListCities';
import { WeatherController } from '../../application/controllers/WeatherController';
import { LocationController } from '../../application/controllers/LocationController';

const app = fastify({
  logger: true,
});

app.register(cors, {
  origin: true, 
});

const locationRepository = new LocationRepository();
const climaTempoScraper = new ClimaTempoScraper();
const cityIdFinder = new ClimaTempoIdFinder();

const getCityWeatherUseCase = new GetCityWeather(
  locationRepository,
  climaTempoScraper,
  cityIdFinder
);
const listStatesUseCase = new ListStates(locationRepository);
const listCitiesUseCase = new ListCities(locationRepository);

const weatherController = new WeatherController(getCityWeatherUseCase);
const locationController = new LocationController(listStatesUseCase, listCitiesUseCase);

app.register((app, _, done) => {
  appRoutes(app, weatherController, locationController);
  done();
});

const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();