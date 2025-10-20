<template>
  <div class="login-container">
    <div class="login-form-header">
      <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="instance-not-found">
        {{ t('instanceNotFound.title', { instance: instanceName }) }}
      </div>
      <div>
        {{ t('hotel_not_found_description') }}
      </div>
      <div class="hotel_not_found_contact">
        {{ t('hotel_not_found_contact') }}
      </div>
      <div>{{ t('hotel_not_found_contact_description') }}</div>
      <div class="button">
        <Button :label="t('sign_up')" @click="openRoomdoo" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const instanceName = window.location.href
      .split('/')
      .filter((el) => el)[1]
      .split('.roomdoo.com')[0]
      .split(':')[0];
    const { t } = useI18n();

    const openRoomdoo = (): void => {
      window.open('https://roomdoo.com', '_blank');
    };
    return {
      instanceName,
      openRoomdoo,
      t,
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
        background-color: #1d4ed8;
        border: none;
        font-size: 16px;
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
      margin-top: 4rem !important;
    }
  }
}
</style>
