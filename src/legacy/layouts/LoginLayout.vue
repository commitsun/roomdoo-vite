<template>
  <div class="login-layout-container">
    <div class="form-container">
      <router-view class="login-form" />
    </div>
    <div class="footer">
      <div class="contact">
        <p>¿Eres nuevo en Roomdoo?</p>
        <span> Contacta con nosotros</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.login-layout-container {
  height: 100svh;
  background-color: #eeeeee;
  display: flex;
  flex-direction: column;
  .form-container {
    flex: 1 1 auto;
    @media (min-width: 1024px) {
      display: flex;
      justify-content: center;
      align-items: center;
      .login-form {
        height: 600px;
        width: 650px;
        border-radius: 24px;
      }
    }
  }
  .footer {
    display: none;
    min-height: 3rem;
    @media (min-width: 1024px) {
      display: block;
    }
    .contact {
      height: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      p {
        margin: 0;
      }
      span {
        font-size: 14px;
        color: $primary;
        margin-left: 1rem;
        margin-right: 1rem;
      }
    }
  }
}
</style>
