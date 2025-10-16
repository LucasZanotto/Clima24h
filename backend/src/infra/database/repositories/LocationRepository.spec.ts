import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LocationRepository, State, City, CityWithClimaTempoId } from './LocationRepository';

const mockQuery = vi.fn();
vi.mock('../client', () => ({ query: (...args: any[]) => mockQuery(...args) }));

describe('LocationRepository (Mocked)', () => {
  let repo: LocationRepository;

  beforeEach(() => {
    repo = new LocationRepository();
    vi.clearAllMocks();
  });

  it('findAllStates should return a list of states', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ uf: 'SP', name: 'São Paulo' }] });
    const states: State[] = await repo.findAllStates();
    expect(states).toEqual([{ uf: 'SP', name: 'São Paulo' }]);
  });

  it('findCitiesByState should return a list of cities', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'São Paulo' }] });
    const cities: City[] = await repo.findCitiesByState('SP');
    expect(cities).toEqual([{ id: 1, name: 'São Paulo' }]);
  });

  it('findCityByNameAndState should return a city with climatempo_id', async () => {
    const city: CityWithClimaTempoId = { id: 1, name: 'São Paulo', climatempo_id: 558 };
    mockQuery.mockResolvedValueOnce({ rows: [city] });
    const result = await repo.findCityByNameAndState('São Paulo', 'SP');
    expect(result).toEqual(city);
  });

  it('updateCityClimaTempoId should call query with correct params', async () => {
    mockQuery.mockResolvedValueOnce({});
    await repo.updateCityClimaTempoId(1, 558);
    expect(mockQuery).toHaveBeenCalledWith(
      'UPDATE cities SET climatempo_id = $1 WHERE id = $2',
      [558, 1]
    );
  });
});
