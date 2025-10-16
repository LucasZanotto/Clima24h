import { LocationRepository, City } from '../../infra/database/repositories/LocationRepository';
export class ListCities {
constructor(private locationRepository: LocationRepository) {}
async execute(stateUf: string): Promise<City[]> {
if (!stateUf || stateUf.length !== 2) {
throw new Error('UF do estado é inválida.');
}
return this.locationRepository.findCitiesByState(stateUf);
}
}