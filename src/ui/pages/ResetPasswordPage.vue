<template>
  <div class="login-container">
    <div class="login-form-header">
      <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="reset-password-title">
        {{ t('resetPassword.title') }}
      </div>
      <div class="first-input">
        <label class="label">
          {{ t('resetPassword.newPassword') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-lock" />
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
        </IconField>
      </div>
      <div class="second-input">
        <label class="label">
          {{ t('resetPassword.repeatNewPassword') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-lock" />
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
        </IconField>
      </div>
      <Message v-if="firstPasswordError || secondPasswordError" severity="error">
        {{ translate(firstPasswordError || secondPasswordError) }}
      </Message>
      <Message v-else-if="errorMessage" severity="error">
        {{ errorMessage }}
      </Message>
      <div class="button">
        <Button
          :label="t('resetPassword.savePassword')"
          :disabled="!isFormValid"
          @click="() => handleSubmit(resetPassword)()"
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
import { defineComponent, computed, type Ref, onMounted, ref } from 'vue';
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
import { resetPasswordSchema } from '@/application/user/UserSchemas';
import { useUserStore } from '@/infrastructure/stores/user';
import { useRoute } from 'vue-router';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useTranslatedError } from '../composables/useTranslatedValidationError';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';

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
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const userStore = useUserStore();
    const notificationStore = useNotificationsStore();
    const uiStore = useUIStore();
    const { translate } = useTranslatedError();
    const errorMessage = ref('');

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

    const resetPassword = async () => {
      uiStore.startLoading();
      try {
        await userStore.resetPassword(firstPassword.value, route.query.token as string);
        notificationStore.add(t('resetPassword.passwordChanged'), 'success');
        // router.push('/login');
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          errorMessage.value = t('resetPassword.invalidToken');
        } else {
          errorMessage.value = t('error.unknownError');
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

    .reset-password-title {
      font-weight: bold;
      margin-bottom: 1rem;
      font-size: 20px;
      margin-bottom: 1.5rem;
      color: #334155;
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
      margin-bottom: 2rem;
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
    .login-form-container {
      width: 480px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0px 1px 3px 0px #0000001a;
    }
    .button {
      margin-top: 2rem;
    }
  }
}
</style>
