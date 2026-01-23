<template>
  <Card class="m-2 lg:m-3">
    <template #content>
      <!-- INTERNAL SESSION WRAPPER - contains EVERYTHING when internal session is active -->
      <div
        v-if="internalSession && internalSession.status === 'active'"
        class="internal-session-wrapper"
      >
        <!-- Header: icon + title + badge + timestamp -->
        <div class="internal-session-wrapper__header">
          <div class="internal-session-wrapper__header-left">
            <TriangleAlert :size="20" class="internal-session-wrapper__header-icon" />
            <span class="internal-session-wrapper__header-title">{{
              t('chat.internal.needHelp')
            }}</span>
            <span class="internal-session-wrapper__context-badge">
              {{ internalSession.aiHelpRequest || t('chat.internal.infoNotAvailable') }}
            </span>
          </div>
          <span class="internal-session-wrapper__header-time">{{
            formatSessionTime(internalSession.startedAt)
          }}</span>
        </div>

        <!-- Guest query card -->
        <div class="internal-session-wrapper__guest-card">
          <p>{{ internalSession.guestQuery }}</p>
        </div>

        <!-- AI Proposed Response with buttons INSIDE -->
        <div v-if="proposedResponse" class="internal-session-wrapper__suggestion">
          <p class="internal-session-wrapper__suggestion-intro">
            {{ t('chat.internal.aiSuggestionIntro') }}
          </p>

          <!-- Inline edit mode -->
          <div v-if="isEditingProposedResponse" class="internal-session-wrapper__response-card">
            <Textarea
              v-model="editedProposedContent"
              :autoResize="true"
              rows="3"
              fluid
              class="internal-session-wrapper__edit-textarea"
            />
            <div class="internal-session-wrapper__response-actions">
              <Button
                severity="secondary"
                size="small"
                outlined
                @click="cancelEditProposedResponse"
              >
                {{ t('chat.internalConversation.cancelEdit') }}
              </Button>
              <Button
                size="small"
                :disabled="!editedProposedContent.trim()"
                @click="sendProposedResponse"
              >
                {{ t('chat.internal.sendToGuest') }}
                <SendHorizontal :size="14" class="ml-1" />
              </Button>
            </div>
          </div>

          <!-- View mode -->
          <div v-else class="internal-session-wrapper__response-card">
            <p class="internal-session-wrapper__response-text">{{ proposedResponse.content }}</p>
            <div class="internal-session-wrapper__response-actions">
              <Button size="small" text class="edit-btn" @click="editProposedResponse">
                {{ t('chat.internal.edit') }}
                <Pencil :size="14" class="ml-1" />
              </Button>
              <Button size="small" @click="sendProposedResponse">
                {{ t('chat.internal.sendToGuest') }}
                <SendHorizontal :size="14" class="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <!-- AI welcome message (only if no messages/proposed response yet) -->
        <p v-else-if="internalSession.messages.length === 0" class="internal-session-wrapper__info">
          {{ t('chat.aiHelp.willPrepareResponse') }}
          <br />
          {{ t('chat.aiHelp.deactivateHint') }}
        </p>

        <!-- INPUT AREA - INSIDE the wrapper -->
        <div class="internal-session-wrapper__input-area">
          <Textarea
            v-model="messageText"
            :placeholder="inputPlaceholder"
            :disabled="disabled"
            :autoResize="true"
            rows="2"
            fluid
            @keydown="handleKeydown"
          />
          <div class="internal-session-wrapper__input-footer">
            <div class="internal-session-wrapper__ai-toggle">
              <AiIcon :size="16" color="currentColor" />
              <span>Ai</span>
              <ToggleSwitch
                v-model="bookAIEnabledLocal"
                :disabled="disabled"
                :class="{ 'ai-toggle--active': bookAIEnabledLocal }"
                @change="$emit('toggle-bookai', bookAIEnabledLocal)"
              />
            </div>
            <Button
              size="small"
              text
              rounded
              :disabled="!messageText.trim()"
              class="internal-session-wrapper__send-btn"
              @click="sendMessage"
            >
              <SendHorizontal :size="18" />
            </Button>
          </div>
        </div>
      </div>

      <!-- NORMAL CONTENT - when NO internal session is active -->
      <template v-else>
        <!-- AI Help Request Panel (when AI needs operator help - legacy, no internal session) -->
        <div v-if="helpContext" class="ai-help-panel">
          <!-- Header -->
          <div class="ai-help-panel__header">
            <TriangleAlert :size="18" />
            <span>{{ t('chat.aiHelp.title') }}</span>
          </div>

          <!-- Description -->
          <p class="ai-help-panel__description">{{ t('chat.aiHelp.noInfo') }}</p>

          <!-- User query with left border -->
          <div class="ai-help-panel__query">
            <p>{{ helpContext.originalQuery }}</p>
          </div>

          <!-- Requested info + deactivate hint (only show when NOT in preview mode) -->
          <p v-if="!isPreviewMode" class="ai-help-panel__info">
            {{ helpContext.requestedInfo }} {{ t('chat.aiHelp.willPrepareResponse') }}
            <br />
            {{ t('chat.aiHelp.deactivateHint') }}
          </p>

          <!-- AI Prepared Response Preview -->
          <div v-if="isPreviewMode" class="ai-help-panel__preview">
            <Divider class="my-3" />
            <div class="ai-help-panel__preview-header">
              <Sparkles :size="16" />
              <span>{{ t('chat.aiHelp.previewTitle') }}</span>
            </div>
            <div class="ai-help-panel__preview-content">
              <p>{{ aiPreparedResponse }}</p>
            </div>
            <div class="ai-help-panel__preview-actions">
              <Button
                :label="t('chat.aiHelp.cancel')"
                severity="secondary"
                text
                size="small"
                @click="cancelPreview"
              />
              <Button
                :label="t('chat.aiHelp.edit')"
                severity="secondary"
                outlined
                size="small"
                @click="editResponse"
              />
              <Button :label="t('chat.aiHelp.send')" size="small" @click="confirmAndSend" />
            </div>
          </div>
        </div>

        <!-- Expired Conversation Banner (when 24h window has passed) -->
        <ExpiredConversationBanner
          v-if="isConversationExpired && !isPreviewMode"
          class="expiring-banner-wrapper"
          @open-templates="toggleTemplatesPopover"
        />

        <!-- Expiring Conversation Banner (when 8 hours or less remaining in 24h window) -->
        <ExpiringConversationBanner
          v-else-if="
            remainingHours !== null && remainingHours > 0 && remainingHours <= 8 && !isPreviewMode
          "
          :remaining-hours="remainingHours"
          class="expiring-banner-wrapper"
        />

        <!-- Textarea with rainbow border wrapper when AI help is active -->
        <div
          v-if="!isPreviewMode"
          :class="['textarea-wrapper', { 'textarea-wrapper--rainbow': helpContext !== null }]"
        >
          <Textarea
            v-model="messageText"
            :placeholder="inputPlaceholder"
            :disabled="disabled || isConversationExpired || (bookAIEnabledLocal && !helpContext)"
            :autoResize="true"
            rows="2"
            fluid
            @keydown="handleKeydown"
          />
        </div>

        <!-- Bottom bar with AI toggle and send button (hidden in preview mode) -->
        <template v-if="!isPreviewMode">
          <Divider />

          <div class="flex items-center justify-between pt-2">
            <!-- Left side: AI Toggle + Manual mode actions -->
            <div class="flex items-center gap-4">
              <!-- AI Toggle -->
              <div class="ai-toggle-wrapper">
                <AiIcon :size="16" color="currentColor" />
                <span class="text-xs font-bold">Ai</span>
                <ToggleSwitch
                  v-model="bookAIEnabledLocal"
                  :disabled="disabled"
                  :class="{ 'ai-toggle--active': bookAIEnabledLocal }"
                  @change="$emit('toggle-bookai', bookAIEnabledLocal)"
                />
              </div>

              <!-- Manual mode action icons (only visible when AI is OFF) -->
              <div v-if="!bookAIEnabledLocal" class="manual-mode-actions">
                <button
                  type="button"
                  class="manual-action-btn"
                  :disabled="disabled"
                  @click="toggleTemplatesPopover"
                >
                  <FilePlus2 :size="16" />
                </button>
                <button
                  type="button"
                  class="manual-action-btn"
                  :disabled="disabled"
                  @click="$emit('open-attachments')"
                >
                  <Paperclip :size="16" />
                </button>
                <button
                  type="button"
                  class="manual-action-btn"
                  :disabled="disabled"
                  @click="$emit('open-emojis')"
                >
                  <Smile :size="16" />
                </button>
              </div>
            </div>

            <!-- Send button -->
            <Button
              :disabled="disabled || !messageText.trim()"
              size="small"
              class="send-btn"
              @click="sendMessage"
            >
              <SendHorizontal :size="16" />
            </Button>
          </div>
        </template>
      </template>
    </template>
  </Card>

  <!-- Templates Popover (outside Card to be always available) -->
  <Popover ref="templatesPopoverRef">
    <TemplatesPopover
      :templates="templates"
      @select="handleTemplateSelect"
      @view-more="handleViewMoreTemplates"
    />
  </Popover>

  <!-- Template Confirmation Dialog -->
  <TemplateConfirmDialog
    v-model:visible="showTemplateConfirmDialog"
    :template="selectedTemplate"
    @confirm="handleTemplateConfirm"
    @cancel="handleTemplateCancel"
    @manage-template="handleManageTemplate"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import ToggleSwitch from 'primevue/toggleswitch';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import {
  TriangleAlert,
  Sparkles,
  FilePlus2,
  Paperclip,
  Smile,
  SendHorizontal,
  Pencil,
} from 'lucide-vue-next';

import type { AIHelpContext, InternalConversationSession } from '@/domain/entities/Chat';
import type { MessageSender, MessageTemplate } from '@/domain/types/ChatTypes';
import AiIcon from '@/ui/components/icons/AiIcon.vue';
import InternalMessageBubble from '@/ui/components/chat/InternalMessageBubble.vue';
import ExpiringConversationBanner from '@/ui/components/chat/ExpiringConversationBanner.vue';
import ExpiredConversationBanner from '@/ui/components/chat/ExpiredConversationBanner.vue';
import TemplatesPopover from '@/ui/components/chat/TemplatesPopover.vue';
import TemplateConfirmDialog from '@/ui/components/chat/TemplateConfirmDialog.vue';
import { getMockMessageTemplates } from '@/infrastructure/mocks/chatMocks';

export default defineComponent({
  name: 'MessageInput',
  components: {
    Card,
    Divider,
    ToggleSwitch,
    Textarea,
    Button,
    Popover,
    TriangleAlert,
    Sparkles,
    FilePlus2,
    Paperclip,
    Smile,
    SendHorizontal,
    Pencil,
    AiIcon,
    InternalMessageBubble,
    ExpiringConversationBanner,
    ExpiredConversationBanner,
    TemplatesPopover,
    TemplateConfirmDialog,
  },
  props: {
    bookAIEnabled: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    helpContext: {
      type: Object as PropType<AIHelpContext | null>,
      default: null,
    },
    internalSession: {
      type: Object as PropType<InternalConversationSession | null>,
      default: null,
    },
    remainingHours: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  emits: {
    send: (_message: string, _sender?: MessageSender) => true,
    'toggle-bookai': (_enabled: boolean) => true,
    'internal-message': (_payload: { content: string; withAI: boolean }) => true,
    'send-proposed-response': (_content: string) => true,
    'select-template': (_template: MessageTemplate) => true,
    'view-more-templates': () => true,
    'open-attachments': () => true,
    'open-emojis': () => true,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const messageText = ref('');
    const bookAIEnabledLocal = ref(props.bookAIEnabled);
    const internalMessagesRef = ref<HTMLElement | null>(null);
    const templatesPopoverRef = ref<InstanceType<typeof Popover> | null>(null);
    const templates = ref<MessageTemplate[]>(getMockMessageTemplates());
    const showTemplateConfirmDialog = ref(false);
    const selectedTemplate = ref<MessageTemplate | null>(null);

    // Inline editing state for proposed response
    const isEditingProposedResponse = ref(false);
    const editedProposedContent = ref('');

    // Preview mode state
    const isPreviewMode = ref(false);
    const aiPreparedResponse = ref<string | null>(null);
    const operatorInput = ref<string>('');

    // Auto-scroll internal messages to bottom
    const scrollInternalMessagesToBottom = async (): Promise<void> => {
      await nextTick();
      if (internalMessagesRef.value) {
        internalMessagesRef.value.scrollTop = internalMessagesRef.value.scrollHeight;
      }
    };

    // Watch for internal session messages changes to auto-scroll
    watch(
      () => props.internalSession?.messages?.length,
      () => {
        void scrollInternalMessagesToBottom();
      },
      { immediate: true },
    );

    // Reset preview state function (defined early for use in watchers)
    const resetPreviewState = (): void => {
      isPreviewMode.value = false;
      aiPreparedResponse.value = null;
      operatorInput.value = '';
    };

    // Format session time to HH:MM format
    const formatSessionTime = (timestamp: Date | string | undefined): string => {
      if (timestamp === undefined) {
        return '';
      }
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    // Sync local state with prop
    watch(
      () => props.bookAIEnabled,
      (newVal) => {
        bookAIEnabledLocal.value = newVal;
      },
    );

    // Reset preview when helpContext changes
    watch(
      () => props.helpContext,
      () => {
        resetPreviewState();
      },
    );

    // Check if the 24-hour window has expired
    const isConversationExpired = computed((): boolean => {
      return props.remainingHours !== null && props.remainingHours <= 0;
    });

    const inputPlaceholder = computed((): string => {
      // Show expired placeholder when 24h window has passed
      if (isConversationExpired.value) {
        return t('chat.expiredPlaceholder');
      }
      if (props.internalSession !== null && props.internalSession.status === 'active') {
        // Check if there's a proposed response - show refinement placeholder
        const messages = props.internalSession.messages;
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.isProposedGuestResponse === true) {
            return t('chat.internalConversation.refinePlaceholder');
          }
        }
        return t('chat.internalConversation.inputPlaceholder');
      }
      if (props.helpContext !== null) {
        return t('chat.aiHelp.inputPlaceholder');
      }
      if (props.bookAIEnabled) {
        return t('chat.aiActiveMessage');
      }
      return props.placeholder || t('chat.input.placeholder');
    });

    // Check if there's a proposed response waiting for action
    const proposedResponse = computed(() => {
      if (props.internalSession === null || props.internalSession.status !== 'active') {
        return null;
      }
      const messages = props.internalSession.messages;
      if (messages.length === 0) {
        return null;
      }
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isProposedGuestResponse === true) {
        return lastMessage;
      }
      return null;
    });

    // Mock AI response generator (will be replaced by API call)
    const generateMockAIResponse = (guestQuery: string, operatorInfo: string): string => {
      // Capitalize first letter of operator input
      const formattedInfo = operatorInfo.charAt(0).toUpperCase() + operatorInfo.slice(1);

      return `${formattedInfo}\n\n¿Hay algo más en lo que pueda ayudarte?`;
    };

    const prepareAIResponse = (text: string): void => {
      if (props.helpContext === null) {
        return;
      }

      operatorInput.value = text;
      aiPreparedResponse.value = generateMockAIResponse(props.helpContext.originalQuery, text);
      isPreviewMode.value = true;
    };

    const sendMessage = (): void => {
      const text = messageText.value.trim();
      if (!text) {
        return;
      }

      // Internal conversation active - send to internal conversation
      if (props.internalSession !== null && props.internalSession.status === 'active') {
        emit('internal-message', { content: text, withAI: bookAIEnabledLocal.value });
        messageText.value = '';
        return;
      }

      if (props.helpContext !== null && !isPreviewMode.value) {
        // AI help active - prepare response instead of sending
        prepareAIResponse(text);
      } else {
        // Normal send
        emit('send', text);
        messageText.value = '';
      }
    };

    const confirmAndSend = (): void => {
      if (aiPreparedResponse.value !== null) {
        emit('send', aiPreparedResponse.value, 'ai_assisted');
        messageText.value = '';
        resetPreviewState();
      }
    };

    const editResponse = (): void => {
      if (aiPreparedResponse.value !== null) {
        messageText.value = aiPreparedResponse.value;
        resetPreviewState();
      }
    };

    const cancelPreview = (): void => {
      messageText.value = operatorInput.value;
      resetPreviewState();
    };

    // Send the AI proposed response to the guest (uses edited content if in edit mode)
    const sendProposedResponse = (): void => {
      if (isEditingProposedResponse.value) {
        // Send the edited content
        const trimmed = editedProposedContent.value.trim();
        if (trimmed) {
          emit('send-proposed-response', trimmed);
          isEditingProposedResponse.value = false;
          editedProposedContent.value = '';
        }
      } else if (proposedResponse.value !== null) {
        emit('send-proposed-response', proposedResponse.value.content);
      }
    };

    // Start editing the AI proposed response inline
    const editProposedResponse = (): void => {
      if (proposedResponse.value !== null) {
        editedProposedContent.value = proposedResponse.value.content;
        isEditingProposedResponse.value = true;
      }
    };

    // Cancel inline editing of proposed response
    const cancelEditProposedResponse = (): void => {
      isEditingProposedResponse.value = false;
      editedProposedContent.value = '';
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      // Enter sends, Shift+Enter adds newline
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    // Toggle templates popover visibility
    const toggleTemplatesPopover = (event: Event): void => {
      templatesPopoverRef.value?.toggle(event);
    };

    // Handle template selection from popover - show confirmation dialog
    const handleTemplateSelect = (template: MessageTemplate): void => {
      templatesPopoverRef.value?.hide();
      selectedTemplate.value = template;
      showTemplateConfirmDialog.value = true;
    };

    // Handle view more templates action
    const handleViewMoreTemplates = (): void => {
      templatesPopoverRef.value?.hide();
      emit('view-more-templates');
    };

    // Handle template confirmation from dialog
    const handleTemplateConfirm = (template: MessageTemplate): void => {
      emit('select-template', template);
      selectedTemplate.value = null;
    };

    // Handle template cancel from dialog
    const handleTemplateCancel = (): void => {
      selectedTemplate.value = null;
    };

    // Handle manage template action
    const handleManageTemplate = (_template: MessageTemplate): void => {
      // TODO: Navigate to template management
    };

    return {
      t,
      messageText,
      bookAIEnabledLocal,
      inputPlaceholder,
      isPreviewMode,
      aiPreparedResponse,
      internalMessagesRef,
      proposedResponse,
      isEditingProposedResponse,
      editedProposedContent,
      isConversationExpired,
      templatesPopoverRef,
      templates,
      showTemplateConfirmDialog,
      selectedTemplate,
      sendMessage,
      confirmAndSend,
      editResponse,
      cancelPreview,
      sendProposedResponse,
      editProposedResponse,
      cancelEditProposedResponse,
      handleKeydown,
      toggleTemplatesPopover,
      handleTemplateSelect,
      handleViewMoreTemplates,
      handleTemplateConfirm,
      handleTemplateCancel,
      handleManageTemplate,
      formatSessionTime,
    };
  },
});
</script>

<style lang="scss" scoped>
.ai-help-panel {
  position: relative;
  margin-bottom: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid var(--p-surface-200);
  background: white;
  overflow-y: auto;
  max-height: 40vh;

  // Styled scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 0.5rem 0;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(248, 113, 113, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 45%),
      radial-gradient(ellipse at 60% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 90%, rgba(6, 182, 212, 0.12) 0%, transparent 45%);
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
  }

  // Inner shadow hint at bottom for scroll indication
  box-shadow: inset 0 -20px 20px -20px rgba(0, 0, 0, 0.08);

  > * {
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--p-surface-700);

    span {
      font-weight: 600;
      font-size: 0.9375rem;
    }
  }

  &__description {
    margin: 0 0 1rem;
    color: var(--p-surface-600);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  &__query {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: white;
    border-left: 3px solid #f97316;
    border-radius: 0 0.5rem 0.5rem 0;

    p {
      margin: 0;
      color: var(--p-surface-700);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }

  &__info {
    margin: 0;
    color: var(--p-surface-600);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  &__preview {
    &-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: var(--p-primary-color);

      span {
        font-weight: 600;
        font-size: 0.875rem;
      }
    }

    &-content {
      padding: 0.875rem 1rem;
      background: white;
      border-radius: 0.75rem;
      border: 1px solid var(--p-primary-200);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      p {
        margin: 0;
        color: var(--p-surface-700);
        font-size: 0.875rem;
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    &-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
  }
}

.textarea-wrapper {
  position: relative;

  &--rainbow {
    display: flex;
    padding: 2px;
    border-radius: var(--p-textarea-border-radius, 6px);
    background: linear-gradient(90deg, #f87171, #8b5cf6, #3b82f6, #06b6d4, #f87171);
    background-size: 300% 100%;
    animation: rainbow-border 3s linear infinite;

    :deep(.p-textarea) {
      flex: 1;
      border: none !important;
      border-radius: calc(var(--p-textarea-border-radius, 6px) - 2px);
      background: white;
    }
  }
}

@keyframes rainbow-border {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 300% 50%;
  }
}

// Internal Session Wrapper - contains ALL content when internal session is active
.internal-session-wrapper {
  position: relative;
  padding: 1rem;
  border-radius: 0.75rem;
  background-image: url('/app-images/internal-chat-bg.jpg');
  background-size: 200% 200%;
  background-position: 0% 50%;
  background-repeat: no-repeat;
  animation: gradient-flow 15s ease infinite;

  // Header
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__header-icon {
    color: var(--p-amber-600);
    flex-shrink: 0;
  }

  &__header-title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--p-surface-700);
  }

  &__context-badge {
    background: var(--p-orange-100);
    color: var(--p-orange-700);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
    white-space: nowrap;
  }

  &__header-time {
    font-size: 0.8125rem;
    color: var(--p-surface-500);
    flex-shrink: 0;
  }

  // Guest card
  &__guest-card {
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;

    p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--p-surface-700);
      line-height: 1.5;
    }
  }

  // Suggestion section
  &__suggestion {
    margin-bottom: 1rem;
  }

  &__suggestion-intro {
    font-size: 0.875rem;
    color: var(--p-surface-600);
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
  }

  &__response-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  &__response-text {
    font-size: 0.875rem;
    color: var(--p-surface-700);
    margin: 0 0 0.75rem 0;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  &__response-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;

    .edit-btn {
      color: #1d4ed8;
    }
  }

  &__edit-textarea {
    width: 100%;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  &__info {
    color: var(--p-surface-600);
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }

  // Input area - INSIDE the wrapper
  &__input-area {
    background: white;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;

    :deep(.p-textarea) {
      border: none;
      box-shadow: none;
      padding: 0;
      font-size: 0.875rem;

      &:focus {
        box-shadow: none;
      }
    }
  }

  &__input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }

  &__ai-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--p-surface-700);
  }

  &__send-btn {
    color: var(--p-surface-400);

    &:hover:not(:disabled) {
      color: var(--p-surface-600);
    }
  }
}

.ai-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-surface-600);
}

.ai-toggle--active {
  :deep(.p-toggleswitch-slider) {
    background: url('/app-images/toggle-ai-bg.png') center/cover no-repeat !important;
    border: none !important;
  }
}

.expiring-banner-wrapper {
  // Negate card content padding to make banner full-width
  margin: calc(var(--p-card-body-padding, 1.125rem) * -1);
  margin-bottom: var(--p-card-body-padding, 1.125rem);
}

.manual-mode-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.manual-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--p-surface-400);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover:not(:disabled) {
    color: var(--p-surface-600);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
