import { getDb } from '../config/database';
import { Crop, CropModel } from '../models/Crop.model';

export interface CropQueryOptions {
  search?: string;
  limit: number;
  offset: number;
}

export interface CropListResult {
  data: CropModel[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Repository for crop reference data operations.
 */
export class CropsRepository {
  /**
   * Lists active crops with optional name search and pagination.
   */
  async findAll(options: CropQueryOptions): Promise<CropListResult> {
    const { search, limit, offset } = options;

    let query = Crop.query().where('is_active', true);
    let countQuery = Crop.query().where('is_active', true);

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query = query.whereRaw('LOWER(name) LIKE ?', [searchTerm]);
      countQuery = countQuery.whereRaw('LOWER(name) LIKE ?', [searchTerm]);
    }

    const [data, countResult] = await Promise.all([
      query.orderBy('name').limit(limit).offset(offset),
      countQuery.count('id as count').first(),
    ]);

    const total = parseInt((countResult as unknown as { count: string })?.count ?? '0', 10);

    return {
      data: data as CropModel[],
      total,
      limit,
      offset,
    };
  }

  /**
   * Finds a crop by its primary key.
   */
  async findById(id: string): Promise<CropModel | null> {
    const crop = await Crop.query().where('id', id).where('is_active', true).first();
    return (crop as CropModel | undefined) ?? null;
  }

  /**
   * Finds a crop by exact name (case-insensitive).
   */
  async findByName(name: string): Promise<CropModel | null> {
    const crop = await Crop.query()
      .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
      .where('is_active', true)
      .first();
    return (crop as CropModel | undefined) ?? null;
  }
}
