import { Request, Response, NextFunction } from 'express';
import { getProfitabilityRanking, Season, WaterReq, SoilType } from '../services/profitability.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const profileRepo = new ProfileRepository();

/**
 * GET /api/v1/profitability
 * Returns crops ranked by projected net profit per acre for the farmer's location.
 *
 * Query params:
 *   season   = kharif | rabi | zaid | all  (default: all)
 *   water    = low | medium | high | all   (default: all)
 *   soil     = alluvial | black | red | loamy | sandy | clayey | all (default: all)
 */
export async function getProfitability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const profile = await profileRepo.findByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: 'Not Found', message: 'Farm profile not found. Complete your profile first.' });
      return;
    }

    const state = profile.state ?? 'unknown';

    // Determine farm size in acres
    let farmSizeAcres = parseFloat(String(profile.farm_size ?? 1));
    if (profile.farm_size_unit === 'hectares') {
      farmSizeAcres = farmSizeAcres * 2.47105;
    }

    const season  = (['kharif', 'rabi', 'zaid', 'all'].includes(req.query.season as string)
      ? req.query.season : 'all') as Season;
    const water   = (['low', 'medium', 'high', 'all'].includes(req.query.water as string)
      ? req.query.water : 'all') as WaterReq | 'all';
    const soil    = (['alluvial', 'black', 'red', 'loamy', 'sandy', 'clayey', 'all'].includes(req.query.soil as string)
      ? req.query.soil : 'all') as SoilType | 'all';

    const result = getProfitabilityRanking({ state, farmSizeAcres, season, waterFilter: water, soilFilter: soil });

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
