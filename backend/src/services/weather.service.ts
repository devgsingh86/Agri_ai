/**
 * WeatherService — fetches 7-day forecast from Open-Meteo (no API key required)
 * and generates crop-specific advisories based on the farmer's crop list.
 */

interface OpenMeteoResponse {
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    precipitation_probability_max: number[];
  };
  timezone: string;
}

export interface WeatherDay {
  date: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipProbability: number;
  windSpeed: number;
}

export interface CropAdvisory {
  type: 'warning' | 'info' | 'tip';
  message: string;
}

export interface WeatherForecast {
  timezone: string;
  days: WeatherDay[];
  advisories: CropAdvisory[];
  generatedAt: string;
}

/** Maps WMO weather codes to human-readable condition + emoji */
function decodeWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code === 1) return { condition: 'Mainly Clear', icon: '🌤️' };
  if (code === 2) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { condition: 'Overcast', icon: '☁️' };
  if (code <= 48) return { condition: 'Foggy', icon: '🌫️' };
  if (code <= 55) return { condition: 'Drizzle', icon: '🌦️' };
  if (code <= 65) return { condition: 'Rain', icon: '🌧️' };
  if (code <= 75) return { condition: 'Snow', icon: '❄️' };
  if (code <= 82) return { condition: 'Rain Showers', icon: '🌦️' };
  if (code <= 86) return { condition: 'Snow Showers', icon: '🌨️' };
  if (code === 95) return { condition: 'Thunderstorm', icon: '⛈️' };
  if (code >= 96) return { condition: 'Thunderstorm + Hail', icon: '⛈️' };
  return { condition: 'Unknown', icon: '🌡️' };
}

/** Crop categories for advisory logic */
const CEREAL_CROPS = ['wheat', 'rice', 'maize', 'corn', 'barley', 'millet', 'oats', 'sorghum'];
const LEGUME_CROPS = ['chickpea', 'lentil', 'soybean', 'groundnut', 'peanut', 'kidney bean', 'black-eyed'];
const CASH_CROPS   = ['cotton', 'sugarcane', 'tobacco', 'jute', 'coffee', 'tea'];
const VEG_CROPS    = ['tomato', 'potato', 'cabbage', 'carrot', 'onion', 'pepper'];
const FRUIT_CROPS  = ['mango', 'banana', 'apple', 'grapes', 'papaya', 'orange'];

function matchesCropGroup(cropNames: string[], group: string[]): boolean {
  return cropNames.some((name) =>
    group.some((keyword) => name.toLowerCase().includes(keyword))
  );
}

/**
 * Generates crop-aware advisories from the 7-day forecast summary.
 */
function buildAdvisories(days: WeatherDay[], cropNames: string[]): CropAdvisory[] {
  const advisories: CropAdvisory[] = [];
  const next3 = days.slice(0, 3);
  const next7 = days;

  const hasCereals  = matchesCropGroup(cropNames, CEREAL_CROPS);
  const hasLegumes  = matchesCropGroup(cropNames, LEGUME_CROPS);
  const hasCash     = matchesCropGroup(cropNames, CASH_CROPS);
  const hasVeg      = matchesCropGroup(cropNames, VEG_CROPS);
  const hasFruits   = matchesCropGroup(cropNames, FRUIT_CROPS);

  const totalRain7   = next7.reduce((s, d) => s + d.precipitation, 0);
  const maxRainDay   = Math.max(...next7.map((d) => d.precipitation));
  const hasThunder   = next7.some((d) => d.weatherCode >= 95);
  const hasFrost     = next7.some((d) => d.tempMin < 2);
  const highWindDays = next7.filter((d) => d.windSpeed > 40).length;
  const dryDays      = next7.filter((d) => d.precipitation < 1 && d.precipProbability < 20).length;
  const highRainDays = next7.filter((d) => d.precipitation > 20).length;
  const avgMaxTemp   = next7.reduce((s, d) => s + d.tempMax, 0) / next7.length;
  const clearDays    = next3.filter((d) => d.weatherCode <= 2).length;

  // ── Rain & flooding risk ──────────────────────────────────────────────────
  if (maxRainDay > 30) {
    advisories.push({
      type: 'warning',
      message: `Heavy rain expected (${maxRainDay.toFixed(0)}mm in one day). Ensure drainage channels are clear to prevent waterlogging.`,
    });
  }
  if (hasCereals && highRainDays >= 2) {
    advisories.push({
      type: 'warning',
      message: 'Prolonged wet conditions can trigger fungal diseases in cereals. Consider preventive fungicide application.',
    });
  }
  if (hasCash && cropNames.some((c) => c.toLowerCase().includes('cotton')) && highRainDays >= 2) {
    advisories.push({
      type: 'warning',
      message: 'Excess rain is harmful to cotton bolls. Monitor for boll rot and avoid waterlogged fields.',
    });
  }

  // ── Drought / irrigation ─────────────────────────────────────────────────
  if (dryDays >= 5 && totalRain7 < 5) {
    advisories.push({
      type: 'warning',
      message: `Dry week ahead (${totalRain7.toFixed(1)}mm total). Plan irrigation to prevent moisture stress.`,
    });
  }
  if (hasVeg && dryDays >= 3) {
    advisories.push({
      type: 'tip',
      message: 'Vegetables need consistent moisture. Increase irrigation frequency during the dry spell.',
    });
  }
  if (hasFruits && dryDays >= 4 && avgMaxTemp > 32) {
    advisories.push({
      type: 'tip',
      message: 'High temperatures combined with dry conditions can cause fruit drop. Mulch around trees to retain soil moisture.',
    });
  }

  // ── Frost ────────────────────────────────────────────────────────────────
  if (hasFrost) {
    if (hasVeg) {
      advisories.push({ type: 'warning', message: 'Near-freezing temperatures expected. Protect vegetable crops with row covers or mulch.' });
    }
    if (hasFruits) {
      advisories.push({ type: 'warning', message: 'Frost risk detected. Young fruit trees may need protection; avoid irrigation on frost nights.' });
    }
    if (hasLegumes) {
      advisories.push({ type: 'warning', message: 'Sub-zero temperatures can damage legume foliage. Consider covering sensitive plants.' });
    }
  }

  // ── Heat stress ───────────────────────────────────────────────────────────
  if (avgMaxTemp > 38) {
    advisories.push({
      type: 'warning',
      message: `Extreme heat forecast (avg max ${avgMaxTemp.toFixed(0)}°C). Avoid field work during peak hours (11am–3pm) and increase irrigation.`,
    });
  }
  if (hasCereals && avgMaxTemp > 35) {
    advisories.push({
      type: 'warning',
      message: 'High temperatures during grain-fill stage can reduce yield. Irrigate in early morning to cool crop canopy.',
    });
  }

  // ── Wind ─────────────────────────────────────────────────────────────────
  if (highWindDays > 0 && (hasCereals || hasFruits)) {
    advisories.push({
      type: 'warning',
      message: `Strong winds (>40 km/h) expected on ${highWindDays} day(s). Check staking/trellising for tall crops and fruit trees.`,
    });
  }

  // ── Thunderstorm ─────────────────────────────────────────────────────────
  if (hasThunder) {
    advisories.push({
      type: 'warning',
      message: 'Thunderstorms in the forecast. Avoid spraying pesticides or fertilisers 24 hours before predicted storms.',
    });
  }

  // ── Positive / planting tips ──────────────────────────────────────────────
  if (clearDays >= 2 && totalRain7 >= 10 && totalRain7 <= 40) {
    advisories.push({
      type: 'info',
      message: 'Favourable mix of sun and moderate rain. Good conditions for plant growth and field operations.',
    });
  }
  if (clearDays >= 2 && hasCereals && dryDays >= 2) {
    advisories.push({
      type: 'tip',
      message: 'Dry and sunny days ahead — ideal for harvesting or threshing cereals if ready.',
    });
  }
  if (hasLegumes && totalRain7 >= 15 && totalRain7 <= 35) {
    advisories.push({
      type: 'info',
      message: 'Moderate rainfall is ideal for legume root nodule development. A good week for your pulse crops.',
    });
  }

  // Fallback
  if (advisories.length === 0) {
    advisories.push({
      type: 'info',
      message: 'No significant weather risks this week. Continue regular crop monitoring and irrigation schedules.',
    });
  }

  return advisories;
}

/**
 * Fetches forecast from Open-Meteo and builds crop-aware advisories.
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  cropNames: string[]
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'windspeed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json() as OpenMeteoResponse;
  const { daily, timezone } = data;

  const days: WeatherDay[] = daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weathercode[i],
    ...decodeWeatherCode(daily.weathercode[i]),
    tempMax: Math.round(daily.temperature_2m_max[i]),
    tempMin: Math.round(daily.temperature_2m_min[i]),
    precipitation: Number((daily.precipitation_sum[i] ?? 0).toFixed(1)),
    precipProbability: daily.precipitation_probability_max[i] ?? 0,
    windSpeed: Math.round(daily.windspeed_10m_max[i] ?? 0),
  }));

  const advisories = buildAdvisories(days, cropNames);

  return {
    timezone,
    days,
    advisories,
    generatedAt: new Date().toISOString(),
  };
}
