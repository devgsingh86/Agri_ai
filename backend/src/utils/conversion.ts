/** Conversion factor: 1 acre = 0.404686 hectares */
export const ACRES_TO_HECTARES = 0.404686;

/**
 * Converts acres to hectares.
 * @param acres - Area in acres
 * @returns Area in hectares, rounded to 6 decimal places
 */
export function acresToHectares(acres: number): number {
  return Math.round(acres * ACRES_TO_HECTARES * 1_000_000) / 1_000_000;
}

/**
 * Converts hectares to acres.
 * @param hectares - Area in hectares
 * @returns Area in acres, rounded to 6 decimal places
 */
export function hectaresToAcres(hectares: number): number {
  return Math.round((hectares / ACRES_TO_HECTARES) * 1_000_000) / 1_000_000;
}

/**
 * Normalises a farm size value to hectares regardless of input unit.
 * @param size - The numeric size value
 * @param unit - The unit of the size ('acres' | 'hectares')
 * @returns Equivalent size in hectares
 */
export function normaliseToHectares(size: number, unit: 'acres' | 'hectares'): number {
  return unit === 'acres' ? acresToHectares(size) : size;
}
