import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { User } from '@prisma/client';

/**
 * User Service
 * Handles user profile operations
 */

export interface UpdateUserData {
  name?: string;
  email?: string;
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<User> => {
  // Validate email uniqueness if provided
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== id) {
      throw new ValidationError('Email already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return user;
};

/**
 * Get all user addresses (only active ones)
 */
export const getUserAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: {
      userId,
      isActive: true, // Only return active addresses
    },
    orderBy: { createdAt: 'desc' },
  });
};

export interface AddAddressData {
  type: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  type?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/**
 * Add user address
 */
export const addUserAddress = async (
  userId: string,
  data: AddAddressData
) => {
  // If this is set as default, unset other default addresses
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: {
      ...data,
      userId,
    },
  });
};

/**
 * Update user address
 */
export const updateUserAddress = async (
  addressId: string,
  userId: string,
  data: UpdateAddressData
) => {
  // Verify address belongs to user
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new NotFoundError('Address not found');
  }

  // If setting as default, unset other default addresses
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
};

/**
 * Soft delete user address (mark as inactive)
 */
export const deleteUserAddress = async (
  addressId: string,
  userId: string
) => {
  // Verify address belongs to user
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new NotFoundError('Address not found');
  }

  // Soft delete: mark as inactive instead of deleting
  await prisma.address.update({
    where: { id: addressId },
    data: { isActive: false },
  });

  return { success: true };
};

/**
 * Delete user account and all related data
 */
export const deleteUserAccount = async (userId: string) => {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check for active orders
  const activeOrdersCount = await prisma.order.count({
    where: {
      userId,
      status: {
        notIn: ['delivered', 'cancelled'],
      },
    },
  });

  if (activeOrdersCount > 0) {
    throw new ValidationError(
      'Cannot delete account. You have active orders that must be delivered or cancelled first.'
    );
  }

  // Delete user - Prisma will cascade delete:
  // - addresses (via onDelete: Cascade)
  // - orders (via onDelete: Cascade)
  // - cart and cart items (via onDelete: Cascade)
  // - auth sessions (via onDelete: Cascade)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true, message: 'Account deleted successfully' };
};
