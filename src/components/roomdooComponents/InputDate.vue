<template>
  <div
    class="input-date-container"
    :class="{
      error: isError,
    }"
  >
    <span v-if="label" class="input-date-label">
      {{ label }}
    </span>
    <input
      ref="input"
      type="text"
      v-model="displayDate"
      @keypress.enter="onEnter()"
      @blur="lostFocus()"
      @input="onInputDisplayDate()"
      autocomplete="off"
      :placeholder="placeholder"
      :style="{
        color: textColor !== 'primary' ? textColor : '',
      }"
      :class="{
        'placeholder-blue': placeholderBlue,
        'color-primary': textColor === 'primary' ? true : false,
      }"
      v-maska
      data-maska="##/##/####"
      data-maska-eager
    />
    <div class="calendar-container">
      <Calendar
        v-if="includeCalendar"
        :openYearViewFirst="openYearViewFirst"
        :firstYearInRange="firstYearInRange"
        :modelValue="modelValue"
        @dateChanged="dateChangedCalendar($event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { vMaska } from 'maska';

import { defineComponent, ref, watch, onMounted, type PropType } from 'vue';

import Calendar from './CalendarComponent.vue';

export default defineComponent({
  directives: { maska: vMaska },
  components: {
    Calendar,
  },
  props: {
    modelValue: {
      type: [Date, null] as PropType<Date | null>,
      default: null,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'DD/MM/AAAA',
    },
    label: {
      type: String,
      required: false,
    },
    includeCalendar: {
      type: Boolean,
      default: false,
    },
    openYearViewFirst: {
      type: Boolean,
      default: false,
    },
    firstYearInRange: {
      type: Number,
      required: false,
    },
    textColor: {
      type: String,
      required: false,
      default: '',
    },
    placeholderBlue: {
      type: Boolean,
      required: false,
      default: false,
    },
    isError: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['update:modelValue', 'enter', 'badFormatting'],
  setup(props, context) {
    const displayDate = ref('');
    const badFormatting = ref(false);
    const input = ref<HTMLInputElement | null>(null);
    // TODO: review this method
    const onEnter = () => {
      context.emit('enter');
    };

    const convertDateToString = (date: Date) =>
      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear().toString().padStart(4, '0')}`;

    const convertStringToDate = (dateString: string) =>
      new Date(
        parseInt(dateString.split('/')[2], 10),
        parseInt(dateString.split('/')[1], 10) - 1,
        parseInt(dateString.split('/')[0], 10)
      );

    const dateChangedCalendar = (date: Date) => {
      displayDate.value = convertDateToString(date);
    };

    const lostFocus = () => {
      const incompleteDate = displayDate.value.length !== 10;
      const hasBadFormatting = displayDate.value.length === 10 && badFormatting.value;
      if (incompleteDate || hasBadFormatting) {
        context.emit('update:modelValue', props.modelValue);
        displayDate.value = props.modelValue ? convertDateToString(props.modelValue) : '';
      }
    };

    const onInputDisplayDate = () => {
      const inputValue = displayDate.value.trim();
      const dateParts = inputValue.split('/');

      if (inputValue.length === 10) {
        const [day, month, year] = dateParts.map((part) => parseInt(part, 10));
        const isValidDate =
          year > 0 &&
          year <= 9999 &&
          month >= 1 &&
          month <= 12 &&
          day >= 1 &&
          day <= new Date(year, month, 0).getDate();

        if (isValidDate) {
          const parsedDate = new Date(year, month - 1, day);
          context.emit('badFormatting', false);
          context.emit('update:modelValue', parsedDate);
        } else {
          context.emit('badFormatting', true);
          badFormatting.value = true;
        }
      } else if (inputValue.length === 0) {
        context.emit('badFormatting', false);
        badFormatting.value = false;
        context.emit('update:modelValue', null);
      } else if (inputValue.length === 2) {
        if (parseInt(dateParts[0], 10) > 31) {
          context.emit('badFormatting', true);
          badFormatting.value = true;
        } else {
          context.emit('badFormatting', false);
          badFormatting.value = false;
        }
      } else if (inputValue.length === 5) {
        const today = new Date();
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        if (
          (month === 2 && day > 29) ||
          month < 1 ||
          month > 12 ||
          day > new Date(today.getFullYear(), month - 1, day).getDate()
        ) {
          context.emit('badFormatting', true);
          badFormatting.value = true;
        } else {
          context.emit('badFormatting', false);
          badFormatting.value = false;
        }
      }
    };
    const focus = () => {
      input.value?.focus();
    };

    watch(
      () => props.modelValue,
      () => {
        if (props.modelValue) {
          displayDate.value = convertDateToString(props.modelValue);
        } else {
          displayDate.value = '';
        }
      }
    );

    onMounted(() => {
      if (props.modelValue) {
        displayDate.value = convertDateToString(props.modelValue);
      }
    });

    return {
      displayDate,
      input,
      focus,
      onEnter,
      convertDateToString,
      convertStringToDate,
      lostFocus,
      dateChangedCalendar,
      onInputDisplayDate,
    };
  },
});
</script>

<style scoped lang="scss">
.input-date-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid lightgray;
  border-radius: 8px;
  transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;

  &:focus-within {
    border-color: $primary;
    .input-date-label {
      color: $primary;
    }
  }
  &.error {
    border-color: red;
  }

  .input-date-label {
    font-size: 10px;
    color: rgba(0, 0, 0, 0.6);
    user-select: none;
    cursor: text;
    margin-top: 2px;
  }

  .color-primary {
    color: $primary;
  }

  input {
    padding-left: 0.8rem;
    border: none;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    &:focus {
      outline: none;
    }
  }
  input.placeholder-blue::placeholder {
    color: #cae8f5;
  }
  .calendar-container {
    position: absolute;
    bottom: 8px;
    right: 0;
  }
}
</style>
