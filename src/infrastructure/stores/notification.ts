import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: number;
  text: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const messages = ref<Notification[]>([]);
  function add(text: string) {
    messages.value.push({ id: Date.now(), text });
  }

  function remove() {
    messages.value.shift();
  }

  return { messages, add, remove };
});
