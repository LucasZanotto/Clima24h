import { describe, it, expect } from 'vitest';
import { Temperature } from './Temperature';

describe('Temperature Entity', () => {

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

  it('should return the same instance if converting to the same unit', () => {
    const celsiusTemp = Temperature.fromCelsius(25);
    const sameTemp = celsiusTemp.convertTo('C');
    expect(sameTemp).toBe(celsiusTemp); 
  });

  it('should handle freezing point conversion correctly (0 C -> 32 F)', () => {
    const freezingCelsius = Temperature.fromCelsius(0);
    const freezingFahrenheit = freezingCelsius.convertTo('F');
    expect(freezingFahrenheit.value).toBeCloseTo(32);
  });

  it('should round the temperature value correctly', () => {
    const temp = Temperature.fromCelsius(25.789);
    
    const roundedToZero = temp.round(); 
    expect(roundedToZero.value).toBe(26);

    const roundedToOne = temp.round(1);
    expect(roundedToOne.value).toBe(25.8);
  });
});