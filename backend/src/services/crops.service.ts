import { CropsRepository, CropListResult, CropQueryOptions } from '../repositories/crops.repository';
import { logger } from '../utils/logger';

/**
 * Service layer for crop-related business logic.
 */
export class CropsService {
  constructor(private readonly repo: CropsRepository = new CropsRepository()) {}

  /**
   * Lists crops with optional search and pagination.
   * Only returns active crops.
   */
  async listCrops(options: CropQueryOptions): Promise<CropListResult> {
    const result = await this.repo.findAll(options);
    logger.debug('Crops listed', {
      search: options.search,
      total: result.total,
    });
    return result;
  }
}
