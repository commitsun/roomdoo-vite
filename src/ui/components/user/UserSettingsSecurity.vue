<template>
  <div>
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
                :modelValue="login"
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
                :modelValue="newLogin"
                :style="{ minWidth: '260px' }"
                :invalid="
                  loginErrorMessage === t('userSettings.loginRequired') ||
                  loginErrorMessage === t('userSettings.loginAndPasswordRequired')
                "
                @update:modelValue="$emit('update:newLogin', $event)"
              />
            </div>
            <div class="user-settings-field">
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
            <Message v-if="loginErrorMessage !== ''" severity="error">
              {{ loginErrorMessage }}
            </Message>
          </div>
          <div class="user-settings-footer-change-login">
            <Button :label="t('userSettings.changeLogin')" @click="$emit('changeLogin')" />
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
            <LockKeyhole class="user-settings-password-icon mr-2" color="#64748B" :size="15" />
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
            <div class="user-settings-field">
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
            <div class="user-settings-field">
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
            <Message v-if="passwordErrorMessage !== ''" severity="error">
              {{ passwordErrorMessage }}
            </Message>
          </div>
          <div class="user-settings-footer-change-login">
            <Button :label="t('userSettings.changePassword')" @click="$emit('changePassword')" />
          </div>
        </div>
      </div>
    </Panel>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { Mail, Pen, LockKeyhole } from 'lucide-vue-next';

defineProps<{
  login: string;
  newLogin: string;
  password: string;
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
  loginErrorMessage: string;
  passwordErrorMessage: string;
}>();

const _emit = defineEmits([
  'update:newLogin',
  'update:password',
  'update:currentPassword',
  'update:newPassword',
  'update:repeatPassword',
  'changeLogin',
  'changePassword',
] as const);

const { t } = useI18n({ useScope: 'global' });
</script>
<style scoped lang="scss">
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

.user-settings-grid-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
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

.user-settings-security-section {
  font-size: 12px;
}

.user-settings-card {
  padding: 1rem;
  background-color: #ffffff;
}

.user-settings-footer-change-login {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 1.5rem;
  margin-left: 8px;
}

@media (min-width: 1024px) {
  .user-settings-security-section {
    font-size: 14px;
  }
}
</style>
