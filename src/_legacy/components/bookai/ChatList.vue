<template>
  <div class="chat-list">
    <div v-if="loading" class="loading">Cargando chats...</div>
    <ul v-else>
      <li v-for="c in chats" :key="c.id" @click="open(c.id)" class="chat-item">
        <div class="info">
          <div class="title">{{ c.title }}</div>
          <div class="preview">{{ c.lastMessage }}</div>
        </div>
        <div class="meta">
          <div class="time">{{ time(c.updatedAt) }}</div>
          <div v-if="c.unread > 0" class="badge">{{ c.unread }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useChatsStore } from '@/_legacy/store/bookai/chats';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const chat = useChatsStore();
const { items: chatsList, loading } = storeToRefs(chat);

onMounted(() => chat.fetchAll());

function open(id: string) {
  router.push({ name: 'book-ai', query: { chat: id } });
}

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const chats = computed(() => chatsList.value);
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.loading {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111827;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-item:hover {
  background: #1e293b;
}
.info {
  flex: 1;
  overflow: hidden;
}
.title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview {
  color: #94a3b8;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-left: 0.5rem;
}
.time {
  font-size: 0.8rem;
  color: #64748b;
}
.badge {
  background: #a78bfa;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-weight: 600;
  font-size: 0.75rem;
}
@media (min-width: 768px) {
  .chat-item {
    padding: 0.9rem 1rem;
  }
  .preview {
    font-size: 0.9rem;
  }
}
</style>
