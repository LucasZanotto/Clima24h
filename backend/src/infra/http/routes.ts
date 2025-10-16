import { FastifyInstance } from 'fastify';
import { WeatherController } from '../../application/controllers/WeatherController';
import { getCityWeatherSchema } from '../../application/validators/GetCityWeatherValidator';
import { LocationController } from '../../application/controllers/LocationController'; 

export async function appRoutes(
  app: FastifyInstance,
  weatherController: WeatherController,
  locationController: LocationController 
) {
  app.get('/weather/:stateUf/:cityName', weatherController.handle);
  app.get('/states', locationController.handleListStates);
  app.get('/states/:uf/cities', locationController.handleListCities);
}