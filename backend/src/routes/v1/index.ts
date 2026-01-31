import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import adminProductRoutes from './admin/product.routes';
import adminCategoryRoutes from './admin/category.routes';
import adminOrderRoutes from './admin/order.routes';
import storageRoutes from './storage.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// User routes (require authentication)
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// Admin routes (require admin authentication)
router.use('/admin/products', adminProductRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/storage', storageRoutes);

export default router;
