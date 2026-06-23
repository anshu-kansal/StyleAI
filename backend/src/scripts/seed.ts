import mongoose from 'mongoose';
import { config } from '../config/app.config';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Brand } from '../models/brand.model';
import { Product } from '../models/product.model';
import { UserRole, ProductGender, ProductSize } from '../constants/enums';
import { logger } from '../utils/logger';

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await mongoose.connect(config.mongoose.uri, config.mongoose.options);
    logger.info('Connected to MongoDB.');

    // Clear existing data
    logger.warn('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
    ]);
    logger.info('Collections cleared.');

    // 1. Seed Users
    logger.info('Seeding users...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@styleai.com',
      passwordHash: 'admin123',
      roles: [UserRole.ADMIN],
    });

    const regularUser = new User({
      name: 'John Doe',
      email: 'john@styleai.com',
      passwordHash: 'user123',
      roles: [UserRole.USER],
    });

    await Promise.all([adminUser.save(), regularUser.save()]);
    logger.info('Users seeded.');

    // 2. Seed Categories
    logger.info('Seeding categories...');
    const categories = [
      { name: 'Apparel', description: 'Trendy and elegant fashion apparel', isActive: true },
      { name: 'Footwear', description: 'Premium collection of shoes and sneakers', isActive: true },
      { name: 'Accessories', description: 'Complete your look with our modern accessories', isActive: true },
    ];

    const seededCategories = await Category.insertMany(categories);
    const [apparel, footwear, accessories] = seededCategories;
    logger.info('Categories seeded.');

    // 3. Seed Brands
    logger.info('Seeding brands...');
    const brands = [
      {
        name: 'Nike',
        description: 'Just Do It - Nike athletic brand',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1612345678/nike_logo.png',
        isActive: true,
      },
      {
        name: 'Adidas',
        description: 'Impossible is Nothing - Adidas brand',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas_logo.png',
        isActive: true,
      },
      {
        name: 'Zara',
        description: 'Fast fashion and sleek styles from Zara',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1612345678/zara_logo.png',
        isActive: true,
      },
    ];

    const seededBrands = await Brand.insertMany(brands);
    const [nike, adidas, zara] = seededBrands;
    logger.info('Brands seeded.');

    // 4. Seed Products
    logger.info('Seeding products...');
    const productsData = [
      {
        name: 'Nike Air Max Sneakers',
        description: 'Iconic sporty look meets supreme underfoot comfort with the classic Nike Air Max series.',
        brand: nike._id,
        category: footwear._id,
        gender: ProductGender.UNISEX,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
        variants: [
          {
            sku: 'NK-AM-BLK-S',
            size: ProductSize.S,
            color: 'Black',
            price: 120,
            originalPrice: 150,
            stock: 15,
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
          },
          {
            sku: 'NK-AM-BLK-M',
            size: ProductSize.M,
            color: 'Black',
            price: 120,
            originalPrice: 150,
            stock: 20,
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
          },
        ],
        isActive: true,
        isFeatured: true,
        averageRating: 4.8,
        numReviews: 24,
      },
      {
        name: 'Nike Sportswear Hoodie',
        description: 'Warm and lightweight fleece hoodie, perfect for workouts or casual loungewear.',
        brand: nike._id,
        category: apparel._id,
        gender: ProductGender.MEN,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7'],
        variants: [
          {
            sku: 'NK-HD-GRY-S',
            size: ProductSize.S,
            color: 'Grey',
            price: 65,
            originalPrice: 80,
            stock: 10,
          },
          {
            sku: 'NK-HD-GRY-M',
            size: ProductSize.M,
            color: 'Grey',
            price: 65,
            originalPrice: 80,
            stock: 25,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.5,
        numReviews: 12,
      },
      {
        name: 'Adidas Ultraboost Shoes',
        description: 'Responsive boost cushioning combined with a flexible Primeknit upper for top-tier runs.',
        brand: adidas._id,
        category: footwear._id,
        gender: ProductGender.UNISEX,
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a'],
        variants: [
          {
            sku: 'AD-UB-WHT-M',
            size: ProductSize.M,
            color: 'White',
            price: 180,
            originalPrice: 200,
            stock: 8,
          },
          {
            sku: 'AD-UB-WHT-L',
            size: ProductSize.L,
            color: 'White',
            price: 180,
            originalPrice: 200,
            stock: 12,
          },
        ],
        isActive: true,
        isFeatured: true,
        averageRating: 4.9,
        numReviews: 45,
      },
      {
        name: 'Adidas Classic Tracksuit',
        description: 'Timeless retro design features the signature 3-stripes layout on premium tricot fabric.',
        brand: adidas._id,
        category: apparel._id,
        gender: ProductGender.WOMEN,
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'],
        variants: [
          {
            sku: 'AD-TS-BLK-S',
            size: ProductSize.S,
            color: 'Black',
            price: 85,
            originalPrice: 100,
            stock: 12,
          },
          {
            sku: 'AD-TS-BLK-M',
            size: ProductSize.M,
            color: 'Black',
            price: 85,
            originalPrice: 100,
            stock: 14,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.4,
        numReviews: 18,
      },
      {
        name: 'Zara Slim Fit Blazer',
        description: 'Sleek structural design featuring a classic lapel neckline and front single-button closure.',
        brand: zara._id,
        category: apparel._id,
        gender: ProductGender.MEN,
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf'],
        variants: [
          {
            sku: 'ZR-BLZ-NVY-M',
            size: ProductSize.M,
            color: 'Navy Blue',
            price: 110,
            originalPrice: 140,
            stock: 5,
          },
          {
            sku: 'ZR-BLZ-NVY-L',
            size: ProductSize.L,
            color: 'Navy Blue',
            price: 110,
            originalPrice: 140,
            stock: 7,
          },
        ],
        isActive: true,
        isFeatured: true,
        averageRating: 4.6,
        numReviews: 9,
      },
      {
        name: 'Zara Linen Summer Dress',
        description: 'Flattering breathable linen dress designed with delicate straps and a flared hemline.',
        brand: zara._id,
        category: apparel._id,
        gender: ProductGender.WOMEN,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8'],
        variants: [
          {
            sku: 'ZR-DRS-WHT-S',
            size: ProductSize.S,
            color: 'White',
            price: 49.99,
            originalPrice: 59.99,
            stock: 10,
          },
          {
            sku: 'ZR-DRS-WHT-M',
            size: ProductSize.M,
            color: 'White',
            price: 49.99,
            originalPrice: 59.99,
            stock: 15,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.3,
        numReviews: 15,
      },
      {
        name: 'Zara Leather Crossbody Bag',
        description: 'Genuine leather handbag featuring a magnetic closure flap and adjustable shoulder strap.',
        brand: zara._id,
        category: accessories._id,
        gender: ProductGender.WOMEN,
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa'],
        variants: [
          {
            sku: 'ZR-BAG-BRN-M',
            size: ProductSize.M,
            color: 'Brown',
            price: 39.99,
            stock: 30,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.7,
        numReviews: 11,
      },
      {
        name: 'Nike Heritage Backpack',
        description: 'Durable construction meets ample space featuring dual zippered compartments.',
        brand: nike._id,
        category: accessories._id,
        gender: ProductGender.UNISEX,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62'],
        variants: [
          {
            sku: 'NK-BP-BLK-M',
            size: ProductSize.M,
            color: 'Black',
            price: 35,
            originalPrice: 45,
            stock: 50,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.5,
        numReviews: 32,
      },
      {
        name: 'Adidas Superlite Cap',
        description: 'Lightweight six-panel cap designed with mesh breathable inserts and a velcro strap back.',
        brand: adidas._id,
        category: accessories._id,
        gender: ProductGender.UNISEX,
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b'],
        variants: [
          {
            sku: 'AD-CP-WHT-S',
            size: ProductSize.S,
            color: 'White',
            price: 20,
            originalPrice: 25,
            stock: 40,
          },
        ],
        isActive: true,
        isFeatured: false,
        averageRating: 4.6,
        numReviews: 14,
      },
      {
        name: 'Zara Wool Trench Coat',
        description: 'Premium soft heavy wool blend longline trench coat featuring double-breasted lapels.',
        brand: zara._id,
        category: apparel._id,
        gender: ProductGender.WOMEN,
        images: ['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3'],
        variants: [
          {
            sku: 'ZR-COAT-CAM-S',
            size: ProductSize.S,
            color: 'Camel',
            price: 159.99,
            originalPrice: 199.99,
            stock: 4,
          },
          {
            sku: 'ZR-COAT-CAM-M',
            size: ProductSize.M,
            color: 'Camel',
            price: 159.99,
            originalPrice: 199.99,
            stock: 6,
          },
        ],
        isActive: true,
        isFeatured: true,
        averageRating: 4.9,
        numReviews: 8,
      },
    ];

    for (const prodData of productsData) {
      const product = new Product(prodData);
      await product.save();
    }
    logger.info('Products seeded successfully.');

    mongoose.connection.close();
    logger.info('Database connection closed. Seeding process complete.');
    process.exit(0);
  } catch (error: any) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
