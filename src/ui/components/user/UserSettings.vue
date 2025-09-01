<template>
  <div class="user__settings">
    <div class="user__settings--row">
      <div class="user__settings--avatar">
        <Avatar :image="user?.avatar" size="xlarge" shape="circle" />
      </div>
      <div class="user__settings--buttons">
        <div class="user__settings--button">
          <Button
            :label="t('userSettings.replaceImage')"
            :style="{ width: '100%', minWidth: '130px' }"
          />
        </div>
        <div class="user__settings--button">
          <Button
            :label="t('userSettings.removeImage')"
            :style="{ width: '100%', minWidth: '130px' }"
          />
        </div>
      </div>
    </div>
    <div class="user__settings--row">
      <div class="user__settings--field">
        <label class="user__settings--label">
          {{ t('userSettings.firstName') }}
        </label>
        <InputText v-model="firstName" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">
          {{ t('userSettings.lastName') }}
        </label>
        <InputText v-model="lastName" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">
          {{ t('userSettings.secondLastName') }}
        </label>
        <InputText v-model="secondLastName" />
      </div>
    </div>
    <div class="user__settings--row">
      <div class="user__settings--field">
        <label class="user__settings--label">
          {{ t('userSettings.phone') }}
        </label>
        <InputText v-model="phone" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">
          {{ t('userSettings.email') }}
        </label>
        <InputText v-model="email" />
      </div>

      <div class="user__settings--field" v-if="availableLocales.length > 1">
        <label class="user__settings--label">
          {{ t('userSettings.language') }}
        </label>
        <Select
          class="select-language"
          v-model="selectedLocale"
          :options="[...availableLocales]"
          optionLabel="label"
          optionValue="value"
        />
      </div>
    </div>
    <div class="user__settings--footer-buttons">
      <Button
        :label="t('userSettings.cancel')"
        class="p-button-text"
        :style="{ width: 'auto', minWidth: '130px' }"
      />
      <Button
        :label="t('userSettings.save')"
        :style="{ width: 'auto', minWidth: '130px' }"
        @click="save()"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/infrastructure/stores/user';
import { availableLocales, updateI18nLocale } from '@/infrastructure/plugins/i18n';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';

const userStore = useUserStore();
const { t } = useI18n({ useScope: 'global' });
const user = userStore.user;
const firstName = ref('');
const lastName = ref('');
const secondLastName = ref('');
const phone = ref('');
const email = ref('');
const selectedLocale = ref('');

const save = () => {
  updateI18nLocale(selectedLocale.value);
  updatePrimevueLocale(selectedLocale.value);
};

onMounted(() => {
  firstName.value = user?.firstName || '';
  lastName.value = user?.lastName || '';
  secondLastName.value = user?.lastName2 || '';
  phone.value = user?.phone || '';
  email.value = user?.email || '';
});
</script>
<style scoped lang="scss">
.user__settings {
  display: flex;
  flex-direction: column;
  &--row {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  &--avatar {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 1rem;
  }
  &--buttons {
    display: flex;
    gap: 1rem;
    width: 100%;
  }
  &--button {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  &--field {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1rem;
  }
  &--label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
  &--footer-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .user__settings {
    min-width: 75vw;
    height: auto;
    &--row {
      flex-direction: row;
      align-items: center;
    }
    &--avatar {
      width: fit-content;
      margin-bottom: 0;
      margin-right: 1rem;
    }
    &--field {
      margin-right: 0.5rem;
    }
    &--field:last-child {
      margin-right: 0;
    }
    &--button {
      width: fit-content;
      justify-content: start;
    }
    &--footer-buttons {
      flex-direction: row;
      justify-content: flex-end;
      width: auto;
    }
  }
}
</style>
