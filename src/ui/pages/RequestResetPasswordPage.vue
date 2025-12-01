<template>
  <div class="request-password-container">
    <div class="request-password-form-logo-header">
      <img src="/logos/logo-text.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="request-password-card">
      <div class="request-password-card__image" v-if="instanceImage">
        <img :src="instanceImage" alt="Imagen del hotel" />
      </div>
      <div class="request-password-card__content">
        <div class="request-password-form-header">
          <img src="/logos/logo-text.svg" class="logo" alt="Roomdoo Logo" />
        </div>
        <div class="request-password-form-container">
          <div class="request-password">
            {{ t('requestResetPassword.resetPassword') }}
          </div>
          <div class="request-password-title">
            {{ t('requestResetPassword.title') }}
          </div>
          <div class="first-input">
            <label class="label" for="username">
              {{ t('login.email') }}
            </label>
            <InputText
              v-model="username"
              :placeholder="t('requestResetPassword.email')"
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
            />
          </div>
          <div class="button">
            <Button
              :label="t('requestResetPassword.sendRequest')"
              :disabled="!username"
              @click="sendRequestChangePassword"
            />
          </div>
          <a href="/login">
            <ArrowLeft :size="18" color="#3B82F6" style="margin-top: 1px" />
            {{ t('resetPassword.backToLogin') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { ArrowLeft } from 'lucide-vue-next';

import { useUserStore } from '@/infrastructure/stores/user';
import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useInstanceStore } from '@/infrastructure/stores/instance';

export default defineComponent({
  components: {
    Button,
    InputText,
    ArrowLeft,
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    const notificationStore = useNotificationsStore();
    const instanceStore = useInstanceStore();
    const instanceImage = computed(() => instanceStore.instance?.image ?? '');
    const username = ref('');
    const sendRequestChangePassword = async (): Promise<void> => {
      await userStore.requestChangePassword(username.value);
      notificationStore.add(t('requestResetPassword.requestSent'), 'success');
    };
    return {
      username,
      instanceImage,
      t,
      sendRequestChangePassword,
    };
  },
});
</script>
<style scoped lang="scss">
.request-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1.5rem 1rem;
  background-color: transparent;
  box-sizing: border-box;

  .request-password-form-logo-header {
    display: none;
  }

  .request-password-card {
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 10px 35px rgba(15, 23, 42, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .request-password-card__image img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    display: block;
  }

  .request-password-card__content {
    padding: 1.75rem 1.75rem 2rem;
  }

  .request-password-form-header {
    display: flex;
    margin-bottom: 1.75rem;

    .logo {
      width: 150px;
      height: auto;
    }
  }

  .request-password-form-container {
    .request-password {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #334155;
    }
    .request-password-title {
      margin-bottom: 1rem;
      margin-bottom: 1.5rem;
      color: #334155;
      font-size: 13px;
    }
    .instance-name {
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 18px;
      color: #334155;
    }
    .instance-name-error {
      margin-bottom: 0 !important;
    }

    .p-error {
      color: red;
    }

    .first-input,
    .second-input {
      margin-bottom: 1.5rem;

      .label {
        margin-bottom: 0.5rem;
        display: block;
        color: #334155;
      }
    }

    .second-input {
      margin-bottom: 2rem;
    }

    .button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;

      .p-button {
        width: 100%;
        border: none;
        height: 28px;
        font-size: 12px;
      }
    }

    a {
      font-size: 14px;
      margin-top: 2rem;
      display: flex;
      align-items: center;
      color: #3b82f6;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
:deep(.p-inputtext) {
  font-size: 12px;
  height: 28px;
}

@media (min-width: 768px) {
  .request-password-container {
    justify-content: center;
    height: 100%;

    .request-password-form-logo-header {
      display: flex;
      justify-content: center;
      img {
        width: 270px;
        height: auto;
        margin-bottom: 5rem;
      }
    }
    .request-password-card {
      flex-direction: row;
      max-width: 800px;
      .button {
        .p-button {
          height: 40px;
          font-size: 14px;
        }
      }
      .request-password-card__image {
        display: none;
      }
    }
    .request-password-form-header {
      display: none;
    }
    .request-password-form-container {
      width: 480px;
      height: auto;
      .request-password {
        font-size: 24px;
      }
      .request-password-title {
        font-size: 15px;
        margin-bottom: 2rem;
      }
      .instance-name {
        margin-top: 1rem;
        margin-bottom: 2rem;
        font-size: 24px;
      }
      .link {
        margin-top: 3rem;
        margin-bottom: 1rem;
      }
    }
  }
  :deep(.p-inputtext) {
    font-size: 14px;
    height: 35px;
  }
}
</style>
