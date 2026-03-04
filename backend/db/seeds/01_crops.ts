import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed 30+ crops covering major agricultural regions globally.
 */
const crops = [
  // Grains & Cereals
  { name: 'Wheat', scientific_name: 'Triticum aestivum', category: 'Grains & Cereals', common_regions: ['South Asia', 'North America', 'Europe'] },
  { name: 'Rice', scientific_name: 'Oryza sativa', category: 'Grains & Cereals', common_regions: ['South Asia', 'Southeast Asia', 'East Asia'] },
  { name: 'Maize (Corn)', scientific_name: 'Zea mays', category: 'Grains & Cereals', common_regions: ['North America', 'Sub-Saharan Africa', 'South America'] },
  { name: 'Sorghum', scientific_name: 'Sorghum bicolor', category: 'Grains & Cereals', common_regions: ['Sub-Saharan Africa', 'South Asia', 'Australia'] },
  { name: 'Barley', scientific_name: 'Hordeum vulgare', category: 'Grains & Cereals', common_regions: ['Europe', 'North Africa', 'Middle East'] },
  { name: 'Millet', scientific_name: 'Panicum miliaceum', category: 'Grains & Cereals', common_regions: ['Sub-Saharan Africa', 'South Asia'] },
  { name: 'Oats', scientific_name: 'Avena sativa', category: 'Grains & Cereals', common_regions: ['Europe', 'North America'] },

  // Pulses & Legumes
  { name: 'Chickpea', scientific_name: 'Cicer arietinum', category: 'Pulses & Legumes', common_regions: ['South Asia', 'Middle East', 'Australia'] },
  { name: 'Lentils', scientific_name: 'Lens culinaris', category: 'Pulses & Legumes', common_regions: ['South Asia', 'Middle East', 'Canada'] },
  { name: 'Soybean', scientific_name: 'Glycine max', category: 'Pulses & Legumes', common_regions: ['North America', 'South America', 'East Asia'] },
  { name: 'Groundnut (Peanut)', scientific_name: 'Arachis hypogaea', category: 'Pulses & Legumes', common_regions: ['South Asia', 'Sub-Saharan Africa', 'China'] },
  { name: 'Kidney Beans', scientific_name: 'Phaseolus vulgaris', category: 'Pulses & Legumes', common_regions: ['Latin America', 'East Africa', 'India'] },
  { name: 'Pigeon Pea', scientific_name: 'Cajanus cajan', category: 'Pulses & Legumes', common_regions: ['South Asia', 'East Africa', 'Caribbean'] },
  { name: 'Black-eyed Peas', scientific_name: 'Vigna unguiculata', category: 'Pulses & Legumes', common_regions: ['Sub-Saharan Africa', 'South Asia', 'Americas'] },

  // Vegetables
  { name: 'Tomato', scientific_name: 'Solanum lycopersicum', category: 'Vegetables', common_regions: ['Mediterranean', 'South Asia', 'Americas'] },
  { name: 'Potato', scientific_name: 'Solanum tuberosum', category: 'Vegetables', common_regions: ['South America', 'Europe', 'South Asia'] },
  { name: 'Onion', scientific_name: 'Allium cepa', category: 'Vegetables', common_regions: ['South Asia', 'Middle East', 'Europe'] },
  { name: 'Cabbage', scientific_name: 'Brassica oleracea', category: 'Vegetables', common_regions: ['Europe', 'East Asia', 'South Asia'] },
  { name: 'Carrot', scientific_name: 'Daucus carota', category: 'Vegetables', common_regions: ['Europe', 'East Asia', 'North America'] },
  { name: 'Spinach', scientific_name: 'Spinacia oleracea', category: 'Vegetables', common_regions: ['Middle East', 'South Asia', 'Europe'] },

  // Fruits
  { name: 'Mango', scientific_name: 'Mangifera indica', category: 'Fruits', common_regions: ['South Asia', 'Southeast Asia', 'Sub-Saharan Africa'] },
  { name: 'Banana', scientific_name: 'Musa spp.', category: 'Fruits', common_regions: ['Tropical regions', 'South Asia', 'Sub-Saharan Africa'] },
  { name: 'Apple', scientific_name: 'Malus domestica', category: 'Fruits', common_regions: ['Europe', 'North America', 'Asia'] },
  { name: 'Orange', scientific_name: 'Citrus sinensis', category: 'Fruits', common_regions: ['Mediterranean', 'South Asia', 'Americas'] },
  { name: 'Grapes', scientific_name: 'Vitis vinifera', category: 'Fruits', common_regions: ['Mediterranean', 'South America', 'South Africa'] },

  // Cash Crops
  { name: 'Cotton', scientific_name: 'Gossypium hirsutum', category: 'Cash Crops', common_regions: ['South Asia', 'Sub-Saharan Africa', 'North America'] },
  { name: 'Sugarcane', scientific_name: 'Saccharum officinarum', category: 'Cash Crops', common_regions: ['South Asia', 'Latin America', 'Sub-Saharan Africa'] },
  { name: 'Coffee', scientific_name: 'Coffea arabica', category: 'Cash Crops', common_regions: ['Sub-Saharan Africa', 'Latin America', 'Southeast Asia'] },
  { name: 'Tea', scientific_name: 'Camellia sinensis', category: 'Cash Crops', common_regions: ['South Asia', 'East Asia', 'Sub-Saharan Africa'] },
  { name: 'Tobacco', scientific_name: 'Nicotiana tabacum', category: 'Cash Crops', common_regions: ['South Asia', 'Americas', 'Sub-Saharan Africa'] },
  { name: 'Jute', scientific_name: 'Corchorus spp.', category: 'Cash Crops', common_regions: ['South Asia', 'Southeast Asia'] },

  // Oil Crops
  { name: 'Sunflower', scientific_name: 'Helianthus annuus', category: 'Oil Crops', common_regions: ['Europe', 'North America', 'South Asia'] },
  { name: 'Canola (Rapeseed)', scientific_name: 'Brassica napus', category: 'Oil Crops', common_regions: ['Europe', 'Canada', 'South Asia'] },
  { name: 'Palm Oil', scientific_name: 'Elaeis guineensis', category: 'Oil Crops', common_regions: ['Southeast Asia', 'Sub-Saharan Africa', 'Latin America'] },
  { name: 'Mustard', scientific_name: 'Brassica juncea', category: 'Oil Crops', common_regions: ['South Asia', 'Europe', 'North America'] },
];

export async function seed(knex: Knex): Promise<void> {
  // Remove existing entries
  await knex('crops').del();

  const rows = crops.map((crop) => ({
    id: uuidv4(),
    name: crop.name,
    scientific_name: crop.scientific_name ?? null,
    category: crop.category ?? null,
    common_regions: crop.common_regions ?? [],
    is_active: true,
  }));

  await knex('crops').insert(rows);
}
