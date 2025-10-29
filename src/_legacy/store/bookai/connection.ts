import { startSocketSimulation, stopSocketSimulation } from '@/_legacy/services/bookai/mockSocket'
import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('bookai-connection', {
  state: () => ({
    connected: false,
  }),
  actions: {
    connect() {
      if (this.connected) return
      this.connected = true
      startSocketSimulation()
    },
    disconnect() {
      if (!this.connected) return
      this.connected = false
      stopSocketSimulation()
    },
  },
})
