import type { Address } from '@/domain/entities/Address';
import type { AddressRepository } from '@/domain/repositories/AddressRepository';

export class AddressService {
  constructor(private addressRepository: AddressRepository) {}
  async fetchAddressByZip(zip: string): Promise<Address[]> {
    const response = await this.addressRepository.fetchAddressByZip(zip);
    return response;
  }
}
