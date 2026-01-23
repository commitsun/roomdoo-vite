<template>
  <div class="expired-banner">
    <FilePlus2 :size="20" class="expired-banner__icon" />
    <p class="expired-banner__text">
      {{ t('chat.expiredBanner.message') }}
      <a href="#" class="expired-banner__link" @click.prevent="$emit('open-templates', $event)">
        {{ t('chat.expiredBanner.sendTemplates') }}
      </a>
      {{ t('chat.expiredBanner.toReactivate') }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { FilePlus2 } from 'lucide-vue-next';

export default defineComponent({
  name: 'ExpiredConversationBanner',
  components: {
    FilePlus2,
  },
  emits: {
    'open-templates': (_event: Event) => true,
  },
  setup() {
    const { t } = useI18n();

    return {
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
.expired-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;

  &__icon {
    flex-shrink: 0;
    color: #dc2626;
  }

  &__text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #dc2626;
  }

  &__link {
    color: #dc2626;
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      color: #b91c1c;
    }
  }
}
</style>
