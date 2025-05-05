<template>
  <div class="datepicker">
    <Transition name="calendar-transition">
      <div class="overlay" v-show="showCalendar" />
    </Transition>
    <div class="icon-wrapper" @click="showCalendarHandler">
      <img :src="iconPath" />
    </div>
    <Transition name="calendar-transition">
      <div class="calendar" v-show="showCalendar">
        <div class="calendar-header">
          <button @click="previousMonth" :disabled="showMonthTable || showYearTable">
            <CustomIcon
              class="arrow-back"
              :imagePath="'/app-images/arrow_forward_ios.svg'"
              :width="'16px'"
              :height="'16px'"
              :color="'#263941'"
            />
          </button>
          <span class="current-month-year" @click="openMonthTable()">{{ currentMonth }}</span>
          <button @click="nextMonth" :disabled="showMonthTable || showYearTable">
            <CustomIcon
              class="arrow-next"
              :imagePath="'/app-images/arrow_forward_ios.svg'"
              :width="'16px'"
              :height="'16px'"
              :color="'#263941'"
            />
          </button>
          <button @click="previousYear" :disabled="showMonthTable || showYearTable">
            <CustomIcon
              class="arrow-back"
              :imagePath="'/app-images/arrow_forward_ios.svg'"
              :width="'16px'"
              :height="'16px'"
              :color="'#263941'"
            />
          </button>
          <span class="current-month-year" @click="openYearTable()">{{ currentYear }}</span>
          <button @click="nextYear" :disabled="showMonthTable || showYearTable">
            <CustomIcon
              class="arrow-next"
              :imagePath="'/app-images/arrow_forward_ios.svg'"
              :width="'16px'"
              :height="'16px'"
              :color="'#263941'"
            />
          </button>
          <button class="close-icon" @click="hideCalendar">
            <CustomIcon
              :imagePath="'/app-images/icon-close.svg'"
              :width="'18px'"
              :height="'18px'"
              :color="'primary'"
            />
          </button>
        </div>
        <div class="calendar-table-container">
          <table v-if="!showMonthTable && !showYearTable">
            <thead>
              <tr>
                <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in calendar" :key="week.toString()">
                <td
                  class="day-column"
                  v-for="date in week"
                  :key="date"
                  @click="selectDate(Number(date))"
                >
                  <div
                    class="wrapper-day"
                    :class="{ today: isToday(date), selected: isSelected(date) }"
                  >
                    {{ date }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table v-if="showMonthTable" class="table-months">
            <tbody>
              <tr v-for="row in 4" :key="row">
                <td
                  class="months"
                  v-for="(monthName, index) in monthNames.slice((row - 1) * 3, row * 3)"
                  :key="monthName"
                  @click="changeMonth(index + (row - 1) * 3 + 1)"
                  :class="{ 'month-selected': isMonthSelected(monthName) }"
                >
                  <div class="wrapper-month">
                    {{ monthName }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="showYearTable" class="calendar-years">
            <div class="years-btn-left" @click="previous20Years">
              <div>
                <button>
                  <CustomIcon
                    class="arrow-back"
                    :imagePath="'/app-images/arrow_forward_ios.svg'"
                    :width="'16px'"
                    :height="'16px'"
                    :color="'#263941'"
                  />
                </button>
              </div>
            </div>
            <div class="table-years">
              <div
                class="years"
                v-for="year in yearRange"
                :key="year"
                @click="changeYear(year)"
                :class="{ 'month-selected': isYearSelected(year) }"
              >
                <div class="wrapper-year">
                  {{ year }}
                </div>
              </div>
            </div>
            <div class="years-btn-right" @click="next20Years">
              <div>
                <button>
                  <CustomIcon
                    class="arrow-next"
                    :imagePath="'/app-images/arrow_forward_ios.svg'"
                    :width="'16px'"
                    :height="'16px'"
                    :color="'#263941'"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, type PropType } from 'vue';
import CustomIcon from './CustomIcon.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    modelValue: {
      type: [Date, null] as PropType<Date | null>,
      default: null,
    },
    placeholder: {
      type: String,
      required: false,
    },
    openYearViewFirst: {
      type: Boolean,
      default: false,
    },
    firstYearInRange: {
      type: Number,
      required: false,
    },
    iconPath: {
      type: String,
      default: '/app-images/calendar-grey.svg',
    },
  },
  emits: ['dateChanged', 'enter'],
  setup(props, context) {
    const daysOfWeek: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const monthNames: string[] = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const selectedDate = ref<{ displayDate: string; emitDate: Date }>({
      displayDate: '',
      emitDate: new Date(),
    });
    const selectedDay = ref<number | null>(null);
    const showCalendar = ref<boolean>(false);
    const showMonthTable = ref<boolean>(false);
    const showYearTable = ref<boolean>(false);
    const currentDate = ref<Date>(new Date());
    const selectedDateInput = ref<string | null>(null);
    const selectedYear = ref(0);
    const selectedMonth = ref(0);
    const yearRange = ref([] as number[]);
    const currentYear = computed(() => currentDate.value.getFullYear());
    const currentMonth = computed(() => monthNames[currentDate.value.getMonth()]);
    const isToday = (date: number | string) => {
      const today = new Date();
      return (
        date === today.getDate() &&
        currentDate.value.getMonth() === today.getMonth() &&
        currentDate.value.getFullYear() === today.getFullYear()
      );
    };
    const calendar = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const weeks: (number | string)[][] = [];
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      let week: (number | string)[] = [];
      const startDay = (firstDay + 6) % 7;
      for (let i = 0; i < startDay; i += 1) {
        week.push('');
      }
      let date = 1;
      for (let i = startDay; i < 42; i += 1) {
        if (date <= lastDate) {
          week.push(date);
          date += 1;
        } else {
          week.push('');
        }
        if (week.length === 7) {
          weeks.push([...week]);
          week = [];
        }
      }
      return weeks;
    });
    const previousMonth = () => {
      let tempMonth = selectedMonth.value - 1;
      let tempYear = selectedYear.value;
      if (tempMonth < 1) {
        tempMonth = 12;
        tempYear -= 1;
      }
      selectedMonth.value = tempMonth;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, tempMonth - 1, selectedDay.value || 1);
    };
    const nextMonth = () => {
      let tempMonth = selectedMonth.value + 1;
      let tempYear = selectedYear.value;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear += 1;
      }
      selectedMonth.value = tempMonth;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, tempMonth - 1, selectedDay.value || 1);
    };
    const previousYear = () => {
      const tempYear = selectedYear.value - 1;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, selectedMonth.value - 1, selectedDay.value || 1);
    };
    const nextYear = () => {
      const tempYear = selectedYear.value + 1;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, selectedMonth.value - 1, selectedDay.value || 1);
    };
    const isYearSelected = (year: number) => selectedYear.value === year;
    const changeYear = (year: number) => {
      selectedYear.value = year;
      currentDate.value = new Date(year, selectedMonth.value - 1, selectedDay.value || 1);
      showYearTable.value = false;
      if (props.openYearViewFirst) {
        showMonthTable.value = true;
      }
    };
    const previous20Years = () => {
      const tempYear = currentYear.value - 20;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, selectedMonth.value - 1, selectedDay.value || 1);
      yearRange.value = [];
      for (let year = tempYear; year < tempYear + 20; year += 1) {
        yearRange.value.push(year);
      }
    };
    const next20Years = () => {
      const tempYear = currentYear.value + 20;
      selectedYear.value = tempYear;
      currentDate.value = new Date(tempYear, selectedMonth.value - 1, selectedDay.value || 1);
      yearRange.value = [];
      for (let year = tempYear; year < tempYear + 20; year += 1) {
        yearRange.value.push(year);
      }
    };
    const generateYearRange = () => {
      let startYear = Math.floor(currentYear.value / 10) * 10;
      if (props.firstYearInRange && !selectedDate.value.displayDate) {
        startYear = props.firstYearInRange;
        currentDate.value = new Date(startYear, selectedMonth.value - 1, selectedDay.value || 1);
      }
      const endYear = startYear + 20;
      yearRange.value = [];
      for (let year = startYear; year < endYear; year += 1) {
        yearRange.value.push(year);
      }
    };

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const showCalendarHandler = () => {
      if (props.modelValue) {
        selectedDate.value = {
          displayDate: formatDate(props.modelValue),
          emitDate: props.modelValue,
        };
        currentDate.value = props.modelValue;
      } else {
        currentDate.value = new Date();
      }
      generateYearRange();
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (selectedDate.value.displayDate && dateRegex.test(selectedDate.value.displayDate)) {
        const [day, month, year] = selectedDate.value.displayDate.split('/');
        currentDate.value = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10)
        );
      }
      selectedMonth.value = currentDate.value.getMonth() + 1;
      selectedYear.value = currentDate.value.getFullYear();
      selectedDay.value = currentDate.value.getDate();
      if (props.openYearViewFirst) {
        showYearTable.value = true;
      } else {
        showMonthTable.value = false;
        showYearTable.value = false;
      }
      showCalendar.value = !showCalendar.value;
    };

    const hideCalendar = () => {
      showMonthTable.value = false;
      showCalendar.value = false;
    };

    const isSameMonthAndYear = computed(() => {
      if (selectedDate.value.emitDate instanceof Date) {
        const year = selectedDate.value.emitDate.getFullYear();
        const month = selectedDate.value.emitDate.getMonth() + 1;
        return year === currentYear.value && month === selectedMonth.value;
      }
      return false;
    });

    const selectDate = (date: number) => {
      if (date) {
        const selectedDateTime = new Date(currentDate.value.getTime());
        selectedDateTime.setDate(date);
        const year = selectedDateTime.getFullYear();
        const month = selectedDateTime.getMonth() + 1;
        const day = selectedDateTime.getDate();
        const displayDate = `${day.toString().padStart(2, '0')}/${month
          .toString()
          .padStart(2, '0')}/${year}`;
        const emitDate = new Date(year, month - 1, day);
        selectedDay.value = day;
        selectedDate.value = { displayDate, emitDate };
        context.emit('dateChanged', emitDate);
        hideCalendar();
      }
    };

    const changeMonth = (monthIndex: number) => {
      const tempYear = selectedYear.value;
      selectedMonth.value = monthIndex;
      currentDate.value = new Date(tempYear, monthIndex - 1, selectedDay.value || 1);
      showMonthTable.value = false;
    };
    const isSelected = (date: number | string) =>
      isSameMonthAndYear.value && selectedDay.value !== null && Number(date) === selectedDay.value;
    const isMonthSelected = (monthName: string) => {
      const monthIndex = monthNames.indexOf(monthName) + 1;
      return selectedMonth.value === monthIndex;
    };
    const openMonthTable = () => {
      showYearTable.value = false;
      showMonthTable.value = !showMonthTable.value;
    };
    const openYearTable = () => {
      showMonthTable.value = false;
      showYearTable.value = !showYearTable.value;
    };

    watch(currentDate, () => {
      selectedMonth.value = currentDate.value.getMonth() + 1;
      selectedYear.value = currentDate.value.getFullYear();
      selectedDay.value = currentDate.value.getDate();
    });
    watch(
      () => props.modelValue,
      () => {
        currentDate.value = props.modelValue || new Date();
        selectedDate.value = {
          displayDate: formatDate(props.modelValue ?? new Date()),
          emitDate: props.modelValue ?? new Date(),
        };
      }
    );
    onMounted(() => {
      if (props.modelValue) {
        selectedDate.value = {
          displayDate: formatDate(props.modelValue),
          emitDate: props.modelValue,
        };
        currentDate.value = props.modelValue;
      } else {
        currentDate.value = new Date();
      }
      selectedMonth.value = currentDate.value.getMonth() + 1;
      selectedYear.value = currentDate.value.getFullYear();
      if (props.openYearViewFirst) {
        showYearTable.value = true;
      }
      generateYearRange();
    });
    return {
      selectedDate,
      showCalendar,
      currentMonth,
      currentYear,
      daysOfWeek,
      calendar,
      selectedDay,
      selectedDateInput,
      showMonthTable,
      showYearTable,
      currentDate,
      monthNames,
      yearRange,
      isYearSelected,
      changeYear,
      previous20Years,
      next20Years,
      isMonthSelected,
      previousMonth,
      nextMonth,
      previousYear,
      nextYear,
      selectDate,
      hideCalendar,
      isSelected,
      showCalendarHandler,
      changeMonth,
      openMonthTable,
      openYearTable,
      isToday,
    };
  },
});
</script>

<style scoped lang="scss">
.datepicker {
  position: relative;
  user-select: none;

  .icon-wrapper {
    display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    img {
      object-fit: contain;
      margin-right: 0.5rem;
    }
  }
  .calendar {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    z-index: 102;
    -webkit-transform: scale(1);
    transform: scale(1);
    display: flex;
    flex-direction: column;
    margin: 0 auto;
  }
  .calendar-table-container {
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    table {
      width: 100%;
      height: 50%;
      border-collapse: collapse;
      font-size: 14px;
      margin-top: 0.5rem;
    }
    thead {
      text-align: center;
      color: #c7c7c7;
    }
    td {
      text-align: center;
      padding: 5px;
      cursor: pointer;
    }
    .day-column {
      width: calc(100% / 7);
      .wrapper-day {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    font-weight: bold;
    color: $primary;
    padding: 10px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 10%;
    .current-month-year {
      cursor: pointer;
    }
    .arrow-back {
      width: 18px;
      height: 18px;
      transform: rotate(90deg);
    }
    .arrow-next {
      transform: rotate(-90deg);
      width: 18px;
      height: 18px;
    }
    .close-icon {
      color: white;
    }
  }
  button {
    cursor: pointer;
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.today {
  border: 1px solid #c4dee2;
  border-radius: 10px;
}
.selected {
  background-color: $primary;
  border-radius: 10px;
  color: #fff;
  font-weight: bold;
}
.years {
  font-size: 14px;
  cursor: pointer;
}
.month-selected {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  .wrapper-year {
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60%;
    background-color: $primary;
    color: #fff;
    cursor: pointer;
  }
  .wrapper-month {
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60%;
    height: 80%;
    background-color: $primary;
    color: #fff;
    cursor: pointer;
  }
}
.table-months {
  height: 100%;
}
.calendar-years {
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  .table-years {
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 0 10px;
  }
  .years-btn-left {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    .arrow-back {
      transform: rotate(90deg);
      border-bottom-right-radius: 8px;
    }
  }
  .years-btn-right {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    .arrow-next {
      transform: rotate(-90deg);
      border-bottom-right-radius: 8px;
    }
  }
}

@media (min-width: 1024px) {
  .datepicker {
    .calendar {
      position: fixed;
      width: 380px;
      height: 350px;
      top: 20%;
      left: 35%;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
      border-radius: 8px;
      z-index: 102;
      -webkit-transform: scale(1.1);
      transform: scale(1.1);
      display: flex;
      flex-direction: column;
      margin: 0 auto;
    }

    .calendar-header {
      font-size: 16px;
      color: #263941;
      padding: 5px;
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding: 0 1rem;

      .current-month-year {
        cursor: pointer;
        &:hover {
          color: $tertiary;
        }
      }
      .arrow-back {
        width: 18px;
        height: 18px;
      }
      .arrow-next {
        width: 18px;
        height: 18px;
      }
    }
    .calendar-table-container {
      table {
        width: 100%;
        height: 90%;
      }
      .calendar-years {
        width: 100%;
        height: 100%;
        font-size: 12px;
        .table-years {
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(5, 1fr);
        }
      }
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 4;
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
