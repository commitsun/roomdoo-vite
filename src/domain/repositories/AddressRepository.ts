import type { Address } from '@/domain/entities/Address';

export interface AddressRepository {
  fetchAddressByZip(zip: string): Promise<Address[]>;
}
