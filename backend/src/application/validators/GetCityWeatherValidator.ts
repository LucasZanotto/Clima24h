import * as yup from 'yup';
import { TemperatureUnit } from '../../domain/entities/Temperature';

export const getCityWeatherSchema = yup.object({
  params: yup.object({
    city: yup
      .string()
      .required('O nome da cidade é obrigatório')
      .trim()
      .min(1, 'O nome da cidade não pode ser vazio'),
  }),
  query: yup.object({
    unit: yup
      .mixed<TemperatureUnit>()
      .oneOf(['C', 'F', 'K'], 'Unidade de temperatura inválida')
      .default('C'),
  }),
});

export async function validateGetCityWeatherRequest(request: any) {
  try {
    const validated = await getCityWeatherSchema.validate(
      {
        params: request.params,
        query: request.query,
      },
      { abortEarly: false, stripUnknown: true }
    );
    return validated;
  } catch (err) {
    throw new Error(
      err instanceof yup.ValidationError
        ? err.errors.join(', ')
        : 'Erro de validação'
    );
  }
}
