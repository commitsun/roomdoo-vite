<template>
  <div class="not-found">
    <h1 class="not-found__code">404</h1>
    <p class="not-found__title">{{ t('error404.title') }}</p>
    <p class="not-found__message">
      {{ t('error404.message') }}
    </p>
    <router-link to="/" class="not-found__button">
      {{ t('error404.button') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped lang="scss">
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

  &__code {
    font-size: 6rem;
    font-weight: 800;
    letter-spacing: -1px;
    margin: 0;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1rem;
  }

  &__message {
    font-size: 1rem;
    color: #6b7280;
    margin-top: 0.5rem;
    max-width: 400px;
  }

  &__button {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    background-color: #1d4ed8;
    color: #ffffff;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: background-color 0.2s ease;
  }
}

@media (min-width: 1024px) {
  .not-found {
    &__select-language {
      bottom: 2rem;
      right: 5rem;
    }
  }
}
</style>
