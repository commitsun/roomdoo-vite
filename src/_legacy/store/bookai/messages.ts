import { mockApi, type Message } from '@/_legacy/services/bookai/mockApi'
import { socketSim } from '@/_legacy/services/bookai/mockSocket'
import { useChatsStore } from '@/_legacy/store/bookai/chats'
import { defineStore } from 'pinia'

export const useMessagesStore = defineStore('bookai-messages', {
  state: () => ({
    cache: new Map<string, Message[]>(),
    loadingChatId: '' as string | null,
    activeChatId: '' as string | null,
  }),
  actions: {
    async load(chatId: string) {
      this.loadingChatId = chatId
      try {
        const data = await mockApi.getMessages(chatId)
        this.cache.set(chatId, data)
        this.activeChatId = chatId
      } finally {
        this.loadingChatId = null
      }
    },
    async send(chatId: string, text: string) {
      const msg = await mockApi.sendMessage(chatId, text)
      const current = this.cache.get(chatId) || []
      current.push(msg)
      this.cache.set(chatId, current)
      const chats = useChatsStore()
      chats.updatePreview(chatId, text, msg.createdAt)
      return msg
    },
    subscribe() {
      const chats = useChatsStore()
      const handler = (payload: Message) => {
        const list = this.cache.get(payload.chatId) || []
        list.push(payload)
        this.cache.set(payload.chatId, list)
        chats.updatePreview(payload.chatId, payload.text, payload.createdAt)
        chats.bumpUnread(payload.chatId)
      }
      socketSim.on('message', handler)
      return () => socketSim.off('message', handler)
    },
  },
})
