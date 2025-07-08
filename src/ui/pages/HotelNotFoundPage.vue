<template>
  <div class="login-container">
    <div class="login-form-header">
      <img
        src="/logos/logo-black-new.svg"
        class="logo"
        alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="instance-not-found">
        {{ t('hotel_not_found', { instanceName: "hotel de Brais" }) }}
      </div>
      <div>
        {{ t('hotel_not_found_description') }}
      </div>
      <div class="hotel_not_found_contact">
        {{ t('hotel_not_found_contact') }}
      </div>
      <div>{{ t('hotel_not_found_contact_description') }}</div>
      <div class="button">
        <Button
          :label="t('sign_up')"
        />
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
  import { defineComponent, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {  Button, Select } from 'primevue';

  export default defineComponent({
    components: {
      Button,
      AppSelect: Select,
    },
    setup() {
    const { t, locale } = useI18n();
    const locales = ref([
      { label: 'Español', value: 'es' },
      { label: 'English', value: 'en' },
    ]);
    const selectedLocale = ref(locales.value.find((l) => l.value === locale.value));

    watch(selectedLocale, (newLocale) => {
      if (newLocale) {
        locale.value = newLocale.value;
      }
    });

      return {
        t,
        selectedLocale,
        locales,
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

    color: #334155;
    .instance-not-found {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .hotel_not_found_contact {
      font-size: 20px;
      font-weight: bold;
      margin-top: 3rem;
      margin-bottom: 0.5rem;
    }
    .button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin-top: 3rem;
      .p-button {
        width: 100%;
        background-color: #1D4ED8;
        border: none;
        font-size: 16px;
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
      box-shadow: 0px 1px 3px 0px #0000001A;

    }
    .button {
      margin-top: 4rem !important;
    }

    .select-language {
      bottom: 2rem;
      right: 5rem;
    }
  }
}
</style>
