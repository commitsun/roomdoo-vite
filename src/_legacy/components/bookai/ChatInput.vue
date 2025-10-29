<template>
  <form @submit.prevent="submit" class="chat-input">
    <textarea
      v-model="text"
      class="input"
      rows="1"
      placeholder="Escribe un mensaje..."
      @keydown.enter.exact.prevent="submit"
    />
    <button type="submit" class="send" :disabled="!text.trim()">
      <i class="pi pi-send" />
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{ (e: 'send', text: string): void }>();
const text = ref('');

function submit() {
  const t = text.value.trim();
  if (!t) return;
  emit('send', t);
  text.value = '';
}
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.input {
  flex: 1;
  background: #0b1220;
  border: 1px solid #1f2937;
  border-radius: 10px;
  color: #e5e7eb;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  resize: none;
  min-height: 42px;
}
.send {
  background: #06b6d4;
  color: #04121f;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (min-width: 768px) {
  .input {
    font-size: 1rem;
    min-height: 48px;
  }
  .send {
    padding: 0.7rem 1.1rem;
  }
}
</style>
