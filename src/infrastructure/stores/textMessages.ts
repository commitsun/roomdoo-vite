import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TextMessage {
  id: number;
  title: string;
  text: string;
}

export const useTextMessagesStore = defineStore('textMessages', () => {
  const messages = ref<TextMessage[]>([]);
  const addTextMessage = (title: string, text: string) => {
    messages.value.push({ id: Date.now(), title, text });
  };

  const removeTextMessage = () => {
    messages.value.shift();
  };

  return { messages, addTextMessage, removeTextMessage };
});
