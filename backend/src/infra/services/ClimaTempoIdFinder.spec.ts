import { describe, it, expect, beforeEach } from 'vitest';
import { ClimaTempoIdFinder } from './ClimaTempoIdFinder';

describe('ClimaTempoIdFinder', () => {
  let finder: ClimaTempoIdFinder;

  beforeEach(() => {
    finder = new ClimaTempoIdFinder();
  });

  it('should return null for an unknown city', () => {
    const result = finder.findId('CidadeInexistente', 'SP');
    expect(result).toBeNull();
  });

  it('should return null if cityName or stateUf is invalid', () => {
    expect(finder.findId('', 'SP')).toBeNull();
    expect(finder.findId('São Paulo', '')).toBeNull();
    expect(finder.findId('', '')).toBeNull();
  });
});
