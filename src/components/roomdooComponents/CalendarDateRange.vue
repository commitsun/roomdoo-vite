<template>
  <div class="datepicker" ref="datepicker">
    <div class="calendar">
      <div class="header" v-if="showHeader">
        <div class="change-one-day-container">
          <div class="change-one-day-first-date">
            <CustomIcon
              :imagePath="'/app-images/icon-calendar-blue.svg'"
              :width="'18px'"
              :height="'18px'"
              :color="'#a6a6a6'"
              class="icon-calendar"
            />
            <input placeholder="Inicio" v-model="firstDayInRangeFormatted" disabled />
            <button class="btn-change-one-day-previous" @click="removeOneDayToFirstDayInRange()">
              <CustomIcon
                :imagePath="'/app-images/arrow_forward_ios.svg'"
                :width="'12px'"
                :height="'12px'"
                :color="'#a6a6a6'"
              />
            </button>
            <button class="btn-change-one-day-next" @click="addOneDayToFirstDayInRange()">
              <CustomIcon
                :imagePath="'/app-images/arrow_forward_ios.svg'"
                :width="'12px'"
                :height="'12px'"
                :color="'#a6a6a6'"
              />
            </button>
          </div>
          <div class="change-one-day-last-date">
            <input placeholder="Fin" v-model="lastDayInRangeFormatted" disabled />
            <button class="btn-change-one-day-previous" @click="removeOneDayToLastDayInRange()">
              <CustomIcon
                :imagePath="'/app-images/arrow_forward_ios.svg'"
                :width="'12px'"
                :height="'12px'"
                :color="'#a6a6a6'"
              />
            </button>
            <button class="btn-change-one-day-next" @click="addOneDayToLastDayInRange()">
              <CustomIcon
                :imagePath="'/app-images/arrow_forward_ios.svg'"
                :width="'12px'"
                :height="'12px'"
                :color="'#a6a6a6'"
              />
            </button>
          </div>
        </div>
        <button class="close-icon" @click="$emit('closeCalendar')">
          <img src="/app-images/icon-close.svg" alt="Close" />
        </button>
      </div>
      <div class="calendar-container" ref="calendarContainer">
        <div class="month-btn-container">
          <button @click="showPreviousMonth" class="btn-month">
            <img
              src="/app-images/arrow_forward_ios.svg"
              alt="Previous Month"
              class="previous-month"
            />
          </button>
        </div>
        <div class="calendar-month" v-for="monthData in calendar" :key="monthData.month">
          <div class="month-name">
            {{ monthData.month }}
          </div>
          <table>
            <thead>
              <tr>
                <th class="week-days" v-for="day in daysOfWeek" :key="day">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in monthData.days" :key="week.toString()">
                <td
                  class="day-column"
                  v-for="day in week"
                  :key="day?.toString()"
                  :id="`${day?.getTime()}`"
                  @click="selectDate(day || null)"
                  @mouseenter="addHoverClass(day)"
                  :class="{
                    'first-day-in-range': day && day?.getTime() === firstDayInRange?.getTime(),
                    'last-day-in-range':
                      day &&
                      day?.getTime() === lastDayInRange?.getTime() &&
                      firstDayInRange?.getTime() !== lastDayInRange?.getTime(),
                    'day-in-range':
                      day &&
                      firstDayInRange &&
                      lastDayInRange &&
                      day?.getTime() > firstDayInRange?.getTime() &&
                      day?.getTime() < lastDayInRange?.getTime(),

                    disabled: isDateDisabled(day || null),
                  }"
                >
                  {{ day?.getDate() || ' ' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="month-btn-container">
          <button class="btn-month" @click="showNextMonth">
            <img src="/app-images/arrow_forward_ios.svg" alt="Previous Month" class="next-month" />
          </button>
        </div>
        <button
          class="btn-ok"
          v-if="
            firstDayInRange !== null &&
            lastDayInRange !== null &&
            (firstDayInRange !== initialFirstDayInRange || lastDayInRange !== initialLastDayInRange)
          "
          @click="$emit('closeCalendar')"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  type Ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue';
import CustomIcon from './CustomIcon.vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Array as () => Date[],
      required: false,
      default: () => [],
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
    showHeader: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  setup(props, context) {
    const daysOfWeek: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const monthNames: string[] = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const startY = ref(0);

    const visibleMonths = ref([] as number[]);
    const currentDate = ref(new Date());
    const showCalendar = ref(false);
    const firstDayInRange: Ref<Date | null> = ref(null);
    const lastDayInRange: Ref<Date | null> = ref(null);
    const initialFirstDayInRange: Ref<Date | null> = ref(null);
    const initialLastDayInRange: Ref<Date | null> = ref(null);
    const datepicker: Ref<HTMLElement | null> = ref(null);
    const calendarContainer: Ref<HTMLElement | null> = ref(null);

    const firstDayInRangeFormatted = computed(() => {
      if (firstDayInRange.value) {
        return ` ${firstDayInRange.value.toLocaleString('default', {
          weekday: 'short',
        })}, ${firstDayInRange.value?.getDate()} ${firstDayInRange.value?.toLocaleString(
          'default',
          { month: 'short' }
        )}`;
      }
      return '';
    });

    const lastDayInRangeFormatted = computed(() => {
      if (lastDayInRange.value) {
        return ` ${lastDayInRange.value.toLocaleString('default', {
          weekday: 'short',
        })}, ${lastDayInRange.value?.getDate()} ${lastDayInRange.value?.toLocaleString('default', {
          month: 'short',
        })}`;
      }
      return '';
    });

    const currentYear = computed(() => currentDate.value.getFullYear());
    const calendar = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const calendarData = [];
      const qtyMonthsToRender = window.innerWidth < 1024 ? 3 : 2;
      for (let m = qtyMonthsToRender === 3 ? -1 : 0; m < qtyMonthsToRender; m += 1) {
        const current = new Date(year, month + m);
        const weeks = [];
        const firstDay = new Date(year, month + m, 1).getDay();
        const lastDate = new Date(year, month + m + 1, 0).getDate();
        let week = [];
        const startDay = (firstDay + 6) % 7;
        for (let i = 0; i < startDay; i += 1) {
          week.push(null);
        }
        let date = 1;
        for (let i = startDay; i < 42; i += 1) {
          if (date <= lastDate) {
            week.push(new Date(year, month + m, date));
            date += 1;
          } else {
            week.push(null);
          }
          if (week.length === 7) {
            weeks.push([...week]);
            week = [];
          }
        }
        const formattedMonth = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
        calendarData.push({ month: formattedMonth, days: weeks });
      }
      return calendarData;
    });
    const isDateDisabled = (date: Date | null) => {
      if (date) {
        if (props.disablePastDates && date.getTime() < new Date().getTime()) {
          return true;
        }
        if (props.disableFutureDates && date.getTime() > new Date().getTime()) {
          return true;
        }
      }
      return false;
    };
    const showPreviousMonth = () => {
      const newDate = new Date(currentDate.value);
      newDate.setMonth(newDate.getMonth() - 1);
      currentDate.value = newDate;
    };
    const showNextMonth = () => {
      const newDate = new Date(currentDate.value);
      newDate.setMonth(newDate.getMonth() + 1);
      currentDate.value = newDate;
    };
    const selectDate = (date: Date | null) => {
      if (date && !isDateDisabled(date)) {
        if (!firstDayInRange.value) {
          firstDayInRange.value = date;
        } else if (!lastDayInRange.value) {
          if (date.getTime() < firstDayInRange.value.getTime()) {
            lastDayInRange.value = firstDayInRange.value;
            firstDayInRange.value = date;
          } else {
            lastDayInRange.value = date;
          }
        } else {
          firstDayInRange.value = date;
          lastDayInRange.value = null;
        }
        const firstDateToEmit = firstDayInRange.value
          ? new Date(
              `${firstDayInRange.value.getFullYear()}-${(firstDayInRange.value.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${firstDayInRange.value.getDate().toString().padStart(2, '0')}`
            )
          : null;
        const lastDateToEmit = lastDayInRange.value
          ? new Date(
              `${lastDayInRange.value.getFullYear()}-${(lastDayInRange.value.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${lastDayInRange.value.getDate().toString().padStart(2, '0')}`
            )
          : null;
        context.emit('update:modelValue', [firstDateToEmit || null, lastDateToEmit || null]);
      }
    };
    const addHoverClass = (date: Date | null) => {
      if (date && !isDateDisabled(date)) {
        const element = document.getElementById(`${date.getTime()}`);
        element?.classList.remove('hovered');
        if (firstDayInRange.value && !lastDayInRange.value) {
          if (element && Number(element.id) > firstDayInRange.value.getTime()) {
            const days = document.querySelectorAll('.day-column');
            days.forEach((day) => {
              day.classList.remove('day-in-range');
              day.classList.remove('first-day-in-range');
              day.classList.remove('last-day-in-range');
              day.classList.remove('hovered');
              const dayId = Number(day.id);
              if (
                firstDayInRange.value &&
                dayId > firstDayInRange.value.getTime() &&
                dayId <= date.getTime()
              ) {
                day.classList.add('day-in-range');
              } else {
                day.classList.remove('day-in-range');
              }
              if (date.getTime() === dayId) {
                day.classList.add('last-day-hover');
              } else {
                day.classList.remove('last-day-hover');
              }
              if (dayId === firstDayInRange.value?.getTime()) {
                day.classList.add('first-day-in-range');
              } else {
                day.classList.remove('first-day-in-range');
              }
            });
          } else if (element && Number(element.id) < firstDayInRange.value.getTime()) {
            const days = document.querySelectorAll('.day-column');
            days.forEach((day) => {
              day.classList.remove('day-in-range');
              day.classList.remove('last-day-hover');
              day.classList.remove('first-day-in-range');
              day.classList.remove('hovered');
              const dayId = Number(day.id);
              if (
                firstDayInRange.value &&
                dayId < firstDayInRange.value.getTime() &&
                dayId > date.getTime()
              ) {
                day.classList.add('day-in-range');
              } else {
                day.classList.remove('day-in-range');
              }
              if (date.getTime() === dayId) {
                day.classList.add('first-day-in-range');
              } else {
                day.classList.remove('first-day-in-range');
              }
              if (dayId === firstDayInRange.value?.getTime()) {
                day.classList.add('last-day-hover');
              } else {
                day.classList.remove('last-day-hover');
              }
            });
          } else {
            const days = document.querySelectorAll('.day-column');
            days.forEach((day) => {
              day.classList.remove('day-in-range');
              day.classList.remove('last-day-hover');
              day.classList.remove('first-day-in-range');
              day.classList.remove('hovered');
              if (date.getTime() === Number(day.id)) {
                day.classList.add('first-day-in-range');
              }
            });
          }
        }
      }
    };

    // REVIEW: position of scroll when open calendar
    const openCalendar = () => {
      if (firstDayInRange.value && lastDayInRange.value) {
        currentDate.value = new Date(firstDayInRange.value);
      }
      showCalendar.value = true;
      void nextTick(() => {
        const container = calendarContainer.value;
        if (container) {
          container.scrollTop = container.scrollHeight / 4;
        }
      });
    };

    const removeOneDayToFirstDayInRange = () => {
      if (firstDayInRange.value) {
        const newDate = new Date(firstDayInRange.value);
        newDate.setDate(newDate.getDate() - 1);
        if (isDateDisabled(newDate)) {
          return;
        }
        firstDayInRange.value = newDate;
        context.emit('update:modelValue', [
          new Date(
            `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`
          ),
          lastDayInRange.value
            ? new Date(
                `${lastDayInRange.value.getFullYear()}-${(lastDayInRange.value.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${lastDayInRange.value.getDate().toString().padStart(2, '0')}`
              )
            : null,
        ]);
      }
    };

    const addOneDayToFirstDayInRange = () => {
      if (firstDayInRange.value) {
        const newDate = new Date(firstDayInRange.value);
        newDate.setDate(newDate.getDate() + 1);
        if (isDateDisabled(newDate)) {
          return;
        }
        if (
          lastDayInRange.value &&
          firstDayInRange.value.getTime() >= lastDayInRange.value?.getTime()
        ) {
          lastDayInRange.value = newDate;
        }
        firstDayInRange.value = newDate;
        context.emit('update:modelValue', [
          new Date(
            `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`
          ),
          lastDayInRange.value
            ? new Date(
                `${lastDayInRange.value.getFullYear()}-${(lastDayInRange.value.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${lastDayInRange.value.getDate().toString().padStart(2, '0')}`
              )
            : null,
        ]);
      }
    };

    const removeOneDayToLastDayInRange = () => {
      if (lastDayInRange.value) {
        const newDate = new Date(lastDayInRange.value);
        newDate.setDate(newDate.getDate() - 1);
        if (isDateDisabled(newDate)) {
          return;
        }
        if (
          firstDayInRange.value &&
          lastDayInRange.value.getTime() <= firstDayInRange.value?.getTime()
        ) {
          firstDayInRange.value = newDate;
        }
        lastDayInRange.value = newDate;
        context.emit('update:modelValue', [
          firstDayInRange.value
            ? new Date(
                `${firstDayInRange.value.getFullYear()}-${(firstDayInRange.value.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${firstDayInRange.value.getDate().toString().padStart(2, '0')}`
              )
            : null,
          newDate
            ? new Date(
                `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`
              )
            : null,
        ]);
      }
    };

    const addOneDayToLastDayInRange = () => {
      if (lastDayInRange.value) {
        const newDate = new Date(lastDayInRange.value);
        newDate.setDate(newDate.getDate() + 1);
        if (isDateDisabled(newDate)) {
          return;
        }
        lastDayInRange.value = newDate;
        context.emit('update:modelValue', [
          firstDayInRange.value
            ? new Date(
                `${firstDayInRange.value.getFullYear()}-${(firstDayInRange.value.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${firstDayInRange.value.getDate().toString().padStart(2, '0')}`
              )
            : null,
          newDate
            ? new Date(
                `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`
              )
            : null,
        ]);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      startY.value = event.touches[0].clientY;
      const container = calendarContainer.value;
      if (container) {
        if (container.scrollTop === 0) {
          startY.value = event.touches[0].clientY;
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const container = calendarContainer.value;
      if (container) {
        const scrollPosition = container.scrollTop;
        const containerHeight = container.clientHeight;
        const { scrollHeight } = container;

        const sixtyPercentOfContainer = containerHeight * 0.5;
        const endY = event.changedTouches[0].clientY;
        const deltaY = endY - startY.value;

        if (scrollPosition + containerHeight >= scrollHeight - sixtyPercentOfContainer) {
          if (deltaY < -50) {
            showNextMonth();
          }
        } else if (scrollPosition + containerHeight <= scrollHeight - sixtyPercentOfContainer) {
          if (scrollPosition === 0) {
            container.scrollTop = 5;
          }
          if (deltaY > 50) {
            showPreviousMonth();
          }
        }
      }
    };

    const setupTouchHandlers = (el: HTMLElement | null) => {
      if (el) {
        el.addEventListener('touchstart', handleTouchStart);
        el.addEventListener('touchend', handleTouchEnd);
      }
    };

    const removeTouchHandlers = (el: HTMLElement | null) => {
      if (el) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchend', handleTouchEnd);
      }
    };

    watch(
      () => props.modelValue,
      () => {
        if (props.modelValue.length === 2 && props.modelValue[0] && props.modelValue[1]) {
          const [firstDate, lastDate] = props.modelValue;
          firstDayInRange.value = new Date(firstDate);
          lastDayInRange.value = new Date(lastDate);
          firstDayInRange.value.setHours(0, 0, 0, 0);
          lastDayInRange.value.setHours(0, 0, 0, 0);
        } else if (props.modelValue.length === 0) {
          firstDayInRange.value = null;
          lastDayInRange.value = null;
        }
      }
    );

    onMounted(() => {
      setupTouchHandlers(datepicker.value);
      firstDayInRange.value = null;
      lastDayInRange.value = null;
      if (props.modelValue.length === 2) {
        currentDate.value = new Date(props.modelValue[0]);
        const [firstDate, lastDate] = props.modelValue;
        firstDayInRange.value = new Date(firstDate);
        firstDayInRange.value.setHours(0, 0, 0, 0);
        lastDayInRange.value = new Date(lastDate);
        lastDayInRange.value.setHours(0, 0, 0, 0);
        initialFirstDayInRange.value = new Date(firstDate);
        initialFirstDayInRange.value.setHours(0, 0, 0, 0);
        initialLastDayInRange.value = new Date(lastDate);
        initialLastDayInRange.value.setHours(0, 0, 0, 0);
      }
    });

    onUnmounted(() => {
      removeTouchHandlers(datepicker.value);
    });

    return {
      datepicker,
      calendarContainer,
      showCalendar,
      daysOfWeek,
      calendar,
      currentDate,
      currentYear,
      monthNames,
      visibleMonths,
      firstDayInRange,
      lastDayInRange,
      firstDayInRangeFormatted,
      lastDayInRangeFormatted,
      initialFirstDayInRange,
      initialLastDayInRange,
      showPreviousMonth,
      showNextMonth,
      selectDate,
      addHoverClass,
      openCalendar,
      removeOneDayToFirstDayInRange,
      addOneDayToFirstDayInRange,
      removeOneDayToLastDayInRange,
      addOneDayToLastDayInRange,
      isDateDisabled,
    };
  },
  components: { CustomIcon },
});
</script>

<style scoped lang="scss">
.datepicker {
  user-select: none;

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

  .calendar {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    border-radius: 0;
    z-index: 412;
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    margin: 0 auto;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 3rem;
      .change-one-day-container {
        display: flex;
        align-items: center;
        height: 100%;
        border: 1px solid #a6a6a6;
        border-radius: 5px;
        width: 85%;
        margin-left: 0.5rem;
        .change-one-day-first-date {
          display: flex;
          align-items: center;
          height: 100%;
          border-right: 1px solid #a6a6a6;
          padding: 0.5rem 0;
          .icon-calendar {
            display: none;
          }
        }
        .change-one-day-last-date {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0.5rem 0;
        }
        input {
          height: 100%;
          padding-left: 0.5rem;
          border: none;
          font-size: 14px;
          pointer-events: none;
          max-width: 85px;
          &:focus {
            outline: none;
          }
        }
        .btn-change-one-day-previous {
          height: 100%;
          background-color: white;
          border: none;
          cursor: pointer;
          transform: rotate(90deg);
        }
        .btn-change-one-day-next {
          height: 100%;
          background-color: white;
          border: none;
          cursor: pointer;
          transform: rotate(-90deg);
          margin-right: 0.5rem;
        }
      }
      .close-icon {
        cursor: pointer;
        border: none;
        background-color: transparent;
        display: flex;
        align-items: center;
        color: $primary;
        font-size: 20px;
        margin-right: 5px;
      }
    }
    .calendar-container {
      height: 100%;
      display: grid;
      grid-template-columns: 7fr;
      gap: 1rem;
      overflow-y: scroll;
      padding: 1rem;
      position: relative;
      &::-webkit-scrollbar {
        display: none;
      }

      .calendar-month {
        margin-top: 50px;

        .month-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
          color: black;
        }

        table {
          // width: 90%;
          width: 100%;
          text-align: center;
          border-collapse: separate;
          border-spacing: 0 1rem;
          padding: 0 0.5rem 0 0.5rem;

          tr {
            margin: 0;

            td {
              padding: 5px 0 15px 0;
              border: 1px solid transparent;
              cursor: pointer;
            }
            .first-day-in-range {
              background-color: $primary;
              color: white;
              font-weight: bold;
              border: 1px solid $primary;
              border-radius: 15px;
            }

            .last-day-in-range {
              background-color: #f0fcff;
              color: black;
              font-weight: bold;
              border: 1px solid $primary;
              border-radius: 15px;
            }

            .day-in-range {
              background-color: #f0fcff;
              color: black;
              font-weight: bold;
            }
            .hover-class {
              background-color: #f0fcff;
              color: black;
            }
            .first-day-hover {
              background-color: #f0fcff;
              color: black;
            }
            .last-day-hover {
              background-color: white;
              color: black;
              font-weight: bold;
              border: 1px solid $primary;
              border-radius: 15px;
            }
            .hovered {
              border: 1px solid $primary;
              border-radius: 15px;
            }
            .disabled {
              cursor: not-allowed;
              color: #c7c7c7;
            }
          }
        }
      }
      .week-days {
        color: #c7c7c7;
      }

      .month-btn-container {
        align-self: center;
        justify-self: center;
        display: none;
        .btn-month {
          background-color: transparent;
          border: none;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.23);
          display: flex;
          align-items: center;
          justify-content: center;
          .previous-month {
            transform: rotate(90deg);
          }
          .next-month {
            transform: rotate(-90deg);
          }
        }
      }
      .btn-ok {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-weight: bold;
      }
    }
  }
}

@media (min-width: 1024px) {
  .datepicker {
    .calendar {
      width: 800px;
      height: 600px;
      top: 20%;
      left: 27%;
      border-radius: 8px;
      .header {
        justify-content: flex-end;
        margin-top: 1rem;
        height: 50px;
        .change-one-day-container {
          width: 38%;
          margin-left: 0;
        }
        .close-icon {
          margin-left: 1rem;
        }
      }
      .calendar-container {
        grid-template-columns: 1fr 7fr 7fr 1fr;
        padding-bottom: 0;
        .month-btn-container {
          display: flex;
        }
      }
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
