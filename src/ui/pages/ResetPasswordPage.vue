<template>
  <div class="login-container">
    <div class="login-form-header">
      <img
        src="/logos/logo-black-new.svg"
        class="logo"
        alt="Roomdoo Logo"
      />
    </div>
    <div class="login-form-container">
      <div class="reset-password-title">
        {{ t('resetPassword.title') }}
      </div>
      <div class="first-input">
        <label class="label">
          {{ t('resetPassword.new_password') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="password"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
            :placeholder="t('resetPassword.password')"
            :promptLabel="t('resetPassword.enter_password')"
            toggleMask
            @blur="passwordBlur"
          >
            <template #header>
              <div class="font-semibold text-xm mb-4">
                {{ t('resetPassword.choose_new_password') }}
              </div>
            </template>
            <template #footer>
              <Divider />
              <ul class="pl-2 my-0 text-sm">
                <li>{{ t('resetPassword.minimum_chars', {count: 8}) }}</li>
                <li>{{ t('resetPassword.password_letter_required') }}</li>
                <li>{{ t('resetPassword.password_number_required') }}</li>
              </ul>
            </template>
          </Password>
        </IconField>
      </div>
      <div class="second-input">
        <label class="label">
          {{ t('resetPassword.repeat_new_password') }}
        </label>
        <IconField>
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="confirmPassword"
            :placeholder="t('resetPassword.password')"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
            :promptLabel="t('resetPassword.enter_password')"
            toggleMask
            @blur="confirmPasswordBlur"
          >
            <template #header>
              <div class="font-semibold text-xm mb-4">
                {{ t('resetPassword.repeat_new_password') }}
              </div>
            </template>
            <template #footer>
              <Divider />
              <ul class="pl-2 my-0 text-sm">
                <li>{{ t('resetPassword.minimum_chars', {count: 8}) }}</li>
                <li>{{ t('resetPassword.password_letter_required') }}</li>
                <li>{{ t('resetPassword.password_number_required') }}</li>
              </ul>
            </template>
          </Password>
        </IconField>
      </div>
      <Message
        v-if="passwordError || confirmPasswordError"
        severity="error"
      >
        {{ t(passwordError || confirmPasswordError) }}
      </Message>
      <div class="button">
        <Button
          :label="t('resetPassword.save_password')"
          :disabled="!isFormValid"
          @click="() => handleSubmit(onSubmit)()"
        />
      </div>
      <div class="back-link">
        <a href="/login">
          {{ t('resetPassword.back_to_login') }}
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, type Ref, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconField, InputIcon, InputText, Password, Button, Select, Divider, Message } from 'primevue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { resetPasswordSchema } from '@/application/validation/UserSchemas';
import { useUserStore } from '@/infrastructure/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '@/infrastructure/stores/notification';
import { useTranslatedError } from '@/ui/composables/useTranslatedValidationError';

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
    const router = useRouter();
    const userStore = useUserStore();
    const notificationStore = useNotificationStore();
    const { translate } = useTranslatedError();

    const { handleSubmit } = useForm({
      validationSchema: toTypedSchema(resetPasswordSchema),
    });

    const { value: password, errorMessage: passwordError, handleBlur: passwordBlur } = useField('password', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
      handleBlur: () => void;
    };

    const { value: confirmPassword, errorMessage: confirmPasswordError, handleBlur: confirmPasswordBlur } = useField('confirmPassword', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
      handleBlur: () => void;
    };

    const onSubmit = async () => {
      try {
        await userStore.resetPassword(password.value, route.query.token as string);
        notificationStore.add(t('resetPassword.password_changed'), 'success');
        router.push('/login');
      } catch (error: any) {
        notificationStore.add(translate(error.code) || t('UNKNOWN_ERROR'), 'error');
      }
    };

    const isFormValid = computed(() => {
      return password.value && confirmPassword.value;
    });


    return {
      password,
      passwordError,
      confirmPassword,
      confirmPasswordError,
      isFormValid,
      handleSubmit,
      t,
      passwordBlur,
      confirmPasswordBlur,
      onSubmit,
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
  background-color: #F9FAFB;
  padding-top: 2rem;
  position: relative;
  .login-form-header {
    .logo {
      width: 200px;
      height: auto;
    }
  }
  .login-form-container {
    background-color: #FFFFFF;
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
    .login-form-container {
      width: 480px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0px 1px 3px 0px #0000001A;
    }
    .button {
      margin-top: 2rem;
    }
  }
}
</style>
