<template>
  <div
    class="custom-icon"
    :style="{
      'background-color': color === 'primary' ? '' : color,
      'mask-image': 'url(' + imagePath + ')',
      width: width,
      height: height,
      '--hover-color': colorHover && colorHover !== 'primary' ? colorHover : '',
    }"
    :class="{
      'background-color-primary': color === 'primary',
      'hover-primary': colorHover === 'primary',
      'has-hover': colorHover && colorHover !== 'primary',
    }"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    imagePath: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    colorHover: {
      type: String,
      required: false,
    },
    width: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.custom-icon {
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  transition: background-color 0.3s ease;

  &.background-color-primary {
    background-color: $primary !important;
  }

  &.hover-primary:hover {
    background-color: $primary !important;
  }

  &.has-hover:hover {
    background-color: var(--hover-color) !important;
  }
}
</style>
