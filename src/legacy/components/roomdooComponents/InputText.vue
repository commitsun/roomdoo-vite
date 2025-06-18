<template>
  <div
    class="input-container"
    :class="{
      'input-container-error': isError && isBorder,
      'input-container-no-border': !isBorder && !isError,
      'input-container-no-border-error': !isBorder && isError,
      'input-container-no-border-no-bottom': !isBorder && !isBorderBottom,
      'input-container-whitout-border': isWhithoutBorder,
    }"
  >
    <span class="input-label" v-if="textLabel !== ''">
      {{ textLabel }}
    </span>
    <div class="input-row">
      <img :src="iconBefore" class="icon-before" v-if="iconBefore !== ''" />
      <textarea
        v-if="textArea"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        :class="{
          'input-without-label': textLabel === '',
          'placeholder-blue': placeholderBlue,
        }"
        :style="{
          color: textColor,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
          marginTop: '0.8rem',
          paddingLeft: '0.8rem',
          resize: 'none',
        }"
        :disabled="disabled"
        :tabIndex="tabIndex"
        ref="textarea"
        @blur="$emit('blur')"
        @keydown="$emit('keydown', $event)"
      ></textarea>
      <input
        v-else
        :value="modelValue"
        :type="isPassword ? 'password' : 'text'"
        :autocomplete="isPassword ? 'on' : 'off'"
        @input="onInput"
        :placeholder="placeholder"
        :class="{
          'input-without-label': textLabel === '',
          'placeholder-blue': placeholderBlue,
          'color-primary': textColor === 'primary' ? true : false,
        }"
        :style="{
          color: textColor !== 'primary' ? textColor : '',
          textTransform: isUpperCase ? 'uppercase' : 'none',
        }"
        :disabled="disabled"
        :tabIndex="tabIndex"
        ref="input"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
        @keydown="$emit('keydown', $event)"
      />
      <div class="icon-after-password-container" v-if="password" @click="isPassword = !isPassword">
        <img src="/app-images/visibility-off.svg" class="icon-after-password" v-if="isPassword" />
        <img
          src="/app-images/visibility-on.svg"
          class="icon-after-password-on"
          v-if="!isPassword"
        />
      </div>
      <div class="icon-after-text-container" v-else-if="allowRemove" @click="$emit('clear')">
        <CustomIcon
          v-if="modelValue"
          imagePath="/app-images/close.svg"
          color="primary"
          width="15px"
          height="15px"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, type PropType } from 'vue';
import CustomIcon from './CustomIcon.vue';

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
    },
    textLabel: {
      type: String,
      default: '',
    },
    password: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    iconBefore: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tabIndex: {
      type: String,
      default: '0',
    },
    isError: {
      type: Boolean,
      default: false,
    },
    isBorder: {
      type: Boolean,
      default: true,
    },
    isBorderBottom: {
      type: Boolean,
      default: true,
    },
    placeholderBlue: {
      type: Boolean,
      default: false,
    },
    textColor: {
      type: String,
      default: '',
    },
    isUpperCase: {
      type: Boolean,
      default: false,
    },
    allowRemove: {
      type: Boolean,
      default: false,
    },
    isWhithoutBorder: {
      type: Boolean,
      default: false,
    },
    textArea: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CustomIcon,
  },
  setup(props, { emit }) {
    const isPassword = ref(props.password);
    const input = ref<HTMLInputElement | null>(null);
    const focus = () => {
      input.value?.focus();
    };
    const textarea = ref<HTMLTextAreaElement | null>(null);

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      emit('update:modelValue', target.value);
    };

    return {
      isPassword,
      input,
      textarea,
      focus,
      onInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.input-container {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid lightgray;
  background-color: white;
  height: 100%;
  position: relative;
  transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;

  &:focus-within {
    border: 1px solid $primary;
    .input-label {
      color: $primary;
    }
  }
  .input-label {
    position: absolute;
    font-size: 11px;
    color: #929292;
    user-select: none;
    pointer-events: none;
    padding-left: 0.8rem;
    padding-top: 0.3rem;
  }
  input,
  textarea {
    border: none;
    outline: none;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    padding-left: 0.8rem;
    padding-top: 0.8rem;
    &::placeholder {
      text-transform: none;
    }
  }
  input.placeholder-blue::placeholder {
    color: #cae8f5;
  }
  .color-primary {
    color: $primary;
  }
  .input-row {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    .input-without-label {
      padding: 0 0 0 0.8rem;
      height: 100%;
    }

    .icon-before {
      height: 1.5rem;
      width: 1.5rem;
      user-select: none;
      margin-left: 1rem;
    }
    .icon-after-password-container {
      cursor: pointer;
      height: 100%;
      padding: 0 20px 0 20px;
      display: flex;
      align-items: center;
      user-select: none;
      position: absolute;
      right: 0;

      .icon-after-password {
        height: 20px;
        width: 20px;
      }
      .icon-after-password-on {
        height: 21px;
        width: 21px;
      }
    }
    .icon-after-text-container {
      cursor: pointer;
      height: 100%;
      padding: 0 20px 0 20px;
      display: flex;
      align-items: center;
      user-select: none;
    }
  }
  &.input-container-error {
    border: 1px solid red;
  }
  &.input-container-no-border {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid lightgray;
    transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
    &:focus-within {
      border-bottom: 1px solid $primary;
      .input-label {
        color: $primary;
      }
    }
  }

  &.input-container-no-border-error {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid red;
    &:focus-within {
      border-bottom: 1px solid red;
      .input-label {
        color: red;
      }
    }
  }
  &.input-container-no-border-no-bottom {
    border-bottom: none !important;
  }
}
</style>
