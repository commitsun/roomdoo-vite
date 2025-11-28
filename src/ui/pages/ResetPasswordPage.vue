<template>
  <div class="reset-password-container">
    <div class="reset-password-form-logo-header">
      <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="reset-password-card">
      <div class="reset-password-card__image" v-if="instanceImage">
        <img :src="instanceImage" alt="Imagen del hotel" />
      </div>
      <div class="reset-password-card__content">
        <div class="reset-password-form-header">
          <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
        </div>
        <div class="reset-password-form-container">
          <div class="request-password">
            {{ t('requestResetPassword.resetPassword') }}
          </div>
          <Message
            class="mt-4 mb-3"
            v-if="firstPasswordError || secondPasswordError"
            severity="error"
            icon="pi pi-times-circle"
          >
            {{ translate(firstPasswordError || secondPasswordError) }}
          </Message>
          <Message
            v-else-if="errorMessage"
            severity="error"
            icon="pi pi-times-circle"
            class="mt-4 mb-3"
          >
            {{ errorMessage }}
          </Message>
          <div class="first-input">
            <label class="label" for="username">
              {{ t('login.email') }}
            </label>
            <Password
              v-model="firstPassword"
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
              :placeholder="t('resetPassword.password')"
              :promptLabel="t('resetPassword.enterPassword')"
              toggleMask
              @blur="firstPasswordBlur"
            >
              <template #header>
                <div class="font-semibold text-xm mb-4">
                  {{ t('resetPassword.chooseNewPassword') }}
                </div>
              </template>
              <template #footer>
                <Divider />
                <ul class="pl-2 my-0 text-sm">
                  <li>{{ t('resetPassword.minimumChars', { count: 8 }) }}</li>
                  <li>{{ t('resetPassword.passwordLetterRequired') }}</li>
                  <li>{{ t('resetPassword.passwordNumberRequired') }}</li>
                </ul>
              </template>
            </Password>
          </div>
          <div class="second-input">
            <label class="label" for="password-input">
              {{ t('login.password') }}
            </label>
            <Password
              v-model="secondPassword"
              :placeholder="t('resetPassword.password')"
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
              :promptLabel="t('resetPassword.enterPassword')"
              toggleMask
              @blur="secondPasswordBlur"
            >
              <template #header>
                <div class="font-semibold text-xm mb-4">
                  {{ t('resetPassword.repeatNewPassword') }}
                </div>
              </template>
              <template #footer>
                <Divider />
                <ul class="pl-2 my-0 text-sm">
                  <li>{{ t('resetPassword.minimumChars', { count: 8 }) }}</li>
                  <li>{{ t('resetPassword.passwordLetterRequired') }}</li>
                  <li>{{ t('resetPassword.passwordNumberRequired') }}</li>
                </ul>
              </template>
            </Password>
          </div>
          <div class="button">
            <Button
              :label="t('resetPassword.savePassword')"
              :disabled="!isFormValid"
              @click="() => handleSubmit(resetPassword)()"
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
import { defineComponent, computed, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

import { useTranslatedError } from '@/ui/composables/useTranslatedValidationError';
import { resetPasswordSchema } from '@/application/user/UserSchemas';
import { useUserStore } from '@/infrastructure/stores/user';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useInstanceStore } from '@/infrastructure/stores/instance';

export default defineComponent({
  components: {
    InputText,
    IconField,
    InputIcon,
    Password,
    Button,
    AppSelect: Select,
    Divider,
    Message,
    ArrowLeft,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const userStore = useUserStore();
    const notificationStore = useNotificationsStore();
    const uiStore = useUIStore();
    const instanceStore = useInstanceStore();
    const { translate } = useTranslatedError();
    const errorMessage = ref('');

    const instanceImage = computed(() => instanceStore.instance?.image ?? '');

    const { handleSubmit } = useForm({
      validationSchema: toTypedSchema(resetPasswordSchema),
    });

    const {
      value: firstPassword,
      errorMessage: firstPasswordError,
      handleBlur: firstPasswordBlur,
    } = useField('firstPassword', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
      handleBlur: () => void;
    };

    const {
      value: secondPassword,
      errorMessage: secondPasswordError,
      handleBlur: secondPasswordBlur,
    } = useField('secondPassword', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
      handleBlur: () => void;
    };

    const resetPassword = async (): Promise<void> => {
      uiStore.startLoading();
      try {
        await userStore.resetPassword(firstPassword.value, route.query.token as string);
        notificationStore.add(t('resetPassword.passwordChanged'), 'success');
        // router.push('/login');
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          errorMessage.value = t('resetPassword.invalidToken');
        } else {
          errorMessage.value = (error as Error).message;
        }
      } finally {
        uiStore.stopLoading();
      }
    };

    const isFormValid = computed(() => {
      return firstPassword.value && secondPassword.value;
    });

    return {
      firstPassword,
      firstPasswordError,
      secondPassword,
      secondPasswordError,
      isFormValid,
      handleSubmit,
      errorMessage,
      instanceImage,
      t,
      firstPasswordBlur,
      secondPasswordBlur,
      resetPassword,
      translate,
    };
  },
});
</script>
<style scoped lang="scss">
.reset-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1.5rem 1rem;
  background-color: transparent;
  box-sizing: border-box;

  .reset-password-form-logo-header {
    display: none;
  }

  .reset-password-card {
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 10px 35px rgba(15, 23, 42, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .reset-password-card__image img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    display: block;
  }

  .reset-password-card__content {
    padding: 1.75rem 1.75rem 2rem;
  }

  .reset-password-form-header {
    display: flex;
    margin-bottom: 1.75rem;

    .logo {
      width: 150px;
      height: auto;
    }
  }

  .reset-password-form-container {
    .request-password {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #334155;
    }
    .reset-password-title {
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
  .reset-password-container {
    justify-content: center;
    height: 100%;

    .reset-password-form-logo-header {
      display: flex;
      justify-content: center;
      img {
        width: 270px;
        height: auto;
        margin-bottom: 5rem;
      }
    }
    .reset-password-card {
      flex-direction: row;
      max-width: 800px;
      .button {
        .p-button {
          height: 40px;
          font-size: 14px;
        }
      }
      .reset-password-card__image {
        display: none;
      }
    }
    .reset-password-form-header {
      display: none;
    }
    .reset-password-form-container {
      width: 480px;
      height: auto;
      .request-password {
        font-size: 24px;
      }
      .reset-password-title {
        font-size: 15px;
        margin-bottom: 2rem;
      }
      .instance-name {
        margin-top: 1rem;
        margin-bottom: 2rem;
        font-size: 24px;
      }
    }
  }
  :deep(.p-inputtext) {
    font-size: 14px;
    height: 35px;
  }
}
</style>
