import { FastifyRequest, FastifyReply } from 'fastify';
import { GetCityWeather } from '../../domain/use-cases/GetCityWeather';
import type { GetCityWeatherResponse } from '../../domain/use-cases/GetCityWeather';
import { type TemperatureUnit } from '../../domain/entities/Temperature';
import { CityNotFoundError } from '../../domain/errors/CityNotFoundError';
import * as yup from 'yup';

export class WeatherController {

  constructor(private getCityWeather: GetCityWeather) {}

  public handle = async (
    request: FastifyRequest<{
      Params: { stateUf: string; cityName: string };
      Querystring: { unit: TemperatureUnit };
    }>, 
    reply: FastifyReply
  ) => {

    const schema = yup.object({
      params: yup.object({
        stateUf: yup
          .string()
          .required('UF é obrigatória')
          .length(2, 'UF deve ter 2 caracteres'),
        cityName: yup
          .string()
          .required('Nome da cidade é obrigatório')
          .min(2, 'Nome da cidade muito curto'),
      }),
      query: yup.object({
        unit: yup
          .mixed<TemperatureUnit>()
          .oneOf(['C', 'F', 'K'], 'Unit inválida')
          .required('Unit é obrigatória'),
      }),
    });

    try {
      await schema.validate(request, { abortEarly: false });

      const { stateUf, cityName: rawCityName } = request.params;
      const { unit } = request.query;
      const cityName = decodeURIComponent(rawCityName);

      console.log(`Controller: Recebida requisição para ${cityName}, ${stateUf} em ${unit}.`);

      const result: GetCityWeatherResponse = await this.getCityWeather.execute({
        cityName,
        stateUf,
        unit,
      });

      return reply.status(200).send(result);

    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return reply.status(400).send({
          error: 'Erro de validação',
          messages: error.errors,
        });
      }

      console.error(`Controller: Erro ao executar o caso de uso para "${request.params.cityName}, ${request.params.stateUf}".`, error);

      if (error instanceof CityNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({
        error: `Falha interna ao buscar dados do clima para ${request.params.cityName}.`,
      });
    }
  }
}
