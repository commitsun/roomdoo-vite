<template>
  <div class="user__settings">
    <Tabs value="0">
      <TabList>
        <Tab value="0" as="div" class="flex items-center gap-2">
          <span> {{ t('userSettings.profile') }} </span>
        </Tab>
        <Tab value="1" as="div" class="flex items-center gap-2">
          <span> {{ t('userSettings.securityAndAccess') }} </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="user__settings--row">
            <Avatar
              :label="
                !imageUrl
                  ? (user?.firstName?.charAt(0)?.toUpperCase() ?? '') +
                    (user?.firstName?.charAt(1)?.toUpperCase() ?? '')
                  : ''
              "
              shape="circle"
              :image="imageUrl ? imageUrl : ''"
              style="
                background-color: #1f89e1;
                color: #ffffff;
                width: 90px;
                height: 90px;
                min-width: 90px;
                font-size: 35px;
              "
            />
            <div>
              <FileUpload
                class="user"
                mode="basic"
                :maxFileSize="1000000"
                @select="onAdvancedUpload($event)"
                :auto="true"
                :chooseLabel="
                  imageUrl ? t('userSettings.changeImage') : t('userSettings.uploadPhoto')
                "
                chooseIcon="pi pi-upload"
                :chooseButtonProps="{ class: 'p-button-outlined p-button-secondary' }"
                :pt="{
                  root: { 'data-testid': 'fileupload-root' },
                  chooseButton: { 'data-testid': 'file-upload-trigger' },
                }"
                :invalidFileSizeMessage="t('userSettings.fileTooLarge')"
              />
              <Button
                v-if="imageUrl"
                :label="t('userSettings.removeImage')"
                severity="secondary"
                variant="outlined"
                icon="pi pi-trash"
                :style="{ marginTop: '0.5rem' }"
                @click="imageUrl = ''"
              />
            </div>
          </div>
          <div class="user__settings--grid">
            <div class="user__settings--section-title">
              {{ t('userSettings.personalInformation') }}
            </div>
            <div class="user__settings--field user__settings--field--full">
              <label class="user__settings--label" for="firstName">
                {{ t('userSettings.firstName') }}

                *
              </label>
              <InputText
                class="user__settings--control"
                id="firstName"
                v-model="firstName"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user__settings--field">
              <label class="user__settings--label" for="lastName">
                {{ t('userSettings.lastName') }}
              </label>
              <InputText
                class="user__settings--control"
                id="lastName"
                v-model="lastName"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user__settings--field">
              <label class="user__settings--label" for="secondLastName">
                {{ t('userSettings.secondLastName') }}
              </label>
              <InputText
                class="user__settings--control"
                id="secondLastName"
                v-model="secondLastName"
                :style="{ minWidth: '260px' }"
              />
            </div>
          </div>
          <div class="user__settings--grid">
            <div class="user__settings--section-title">
              {{ t('userSettings.contactData') }}
            </div>
            <div class="user__settings--field user__settings--field--full">
              <label class="user__settings--label" for="email">
                {{ t('userSettings.email') }}*
              </label>
              <InputText
                class="user__settings--control"
                id="email"
                v-model="email"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user__settings--field">
              <label class="user__settings--label" for="phone">
                {{ t('userSettings.phone') }}
              </label>
              <InputText
                class="user__settings--control"
                id="phone"
                v-model="phone"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div
              class="user__settings--field"
              v-if="availableLocales && availableLocales.length > 1"
            >
              <label class="user__settings--label" for="language">
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
              severity="secondary"
              :style="{ width: 'auto' }"
              @click="handleCancel()"
            />
            <Button
              :label="t('userSettings.save')"
              :style="{ width: 'auto', backgroundColor: '#1d4ed8', border: 'none' }"
              @click="handleUpdateUser()"
            />
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div class="user__settings--security-section" v-if="!isChangeLoginVisible">
            <div class="user__settings--section-title">
              {{ t('userSettings.nameEmailLogin') }}
            </div>
            <div class="user__settings--login">
              <div class="user__settings--login-left">
                <Mail class="user__settings--login-icon" color="#64748B" />
                <div class="user__settings--login-info">
                  <div class="user__settings--login-email">{{ login }}</div>
                  <div class="user__settings--login-text">
                    {{ t('userSettings.yourLogin') }}
                  </div>
                </div>
              </div>
              <div class="user__settings--change-login">
                <a class="user__settings--change-login-link" @click="showLoginVisible()">
                  {{ t('userSettings.change') }}
                </a>
              </div>
            </div>
          </div>
          <div v-else class="user__settings--security-section">
            <div class="user__settings--section-title login-visible">
              {{ t('userSettings.nameEmailLogin') }}
            </div>
            <div class="user__settings--card">
              <div class="user__settings--grid-card">
                <div class="user__settings--field">
                  <label class="user__settings--label flex-label" for="login">
                    {{ t('userSettings.currentLogin') }}
                  </label>
                  <InputText
                    class="user__settings--control"
                    id="login"
                    v-model="login"
                    disabled
                    :style="{ minWidth: '260px' }"
                  />
                </div>
                <div class="user__settings--field">
                  <label class="user__settings--label" for="newLogin">
                    {{ t('userSettings.newLogin') }}*
                  </label>
                  <InputText
                    class="user__settings--control"
                    id="newLogin"
                    v-model="newLogin"
                    :style="{ minWidth: '260px' }"
                  />
                </div>
                <div class="user__settings--footer-change-login">
                  <Button
                    :label="t('userSettings.cancel')"
                    severity="secondary"
                    class="p-button-text"
                    :style="{ width: 'auto' }"
                    @click="cancelChangeLogin()"
                  />
                  <Button
                    :label="t('userSettings.changeLogin')"
                    :style="{ width: 'auto', border: 'none', color: '#1d4ed8' }"
                    outlined
                    @click="updateLogin()"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="user__settings--security-section" v-if="!isChangePasswordVisible">
            <div class="user__settings--section-title">
              {{ t('userSettings.password') }}
            </div>
            <div class="user__settings--password">
              <div class="user__settings--password-left">
                <LockKeyhole class="user__settings--password-icon" color="#64748B" />
                <div class="user__settings--password-info">
                  <div class="user__settings--password-email">••••••••••</div>
                  <div class="user__settings--password-text">
                    {{ t('userSettings.yourPassword') }}
                  </div>
                </div>
              </div>
              <div class="user__settings--change-login">
                <a class="user__settings--change-login-link" @click="showChangePasswordVisible()">
                  {{ t('userSettings.change') }}
                </a>
              </div>
            </div>
          </div>
          <div v-else class="user__settings--security-section">
            <div class="user__settings--section-title login-visible">
              {{ t('userSettings.password') }}
            </div>
            <div class="user__settings--card">
              <div class="user__settings--grid-card">
                <div class="user__settings--field">
                  <label class="user__settings--label flex-label" for="currentPassword">
                    {{ t('userSettings.currentPassword') }}
                  </label>
                  <Password
                    v-model="currentPassword"
                    inputId="currentPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'current-password' }"
                    :invalid="errorMessage === t('userSettings.invalidPassword')"
                  />
                </div>
                <div class="user__settings--field">
                  <label class="user__settings--label" for="newPassword">
                    {{ t('userSettings.newPassword') }}*
                  </label>
                  <Password
                    v-model="newPassword"
                    inputId="newPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'new-password' }"
                    :invalid="errorMessage === t('userSettings.passwordsDoNotMatch')"
                  />
                </div>
                <div class="user__settings--field">
                  <label class="user__settings--label flex-label" for="repeatPassword">
                    {{ t('userSettings.repeatPassword') }}*
                  </label>
                  <Password
                    v-model="repeatPassword"
                    inputId="repeatPassword"
                    :feedback="false"
                    toggleMask
                    :style="{ width: '100%' }"
                    :inputProps="{ autocomplete: 'repeat-password' }"
                    :invalid="errorMessage === t('userSettings.passwordsDoNotMatch')"
                  />
                </div>
                <Message
                  severity="error"
                  :style="{ visibility: errorMessage !== '' ? 'visible' : 'hidden' }"
                >
                  {{ errorMessage }}
                </Message>
                <div class="user__settings--footer-change-login">
                  <Button
                    :label="t('userSettings.cancel')"
                    severity="secondary"
                    class="p-button-text"
                    @click="cancelChangePassword()"
                  />
                  <Button
                    :label="t('userSettings.changePassword')"
                    :style="{ border: 'none', color: '#1d4ed8' }"
                    outlined
                    @click="handleChangePassword()"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Password from 'primevue/password';
import Message from 'primevue/message';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import { Mail, LockKeyhole } from 'lucide-vue-next';

import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUserStore } from '@/infrastructure/stores/user';
import { i18n } from '@/infrastructure/plugins/i18n';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import type { Language } from '@/domain/entities/Language';

const dialogRef = inject<Ref<{ close: (payload?: unknown) => void } | undefined>>('dialogRef');

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
const login = ref('');
const newLogin = ref('');
const imageUrl = ref('');
const selectedLocale = ref('');
const isChangeLoginVisible = ref(false);
const isChangePasswordVisible = ref(false);
const availableLocales = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

const currentPassword = ref('');
const newPassword = ref('');
const repeatPassword = ref('');
const errorMessage = ref('');

const handleUpdateUser = async (): Promise<void> => {
  uiStore.startLoading();
  try {
    const payload: {
      firstName: string;
      lastName: string;
      lastName2: string;
      phone: string;
      email: string;
      lang: string;
      avatar?: string;
    } = {
      firstName: firstName.value,
      lastName: lastName.value,
      lastName2: secondLastName.value,
      phone: phone.value,
      email: email.value,
      lang: selectedLocale.value,
    };
    if (imageUrl.value !== user?.avatar) {
      payload.avatar = imageUrl.value;
    }
    await userStore.updateUser(payload);
    notificationStore.add(t('userSettings.userUpdated'), 'success');
    dialogRef?.value?.close({ action: 'userUpdated' });
  } catch {
    notificationStore.add(t('error.unknownError'), 'error');
  } finally {
    uiStore.stopLoading();
  }
};

const updateLogin = async (): Promise<void> => {
  uiStore.startLoading();
  try {
    await userStore.updateUser({ login: newLogin.value });
    notificationStore.add(t('userSettings.loginUpdated'), 'success');
    dialogRef?.value?.close({ action: 'loginUpdated' });
  } catch {
    notificationStore.add(t('error.unknownError'), 'error');
  } finally {
    uiStore.stopLoading();
  }
};

const handleCancel = (): void => {
  dialogRef?.value?.close({ action: 'cancel' });
};

const handleChangePassword = async (): Promise<void> => {
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

function getSafeString(val: unknown): string {
  return typeof val === 'string' && val.trim() !== '' ? val : '';
}

const onAdvancedUpload = (e: FileUploadSelectEvent): void => {
  if (Boolean(e.files[0]?.objectURL) && e.files[0]?.size < 1000000) {
    imageUrl.value = e.files[0]?.objectURL;
  }
};

const showLoginVisible = (): void => {
  isChangeLoginVisible.value = true;
  currentPassword.value = '';
  newPassword.value = '';
  repeatPassword.value = '';
  errorMessage.value = '';
  if (isChangePasswordVisible.value) {
    isChangePasswordVisible.value = false;
  }
};

const showChangePasswordVisible = (): void => {
  isChangePasswordVisible.value = true;
  newLogin.value = '';

  if (isChangeLoginVisible.value) {
    isChangeLoginVisible.value = false;
  }
};

const cancelChangeLogin = (): void => {
  isChangeLoginVisible.value = false;
  newLogin.value = '';
};

const cancelChangePassword = (): void => {
  isChangePasswordVisible.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  repeatPassword.value = '';
  errorMessage.value = '';
};

onMounted(() => {
  firstName.value = getSafeString(user?.firstName);
  lastName.value = getSafeString(user?.lastName);
  secondLastName.value = getSafeString(user?.lastName2);
  phone.value = getSafeString(user?.phone);
  email.value = getSafeString(user?.email);
  imageUrl.value = getSafeString(user?.avatar);
  login.value = getSafeString(user?.login);

  if (typeof user?.lang === 'string' && user.lang.trim() !== '') {
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
    gap: 1rem;
    margin-top: 1rem;
  }

  &--grid,
  &--grid-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }
  &--grid-card {
    margin-top: 0;
  }
  &--field {
    .user__settings-form__control {
      width: 100%;
    }

    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-select-label),
    :deep(.p-datepicker),
    :deep(.p-inputwrapper) {
      width: 100%;
      font-size: 12px !important;
      height: 30px;
    }

    :deep(.p-datepicker .p-inputwrapper) {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: stretch;
    }

    :deep(.user__settings__control-input),
    :deep(.p-datepicker .p-inputtext) {
      width: 100%;
    }

    :deep(.p-select .p-select-label) {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .flex-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  &--field--full {
    grid-column: 1 / -1;
  }
  &--section-title {
    font-weight: bold;
    font-size: 16px;
  }
  &--label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 7px;
    display: block;
    color: #64748b;
  }
  &--login,
  &--password {
    margin-top: 1rem;
    padding: 1rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    display: flex;
    justify-content: space-between;
    &-icon {
      min-width: 50px;
    }
    &-left {
      display: flex;
    }
  }
  .user__settings--change-login {
    min-width: 70px;
  }
  .user__settings--change-login-link {
    cursor: pointer;
    color: #1d4ed8;
    font-weight: 500;
  }
  &--security-section {
    margin-bottom: 2rem;
    font-size: 12px;
    .login-visible {
      margin-bottom: 1rem;
    }
  }
  &--card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #ffffff;
    .user__settings--footer-change-login {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
  }
}
:deep(.p-message-text) {
  font-size: 12px;
}
.user__settings--footer-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 1rem;
}
:deep(.p-button) {
  font-size: 12px;
}

@media (min-width: 1024px) {
  .user__settings {
    width: 640px;
    height: 715px;
    &--grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }

    &--field {
      grid-column: auto / span 1;
      :deep(.p-inputtext),
      :deep(.p-select),
      :deep(.p-select-label) {
        font-size: 14px !important;
        height: 35px;
      }
    }
    :deep(.p-button) {
      font-size: 14px;
    }
    &--field--full {
      grid-column: 1 / -1;
    }
    &--security-section {
      font-size: 14px;
    }
  }
  :deep(.p-message-text) {
    font-size: 14px;
  }
  .user__settings--footer-buttons {
    flex-direction: row;
    justify-content: flex-end;
    width: auto;
    height: 100%;
    margin-top: 4rem;
  }
}
</style>
