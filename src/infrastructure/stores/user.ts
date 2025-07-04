import { defineStore } from 'pinia';
import type { User } from '@/domain/entities/User';
import { ref } from 'vue';
import { UsersRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { UserService } from '@/application/UserService';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const userRepository = new UsersRepositoryImpl();
  const userService = new UserService(userRepository);

  const login = async (email: string, password: string) => {
    await userService.doLogin(email, password);
  };

  const getUserById = async (id: string) => {
    user.value = await userService.getUser();
    if (!user.value) {
      throw new Error('User not found');
    }
  };
  return { user, login, getUserById };
});
