import Brand from '../models/brand.model';
import { ApiError } from '../utils/api-error';

export class BrandService {
  /**
   * Create a new brand
   */
  static async create(brandData: { name: string; description?: string; logoUrl?: string; isActive?: boolean }) {
    const existing = await Brand.findOne({ name: brandData.name });
    if (existing) {
      throw ApiError.conflict('Brand name already exists');
    }

    const brand = new Brand(brandData);
    await brand.save();
    return brand;
  }

  /**
   * List all brands
   */
  static async list(filters: { isActive?: boolean } = {}) {
    const query: any = {};
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return Brand.find(query).sort({ name: 1 });
  }

  /**
   * Get brand by slug
   */
  static async getBySlug(slug: string) {
    const brand = await Brand.findOne({ slug });
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }
    return brand;
  }

  /**
   * Update brand details
   */
  static async update(
    id: string,
    updateData: { name?: string; description?: string; logoUrl?: string; isActive?: boolean }
  ) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }

    if (updateData.name && updateData.name !== brand.name) {
      const existing = await Brand.findOne({ name: updateData.name });
      if (existing) {
        throw ApiError.conflict('Brand name already exists');
      }
    }

    Object.assign(brand, updateData);
    await brand.save();
    return brand;
  }

  /**
   * Toggle Brand active status
   */
  static async toggleActive(id: string) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }

    brand.isActive = !brand.isActive;
    await brand.save();
    return brand;
  }
}
