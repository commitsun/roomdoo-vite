<template>
  <div class="login-layout-container">
    <div
      class="image-container"
      :style="instanceImage ? { backgroundImage: `url(${instanceImage})` } : {}"
    />
    <div class="form-container">
      <router-view />
    </div>
    <AppSelect
      v-if="locales.length > 1"
      class="select-language"
      v-model="selectedLocale"
      :options="locales"
      optionLabel="label"
    />
  </div>
</template>
<script lang="ts" setup>
import { type Ref, onMounted, ref, watch } from 'vue';
import AppSelect from 'primevue/select';
import { i18n, updateI18nAvailableLocales, SUPPORTED_LOCALES } from '@/ui/plugins/i18n';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useRouter } from 'vue-router';
import { updateAppLocale } from '@/ui/localeManager/localeManagerService';

const router = useRouter();
const instanceStore = useInstanceStore();
const uiStore = useUIStore();

const locales = ref(SUPPORTED_LOCALES);

const selectedLocale = ref(locales.value.find((l) => l.value === i18n.global.locale.value));
const instanceImage: Ref<string | undefined> = ref('');

watch(selectedLocale, (newLocale) => {
  if (newLocale) {
    updateAppLocale(newLocale.value);
    localStorage.setItem('roomdoo-locale', newLocale.value);
  }
});

onMounted(async () => {
  try {
    uiStore.startLoading();
    await instanceStore.fetchInstance();
    instanceImage.value = instanceStore.instance?.image;
    locales.value = updateI18nAvailableLocales(instanceStore.instance?.languages);
    const savedLocale = localStorage.getItem('roomdoo-locale');
    const foundLocale = locales.value.find((l) => l.value === (savedLocale || i18n.global.locale.value));
    selectedLocale.value = foundLocale || locales.value[0];
    updateAppLocale(selectedLocale.value.value);
  } catch (err) {
    router.push({ name: 'hotel-not-found' });
  } finally {
    uiStore.stopLoading();
  }
});
</script>

<style lang="scss" scoped>
.login-layout-container {
  min-width: 360px;
  min-height: 667px;
  height: 100svh;
  background-color: #eeeeee;
  display: flex;
  position: relative;
  .image-container {
    display: none;
  }
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: #f9fafb;
  }
  .select-language {
    position: absolute;
    bottom: 2.5rem;
    right: 2rem;
    width: 200px;
    z-index: 10;
    background-color: #f8fafc;
  }
}
@media (min-width: 1024px) {
  .login-layout-container {
    .image-container {
      position: relative;
      display: flex;
      width: 33.3%;
      height: 100%;
      background: linear-gradient(to bottom left, #2a0a58, #081b2b, #0e96c8);
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1;
        pointer-events: none;
      }
    }
    .form-container {
      width: 66.6%;
    }
    .select-language {
      bottom: 2rem;
      right: 5rem;
    }
  }
}
</style>
