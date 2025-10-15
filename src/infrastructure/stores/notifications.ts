import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: number;
  text: string;
  severity?: 'success' | 'error' | 'info' | 'warn';
}

export const useNotificationsStore = defineStore('notifications', () => {
  const messages = ref<Notification[]>([]);
  function add(text: string, severity: 'success' | 'error' | 'info' | 'warn' = 'success'): void {
    messages.value.push({ id: Date.now(), text, severity });
  }

  function remove(): void {
    messages.value.shift();
  }

  return { messages, add, remove };
});
