<template>
  <div class="autocomplete-container">
    <div
      class="autocomplete"
      :class="{
        'autocomplete-focused': isComponentFocused && !isError && isBorder,
        'autocomplete-error': !isComponentFocused && isError && isBorder,
        'autocomplete-open-up': isOpen && orientation === 'up' && !isError && isBorder,
        'autocomplete-open-down': isOpen && orientation === 'down' && !isError && isBorder,
        'autocomplete-open-up-error': isOpen && orientation === 'up' && isError && isBorder,
        'autocomplete-open-down-error': isOpen && orientation === 'down' && isError && isBorder,
        'autocomplete-focused-no-border': isComponentFocused && !isError && !isBorder,
        'autocomplete-error-no-border': !isComponentFocused && isError && !isBorder,
        'autocomplete-open-up-no-border': isOpen && orientation === 'up' && !isError && !isBorder,
        'autocomplete-open-down-no-border':
          isOpen && orientation === 'down' && !isError && !isBorder,
        'autocomplete-open-up-error-no-border':
          isOpen && orientation === 'up' && isError && !isBorder,
        'autocomplete-open-down-error-no-border':
          isOpen && orientation === 'down' && isError && !isBorder,
        'autocomplete-closed-no-border': !isOpen && !isError && !isBorder,
        'autocomplete-closed-error-no-border': !isOpen && isError && !isBorder,
        'autocomplete-with-border': isWithBorder,
      }"
    >
      <div class="autocomplete-top" @click="clickInput()">
        <div class="left" :random_attr="$slots.icon">
          <div class="icon-container" v-if="$slots.icon">
            <slot name="icon" />
          </div>
          <div class="image-selected-container" v-else-if="isSomeImage">
            <img
              v-if="selectedImagePath !== ''"
              :src="selectedImagePath"
              :style="{
                'border-radius': isRoundedIcons ? '50%' : '0',
              }"
            />
          </div>
          <input
            type="text"
            @focus="
              isComponentFocused = true;
              isOpen = true;
            "
            @input="inputChange($event as Event)"
            v-model="search"
            @keydown.down="onArrowDown"
            @keydown.up="onArrowUp"
            @keyup.enter="onEnter"
            @keyup.esc="lostFocus()"
            @blur="lostFocus()"
            :disabled="disable"
            :placeholder="
              isOpen && placeholderShowingOptions ? placeholderShowingOptions : placeholderValue
            "
            :style="{
              color: inputColorText !== 'primary' ? inputColorText : '',
              'padding-left':
                $slots.icon || (isSomeImage && selectedImagePath !== '') ? '3.5rem' : '1rem',
            }"
            autocomplete="off"
            ref="autocompleteInput"
            :class="{
              'custom-placeholder-color': true,
              'color-primary': inputColorText === 'primary' ? true : false,
            }"
          />
        </div>
        <div class="right" v-if="iconExpandCollapse">
          <img :src="iconDropdown" :class="isOpen ? 'dropdown-img-up' : 'dropdown-img'" />
        </div>
        <div class="right" v-if="isItemToRemove">
          <img
            class="icon-remove"
            src="/app-images/close.svg"
            v-if="modelValue !== 0"
            @click.stop="$emit('removeItem')"
          />
        </div>
      </div>
    </div>
    <div
      v-show="isOpen"
      class="autocomplete-results"
      :class="{
        'autocomplete-results-open-up': isOpen && orientation === 'up' && !isError,
        'autocomplete-results-open-down': isOpen && orientation === 'down' && !isError,
        'autocomplete-results-open-up-error': isOpen && orientation === 'up' && isError,
        'autocomplete-results-open-down-error': isOpen && orientation === 'down' && isError,
        'autocomplete-with-border': isWithBorder,
      }"
      :style="{
        maxHeight: maxHeight + 'px',
        fontSize: resultsFontSize + 'px',
      }"
    >
      <div v-if="results.length === 0" class="no-results">
        {{
          search.length >= minChars
            ? 'No hay coincidencias'
            : `Introduzca al menos ${minChars} caracter${minChars > 1 ? 'es' : ''}`
        }}
      </div>
      <div class="results" v-else>
        <div
          :ref="
            (el) => {
              if (el) itemRefs[index] = el as HTMLElement;
            }
          "
          v-for="(result, index) in results"
          :key="index"
          @mousedown="setResult(result)"
          class="autocomplete-result"
          :class="{
            'is-active': index === arrowCounter,
            'text-color-primary': inputColorText === 'primary' ? true : false,
          }"
          :style="{
            color: index !== arrowCounter && inputColorText !== 'primary' ? inputColorText : '',
          }"
          @mouseenter="arrowCounter = index"
        >
          <div class="left">
            <img
              v-if="result.image"
              :src="result.image"
              :style="{
                'border-radius': isRoundedIcons ? '50%' : '0',
              }"
            />
          </div>
          <div class="right">
            {{ result.name }}
          </div>
        </div>
      </div>
      <div v-if="showAddNewOption" class="create" @mousedown="addNew">Añadir nuevo</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch, type Ref, computed, nextTick } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
    },
    placeholderValue: {
      type: String,
      required: false,
      default: '',
    },
    placeholderShowingOptions: {
      type: String,
      required: false,
      default: '',
    },
    placeholderColor: {
      type: String,
      required: false,
      default: '#878787',
    },
    iconExpandCollapse: {
      type: Boolean,
      required: false,
      default: false,
    },
    showAddNewOption: {
      type: Boolean,
      required: false,
      default: true,
    },
    minChars: {
      type: Number,
      default: 5,
      required: false,
    },
    items: {
      type: Array as () => Array<{ value: number; name: string; image?: string }>,
      required: true,
    },
    orientation: {
      type: String,
      enum: ['up', 'down'],
      required: false,
      default: 'down',
    },
    disable: {
      type: Boolean,
      required: false,
      default: false,
    },
    emptyResultsAfterClick: {
      type: Boolean,
      required: false,
      default: true,
    },
    keepResultAfterChoose: {
      type: Boolean,
      required: false,
      default: false,
    },
    maxHeight: {
      type: Number,
      required: false,
      default: 600,
    },
    top: {
      type: Number,
      required: false,
      default: 37,
    },
    spaceBetweenIconAndInput: {
      type: Number,
      required: false,
      default: 16,
    },

    resultsFontSize: {
      type: Number,
      required: false,
      default: 15,
    },
    inputColorText: {
      type: String,
      required: false,
      default: '#000000',
    },
    isBorder: {
      type: Boolean,
      required: false,
      default: true,
    },
    isChangeFocusOnEnter: {
      type: Boolean,
      required: false,
      default: false,
    },
    iconDropdown: {
      type: String,
      required: false,
      default: '/app-images/dropdown.svg',
    },
    isError: {
      type: Boolean,
      required: false,
      default: false,
    },
    isRoundedIcons: {
      type: Boolean,
      required: false,
      default: false,
    },
    isItemToRemove: {
      type: Boolean,
      required: false,
      default: false,
    },
    isWithBorder: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    const isOpen = ref(false);
    const results = ref([] as { value: number; name: string; image?: string }[]);
    const search = ref('');
    const arrowCounter = ref(0);
    const itemRefs = ref([] as HTMLElement[]);
    const autocompleteInput: Ref<HTMLInputElement | null> = ref(null);
    const isComponentFocused = ref(false);
    const selectedImagePath = ref('');

    const isSomeImage = computed(() => props.items.some((item) => item.image));

    const filterResults = () => {
      results.value = props.items.filter(
        (item) =>
          item.name
            .normalize('NFKD')
            .replace(/[^\w]/g, '')
            .toLowerCase()
            .indexOf(search.value.normalize('NFKD').replace(/[^\w]/g, '').toLowerCase()) > -1
      );
    };

    const inputChange = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Enter') {
        return;
      }
      selectedImagePath.value = '';
      context.emit('update:modelValue', 0);
      arrowCounter.value = 0;
      context.emit('input', search.value);
      if (search.value.length <= props.minChars - 1) {
        results.value = [];
      } else {
        filterResults();
      }
      isOpen.value = true;
      context.emit('textSearchChanges', search.value);
    };

    const setResult = (result: { value: number; name: string; image?: string }) => {
      search.value = result.name;
      selectedImagePath.value = result.image ?? '';
      isOpen.value = false;
      context.emit('update:modelValue', result.value);
      if (props.isChangeFocusOnEnter) {
        context.emit('focusOut');
      }
      if (!props.keepResultAfterChoose) {
        search.value = '';
      }
      if (!props.emptyResultsAfterClick) {
        results.value = props.items;
      } else {
        results.value = [];
      }
    };

    const lostFocus = () => {
      isOpen.value = false;
      isComponentFocused.value = false;
      results.value = props.items;
      if (selectedImagePath.value === '' && isSomeImage.value) {
        search.value = '';
        context.emit('update:modelValue', 0);
      }
    };

    const onArrowDown = () => {
      if (arrowCounter.value >= results.value.length - 1) {
        arrowCounter.value = 0;
      } else {
        arrowCounter.value += 1;
      }
      itemRefs.value[arrowCounter.value].scrollIntoView({
        block: 'nearest',
      });
    };

    const onArrowUp = () => {
      if (arrowCounter.value <= 0) {
        arrowCounter.value = results.value.length - 1;
      } else {
        arrowCounter.value -= 1;
      }
      itemRefs.value[arrowCounter.value].scrollIntoView({
        block: 'nearest',
      });
    };

    const onEnter = () => {
      if (!isOpen.value) {
        isOpen.value = true;
        return;
      }
      if (results.value.length > 0) {
        search.value = results.value[arrowCounter.value].name;
        isOpen.value = false;
        setResult(results.value[arrowCounter.value]);
        arrowCounter.value = 0;
      }
      isOpen.value = false;
      if (!props.keepResultAfterChoose) {
        search.value = '';
      }
    };

    const addNew = () => {
      search.value = '';
      context.emit('addNew');
    };

    const toggleOptions = () => {
      isOpen.value = !isOpen.value;
      isComponentFocused.value = true;
    };

    const clickInput = () => {
      isOpen.value = true;
      isComponentFocused.value = true;
    };
    const focus = () => {
      autocompleteInput.value?.focus();
    };

    watch(
      () => props.items,
      (newValue, oldValue) => {
        if (newValue.length !== oldValue.length) {
          results.value = newValue;
        }
        if (props.modelValue) {
          const result = newValue.find((item) => item.value === props.modelValue);
          if (result) {
            search.value = result.name;
          } else {
            search.value = '';
          }
        }
      }
    );

    watch(
      () => props.modelValue,
      () => {
        if (props.modelValue !== 0) {
          const result = props.items.find((item) => item.value === props.modelValue);
          if (result) {
            search.value = result.name;
            selectedImagePath.value = result.image ?? '';
          }
        } else {
          search.value = '';
          selectedImagePath.value = '';
          results.value = props.items;
        }
        if (!props.keepResultAfterChoose) {
          search.value = '';
        }
      }
    );

    watch(isOpen, () => {
      if (isOpen.value) {
        arrowCounter.value = 0;
        const indexSelectedCountry = results.value.findIndex(
          (item) => item.value === props.modelValue
        );
        if (indexSelectedCountry !== -1) {
          arrowCounter.value = indexSelectedCountry;
        } else {
          arrowCounter.value = 0;
        }
      }
      void nextTick(() => {
        if (itemRefs.value[arrowCounter.value]) {
          itemRefs.value[arrowCounter.value].scrollIntoView({
            block: 'nearest',
          });
        }
      });

      context.emit('isOpen', isOpen.value);
    });

    onMounted(() => {
      if (props.items.length > 0) {
        results.value = props.items;
        const selectedOption = results.value.find((item) => item.value === props.modelValue);
        search.value = selectedOption?.name ?? '';
        selectedImagePath.value = selectedOption?.image ?? '';
      }
      if (autocompleteInput.value) {
        autocompleteInput.value.style.setProperty('--placeholder-color', props.placeholderColor);
      }
    });

    return {
      isOpen,
      results,
      search,
      arrowCounter,
      addNew,
      focus,
      inputChange,
      setResult,
      onArrowDown,
      onArrowUp,
      onEnter,
      toggleOptions,
      itemRefs,
      lostFocus,
      isComponentFocused,
      clickInput,
      autocompleteInput,
      isSomeImage,
      selectedImagePath,
    };
  },
});
</script>

<style lang="scss" scoped>
.autocomplete-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 10px;

  .autocomplete {
    border: 1px solid lightgray;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 10px;
    transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;

    &.autocomplete-focused {
      border: 1px solid $primary;
    }
    &.autocomplete-error {
      border: 1px solid red;
    }
    &.autocomplete-open-up {
      border-radius: 0 0 10px 10px;
      border-top: 1px solid white;
    }
    &.autocomplete-open-down {
      border-radius: 10px 10px 0 0;
      border-bottom: 1px solid white;
    }
    &.autocomplete-open-up-error {
      border-color: red;
      border-radius: 0 0 10px 10px;
      border-top: 1px solid white;
    }
    &.autocomplete-open-down-error {
      border-color: red;
      border-radius: 10px 10px 0 0;
      border-bottom: 1px solid white;
    }
    &.autocomplete-focused-no-border {
      border: 1px solid white;
      border-radius: 0;
      border-bottom: 1px solid $primary;
    }
    &.autocomplete-error-no-border {
      border: 1px solid white;
      border-radius: 0;
      border-bottom: 1px solid red;
    }
    &.autocomplete-open-up-no-border {
      border-radius: 0 0 10px 10px;
      border: 1px solid $primary;
      border-top: 1px solid white;
    }
    &.autocomplete-open-down-no-border {
      border-radius: 10px 10px 0 0;
      border: 1px solid $primary;
      border-bottom: 1px solid white;
    }
    &.autocomplete-open-up-error-no-border {
      border-radius: 0 0 10px 10px;
      border: 1px solid red;
      border-top: 1px solid white;
    }
    &.autocomplete-open-down-error-no-border {
      border-radius: 10px 10px 0 0;
      border: 1px solid red;
      border-bottom: 1px solid white;
    }
    &.autocomplete-closed-no-border {
      border: 1px solid white;
      border-bottom: 1px solid lightgray;
      border-radius: 0;
    }
    &.autocomplete-closed-error-no-border {
      border: 1px solid white;
      border-bottom: 1px solid red;
      border-radius: 0;
    }
    &.autocomplete-with-border {
      border: none;
    }

    .autocomplete-top {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      .left {
        position: relative;
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        height: 100%;
        .icon-container {
          pointer-events: none;
          user-select: none;
          position: absolute;
          left: 1rem;
          height: 18px;
          width: 18px;
        }
        .image-selected-container {
          pointer-events: none;
          user-select: none;
          position: absolute;
          left: 1rem;
          display: flex;
          align-items: center;
          height: 25px;
          width: 28px;
          img {
            border: 1px solid lightgray;
            max-width: 100%;
          }
        }
        input {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 1.5rem;
        }
        .custom-placeholder-color::placeholder {
          color: var(--placeholder-color);
        }
        .color-primary {
          color: $primary;
        }
      }
      .right {
        position: absolute;
        right: 0;
        pointer-events: none;
        user-select: none;
        .dropdown-img {
          margin-left: 0.5rem;
          transition: transform 0.3s ease;
          width: 11px;
          height: 11px;
          margin-right: 0.4rem;
        }
        .dropdown-img-up {
          margin-left: 0.5rem;
          transform: rotate(-180deg);
          transition: transform 0.3s ease;
          width: 11px;
          height: 11px;
          margin-right: 0.4rem;
        }
        .icon-remove {
          margin-right: 0.4rem;
          cursor: pointer;
          z-index: 100;
          pointer-events: all;
        }
      }
    }

    .without-icon-expanded {
      width: 100%;
    }
    input {
      background: transparent;
      border: none;
      width: 100%;
      height: 100%;
      outline: none !important;
    }
  }
  .autocomplete-results {
    position: absolute;
    z-index: 400;
    background-color: white;
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid $primary;
    background-color: white;
    max-height: 600px;
    overflow-y: scroll;
    box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

    &.autocomplete-results-open-up {
      bottom: 100%;
      border-radius: 10px 10px 0 0;
      border-bottom: 1px solid white;
    }
    &.autocomplete-results-open-down {
      top: calc(100% - 1px);
      border-radius: 0 0 10px 10px;
      border-top: 1px solid white;
    }
    &.autocomplete-results-open-up-error {
      bottom: 100%;
      border-radius: 10px 10px 0 0;
      border-color: red;
      border-bottom: 1px solid white;
    }
    &.autocomplete-results-open-down-error {
      top: calc(100% - 1px);
      border-radius: 0 0 10px 10px;
      border-color: red;
      border-top: 1px solid white;
    }
    &.autocomplete-with-border {
      border: none;
    }
    .text-color-primary {
      color: $primary;
    }
    .no-results {
      padding-left: 1rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      width: 100%;
      height: 100%;
    }
    .results {
      padding: 0;
      .autocomplete-result {
        display: flex;
        align-items: center;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        width: 100%;
        text-align: left;
        cursor: pointer;
        &.is-active {
          background-color: $primary;
          color: white;
        }
        .left {
          display: flex;
          align-items: center;
          img {
            min-height: 25px;
            min-width: 28px;
            border: 1px solid lightgray;
            margin-right: 10px;
          }
        }
      }
    }
    .create {
      padding-left: 1rem;
      padding-top: 0.4rem;
      padding-right: 1rem;
      padding-bottom: 0.4rem;
      cursor: pointer;
      color: $primary;
      font-weight: bold;
    }
  }
}
</style>
