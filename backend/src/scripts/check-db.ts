import mongoose from 'mongoose';
import { config } from '../config/app.config';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.uri, config.mongoose.options);
    console.log('Connected to MongoDB. Model registered:', User.modelName);

    const orders = await Order.find({}).populate('user', 'name email').lean();
    console.log('--- Placed Orders ---');
    console.log(JSON.stringify(orders.map(o => ({
      id: o._id,
      email: (o.user as any).email,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      totals: o.totals
    })), null, 2));

    const products = await Product.find({ name: 'Nike Air Max Sneakers' }).lean();
    console.log('--- Product Stock ---');
    console.log(JSON.stringify(products.map(p => ({
      name: p.name,
      variants: p.variants.map(v => ({ sku: v.sku, size: v.size, color: v.color, stock: v.stock }))
    })), null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
};

run();
