<template>
  <div>
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
            @select="(e) => $emit('selectAvatar', e)"
            :auto="true"
            chooseIcon="-"
            :chooseLabel="imageUrl ? t('userSettings.changeImage') : t('userSettings.uploadPhoto')"
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
          @click="$emit('update:imageUrl', '')"
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
          {{ t('userSettings.firstName') }} *
        </label>
        <InputText
          class="user-settings-control"
          id="firstName"
          :modelValue="firstName"
          :style="{ minWidth: '260px' }"
          @update:modelValue="$emit('update:firstName', $event)"
        />
      </div>
      <div class="user-settings-field" :class="{ 'user-settings-field-full': !showLastName2 }">
        <label class="user-settings-label" for="lastName">
          {{ t('userSettings.lastName') }}
        </label>
        <InputText
          class="user-settings-control"
          id="lastName"
          :modelValue="lastName"
          :style="{ minWidth: '260px' }"
          @update:modelValue="$emit('update:lastName', $event)"
        />
      </div>
      <div class="user-settings-field" v-if="showLastName2">
        <label class="user-settings-label" for="secondLastName">
          {{ t('userSettings.secondLastName') }}
        </label>
        <InputText
          class="user-settings-control"
          id="secondLastName"
          :modelValue="secondLastName"
          :style="{ minWidth: '260px' }"
          @update:modelValue="$emit('update:secondLastName', $event)"
        />
      </div>
    </div>

    <div class="user-settings-grid">
      <div class="user-settings-section-title">
        {{ t('userSettings.contactData') }}
      </div>
      <div class="user-settings-field user-settings-field-full">
        <label class="user-settings-label" for="email"> {{ t('userSettings.email') }}* </label>
        <InputText
          class="user-settings-control"
          id="email"
          :modelValue="email"
          :style="{ minWidth: '260px' }"
          @update:modelValue="$emit('update:email', $event)"
        />
      </div>
      <div class="user-settings-field">
        <label class="user-settings-label" for="phone">
          {{ t('userSettings.phone') }}
        </label>
        <InputText
          class="user-settings-control"
          id="phone"
          :modelValue="phone"
          :style="{ minWidth: '260px' }"
          @update:modelValue="$emit('update:phone', $event)"
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
            :modelValue="selectedLocale"
            optionLabel="name"
            optionValue="code"
            :options="availableLocales"
            aria-label="language"
            @update:modelValue="$emit('update:selectedLocale', $event)"
          />
        </IconField>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import FileUpload from 'primevue/fileupload';

defineProps<{
  labelAvatar: string;
  availableLocales: Array<{ code: string; name: string }>;
  showLastName2: boolean;

  imageUrl: string;
  firstName: string;
  lastName: string;
  secondLastName: string;
  email: string;
  phone: string;
  selectedLocale: string;
}>();

const _emit = defineEmits([
  'update:imageUrl',
  'update:firstName',
  'update:lastName',
  'update:secondLastName',
  'update:email',
  'update:phone',
  'update:selectedLocale',
  'selectAvatar',
] as const);

const { t } = useI18n({ useScope: 'global' });
</script>

<style scoped lang="scss">
.user-settings-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.right {
  p {
    margin-top: 12px;
    font-size: 12px;
  }
}

.user-settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 2rem;
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

.user-settings-label {
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 7px;
  display: block;
  color: #64748b;
}

@media (min-width: 1024px) {
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
}
</style>
