import mongoose from 'mongoose';
import Product from '../models/product.model';
import Category from '../models/category.model';
import Brand from '../models/brand.model';
import { ApiError } from '../utils/api-error';

export interface IProductFilters {
  category?: string;
  brand?: string;
  gender?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface IProductOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export class ProductService {
  /**
   * Create a new product
   */
  static async create(productData: any) {
    // Validate Category
    const category = await Category.findById(productData.category);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    if (!category.isActive) {
      throw ApiError.badRequest('Referenced category is inactive');
    }

    // Validate Brand
    const brand = await Brand.findById(productData.brand);
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }
    if (!brand.isActive) {
      throw ApiError.badRequest('Referenced brand is inactive');
    }

    const product = new Product(productData);
    await product.save();
    return product;
  }

  /**
   * List products with pagination, sorting, and filtering
   */
  static async list(filters: IProductFilters = {}, options: IProductOptions = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Number(options.limit) || 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Apply isActive filter
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Apply isFeatured filter
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    // Apply Gender filter
    if (filters.gender) {
      query.gender = filters.gender;
    }

    // Apply Category filter (handles slug or ID)
    if (filters.category) {
      if (mongoose.Types.ObjectId.isValid(filters.category)) {
        query.category = filters.category;
      } else {
        const cat = await Category.findOne({ slug: filters.category.toLowerCase() });
        if (!cat) {
          return { products: [], total: 0, page, limit, pages: 0 };
        }
        query.category = cat._id;
      }
    }

    // Apply Brand filter (handles slug or ID)
    if (filters.brand) {
      if (mongoose.Types.ObjectId.isValid(filters.brand)) {
        query.brand = filters.brand;
      } else {
        const br = await Brand.findOne({ slug: filters.brand.toLowerCase() });
        if (!br) {
          return { products: [], total: 0, page, limit, pages: 0 };
        }
        query.brand = br._id;
      }
    }

    // Apply Size filter (matches any variant containing the size)
    if (filters.size) {
      query['variants.size'] = filters.size;
    }

    // Apply Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query['variants.price'] = {};
      if (filters.minPrice !== undefined) {
        query['variants.price'].$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query['variants.price'].$lte = filters.maxPrice;
      }
    }

    // Apply Keyword Search filter (searches name and description)
    let isTextSearchUsed = false;
    if (filters.keyword) {
      const trimmedKeyword = filters.keyword.trim();
      const words = trimmedKeyword.split(/\s+/);
      
      // Hybrid approach: use regex for single short keywords (length < 4) to allow prefix/substring matching,
      // and use MongoDB Text Index search for longer phrases or multiple words to keep query high-performance.
      if (words.length === 1 && words[0].length < 4) {
        const searchRegex = new RegExp(trimmedKeyword, 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex }
        ];
      } else {
        query.$text = { $search: trimmedKeyword };
        isTextSearchUsed = true;
      }
    }

    // Define Sorting
    let sortQuery: any = { createdAt: -1 }; // Default: newest first
    if (options.sort) {
      switch (options.sort) {
        case 'priceAsc':
          sortQuery = { 'variants.price': 1 };
          break;
        case 'priceDesc':
          sortQuery = { 'variants.price': -1 };
          break;
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'ratings':
          sortQuery = { averageRating: -1 };
          break;
      }
    } else if (isTextSearchUsed) {
      sortQuery = { score: { $meta: 'textScore' } };
    }

    const projection = isTextSearchUsed ? { score: { $meta: 'textScore' } } : {};

    const [products, total] = await Promise.all([
      Product.find(query, projection)
        .populate('brand', 'name slug logoUrl')
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * Get product by slug
   */
  static async getBySlug(slug: string) {
    const product = await Product.findOne({ slug })
      .populate('brand', 'name slug logoUrl')
      .populate('category', 'name slug');
      
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  /**
   * Update product details
   */
  static async update(id: string, updateData: any) {
    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Validate Category if provided
    if (updateData.category && updateData.category !== product.category.toString()) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }
      if (!category.isActive) {
        throw ApiError.badRequest('Referenced category is inactive');
      }
    }

    // Validate Brand if provided
    if (updateData.brand && updateData.brand !== product.brand.toString()) {
      const brand = await Brand.findById(updateData.brand);
      if (!brand) {
        throw ApiError.notFound('Brand not found');
      }
      if (!brand.isActive) {
        throw ApiError.badRequest('Referenced brand is inactive');
      }
    }

    Object.assign(product, updateData);
    await product.save();

    // Populate references before returning
    await product.populate([
      { path: 'brand', select: 'name slug logoUrl' },
      { path: 'category', select: 'name slug' }
    ]);

    return product;
  }

  /**
   * Toggle Product active status
   */
  static async toggleActive(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    product.isActive = !product.isActive;
    await product.save();
    return product;
  }

  /**
   * Get related products (same brand or category, excluding self)
   */
  static async getRelated(id: string, limit = 4) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand }
      ]
    })
    .populate('brand', 'name slug logoUrl')
    .populate('category', 'name slug')
    .limit(limit);

    return related;
  }

  /**
   * Delete product by ID
   */
  static async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }
}
