import { defineStore } from 'pinia';

import { AddressRepositoryImpl } from '@/infrastructure/repositories/AddressRepositoryImpl';
import { AddressService } from '@/application/address/AddressService';
import type { Address } from '@/domain/entities/Address';

const addressRepository = new AddressRepositoryImpl();

export const useAddressStore = defineStore('address', () => {
  const addressService = new AddressService(addressRepository);
  const fetchAddressByZip = async (zip: string): Promise<Address[]> => {
    return addressService.fetchAddressByZip(zip);
  };

  return {
    fetchAddressByZip,
  };
});
