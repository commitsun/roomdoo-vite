import type { ChatRepository } from '@/domain/repositories/ChatRepository';
import { ChatRepositoryImpl } from '@/infrastructure/repositories/ChatRepositoryImpl';
import { ChatRepositoryMock } from '@/infrastructure/repositories/ChatRepositoryMock';

/**
 * Determines if mock mode is enabled via environment variable.
 * ROOMDOO_BOOKAI_USE_MOCKS=true enables mock data.
 */
const useMocks = import.meta.env.ROOMDOO_BOOKAI_USE_MOCKS === 'true';

/**
 * Factory function that returns the appropriate ChatRepository implementation
 * based on the ROOMDOO_BOOKAI_USE_MOCKS environment variable.
 *
 * @returns ChatRepository instance (mock or real)
 */
export function createChatRepository(): ChatRepository {
  if (useMocks) {
    return new ChatRepositoryMock();
  }
  return new ChatRepositoryImpl();
}

/**
 * Singleton instance for shared usage across the application.
 * Use this when you need a single repository instance.
 */
export const chatRepository: ChatRepository = createChatRepository();
