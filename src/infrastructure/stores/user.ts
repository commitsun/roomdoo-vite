import { defineStore } from 'pinia';
import type { User } from '@/domain/entities/User';
import { ref } from 'vue';
import { UsersRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { UserService } from '@/application/UserService';
const userRepository = new UsersRepositoryImpl();
const userService = new UserService(userRepository);

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const login = async (email: string, password: string) => {
    await userService.doLogin(email, password);
  };

  const fetchUser = async () => {
    user.value = await userService.getUser();
    if (!user.value) {
      throw new Error('User not found');
    }
  };
  return { user, login, fetchUser };
});
