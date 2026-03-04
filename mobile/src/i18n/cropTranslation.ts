/**
 * Translate a crop name stored in English in the database
 * to the current app language using i18n keys.
 * Falls back to the original name for custom/unknown crops.
 */
import i18n from './index';

/** Map lowercase crop names to their i18n key */
const CROP_KEY_MAP: Record<string, string> = {
  wheat: 'crop_wheat',
  rice: 'crop_rice',
  maize: 'crop_maize',
  corn: 'crop_corn',
  barley: 'crop_barley',
  millet: 'crop_millet',
  sorghum: 'crop_sorghum',
  chickpea: 'crop_chickpea',
  chana: 'crop_chickpea',
  lentil: 'crop_lentil',
  lentils: 'crop_lentil',
  soybean: 'crop_soybean',
  soybeans: 'crop_soybean',
  groundnut: 'crop_groundnut',
  groundnuts: 'crop_groundnut',
  peanut: 'crop_groundnut',
  cotton: 'crop_cotton',
  sugarcane: 'crop_sugarcane',
  jute: 'crop_jute',
  tomato: 'crop_tomato',
  potato: 'crop_potato',
  onion: 'crop_onion',
  cabbage: 'crop_cabbage',
  carrot: 'crop_carrot',
  pepper: 'crop_pepper',
  mango: 'crop_mango',
  banana: 'crop_banana',
  apple: 'crop_apple',
  grapes: 'crop_grapes',
  grape: 'crop_grapes',
  papaya: 'crop_papaya',
  orange: 'crop_orange',
  turmeric: 'crop_turmeric',
  ginger: 'crop_ginger',
  mustard: 'crop_mustard',
  sunflower: 'crop_sunflower',
};

/**
 * Translate a single crop name.
 * Returns translated name or the original if no mapping exists.
 */
export function translateCropName(cropName: string): string {
  const key = CROP_KEY_MAP[cropName.toLowerCase().trim()];
  if (key) {
    return i18n.t(key);
  }
  return cropName; // custom crop — keep as-is
}
