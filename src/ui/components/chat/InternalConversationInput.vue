<template>
  <div class="internal-conversation-input mt-3">
    <!-- AI welcome message -->
    <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
      <Avatar
        image="/app-images/bookai-avatar.png"
        shape="circle"
        size="normal"
        class="flex-shrink-0"
      />
      <div class="flex-1">
        <p class="text-sm text-amber-900 m-0">
          {{ t('chat.internalConversation.aiWelcome') }}
        </p>
      </div>
    </div>

    <!-- Input area -->
    <div class="flex items-end gap-2">
      <!-- Textarea -->
      <div class="flex-1 relative">
        <Textarea
          v-model="inputText"
          :placeholder="t('chat.internalConversation.inputPlaceholder')"
          :autoResize="true"
          rows="1"
          class="w-full"
          :disabled="!isAIToggleOn"
          @keydown.enter.exact.prevent="handleSend"
        />
      </div>

      <!-- AI toggle and send button -->
      <div class="flex items-center gap-2">
        <!-- AI Toggle -->
        <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-100">
          <Sparkles :size="16" :class="isAIToggleOn ? 'text-amber-500' : 'text-surface-400'" />
          <ToggleSwitch v-model="isAIToggleOn" />
        </div>

        <!-- Send button -->
        <Button
          :icon="'pi pi-send'"
          severity="primary"
          :disabled="!canSend"
          rounded
          @click="handleSend"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from 'lucide-vue-next';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import Avatar from 'primevue/avatar';

export default defineComponent({
  name: 'InternalConversationInput',
  components: {
    Sparkles,
    Textarea,
    Button,
    ToggleSwitch,
    Avatar,
  },
  emits: ['send'],
  setup(_, { emit }) {
    const { t } = useI18n();
    const inputText = ref('');
    const isAIToggleOn = ref(true);

    const canSend = computed((): boolean => {
      return inputText.value.trim().length > 0 && isAIToggleOn.value;
    });

    const handleSend = (): void => {
      if (!canSend.value) {
        return;
      }

      emit('send', {
        content: inputText.value.trim(),
        withAI: isAIToggleOn.value,
      });

      inputText.value = '';
    };

    return {
      t,
      inputText,
      isAIToggleOn,
      canSend,
      handleSend,
    };
  },
});
</script>

<style lang="scss" scoped>
.internal-conversation-input {
  :deep(.p-textarea) {
    resize: none;
    min-height: 40px;
    max-height: 120px;
    border-radius: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;

    &:focus {
      box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
      border-color: rgb(251, 191, 36);
    }
  }
}
</style>
