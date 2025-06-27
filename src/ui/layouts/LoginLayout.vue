<template>
  <div class="login-layout debug-box">
    <div class="left debug-box">a</div>
    <div class="right debug-box">
      <router-view />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.login-layout {
  display: flex;
  flex-direction: column; // Mobile-first: columna por defecto
  height: 100vh;

  .left {
    display: none; // Oculto en móviles y tablets por defecto
  }

  .right {
    flex: 1;
  }

  @media (min-width: 1024px) {
    // Desktop en adelante
    flex-direction: row;

    .left {
      display: block;
      width: 33.33%; // Un tercio
      background: linear-gradient(to bottom left, #2a0a58, #081b2b, #0e96c8);
    }

    .right {
      width: 66.67%; // Dos tercios
    }
  }
}
</style>
