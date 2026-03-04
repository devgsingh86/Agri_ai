import { Request, Response, NextFunction } from 'express';
import { CropsService } from '../services/crops.service';

const cropsService = new CropsService();

/**
 * GET /api/v1/crops
 * Returns paginated list of active crops with optional name search.
 */
export async function getCrops(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, limit = 20, offset = 0 } = req.query as {
      search?: string;
      limit?: number;
      offset?: number;
    };

    const result = await cropsService.listCrops({
      search: search as string | undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json({
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.data.length < result.total,
      },
    });
  } catch (err) {
    next(err);
  }
}
