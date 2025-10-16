// src/domain/use-cases/ListStates.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListStates } from './ListStates';
import { LocationRepository, State } from '../../infra/database/repositories/LocationRepository';

describe('ListStates Use Case', () => {
  let locationRepository: LocationRepository;
  let listStates: ListStates;

  beforeEach(() => {
    locationRepository = new LocationRepository();
    listStates = new ListStates(locationRepository);
  });

  it('should return a list of states', async () => {
    const fakeStates: State[] = [
      { uf: 'SP', name: 'São Paulo' },
      { uf: 'RJ', name: 'Rio de Janeiro' },
    ];

    vi.spyOn(locationRepository, 'findAllStates').mockResolvedValueOnce(fakeStates);

    const result = await listStates.execute();
    expect(result).toEqual(fakeStates);
    expect(locationRepository.findAllStates).toHaveBeenCalled();
  });

  it('should return an empty array if no states found', async () => {
    vi.spyOn(locationRepository, 'findAllStates').mockResolvedValueOnce([]);

    const result = await listStates.execute();
    expect(result).toEqual([]);
    expect(locationRepository.findAllStates).toHaveBeenCalled();
  });
});
