import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';
import type { Language } from '@/domain/entities/Language';
import { api } from '@/infrastructure/http/axios';

export class InstanceRepositoryImpl implements InstanceRepository {
  async fetchInstance(): Promise<Instance> {
    return api.get('/instance').then((response) => response.data);
  }

  async fetchLanguages(): Promise<Language[]> {
    return api.get('/languages').then((response) => response.data);
  }

  async fetchDynamicFields(): Promise<{ field: string; source: string }[]> {
    const dynamicFields:
      | { field: string; source: string }[]
      | PromiseLike<{ field: string; source: string }[]> = [];
    const userDynamicFieldsResponse = await api.get('/user/extra-features');
    userDynamicFieldsResponse.data.forEach((field: string) => {
      dynamicFields.push({ field: field, source: 'user' });
    });
    const contactDynamicFieldsResponse = await api.get('/contacts/extra-features');
    contactDynamicFieldsResponse.data.forEach((field: string) => {
      dynamicFields.push({ field: field, source: 'contact' });
    });
    return dynamicFields;
  }
}
