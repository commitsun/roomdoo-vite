<template>
  <div class="user__settings">
    <Tabs value="0">
      <TabList>
        <Tab value="0" as="div" class="flex items-center gap-2">
          <i class="pi pi-user-edit" />
          <span> {{ t('userSettings.userData') }} </span>
        </Tab>
        <Tab value="1" as="div" class="flex items-center gap-2">
          <i class="pi pi-lock" />
          <span> {{ t('userSettings.changePassword') }} </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
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
              <label for="firstName" class="user__settings--label">
                {{ t('userSettings.firstName') }}
              </label>
              <InputText id="firstName" v-model="firstName" :style="{ minWidth: '260px' }" />
            </div>

            <div class="user__settings--field">
              <label for="lastName" class="user__settings--label">
                {{ t('userSettings.lastName') }}
              </label>
              <InputText id="lastName" v-model="lastName" :style="{ minWidth: '260px' }" />
            </div>

            <div class="user__settings--field">
              <label for="secondLastName" class="user__settings--label">
                {{ t('userSettings.secondLastName') }}
              </label>
              <InputText
                id="secondLastName"
                v-model="secondLastName"
                :style="{ minWidth: '260px' }"
              />
            </div>
          </div>

          <div class="user__settings--row">
            <div class="user__settings--field">
              <label for="phone" class="user__settings--label">
                {{ t('userSettings.phone') }}
              </label>
              <InputText id="phone" v-model="phone" :style="{ minWidth: '260px' }" />
            </div>

            <div class="user__settings--field">
              <label for="email" class="user__settings--label">
                {{ t('userSettings.email') }}
              </label>
              <InputText id="email" v-model="email" :style="{ minWidth: '260px' }" />
            </div>

            <div
              class="user__settings--field"
              v-if="availableLocales && availableLocales.length > 1"
            >
              <label for="language" class="user__settings--label">
                {{ t('userSettings.language') }}
              </label>
              <Select
                class="select-language"
                v-model="selectedLocale"
                optionLabel="name"
                optionValue="code"
                :options="availableLocales as Language[]"
                :style="{ minWidth: '260px' }"
                aria-label="language"
              />
            </div>
          </div>

          <div class="user__settings--footer-buttons">
            <Button
              :label="t('userSettings.cancel')"
              class="p-button-text"
              :style="{ width: 'auto', minWidth: '130px' }"
              @click="handleCancel()"
            />
            <Button
              :label="t('userSettings.save')"
              :style="{ width: 'auto', minWidth: '130px' }"
              @click="handleUpdateUser()"
            />
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div class="change__password--row">
            <form>
              <InputText v-model="firstName" autocomplete="username" style="display: none" />
              <div class="change__password--field">
                <label for="currentPassword" class="change__password--label">
                  {{ t('userSettings.currentPassword') }}
                </label>
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <Password
                    v-model="currentPassword"
                    inputId="currentPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'current-password' }"
                    :invalid="errorMessage === t('userSettings.invalidPassword')"
                  />
                </IconField>
              </div>
              <div class="change__password--field">
                <label for="newPassword" class="change__password--label">
                  {{ t('userSettings.newPassword') }}
                </label>
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <Password
                    v-model="newPassword"
                    inputId="newPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'new-password' }"
                    :invalid="errorMessage === t('userSettings.passwordsDoNotMatch')"
                  />
                </IconField>
              </div>
              <div class="change__password--field">
                <label for="repeatPassword" class="change__password--label">
                  {{ t('userSettings.repeatPassword') }}
                </label>
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <Password
                    v-model="repeatPassword"
                    inputId="repeatPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'repeat-password' }"
                    :invalid="errorMessage === t('userSettings.passwordsDoNotMatch')"
                  />
                </IconField>
              </div>
              <div class="change__password--footer">
                <Message
                  severity="error"
                  :style="{ visibility: errorMessage !== '' ? 'visible' : 'hidden' }"
                >
                  {{ errorMessage }}
                </Message>
                <div class="change__password--footer-buttons">
                  <Button
                    :label="t('userSettings.cancel')"
                    class="p-button-text"
                    :style="{ width: 'auto', minWidth: '130px' }"
                    @click="handleCancel()"
                  />
                  <Button
                    :label="t('userSettings.save')"
                    :style="{ width: 'auto', minWidth: '130px' }"
                    @click="handleChangePassword()"
                    :disabled="!currentPassword || !newPassword || !repeatPassword"
                  />
                </div>
              </div>
            </form>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/infrastructure/stores/user';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useNotificationsStore } from '@/infrastructure/stores/notifications';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Message from 'primevue/message';
import { i18n } from '@/infrastructure/plugins/i18n';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import type { Language } from '@/domain/entities/Language';

const dialogRef = inject<any>('dialogRef');

const userStore = useUserStore();
const instanceStore = useInstanceStore();
const uiStore = useUIStore();
const notificationStore = useNotificationsStore();

const { t } = useI18n({ useScope: 'global' });

const user = userStore.user;
const firstName = ref('');
const lastName = ref('');
const secondLastName = ref('');
const phone = ref('');
const email = ref('');
const selectedLocale = ref('');
const availableLocales = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

const currentPassword = ref('');
const newPassword = ref('');
const repeatPassword = ref('');
const errorMessage = ref('');

const handleUpdateUser = async () => {
  uiStore.startLoading();
  try {
    await userStore.updateUser({
      firstName: firstName.value,
      lastName: lastName.value,
      lastName2: secondLastName.value,
      phone: phone.value,
      email: email.value,
      lang: selectedLocale.value,
    });
    notificationStore.add(t('userSettings.userUpdated'), 'success');
    dialogRef?.value?.close({ action: 'userUpdated' });
  } catch {
    notificationStore.add(t('error.unknownError'), 'error');
  } finally {
    uiStore.stopLoading();
  }
};

const handleCancel = () => {
  dialogRef?.value?.close({ action: 'cancel' });
};

const handleChangePassword = async () => {
  if (newPassword.value !== repeatPassword.value) {
    errorMessage.value = t('userSettings.passwordsDoNotMatch');
    return;
  }
  uiStore.startLoading();
  try {
    await userStore.changePassword(currentPassword.value, newPassword.value);
    notificationStore.add(t('userSettings.passwordChanged'), 'success');
    dialogRef?.value?.close({ action: 'passwordChanged' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      errorMessage.value = t('userSettings.invalidPassword');
    } else {
      errorMessage.value = t('error.unknownError');
    }
  } finally {
    uiStore.stopLoading();
  }
};

onMounted(() => {
  firstName.value = user?.firstName || '';
  lastName.value = user?.lastName || '';
  secondLastName.value = user?.lastName2 || '';
  phone.value = user?.phone || '';
  email.value = user?.email || '';
  if (user?.lang) {
    selectedLocale.value = user.lang.replace('_', '-');
  } else {
    selectedLocale.value = i18n.global.locale.value;
  }
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
  .change__password--row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: calc(90svh - 1.25rem);
    .change__password--field {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
      .change__password--label {
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
    }
  }
}
.user__settings--footer-buttons,
.change__password--footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.change__password--footer-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

:deep(.p-tabpanels) {
  padding: 0;
  padding-top: 18px;
}

:deep(.change__password--field .p-icon-field),
:deep(.change__password--field .p-password) {
  width: 100%;
}

:deep(.change__password--field .p-password input.p-inputtext) {
  width: 100%;
}

@media (min-width: 1024px) {
  .user__settings {
    height: 370px;
    width: 830px;
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
    .change__password--row {
      width: auto;
      height: auto;
      > .change__password--field:nth-last-child(2) {
        margin-bottom: 2rem !important;
      }
    }
  }
  .user__settings--footer-buttons {
    flex-direction: row;
    justify-content: flex-end;
    width: auto;
    height: 100%;
  }
  .change__password--footer {
    flex-direction: row;
    justify-content: space-between;
    width: auto;
    height: 100%;
    margin-top: 1.85rem;
  }
  .change__password--footer-buttons {
    flex-direction: row;
    width: auto;
    height: 100%;
  }
}
</style>
