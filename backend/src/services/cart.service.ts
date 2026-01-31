import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Cart Service
 * Server-side cart management for stateless clients
 */

/**
 * Get or create cart for user
 */
export const getCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

/**
 * Add item to cart
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number = 1
) => {
  if (quantity < 1) {
    throw new ValidationError('Quantity must be at least 1');
  }

  // Verify product exists and is available
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    throw new NotFoundError('Product not found');
  }

  if (product.stock < quantity) {
    throw new ValidationError('Insufficient stock');
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new ValidationError('Insufficient stock');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCart(userId);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  if (quantity < 1) {
    throw new ValidationError('Quantity must be at least 1');
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new NotFoundError('Cart item not found');
  }

  if (cartItem.product.stock < quantity) {
    throw new ValidationError('Insufficient stock');
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCart(userId);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new NotFoundError('Cart item not found');
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return getCart(userId);
};

/**
 * Clear cart
 */
export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return getCart(userId);
};
