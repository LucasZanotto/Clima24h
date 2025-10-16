import { describe, it, expect } from 'vitest';
import { Temperature } from './Temperature';

describe('Temperature Entity (Frontend)', () => {
  it('should correctly convert celsius to fahrenheit', () => {
    const celsiusTemp = Temperature.fromCelsius(20);
    const fahrenheitTemp = celsiusTemp.convertTo('F');
    expect(fahrenheitTemp.value).toBeCloseTo(68);
    expect(fahrenheitTemp.unit).toBe('F');
  });

  it('should correctly convert celsius to kelvin', () => {
    const celsiusTemp = Temperature.fromCelsius(100);
    const kelvinTemp = celsiusTemp.convertTo('K');
    expect(kelvinTemp.value).toBeCloseTo(373.15);
    expect(kelvinTemp.unit).toBe('K');
  });
});