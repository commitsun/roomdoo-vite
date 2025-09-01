<template>
  <div class="login-layout-container">
    <div
      class="image-container"
      :style="instanceImage ? { backgroundImage: `url(${instanceImage})` } : {}"
    />
    <div class="form-container">
      <router-view />
    </div>
    <Select
      v-if="availableLocales.length > 1"
      class="select-language"
      v-model="selectedLocale"
      :options="[...availableLocales]"
      optionLabel="label"
      optionValue="value"
    />
  </div>
</template>
<script lang="ts" setup>
import { type Ref, onMounted, ref, watch } from 'vue';
import Select from 'primevue/select';
import {
  i18n,
  updateI18nLocale,
  updateI18nAvailableLocales,
  availableLocales,
} from '@/infrastructure/plugins/i18n';

import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useRouter } from 'vue-router';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';

const router = useRouter();
const instanceStore = useInstanceStore();
const uiStore = useUIStore();

const selectedLocale = ref('');
const instanceImage: Ref<string | undefined> = ref('');

watch(selectedLocale, (newLocale) => {
  if (newLocale) {
    updateI18nLocale(newLocale);
    updatePrimevueLocale(newLocale);
  }
});

onMounted(async () => {
  selectedLocale.value = i18n.global.locale.value;
  try {
    uiStore.startLoading();
    await instanceStore.fetchInstance();
    instanceImage.value = instanceStore.instance?.image;
    updateI18nAvailableLocales(instanceStore.instance?.languages);
  } catch (err) {
    router.push({ name: 'instance-not-found' });
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
