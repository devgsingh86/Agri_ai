/**
 * MandiPriceService — fetches and caches Mandi price data.
 *
 * Primary source: AGMARKNET API (data.gov.in) — requires AGMARKNET_API_KEY env var.
 * Fallback: rich mock dataset with realistic 2024-25 Indian Mandi prices,
 *           covering 21 crops × major state markets.
 *
 * Cache strategy: prices older than 24 h are refreshed on next request.
 */

import axios from 'axios';
import { Knex } from 'knex';
import { getDb } from '../config/database';

/** Lazy accessor so we don't call getDb() at module load time (before initDatabase). */
const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_t, prop) {
    return (getDb() as any)[prop];
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MandiPrice {
  id?: string;
  cropKey: string;
  commodity: string;
  state: string;
  district: string;
  market: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceDate: string; // YYYY-MM-DD
}

export interface PriceHistoryPoint {
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  market: string;
}

export interface MandiAlert {
  id: string;
  userId: string;
  cropKey: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

// ─── Crop key → AGMARKNET commodity name mapping ─────────────────────────────

const CROP_COMMODITY_MAP: Record<string, string> = {
  crop_wheat:      'Wheat',
  crop_rice:       'Paddy(Dhan)(Common)',
  crop_maize:      'Maize',
  crop_cotton:     'Cotton',
  crop_soybean:    'Soyabean',
  crop_sugarcane:  'Sugarcane',
  crop_tomato:     'Tomato',
  crop_potato:     'Potato',
  crop_onion:      'Onion',
  crop_chilli:     'Dry Chillies',
  crop_peanut:     'Groundnut',
  crop_mustard:    'Mustard',
  crop_lentil:     'Masur Dal',
  crop_chickpea:   'Gram',
  crop_tur_dal:    'Arhar (Tur/Red Gram)(Whole)',
  crop_bajra:      'Bajra(Pearl Millet/Cumbu)',
  crop_jowar:      'Jowar(Sorghum)',
  crop_watermelon: 'Water Melon',
  crop_moong:      'Moong (Whole)',
  crop_cucumber:   'Cucumber',
  crop_banana:     'Banana',
};

// ─── Realistic mock data ───────────────────────────────────────────────────────

/**
 * Returns mock prices for a given state, anchored around today's date.
 * Prices include realistic seasonal fluctuations.
 */
function buildMockPrices(state: string, crops: string[], days = 90): MandiPrice[] {
  const stateMandis: Record<string, { district: string; market: string }[]> = {
    'uttar pradesh': [
      { district: 'Agra',       market: 'Agra'         },
      { district: 'Lucknow',    market: 'Lucknow'      },
      { district: 'Kanpur',     market: 'Kanpur Nagar' },
      { district: 'Varanasi',   market: 'Varanasi'     },
    ],
    'punjab': [
      { district: 'Ludhiana',   market: 'Ludhiana'     },
      { district: 'Amritsar',   market: 'Amritsar'     },
      { district: 'Patiala',    market: 'Patiala'      },
    ],
    'maharashtra': [
      { district: 'Nashik',     market: 'Nashik'       },
      { district: 'Pune',       market: 'Pune'         },
      { district: 'Nagpur',     market: 'Nagpur'       },
    ],
    'rajasthan': [
      { district: 'Jaipur',     market: 'Jaipur'       },
      { district: 'Jodhpur',    market: 'Jodhpur'      },
    ],
    'bihar': [
      { district: 'Patna',      market: 'Patna'        },
      { district: 'Gaya',       market: 'Gaya'         },
    ],
  };

  const defaultMandis = [
    { district: 'District 1', market: 'Local Mandi 1' },
    { district: 'District 2', market: 'Local Mandi 2' },
  ];
  const mandis = stateMandis[state.toLowerCase()] ?? defaultMandis;

  // Base modal prices (₹/quintal) — 2024-25 reference
  const basePrices: Record<string, number> = {
    crop_wheat: 2275, crop_rice: 2300, crop_maize: 2090,
    crop_cotton: 6620, crop_soybean: 4892, crop_sugarcane: 315,
    crop_tomato: 2200, crop_potato: 1200, crop_onion: 1800,
    crop_chilli: 12000, crop_peanut: 6377, crop_mustard: 5650,
    crop_lentil: 6425, crop_chickpea: 5440, crop_tur_dal: 7000,
    crop_bajra: 2625, crop_jowar: 3180, crop_watermelon: 800,
    crop_moong: 8682, crop_cucumber: 900, crop_banana: 2500,
  };

  const results: MandiPrice[] = [];
  const today = new Date();

  for (const cropKey of crops) {
    const base = basePrices[cropKey] ?? 2000;
    const commodity = CROP_COMMODITY_MAP[cropKey] ?? cropKey;

    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];

      // Add seasonal trend + daily noise
      const trend = Math.sin((d / days) * Math.PI) * 0.08; // ±8% seasonal
      const noise = (Math.random() - 0.5) * 0.05;
      const modal = Math.round(base * (1 + trend + noise));
      const spread = Math.round(modal * 0.06);

      // Use only a subset of mandis for history to keep data manageable
      const mandi = mandis[d % mandis.length];

      results.push({
        cropKey,
        commodity,
        state,
        district: mandi.district,
        market: mandi.market,
        variety: 'Other',
        minPrice:   modal - spread,
        maxPrice:   modal + spread,
        modalPrice: modal,
        priceDate:  dateStr,
      });
    }
  }

  return results;
}

// ─── AGMARKNET API fetcher ─────────────────────────────────────────────────────

const AGMARKNET_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

async function fetchFromAgmarknet(
  state: string,
  commodity: string,
  limit = 500
): Promise<MandiPrice[]> {
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      limit: String(limit),
      'filters[State]': state,
      'filters[Commodity]': commodity,
    });

    const { data } = await axios.get(`${AGMARKNET_BASE}?${params}`, { timeout: 8000 });
    const records = data?.records ?? [];

    return records.map((r: Record<string, string>) => ({
      cropKey:    '', // resolved by caller
      commodity:  r.Commodity ?? commodity,
      state:      r.State ?? state,
      district:   r.District ?? '',
      market:     r.Market ?? '',
      variety:    r.Variety ?? 'Other',
      minPrice:   parseFloat(r.Min_x0020_Price ?? '0'),
      maxPrice:   parseFloat(r.Max_x0020_Price ?? '0'),
      modalPrice: parseFloat(r.Modal_x0020_Price ?? '0'),
      priceDate:  r.Arrival_Date ?? new Date().toISOString().split('T')[0],
    }));
  } catch {
    return [];
  }
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function isCacheStale(state: string, cropKey: string): Promise<boolean> {
  const latest = await db('mandi_prices')
    .where({ state: state.toLowerCase(), crop_key: cropKey })
    .orderBy('price_date', 'desc')
    .first();

  if (!latest) return true;

  const latestDate = new Date(latest.price_date);
  const yesterday  = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return latestDate < yesterday;
}

async function insertPrices(prices: MandiPrice[], knexTx?: Knex): Promise<void> {
  const client = knexTx ?? db;
  if (!prices.length) return;

  const rows = prices.map((p) => ({
    crop_key:    p.cropKey,
    commodity:   p.commodity,
    state:       p.state.toLowerCase(),
    district:    p.district,
    market:      p.market,
    variety:     p.variety,
    min_price:   p.minPrice,
    max_price:   p.maxPrice,
    modal_price: p.modalPrice,
    price_date:  p.priceDate,
  }));

  // Upsert: skip duplicates on (crop_key, market, price_date)
  await client.raw(
    `INSERT INTO mandi_prices (crop_key, commodity, state, district, market, variety,
       min_price, max_price, modal_price, price_date)
     SELECT crop_key, commodity, state, district, market, variety,
       min_price, max_price, modal_price, price_date
     FROM json_populate_recordset(null::mandi_prices, ?)
     ON CONFLICT DO NOTHING`,
    [JSON.stringify(rows)]
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the latest prices for each given crop in the user's state.
 * Refreshes from AGMARKNET (or mock) if cache is stale.
 */
export async function getLatestPrices(state: string, cropKeys: string[]): Promise<MandiPrice[]> {
  const stateNorm = state.toLowerCase();

  // Refresh stale crops
  const staleCrops: string[] = [];
  for (const ck of cropKeys) {
    if (await isCacheStale(stateNorm, ck)) staleCrops.push(ck);
  }

  if (staleCrops.length > 0) {
    // Try AGMARKNET; fall back to mock
    let freshPrices: MandiPrice[] = [];
    for (const ck of staleCrops) {
      const commodity = CROP_COMMODITY_MAP[ck];
      if (commodity) {
        const apiPrices = await fetchFromAgmarknet(stateNorm, commodity);
        if (apiPrices.length > 0) {
          freshPrices.push(...apiPrices.map((p) => ({ ...p, cropKey: ck })));
        }
      }
    }
    if (freshPrices.length === 0) {
      freshPrices = buildMockPrices(state, staleCrops, 90);
    }
    await insertPrices(freshPrices).catch(() => null); // non-blocking
  }

  // Query DB for latest price per crop
  const results: MandiPrice[] = [];
  for (const ck of cropKeys) {
    const rows = await db('mandi_prices')
      .where({ crop_key: ck, state: stateNorm })
      .orderBy('price_date', 'desc')
      .limit(4); // latest date, up to 4 mandis

    for (const r of rows) {
      results.push({
        id:         r.id,
        cropKey:    r.crop_key,
        commodity:  r.commodity,
        state:      r.state,
        district:   r.district,
        market:     r.market,
        variety:    r.variety,
        minPrice:   Number(r.min_price),
        maxPrice:   Number(r.max_price),
        modalPrice: Number(r.modal_price),
        priceDate:  r.price_date,
      });
    }
  }

  return results;
}

/**
 * Returns 90-day daily price history for a crop in the given state.
 */
export async function getPriceHistory(state: string, cropKey: string): Promise<PriceHistoryPoint[]> {
  const stateNorm = state.toLowerCase();

  if (await isCacheStale(stateNorm, cropKey)) {
    const apiPrices = await fetchFromAgmarknet(stateNorm, CROP_COMMODITY_MAP[cropKey] ?? '');
    const freshPrices = apiPrices.length > 0
      ? apiPrices.map((p) => ({ ...p, cropKey }))
      : buildMockPrices(state, [cropKey], 90);
    await insertPrices(freshPrices).catch(() => null);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const rows = await db('mandi_prices')
    .where({ crop_key: cropKey, state: stateNorm })
    .where('price_date', '>=', cutoff.toISOString().split('T')[0])
    .orderBy('price_date', 'asc')
    .select(
      db.raw('price_date::text'),
      db.raw('MIN(min_price) AS min_price'),
      db.raw('MAX(max_price) AS max_price'),
      db.raw('ROUND(AVG(modal_price)::numeric, 0) AS modal_price'),
      'market'
    )
    .groupBy('price_date', 'market')
    .orderBy('price_date');

  return rows.map((r: any) => ({
    date:       r.price_date,
    minPrice:   Number(r.min_price),
    maxPrice:   Number(r.max_price),
    modalPrice: Number(r.modal_price),
    market:     r.market,
  }));
}

/**
 * Returns price comparison across all Mandis for a crop in a state.
 */
export async function getMandiComparison(state: string, cropKey: string): Promise<MandiPrice[]> {
  const stateNorm = state.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  const rows = await db('mandi_prices')
    .where({ crop_key: cropKey, state: stateNorm })
    .where('price_date', '>=', db.raw(`CURRENT_DATE - INTERVAL '3 days'`))
    .orderBy('modal_price', 'desc')
    .limit(20);

  if (rows.length === 0) {
    // Seed fresh data then retry
    const freshPrices = buildMockPrices(state, [cropKey], 3);
    await insertPrices(freshPrices).catch(() => null);
    const retry = await db('mandi_prices')
      .where({ crop_key: cropKey, state: stateNorm })
      .orderBy('modal_price', 'desc')
      .limit(20);
    return retry.map((r: any) => ({
      id: r.id, cropKey: r.crop_key, commodity: r.commodity,
      state: r.state, district: r.district, market: r.market,
      variety: r.variety, minPrice: Number(r.min_price),
      maxPrice: Number(r.max_price), modalPrice: Number(r.modal_price),
      priceDate: r.price_date,
    }));
  }

  return rows.map((r: any) => ({
    id: r.id, cropKey: r.crop_key, commodity: r.commodity,
    state: r.state, district: r.district, market: r.market,
    variety: r.variety, minPrice: Number(r.min_price),
    maxPrice: Number(r.max_price), modalPrice: Number(r.modal_price),
    priceDate: r.price_date,
  }));
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts(userId: string): Promise<MandiAlert[]> {
  const rows = await db('mandi_alerts')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc');
  return rows.map(rowToAlert);
}

export async function createAlert(
  userId: string,
  cropKey: string,
  targetPrice: number,
  direction: 'above' | 'below'
): Promise<MandiAlert> {
  const [row] = await db('mandi_alerts')
    .insert({ user_id: userId, crop_key: cropKey, target_price: targetPrice, direction })
    .returning('*');
  return rowToAlert(row);
}

export async function deleteAlert(userId: string, alertId: string): Promise<void> {
  await db('mandi_alerts').where({ id: alertId, user_id: userId }).delete();
}

function rowToAlert(r: Record<string, unknown>): MandiAlert {
  return {
    id:           String(r.id),
    userId:       String(r.user_id),
    cropKey:      String(r.crop_key),
    targetPrice:  Number(r.target_price),
    direction:    r.direction as 'above' | 'below',
    isActive:     Boolean(r.is_active),
    triggeredAt:  r.triggered_at ? String(r.triggered_at) : null,
    createdAt:    String(r.created_at),
  };
}
