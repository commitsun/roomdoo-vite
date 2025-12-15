<template>
  <div class="login-container">
    <form>
      <div class="login-form-logo-header">
        <img src="/logos/logo-text.svg" class="logo" alt="Roomdoo Logo" />
      </div>
      <div class="login-card">
        <div class="login-card__image" v-if="instanceImage">
          <img :src="instanceImage" alt="Imagen del hotel" />
        </div>
        <div class="login-card__content">
          <div class="login-form-header">
            <img src="/logos/logo-text.svg" class="logo" alt="Roomdoo Logo" />
          </div>

          <div class="login-form-container">
            <div class="instance-name" :class="{ 'instance-name-error': errorMessage !== '' }">
              {{ instanceName }}
            </div>
            <Message
              class="mt-4 mb-3"
              v-if="errorMessage !== ''"
              severity="error"
              icon="pi pi-times-circle"
            >
              {{ errorMessage }}
            </Message>
            <div class="first-input">
              <label class="label" for="username">
                {{ t('login.username') }}
              </label>
              <InputText
                id="username"
                v-model="username"
                :placeholder="t('login.username')"
                :style="{ width: '100%' }"
                :inputStyle="{ width: '100%' }"
                autocomplete="username"
                :invalid="
                  errorMessage === t('login.invalidCredentials') ||
                  errorMessage === t('login.missingUsername') ||
                  errorMessage === t('login.missingUsernameAndPassword')
                "
              />
            </div>

            <div class="second-input">
              <label class="label" for="password-input">
                {{ t('login.password') }}
              </label>
              <Password
                id="password-input"
                inputId="password-input"
                v-model="password"
                :placeholder="t('login.password')"
                :feedback="false"
                :style="{ width: '100%' }"
                :inputStyle="{ width: '100%' }"
                toggleMask
                :inputProps="{ autocomplete: 'current-password' }"
                :invalid="
                  errorMessage === t('login.invalidCredentials') ||
                  errorMessage === t('login.missingPassword') ||
                  errorMessage === t('login.missingUsernameAndPassword')
                "
              />
            </div>
            <div class="button">
              <Button :label="t('login.loginButton')" @click="doLogin()" type="button" />
            </div>
            <div class="link">
              <a href="/request-reset-password">
                {{ t('login.forgotPassword') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useRoute, useRouter } from 'vue-router';

import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useUIStore } from '@/infrastructure/stores/ui';
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
    const pmsPropertiesStore = usePmsPropertiesStore();
    const uiStore = useUIStore();
    const router = useRouter();
    const route = useRoute();

    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const instanceName = computed(() => instanceStore.instance?.name ?? '');
    const instanceImage = computed(() => instanceStore.instance?.image ?? '');

    const doLogin = async (): Promise<void> => {
      if (!username.value && !password.value) {
        errorMessage.value = t('login.missingUsernameAndPassword');
        return;
      }
      if (!username.value) {
        errorMessage.value = t('login.missingUsername');
        return;
      }
      if (!password.value) {
        errorMessage.value = t('login.missingPassword');
        return;
      }

      let redirect = '/';
      uiStore.startLoading();
      try {
        await userStore.login(username.value, password.value);
        await useLegacyStore().doVuexLogin(username.value, password.value);
        await pmsPropertiesStore.fetchPmsProperties();
        if (userStore.user) {
          if (route.query.redirect !== undefined && route.query.redirect !== null) {
            redirect = route.query.redirect as string;
          } else if (
            route.params.pmsPropertyId !== undefined &&
            route.params.pmsPropertyId !== null
          ) {
            const pmsPropertyId = route.params.pmsPropertyId as string;
            redirect = `/${pmsPropertyId}`;
          }
          await router.replace(redirect);
        }
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          errorMessage.value = t('login.invalidCredentials');
        } else {
          errorMessage.value = (error as Error).message;
        }
      } finally {
        uiStore.stopLoading();
      }
    };

    watch([username, password], () => {
      errorMessage.value = '';
    });

    return {
      username,
      password,
      instanceName,
      instanceImage,
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
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1.5rem 1rem;
  background-color: transparent;
  box-sizing: border-box;

  form {
    width: 100%;
    display: flex;
    justify-content: center;
    .login-form-logo-header {
      display: none;
    }
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 10px 35px rgba(15, 23, 42, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .login-card__image img {
    width: 100%;
    height: 165px;
    object-fit: cover;
    display: block;
  }

  .login-card__content {
    padding: 1.75rem 1.75rem 2rem;
  }

  .login-form-header {
    display: flex;
    margin-bottom: 1.75rem;

    .logo {
      width: 150px;
      height: auto;
    }
  }

  .login-form-container {
    font-size: 14px;

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

    .link {
      font-size: 14px;
      margin-top: 2rem;
      a {
        color: #3b82f6;
        text-decoration: underline;
      }
    }
  }
}

@media (min-width: 768px) {
  .login-container {
    justify-content: center;
    height: 100%;
    form {
      display: flex;
      flex-direction: column;
      .login-form-logo-header {
        display: flex;
        justify-content: center;
        img {
          width: 270px;
          height: auto;
          margin-bottom: 5rem;
        }
      }
    }
    .login-card {
      flex-direction: row;
      max-width: none;
      .button {
        .p-button {
          height: 40px;
          font-size: 14px;
        }
      }
      .login-card__image {
        display: none;
      }
      &__content {
        width: 100%;
        padding: 32px;
      }
    }
    .login-form-header {
      display: none;
    }
    .login-form-container {
      height: auto;
      width: 100%;
      .instance-name {
        font-size: 20px;
      }
    }
  }
}
</style>
