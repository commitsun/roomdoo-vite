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
          <UserSettingsProfileTab
            :labelAvatar="labelAvatar"
            :availableLocales="availableLocales"
            :showLastName2="showLastName2 ?? false"
            :imageUrl="imageUrl"
            :firstName="firstName"
            :lastName="lastName"
            :secondLastName="secondLastName"
            :email="email"
            :phone="phone"
            :selectedLocale="selectedLocale"
            @update:imageUrl="imageUrl = $event"
            @update:firstName="firstName = $event"
            @update:lastName="lastName = $event"
            @update:secondLastName="secondLastName = $event"
            @update:email="email = $event"
            @update:phone="phone = $event"
            @update:selectedLocale="selectedLocale = $event"
            @selectAvatar="onAdvancedUpload"
          />
        </TabPanel>
        <TabPanel value="1">
          <UserSettingsSecurityTab
            :login="login"
            :newLogin="newLogin"
            :password="password"
            :currentPassword="currentPassword"
            :newPassword="newPassword"
            :repeatPassword="repeatPassword"
            :loginErrorMessage="loginErrorMessage"
            :passwordErrorMessage="passwordErrorMessage"
            @update:newLogin="newLogin = $event"
            @update:password="password = $event"
            @update:currentPassword="currentPassword = $event"
            @update:newPassword="newPassword = $event"
            @update:repeatPassword="repeatPassword = $event"
            @changeLogin="handleChangeLogin"
            @changePassword="handleChangePassword"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <div class="user-settings-footer-buttons" v-if="activeTab === '0'">
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

    <ConfirmDialog :style="{ maxWidth: '380px' }" />
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
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import type { FileUploadSelectEvent } from 'primevue/fileupload';

import UserSettingsProfileTab from './UserSettingsProfile.vue';
import UserSettingsSecurityTab from './UserSettingsSecurity.vue';

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
const password = ref('');
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

const availableLocales = computed(
  () => [...(instanceStore.instance?.languages || [])] as Array<{ code: string; name: string }>,
);
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

const handleChangeLogin = async (): Promise<void> => {
  if (newLogin.value === '' && password.value === '') {
    loginErrorMessage.value = t('userSettings.loginAndPasswordRequired');
    return;
  }
  if (newLogin.value === '') {
    loginErrorMessage.value = t('userSettings.loginRequired');
    return;
  }
  if (password.value === '') {
    loginErrorMessage.value = t('userSettings.passwordRequired');
    return;
  }
  if (newLogin.value !== login.value) {
    try {
      await userStore.login(login.value, password.value);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        loginErrorMessage.value = t('userSettings.wrongPassword');
        return;
      } else {
        useTextMessageStore.addTextMessage('Error', t('error.unknownError'));
        return;
      }
    }
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
  () => [newLogin.value, password.value],
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
  }

  .user-settings-footer-buttons {
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
</style>
