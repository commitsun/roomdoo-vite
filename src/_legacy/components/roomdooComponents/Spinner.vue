<template>
  <TransitionGroup name="fade-spinner">
    <div v-if="show" class="overlay-spinner"></div>
    <div v-if="show" class="spinner-container">
      <span class="loader"></span>
    </div>
  </TransitionGroup>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
.overlay-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.spinner-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  .loader {
    width: 50px;
    height: 50px;
    border: 5px solid lightgray;
    border-bottom-color: $primary;
    border-radius: 50%;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-spinner-enter-active,
.fade-spinner-leave-active {
  transition: opacity 0.5s;
}
.fade-spinner-enter-from,
.fade-spinner-leave-to {
  opacity: 0;
}
</style>
