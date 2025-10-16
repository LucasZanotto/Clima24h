// src/domain/use-cases/ListCities.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListCities } from './ListCities';
import { LocationRepository, City } from '../../infra/database/repositories/LocationRepository';
import { mockQueryResult, mockQuery } from '../../../vitest.setup';

describe('ListCities Use Case', () => {
  let locationRepository: LocationRepository;
  let listCities: ListCities;

  beforeEach(() => {
    locationRepository = new LocationRepository();
    listCities = new ListCities(locationRepository);
  });

  it('should throw an error if UF is missing or invalid', async () => {
    await expect(listCities.execute('')).rejects.toThrow('UF do estado é inválida.');
    await expect(listCities.execute('S')).rejects.toThrow('UF do estado é inválida.');
    await expect(listCities.execute('SPP')).rejects.toThrow('UF do estado é inválida.');
  });

  it('should return a list of cities for a valid UF', async () => {
    const fakeCities: City[] = [
      { id: 1, name: 'São Paulo' },
      { id: 2, name: 'Campinas' },
    ];
    vi.spyOn(locationRepository, 'findCitiesByState').mockResolvedValueOnce(fakeCities);

    const result = await listCities.execute('SP');
    expect(result).toEqual(fakeCities);
    expect(locationRepository.findCitiesByState).toHaveBeenCalledWith('SP');
  });

  it('should return empty array if no cities are found', async () => {
    vi.spyOn(locationRepository, 'findCitiesByState').mockResolvedValueOnce([]);
    const result = await listCities.execute('RJ');
    expect(result).toEqual([]);
    expect(locationRepository.findCitiesByState).toHaveBeenCalledWith('RJ');
  });
});
