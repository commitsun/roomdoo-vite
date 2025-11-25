<template>
  <div class="login-container">
    <div class="login-form-header">
      <img src="/logos/logo-black-new.svg" class="logo" alt="Roomdoo Logo" />
    </div>
    <div class="login-form-container">
      <div class="instance-not-found">
        <TriangleAlert :size="30" class="mb-5" />
        {{ t('instanceNotFound.title', { instance: instanceName }) }}
      </div>
      <div>
        {{ t('hotel_not_found_description') }}
      </div>
      <Divider />
      <div class="hotel-not-found-footer">
        <div class="hotel-not-found-contact">
          {{ t('hotel_not_found_contact') }}
        </div>
        <div>{{ t('hotel_not_found_contact_description') }}</div>
        <div class="button">
          <Button :label="t('sign_up')" @click="openRoomdoo" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import { TriangleAlert } from 'lucide-vue-next';

export default defineComponent({
  components: {
    Button,
    Divider,
    TriangleAlert,
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
  width: 95%;
  padding-top: 2rem;
  position: relative;
  margin-bottom: 2rem;
  .login-form-header {
    text-align: center;
    .logo {
      width: 200px;
      height: auto;
    }
  }
  .login-form-container {
    text-align: center;
    background-color: #ffffff;
    width: 100%;
    padding: 2rem;
    margin-top: 2.5rem;
    font-size: 14px;
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 10px 35px rgba(15, 23, 42, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    color: #334155;
    .instance-not-found {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hotel-not-found-footer {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 1rem 0;
    }
    .hotel-not-found-contact {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      .p-button {
        width: 100%;
        background-color: #1d4ed8;
        border: none;
        font-size: 14px;
        margin: 1rem 1rem 0 1rem;
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
        width: 240px;
      }
    }
    .login-form-container {
      min-width: 380px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0px 1px 3px 0px #0000001a;
    }
  }
}
</style>
