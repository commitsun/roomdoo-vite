import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PmsPropertiesService } from './PmsPropertiesService';
import type { PmsPropertiesRepository } from '@/domain/repositories/PmsPropertiesRepository';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { MenuLink } from '@/domain/entities/MenuLink';

describe('PmsPropertiesService', () => {
  let service: PmsPropertiesService;
  let repoMock: Partial<Record<keyof PmsPropertiesRepository, any>>;

  beforeEach(() => {
    // Create a light-weight mock of the repository
    repoMock = {
      fetchPmsProperties: vi.fn(),
      fetchMenuLinks: vi.fn(),
      fetchPmsPropertyLink: vi.fn(),
    };
    service = new PmsPropertiesService(repoMock as PmsPropertiesRepository);
  });

  describe('fetchPmsProperties', () => {
    it('returns the list of properties from repository', async () => {
      // Arrange: fake data returned by repo
      const properties: PmsProperty[] = [
        {
          id: 1,
          name: 'Roomdoo Test Property',
          image: 'https://example.com/image1.jpg',
        },
        {
          id: 2,
          name: 'Another Property',
          image: 'https://example.com/image2.jpg',
        },
      ];
      repoMock.fetchPmsProperties!.mockResolvedValue(properties);

      // Act
      const result = await service.fetchPmsProperties();

      // Assert: service delegates and returns as-is
      expect(repoMock.fetchPmsProperties).toHaveBeenCalledTimes(1);
      expect(result).toBe(properties);
    });

    it('propagates repository errors', async () => {
      // Arrange
      const err = new Error('network down');
      repoMock.fetchPmsProperties!.mockRejectedValue(err);

      // Assert
      await expect(service.fetchPmsProperties()).rejects.toThrow(err);
    });
  });

  describe('fetchMenuLinks', () => {
    it('calls repository with the given property id and returns links', async () => {
      // Arrange
      const pmsPropertyId = 42;
      const links: MenuLink[] = [
        { id: 10, label: 'Dashboard', isSupportLink: false },
        { id: 11, label: 'Reservations', isSupportLink: false },
      ];
      repoMock.fetchMenuLinks!.mockResolvedValue(links);

      // Act
      const result = await service.fetchMenuLinks(pmsPropertyId);

      // Assert
      expect(repoMock.fetchMenuLinks).toHaveBeenCalledWith(pmsPropertyId);
      expect(result).toBe(links);
    });

    it('propagates repository errors', async () => {
      // Arrange
      const err = new Error('forbidden');
      repoMock.fetchMenuLinks!.mockRejectedValue(err);

      // Assert
      await expect(service.fetchMenuLinks(99)).rejects.toThrow(err);
    });
  });

  describe('fetchPmsPropertyLink', () => {
    it('calls repository with property id and link id, returning a URL string', async () => {
      // Arrange
      const pmsPropertyId = 7;
      const linkId = 123;
      const url = 'https://example.com/p/7/link/123';
      repoMock.fetchPmsPropertyLink!.mockResolvedValue(url);

      // Act
      const result = await service.fetchPmsPropertyLink(pmsPropertyId, linkId);

      // Assert
      expect(repoMock.fetchPmsPropertyLink).toHaveBeenCalledWith(pmsPropertyId, linkId);
      expect(result).toBe(url);
    });

    it('propagates repository errors', async () => {
      // Arrange
      const err = new Error('not found');
      repoMock.fetchPmsPropertyLink!.mockRejectedValue(err);

      // Assert
      await expect(service.fetchPmsPropertyLink(1, 999)).rejects.toThrow(err);
    });
  });
});
