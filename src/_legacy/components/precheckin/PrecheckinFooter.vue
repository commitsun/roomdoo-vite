<template>
  <div class="footer-container">
    <div class="text">{{$t('with_technology')}}</div>
    <img src="/logos/logo-text.svg" />
  </div>
</template>
<style lang="scss" scoped>
.footer-container {
  position: absolute;
  bottom: 0;
  display: none;
  justify-content: center;
  align-items: center;
  height: 30px;
  font-size: 12px;
  font-weight: 500;
  background-color: white;
  width: 100%;
  img {
    margin-left: 10px;
    height: 20px;
    top: -3px;
    position: relative;
  }
}
@media (min-width: 1024px) {
  .footer-container {
    display: flex;
  }
}
</style>
