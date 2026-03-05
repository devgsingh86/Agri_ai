import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ProfileRepository } from '../repositories/profile.repository';
import {
  getLatestPrices,
  getPriceHistory,
  getMandiComparison,
  getAlerts,
  createAlert,
  deleteAlert,
  VALID_CROP_KEYS,
} from '../services/mandi.service';

const profileRepo = new ProfileRepository();

// ─── Input helpers ────────────────────────────────────────────────────────────

/** Returns true if the string is a known, whitelisted crop key. */
function isValidCropKey(key: string): boolean {
  return VALID_CROP_KEYS.has(key);
}

// ─── Latest prices for the farmer's crops ─────────────────────────────────────

/**
 * GET /api/v1/mandi/prices
 * Returns latest Mandi prices for the farmer's registered crops.
 * Query: ?crops=crop_wheat,crop_rice  (optional override, max 10, whitelisted)
 */
export async function getMandiPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId  = (req as AuthenticatedRequest).user.id;
    const profile = await profileRepo.findByUserId(userId);
    if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

    const state = profile.state ?? 'uttar pradesh';

    // Use query param crops list, or fall back to farmer's registered crops
    let cropKeys: string[];
    if (req.query.crops) {
      const raw = String(req.query.crops).split(',').map((c) => c.trim()).filter(Boolean);
      cropKeys = [...new Set(raw)].slice(0, 10).filter(isValidCropKey);
      if (cropKeys.length === 0) {
        res.status(400).json({ error: 'No valid crop keys provided. Use known crop_* keys.' });
        return;
      }
    } else {
      const crops = profile.crops ?? [];
      cropKeys = crops.length > 0
        ? crops.map((c) => `crop_${c.crop_name.toLowerCase().replace(/\s+/g, '_')}`).filter(isValidCropKey)
        : ['crop_wheat', 'crop_rice', 'crop_potato', 'crop_onion', 'crop_tomato'];
    }

    const prices = await getLatestPrices(state, cropKeys);
    res.json({ data: { state, cropKeys, prices, syncedAt: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
}

// ─── 90-day history ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/mandi/history/:cropKey
 */
export async function getMandiHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId  = (req as AuthenticatedRequest).user.id;
    const profile = await profileRepo.findByUserId(userId);
    if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

    const cropKey = req.params.cropKey;
    if (!isValidCropKey(cropKey)) {
      res.status(400).json({ error: `Unknown crop key: ${cropKey}` });
      return;
    }

    const state   = profile.state ?? 'uttar pradesh';
    const history = await getPriceHistory(state, cropKey);
    res.json({ data: { state, cropKey, history } });
  } catch (err) {
    next(err);
  }
}

// ─── Multi-Mandi comparison ────────────────────────────────────────────────────

/**
 * GET /api/v1/mandi/comparison/:cropKey
 */
export async function getMandiComparisonCtrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId  = (req as AuthenticatedRequest).user.id;
    const profile = await profileRepo.findByUserId(userId);
    if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

    const cropKey = req.params.cropKey;
    if (!isValidCropKey(cropKey)) {
      res.status(400).json({ error: `Unknown crop key: ${cropKey}` });
      return;
    }

    const state   = profile.state ?? 'uttar pradesh';
    const mandis = await getMandiComparison(state, cropKey);
    res.json({ data: { state, cropKey, mandis } });
  } catch (err) {
    next(err);
  }
}

// ─── Price Alerts ─────────────────────────────────────────────────────────────

/** GET /api/v1/mandi/alerts */
export async function getMandiAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const alerts = await getAlerts(userId);
    res.json({ data: alerts });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v1/mandi/alerts */
export async function createMandiAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { cropKey, targetPrice, direction } = req.body;

    if (!cropKey || targetPrice === undefined || targetPrice === null || !direction) {
      res.status(400).json({ error: 'cropKey, targetPrice, and direction are required' });
      return;
    }
    if (!isValidCropKey(cropKey)) {
      res.status(400).json({ error: `Unknown crop key: ${cropKey}` });
      return;
    }
    if (!['above', 'below'].includes(direction)) {
      res.status(400).json({ error: 'direction must be "above" or "below"' });
      return;
    }
    const price = Number(targetPrice);
    if (!Number.isFinite(price) || price <= 0 || price > 9_999_999) {
      res.status(400).json({ error: 'targetPrice must be a positive number up to 9,999,999' });
      return;
    }

    const alert = await createAlert(userId, cropKey, price, direction);
    res.status(201).json({ data: alert });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/v1/mandi/alerts/:id */
export async function deleteMandiAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId  = (req as AuthenticatedRequest).user.id;
    const alertId = req.params.id;
    const deleted = await deleteAlert(userId, alertId);
    if (!deleted) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
