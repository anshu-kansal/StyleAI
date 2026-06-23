import Address from '../models/address.model';
import { ApiError } from '../utils/api-error';

export class AddressService {
  /**
   * Create a new address
   */
  static async create(userId: string, addressData: any) {
    const existingAddressesCount = await Address.countDocuments({ user: userId });
    
    // If it's the first address, force it to be default
    const isDefault = existingAddressesCount === 0 ? true : !!addressData.isDefault;

    if (isDefault) {
      // Unset other default addresses
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = new Address({
      ...addressData,
      user: userId,
      isDefault,
    });

    await address.save();
    return address;
  }

  /**
   * List all addresses for a user
   */
  static async list(userId: string) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Get an address by ID (and verify owner)
   */
  static async getById(userId: string, id: string) {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      throw ApiError.notFound('Address not found or unauthorized');
    }
    return address;
  }

  /**
   * Update address details
   */
  static async update(userId: string, id: string, updateData: any) {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      throw ApiError.notFound('Address not found or unauthorized');
    }

    if (updateData.isDefault) {
      // Unset other default addresses
      await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, updateData);
    await address.save();
    return address;
  }

  /**
   * Delete an address
   */
  static async delete(userId: string, id: string) {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      throw ApiError.notFound('Address not found or unauthorized');
    }

    const wasDefault = address.isDefault;
    await Address.deleteOne({ _id: id });

    // If we deleted the default address, promote another one if exists
    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return { success: true };
  }
}
