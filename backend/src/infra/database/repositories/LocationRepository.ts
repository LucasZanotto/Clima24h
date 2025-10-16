import { query } from '../client';

export interface State {
  uf: string;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface CityWithClimaTempoId extends City {
  climatempo_id: number | null;
}

export class LocationRepository {

  async findAllStates(): Promise<State[]> {
    const { rows } = await query('SELECT uf, name FROM states ORDER BY name');
    return rows;
  }

  async findCitiesByState(stateUf: string): Promise<City[]> {
    const { rows } = await query(
      'SELECT id, name FROM cities WHERE state_uf = $1 ORDER BY name',
      [stateUf.toUpperCase()]
    );
    return rows;
  }

  async findCityByNameAndState(name: string, stateUf: string): Promise<CityWithClimaTempoId | null> {
    const { rows } = await query(
      'SELECT id, name, climatempo_id FROM cities WHERE name ILIKE $1 AND state_uf = $2',
      [name, stateUf.toUpperCase()]
    );
    return rows[0] || null;
  }
  async updateCityClimaTempoId(cityId: number, climaTempoId: number): Promise<void> {
    await query(
      'UPDATE cities SET climatempo_id = $1 WHERE id = $2',
      [climaTempoId, cityId]
    );
  }
}