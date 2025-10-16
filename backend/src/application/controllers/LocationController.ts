import { FastifyRequest, FastifyReply } from 'fastify';
import { ListStates } from '../../domain/use-cases/ListStates';
import { ListCities } from '../../domain/use-cases/ListCities';
import * as yup from 'yup';

export class LocationController {
  constructor(
    private listStates: ListStates,
    private listCities: ListCities
  ) {}

  public handleListStates = async (_: FastifyRequest, reply: FastifyReply) => {
    try {
      const states = await this.listStates.execute();
      return reply.send(states);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar estados.' });
    }
  }

  public handleListCities = async (
    request: FastifyRequest<{ Params: { uf: string } }>,
    reply: FastifyReply
  ) => {
    const schema = yup.object({
      uf: yup
        .string()
        .required('UF é obrigatória')
        .length(2, 'UF deve ter 2 caracteres'),
    });

    try {
      await schema.validate(request.params, { abortEarly: false });

      const { uf } = request.params;
      const cities = await this.listCities.execute(uf);
      return reply.send(cities);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return reply.status(400).send({
          error: 'Erro de validação',
          messages: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao buscar cidades.' });
    }
  }
}
