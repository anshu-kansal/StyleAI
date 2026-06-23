import Category from '../models/category.model';
import { ApiError } from '../utils/api-error';

export class CategoryService {
  /**
   * Create a new category
   */
  static async create(categoryData: { name: string; description?: string; isActive?: boolean }) {
    const existing = await Category.findOne({ name: categoryData.name });
    if (existing) {
      throw ApiError.conflict('Category name already exists');
    }

    const category = new Category(categoryData);
    await category.save();
    return category;
  }

  /**
   * List all categories
   */
  static async list(filters: { isActive?: boolean } = {}) {
    const query: any = {};
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return Category.find(query).sort({ name: 1 });
  }

  /**
   * Get category by slug
   */
  static async getBySlug(slug: string) {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  /**
   * Update category details (ensures hooks run by fetching, updating, and saving)
   */
  static async update(
    id: string,
    updateData: { name?: string; description?: string; isActive?: boolean }
  ) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (updateData.name && updateData.name !== category.name) {
      const existing = await Category.findOne({ name: updateData.name });
      if (existing) {
        throw ApiError.conflict('Category name already exists');
      }
    }

    Object.assign(category, updateData);
    await category.save();
    return category;
  }

  /**
   * Toggle Category active status (soft delete / reactivate)
   */
  static async toggleActive(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    category.isActive = !category.isActive;
    await category.save();
    return category;
  }
}
