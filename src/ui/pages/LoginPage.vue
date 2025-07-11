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
        <!-- this is an example of how to use it, but here it's not necessary -->
        <!-- <small v-if="usernameError" class="p-error">{{ t(usernameError) }}</small> -->
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
          />
        </IconField>
        <!-- this is an example of how to use it, but here it's not necessary -->
        <!-- <small v-if="passwordError" class="p-error">{{ t(passwordError) }}</small> -->
      </div>
      <div class="button">
        <Button
          :label="t('login.loginButton')"
          :disabled="!username || !password"
          @click="() => handleSubmit(onSubmit)()"
        />
      </div>
      <div class="link">
        <a href="#">
          {{ t('login.forgotPassword') }}
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconField, InputIcon, InputText, Password, Button } from 'primevue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { loginSchema } from '@/application/validation/UserSchemas';
import { useInstanceStore } from '@/infrastructure/stores/instance';

export default defineComponent({
  components: {
    InputText,
    IconField,
    InputIcon,
    Password,
    Button,
  },
  setup() {
    const { t } = useI18n();
    const instanceStore = useInstanceStore();
    // not necessary to use validations here but just an example
    const { handleSubmit } = useForm({
      validationSchema: toTypedSchema(loginSchema),
    });
    // not necessary to use validations here but just an example
    const { value: username, errorMessage: usernameError } = useField('username', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
    };
    // not necessary to use validations here but just an example
    const { value: password, errorMessage: passwordError } = useField('password', undefined, {
      validateOnValueUpdate: false,
    }) as {
      value: Ref<string>;
      errorMessage: Ref<string>;
    };
    const instanceName = computed(() => instanceStore.instance?.name ?? '');

    return {
      username,
      usernameError,
      password,
      passwordError,
      instanceName,
      t,
      handleSubmit,
      // not necessary to use validations here but just an example
      onSubmit: () => {
        console.log('Form submitted with:', {
          username: username.value,
          password: password.value,
        });
        // Here you would typically handle the login logic, e.g., calling an API
        // call to api login
      },
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
