export type TemperatureUnit = 'C' | 'F' | 'K';

export class Temperature {
  public readonly value: number;
  public readonly unit: TemperatureUnit;

  private constructor(value: number, unit: TemperatureUnit) {
    this.value = value;
    this.unit = unit;
  }

  public static fromCelsius(value: number): Temperature {
    return new Temperature(value, 'C');
  }

  public convertTo(newUnit: TemperatureUnit): Temperature {
    if (this.unit === newUnit) {
      return this;
    }

    switch (newUnit) {
      case 'F':
        return new Temperature(this.toFahrenheit(), 'F');
      case 'K':
        return new Temperature(this.toKelvin(), 'K');
      case 'C':
        if (this.unit === 'F') {
          const celsius = (this.value - 32) * 5 / 9;
          return new Temperature(celsius, 'C');
        }
        if (this.unit === 'K') {
          const celsius = this.value - 273.15;
          return new Temperature(celsius, 'C');
        }
        return this;
    }
  }

  private toFahrenheit(): number {
    if (this.unit === 'C') {
      return (this.value * 9/5) + 32;
    }
    if (this.unit === 'K') {
      const celsius = this.value - 273.15;
      return (celsius * 9/5) + 32;
    }
    return this.value;
  }

  private toKelvin(): number {
    if (this.unit === 'C') {
      return this.value + 273.15;
    }
    if (this.unit === 'F') {
      const celsius = (this.value - 32) * 5 / 9;
      return celsius + 273.15;
    }
    return this.value;
  }

  public round(decimals: number = 0): Temperature {
    const factor = Math.pow(10, decimals);
    const roundedValue = Math.round(this.value * factor) / factor;
    return new Temperature(roundedValue, this.unit);
  }
}