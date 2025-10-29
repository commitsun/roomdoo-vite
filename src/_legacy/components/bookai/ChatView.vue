<!-- src/legacy/components/bookai/ChatView.vue -->
<template>
  <div class="chat-view">
    <header class="bar">
      <div class="title">{{ chatTitle }}</div>
      <div class="status">{{ connected ? 'Conectado' : 'Desconectado' }}</div>
    </header>

    <section ref="scroller" class="messages">
      <MessageBubble
        v-for="m in list"
        :key="m.id"
        :author="m.author"
        :text="m.text"
        :createdAt="m.createdAt"
      />
    </section>

    <footer class="input">
      <ChatInput @send="send" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import ChatInput from '@/_legacy/components/bookai/ChatInput.vue';
import MessageBubble from '@/_legacy/components/bookai/MessageBubble.vue';
import { useChatsStore } from '@/_legacy/store/bookai/chats';
import { useConnectionStore } from '@/_legacy/store/bookai/connection';
import { useMessagesStore } from '@/_legacy/store/bookai/messages';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{ chatId?: string }>();
const route = useRoute();

const activeId = computed(() => props.chatId ?? String(route.query.chat ?? ''));
const scroller = ref<HTMLElement | null>(null);

const messages = useMessagesStore();
const chats = useChatsStore();
const connection = useConnectionStore();

const { cache } = storeToRefs(messages);
const { connected } = storeToRefs(connection);

const list = computed(() => cache.value.get(activeId.value) ?? []);
const chatTitle = computed(() => chats.byId(activeId.value)?.title ?? 'Chat');

function scrollToBottom() {
  nextTick(() => scroller.value?.scrollTo({ top: 1e9, behavior: 'smooth' }));
}

async function boot() {
  if (!activeId.value) return;
  await messages.load(activeId.value);
  chats.markAsRead(activeId.value);
  scrollToBottom();
}

onMounted(async () => {
  await boot();
  const unsubscribe = messages.subscribe();
  const stop = watch(
    () => cache.value.get(activeId.value)?.length,
    () => scrollToBottom()
  );
  onUnmounted(() => {
    unsubscribe();
    stop();
  });
});

watch(activeId, async () => {
  await boot();
});

async function send(text: string) {
  if (!activeId.value) return;
  await messages.send(activeId.value, text);
}
</script>

<style scoped>
.chat-view {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: calc(100dvh - 96px);
  background: #0f172a;
  color: #e5e7eb;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #1f2937;
}
.title {
  font-weight: 600;
}
.status {
  font-size: 0.85rem;
  color: #94a3b8;
}
.messages {
  padding: 12px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: #0b1220;
}
.input {
  padding: 12px 16px;
  border-top: 1px solid #1f2937;
  background: #0f172a;
}
@media (min-width: 1024px) {
  .chat-view {
    height: calc(100dvh - 112px);
  }
  .messages {
    padding: 16px 20px;
  }
}
</style>
