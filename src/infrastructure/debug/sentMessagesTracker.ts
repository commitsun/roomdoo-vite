/**
 * Debug utility to track sent messages and detect sender mismatches
 * Stores sent message info in localStorage to persist across page reloads
 * Only active when ROOMDOO_DEBUG=true
 */

const STORAGE_KEY = 'roomdoo_debug_sent_messages';
const MAX_ENTRIES = 100; // Keep last 100 messages to avoid localStorage bloat

export interface SentMessageRecord {
  /** Timestamp when message was sent (used as part of message ID) */
  timestamp: string;
  /** Chat ID where message was sent */
  chatId: string;
  /** Sender value sent to API */
  sentAs: string;
  /** Message content (first 50 chars for identification) */
  contentPreview: string;
}

/**
 * Get all tracked sent messages from localStorage
 */
export function getSentMessages(): SentMessageRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null || stored === '') {
      return [];
    }
    return JSON.parse(stored) as SentMessageRecord[];
  } catch {
    return [];
  }
}

interface TrackSentMessageParams {
  chatId: string;
  content: string;
  sentAs: string;
  timestamp: Date;
}

/**
 * Track a sent message
 */
export function trackSentMessage(params: TrackSentMessageParams): void {
  const { chatId, content, sentAs, timestamp } = params;
  const records = getSentMessages();

  const newRecord: SentMessageRecord = {
    timestamp: timestamp.toISOString(),
    chatId,
    sentAs,
    contentPreview: content.substring(0, 50),
  };

  records.push(newRecord);

  // Keep only last MAX_ENTRIES
  const trimmed = records.slice(-MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable, ignore
  }
}

/**
 * Find the sender used when a message was sent
 * Matches by chatId and approximate timestamp (within 5 seconds)
 */
export function findSentAs(chatId: string, apiTimestamp: string, content: string): string | null {
  const records = getSentMessages();
  const apiTime = new Date(apiTimestamp).getTime();

  // Find matching record by chatId and content preview
  for (const record of records) {
    if (record.chatId !== chatId) {
      continue;
    }

    // Check if content matches (first 50 chars)
    if (record.contentPreview !== content.substring(0, 50)) {
      continue;
    }

    // Check if timestamp is within 60 seconds (API might have slight delay)
    const recordTime = new Date(record.timestamp).getTime();
    const timeDiff = Math.abs(apiTime - recordTime);
    if (timeDiff < 60000) {
      return record.sentAs;
    }
  }

  return null;
}

/**
 * Clear all tracked messages (for debugging)
 */
export function clearSentMessages(): void {
  localStorage.removeItem(STORAGE_KEY);
}
