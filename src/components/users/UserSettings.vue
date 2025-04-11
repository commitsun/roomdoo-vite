<template>
  <div class="mask">
    <div class="main-content">
      <div class="user-settings-title">
        <img src="/app-images/arrow-left-black.svg" @click="$emit('close')" class="arrow-back" />
        <div class="user-info">
          <span>Perfil de usuario</span>
          <span class="two-dots">:</span>
          <span class="title-email">{{ activeUser?.userEmail }}</span>
        </div>
        <div class="user-settings-title-right">
          <button class="btn-save" v-if="isSomeUserDataChange" @click="saveChanges">Guardar</button>
          <img src="/app-images/icon-close.svg" @click="$emit('close')" class="close-icon" />
        </div>
      </div>
      <div class="user-settings-body">
        <input class="hidden-file-input" type="file" ref="fileInput" @change="onImageSelected" />
        <div class="user-photo">
          <img class="user-avatar" v-if="imageUrl !== null" :src="imageUrl" />
          <img class="user-avatar" src="/app-images/avatar.png" v-else />
          <div class="photo-options">
            <div class="photo-replace" :class="!imageUrl ? 'photo-replace-without-image' : ''">
              <div class="photo-replace-wrapper" @click="selectFile">
                <img src="/app-images/photo-add.svg" />
                <span> {{ imageUrl ? 'Reemplazar ' : 'Añadir ' }}foto </span>
              </div>
            </div>
            <div class="photo-delete" v-if="imageUrl">
              <div class="photo-delete-wrapper" @click="onImageDelete">
                <img src="/app-images/delete.svg" />
                <span> Eliminar foto </span>
              </div>
            </div>
          </div>
        </div>
        <div class="user-inputs">
          <span> Nombre </span>
          <InputText class="input" v-model="firstname" @input="onUserDataInput" />
          <span> Apellidos </span>
          <InputText class="input" v-model="lastname" @input="onUserDataInput" />

          <span> Teléfono </span>
          <InputText class="input" v-model="phone" @input="onUserDataInput" />
          <span> Email </span>
          <InputText class="input" v-model="email" @input="onUserDataInput" />
        </div>
        <div class="user-inputs-desktop">
          <div class="user-input-row">
            <div class="user-input-column">
              <span> Nombre </span>
              <InputText
                class="input"
                v-model="firstname"
                @input="onUserDataInput"
                :tabIndex="'10'"
              />
              <span> Teléfono </span>
              <InputText class="input" v-model="phone" @input="onUserDataInput" :tabIndex="'12'" />
            </div>
          </div>
          <div class="user-input-row">
            <div class="user-input-column">
              <span> Apellidos </span>
              <InputText
                class="input"
                v-model="lastname"
                @input="onUserDataInput"
                :tabIndex="'11'"
              />
              <span> Email </span>
              <InputText class="input" v-model="email" @input="onUserDataInput" :tabIndex="'13'" />
            </div>
          </div>
        </div>
        <div class="password-manage">
          <div class="password-manage-title">
            <img src="/app-images/icon-password.svg" />
            <span> Gestión de contraseña </span>
          </div>
          <div class="password-manage-body">
            <span> Modifica la contraseña con la accedes actualmente a tu cuenta de Roomdoo. </span>
            <div class="btn-change-password" @click="isPasswordModalOpen = true">
              <img src="/app-images/icon-replace.svg" />
              <span> Cambiar contraseña </span>
            </div>
          </div>
        </div>
      </div>
      <Transition name="change-password-transition">
        <div class="change-password-modal" v-if="isPasswordModalOpen">
          <div class="change-password-title">
            <img
              class="back-arrow-password"
              src="/app-images/arrow-left-black.svg"
              @click="isPasswordModalOpen = false"
            />
            <span>Cambiar Contraseña</span>
            <img
              src="/app-images/icon-close.svg"
              @click="isPasswordModalOpen = false"
              class="close-change-password"
            />
          </div>
          <div class="change-password-body">
            <InputText
              textLabel="Contraseña actual"
              password
              class="input-password"
              :class="emptyPassword ? 'input-error' : ''"
              v-model="currentPassword"
            />
            <InputText
              textLabel="Nueva contraseña"
              password
              class="input-password"
              :class="isNotPasswordsMatch || emptyNewPassword ? 'input-error' : ''"
              v-model="newPassword"
              @input="checkPasswordsMatch()"
            />
            <InputText
              textLabel="Repetir contraseña"
              password
              class="input-password"
              :class="isNotPasswordsMatch || emptyRepeatedPassword ? 'last-input-error' : ''"
              v-model="repeatedPassword"
              @input="checkPasswordsMatch"
            />
            <div class="error" v-if="isNotPasswordsMatch">
              <div class="error-icon">
                <img src="/app-images/icon-close-red.svg" class="icon-x" />
              </div>
              <span>Las contraseñas no coinciden</span>
            </div>
            <div
              v-else-if="emptyPassword || emptyNewPassword || emptyRepeatedPassword"
              class="error"
            >
              <div class="error-icon">
                <img src="/app-images/icon-close-red.svg" class="icon-x" />
              </div>
              <span>Por favor, rellena todos los campos</span>
            </div>
            <div
              class="btn-change-password"
              :class="
                isNotPasswordsMatch || emptyPassword || emptyNewPassword || emptyRepeatedPassword
                  ? 'btn-password-error'
                  : ''
              "
              @click="changePassword()"
            >
              <span> Guardar </span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div
      class="mask-password-modal"
      v-if="isPasswordModalOpen"
      @close="isPasswordModalOpen = false"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import InputText from '@/components/roomdooComponents/InputText.vue';
import { useStore } from '@/store';
import { dialogService } from '@/services/DialogService';

export default defineComponent({
  components: {
    InputText,
  },

  setup() {
    const store = useStore();

    const firstname = ref('');
    const lastname = ref('');
    const phone = ref('');
    const email = ref('');
    const currentPassword = ref('');
    const newPassword = ref('');
    const repeatedPassword = ref('');
    const isSomeUserDataChange = ref(false);
    const isPasswordModalOpen = ref(false);
    const isNotPasswordsMatch = ref(false);
    const emptyPassword = ref(false);
    const emptyNewPassword = ref(false);
    const emptyRepeatedPassword = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    const imageUrl = ref<string | null>(null);

    const initialUserData = ref({
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
    });

    const activeUser = computed(() => store.state.user.activeUser);

    const onUserDataInput = () => {
      if (
        initialUserData.value.firstname !== firstname.value ||
        initialUserData.value.lastname !== lastname.value ||
        initialUserData.value.phone !== phone.value ||
        initialUserData.value.email !== email.value
      ) {
        isSomeUserDataChange.value = true;
      } else {
        isSomeUserDataChange.value = false;
      }
    };

    const onImageSelected = () => {
      if (fileInput.value && fileInput.value.files && fileInput.value.files[0]) {
        const file = fileInput.value.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          imageUrl.value = reader.result as string;
        };
        reader.readAsDataURL(file);
        isSomeUserDataChange.value = true;
      }
    };

    const onImageDelete = () => {
      if (imageUrl.value) {
        imageUrl.value = null;
      }
      isSomeUserDataChange.value = true;
    };

    const selectFile = () => {
      fileInput.value?.click();
    };

    const saveDataUser = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('user/updateUser', {
          userId: activeUser.value?.userId,
          userName: `${firstname.value} ${lastname.value}`,
          userPhone: phone.value,
          userEmail: email.value,
          userImageBase64: imageUrl.value ? imageUrl.value.split(',')[1] : null,
          defaultPropertyId: activeUser.value?.defaultPropertyId,
          expirationDate: activeUser.value?.expirationDate,
          availabilityRuleFields: activeUser.value?.availabilityRuleFields,
        });
        await store.dispatch('user/fetchUser', activeUser.value?.userId);
        await store.dispatch('user/recoverCookies');
      } catch {
        dialogService.open({
          header: 'Algo ha ido mal',
          content: 'No se han podido guardar los cambios',
          btnAccept: 'Aceptar',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const saveChanges = async () => {
      await saveDataUser();
    };

    const checkInputPasswordsEmpty = () => {
      if (!currentPassword.value) {
        emptyPassword.value = true;
      } else {
        emptyPassword.value = false;
      }
      if (!newPassword.value) {
        emptyNewPassword.value = true;
      } else {
        emptyNewPassword.value = false;
      }
      if (!repeatedPassword.value) {
        emptyRepeatedPassword.value = true;
      } else {
        emptyRepeatedPassword.value = false;
      }
    };

    const changePassword = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (currentPassword.value && newPassword.value && repeatedPassword.value) {
          if (newPassword.value === repeatedPassword.value) {
            await store.dispatch('user/changePassword', {
              userId: activeUser.value?.userId,
              password: currentPassword.value,
              newPassword: newPassword.value,
            });
            currentPassword.value = '';
            newPassword.value = '';
            repeatedPassword.value = '';
            isPasswordModalOpen.value = false;
          } else {
            isNotPasswordsMatch.value = true;
            checkInputPasswordsEmpty();
          }
        } else {
          checkInputPasswordsEmpty();
        }
      } catch {
        dialogService.open({
          header: 'Algo ha ido mal',
          content: 'No se ha podido cambiar la contraseña',
          btnAccept: 'Aceptar',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const checkPasswordsMatch = () => {
      if (newPassword.value && repeatedPassword.value && isNotPasswordsMatch.value) {
        if (newPassword.value === repeatedPassword.value) {
          isNotPasswordsMatch.value = false;
        }
      }
    };

    watch(isPasswordModalOpen, (value) => {
      if (!value) {
        currentPassword.value = '';
        newPassword.value = '';
        repeatedPassword.value = '';
        isNotPasswordsMatch.value = false;
        emptyPassword.value = false;
        emptyNewPassword.value = false;
        emptyRepeatedPassword.value = false;
      }
    });

    onMounted(() => {
      if (activeUser.value) {
        const userName = activeUser.value.userName.split(' ');
        const [firstName] = userName;
        firstname.value = firstName;
        if (userName.length > 1) {
          const lastName = userName.slice(1).join(' ');
          lastname.value = lastName;
        }
        phone.value = activeUser.value?.userPhone ?? '';
        email.value = activeUser.value?.userEmail ?? '';
      }
      initialUserData.value = {
        firstname: firstname.value,
        lastname: lastname.value,
        phone: phone.value,
        email: email.value,
      };
      if (activeUser.value?.userImageBase64) {
        imageUrl.value =
          activeUser.value?.userImageBase64 !== 'null'
            ? `data:image/png;base64,${activeUser.value?.userImageBase64}`
            : null;
      }
    });

    return {
      activeUser,
      firstname,
      lastname,
      phone,
      email,
      isSomeUserDataChange,
      isPasswordModalOpen,
      fileInput,
      imageUrl,
      currentPassword,
      newPassword,
      repeatedPassword,
      isNotPasswordsMatch,
      initialUserData,
      emptyPassword,
      emptyNewPassword,
      emptyRepeatedPassword,
      onImageSelected,
      onImageDelete,
      onUserDataInput,
      selectFile,
      saveChanges,
      changePassword,
      checkPasswordsMatch,
    };
  },
});
</script>
<style lang="scss" scoped>
.mask {
  .main-content {
    position: absolute;
    width: 100vw;
    height: 100%;
    top: 0;
    left: 0;
    background-color: white;
    .user-settings-title {
      display: flex;
      align-items: center;
      padding-left: 18px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
      width: 100%;
      .arrow-back {
        width: 12px;
        height: 20px;
        display: inline;
      }
      .user-info {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        margin-left: 14px;
        font-weight: 600;
        padding: 14px 0;
        overflow: hidden;
        white-space: nowrap;
        .two-dots {
          display: none;
        }
        span {
          &:last-child {
            font-weight: 500;
            margin-top: -5px;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
      .user-settings-title-right {
        margin-left: auto;
        display: flex;
        align-items: center;
        .btn-save {
          width: 74px;
          height: 32px;
          background-color: $call_to_action_color;
          border-radius: 5px;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: bold;
          margin-right: 20px;
          cursor: pointer;
        }
        .close-icon {
          display: none;
          margin-left: auto;
        }
      }
    }
    .user-settings-body {
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      height: calc(100% - 100px);
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      .user-photo {
        display: flex;
        flex-direction: column;
        .user-avatar {
          width: 75px;
          height: 75px;
          object-fit: cover;
          border-radius: 50%;
          align-self: center;
          margin-top: 35px;
        }
        .photo-options {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 30px;
          width: 100%;
          margin: 25px 0;
          .photo-replace {
            display: flex;
            align-items: center;
            height: 100%;
            width: 50%;
            .photo-replace-wrapper {
              height: 100%;
              background-color: #f0f0f0;
              border-radius: 5px;
              display: flex;
              align-items: center;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              padding: 0 18px;
              margin-left: auto;
              img {
                width: 15px;
                height: 15px;
                margin-right: 1rem;
              }
            }
          }
          .photo-replace-without-image {
            width: fit-content;
          }
          .photo-delete {
            display: flex;
            align-items: center;
            width: 50%;
            .photo-delete-wrapper {
              height: 100%;
              border-radius: 5px;
              display: flex;
              align-items: center;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              padding: 0 18px;
              img {
                width: 15px;
                height: 15px;
                margin-right: 1rem;
              }
            }
          }
        }
      }
      .user-inputs {
        padding: 10px 20px;
        font-size: 16px;

        span {
          font-weight: 600;
        }
        .input {
          height: 41px;
          box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
          margin: 8px 0 14px 0;
        }
      }
      .user-inputs-desktop {
        display: none;
      }

      .password-manage {
        display: flex;
        flex-direction: column;
        margin: 10px 20px 20px 20px;
        box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
        border-radius: 10px;
        .password-manage-title {
          height: 35px;
          display: flex;
          align-items: center;
          background-color: rgba(211, 211, 211, 0.28);
          img {
            width: 24px;
            height: 24px;
            margin-left: 13px;
          }
          span {
            font-size: 16px;
            font-weight: 600;
            margin-left: 10px;
          }
        }
        .password-manage-body {
          padding: 20px;
          font-size: 14px;
          font-weight: 600;
          .btn-change-password {
            display: flex;
            background-color: $primary;
            align-items: center;
            width: 65%;
            height: 35px;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            justify-content: center;
            margin-top: 25px;
            img {
              width: 17px;
              height: 17px;
              margin-right: 15px;
            }
          }
        }
      }
      .roomdoo-interface {
        display: none;
      }
      .hidden-file-input {
        display: none;
      }
    }
    .change-password-modal {
      position: absolute;
      width: 100vw;
      height: 100vh;
      z-index: 101;
      top: 0;
      left: 0;
      background-color: white;
      .change-password-title {
        display: flex;
        align-items: center;
        // padding: 1rem 0;

        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
        font-size: 16px;
        font-weight: 600;
        height: 71px;
        .back-arrow-password {
          margin: 0 15px 0 18px;
          width: 12px;
          height: 20px;
        }
        .close-change-password {
          display: none;
        }
      }
      .change-password-body {
        display: flex;
        flex-direction: column;
        padding-top: 35px;
        .input-password {
          margin: 12px 20px;
          height: 60px;
        }
        .btn-change-password {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          background-color: $primary;
          color: white;
          margin: 16px 20px 0 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .last-input-error {
          border: 1px solid red;
          margin-bottom: 3px;
        }
        .btn-password-error {
          margin-top: 4px;
        }
        .error {
          margin-left: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          font-weight: 500;
          background-color: #f49b9b;
          padding: 0 12px;
          border-radius: 10px;
          .error-icon {
            margin-right: 18px;
            border-radius: 3px;
            width: 14px;
            height: 14px;
            border: 1px solid #cc0000;
            background-color: #cc0000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            .icon-x {
              width: 12px;
              height: 12px;
            }
          }
          span {
            color: #cc0000;
          }
        }
        .input-error {
          border: 1px solid red;
        }
      }
    }
  }
  .mask-password-modal {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    transition: opacity 0.3s ease;
    z-index: 97;
  }
}
.change-password-transition-enter-active,
.change-password-transition-leave-active {
  transition: all 0.2s;
}
.change-password-transition-enter-to,
.change-password-transition-leave-from {
  transform: translateX(0);
}
.change-password-transition-enter-from,
.change-password-transition-leave-to {
  transform: translateX(-100%);
}
@media (min-width: 1024px) {
  .mask {
    position: fixed;
    z-index: 2000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    transition: opacity 0.3s ease;
    .main-content {
      position: relative;
      width: 800px;
      height: fit-content;
      right: 50%;
      margin: auto;
      background-color: #fff;
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
      transition: all 0.3s ease;
      border-radius: 10px;
      .user-settings-title {
        box-shadow: none;
        border-bottom: 1px solid #d9d9d9;
        height: 75px;
        padding-left: 0;
        .arrow-back {
          display: none;
        }
        .user-info {
          flex-direction: row;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
          margin-left: 40px;
          .two-dots {
            display: inline;
          }
          span {
            &:last-child {
              margin-top: 0;
              font-weight: bold;
              margin-left: 1ch;
            }
          }
        }

        .user-settings-title-right {
          .btn-save {
            width: 125px;
            height: 40px;
            font-size: 16px;
            cursor: pointer;
            margin-right: 28px;
          }
          .close-icon {
            display: inline;
            width: 18px;
            height: 18px;
            margin-right: 35px;
            cursor: pointer;
          }
        }
      }
      .user-settings-body {
        .user-photo {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-top: 25px;
          margin-bottom: 2rem;
          .user-avatar {
            margin-top: 0;
            margin-left: 40px;
          }
          .photo-options {
            width: fit-content;
            margin-left: 20px;
            .photo-replace {
              width: fit-content;
              .photo-replace-wrapper {
                cursor: pointer;
              }
            }
            .photo-delete {
              width: fit-content;
              cursor: pointer;
            }
          }
        }
        .user-inputs {
          display: none;
        }

        .user-inputs-desktop {
          display: flex;
          width: 100%;
          .user-input-row {
            &:first-child {
              width: 50%;
              margin-left: 20px;
            }
            &:last-child {
              width: 50%;
              margin-left: 20px;
              margin-right: 20px;
            }
            .user-input-column {
              display: flex;
              flex-direction: column;

              span {
                font-weight: 600;
                margin: 0 0 0.2rem 0.2rem;
              }
              .input {
                height: 40px;
                width: 100%;
                margin-bottom: 0.8rem;
                font-size: 16px;
                font-weight: 600;
              }
            }
          }
        }
        .password-manage {
          .password-manage-title {
            img {
              margin-left: 20px;
            }
          }
          .password-manage-body {
            padding: 20px;
            .btn-change-password {
              width: 25%;
            }
          }
        }
        .roomdoo-interface {
          display: flex;
          flex-direction: column;
          margin: 20px;
          box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
          border-radius: 10px;
          .roomdoo-interface-title {
            height: 35px;
            display: flex;
            align-items: center;
            background-color: rgba(211, 211, 211, 0.28);
            img {
              width: 16px;
              height: 16px;
              margin-left: 20px;
            }
            span {
              font-size: 16px;
              font-weight: 600;
              margin-left: 10px;
            }
          }
          .roomdoo-interface-body {
            padding: 16px 20px 24px 20px;
            font-size: 14px;
            .body-first-row {
              margin-bottom: 1rem;
              font-weight: 600;
            }
            .toogle-interface {
              display: flex;
              margin-top: 1rem;
              align-items: center;
              .switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 32px;
              }

              .switch input {
                opacity: 0;
                width: 0;
                height: 0;
              }

              .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #b0b0b0;
                -webkit-transition: 0.4s;
                transition: 0.4s;
              }

              .slider:before {
                position: absolute;
                content: '';
                height: 26px;
                width: 26px;
                left: 4px;
                top: 3px;
                background-color: white;
                -webkit-transition: 0.4s;
                transition: 0.4s;
              }

              input:checked + .slider {
                background-color: $primary;
              }

              input:focus + .slider {
                box-shadow: 0 0 1px $primary;
              }

              input:checked + .slider:before {
                -webkit-transform: translateX(20px);
                -ms-transform: translateX(20px);
                transform: translateX(15px);
              }

              .slider.round {
                border-radius: 34px;
              }

              .slider.round:before {
                border-radius: 50%;
              }
              .toggle-label {
                margin-left: 1rem;
                font-weight: 600;
                cursor: pointer;
              }
            }
          }
        }
      }
      .change-password-modal {
        position: absolute;
        width: 75%;
        height: fit-content;
        z-index: 101;
        top: 50px;
        left: 12%;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
        padding-bottom: 1rem;
        .change-password-title {
          font-size: 18px;
          font-weight: 600;
          padding-left: 40px;
          height: 75px;
          box-shadow: none;
          border-bottom: 1px solid #d9d9d9;
          .back-arrow-password {
            display: none;
          }
          .close-change-password {
            display: inline;
            margin-left: auto;
            margin-right: 40px;
            height: 18px;
            width: 18px;
            cursor: pointer;
          }
        }
        .change-password-body {
          padding-top: 30px;
          .input-password {
            margin: 0 40px 25px 40px;
          }
          .btn-change-password {
            margin: 25px 40px 0 40px;
          }
          .error {
            color: red;
            margin-left: 45px;
          }
          .last-input-error {
            border: 1px solid red;
            margin-bottom: 10px;
          }
          .btn-password-error {
            margin-top: 19px;
          }
          .input-error {
            border: 1px solid red;
          }
        }
      }
    }
  }
  .change-password-transition-enter-active,
  .change-password-transition-leave-active {
    transition: all 0.2s;
  }
  .change-password-transition-enter-to,
  .change-password-transition-leave-from {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
  .change-password-transition-enter-from,
  .change-password-transition-leave-to {
    opacity: 0;
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}
</style>
