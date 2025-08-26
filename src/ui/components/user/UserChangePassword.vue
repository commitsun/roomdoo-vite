<template>
  <div class="change__password--row">
    <div class="change__password--field">
      <label class="change__password--label">
        {{ t('changePassword.currentPassword') }}
      </label>
      <IconField>
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="currentPassword"
          :feedback="false"
          toggleMask
          :style="{ width: '100%' }"
          :inputStyle="{ width: '100%' }"
        />
      </IconField>
    </div>
    <div class="change__password--field">
      <label class="change__password--label">
        {{ t('changePassword.newPassword') }}
      </label>
      <IconField>
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="newPassword"
          :feedback="false"
          toggleMask
          :style="{ width: '100%' }"
          :inputStyle="{ width: '100%' }"
        />
      </IconField>
    </div>
    <div class="change__password--field">
      <label class="change__password--label">
        {{ t('changePassword.repeatPassword') }}
      </label>
      <IconField>
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="repeatPassword"
          :feedback="false"
          toggleMask
          :style="{ width: '100%' }"
          :inputStyle="{ width: '100%' }"
        />
      </IconField>
    </div>
    <div class="change__password--buttons">
      <Button
        :label="t('changePassword.cancel')"
        class="p-button-text"
        :style="{ width: '100%', minWidth: '130px' }"
      />
      <Button :label="t('changePassword.save')" :style="{ width: '100%', minWidth: '130px' }" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';
import Button from 'primevue/button';
export default defineComponent({
  components: {
    IconField,
    InputIcon,
    Password,
    Button,
  },
  setup() {
    const { t } = useI18n();
    const currentPassword = ref('');
    const newPassword = ref('');
    const repeatPassword = ref('');
    return {
      currentPassword,
      newPassword,
      repeatPassword,
      t,
    };
  },
});
</script>
<style scoped lang="scss">
.change__password--row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(90svh - 1.25rem);
  .change__password--field {
    display: flex;
    flex-direction: column;
    .change__password--label {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
  }
  .change__password--buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}
@media (min-width: 1024px) {
  .change__password--row {
    width: auto;
    height: auto;
    .change__password--buttons {
      flex-direction: row;
    }
  }
}
</style>
