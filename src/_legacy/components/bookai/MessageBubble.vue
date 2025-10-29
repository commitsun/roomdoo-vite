<template>
  <div :class="['message-bubble', author]">
    <div class="content">{{ text }}</div>
    <div class="time">{{ formatted }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  author: 'agent' | 'client';
  text: string;
  createdAt: number;
}>();

const formatted = computed(() =>
  new Date(props.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
);
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin: 0.25rem 0;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  line-height: 1.4;
  font-size: 0.9rem;
  word-break: break-word;
}
.agent {
  align-self: flex-end;
  background: #06b6d4;
  color: #04121f;
}
.client {
  align-self: flex-start;
  background: #1f2937;
  color: #e5e7eb;
}
.time {
  align-self: flex-end;
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.15rem;
}
@media (min-width: 768px) {
  .message-bubble {
    max-width: 60%;
    font-size: 0.95rem;
  }
}
</style>
