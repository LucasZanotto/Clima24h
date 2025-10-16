function normalizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export class ClimaTempoIdFinder {
  public findId(cityName: string, stateUf: string): number | null {
    const normalizedCity = normalizeString(cityName);
    const normalizedUf = normalizeString(stateUf);
    const mapKey = `${normalizedCity}-${normalizedUf}`;

    console.warn(`IdFinder: [Mapa Manual] ID para "${mapKey}" não encontrado no mapa.`);
    return null;
  }
}