<template>
  <div class="bookai h-full flex flex-col">
    <header class="flex items-center justify-between p-3 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <i class="pi pi-comments text-cyan-400"></i>
        <h2 class="text-lg font-semibold">BookAI Assistant</h2>
      </div>
      <span class="text-sm text-slate-400">{{ connectionLabel }}</span>
    </header>

    <main class="flex-1 overflow-y-auto p-4 bg-slate-900">
      <ChatView v-if="activeChatId" :chat-id="activeChatId" />
      <ChatList v-else />
    </main>

    <footer class="border-t border-slate-700 p-3">
      <ChatInput v-if="activeChatId" @send="handleSend" />
    </footer>

    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Toast from 'primevue/toast';
import { computed } from 'vue';
import { useConnectionStore } from '../../_legacy/store/bookai/connection';
import { useMessagesStore } from '../../_legacy/store/bookai/messages';
import ChatInput from '../components/bookai/ChatInput.vue';
import ChatList from '../components/bookai/ChatList.vue';
import ChatView from '../components/bookai/ChatView.vue';

const connection = useConnectionStore();
const { connected } = storeToRefs(connection);
const connectionLabel = computed(() =>
  connected.value ? 'Conectado a BookAI (simulado)' : 'Desconectado'
);

const messages = useMessagesStore();
const { activeChatId } = storeToRefs(messages);

function handleSend(text: string) {
  if (activeChatId.value) messages.send(activeChatId.value, text);
}
</script>

<style scoped>
.bookai {
  background-color: #0f172a;
  color: #e5e7eb;
}
</style>
