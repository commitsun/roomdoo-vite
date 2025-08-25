<template>
  <div class="login-container">
    <div class="login-form-header">
      <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="instance-name">{{ instanceName }}</div>
      <div class="first-input">
        <label class="label">
          {{ t('login.username') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText
            v-model="username"
            :placeholder="t('login.email')"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
          />
        </IconField>
      </div>
      <div class="second-input">
        <label class="label">
          {{ t('login.password') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="password"
            :placeholder="t('login.password')"
            :feedback="false"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
            toggleMask
          />
        </IconField>
        <Message v-if="errorMessage" severity="error" style="margin-top: 8px">
          {{ errorMessage }}
        </Message>
      </div>
      <div class="button">
        <Button
          :label="t('login.loginButton')"
          :disabled="!username || !password"
          @click="doLogin()"
        />
      </div>
      <div class="link">
        <a href="/request-reset-password">
          {{ t('login.forgotPassword') }}
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, type Ref, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconField, InputIcon, InputText, Password, Button, Message } from 'primevue';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUserStore } from '@/infrastructure/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';

export default defineComponent({
  components: {
    InputText,
    IconField,
    InputIcon,
    Password,
    Button,
    Message,
  },
  setup() {
    const { t } = useI18n();
    const instanceStore = useInstanceStore();
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const instanceName = computed(() => instanceStore.instance?.name ?? '');
    const doLogin = async () => {
      try {
        await userStore.login(username.value, password.value);
        await useLegacyStore().doVuexLogin(username.value, password.value);
        if (userStore.user) {
          const redirect = (route.query.redirect as string) || '/';
          router.replace(redirect);
        }
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          errorMessage.value = t('login.invalidCredentials');
        } else {
          errorMessage.value = t('error.unknownError');
        }
      }
    };

    return {
      username,
      password,
      instanceName,
      errorMessage,
      t,
      doLogin,
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
  .login-form-container {
    background-color: #ffffff;
    width: 100%;
    height: 100svh;

    padding: 2rem;
    margin-top: 2.5rem;
    font-size: 16px;

    .instance-name {
      font-weight: bold;
      margin-bottom: 1rem;
      font-size: 20px;
      margin-bottom: 1.5rem;
      color: #334155;
    }
    .p-error {
      color: red;
    }
    .first-input {
      margin-bottom: 1rem;
      .label {
        margin-bottom: 0.5rem;
        display: block;
        color: #334155;
      }
    }
    .second-input {
      margin-bottom: 2.5rem;
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
        background-color: #1d4ed8;
        border: none;
      }
    }
    .link {
      font-size: 14px;
      margin-top: 2rem;
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
    .login-form-container {
      width: 480px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0px 1px 3px 0px #0000001a;
    }
  }
}
</style>
