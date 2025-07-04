import { NotFoundError } from '@/application/errors';
import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';
import { api } from '@/infrastructure/http/axios';
import axios from 'axios';

export class InstanceRepositoryImpl implements InstanceRepository {
  getInstance(): Promise<Instance | undefined> {
    // return api.get<Instance>('/instance').then((response) => response.data);
    return api
      .get<Instance>('https://asdfasd.host.roomdoo.com/instance')
      .then((response) => response.data);
    /*.catch((error) => {
        console.log('error en repo');
        throw new NotFoundError();
      });*/
  }
}
