<template>
  <div class="input-date-container">
    <span v-if="label" class="input-date-label">
      {{ label }}
    </span>
    <div class="inputs">
      <div class="calendar-container" v-if="includeCalendar">
        <Transition name="calendar-transition">
          <div class="overlay" v-show="showCalendar" />
        </Transition>
        <div class="icon-wrapper" @click="showCalendar = true">
          <img :src="iconPath" />
        </div>
        <CalendarDateRange
          v-show="showCalendar"
          v-model="dateRange"
          :enabledRanges="enabledRanges"
          :disablePastDates="disablePastDates"
          :disableFutureDates="disableFutureDates"
          @closeCalendar="showCalendar = false"
        />
      </div>
      <input
        type="text"
        class="first-input"
        v-model="displayFirstDate"
        autocomplete="off"
        :placeholder="placeholder ? placeholder : ''"
        @input="inputDateHandler($event as InputEvent, 'first')"
      />
      <div class="separator">
        <CustomIcon
          imagePath="/app-images/arrow_forward_ios.svg"
          width="8px"
          height="8px"
          color="#D2ECF2"
        />
      </div>
      <input
        type="text"
        v-model="displayLastDate"
        class="last-input"
        autocomplete="off"
        :placeholder="placeholder ? placeholder : ''"
        @input="inputDateHandler($event as InputEvent, 'last')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, type Ref } from 'vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import CalendarDateRange from '@/_legacy/components/roomdooComponents/CalendarDateRange.vue';
export default defineComponent({
  components: {
    CustomIcon,
    CalendarDateRange,
  },
  props: {
    modelValue: {
      type: Array as () => Date[],
      required: false,
      default: () => [],
    },
    placeholder: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    includeCalendar: {
      type: Boolean,
      default: false,
    },
    enabledRanges: {
      type: Array as () => Array<{ start: Date; end: Date }>,
      default: () => [],
      required: false,
    },
    disablePastDates: {
      type: Boolean,
      default: false,
      required: false,
    },
    disableFutureDates: {
      type: Boolean,
      default: false,
      required: false,
    },
    iconPath: {
      type: String,
      default: '/app-images/calendar-grey.svg',
    },
  },
  setup(props, context) {
    const dateRange = ref<Date[]>([]);
    const displayFirstDate = ref('');
    const emitFirstDate: Ref<Date | null> = ref(null);

    const displayLastDate = ref('');
    const emitLastDate: Ref<Date | null> = ref(null);
    const showCalendar = ref(false);

    const formatDisplayDate = (dateInput: string): string => {
      const [year, month, day] = dateInput.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    };

    const emitValue = (value: Date[]) => {
      context.emit('update:modelValue', value);
    };

    const inputDateHandler = (event: InputEvent, inputSequence: string) => {
      const { value } = event.target as HTMLInputElement;
      let dateInput = value.replace(/[^0-9/]/g, '');
      if (value.length > 10) {
        dateInput = value.slice(0, 10);
      }
      if (event.inputType === 'insertText' && event.data === '/') {
        if (dateInput.length !== 3 && dateInput.length !== 6) {
          dateInput = dateInput.slice(0, -1);
        }
      }
      if (event.inputType === 'insertText') {
        if (dateInput.length === 2 && !dateInput.includes('/')) {
          dateInput += '/';
        }
        if (dateInput.length === 5 && !dateInput.includes('/', 3)) {
          dateInput += '/';
        }
      } else if (event.inputType === 'deleteContentBackward') {
        if (dateInput.length === 2 || dateInput.length === 5) {
          dateInput = dateInput.slice(0, -1);
          if (inputSequence === 'first') {
            displayFirstDate.value = '';
            emitFirstDate.value = null;
          } else if (inputSequence === 'last') {
            displayLastDate.value = '';
            emitLastDate.value = null;
          }
        }
      }
      if (inputSequence === 'first') {
        displayFirstDate.value = dateInput;
        if (dateInput.length === 10) {
          const [day, month, year] = dateInput.split('/');
          if (
            emitLastDate.value &&
            new Date(`${year}-${month}-${day}`).getTime() > new Date(emitLastDate.value).getTime()
          ) {
            emitLastDate.value = new Date(`${year}-${month}-${day}`);
            displayLastDate.value = dateInput;
          }
          emitFirstDate.value = new Date(`${year}-${month}-${day}`);
          dateRange.value = [emitFirstDate.value, emitLastDate.value || new Date()];
          emitValue(dateRange.value);
          const lastInput = document.querySelector('.last-input') as HTMLInputElement;
          lastInput.focus();
        } else {
          emitFirstDate.value = null;
          emitValue([] as Date[]);
        }
      } else if (inputSequence === 'last') {
        displayLastDate.value = dateInput;
        if (dateInput.length === 10) {
          const [day, month, year] = dateInput.split('/');
          emitLastDate.value = new Date(`${year}-${month}-${day}`);
          if (
            emitFirstDate.value &&
            new Date(emitFirstDate.value).getTime() > new Date(emitLastDate.value).getTime()
          ) {
            emitFirstDate.value = emitLastDate.value;
            displayFirstDate.value = dateInput;
          }
          dateRange.value = [emitFirstDate.value || new Date(), emitLastDate.value];
          emitValue(dateRange.value);
        } else {
          emitLastDate.value = null;
          emitValue([] as Date[]);
        }
      }
    };

    watch(dateRange, () => {
      if (dateRange.value.length > 0) {
        const [firstDate, lastDate] = dateRange.value;
        if (firstDate) {
          displayFirstDate.value = formatDisplayDate(
            `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`
          );
          emitFirstDate.value = firstDate;
        }
        if (lastDate) {
          displayLastDate.value = formatDisplayDate(
            `${lastDate.getFullYear()}-${(lastDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`
          );
          emitLastDate.value = lastDate;
        }
      }
      if (dateRange.value.length === 2) {
        emitValue(dateRange.value);
      }
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue.length === 1 && newValue[0]) {
          const firstDate = newValue[0];
          displayFirstDate.value = formatDisplayDate(
            `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`
          );
          emitFirstDate.value = new Date(firstDate);
        } else if (newValue.length === 2 && newValue[0] && newValue[1]) {
          const [firstDate, lastDate] = newValue;
          displayFirstDate.value = formatDisplayDate(
            `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`
          );
          emitFirstDate.value = new Date(firstDate);
          displayLastDate.value = formatDisplayDate(
            `${lastDate.getFullYear()}-${(lastDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`
          );
          emitLastDate.value = new Date(lastDate);
        }
        dateRange.value = newValue;
        if (dateRange.value.length === 2) {
          emitValue(dateRange.value);
        }
      }
    );

    onMounted(() => {
      if (props.modelValue.length === 1) {
        const firstDate = props.modelValue[0];
        displayFirstDate.value = formatDisplayDate(
          `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`
        );
        emitFirstDate.value = new Date(firstDate);
      } else if (props.modelValue.length === 2) {
        const [firstDate, lastDate] = props.modelValue;
        displayFirstDate.value = formatDisplayDate(
          `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`
        );
        emitFirstDate.value = new Date(firstDate);
        displayLastDate.value = formatDisplayDate(
          `${lastDate.getFullYear()}-${(lastDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`
        );
        emitLastDate.value = new Date(lastDate);
      }
      dateRange.value = props.modelValue;
      if (dateRange.value.length === 2) {
        emitValue(dateRange.value);
      }
    });

    return {
      dateRange,
      displayFirstDate,
      emitFirstDate,
      displayLastDate,
      emitLastDate,
      showCalendar,
      inputDateHandler,
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
  border: 1px solid #d2ecf2;
  border-radius: 10px;

  .input-date-label {
    color: $primary;
  }

  .inputs {
    border-radius: 10px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: white;
    padding-left: 5px;
    padding-right: 5px;

    .input-date-label {
      font-size: 10px;
      color: rgba(0, 0, 0, 0.6);
      user-select: none;
      cursor: text;
      margin-top: 2px;
      height: 100%;
    }

    .first-input {
      border: none;
      width: 60px;
      height: 100%;
      padding: 0;
      font-size: 12px;
      color: rgba(38, 57, 65, 0.69);
      &:focus {
        outline: none;
      }
    }

    .last-input {
      border: none;
      width: 60px;
      height: 100%;
      padding: 0;
      font-size: 12px;
      color: rgba(38, 57, 65, 0.69);
      border-radius: 10px;
      &:focus {
        outline: none;
      }
    }

    input::placeholder {
      color: rgba(0, 0, 0, 0.6);
    }
    .separator {
      padding-right: 3px;
      transform: rotate(-90deg);
      background-color: white;
      display: flex;
      align-items: center;
    }
  }

  .calendar-container {
    height: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 2px;
  }
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 411;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    margin-right: 9px;
  }
}

@media (min-width: 1024px) {
  .input-date-container {
    .inputs {
      .first-input {
        width: 75px;
        font-size: 14px;
      }

      .last-input {
        width: 80px;
        font-size: 14px;
      }
    }
    .separator {
      margin: 0;
      padding: 0;
    }
    .calendar-container {
      padding-left: 0.5rem;
    }
  }
}
.calendar-transition-enter-active,
.calendar-transition-leave-active {
  transition: all 0.2s;
}

.calendar-transition-enter-to,
.calendar-transition-leave-from {
  -webkit-transform: scale(1);
  transform: scale(1);
  opacity: 1;
}

.calendar-transition-enter-from,
.calendar-transition-leave-to {
  opacity: 0;
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
