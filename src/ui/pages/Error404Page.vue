<template>
  <div class="not-found">
    <h1 class="code">404</h1>
    <p class="title">{{ t('error404.title') }}</p>
    <p class="message">
      {{ t('error404.message') }}
    </p>
    <router-link to="/" class="button">
      {{ t('error404.button') }}
    </router-link>
    <AppSelect
      v-if="locales.length > 1"
      class="select-language"
      v-model="selectedLocale"
      :options="locales"
      optionLabel="label"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SUPPORTED_LOCALES, i18n } from '@/ui/plugins/i18n';
import { updateAppLocale } from '@/ui/localeManager/localeManagerService';
import AppSelect from 'primevue/select';

const { t } = useI18n();

const locales = ref(SUPPORTED_LOCALES);
const selectedLocale = ref(locales.value.find((l) => l.value === i18n.global.locale.value));

watch(selectedLocale, (newLocale) => {
  if (newLocale) {
    updateAppLocale(newLocale.value);
    localStorage.setItem('roomdoo-locale', newLocale.value);
  }
});
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: #f9fafb;
  color: #111827;
  position: relative;
  .code {
    font-size: 6rem;
    font-weight: 800;
    letter-spacing: -1px;
    margin: 0;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1rem;
  }

  .message {
    font-size: 1rem;
    color: #6b7280;
    margin-top: 0.5rem;
    max-width: 400px;
  }

  .button {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    background-color: #1d4ed8;
    color: #ffffff;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: background-color 0.2s ease;
  }

  .select-language {
    position: absolute;
    bottom: 2.5rem;
    right: 2rem;
    width: 200px;
    z-index: 10;
    background-color: #f8fafc;
    text-align: left;
  }

}

@media (min-width: 1024px) {
  .not-found {
    .select-language {
      bottom: 2rem;
      right: 5rem;
    }
  }
}

</style>
