<template>
  <div class="login-layout-container" v-if="instance && instanceImage">
    <div
      v-if="instance"
      class="image-container"
      :style="instanceImage ? { backgroundImage: `url(${instanceImage})` } : {}"
    />
    <div class="main-form">
      <div class="form-and-language">
        <div class="form-container">
          <router-view />
        </div>
        <Select
          v-if="availableLocales.length > 1 && instance"
          class="select-language"
          v-model="selectedLocale"
          :options="availableLocales"
          optionLabel="name"
          optionValue="code"
          aria-label="language-select"
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center w-full gap-1">
              <Globe :size="15" />
              <span class="whitespace-nowrap">{{
                availableLocales.find((locale) => locale.code === value)?.name
              }}</span>
            </div>
          </template>
        </Select>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type Ref, computed, onMounted, ref, watch } from 'vue';
import Select from 'primevue/select';
import { useRouter } from 'vue-router';
import { Globe } from 'lucide-vue-next';

import { i18n } from '@/infrastructure/plugins/i18n';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUIStore } from '@/infrastructure/stores/ui';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';

const router = useRouter();
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
    // update i18n locale
    i18n.global.locale.value = newLocale;
    // update primevue locale
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
    await router.push({ name: 'instance-not-found' });
  } finally {
    uiStore.stopLoading();
  }
});
</script>

<style lang="scss" scoped>
.login-layout-container {
  min-width: 360px;
  height: 100svh;
  background-color: #eef2f7;
  display: flex;
  justify-content: center;
  align-items: center;

  .image-container {
    display: none;
  }
  .main-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100svh;
    width: 100%;
    .form-and-language {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100svh;
      min-width: 360px;
      .form-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        background-color: transparent;
      }
      .select-language {
        width: 70%;
        margin-left: auto;
        height: 35px;
        max-width: 270px;
        margin-right: 1rem;
      }
    }
  }
}
:deep(.p-select-label) {
  font-size: 12px;
  height: 35px;
}

@media (min-width: 480px) {
  .login-layout-container {
    .main-form {
      .form-and-language {
        min-width: 400px;
      }
    }
  }
}

@media (min-width: 640px) {
  .login-layout-container {
    .main-form {
      .form-and-language {
        min-width: 580px;
        .select-language {
          margin-right: 6rem;
        }
      }
    }
  }
}

@media (min-width: 768px) {
  .login-layout-container {
    .image-container {
      position: relative;
      display: flex;
      width: 50%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
      background:
        linear-gradient(100deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 82%),
        radial-gradient(circle at 0% 105%, #1990d8 0%, #0a304a 38%, rgba(5, 18, 32, 0) 70%),
        linear-gradient(180deg, #1f55dd 0%, #16386e 42%, #071521 100%);
      background-repeat: no-repeat;
      background-size: cover;
    }

    .image-container::before {
      content: none;
    }

    .form-container {
      width: 66.6%;
    }
    .main-form {
      .form-and-language {
        min-width: 580px;
        .select-language {
          margin-right: 1rem;
          margin-top: 2rem;
        }
      }
    }
  }
  :deep(.p-select-label) {
    font-size: 14px;
    height: 40px;
  }
}
@media (min-width: 1024px) {
  .login-layout-container {
    .image-container {
      width: 33.3%;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1;
        pointer-events: none;
      }
    }
  }
}
</style>
