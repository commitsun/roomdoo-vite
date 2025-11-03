import type { Address } from '@/domain/entities/Address';
import type { AddressRepository } from '@/domain/repositories/AddressRepository';
import { api } from '@/infrastructure/http/axios';

export class AddressRepositoryImpl implements AddressRepository {
  async fetchAddressByZip(zip: string): Promise<Address[]> {
    const response = await api.get<Address[]>('/zip-autocomplete', {
      params: { searchParam: zip },
    });
    return response.data;
  }
}
