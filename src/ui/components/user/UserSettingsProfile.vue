<template>
  <div class="profile-data">
    <div class="content">
      <div class="image-section">
        <div class="left">
          <Avatar
            shape="circle"
            :label="!imageUrl ? labelAvatar : ''"
            :image="imageUrl ? imageUrl : ''"
            class="avatar-image"
            :pt="{
              image: {
                style: 'object-fit: cover; width: 100%; height: 100%;',
              },
            }"
          />
        </div>
        <div class="right">
          <div class="delete-image">
            <FileUpload
              mode="basic"
              :maxFileSize="maxFileSize"
              @select="(e) => $emit('selectAvatar', e)"
              :auto="true"
              chooseIcon="pi pi-upload"
              :chooseLabel="
                imageUrl ? t('userSettings.changeImage') : t('userSettings.uploadPhoto')
              "
              :chooseButtonProps="{
                class: 'p-button-outlined p-button-secondary p-button-sm',
                style: {
                  marginBottom: '12px',
                  height: '27px',
                  fontSize: '12px',
                },
              }"
              :pt="{
                root: {
                  'data-testid': 'fileupload-root',
                },
              }"
              :invalidFileSizeMessage="t('userSettings.fileTooLarge')"
            />
          </div>
          <div class="delete-image">
            <Button
              v-if="imageUrl"
              icon="pi pi-trash"
              :label="t('userSettings.removeImage')"
              severity="secondary"
              variant="outlined"
              size="small"
              @click="$emit('update:imageUrl', '')"
              :pt="{
                root: {
                  style: { height: '27px', marginBottom: '12px', fontSize: '12px' },
                },
              }"
            />
          </div>
          <p class="feedback-file-type">
            {{ t('userSettings.fileTypeSupported', { size: maxFileSize / 1000000 }) }}
          </p>
        </div>
      </div>
      <div class="personal-info-section">
        <span class="title-section"> {{ t('userSettings.personalInformation') }} </span>
        <div class="field-group" :class="{ 'has-lastname2': showLastName2 }">
          <div class="field">
            <label for="name">{{ t('userSettings.firstName') }}</label>
            <InputText
              id="name"
              :modelValue="firstName"
              @update:modelValue="$emit('update:firstName', $event)"
            />
          </div>
          <div class="field">
            <label for="lastname">{{ t('userSettings.lastName') }}</label>
            <InputText
              id="lastname"
              :modelValue="lastName"
              @update:modelValue="$emit('update:lastName', $event)"
            />
          </div>
          <div class="field" v-if="showLastName2">
            <label for="lastname2">{{ t('userSettings.secondLastName') }}</label>
            <InputText
              id="lastname2"
              :modelValue="secondLastName"
              @update:modelValue="$emit('update:secondLastName', $event)"
            />
          </div>
        </div>
      </div>
      <div class="contact-data-section">
        <span class="title-section"> {{ t('userSettings.contactData') }} </span>
        <div class="field-group">
          <div class="field">
            <label for="email">{{ t('userSettings.email') }}</label>
            <InputText
              id="email"
              :modelValue="email"
              @update:modelValue="$emit('update:email', $event)"
            />
          </div>
          <div class="field">
            <label for="phone">{{ t('userSettings.phone') }}</label>
            <InputText
              id="phone"
              :modelValue="phone"
              @update:modelValue="$emit('update:phone', $event)"
            />
          </div>
          <div class="field" v-if="availableLocales.length > 1">
            <label for="language">{{ t('userSettings.language') }}</label>
            <Select
              class="user-settings-control"
              :modelValue="selectedLocale"
              optionLabel="name"
              optionValue="code"
              :options="availableLocales"
              aria-label="language"
              @update:modelValue="$emit('update:selectedLocale', $event)"
            >
              <template #value="{ value }">
                <i class="pi pi-globe"></i>
                {{ availableLocales.find((l) => l.code === value)?.name }}
              </template>
            </Select>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <Button
        :label="t('userSettings.cancel')"
        severity="secondary"
        variant="outlined"
        @click="$emit('cancel')"
      />
      <Button :label="t('userSettings.save')" @click="$emit('save')" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

import { useInstanceStore } from '@/infrastructure/stores/instance';

export default defineComponent({
  name: 'UserSettingsProfile',
  components: { Button, Avatar, InputText, Select, FileUpload },
  props: {
    showLastName2: {
      type: Boolean,
      required: false,
      default: false,
    },
    labelAvatar: {
      type: String,
      required: false,
      default: '',
    },
    imageUrl: {
      type: String,
      required: false,
      default: '',
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    secondLastName: {
      type: String,
      required: false,
      default: '',
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
      default: '',
    },
    selectedLocale: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:firstName',
    'update:lastName',
    'update:secondLastName',
    'update:email',
    'update:phone',
    'update:selectedLocale',
    'update:imageUrl',
    'selectAvatar',
    'cancel',
    'save',
  ],
  setup() {
    const maxFileSize = 10_000_000; // 10 MB
    const { t } = useI18n();
    const instanceStore = useInstanceStore();
    const availableLocales = computed(() => [...(instanceStore.instance?.languages || [])]);
    return {
      maxFileSize,
      t,
      availableLocales,
    };
  },
});
</script>

<style lang="scss" scoped>
.profile-data {
  height: calc(
    100svh - #{$height_title_dialog} - #{$height_title_tabs_with_padding_top} - #{$height_footer}
  );
  .content {
    height: calc(
      100svh - #{$height_title_dialog} - #{$height_title_tabs_with_padding_top} - #{$height_footer}
    );
    overflow-y: scroll;
    flex: 1;

    .image-section {
      display: flex;
      flex-direction: row;
      .left {
        .avatar-image {
          height: 68px;
          width: 68px;
          font-size: 36px;
          background-color: #1f89e1;
          color: white;
        }
      }
      .right {
        margin-left: 12px;
        .feedback-file-type {
          font-size: 12px;
          color: gray;
        }
      }
    }
    .personal-info-section,
    .contact-data-section {
      margin-top: 24px;
      .title-section {
        font-weight: bold;
        font-size: 16px;
      }
      .field-group {
        display: flex;
        flex-direction: column;
        .field {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          label {
            margin-bottom: 7px;
          }
        }
      }
    }
  }
  .bottom {
    width: 100%;
    background-color: white;
    position: absolute;
    bottom: 17.5px;
    right: 30px;
    height: 50px;
    padding: 0;
    padding-top: 17.5px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 7px;
  }
}

@media (min-width: 1024px) {
  .profile-data {
    max-height: 600px;
    .content {
      width: 500px;
      padding-bottom: calc(#{$height_footer} - 17.5px);
      max-height: 600px;

      .image-section {
        .left {
          .avatar-image {
            height: 96px;
            width: 96px;
            font-size: 48px;
          }
        }
      }
      .personal-info-section {
        .field-group {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
          .field {
            margin: 0;
            min-width: 0;
            flex: 1 1 calc(50% - 8px);
          }

          &:not(.has-lastname2) {
            .field:nth-child(1),
            .field:nth-child(2) {
              flex-basis: calc(50% - 8px);
            }
          }

          &.has-lastname2 {
            .field:nth-child(1) {
              flex-basis: 100%;
            }
            .field:nth-child(2),
            .field:nth-child(3) {
              flex-basis: calc(50% - 8px);
            }
          }
        }
      }
      .contact-data-section {
        .field-group {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;

          .field {
            flex: 1 1 0;
            &:not(:first-child) {
              margin: 0;
            }
          }

          .field:first-child {
            flex-basis: 100%;
          }
        }
      }
    }
    .bottom {
      width: calc(100% - 30px);
    }
  }
}
</style>
