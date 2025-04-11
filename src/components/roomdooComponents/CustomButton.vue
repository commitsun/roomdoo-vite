<template>
  <button
    :class="{
      'background-color-primary': backgroundColor === 'primary',
      'text-color-primary': textColor === 'primary',
      'border-color-primary': borderColor === 'primary',
      disabled: disabled,
    }"
    :style="computedStyle"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="icon" v-if="$slots.icon">
      <slot name="icon" />
    </div>
    <span class="text">
      {{ text }}
    </span>
  </button>
</template>

<script lang="ts" scoped>
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: false,
      default: '',
    },
    textColor: {
      type: String,
      required: false,
      default: 'white',
    },
    backgroundColor: {
      type: String,
      required: false,
      default: 'primary',
    },
    borderColor: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    backgroundColorHover: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup(props) {
    const isHovered = ref(false);
    const computedStyle = computed(() => ({
      color: props.textColor !== 'primary' ? props.textColor : '',
      backgroundColor:
        isHovered.value && !props.disabled
          ? props.backgroundColorHover || props.backgroundColor
          : props.backgroundColor !== 'primary'
            ? props.backgroundColor
            : '',
    }));
    return { isHovered, computedStyle };
  },
});
</script>
<style lang="scss" scoped>
button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  height: 40px;
  border-radius: 8px;
  border-color: none;
  padding: 8px 16px;
  width: 100%;
  border: none;
  transition: all 0.3s ease;
  &.background-color-primary {
    background-color: $primary;
    color: white;
  }
  &.text-color-primary {
    color: $primary;
    background-color: white;
  }
  &.border-color-primary {
    border: 2px solid $primary;
  }
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .icon {
    margin-right: 8px;
  }
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
