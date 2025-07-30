<template>
  <div class="login-container">
    <div class="login-form-header">
        <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="request-password-container">
      <div class="request-password-title">
        {{ t('requestResetPassword.title') }}
      </div>
      <div class="input">
        <label class="label">
          {{ t('requestResetPassword.username') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText
            v-model="username"
            :placeholder="t('requestResetPassword.email')"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
          />
        </IconField>
      </div>
      <div class="button">
        <Button
          :label="t('requestResetPassword.sendRequest')"
          :disabled="!username"
          @click="sendRequestPassword"
        />
      </div>
      <div class="back-link">
        <a href="/login">
          {{ t('resetPassword.backToLogin') }}
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button, InputText, IconField, InputIcon } from 'primevue';
import { useUserStore } from '@/infrastructure/stores/user';
import { useNotificationStore } from '@/infrastructure/stores/notification';

export default defineComponent({
  components: {
    Button,
    InputText,
    IconField,
    InputIcon,
  },
  setup() {

    const { t } = useI18n();
    const userStore = useUserStore();
    const notificationStore = useNotificationStore();
    const username = ref('');
    const sendRequestPassword = async () => {
      await userStore.requestPassword(username.value);
        notificationStore.add(t('requestResetPassword.requestSent'), 'success');
      };
    return {
      username,
      t,
      sendRequestPassword,
    };
  },
});
</script>
<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100svh;
  width: 100%;
  background-color: #f9fafb;
  padding-top: 2rem;
  position: relative;
  .login-form-header {
    .logo {
      width: 200px;
      height: auto;
    }
  }
  .request-password-container {
    background-color: #ffffff;
    width: 100%;
    height: 100svh;
    padding: 2rem;
    margin-top: 2.5rem;
    font-size: 16px;

    .request-password-title {
      font-weight: bold;
      margin-bottom: 1rem;
      margin-bottom: 1.5rem;
      color: #334155;
    }
    .input {
      margin-bottom: 1rem;
      .label {
        margin-bottom: 0.5rem;
        display: block;
        color: #334155;
      }
    }
    .button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-size: 16px;
      .p-button {
        width: 100%;
        background-color: #1D4ED8;
        border: none;
      }
    }
    .back-link {
      margin-top: 1.5rem;
      font-size: 14px;
      a {
        color: #64748b;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
@media (min-width: 640px) {
  .login-container {
    justify-content: center;
    height: 100%;
    .login-form-header {
      .logo {
        width: 270px;
      }
    }
    .request-password-container {
      width: 480px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0px 1px 3px 0px #0000001a;
    }
    .button {
      margin-top: 4rem !important;
    }
  }
}
</style>
