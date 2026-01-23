<template>
  <div v-if="instance" class="login-layout-container">
    <div class="login-layout grid grid-cols-1 md:grid-cols-12 gap-[24px]">
      <div
        class="image-container md:col-span-5"
        :style="
          instanceImage
            ? { backgroundImage: `url(${instanceImage})` }
            : { backgroundImage: `url(/app-images/login-color-gradient.png)` }
        "
      />

      <div class="form-column col-span-12 md:col-span-7">
        <div class="grid grid-cols-12 w-full">
          <div class="form-and-language col-span-12 md:col-span-10 md:col-start-2">
            <div class="form-inner">
              <div class="form-container">
                <router-view />
              </div>

              <div class="language-select-wrapper">
                <Select
                  v-if="availableLocales.length > 1 && instance"
                  class="language-select"
                  v-model="selectedLocale"
                  :options="availableLocales"
                  optionLabel="name"
                  optionValue="code"
                  aria-label="language-select"
                >
                  <template #value="{ value }">
                    <div v-if="value" class="language-select-value">
                      <Globe :size="15" />
                      <span class="language-select-text">
                        {{ availableLocales.find((locale) => locale.code === value)?.name }}
                      </span>
                    </div>
                  </template>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Ref, computed, onMounted, ref, watch } from 'vue';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { Globe } from 'lucide-vue-next';

import { i18n } from '@/infrastructure/plugins/i18n';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUIStore } from '@/infrastructure/stores/ui';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';

const toast = useToast();
const instanceStore = useInstanceStore();
const uiStore = useUIStore();

const selectedLocale = ref('');
const instanceImage: Ref<string | undefined> = ref('');

const instance = computed(() => instanceStore.instance);
const availableLocales = computed(() => {
  return (
    instanceStore.instance?.languages?.map((lang) => ({
      name: lang.name,
      code: lang.code,
    })) ?? [
      window.navigator.language === 'en-GB' ? APP_LANGUAGES[2] : APP_LANGUAGES[0],
      APP_LANGUAGES[1],
    ]
  );
});

watch(selectedLocale, (newLocale) => {
  if (newLocale) {
    i18n.global.locale.value = newLocale;
    updatePrimevueLocale(newLocale);
  }
});

onMounted(async () => {
  selectedLocale.value = i18n.global.locale.value;
  try {
    uiStore.startLoading();
    await instanceStore.fetchInstance();
    const url = instanceStore.instance?.image;

    if (url !== undefined) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = (): void => resolve();
        img.onerror = (): void => resolve();
      });
      instanceImage.value = url;
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: i18n.global.t('error.connectionError'),
      detail: i18n.global.t('error.connectionErrorDetail'),
      life: 8000,
      closable: true,
    });
  } finally {
    uiStore.stopLoading();
  }
});
</script>

<style lang="scss" scoped>
.login-layout-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
  background-color: #eef2f7;
  overflow-x: hidden;
}

.login-layout {
  width: 100%;
}

.image-container {
  display: none;
  background-color: #eef2f7;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  min-height: 200px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.25);
    pointer-events: none;
    z-index: 1;
  }
}

@media (min-width: 768px) {
  .image-container {
    display: block;
    min-height: 100vh;
    border-radius: 0 20px 20px 0;
  }
}

.form-column {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.form-and-language {
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .form-and-language {
    max-width: 600px;
  }
}

.form-inner {
  width: 100%;
  max-width: 420px;
}

@media (min-width: 768px) {
  .form-inner {
    max-width: none;
  }
}

.form-container {
  width: 100%;
}

.language-select-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.language-select {
  margin-top: 0.75rem;
  margin-right: 0.75rem;
  width: 215px;
}

.language-select-value {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.25rem;
}

.language-select-text {
  white-space: nowrap;
}
</style>
