/**
 * Guest status types representing the current state of a guest in the hotel
 * - arriving: Guest has a reservation and is expected to arrive
 * - in_house: Guest is currently checked in
 * - checked_out: Guest has completed their stay
 */
export const GUEST_STATUSES = ['arriving', 'in_house', 'checked_out'] as const;
export type GuestStatus = (typeof GUEST_STATUSES)[number];

/**
 * Message delivery status types
 * - sent: Message has been sent but not yet delivered
 * - delivered: Message has been delivered to recipient
 * - read: Message has been read by recipient
 */
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

/**
 * Message sender types
 * - guest: Message sent by the guest
 * - hotel: Message sent by hotel staff
 * - bookai: Message sent by BookAI automated system
 * - ai_assisted: AI-prepared response approved/edited by hotel staff
 * - system: System-generated event (state changes, traceability)
 */
export const MESSAGE_SENDERS = ['guest', 'hotel', 'bookai', 'ai_assisted', 'system'] as const;
export type MessageSender = (typeof MESSAGE_SENDERS)[number];

/**
 * System event types for traceability
 * - ai_asked_help: AI requested human assistance
 * - bookai_disabled: BookAI was turned off (manual control activated)
 * - bookai_enabled: BookAI was turned on
 */
export const SYSTEM_EVENT_TYPES = ['ai_asked_help', 'bookai_disabled', 'bookai_enabled'] as const;
export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[number];

/**
 * Chat filter types for the chat list
 * - all: Show all chats
 * - alerts: Show only chats with alerts or unread messages
 * - checkin_pending: Show only chats with pending check-in
 */
export const CHAT_FILTER_TYPES = ['all', 'alerts', 'checkin_pending'] as const;
export type ChatFilterType = (typeof CHAT_FILTER_TYPES)[number];

/**
 * WhatsApp template component types
 */
export const TEMPLATE_COMPONENT_TYPES = ['HEADER', 'BODY', 'FOOTER', 'BUTTONS'] as const;
export type TemplateComponentType = (typeof TEMPLATE_COMPONENT_TYPES)[number];

export const TEMPLATE_HEADER_FORMATS = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'] as const;
export type TemplateHeaderFormat = (typeof TEMPLATE_HEADER_FORMATS)[number];

export const TEMPLATE_BUTTON_TYPES = ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'] as const;
export type TemplateButtonType = (typeof TEMPLATE_BUTTON_TYPES)[number];

/**
 * Template header component
 */
export interface TemplateHeader {
  type: 'HEADER';
  format: TemplateHeaderFormat;
  text?: string;
  example?: {
    header_text?: string[];
    header_handle?: string[];
  };
}

/**
 * Template body component
 */
export interface TemplateBody {
  type: 'BODY';
  text: string;
  example?: {
    body_text?: string[][];
  };
}

/**
 * Template footer component
 */
export interface TemplateFooter {
  type: 'FOOTER';
  text: string;
}

/**
 * Template button component
 */
export interface TemplateButton {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
}

/**
 * Template buttons container
 */
export interface TemplateButtons {
  type: 'BUTTONS';
  buttons: TemplateButton[];
}

export type TemplateComponent = TemplateHeader | TemplateBody | TemplateFooter | TemplateButtons;

/**
 * Message template for WhatsApp Business API
 * Templates are pre-approved messages that can be sent outside the 24h window
 */
export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: TemplateComponent[];
}
