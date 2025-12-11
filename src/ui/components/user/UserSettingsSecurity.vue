<template>
  <div class="security-data">
    <div class="content">
      <span class="title-section"> {{ t('userSettings.nameEmailLogin') }} </span>
      <Panel
        class="security-panel"
        toggleable
        :collapsed="loginPanelCollapsed"
        @update:collapsed="onLoginPanelToggle"
        :pt="{
          root: (opts) => ({
            style: { backgroundColor: opts.state.d_collapsed ? '#F1F5F9' : undefined },
          }),
          footer: {
            style: {
              padding: 0,
            },
          },
        }"
      >
        <template #toggleicon>
          <Pen color="#1D4ED8" :size="15" />
        </template>
        <template #header>
          <div class="security-header">
            <div class="security-header-top">
              <Mail class="user-settings-login-icon" color="#64748B" :size="15" />
              <div class="user-settings-login-email">{{ login }}</div>
            </div>

            <div class="user-settings-login-text">
              {{ t('userSettings.yourLogin') }}
            </div>
          </div>
        </template>
        <template #footer>
          <div class="security-panel-footer">
            <Button :label="t('userSettings.changeLogin')" @click="$emit('changeLogin')" />
          </div>
        </template>
        <div class="security-panel-main">
          <div class="security-panel-field">
            <label class="user-settings-label" for="login">
              {{ t('userSettings.currentLogin') }}
            </label>
            <InputText
              class="user-settings-control"
              id="login"
              :modelValue="login"
              disabled
              :style="{ minWidth: '260px' }"
            />
          </div>
          <div class="security-panel-field">
            <label class="user-settings-label" for="newLogin">
              {{ t('userSettings.newLogin') }} *
            </label>
            <InputText
              class="user-settings-control"
              id="newLogin"
              :modelValue="newLogin"
              :style="{ minWidth: '260px' }"
              :invalid="
                loginErrorMessage === t('userSettings.loginRequired') ||
                loginErrorMessage === t('userSettings.loginAndPasswordRequired')
              "
              @update:modelValue="$emit('update:newLogin', $event)"
            />
          </div>
          <div class="security-panel-field">
            <label class="user-settings-label" for="password">
              {{ t('userSettings.password') }} *
            </label>
            <Password
              :modelValue="password"
              inputId="password"
              :feedback="false"
              toggleMask
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
              :inputProps="{ autocomplete: 'password' }"
              @update:modelValue="$emit('update:password', $event)"
              :invalid="
                loginErrorMessage === t('userSettings.passwordRequired') ||
                loginErrorMessage === t('userSettings.loginAndPasswordRequired') ||
                loginErrorMessage === t('userSettings.wrongPassword')
              "
            />
          </div>
        </div>
      </Panel>
      <span class="title-section"> {{ t('userSettings.password') }} </span>

      <Panel
        class="security-panel"
        toggleable
        :collapsed="passwordPanelCollapsed"
        @update:collapsed="onPasswordPanelToggle"
        :pt="{
          root: (opts) => ({
            style: { backgroundColor: opts.state.d_collapsed ? '#F1F5F9' : undefined },
          }),
          footer: {
            style: {
              padding: 0,
            },
          },
        }"
      >
        <template #toggleicon>
          <Pen color="#1D4ED8" :size="15" />
        </template>
        <template #header>
          <div class="security-header">
            <div class="security-header-top">
              <LockKeyhole class="user-settings-password-icon mr-2" color="#64748B" :size="15" />
              <div class="user-settings-login-email">••••••••••</div>
            </div>

            <div class="user-settings-login-text">
              {{ t('userSettings.yourPassword') }}
            </div>
          </div>
        </template>
        <template #footer>
          <div class="security-panel-footer">
            <Button :label="t('userSettings.changePassword')" @click="$emit('changePassword')" />
          </div>
        </template>
        <div class="security-panel-main">
          <div class="security-panel-field">
            <label class="user-settings-label" for="currentPassword">
              {{ t('userSettings.currentPassword') }} *
            </label>
            <Password
              :modelValue="currentPassword"
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
              @update:modelValue="$emit('update:currentPassword', $event)"
            />
          </div>
          <div class="security-panel-field">
            <label class="user-settings-label" for="newPassword">
              {{ t('userSettings.newPassword') }} *
            </label>
            <Password
              :modelValue="newPassword"
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
              @update:modelValue="$emit('update:newPassword', $event)"
            />
          </div>
          <div class="security-panel-field">
            <label class="user-settings-label" for="repeatPassword">
              {{ t('userSettings.repeatPassword') }} *
            </label>
            <Password
              :modelValue="repeatPassword"
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
              @update:modelValue="$emit('update:repeatPassword', $event)"
            />
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { Mail, Pen, LockKeyhole } from 'lucide-vue-next';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'UserSettingsSecurity',
  components: {
    Panel,
    InputText,
    Password,
    Message,
    Button,
    Mail,
    Pen,
    LockKeyhole,
  },
  props: {
    login: {
      type: String,
      required: true,
    },
    newLogin: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    currentPassword: {
      type: String,
      required: true,
    },
    newPassword: {
      type: String,
      required: true,
    },
    repeatPassword: {
      type: String,
      required: true,
    },
    loginErrorMessage: {
      type: String,
      required: true,
    },
    passwordErrorMessage: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:newLogin',
    'update:password',
    'update:currentPassword',
    'update:newPassword',
    'update:repeatPassword',
    'changeLogin',
    'changePassword',
    'cancel',
    'save',
  ],
  setup(props, { emit }) {
    const { t } = useI18n({ useScope: 'global' });
    const loginPanelCollapsed = ref(true);
    const passwordPanelCollapsed = ref(true);
    const onLoginPanelToggle = (value: boolean): void => {
      loginPanelCollapsed.value = value;
      if (value) {
        emit('update:password', '');
        emit('update:newLogin', '');
      }
    };
    const onPasswordPanelToggle = (value: boolean): void => {
      passwordPanelCollapsed.value = value;
      if (value) {
        emit('update:currentPassword', '');
        emit('update:newPassword', '');
        emit('update:repeatPassword', '');
      }
    };

    return {
      t,
      loginPanelCollapsed,
      passwordPanelCollapsed,
      onLoginPanelToggle,
      onPasswordPanelToggle,
    };
  },
});
</script>
<style scoped lang="scss">
.security-data {
  height: calc(100svh - #{$height_title_tabs_with_padding_top} - #{$height_title_dialog} - 17.5px);
  .title-section {
    font-weight: bold;
    font-size: 16px;
  }
  .security-panel {
    margin-top: 16px;
    .security-header {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 7px;
      .security-header-top {
        margin-top: 7px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .user-settings-login-text {
        margin-bottom: 7px;
      }
    }
    .security-panel-main {
      display: flex;
      flex-direction: column;
      gap: 17px;
      .security-panel-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
        margin-top: 0;
      }
    }
    &:nth-of-type(1) {
      margin-bottom: 17.5px;
    }
  }
  .security-panel-footer {
    display: block;
    padding: 17.5px;
    padding-top: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 7px;
  }
  .bottom {
    width: 100%;
    padding-right: 25.5px;
    padding-top: 17.5px;
    padding-bottom: 17.5px;
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 7px;
    button {
      height: 33px;
    }
  }
}
@media (min-width: 1024px) {
  .security-data {
    height: 590px;

    .bottom {
      display: none;
    }
  }
}
</style>
