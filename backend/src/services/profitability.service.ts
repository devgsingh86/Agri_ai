/**
 * ProfitabilityService — ranks crops by projected net profit per acre.
 *
 * Data model uses realistic 2024-25 MSP / Mandi reference prices and
 * ICAR-sourced yield estimates for Indian agro-climatic zones.
 * State-level price multipliers capture regional Mandi variation.
 */

export type Season = 'kharif' | 'rabi' | 'zaid' | 'all';
export type WaterReq = 'low' | 'medium' | 'high';
export type SoilType = 'alluvial' | 'black' | 'red' | 'loamy' | 'sandy' | 'clayey';

export interface CostBreakdown {
  seed: number;
  fertilizer: number;
  labour: number;
  irrigation: number;
  total: number;
}

export interface ProfitabilityCrop {
  cropKey: string;          // maps to i18n key, e.g. "crop_wheat"
  season: Exclude<Season, 'all'>;
  yieldPerAcre: number;     // quintals
  mandiPrice: number;       // ₹/quintal (state-adjusted)
  revenuePerAcre: number;   // ₹
  costBreakdown: CostBreakdown;
  netProfitPerAcre: number; // ₹
  roi: number;              // percentage
  waterRequirement: WaterReq;
  soilTypes: SoilType[];
}

export interface ProfitabilityResult {
  crops: ProfitabilityCrop[];
  state: string;
  farmSizeAcres: number;
  season: Season;
  generatedAt: string;
}

// ─── Raw Crop Definitions ─────────────────────────────────────────────────────

interface RawCrop {
  cropKey: string;
  season: Exclude<Season, 'all'>;
  baseMandiPrice: number;   // ₹/quintal (national reference)
  yieldPerAcre: number;     // quintals (avg)
  costs: Omit<CostBreakdown, 'total'>;
  waterRequirement: WaterReq;
  soilTypes: SoilType[];
  primaryStates: string[];  // canonical state names (lowercase)
}

const RAW_CROPS: RawCrop[] = [
  // ── Kharif ────────────────────────────────────────────────────────────────
  {
    cropKey: 'crop_rice',
    season: 'kharif',
    baseMandiPrice: 2300,
    yieldPerAcre: 20,
    costs: { seed: 800, fertilizer: 4500, labour: 6000, irrigation: 3000 },
    waterRequirement: 'high',
    soilTypes: ['alluvial', 'clayey', 'loamy'],
    primaryStates: ['west bengal', 'uttar pradesh', 'punjab', 'andhra pradesh', 'telangana', 'tamil nadu', 'bihar', 'odisha', 'chhattisgarh', 'assam'],
  },
  {
    cropKey: 'crop_maize',
    season: 'kharif',
    baseMandiPrice: 2090,
    yieldPerAcre: 23,
    costs: { seed: 1200, fertilizer: 3500, labour: 4500, irrigation: 2000 },
    waterRequirement: 'medium',
    soilTypes: ['loamy', 'red', 'alluvial'],
    primaryStates: ['karnataka', 'andhra pradesh', 'telangana', 'rajasthan', 'madhya pradesh', 'uttar pradesh', 'bihar', 'himachal pradesh'],
  },
  {
    cropKey: 'crop_cotton',
    season: 'kharif',
    baseMandiPrice: 7121,
    yieldPerAcre: 10,
    costs: { seed: 1800, fertilizer: 5000, labour: 8000, irrigation: 2500 },
    waterRequirement: 'medium',
    soilTypes: ['black', 'alluvial'],
    primaryStates: ['gujarat', 'maharashtra', 'andhra pradesh', 'telangana', 'haryana', 'punjab', 'madhya pradesh', 'rajasthan'],
  },
  {
    cropKey: 'crop_sugarcane',
    season: 'kharif',
    baseMandiPrice: 340,
    yieldPerAcre: 350,
    costs: { seed: 5000, fertilizer: 8000, labour: 12000, irrigation: 6000 },
    waterRequirement: 'high',
    soilTypes: ['alluvial', 'loamy', 'black'],
    primaryStates: ['uttar pradesh', 'maharashtra', 'karnataka', 'tamil nadu', 'andhra pradesh', 'telangana', 'bihar', 'punjab'],
  },
  {
    cropKey: 'crop_soybean',
    season: 'kharif',
    baseMandiPrice: 4892,
    yieldPerAcre: 12,
    costs: { seed: 2000, fertilizer: 3000, labour: 4000, irrigation: 1500 },
    waterRequirement: 'medium',
    soilTypes: ['black', 'loamy'],
    primaryStates: ['madhya pradesh', 'maharashtra', 'rajasthan', 'chhattisgarh', 'karnataka'],
  },
  {
    cropKey: 'crop_groundnut',
    season: 'kharif',
    baseMandiPrice: 6783,
    yieldPerAcre: 13,
    costs: { seed: 3500, fertilizer: 2500, labour: 5000, irrigation: 1000 },
    waterRequirement: 'low',
    soilTypes: ['sandy', 'loamy', 'red'],
    primaryStates: ['gujarat', 'andhra pradesh', 'telangana', 'rajasthan', 'tamil nadu', 'karnataka', 'maharashtra'],
  },
  {
    cropKey: 'crop_tur_dal',
    season: 'kharif',
    baseMandiPrice: 7550,
    yieldPerAcre: 7,
    costs: { seed: 1200, fertilizer: 1800, labour: 4000, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['black', 'red', 'alluvial'],
    primaryStates: ['maharashtra', 'madhya pradesh', 'karnataka', 'andhra pradesh', 'telangana', 'uttar pradesh', 'gujarat'],
  },
  {
    cropKey: 'crop_bajra',
    season: 'kharif',
    baseMandiPrice: 2625,
    yieldPerAcre: 14,
    costs: { seed: 600, fertilizer: 2000, labour: 3500, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['sandy', 'loamy', 'red'],
    primaryStates: ['rajasthan', 'uttar pradesh', 'haryana', 'gujarat', 'madhya pradesh', 'maharashtra'],
  },
  {
    cropKey: 'crop_jowar',
    season: 'kharif',
    baseMandiPrice: 3371,
    yieldPerAcre: 13,
    costs: { seed: 700, fertilizer: 2000, labour: 3500, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['black', 'sandy', 'red'],
    primaryStates: ['maharashtra', 'karnataka', 'rajasthan', 'madhya pradesh', 'andhra pradesh', 'telangana'],
  },
  {
    cropKey: 'crop_onion',
    season: 'kharif',
    baseMandiPrice: 1800,
    yieldPerAcre: 55,
    costs: { seed: 2500, fertilizer: 4000, labour: 8000, irrigation: 3500 },
    waterRequirement: 'medium',
    soilTypes: ['loamy', 'alluvial', 'sandy'],
    primaryStates: ['maharashtra', 'madhya pradesh', 'karnataka', 'gujarat', 'rajasthan', 'andhra pradesh'],
  },

  // ── Rabi ──────────────────────────────────────────────────────────────────
  {
    cropKey: 'crop_wheat',
    season: 'rabi',
    baseMandiPrice: 2275,
    yieldPerAcre: 18,
    costs: { seed: 1200, fertilizer: 4000, labour: 4500, irrigation: 2500 },
    waterRequirement: 'medium',
    soilTypes: ['alluvial', 'loamy', 'clayey'],
    primaryStates: ['punjab', 'haryana', 'uttar pradesh', 'madhya pradesh', 'rajasthan', 'bihar', 'uttarakhand'],
  },
  {
    cropKey: 'crop_chickpea',
    season: 'rabi',
    baseMandiPrice: 5440,
    yieldPerAcre: 10,
    costs: { seed: 1800, fertilizer: 1500, labour: 3500, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['black', 'loamy', 'alluvial'],
    primaryStates: ['madhya pradesh', 'rajasthan', 'uttar pradesh', 'maharashtra', 'andhra pradesh', 'karnataka'],
  },
  {
    cropKey: 'crop_mustard',
    season: 'rabi',
    baseMandiPrice: 5650,
    yieldPerAcre: 10,
    costs: { seed: 600, fertilizer: 2500, labour: 3000, irrigation: 1000 },
    waterRequirement: 'low',
    soilTypes: ['alluvial', 'loamy', 'sandy'],
    primaryStates: ['rajasthan', 'uttar pradesh', 'haryana', 'madhya pradesh', 'punjab', 'west bengal'],
  },
  {
    cropKey: 'crop_barley',
    season: 'rabi',
    baseMandiPrice: 1848,
    yieldPerAcre: 17,
    costs: { seed: 800, fertilizer: 2000, labour: 3000, irrigation: 1000 },
    waterRequirement: 'low',
    soilTypes: ['alluvial', 'loamy', 'sandy'],
    primaryStates: ['rajasthan', 'uttar pradesh', 'haryana', 'madhya pradesh', 'punjab'],
  },
  {
    cropKey: 'crop_lentil',
    season: 'rabi',
    baseMandiPrice: 6425,
    yieldPerAcre: 8,
    costs: { seed: 1500, fertilizer: 1500, labour: 3000, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['loamy', 'clayey', 'alluvial'],
    primaryStates: ['madhya pradesh', 'uttar pradesh', 'bihar', 'west bengal', 'rajasthan'],
  },
  {
    cropKey: 'crop_potato',
    season: 'rabi',
    baseMandiPrice: 2000,
    yieldPerAcre: 100,
    costs: { seed: 8000, fertilizer: 6000, labour: 8000, irrigation: 4000 },
    waterRequirement: 'high',
    soilTypes: ['alluvial', 'loamy', 'sandy'],
    primaryStates: ['uttar pradesh', 'west bengal', 'bihar', 'gujarat', 'punjab', 'madhya pradesh'],
  },
  {
    cropKey: 'crop_tomato',
    season: 'rabi',
    baseMandiPrice: 2800,
    yieldPerAcre: 70,
    costs: { seed: 3000, fertilizer: 5000, labour: 10000, irrigation: 4000 },
    waterRequirement: 'medium',
    soilTypes: ['loamy', 'alluvial', 'red'],
    primaryStates: ['andhra pradesh', 'telangana', 'karnataka', 'maharashtra', 'madhya pradesh', 'gujarat', 'uttar pradesh'],
  },

  // ── Zaid ──────────────────────────────────────────────────────────────────
  {
    cropKey: 'crop_watermelon',
    season: 'zaid',
    baseMandiPrice: 1500,
    yieldPerAcre: 120,
    costs: { seed: 2000, fertilizer: 3000, labour: 6000, irrigation: 2000 },
    waterRequirement: 'low',
    soilTypes: ['sandy', 'loamy'],
    primaryStates: ['uttar pradesh', 'rajasthan', 'andhra pradesh', 'karnataka', 'madhya pradesh'],
  },
  {
    cropKey: 'crop_moong',
    season: 'zaid',
    baseMandiPrice: 8682,
    yieldPerAcre: 6,
    costs: { seed: 1500, fertilizer: 1200, labour: 3000, irrigation: 500 },
    waterRequirement: 'low',
    soilTypes: ['loamy', 'sandy', 'alluvial'],
    primaryStates: ['rajasthan', 'uttar pradesh', 'madhya pradesh', 'andhra pradesh', 'telangana', 'maharashtra'],
  },
  {
    cropKey: 'crop_sunflower',
    season: 'zaid',
    baseMandiPrice: 7280,
    yieldPerAcre: 10,
    costs: { seed: 1000, fertilizer: 2500, labour: 3500, irrigation: 1500 },
    waterRequirement: 'low',
    soilTypes: ['alluvial', 'loamy', 'red'],
    primaryStates: ['karnataka', 'andhra pradesh', 'telangana', 'maharashtra', 'madhya pradesh'],
  },
  {
    cropKey: 'crop_cucumber',
    season: 'zaid',
    baseMandiPrice: 1200,
    yieldPerAcre: 80,
    costs: { seed: 1500, fertilizer: 3000, labour: 7000, irrigation: 2500 },
    waterRequirement: 'medium',
    soilTypes: ['loamy', 'sandy', 'alluvial'],
    primaryStates: ['uttar pradesh', 'bihar', 'west bengal', 'andhra pradesh', 'karnataka'],
  },
];

// ─── State price multipliers (Mandi prices vary regionally) ──────────────────

const STATE_PRICE_MULTIPLIER: Record<string, number> = {
  punjab: 1.05,
  haryana: 1.04,
  'uttar pradesh': 0.98,
  'madhya pradesh': 0.97,
  rajasthan: 0.96,
  maharashtra: 1.02,
  gujarat: 1.03,
  karnataka: 1.01,
  'andhra pradesh': 1.00,
  telangana: 1.00,
  'west bengal': 0.96,
  bihar: 0.95,
  odisha: 0.94,
  chhattisgarh: 0.95,
  'tamil nadu': 1.01,
  kerala: 1.06,
  assam: 0.93,
  jharkhand: 0.94,
  uttarakhand: 0.97,
  'himachal pradesh': 1.00,
};

function getStateMultiplier(state: string): number {
  const key = state.toLowerCase().trim();
  return STATE_PRICE_MULTIPLIER[key] ?? 1.0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ProfitabilityOptions {
  state: string;
  farmSizeAcres: number;
  season: Season;
  waterFilter?: WaterReq | 'all';
  soilFilter?: SoilType | 'all';
}

/**
 * Returns crops ranked by projected net profit per acre, filtered and
 * adjusted for the farmer's state, season preference, and resource availability.
 */
export function getProfitabilityRanking(opts: ProfitabilityOptions): ProfitabilityResult {
  const { state, farmSizeAcres, season, waterFilter = 'all', soilFilter = 'all' } = opts;
  const multiplier = getStateMultiplier(state);

  const results: ProfitabilityCrop[] = RAW_CROPS
    .filter((c) => season === 'all' || c.season === season)
    .filter((c) => waterFilter === 'all' || c.waterRequirement === waterFilter)
    .filter((c) => soilFilter === 'all' || c.soilTypes.includes(soilFilter as SoilType))
    .map((c) => {
      const mandiPrice = Math.round(c.baseMandiPrice * multiplier);
      const revenuePerAcre = Math.round(c.yieldPerAcre * mandiPrice);
      const total = c.costs.seed + c.costs.fertilizer + c.costs.labour + c.costs.irrigation;
      const netProfitPerAcre = revenuePerAcre - total;
      const roi = Math.round((netProfitPerAcre / total) * 100);

      return {
        cropKey: c.cropKey,
        season: c.season,
        yieldPerAcre: c.yieldPerAcre,
        mandiPrice,
        revenuePerAcre,
        costBreakdown: { ...c.costs, total },
        netProfitPerAcre,
        roi,
        waterRequirement: c.waterRequirement,
        soilTypes: c.soilTypes,
      };
    })
    .sort((a, b) => b.netProfitPerAcre - a.netProfitPerAcre);

  return {
    crops: results,
    state,
    farmSizeAcres,
    season,
    generatedAt: new Date().toISOString(),
  };
}
