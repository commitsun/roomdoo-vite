export type ChatPreview = {
  id: string;
  title: string;
  lastMessage: string;
  unread: number;
  updatedAt: number;
};

export type Message = {
  id: string;
  chatId: string;
  author: 'agent' | 'client';
  text: string;
  createdAt: number;
};

const now = Date.now();

const chats: ChatPreview[] = [
  {
    id: 'b1',
    title: 'Cliente Acme',
    lastMessage: 'Podemos reagendar?',
    unread: 2,
    updatedAt: now - 60000,
  },
  { id: 'b2', title: 'María López', lastMessage: 'Gracias!', unread: 0, updatedAt: now - 120000 },
  {
    id: 'b3',
    title: 'Canal Ventas',
    lastMessage: 'Promo activa',
    unread: 3,
    updatedAt: now - 30000,
  },
];

const messages: Record<string, Message[]> = {
  b1: [
    { id: 'm1', chatId: 'b1', author: 'client', text: 'Hola!', createdAt: now - 360000 },
    {
      id: 'm2',
      chatId: 'b1',
      author: 'agent',
      text: '¡Hola! ¿En qué puedo ayudarte?',
      createdAt: now - 355000,
    },
  ],
  b2: [
    { id: 'm3', chatId: 'b2', author: 'client', text: '¿Tenéis stock?', createdAt: now - 600000 },
  ],
  b3: [
    {
      id: 'm4',
      chatId: 'b3',
      author: 'agent',
      text: 'Bienvenidos al canal 👋',
      createdAt: now - 7200000,
    },
  ],
};

function delay<T>(value: T, ms = 250) {
  return new Promise<T>((r) => setTimeout(() => r(value), ms));
}

export const mockApi = {
  async listChats(): Promise<ChatPreview[]> {
    const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
    return delay(sorted);
  },
  async getMessages(chatId: string): Promise<Message[]> {
    return delay(messages[chatId] ? [...messages[chatId]] : []);
  },
  async sendMessage(chatId: string, text: string): Promise<Message> {
    const msg: Message = {
      id: `m${Math.random().toString(36).slice(2, 8)}`,
      chatId,
      author: 'agent',
      text,
      createdAt: Date.now(),
    };
    messages[chatId] = messages[chatId] || [];
    messages[chatId].push(msg);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.lastMessage = text;
      chat.updatedAt = msg.createdAt;
    }
    return delay(msg);
  },
};
