import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePaginationParams, createPaginatedResponse, PaginationParams } from '../utils/pagination';

/**
 * Order Service
 * Handles order creation and management with transactions
 */

/**
 * Create order from user's cart
 */
export const createOrder = async (
  userId: string,
  addressId: string,
  items?: { productId: string; quantity: number }[]
) => {
  // Verify address belongs to user
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new NotFoundError('Address not found');
  }
  // Define orderItems at a scope accessible to the transaction
  let orderItems: { productId: string; quantity: number; product: any }[] = [];
  // Scenario A: Create from provided items (Stateless)
  // We now enforce this mode to avoid "Cart is empty" errors from sync failures
  if (items && items.length > 0) {
    // Validate and fetch product details for each item
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundError(`Product not found: ${item.productId}`);
      orderItems.push({ ...item, product });
    }
  } else {
    // If no items provided, throw error immediately instead of falling back to DB cart
    throw new ValidationError('No items provided for order');
  }

  // Common: Validate stock and calculate total
  let total = 0;
  for (const item of orderItems) {
    if (!item.product.isActive) {
      throw new ValidationError(`Product ${item.product.name} is no longer available`);
    }
    if (item.product.stock < item.quantity) {
      throw new ValidationError(`Insufficient stock for ${item.product.name}`);
    }
    total += Number(item.product.price) * item.quantity;
  }

  // Create order with transaction (atomic operation)
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Stateless mode: No db cart to clear 
    // (Frontend clears its local cart upon success)

    return newOrder;
  });

  return order;
};

/**
 * Get user's orders with pagination
 */
export const getUserOrders = async (userId: string, pagination: PaginationParams) => {
  const { page, limit, skip } = parsePaginationParams(pagination);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return createPaginatedResponse(orders, total, page, limit);
};

/**
 * Get order by ID (user must own the order)
 */
export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      address: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.userId !== userId) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

/**
 * Get order by ID (admin only - no user ownership check)
 */
export const getOrderByIdForAdmin = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      address: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (
  filters: { status?: string; userId?: string },
  pagination: PaginationParams
) => {
  const { page, limit, skip } = parsePaginationParams(pagination);

  const where: any = {};
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.userId) {
    where.userId = filters.userId;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.order.count({ where }),
  ]);

  return createPaginatedResponse(orders, total, page, limit);
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid order status');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
