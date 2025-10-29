import { mockApi, type ChatPreview } from '@/_legacy/services/bookai/mockApi'
import { defineStore } from 'pinia'

export const useChatsStore = defineStore('bookai-chats', {
  state: () => ({
    items: [] as ChatPreview[],
    loading: false,
  }),
  getters: {
    byId: state => (id: string) => state.items.find(c => c.id === id),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        this.items = await mockApi.listChats()
      } finally {
        this.loading = false
      }
    },
    updatePreview(chatId: string, text: string, updatedAt: number) {
      const chat = this.items.find(c => c.id === chatId)
      if (chat) {
        chat.lastMessage = text
        chat.updatedAt = updatedAt
      }
      this.items = [...this.items].sort((a, b) => b.updatedAt - a.updatedAt)
    },
    markAsRead(chatId: string) {
      const chat = this.items.find(c => c.id === chatId)
      if (chat) chat.unread = 0
    },
    bumpUnread(chatId: string) {
      const chat = this.items.find(c => c.id === chatId)
      if (chat) chat.unread += 1
    },
  },
})
