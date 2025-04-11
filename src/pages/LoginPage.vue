<template>
  <form class="login-container" onsubmit="return false">
    <div class="login-header">
      <img class="logo-img" src="/logos/logo-new.svg" />
    </div>
    <div class="login-form">
      <p v-if="!isForgotPassword">Inicia sesión en Roomdoo</p>
      <p v-else>Para restablecer tu contraseña, introduce tu correo</p>
      <div>
        <InputText
          textLabel="Correo electrónico"
          class="input-login"
          :class="isEmailEmpty ? 'input-error' : ''"
          v-model="email"
        />
      </div>
      <div v-if="!isForgotPassword">
        <InputText
          textLabel="Contraseña"
          password
          class="input-login"
          :class="isPasswordEmpty ? 'input-error' : ''"
          v-model="password"
          @keyup.enter="doLogin()"
        />
      </div>
      <button v-if="!isForgotPassword" @click="doLogin()">Acceder</button>
      <button v-else @click="sendMailToResetPassword()">Continuar</button>
      <div class="send-email-feedback" v-if="isMailToResetPasswordSend && isForgotPassword">
        <input type="checkbox" checked v-model="checkbox" @change="checkbox = true" />
        <span> Email de recuperación enviado </span>
      </div>
      <div v-else-if="isForgotPassword" />
    </div>
    <div class="login-footer">
      <p v-if="!isForgotPassword" @click="changeToForgotPassword(true)">
        ¿Has olvidado tu contraseña?
      </p>
      <p v-else @click="changeToForgotPassword(false)">Volver a iniciar sesión</p>
      <hr />
      <div class="contact">
        <p>¿Eres nuevo en Roomdoo?</p>
        <span> Contacta con nosotros</span>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import InputText from '@/components/roomdooComponents/InputText.vue';
import { ref } from 'vue';

import { useStore } from '@/store';

export default {
  components: { InputText },

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const isEmailEmpty = ref(false);
    const isPasswordEmpty = ref(false);
    const isForgotPassword = ref(false);
    const isMailToResetPasswordSend = ref(false);
    const checkbox = ref(true);

    const isEmptyInputs = () => {
      let isSomeInputEmpty = false;
      if (email.value === '') {
        isEmailEmpty.value = true;
        isSomeInputEmpty = true;
      } else {
        isEmailEmpty.value = false;
      }
      if (password.value === '') {
        isPasswordEmpty.value = true;
        isSomeInputEmpty = true;
      } else {
        isPasswordEmpty.value = false;
      }
      return isSomeInputEmpty;
    };

    const doLogin = async () => {
      if (isEmptyInputs()) {
        return;
      }
      if (email.value === '' || password.value === '') {
        if (email.value === '') {
          isEmailEmpty.value = true;
        } else {
          isEmailEmpty.value = false;
        }
        if (password.value === '') {
          isPasswordEmpty.value = true;
        } else {
          isPasswordEmpty.value = false;
        }
        return;
      }
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('user/login', { email: email.value, password: password.value });
        if (store.state.user.activeUser) {
          if (route.params.pmsPropertyId) {
            await router.push(`/${route.params.pmsPropertyId as string}`);
          } else {
            await router.push('/');
          }
        }
      } catch {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const sendMailToResetPassword = () => {
      if (email.value === '') {
        isEmailEmpty.value = true;
        return;
      }
      isEmailEmpty.value = false;
      void store.dispatch('user/sendMailToResetPassword', {
        userEmail: email.value,
        url: window.location.origin,
      });
      isMailToResetPasswordSend.value = true;
    };

    const changeToForgotPassword = (value: boolean) => {
      isForgotPassword.value = value;
      isMailToResetPasswordSend.value = false;
      email.value = '';
      password.value = '';
    };

    return {
      store,
      route,
      email,
      password,
      isForgotPassword,
      isMailToResetPasswordSend,
      checkbox,
      isEmailEmpty,
      isPasswordEmpty,
      doLogin,
      sendMailToResetPassword,
      changeToForgotPassword,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: stretch;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: white;

  .login-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('/app-images/rectangle.svg');
    background-position: center;
    width: 100%;
    max-height: 250px;
    background-repeat: no-repeat;
    background-size: cover;
    .logo-img {
      width: 250px;
      height: 250px;
    }
  }
  .login-form {
    height: calc(100% - 90px);
    p {
      font-size: 18px;
      margin-bottom: 8px;
      margin-left: 0.2ch;
      font-weight: 500;
    }
    .input-login {
      margin-bottom: 1.2rem;
    }
    .input-error {
      border: 1px solid red;
    }
    button {
      width: 100%;
      border-radius: 8px;
      background-color: $primary;
      color: white;
      font-weight: bold;
      border: none;
      height: 46px;
      font-size: 16px;
      cursor: pointer;

      // font-family: 'rethink-sans', sans-serif;
    }
    .send-email-feedback {
      display: flex;
      align-items: center;
      background-color: #a5e9a5;
      width: fit-content;
      height: 25px;
      color: #008000;
      padding: 0 12px;
      margin-top: 22px;
      border-radius: 10px;
      input {
        accent-color: #008000;
        width: 14px;
        height: 14px;
        cursor: default;
      }
      span {
        margin-left: 18px;
      }
    }
  }
  .login-footer {
    min-height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border-top: 1px solid #e0e0e0;
    hr {
      display: none;
    }
    & > p {
      text-decoration: underline;
      color: #5b5b5b;
      font-weight: 600;
      width: fit-content;
      cursor: pointer;
    }
    .contact {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      span {
        margin-left: 1ch;
        color: $primary;
      }
    }
  }

  .login-form,
  .login-footer {
    margin: 0 2rem;
  }
  .login-form {
    margin-top: 3.5rem;
    .input-login {
      height: 60px;
    }
  }
}

@media (min-width: 1024px) {
  .login-container {
    .login-header {
      border-radius: 24px 24px 0 0;
      height: 26%;
      background-image: url('/app-images/rectangle.svg');
      background-position: center;
      width: 100%;
      background-repeat: no-repeat;
      background-size: cover;
      .logo-img {
        padding-top: 2px;
      }
    }
    .login-footer {
      height: calc(100% - 25% - 271px);
      flex-direction: column-reverse;
      justify-content: flex-start;
      border-top: none;
      margin: 0;
      padding: 8px 0;
      & > p {
        margin: 25px 0 25px 4rem;
      }
      hr {
        display: block;
        background-color: #e0e0e0;
        border: none;
        height: 1px;
        margin: 0;
      }
      .contact {
        display: none;
      }
    }
    .login-form {
      margin: 0 4rem;
      margin-top: 1.5rem;
      height: fit-content;
      div {
        height: 60px;
        margin-bottom: 1.5rem;
      }
    }
  }
}
</style>
