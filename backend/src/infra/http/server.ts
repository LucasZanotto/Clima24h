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
import { runSeedRoute } from "./runSeedRoute"; 


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

runSeedRoute(app);


const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333; // Usa a porta do Render
    const host = '0.0.0.0'; // Obrigatório no Render para aceitar conexões externas
    await app.listen({ port, host });
    app.log.info(`Server running on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();