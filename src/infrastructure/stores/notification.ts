import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: number;
  text: string;
  severity?: 'success' | 'error' | 'info' | 'warn';
}

export const useNotificationStore = defineStore('notification', () => {
  const messages = ref<Notification[]>([]);
  function add(text: string, severity: 'success' | 'error' | 'info' | 'warn' = 'success') {
    messages.value.push({ id: Date.now(), text, severity });
  }

  function remove() {
    messages.value.shift();
  }

  return { messages, add, remove };
});
