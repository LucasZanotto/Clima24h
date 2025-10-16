import { LocationRepository, State } from '../../infra/database/repositories/LocationRepository';

export class ListStates {
  constructor(private locationRepository: LocationRepository) {}

  async execute(): Promise<State[]> {
    return this.locationRepository.findAllStates();
  }
}