import { describe, it, expect, vi } from 'vitest';

import { formatDateToTimezone } from './timezone';

// Mock the store
const pmsProperties = [
  { id: 1, timezone: 'Asia/Tokyo' },
  { id: 2, timezone: 'America/New_York' },
  { id: 3, timezone: null }, // No timezone
];

const mockCurrentPmsPropertyId = { value: 1 };

vi.mock('@/infrastructure/stores/pmsProperties', () => ({
  usePmsPropertiesStore: () => ({
    pmsProperties,
    currentPmsPropertyId: mockCurrentPmsPropertyId.value,
  }),
}));

describe('timezone utils', () => {
  describe('formatDateToTimezone', () => {
    it('should format date correctly in different timezones', () => {
      const date = new Date('2023-10-15T10:00:00Z');

      expect(formatDateToTimezone(date, 'UTC')).toBe('2023-10-15');
      expect(formatDateToTimezone(date, 'Asia/Tokyo')).toBe('2023-10-15');
      expect(formatDateToTimezone(date, 'America/New_York')).toBe('2023-10-15');
    });

    it('should handle date rollovers correctly', () => {
      const date = new Date('2023-10-15T23:00:00Z');

      expect(formatDateToTimezone(date, 'UTC')).toBe('2023-10-15');
      expect(formatDateToTimezone(date, 'Asia/Tokyo')).toBe('2023-10-16');
      expect(formatDateToTimezone(date, 'America/New_York')).toBe('2023-10-15');
    });
  });
});
