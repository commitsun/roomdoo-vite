<template>
  <div
    class="select-container"
    :tabindex="focusable ? 0 : undefined"
    @blur="blurContainer"
    @focus.stop="focusContainer()"
    @keydown="keyDown"
    @keyup.esc="blurContainer"
    ref="selectContainer"
  >
    <div
      class="option-selected"
      @mousedown="disabled ? false : clickContainer()"
      :style="{
        backgroundColor,
      }"
      :class="{
        'option-selected-closed-error': !isOptionsDisplayed && isError,
        'option-selected-closed': !isOptionsDisplayed && !isError,
        'option-selected-open-up-error': isOptionsDisplayed && showFromBottom && isError,
        'option-selected-open-down-error': isOptionsDisplayed && !showFromBottom && isError,
        'option-selected-open-up': isOptionsDisplayed && showFromBottom && !isError,
        'option-selected-open-down': isOptionsDisplayed && !showFromBottom && !isError,
        'option-selected-disabled': disabled,
        'option-selected-without-border': !isBorder,
      }"
    >
      <div class="options-selected-left">
        <CustomIcon
          :imagePath="iconBefore"
          :color="!disabled ? 'primary' : 'grey'"
          :width="'25px'"
          :height="'25px'"
          v-if="iconBefore !== ''"
        />
        <div class="text-container" :style="{ marginLeft: iconBefore !== '' ? '8px' : '0' }">
          <span v-if="(modelValue === '' || modelValue === 0) && placeholder" class="placeholder">
            {{ placeholder }}
          </span>
          <span>
            {{ textBeforeOptionSelected }}
          </span>
          <span
            style="margin-right: 3px"
            class="text-regular"
            :class="modelValue !== 0 && textBold ? 'text-bold' : ''"
          >
            {{ options.find((option) => option.id === modelValue)?.text }}
          </span>
          <span :class="modelValue !== 0 && text2Bold ? 'text-bold' : ''">
            {{ options.find((option) => option.id === modelValue)?.text2 }}
          </span>
        </div>
      </div>
      <CustomIcon
        :imagePath="iconDropdown"
        :color="!disabled ? (rightArrowColor === '' ? 'primary' : rightArrowColor) : 'grey'"
        :width="'12px'"
        :height="'12px'"
        :class="isOptionsDisplayed ? 'dropdown-img-up' : 'dropdown-img'"
      />
    </div>
    <transition name="optionsTransition">
      <div
        class="options"
        v-if="isOptionsDisplayed"
        :class="{
          'show-from-bottom-error': showFromBottom && isError,
          'show-from-top-error': !showFromBottom && isError,
          'show-from-bottom': showFromBottom && !isError,
          'show-from-top': !showFromBottom && !isError,
          'show-from-bottom-without-border': showFromBottom && !isBorder,
          'show-from-top-without-border': !showFromBottom && !isBorder,
        }"
        :style="{
          maxHeight: maxHeight + 'px',
        }"
      >
        <div
          v-for="(option, index) in options.filter((option) => option.id !== 0)"
          :key="option.id"
          class="options-item"
          @click="onClick(option.id)"
          :ref="(el) => (itemRefs[index] = el as HTMLElement)"
          :class="{ active: index === arrowCounter && focusable }"
        >
          <span style="margin-right: 3px">
            {{ option.text }}
          </span>
          <span>
            {{ option.text2 }}
          </span>
        </div>
        <div
          class="clear-option-item"
          @click="clearOptionSelected()"
          v-if="modelValue !== 0 && allowRemove"
        >
          Borrar selección
        </div>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, type Ref } from 'vue';
import CustomIcon from './CustomIcon.vue';

export default defineComponent({
  props: {
    iconBefore: {
      type: String,
      required: false,
      default: '',
    },
    modelValue: {
      type: [String, Number],
      required: true,
    },
    options: {
      type: Array as () => { id: number | string; text: string; text2?: string }[],
      required: true,
    },
    iconDropdown: {
      type: String,
      required: false,
      default: 'app-images/icon-dropdown-black.svg',
    },
    textBeforeOptionSelected: {
      type: String,
      required: false,
      default: '',
    },
    backgroundColor: {
      type: String,
      required: false,
      default: 'white',
    },
    optionsMarginTop: {
      type: Number,
      required: false,
      default: 8,
    },
    showFromBottom: {
      type: Boolean,
      required: false,
      default: false,
    },
    allowRemove: {
      type: Boolean,
      required: false,
      default: false,
    },
    textBold: {
      type: Boolean,
      required: false,
      default: false,
    },
    text2Bold: {
      type: Boolean,
      required: false,
      default: false,
    },
    focusable: {
      type: Boolean,
      required: false,
      default: false,
    },
    isError: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    rightArrowColor: {
      type: String,
      required: false,
      default: '',
    },
    maxHeight: {
      type: Number,
      required: false,
      default: 600,
    },
    isBorder: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  components: {
    CustomIcon,
  },
  setup(props, context) {
    const isOptionsDisplayed = ref(false);
    const arrowCounter = ref(0);
    const itemRefs = ref([] as HTMLElement[]);
    const selectContainer: Ref<HTMLDivElement | null> = ref(null);

    const onArrowDown = () => {
      isOptionsDisplayed.value = true;
      if (arrowCounter.value >= props.options.length - 1) {
        arrowCounter.value = 0;
      } else {
        arrowCounter.value += 1;
      }
      itemRefs.value[arrowCounter.value]?.scrollIntoView({
        block: 'nearest',
      });
    };
    const onArrowUp = () => {
      isOptionsDisplayed.value = true;
      if (arrowCounter.value <= 0) {
        arrowCounter.value = props.options.length - 1;
      } else {
        arrowCounter.value -= 1;
      }
      itemRefs.value[arrowCounter.value]?.scrollIntoView({
        block: 'nearest',
      });
    };

    const onEnter = () => {
      if (!isOptionsDisplayed.value) {
        isOptionsDisplayed.value = true;
        return;
      }
      const optionId = props.options[arrowCounter.value].id;
      context.emit('update:modelValue', optionId);
      selectContainer.value?.blur();
    };
    const onClick = (optionId: number | string) => {
      context.emit('update:modelValue', optionId);
      isOptionsDisplayed.value = false;
      selectContainer.value?.blur();
    };
    const blurContainer = () => {
      isOptionsDisplayed.value = false;
      if (selectContainer.value) {
        selectContainer.value.classList.remove('border-primary');
      }
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        onArrowDown();
      } else if (event.key === 'ArrowUp') {
        onArrowUp();
      } else if (event.key === 'Enter') {
        onEnter();
        blurContainer();
      } else {
        isOptionsDisplayed.value = true;
        const optionIndex = props.options.findIndex((opt) =>
          opt.text.toLowerCase().startsWith(event.key.toLowerCase())
        );
        if (optionIndex !== -1) {
          arrowCounter.value = optionIndex;
          itemRefs.value[arrowCounter.value]?.scrollIntoView({
            block: 'nearest',
          });
        }
      }
      event.preventDefault();
    };
    const clearOptionSelected = () => {
      if (typeof props.options[0].id === 'number') {
        context.emit('update:modelValue', 0);
      } else {
        context.emit('update:modelValue', '');
      }
      isOptionsDisplayed.value = false;
    };
    const clickContainer = () => {
      if (!props.disabled) {
        isOptionsDisplayed.value = !isOptionsDisplayed.value;
        if (isOptionsDisplayed.value) {
          arrowCounter.value = props.options.findIndex((option) => option.id === props.modelValue);
        }
      }
    };
    const focusContainer = () => {
      if (!props.disabled) {
        isOptionsDisplayed.value = true;
      }
      if (selectContainer.value) {
        selectContainer.value.classList.add('border-primary');
      }
    };

    return {
      selectContainer,
      isOptionsDisplayed,
      arrowCounter,
      itemRefs,
      clickContainer,
      focusContainer,
      blurContainer,
      onArrowDown,
      onArrowUp,
      onEnter,
      onClick,
      clearOptionSelected,
      keyDown,
    };
  },
});
</script>
<style lang="scss" scoped>
.select-container {
  user-select: none;
  height: 100%;
  width: 100%;

  position: relative;
  &:focus {
    outline: none;
  }
  .option-selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    outline: none;
    height: 100%;
    border-radius: 8px;
    transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
    position: relative;

    &.option-selected-closed {
      border: 1px solid lightgray;
    }
    &.option-selected-closed-error {
      border: 1px solid red;
    }

    &.option-selected-open-down {
      border: 1px solid $primary;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid white;
    }
    &.option-selected-open-up {
      border: 1px solid $primary;
      border-radius: 0 0 8px 8px;
      border-top: 1px solid white;
    }
    &.option-selected-open-down-error {
      border: 1px solid red;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid white;
    }
    &.option-selected-open-up-error {
      border: 1px solid red;
      border-radius: 0 0 8px 8px;
      border-top: 1px solid white;
    }
    &.option-selected-disabled {
      cursor: not-allowed;
      opacity: 0.6;
      border: 1px solid lightgray !important;
    }
    &.option-selected-without-border {
      border: none;
    }

    .options-selected-left {
      padding-left: 0.8rem;
      display: flex;
      align-items: center;
      overflow: hidden;
      width: 90%;
      height: 100%;
      .text-container {
        // margin-left: 8px;
        width: 100%;
        padding-top: 5px;
        padding-bottom: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .text-regular {
          margin-left: 3px;
        }
        .text-bold {
          font-weight: bold;
        }
        .placeholder {
          color: #878787;
        }
      }
    }
    .dropdown-img {
      margin-left: 0.5rem;
      transition: transform 0.3s ease;
      margin-right: 0.4rem;
    }
    .dropdown-img-up {
      margin-left: 0.5rem;
      transform: rotate(-180deg);
      transition: transform 0.3s ease;
      margin-right: 0.4rem;
    }
  }

  .options {
    position: relative;
    background-color: white;
    color: black;
    width: 100%;
    border-radius: 8px;
    height: auto;
    z-index: 100;
    overflow-y: auto;
    max-height: 60vh;
    border: 1px solid $primary;

    &.show-from-bottom {
      position: absolute;
      bottom: 100%;
      border-radius: 8px 8px 0 0;
      border: 1px solid $primary;
      border-bottom: 1px solid white;
      box-shadow: 0px -3px 4px rgba(0, 0, 0, 0.25);
    }
    &.show-from-top {
      position: absolute;
      border-radius: 0 0 8px 8px;
      border: 1px solid $primary;
      top: 100%;
      border-top: 1px solid white;
      box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);
    }

    &.show-from-bottom-error {
      position: absolute;
      bottom: 100%;
      border-radius: 8px 8px 0 0;
      border: 1px solid red;
      border-bottom: 1px solid white;
      box-shadow: 0px -3px 4px rgba(0, 0, 0, 0.25);
    }
    &.show-from-top-error {
      position: absolute;
      border-radius: 0 0 8px 8px;
      border: 1px solid red;
      top: 100%;
      border-top: 1px solid white;
      box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);
    }
    &.show-from-bottom-without-border {
      position: absolute;
      bottom: 100%;
      border-radius: 8px 8px 0 0;
      box-shadow: 0px -3px 4px rgba(0, 0, 0, 0.25);
      border: none;
    }
    &.show-from-top-without-border {
      position: absolute;
      border-radius: 0 0 8px 8px;
      border: none;
      top: 100%;
      box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);
    }
    .options-item {
      padding: 0.3rem 1rem;
      cursor: pointer;
      &:hover,
      &.active {
        font-weight: bold;
        background-color: $primary;
        color: white;
      }
    }
    .clear-option-item {
      padding: 0.5rem 1rem;
      cursor: pointer;
      color: $primary;
      border-top: 1px solid $primary;
      &:hover {
        font-weight: bold;
      }
    }
  }
}
</style>
