<template>
  <div class="user-settings">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab
          value="0"
          as="button"
          class="flex items-center gap-2"
          @click.capture="onTabClick('0', $event)"
        >
          <span> {{ t('userSettings.profile') }} </span>
        </Tab>
        <Tab
          value="1"
          as="button"
          class="flex items-center gap-2"
          @click.capture="onTabClick('1', $event)"
        >
          <span> {{ t('userSettings.securityAndAccess') }} </span>
        </Tab>
      </TabList>
      <TabPanels class="lg:h-[535px] overflow-y-scroll">
        <TabPanel value="0">
          <div class="user-settings-row">
            <Avatar
              :label="!imageUrl ? labelAvatar : ''"
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
              :pt="{
                image: {
                  style: 'object-fit: cover; width: 100%; height: 100%;',
                },
              }"
            />
            <div class="right">
              <IconField>
                <InputIcon class="pi pi-upload" style="color: #334155; font-size: 12px" />
                <FileUpload
                  class="user"
                  mode="basic"
                  :maxFileSize="100000"
                  @select="onAdvancedUpload($event)"
                  :auto="true"
                  chooseIcon="-"
                  :chooseLabel="
                    imageUrl ? t('userSettings.changeImage') : t('userSettings.uploadPhoto')
                  "
                  :chooseButtonProps="{
                    class: 'p-button-outlined p-button-secondary',
                    icon: 'pi pi-upload',
                  }"
                  :pt="{
                    root: { 'data-testid': 'fileupload-root' },
                    chooseButton: { 'data-testid': 'file-upload-trigger' },
                  }"
                  :invalidFileSizeMessage="t('userSettings.fileTooLarge')"
                  :style="{ fontSize: '12px', height: '27px', paddingLeft: '1.5rem' }"
                />
              </IconField>

              <Button
                v-if="imageUrl"
                :label="t('userSettings.removeImage')"
                severity="secondary"
                variant="outlined"
                icon="pi pi-trash"
                :style="{ marginTop: '0.5rem', height: '27px' }"
                @click="imageUrl = ''"
                size="small"
              />
              <p>
                {{
                  t('userSettings.fileTypeSupported', {
                    size: 10,
                  })
                }}
              </p>
            </div>
          </div>
          <div class="user-settings-grid">
            <div class="user-settings-section-title">
              {{ t('userSettings.personalInformation') }}
            </div>
            <div class="user-settings-field user-settings-field-full">
              <label class="user-settings-label" for="firstName">
                {{ t('userSettings.firstName') }}
                *
              </label>
              <InputText
                class="user-settings-control"
                id="firstName"
                v-model="firstName"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div
              class="user-settings-field"
              :class="{ 'user-settings-field-full': !showLastName2 }"
            >
              <label class="user-settings-label" for="lastName">
                {{ t('userSettings.lastName') }}
              </label>
              <InputText
                class="user-settings-control"
                id="lastName"
                v-model="lastName"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user-settings-field" v-if="showLastName2">
              <label class="user-settings-label" for="secondLastName">
                {{ t('userSettings.secondLastName') }}
              </label>
              <InputText
                class="user-settings-control"
                id="secondLastName"
                v-model="secondLastName"
                :style="{ minWidth: '260px' }"
              />
            </div>
          </div>
          <div class="user-settings-grid">
            <div class="user-settings-section-title">
              {{ t('userSettings.contactData') }}
            </div>
            <div class="user-settings-field user-settings-field-full">
              <label class="user-settings-label" for="email">
                {{ t('userSettings.email') }}*
              </label>
              <InputText
                class="user-settings-control"
                id="email"
                v-model="email"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user-settings-field">
              <label class="user-settings-label" for="phone">
                {{ t('userSettings.phone') }}
              </label>
              <InputText
                class="user-settings-control"
                id="phone"
                v-model="phone"
                :style="{ minWidth: '260px' }"
              />
            </div>
            <div class="user-settings-field" v-if="availableLocales && availableLocales.length > 1">
              <label class="user-settings-label" for="language">
                {{ t('userSettings.language') }}
              </label>

              <IconField>
                <InputIcon class="pi pi-globe" style="color: #334155" />
                <Select
                  class="user-settings-control pl-6"
                  v-model="selectedLocale"
                  optionLabel="name"
                  optionValue="code"
                  :options="availableLocales"
                  aria-label="language"
                />
              </IconField>
            </div>
          </div>
        </TabPanel>
        <!-- TAB SECURITY -->
        <TabPanel value="1">
          <div class="user-settings-section-title mt-4">
            {{ t('userSettings.nameEmailLogin') }}
          </div>
          <Panel
            toggleable
            collapsed
            :pt="{
              root: (opts) => ({
                class: opts.state.d_collapsed ? 'panel--is-collapsed' : undefined,
                style: { backgroundColor: opts.state.d_collapsed ? '#F1F5F9' : undefined },
              }),
            }"
          >
            <template #header>
              <div class="flex flex-col mt-2">
                <div class="flex items-center">
                  <Mail class="user-settings-login-icon mr-2" color="#64748B" :size="15" />
                  <div class="user-settings-login-info">
                    <div class="user-settings-login-email">
                      {{ login }}
                    </div>
                  </div>
                </div>
                <div class="user-settings-login-text my-2">
                  {{ t('userSettings.yourLogin') }}
                </div>
              </div>
            </template>
            <template #toggleicon>
              <Pen color="#1D4ED8" :size="15" />
            </template>
            <div class="user-settings-security-section">
              <div class="user-settings-card">
                <div class="user-settings-grid-card">
                  <div class="user-settings-field">
                    <label class="user-settings-label" for="login">
                      {{ t('userSettings.currentLogin') }}
                    </label>
                    <InputText
                      class="user-settings-control"
                      id="login"
                      v-model="login"
                      disabled
                      :style="{ minWidth: '260px' }"
                    />
                  </div>
                  <div class="user-settings-field">
                    <label class="user-settings-label" for="newLogin">
                      {{ t('userSettings.newLogin') }} *
                    </label>
                    <InputText
                      class="user-settings-control"
                      id="newLogin"
                      v-model="newLogin"
                      :style="{ minWidth: '260px' }"
                      :invalid="
                        loginErrorMessage === t('userSettings.loginRequired') && newLogin === ''
                      "
                    />
                  </div>
                  <Message v-if="loginErrorMessage !== ''" severity="error">
                    {{ loginErrorMessage }}
                  </Message>
                </div>
                <div class="user-settings-footer-change-login">
                  <Button :label="t('userSettings.changeLogin')" @click="updateLogin()" />
                </div>
              </div>
            </div>
          </Panel>
          <div class="user-settings-section-title-second">
            {{ t('userSettings.password') }}
          </div>
          <Panel
            toggleable
            collapsed
            :pt="{
              root: (opts) => ({
                class: opts.state.d_collapsed ? 'panel--is-collapsed' : undefined,
                style: { backgroundColor: opts.state.d_collapsed ? '#F1F5F9' : undefined },
              }),
            }"
          >
            <template #header>
              <div class="flex flex-col mt-2">
                <div class="flex items-center">
                  <LockKeyhole
                    class="user-settings-password-icon mr-2"
                    color="#64748B"
                    :size="15"
                  />
                  <div class="user-settings-password-info">
                    <div class="user-settings-password-email">••••••••••</div>
                  </div>
                </div>
                <div class="user-settings-password-text my-2">
                  {{ t('userSettings.yourPassword') }}
                </div>
              </div>
            </template>
            <template #toggleicon>
              <Pen color="#1D4ED8" :size="15" />
            </template>
            <div class="user-settings-security-section">
              <div class="user-settings-card">
                <div class="user-settings-grid-card">
                  <div class="user-settings-field">
                    <label class="user-settings-label" for="currentPassword">
                      {{ t('userSettings.currentPassword') }} *
                    </label>
                    <Password
                      v-model="currentPassword"
                      inputId="currentPassword"
                      :feedback="false"
                      toggleMask
                      :style="{ width: '100%' }"
                      :inputStyle="{ width: '100%' }"
                      :inputProps="{ autocomplete: 'current-password' }"
                      :invalid="
                        passwordErrorMessage === t('userSettings.invalidPassword') ||
                        (passwordErrorMessage === t('userSettings.allPasswordFieldsRequired') &&
                          currentPassword === '')
                      "
                    />
                  </div>
                  <div class="user-settings-field">
                    <label class="user-settings-label" for="newPassword">
                      {{ t('userSettings.newPassword') }} *
                    </label>
                    <Password
                      v-model="newPassword"
                      inputId="newPassword"
                      :feedback="false"
                      toggleMask
                      :style="{ width: '100%' }"
                      :inputStyle="{ width: '100%' }"
                      :inputProps="{ autocomplete: 'new-password' }"
                      :invalid="
                        passwordErrorMessage === t('userSettings.passwordsDoNotMatch') ||
                        (passwordErrorMessage === t('userSettings.allPasswordFieldsRequired') &&
                          newPassword === '')
                      "
                    />
                  </div>
                  <div class="user-settings-field">
                    <label class="user-settings-label" for="repeatPassword">
                      {{ t('userSettings.repeatPassword') }} *
                    </label>
                    <Password
                      v-model="repeatPassword"
                      inputId="repeatPassword"
                      :feedback="false"
                      toggleMask
                      :style="{ width: '100%' }"
                      :inputStyle="{ width: '100%' }"
                      :inputProps="{ autocomplete: 'repeat-password' }"
                      :invalid="
                        passwordErrorMessage === t('userSettings.passwordsDoNotMatch') ||
                        (passwordErrorMessage === t('userSettings.allPasswordFieldsRequired') &&
                          repeatPassword === '')
                      "
                    />
                  </div>
                  <Message v-if="passwordErrorMessage !== ''" severity="error">
                    {{ passwordErrorMessage }}
                  </Message>
                </div>
                <div class="user-settings-footer-change-login">
                  <Button
                    :label="t('userSettings.changePassword')"
                    @click="handleChangePassword()"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <div class="user-settings-footer-buttons">
      <Button
        :label="t('userSettings.cancel')"
        severity="secondary"
        :style="{ width: 'auto' }"
        @click="handleCancel()"
      />
      <Button
        :label="t('userSettings.save')"
        :style="{ width: 'auto', backgroundColor: '#1d4ed8', border: 'none' }"
        @click="updateUser()"
      />
    </div>
    <ConfirmDialog :style="{ maxWidth: '380px' }"></ConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, watch, type Ref } from 'vue';
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
import Panel from 'primevue/panel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';
import Message from 'primevue/message';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import { Mail, Pen, LockKeyhole } from 'lucide-vue-next';

import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUserStore } from '@/infrastructure/stores/user';
import { i18n } from '@/infrastructure/plugins/i18n';
import type { User } from '@/domain/entities/User';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { BadRequestError } from '@/application/shared/BadRequestError';
const dialogRef = inject<Ref<{ close: (payload?: unknown) => void } | undefined>>('dialogRef');
const confirm = useConfirm();

const userStore = useUserStore();
const instanceStore = useInstanceStore();
const uiStore = useUIStore();
const notificationStore = useNotificationsStore();
const useTextMessageStore = useTextMessagesStore();

const { t } = useI18n({ useScope: 'global' });

const firstName = ref('');
const lastName = ref('');
const secondLastName = ref('');
const phone = ref('');
const email = ref('');
const login = ref('');
const newLogin = ref('');
const imageUrl = ref('');
const selectedLocale = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const repeatPassword = ref('');
const loginErrorMessage = ref('');
const passwordErrorMessage = ref('');
const activeTab = ref<'0' | '1'>('0');
const pendingTab = ref<'0' | '1' | null>(null);
const locking = ref(false);

const user = computed(() => userStore.user);
const labelAvatar = computed(() => {
  const userName =
    firstName.value +
    ' ' +
    lastName.value +
    ' ' +
    (secondLastName.value !== null ? ' ' + secondLastName.value : '');
  return userName
    .trim()
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
});

const availableLocales = computed(() => [...(instanceStore.instance?.languages || [])]);
const showLastName2 = computed(() => userStore.userSchemas?.includes('lastname2'));

const handleUpdateUser = async (): Promise<boolean> => {
  uiStore.startLoading();
  try {
    const payload: Partial<User> = {};
    if (firstName.value !== user.value?.firstName) {
      payload.firstName = firstName.value;
    }
    if (lastName.value !== user.value?.lastName) {
      payload.lastName = lastName.value;
    }
    if (showLastName2.value !== null && secondLastName.value !== user.value?.lastName2) {
      payload.lastName2 = secondLastName.value;
    }
    if (phone.value !== user.value?.phone) {
      payload.phone = phone.value;
    }
    if (email.value !== user.value?.email) {
      payload.email = email.value;
    }
    if (selectedLocale.value !== user.value?.lang) {
      payload.lang = selectedLocale.value;
    }
    if (imageUrl.value !== user.value?.avatar) {
      payload.avatar = imageUrl.value;
    }

    await userStore.updateUser(payload);
    notificationStore.add(t('userSettings.userUpdated'), 'success');
    uiStore.refreshView();
    return true;
  } catch {
    useTextMessageStore.addTextMessage('Error', t('error.unknownError'));
    return false;
  } finally {
    uiStore.stopLoading();
  }
};

const updateUser = async (): Promise<void> => {
  const ok = await handleUpdateUser();
  if (ok) {
    dialogRef?.value?.close({ action: 'userUpdated' });
  }
};

const updateLogin = async (): Promise<void> => {
  if (newLogin.value === '') {
    loginErrorMessage.value = t('userSettings.loginRequired');
    return;
  }
  if (newLogin.value !== login.value) {
    confirm.require({
      message: t('userSettings.areYouSureChangeLogin'),
      header: t('userSettings.changeLogin?'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: t('userSettings.discard'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('userSettings.change') },
      accept: () => {
        uiStore.startLoading();
        userStore
          .updateUser({ login: newLogin.value })
          .then(() => {
            notificationStore.add(t('userSettings.loginUpdated'), 'success');
            dialogRef?.value?.close({ action: 'doLogout' });
          })
          .catch((error) => {
            if (error instanceof BadRequestError) {
              useTextMessageStore.addTextMessage('Error', t('userSettings.loginAlreadyInUse'));
              return;
            } else {
              useTextMessageStore.addTextMessage('Error', t('error.unknownError'));
            }
          })
          .finally(() => {
            uiStore.stopLoading();
          });
      },
    });
  } else {
    useTextMessageStore.addTextMessage('Error', t('userSettings.loginAlreadyInUse'));
  }
};

function getSafeString(val: unknown): string {
  return typeof val === 'string' && val.trim() !== '' ? val : '';
}

const handleCancel = (): void => {
  dialogRef?.value?.close({ action: 'cancel' });
};

const handleChangePassword = async (): Promise<void> => {
  if (
    currentPassword.value.trim() === '' ||
    newPassword.value.trim() === '' ||
    repeatPassword.value.trim() === ''
  ) {
    passwordErrorMessage.value = t('userSettings.allPasswordFieldsRequired');
    return;
  }
  if (newPassword.value !== repeatPassword.value) {
    passwordErrorMessage.value = t('userSettings.passwordsDoNotMatch');
    return;
  }
  confirm.require({
    message: t('userSettings.youWillBeLoggedOutAfterPasswordChange'),
    header: t('userSettings.changePassword?'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('userSettings.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('userSettings.change') },
    accept: () => {
      void (async (): Promise<void> => {
        uiStore.startLoading();
        try {
          if (currentPassword.value && newPassword.value) {
            await userStore.changePassword(currentPassword.value, newPassword.value);
            notificationStore.add(t('userSettings.passwordChanged'), 'success');
            dialogRef?.value?.close({ action: 'doLogout' });
          }
        } catch (error) {
          if (error instanceof UnauthorizedError) {
            useTextMessageStore.addTextMessage('Error', t('userSettings.invalidPassword'));
          } else {
            useTextMessageStore.addTextMessage(
              t('error.somethingWentWrong'),
              (error as Error).message,
            );
          }
        } finally {
          uiStore.stopLoading();
        }
      })();
    },
  });
};

const isDirty = (): boolean => {
  return (
    firstName.value !== getSafeString(user.value?.firstName) ||
    lastName.value !== getSafeString(user.value?.lastName) ||
    secondLastName.value !== getSafeString(user.value?.lastName2) ||
    phone.value !== getSafeString(user.value?.phone) ||
    email.value !== getSafeString(user.value?.email) ||
    imageUrl.value !== getSafeString(user.value?.avatar) ||
    selectedLocale.value !==
      (typeof user.value?.lang === 'string'
        ? user.value.lang.replace('_', '-')
        : i18n.global.locale.value)
  );
};

const onTabClick = (target: '0' | '1', ev: MouseEvent): void => {
  ev.preventDefault();
  ev.stopPropagation();

  if (locking.value || target === activeTab.value) {
    return;
  }

  if (target === '1' && isDirty()) {
    locking.value = true;
    pendingTab.value = target;

    confirm.require({
      message: t('userSettings.youWillLoseChanges'),
      header: t('userSettings.changesWithoutSaving'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: t('userSettings.discard'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('userSettings.save') },
      accept: () => {
        void handleUpdateUser()
          .then(() => {
            activeTab.value = '1';
          })
          .finally(() => {
            pendingTab.value = null;
            locking.value = false;
          });
      },
      reject: () => {
        pendingTab.value = '1';
        imageUrl.value = getSafeString(user.value?.avatar);
        firstName.value = getSafeString(user.value?.firstName);
        lastName.value = getSafeString(user.value?.lastName);
        secondLastName.value = getSafeString(user.value?.lastName2);
        phone.value = getSafeString(user.value?.phone);
        email.value = getSafeString(user.value?.email);
        if (typeof user.value?.lang === 'string' && user.value.lang.trim() !== '') {
          selectedLocale.value = user.value.lang.replace('_', '-');
        } else {
          selectedLocale.value = i18n.global.locale.value;
        }
        activeTab.value = '1';
        pendingTab.value = '1';
        locking.value = false;
      },
      onHide: () => {
        pendingTab.value = null;
        locking.value = false;
      },
    });
    return;
  }

  activeTab.value = target;
};

const onAdvancedUpload = (e: FileUploadSelectEvent): void => {
  if (Boolean(e.files[0]?.objectURL) && e.files[0]?.size < 1000000) {
    imageUrl.value = e.files[0]?.objectURL;
  }
};

watch(
  () => newLogin.value,
  () => {
    if (loginErrorMessage.value !== '') {
      loginErrorMessage.value = '';
    }
  },
  { immediate: true },
);

watch(
  () => [currentPassword.value, newPassword.value, repeatPassword.value],
  () => {
    if (passwordErrorMessage.value !== '') {
      passwordErrorMessage.value = '';
    }
  },
  { immediate: true },
);

onMounted(() => {
  firstName.value = getSafeString(user.value?.firstName);
  lastName.value = getSafeString(user.value?.lastName);
  secondLastName.value = getSafeString(user.value?.lastName2);
  phone.value = getSafeString(user.value?.phone);
  email.value = getSafeString(user.value?.email);
  imageUrl.value = getSafeString(user.value?.avatar);
  login.value = getSafeString(user.value?.login);

  if (typeof user.value?.lang === 'string' && user.value.lang.trim() !== '') {
    selectedLocale.value = user.value.lang.replace('_', '-');
  } else {
    selectedLocale.value = i18n.global.locale.value;
  }
});
</script>

<style scoped lang="scss">
.user-settings {
  display: flex;
  flex-direction: column;
  .right {
    p {
      margin-top: 12px;
      font-size: 12px;
    }
  }
  .user-settings-row {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .user-settings-grid,
  .user-settings-grid-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }

  .user-settings-grid-card {
    margin-top: 0;
  }

  .user-settings-field {
    .user-settings-control {
      width: 100%;
    }
  }

  .user-settings-field-full {
    grid-column: 1 / -1;
  }

  .user-settings-section-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 1rem;
  }

  .user-settings-section-title-second {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 1rem;
    margin-top: 2rem;
  }

  .user-settings-label {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 7px;
    display: block;
    color: #64748b;
  }

  .user-settings-login,
  .user-settings-password {
    margin-top: 1rem;
    padding: 1rem 0;
    background-color: #f9fafb;
    display: flex;
    justify-content: space-between;

    .user-settings-login-icon {
      min-width: 50px;
    }

    .user-settings-login-left {
      display: flex;
    }
  }

  .user-settings-change-login {
    min-width: 70px;
  }

  .user-settings-change-login-link {
    cursor: pointer;
    color: #1d4ed8;
    font-weight: 400;
  }

  .user-settings-security-section {
    font-size: 12px;
  }

  .user-settings-card {
    padding: 1rem;
    background-color: #ffffff;

    .user-settings-footer-change-login {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin-top: 1.5rem;
      margin-left: 8px;
    }
  }
}

.user-settings-footer-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .user-settings {
    width: 640px;
    height: 640px;
    padding-bottom: 17px;
    .user-settings-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }

    .user-settings-field {
      grid-column: auto / span 1;
    }

    .user-settings-field-full {
      grid-column: 1 / -1;
    }

    .user-settings-security-section {
      font-size: 14px;
    }

    .user-settings-footer-buttons {
      margin-top: 0;
      height: 87px;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      flex-wrap: nowrap;
      width: auto;
      padding-bottom: 17px;
      margin-top: 17px;
    }
  }
}
</style>
