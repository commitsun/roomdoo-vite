<template>
  <div class="login-container">
    <div class="login-form-header">
      <img
        src="/logos/logo-black-new.svg"
        class="logo"
        alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="instance-name">
        Hotel Puente de la Toja
      </div>
      <div class="first-input">
        <label class="label">Usuario</label>
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText
            v-model="username"
            placeholder="Email"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
            />
        </IconField>
      </div>
      <div class="second-input">
        <label class="label">Contraseña</label>
        <IconField>
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="password"
            placeholder="Contraseña"
            :feedback="false"
            :style="{ width: '100%' }"
            :inputStyle="{ width: '100%' }"
            />
        </IconField>
      </div>
      <div class="button">
        <Button
          label="Iniciar sesión"
        />
      </div>
      <div class="link">
        <a href="#">¿Has olvidado tu contraseña?</a>
      </div>
    </div>
    <AppSelect
      v-model="selectedLocale"
      :options="locales"
      class="select-language"
      optionLabel="label"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconField, InputIcon, InputText, Password, Button, Select } from 'primevue';

export default defineComponent({
  components: {
    InputText,
    IconField,
    InputIcon,
    Password,
    Button,
    AppSelect: Select,
  },
  setup() {
    const { t, locale } = useI18n();

    const username = ref('');
    const password = ref('');
    const locales = ref([
      { label: 'Español', value: 'es' },
      { label: 'English', value: 'en' },
    ]);
    const selectedLocale = ref(locales.value.find((l) => l.value === locale.value));


    return {
      username,
      password,
      locales,
      selectedLocale,
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
    .instance-name {
      font-weight: bold;
      margin-bottom: 1rem;
      font-size: 20px;
      margin-bottom: 1.5rem;
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
      .p-button {
        width: 100%;
        background-color: #1D4ED8;
        border: none;
      }
    }
    .link {
      margin-top: 2rem;
      a {
        color: #64748B;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  .select-language {
    position: absolute;
    bottom: 2.5rem;
    right: 2rem;
    width: 200px;
    z-index: 10;
    background-color: #F8FAFC;
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
    }
    .select-language {
      bottom: 2rem;
      right: 5rem;
    }
  }
}
</style>
