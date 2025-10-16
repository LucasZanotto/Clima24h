import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationController } from './LocationController';
import { ListStates } from '../../domain/use-cases/ListStates';
import { ListCities } from '../../domain/use-cases/ListCities';

describe('LocationController', () => {
  let listStatesMock: ListStates;
  let listCitiesMock: ListCities;
  let controller: LocationController;

  // Mock do reply do Fastify
  const replyMock = () => {
    const send = vi.fn((data) => data);
    const status = vi.fn(() => ({ send }));
    return { send, status };
  };

  beforeEach(() => {
    listStatesMock = { execute: vi.fn() } as unknown as ListStates;
    listCitiesMock = { execute: vi.fn() } as unknown as ListCities;
    controller = new LocationController(listStatesMock, listCitiesMock);
  });

  describe('handleListStates', () => {
    it('should return states successfully', async () => {
      const reply = replyMock();
      const states = [{ uf: 'SP', name: 'São Paulo' }];
      (listStatesMock.execute as any).mockResolvedValue(states);

      const result = await controller.handleListStates({} as any, reply as any);

      expect(result).toEqual(states);
      expect(listStatesMock.execute).toHaveBeenCalled();
    });

    it('should return 500 if use case fails', async () => {
      const reply = replyMock();
      (listStatesMock.execute as any).mockRejectedValue(new Error('fail'));

      const result = await controller.handleListStates({} as any, reply as any);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.status().send).toHaveBeenCalledWith({ error: 'Erro ao buscar estados.' });
    });
  });

  describe('handleListCities', () => {
    it('should return cities successfully', async () => {
      const reply = replyMock();
      const request = { params: { uf: 'SP' } };
      const cities = [{ id: 1, name: 'São Paulo' }];
      (listCitiesMock.execute as any).mockResolvedValue(cities);

      const result = await controller.handleListCities(request as any, reply as any);

      expect(result).toEqual(cities);
      expect(listCitiesMock.execute).toHaveBeenCalledWith('SP');
    });

    it('should return 500 if use case fails', async () => {
      const reply = replyMock();
      const request = { params: { uf: 'SP' } };
      (listCitiesMock.execute as any).mockRejectedValue(new Error('fail'));

      const result = await controller.handleListCities(request as any, reply as any);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.status().send).toHaveBeenCalledWith({ error: 'Erro ao buscar cidades.' });
    });
  });
});
