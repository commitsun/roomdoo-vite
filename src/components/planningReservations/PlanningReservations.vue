<template>
  <div class="main-container">
    <div class="top">
      <div class="top-left">
        <div class="top-left-content">
          <div class="left">
            <div class="dummy-left" />
            <div class="first">
              <DatePicker
                v-model="selectedDate"
                dateFormat="MM yy"
                placeholder="DD/MM/YYYY"
                showIcon
                :manualInput="false"
                :inputStyle="{
                  textAlign: 'center',
                  width: '115px',
                  height: '25px',
                  padding: '0px 5px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }"
              />
            </div>
            <div class="second">
              <span @click="moveToToday()"> Hoy </span>
            </div>
          </div>
          <div class="right" @click="$emit('moveOneDayBackward')">
            <CustomIcon
              class="icon"
              color="primary"
              width="17px"
              height="17px"
              imagePath="/app-images/icon-arrow-blue.svg"
            />
          </div>
        </div>
      </div>
      <div class="top-middle" id="top-middle" ref="topMiddle">
        <div class="top-middle-content">
          <div
            class="date-header"
            v-for="(calendarHeaderItem, index) in planningHeaders"
            :key="index"
            :class="classDate(calendarHeaderItem.date)"
          >
            <div class="date">
              {{
                `
                ${calendarHeaderItem.date
                  .toLocaleString('default', { weekday: 'short' })
                  .toString()
                  .toUpperCase()}
                ${calendarHeaderItem.date.getDate()}
                ${calendarHeaderItem.date.toLocaleString('default', {
                  month: 'short',
                })}`
              }}
            </div>
            <div
              class="date-one-letter"
              :class="calendarHeaderItem.date.getTime() === today.getTime() ? 'today' : ''"
            >
              <span>
                {{
                  calendarHeaderItem.date.getDay() === 3
                    ? 'X'
                    : calendarHeaderItem.date
                        .toLocaleString('default', { weekday: 'short' })
                        .toString()
                        .toUpperCase()[0]
                }}
              </span>
              <div class="date-dummy-border" />
            </div>

            <div class="date-month-day">
              <img src="/app-images/icon-alert.svg" v-if="calendarHeaderItem.overbooking" />
              <div
                class="circle"
                :class="calendarHeaderItem.date.getTime() === today.getTime() ? 'today' : ''"
              >
                <span>
                  {{ calendarHeaderItem.date.getDate() }}
                </span>
              </div>
            </div>
            <div class="bill-free">
              <div class="bill">{{ calendarHeaderItem.dailyBilling }}€</div>
              <div class="free-rooms" v-if="calendarHeaderItem.freeRooms > 0">
                {{
                  `${calendarHeaderItem.freeRooms} libre${
                    calendarHeaderItem.freeRooms === 1 ? '' : 's'
                  }`
                }}
              </div>
              <div
                class="no-free-rooms"
                v-if="calendarHeaderItem.freeRooms === 0 && filteredRoomIds.length !== 0"
              >
                Lleno
              </div>
            </div>
            <div class="occupancy" v-if="!calendarHeaderItem.overbooking">
              <div
                class="occupancy-data"
                :style="{
                  width: `${calendarHeaderItem.occupancyRate}%`,
                }"
              />
            </div>
            <div
              class="date-info"
              :class="calendarHeaderItem.overbooking ? 'date-info-overbooking' : ''"
              @click="
                calendarHeaderItem.overbooking
                  ? openOverbookingFolioList(calendarHeaderItem.date)
                  : null
              "
            >
              <span v-if="calendarHeaderItem.overbooking">
                <img src="/app-images/icon-warning-white.svg" />
                <span>Overbooking</span>
              </span>
              <span v-else class="date-occupation">
                {{ calendarHeaderItem.occupancyRate }}% ocupación
              </span>
              <span class="date-info-free-rooms" v-if="!calendarHeaderItem.overbooking">
                {{
                  `${
                    calendarHeaderItem.freeRooms === 0
                      ? 'Lleno'
                      : calendarHeaderItem.freeRooms +
                        ' libre' +
                        (calendarHeaderItem.freeRooms === 1 ? '' : 's')
                  }`
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="top-right" @click="$emit('moveOneDayForward')">
        <CustomIcon
          class="icon"
          color="primary"
          width="17px"
          height="17px"
          imagePath="/app-images/icon-arrow-blue.svg"
        />
      </div>
    </div>
    <div class="bottom">
      <div class="bottom-left" ref="bottomLeft" id="bottom-left">
        <div class="bottom-left-content">
          <div class="dummy" />
          <div
            v-for="room in planning.filter((el) => filteredRoomIds.includes(el.roomId))"
            :key="room.roomId"
            class="room-left"
          >
            <div class="line" />
            <div class="room-info">
              <div class="room-name">
                <span class="name">
                  {{ roomShortName(room.roomId).substring(0, 4) }}
                </span>
                <span class="category-name">
                  {{ roomTypeDefaultCode(room.roomTypeId).substring(0, 3) }}
                </span>
                <span class="amenity-name">
                  {{ roomAmenityDefaultCode(room.roomId)?.substring(0, 4) }}
                </span>
              </div>
              <div class="room-capacity">
                <div class="capacity-number">
                  {{ roomCapacity(room.roomId) }}
                </div>
                <CustomIcon
                  class="capacity-image-mobile"
                  color="#B3B3B3"
                  width="12px"
                  height="12px"
                  :imagePath="
                    roomCapacity(room.roomId) > 1
                      ? '/app-images/icon-users-light-blue.svg'
                      : '/app-images/icon-user-light-blue.svg'
                  "
                />
                <CustomIcon
                  class="capacity-image"
                  color="#B3B3B3"
                  width="20px"
                  height="20px"
                  :imagePath="
                    roomCapacity(room.roomId) > 1
                      ? '/app-images/icon-users-light-blue.svg'
                      : '/app-images/icon-user-light-blue.svg'
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="bottom-middle"
        ref="bottomMiddle"
        id="bottom-middle"
        @click="closeRightDrawer()"
        :class="hideHorizontalScrollbar ? 'hide-horizontal-scrollbar' : ''"
      >
        <svg
          v-if="planning.length > 0 && splittedReservationsBorders.length > 0"
          id="main-svg"
          ref="mainSvg"
          :height="planning.filter((el) => filteredRoomIds.includes(el.roomId)).length * 46 + 20"
          :width="(planning[0].dates.length - 2) * 140 - 8"
          style="position: absolute; top: 0; left: 0"
        >
          <polyline
            v-for="line in splittedReservationsBorders"
            :key="line.reservationLineIdFrom"
            :points="line.svgCoord"
            :style="`fill:none;stroke:${line.color};stroke-width:2`"
            stroke-dasharray="2,2"
          />
        </svg>

        <div class="bottom-middle-content">
          <div class="dummy-content" v-if="planning.length > 0">
            <div
              class="dummy"
              v-for="(date, index) in planning[0].dates.filter(
                (el) =>
                  el.date.getTime() >= dateStart.getTime() && el.date.getTime() <= dateEnd.getTime()
              )"
              :key="index"
              :class="classDate(date.date)"
              :data-date-checkin="date.date.getTime()"
            />
          </div>
          <div
            class="row-planning"
            v-for="(room, index) in planning.filter((el) => filteredRoomIds.includes(el.roomId))"
            :key="index"
          >
            <div
              class="cell-planning"
              v-for="day in room.dates.filter(
                (el) =>
                  el.date.getTime() >= dateStart.getTime() && el.date.getTime() <= dateEnd.getTime()
              )"
              :key="`${day.date.getTime()}-${room.roomId}`"
              :class="classDate(day.date)"
              :data-date-checkin="day.date.getTime()"
              @drop="dropAtEmptyDate(room.roomId, day.date)"
              @dragover.prevent
              @dragenter="dragEnterCell($event, room.roomId)"
              @dragend="dragEndCell"
            >
              <div class="line" :data-room="room.roomId" />
              <TooltipRestriction
                class="restriction"
                v-if="day.restriction && anyRestriction(day.restriction)"
                :minStay="day.restriction?.minStay ?? 0"
                :maxStay="day.restriction?.maxStay ?? 0"
                :minStayArrival="day.restriction?.minStayArrival ?? 0"
                :maxStayArrival="day.restriction?.maxStayArrival ?? 0"
                :closed="day.restriction?.closed ?? false"
                :closedDeparture="day.restriction?.closedDeparture ?? false"
                :closedArrival="day.restriction?.closedArrival ?? false"
              />
              <div
                class="reservation"
                @dragover.prevent
                @dragenter.stop
                @dragleave.stop
                @drop.stop
                :draggable="isDraggable(day.reservationLines)"
                @dragstart="startDrag(day.date.getTime())"
                @click="
                  openReservation(
                    $event,
                    day.reservationLines ? day.reservationLines[0].folioId : 0,
                    day.reservationLines ? day.reservationLines[0].reservationId : 0
                  )
                "
                v-if="day.reservationLines && day.reservationLines.length > 0"
                :class="marginLeftFirstReservationLineClass(day.reservationLines[0])"
              >
                <div
                  class="border-left-splitted"
                  v-if="
                    day.reservationLines[0].previousLineSplitted &&
                    day.reservationLines[0].date.getTime() !== dateStart.getTime()
                  "
                  :style="{
                    'background-color': `${splittedReservationColor(day.reservationLines[0])}`,
                  }"
                />
                <div
                  class="border-right-splitted"
                  v-if="day.reservationLines[day.reservationLines.length - 1].nextLineSplitted"
                  :style="{
                    'background-color': `${splittedReservationColor(day.reservationLines[0])}`,
                  }"
                />
                <div
                  v-if="day.reservationLines[0].reservationType !== 'out'"
                  class="reservation-info-desktop"
                  :style="{
                    width: `${widthReservationInfoDesktop(day.reservationLines)}px`,
                    'padding-left': `${
                      day.reservationLines[0].date.getTime() === dateStart.getTime() &&
                      !day.reservationLines[0].isFirstNight
                        ? 30
                        : 0
                    }px`,
                  }"
                >
                  <div class="first">
                    <div
                      class="guest-name"
                      :style="{
                        'max-width': `${
                          day.reservationLines.length === 1
                            ? `${140}px`
                            : day.reservationLines.length === 2
                            ? `${210}px`
                            : day.reservationLines.length === 3
                            ? `${360}px`
                            : 'none'
                        }`,
                      }"
                    >
                      {{ day.reservationLines[0].partnerName }}
                    </div>
                    <div class="capacity">
                      <div>
                        {{
                          `${day.reservationLines[0].adults}${
                            day.reservationLines[0].children
                              ? `+${day.reservationLines[0].children}`
                              : ''
                          }`
                        }}
                      </div>
                      <img
                        :src="
                          day.reservationLines[0].adults > 1
                            ? '/app-images/icon-users-light-blue.svg'
                            : '/app-images/icon-user-light-blue.svg'
                        "
                      />
                    </div>
                  </div>
                  <div class="second" v-if="day.reservationLines[0].pendingPayment > 0">
                    <img src="/app-images/icon-euro-light.svg" />
                    <div class="not-paid" />
                  </div>
                </div>
                <div
                  v-else
                  class="out-of-service-info-mobile"
                  :style="{
                    'border-top-left-radius': `${
                      day.reservationLines[0].date.getTime() === dateStart.getTime() &&
                      !day.reservationLines[0].isFirstNight
                        ? 0
                        : 11
                    }px`,
                    'border-bottom-left-radius': `${
                      day.reservationLines[0].date.getTime() === dateStart.getTime() &&
                      !day.reservationLines[0].isFirstNight
                        ? 0
                        : 11
                    }px`,
                    'border-top-right-radius': `${
                      day.reservationLines[day.reservationLines.length - 1].date.getTime() ===
                      dateEnd.getTime()
                        ? 0
                        : 11
                    }px`,
                    'border-bottom-right-radius': `${
                      day.reservationLines[day.reservationLines.length - 1].date.getTime() ===
                      dateEnd.getTime()
                        ? 0
                        : 11
                    }px`,
                  }"
                >
                  <div class="text">
                    Fuera de servicio: {{ outOfServiceTypeName(day.reservationLines[0]) }}
                  </div>
                </div>
                <div
                  v-if="day.reservationLines[0].reservationType !== 'out'"
                  class="reservation-info-mobile"
                  :style="{
                    'padding-left': `${
                      day.reservationLines[0].date.getTime() === dateStart.getTime() &&
                      !day.reservationLines[0].isFirstNight
                        ? 16
                        : 6
                    }px`,
                  }"
                >
                  <div class="guest-name-mobile">
                    {{ day.reservationLines[0].partnerName }}
                  </div>
                </div>
                <div
                  v-else
                  class="out-of-service-info-desktop"
                  :style="{
                    border: `${
                      selectedReservation &&
                      day.reservationLines[0].reservationId === selectedReservation.id
                        ? '2px solid black'
                        : 'none'
                    }`,
                  }"
                >
                  <div class="text">
                    {{ outOfServiceTypeName(day.reservationLines[0]) }}
                  </div>
                </div>
                <div
                  :ref="
                    (el) => {
                      reservationLinesDivs[reservationLine.id] = el;
                    }
                  "
                  class="reservation-line"
                  :class="reservationLineClass(reservationLine)"
                  :id="`${reservationLine.reservationId}-${reservationLine.id}`"
                  v-for="(reservationLine, reservationLineIndex) in day.reservationLines"
                  :key="reservationLine.id"
                  :style="{
                    'border-top': borderTopReservationLine(reservationLine),
                    'border-bottom': borderBottomReservationLine(reservationLine),
                    'border-left': borderLeftReservationLine(reservationLine),
                    'border-right': borderRightReservationLine(reservationLine),
                    'background-color': reservationColor(reservationLine) ?? 'none',
                  }"
                  @drop="
                    dropAtBusyDate(
                      $event,
                      room.roomId,
                      reservationLine.date,
                      day.reservationLines ? day.reservationLines[0].reservationId : 0,
                      day.reservationLines ?? [],
                      index,
                      reservationLine.partnerName
                    )
                  "
                  @mousedown="
                    mouseDownStartDraggingReservationSlice(
                      $event,
                      reservationLine.reservationId,
                      reservationLineIndex,
                      day.reservationLines ?? []
                    )
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watchEffect,
  watch,
  type Ref,
  type ComponentPublicInstance,
} from 'vue';

import DatePicker from 'primevue/datepicker';

import type { PlanningReservationLineInterface } from '@/interfaces/PlanningReservationLineInterface';
import type { AvailabilityPlanRuleInterface } from '@/interfaces/AvailabilityPlanRuleInterface';
import type SplittedReservationBorderInterface from '@/interfaces/SplittedReservationBorderInterface';

import TooltipRestriction from '@/components/planningReservations/TooltipRestriction.vue';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';

import utilsDates, { localeSpain, ONE_DAY_IN_MS } from '@/utils/dates';
import utils from '@/utils/utils';
import { usePlanning } from '@/utils/usePlanning';

import { dialogService } from '@/services/DialogService';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    TooltipRestriction,
    CustomIcon,
    DatePicker,
  },
  props: {
    filteredRoomIds: {
      type: Array,
      required: true,
    },
    hideHorizontalScrollbar: {
      type: Boolean,
      required: false,
      default: false,
    },
    numPricesRulesToSave: {
      type: Number,
      required: true,
    },
  },
  emits: ['updateSelectedDate', 'hidePricelist', 'moveOneDayForward', 'moveOneDayBackward'],
  setup(props, context) {
    const store = useStore();
    const { refreshPlanning } = usePlanning();

    const colorList = ['blue', 'blueviolet', 'lime', 'gold', 'fuchsia', 'olive'];
    let oldWidth = window.innerWidth;

    const indexListColors = ref(0);
    // const qDateProxyPlanningReservations: Ref<QPopupProxy | null> = ref(null);

    const localeValue = ref(localeSpain);
    // const selectedQDate: Ref<string | null> = ref(null);
    const selectedDate = ref(new Date());
    const today: Ref<Date> = ref(new Date());
    today.value.setHours(0, 0, 0, 0);
    const mainSvg = ref(null);
    const reservationLinesDivs: Ref<(ComponentPublicInstance | Element | null)[]> = ref([]);
    const splittedReservationsBorders = ref([] as SplittedReservationBorderInterface[]);
    const topMiddle = ref(null as HTMLDivElement | null);
    const bottomMiddle = ref(null as HTMLDivElement | null);
    const bottomLeft = ref(null as HTMLDivElement | null);
    const reservationIdSelected = ref(-1);
    const reservationLineIndexSelected = ref(-1);
    const reservationLinesSelected = ref([] as PlanningReservationLineInterface[]);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const dateStartYear = computed(() => store.state.planning.dateStart.getFullYear());
    const dateStart = computed(() => store.state.planning.dateStart);
    const dateEnd = computed(() => store.state.planning.dateEnd);
    const planning = computed(() => store.state.planning.planning);
    const planningHeaders = computed(() => store.state.planning.planningHeaders);

    const selectedReservation = computed(() => store.state.reservations.currentReservation);

    const dateStartMonth = computed(
      () => localeValue.value.months[store.state.planning.dateStart.getMonth()]
    );

    const roomShortName = (roomId: number) => {
      const index = store.state.rooms.rooms.findIndex((el) => el.id === roomId);
      let result = 'no room name';
      if (index !== -1) {
        result = store.state.rooms.rooms[index].shortName;
      }
      return result;
    };

    const roomAmenityDefaultCode = (roomId: number) => {
      const room = store.state.rooms.rooms.find((el) => el.id === roomId);
      if (room && room.roomAmenityIds) {
        const amenities = store.state.amenities.amenities.filter(
          (el) => el.addInRoomName && room.roomAmenityIds?.includes(el.id)
        );
        return amenities.find((el) => el.addInRoomName)?.defaultCode ?? '';
      }
      return '';
    };

    const roomCapacity = (roomId: number) => {
      const index = store.state.rooms.rooms.findIndex((el) => el.id === roomId);
      let result = 0;
      if (index !== -1) {
        result = store.state.rooms.rooms[index].capacity;
      }
      return result;
    };

    const roomTypeDefaultCode = (roomTypeId: number) => {
      const index = store.state.roomTypes.roomTypes.findIndex((el) => el.id === roomTypeId);
      let result = 'no room type name';
      if (index !== -1) {
        result = store.state.roomTypes.roomTypes[index].defaultCode;
      }
      return result;
    };

    const classDate = (date: Date): string => {
      const yesterday = new Date(today.value);
      yesterday.setDate(today.value.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.value);
      tomorrow.setDate(today.value.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (date.toDateString() === today.value.toDateString()) {
        return 'date-today';
      }

      if (
        date.getTime() === yesterday.getTime() &&
        (yesterday.getDay() === 6 || yesterday.getDay() === 5)
      ) {
        return 'date-yesterday-weekend';
      }

      if (
        date.getTime() === tomorrow.getTime() &&
        (tomorrow.getDay() === 6 || tomorrow.getDay() === 5)
      ) {
        return 'date-tomorrow-weekend';
      }

      if (date.getDay() === 5 || date.getDay() === 6) {
        return 'date-weekend';
      }

      if (date.getTime() === yesterday.getTime()) {
        return 'date-yesterday';
      }

      if (date.toDateString() === tomorrow.toDateString()) {
        return 'date-tomorrow';
      }

      if (date.getDay() === 4) {
        return 'date-before-weekend';
      }

      if (date.getDay() === 0) {
        return 'date-after-weekend';
      }
      return '';
    };

    const anyRestriction = (restriction: AvailabilityPlanRuleInterface) =>
      restriction.closed ||
      restriction.closedDeparture ||
      restriction.closedArrival ||
      restriction.minStay ||
      restriction.maxStay ||
      restriction.minStayArrival ||
      restriction.maxStayArrival;

    const widthReservationLineDesktop = (line: PlanningReservationLineInterface) => {
      // first day to render
      if (line.date.getTime() === dateStart.value.getTime()) {
        // one night or first night and next splitted
        if (
          !((line.isFirstNight && line.isLastNight) || (line.isFirstNight && line.nextLineSplitted))
        ) {
          if (line.isFirstNight && !line.nextLineSplitted) {
            return 110; // from-past-first-night-continues
          }
          if (line.isLastNight || line.nextLineSplitted) {
            return 170; // from-past-next-splitted-or-last-night
          }
        }
        return 140; // full-cell
      }
      // last day to render
      if (line.date.getTime() === dateEnd.value.getTime()) {
        if (line.isFirstNight || line.previousLineSplitted) {
          return 103; // future-first-night-or-previous-splitted
        }
        return 140; // full-cell
      }
      // middle days
      if (
        (line.isFirstNight && line.isLastNight) ||
        (line.isFirstNight && line.nextLineSplitted) ||
        (line.isLastNight && line.previousLineSplitted) ||
        (line.previousLineSplitted && line.nextLineSplitted)
      ) {
        return 135; // full-cell-gap
      }
      if (line.isFirstNight) {
        return 103; // first-night-continues
      }
      if (line.previousLineSplitted && !line.nextLineSplitted) {
        return 103; // previous-splitted-next-not
      }
      if (line.isLastNight || line.previousLineSplitted || line.nextLineSplitted) {
        return 171; // last-night-or-previous-splitted-or-next-splitted
      }
      return 140; // full-width
    };

    const reservationLineClass = (line: PlanningReservationLineInterface) => {
      let result = '';

      if (line.date.getTime() === dateEnd.value.getTime()) {
        if (line.isFirstNight && line.isLastNight) {
          result += ' border-radius-left';
        } else if (line.isFirstNight) {
          result += ' border-radius-left';
        } else {
          result += '';
        }
      } else if (line.isFirstNight && line.isLastNight) {
        result += ' border-radius-all';
      } else if (line.isLastNight) {
        result += ' border-radius-right';
      } else if (line.isFirstNight) {
        result += ' border-radius-left';
      } else {
        result += '';
      }

      if (line.date.getTime() === dateStart.value.getTime()) {
        if (
          !((line.isFirstNight && line.isLastNight) || (line.isFirstNight && line.nextLineSplitted))
        ) {
          if (line.isFirstNight && !line.nextLineSplitted) {
            result += ' from-past-first-night-continues';
          } else if (line.isLastNight || line.nextLineSplitted) {
            result += ' from-past-next-splitted-or-last-night';
          } else {
            result += ' full-cell';
          }
        } else {
          result += ' full-cell';
        }
      } else if (line.date.getTime() === dateEnd.value.getTime()) {
        if (line.isFirstNight || line.previousLineSplitted) {
          result += ' future-first-night-or-previous-splitted';
        } else {
          result += ' full-cell';
        }
      } else if (
        (line.isFirstNight && line.isLastNight) ||
        (line.isFirstNight && line.nextLineSplitted) ||
        (line.isLastNight && line.previousLineSplitted) ||
        (line.previousLineSplitted && line.nextLineSplitted)
      ) {
        result += ' full-cell-gap';
      } else if (line.isFirstNight) {
        result += ' first-night-continues';
      } else if (line.previousLineSplitted && !line.nextLineSplitted) {
        result += 'previous-splitted-next-not-splitted';
      } else if (line.isLastNight || line.previousLineSplitted || line.nextLineSplitted) {
        result += ' last-night-or-previous-splitted-or-next-splitted';
      } else {
        result += ' full-cell';
      }
      return result;
    };

    const widthReservationInfoDesktop = (lines: PlanningReservationLineInterface[]) => {
      const width = lines.reduce((acc, val) => acc + widthReservationLineDesktop(val), 0);
      return width;
    };

    const marginLeftFirstReservationLine = (line: PlanningReservationLineInterface) => {
      // start
      if (line.date.getTime() === dateStart.value.getTime()) {
        // one night reservation with margin
        if (line.isFirstNight && line.isLastNight) {
          return 30;
        }
        // first night  more with less margin
        if (line.isFirstNight) {
          return 30;
        }
        // default
        return 0;
      }

      if (
        (line.isFirstNight && line.isLastNight) ||
        line.isFirstNight ||
        line.previousLineSplitted
      ) {
        return 35;
      }
      return 0;
    };

    const marginLeftFirstReservationLineClass = (line: PlanningReservationLineInterface) => {
      if (line.date.getTime() === dateStart.value.getTime()) {
        if (line.isFirstNight) {
          return 'margin-past'; // 30
        }
        return 'margin-none'; // 0
      }
      if (
        (line.isFirstNight && line.isLastNight) ||
        line.isFirstNight ||
        line.previousLineSplitted
      ) {
        return 'margin-left'; // 35
      }
      return 'margin-none'; // 0
    };

    const drawLinesBetweenSplittedReservations = () => {
      // console.log(colorList, indexListColors.value);

      splittedReservationsBorders.value = [];

      // reservation lines (date, nextLineSplitted, reservationId, reservationLineId)
      //        ordered by dates
      const reservationIdsAndLines = planning.value
        .map((room) =>
          room.dates
            .filter((date) => date.reservationLines.length > 0)
            .map((date) =>
              date.reservationLines.map((line) => ({
                date: line.date,
                nextLineSplitted: line.nextLineSplitted,
                reservationId: line.reservationId,
                reservationLineId: line.id,
              }))
            )
            .reduce((a, b) => a.concat(b), [])
        )
        .filter((el) => el.length > 0)
        .reduce((a, b) => a.concat(b), []);

      // unique reservation ids
      const reservationIds = Array.from(
        new Set(reservationIdsAndLines.map((el) => el.reservationId))
      );

      if (reservationIds) {
        reservationIds.forEach((el) => {
          const reservationLinesSameReservationId = reservationIdsAndLines
            .filter((line) => line.reservationId === el)
            .sort((a, b) => {
              if (new Date(a.date).getTime() > new Date(b.date).getTime()) {
                return 1;
              }
              return -1;
            });
          reservationLinesSameReservationId.forEach((line, index) => {
            if (line.nextLineSplitted) {
              const previousColor = splittedReservationsBorders.value.find(
                (b) => b.reservationId === line.reservationId
              )?.color;

              splittedReservationsBorders.value.push({
                reservationId: line.reservationId,
                reservationLineIdFrom: line.reservationLineId,
                reservationLineIdTo: reservationLinesSameReservationId[index + 1].reservationLineId,
                svgCoord: '',
                color: previousColor ?? colorList[indexListColors.value],
              });

              if (!previousColor) {
                indexListColors.value = (indexListColors.value + 1) % colorList.length;
              }
            }
          });
        });
        splittedReservationsBorders.value.forEach((border) => {
          const divLinesFrom = reservationLinesDivs.value
            .map((el) => el as HTMLDivElement)
            .filter(
              (el) => el && el.id === `${border.reservationId}-${border.reservationLineIdFrom}`
            );

          const divLinesTo = reservationLinesDivs.value
            .map((el) => el as HTMLDivElement)
            .filter(
              (el) => el && el.id === `${border.reservationId}-${border.reservationLineIdTo}`
            );
          if (mainSvg.value) {
            const offsetXSvg = (mainSvg.value as HTMLElement).getBoundingClientRect().x;
            const offsetYSvg = (mainSvg.value as HTMLElement).getBoundingClientRect().y;
            if (divLinesFrom[0] && divLinesTo[0]) {
              const divFrom = divLinesFrom[0];
              const divTo = divLinesTo[0];

              const x1 =
                divFrom.getBoundingClientRect().x +
                divFrom.getBoundingClientRect().width -
                offsetXSvg;

              const y1 =
                divFrom.getBoundingClientRect().y -
                offsetYSvg +
                divFrom.getBoundingClientRect().height / 2;

              const x2 =
                divFrom.getBoundingClientRect().x +
                divFrom.getBoundingClientRect().width -
                offsetXSvg +
                3;

              const y2 = y1;
              const x3 = x2;
              const y3 =
                divTo.getBoundingClientRect().y -
                offsetYSvg +
                divTo.getBoundingClientRect().height / 2;
              const x4 = divTo.getBoundingClientRect().x - offsetXSvg;
              const y4 = y3;
              border.svgCoord = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
            }
          }
        });
      }
    };

    const splittedReservationColor = (line: PlanningReservationLineInterface): string => {
      const border = splittedReservationsBorders.value.find(
        (el) => el.reservationId === line.reservationId
      );
      if (border) {
        return border.color;
      }
      return '';
    };

    const borderTopReservationLine = (line: PlanningReservationLineInterface) => {
      if (line.reservationId === selectedReservation.value?.id) {
        return '2px solid black';
      }
      if (line.splitted) {
        return `2px dotted ${splittedReservationColor(line)}`;
      }
      return 'none';
    };

    const borderBottomReservationLine = (line: PlanningReservationLineInterface) => {
      if (line.reservationId === selectedReservation.value?.id) {
        return '2px solid black';
      }
      if (line.splitted) {
        return `2px dotted ${splittedReservationColor(line)}`;
      }
      return 'none';
    };

    const borderLeftReservationLine = (line: PlanningReservationLineInterface) => {
      if (line.reservationId === selectedReservation.value?.id && line.isFirstNight) {
        return '2px solid #000000';
      }
      if (line.splitted && line.isFirstNight) {
        return `2px dotted ${splittedReservationColor(line)}`;
      }
      return 'none';
    };

    const borderRightReservationLine = (line: PlanningReservationLineInterface) => {
      if (line.reservationId === selectedReservation.value?.id && line.isLastNight) {
        return '2px solid #000000';
      }
      if (line.splitted && line.isLastNight) {
        return `2px dotted ${splittedReservationColor(line)}`;
      }
      return 'none';
    };

    const outOfServiceTypeName = (line: PlanningReservationLineInterface) => {
      let result = '';
      result =
        store.state.roomClosureReasons.roomClosureReasons.find(
          (el) => el.id === line.closureReasonId
        )?.name ?? '';
      return result;
    };

    const reservationColor = (reservation: PlanningReservationLineInterface) => {
      let result;

      if (store.state.properties.activeProperty?.colorOptionConfig === 'advanced') {
        if (reservation.state === 'confirm' || reservation.state === 'arrival_delayed') {
          result = store.state.properties.activeProperty?.confirmedReservationColor;
        }
        if (reservation.state === 'draft') {
          result = store.state.properties.activeProperty?.preReservationColor;
        }
        if (reservation.state === 'onboard' || reservation.state === 'departure_delayed') {
          if (reservation.pendingPayment > 0) {
            result = store.state.properties.activeProperty?.onBoardReservationColor;
          } else if (reservation.pendingPayment === 0) {
            result = store.state.properties.activeProperty?.paidCheckinReservationColor;
          }
        }
        if (reservation.state === 'done') {
          if (reservation.pendingPayment > 0) {
            result = store.state.properties.activeProperty?.outReservationColor;
          } else if (reservation.pendingPayment === 0) {
            result = store.state.properties.activeProperty?.paidReservationColor;
          }
        }
        if (reservation.toAssign === true) {
          result = store.state.properties.activeProperty?.toAssignReservationColor;
        }
        if (reservation.pendingPayment < 0) {
          result = store.state.properties.activeProperty?.overPaymentColor;
        }
        if (reservation.reservationType === 'staff') {
          result = store.state.properties.activeProperty?.staffReservationColor;
        }
      } else {
        if (reservation.state === 'cancel' || reservation.state === 'done') {
          result = store.state.properties.activeProperty?.simpleOutColor;
        }
        if (reservation.state === 'onboard' || reservation.state === 'departure_delayed') {
          result = store.state.properties.activeProperty?.simpleInColor;
        }
        if (
          reservation.state === 'confirm' ||
          reservation.state === 'arrival_delayed' ||
          reservation.state === 'draft'
        ) {
          result = store.state.properties.activeProperty?.simpleFutureColor;
        }
      }
      return result;
    };

    const openReservation = async (
      event: MouseEvent,
      selectedFolioId: number,
      selectedReservationId: number
    ) => {
      if (store.state.reservations.currentReservation?.id === selectedReservationId) {
        event.stopPropagation();
        return;
      }

      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolioTransactions', selectedFolioId),
          store.dispatch('folios/fetchFolioSaleLines', selectedFolioId),
          store.dispatch('folios/fetchFolioInvoices', selectedFolioId),
          store.dispatch('services/fetchServices', selectedReservationId),
          store.dispatch('reservationLines/fetchReservationLines', selectedReservationId),
          store.dispatch('checkinPartners/fetchCheckinPartners', selectedReservationId),
          store.dispatch('folios/fetchFolio', selectedFolioId),
          store.dispatch('reservations/fetchReservations', selectedFolioId),
          store.dispatch('reservations/fetchReservation', selectedReservationId),
        ]);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
      void store.dispatch('folios/setLastFolioFilters', null);
      void store.dispatch('layout/pricelistPlanningDisplayed', false);
      void store.dispatch('layout/rightDrawerDisplayed', true);
      void store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
    };

    const openOverbookingFolioList = async (folioDate: Date) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('folios/fetchFolios', {
          propertyId: store.state.properties.activeProperty?.id,
          filterByState: 14,
          dateStart: folioDate,
          dateEnd: folioDate,
        });
        await store.dispatch('layout/setRightDrawerFilter', 'overbookingReservations');
        void store.dispatch('folios/setLastFolioFilters', null);
        void store.dispatch('layout/pricelistPlanningDisplayed', false);
        void store.dispatch('layout/changeRightDrawerContent', 'FolioList');
        void store.dispatch('layout/rightDrawerDisplayed', true);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const closeRightDrawer = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
      void store.dispatch('reservations/setCurrentReservation', null);
      void store.dispatch('reservations/setCurrentReservations', null);
      void store.dispatch('folios/setCurrentFolio', null);
    };

    const moveToToday = () => {
      const moveTo = new Date();
      moveTo.setDate(moveTo.getDate() - 1);
      selectedDate.value = moveTo;
    };

    const onScreenResize = () => {
      window.addEventListener(
        'resize',
        utils.debounce(() => {
          if (oldWidth < 1024 && window.innerWidth >= 1024) {
            drawLinesBetweenSplittedReservations();
            context.emit('hidePricelist');
          }
          oldWidth = window.innerWidth;
        })
      );
    };

    const startDrag = (date: number) => {
      document.querySelectorAll(`[data-date-checkin='${date}']`).forEach((el) => {
        el.classList.add('target-date');
      });
    };

    const dragEnterCell = (event: DragEvent, roomId: number) => {
      document.querySelectorAll('.target').forEach((el) => {
        el.classList.remove('target');
      });
      document.querySelectorAll(`[data-room='${roomId}']`).forEach((el) => {
        el.classList.add('target');
      });
    };

    const dragEndCell = () => {
      document.querySelectorAll('.target').forEach((el) => {
        el.classList.remove('target');
      });
      document.querySelectorAll('.target-date').forEach((el) => {
        el.classList.remove('target-date');
      });
    };

    const mouseDownStartDraggingReservationSlice = (
      evt: MouseEvent,
      reservationId: number,
      reservationLineIndexSlice: number,
      reservationLines: PlanningReservationLineInterface[]
    ) => {
      reservationIdSelected.value = reservationId;
      reservationLineIndexSelected.value = reservationLineIndexSlice;
      reservationLinesSelected.value = reservationLines;
    };

    const isDraggable = (lines: PlanningReservationLineInterface[]) => {
      if (lines[0].reservationType === 'out') {
        return false;
      }
      if (lines[0].date.getTime() === dateStart.value.getTime() && !lines[0].isFirstNight) {
        return false;
      }
      if (lines[lines.length - 1].date.getTime() === dateEnd.value.getTime()) {
        return false;
      }
      return true;
    };

    const canBeAllocated = (targetDate: Date, targetRoomId: number) => {
      let result = true;
      // initial date of reservation moved
      const initialDateOfReservationAfterMove = new Date(
        targetDate.getTime() - ONE_DAY_IN_MS * reservationLineIndexSelected.value
      );

      // end date of reservation moved
      const endDateOfReservationAfterMove = new Date(
        initialDateOfReservationAfterMove.getTime() +
          ONE_DAY_IN_MS * (reservationLinesSelected.value.length - 1)
      );

      // dates to be checked if they're empty
      const rangeDatesChanging = utilsDates.getDatesRange(
        initialDateOfReservationAfterMove,
        endDateOfReservationAfterMove
      );

      rangeDatesChanging.forEach((l) => {
        const match = store.state.planning.reservationLines.find(
          (rl) =>
            rl.date.getTime() === l.getTime() &&
            rl.roomId === targetRoomId &&
            rl.reservationId !== reservationIdSelected.value
        );
        if (match) {
          result = false;
        }
      });
      return result;
    };

    const overlapsSameReservation = (dateTarget: Date) => {
      // get all the reservation lines of the reservation segment that is moving
      const allReservationLinesReservationId = store.state.planning.reservationLines
        .filter((el) => el.reservationId === reservationLinesSelected.value[0].reservationId)
        .sort((a, b) => {
          if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
            return -1;
          }
          return 1;
        });
      if (allReservationLinesReservationId.length === reservationLinesSelected.value.length) {
        return false;
      }
      // remove segment lines from previous set
      reservationLinesSelected.value.forEach((line) => {
        const index = allReservationLinesReservationId.findIndex((el) => el.id === line.id);
        if (index !== -1) {
          allReservationLinesReservationId.splice(index, 1);
        }
      });
      // add reservationlinesmoving with new dates
      const dateTemp = new Date(dateTarget);
      reservationLinesSelected.value
        .sort((a, b) => {
          if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
            return -1;
          }
          return 1;
        })
        .forEach((rls) => {
          allReservationLinesReservationId.push({
            id: rls.id,
            state: rls.state,
            date: new Date(dateTemp),
            roomId: rls.roomId,
            toAssign: rls.toAssign,
            splitted: rls.splitted,
            partnerName: rls.partnerName,
            folioId: rls.folioId,
            reservationId: rls.reservationId,
            reservationType: rls.reservationType,
            isFirstNight: rls.isFirstNight,
            isLastNight: rls.isLastNight,
            totalPrice: rls.totalPrice,
            pendingPayment: rls.pendingPayment,
            adults: rls.adults,
            nextLineSplitted: rls.nextLineSplitted,
            previousLineSplitted: rls.previousLineSplitted,
            closureReasonId: rls.closureReasonId,
            priceDayTotal: rls.priceDayTotal,
            priceDayTotalServices: 0,
            isReselling: rls.isReselling,
            children: rls.children,
          });
          dateTemp.setDate(dateTemp.getDate() + 1);
        });

      const min = allReservationLinesReservationId
        .map((el) => el.date)
        .reduce((a, b) => (a.getTime() < b.getTime() ? a : b));

      const max = allReservationLinesReservationId
        .map((el) => el.date)
        .reduce((a, b) => (a.getTime() > b.getTime() ? a : b));

      if (allReservationLinesReservationId.length !== utilsDates.daysBetween(min, max) + 1) {
        return true;
      }

      return false;
    };

    const isInRange = (targetDate: Date) => {
      let result = true;
      let movementForward = false;
      if (targetDate > reservationLinesSelected.value[reservationLineIndexSelected.value].date) {
        movementForward = true;
      }
      // build date to check if is in range
      const targetDateToCheckIfOut = new Date(targetDate);
      targetDateToCheckIfOut.setHours(0, 0, 0, 0);
      targetDateToCheckIfOut.setDate(
        movementForward
          ? targetDateToCheckIfOut.getDate() +
              (reservationLinesSelected.value.length - 1 - reservationLineIndexSelected.value)
          : targetDateToCheckIfOut.getDate() - reservationLineIndexSelected.value
      );
      // check if it is in range dates
      if (
        targetDateToCheckIfOut > store.state.planning.dateEnd ||
        targetDateToCheckIfOut < store.state.planning.dateStart
      ) {
        result = false;
      }
      return result;
    };

    const hasLinesOutOfRange = () => {
      let result = false;
      const { reservationId } = reservationLinesSelected.value[0];
      store.state.planning.reservationLines.forEach((line) => {
        if (
          (line.date.getTime() < store.state.planning.dateStart.getTime() ||
            line.date.getTime() > store.state.planning.dateEnd.getTime()) &&
          line.reservationId === reservationId
        ) {
          result = true;
        }
      });
      return result;
    };

    const dropAtEmptyDate = (roomIdTarget: number, targetDate: Date) => {
      if (overlapsSameReservation(targetDate)) {
        dialogService.open({
          header: 'Operación no permitida',
          content: 'De realizarse la operación, se generarían huecos o solapamientos.',
          btnAccept: 'Ok',
        });
        return;
      }
      if (hasLinesOutOfRange()) {
        dialogService.open({
          header: 'Operación no permitida',
          content:
            'No se pueden manejar reservas que no se muestren al completo en el rango de fechas visualizado.',
          btnAccept: 'Ok',
        });
        return;
      }
      if (!isInRange(targetDate)) {
        dialogService.open({
          header: 'Operación no permitida',
          content: 'No se puede mover una reserva fuera del rango visualizado.',
          btnAccept: 'Ok',
        });
        return;
      }
      if (!canBeAllocated(targetDate, roomIdTarget)) {
        dialogService.open({
          header: 'Operación no permitida',
          content: 'No hay espacio libre en la habitación destino.',
          btnAccept: 'Ok',
        });
      } else {
        dialogService.open({
          header: 'Confirmar operación',
          content: '¿Mover reserva?',
          btnAccept: 'Ok',
          btnCancel: 'Cancelar',
          onAccept: async () => {
            void store.dispatch('layout/showSpinner', true);
            try {
              await store.dispatch('planning/updateReservationLines', {
                reservationLines: reservationLinesSelected.value,
                roomIdTarget,
                dateTarget: targetDate,
                moreDays: reservationLineIndexSelected.value,
              });
              await refreshPlanning();
              if (store.state.reservations.currentReservation) {
                void store.dispatch(
                  'reservations/fetchReservation',
                  store.state.reservations.currentReservation.id
                );
                void store.dispatch(
                  'reservationLines/fetchReservationLines',
                  store.state.reservations.currentReservation.id
                );
              }
            } catch {
              dialogService.open({
                header: 'Error',
                content: 'Algo ha ido mal',
                btnAccept: 'Ok',
              });
            } finally {
              void store.dispatch('layout/showSpinner', false);
            }
          },
        });
      }
    };

    const dropAtBusyDate = (
      evt: DragEvent,
      roomIdTarget: number,
      targetDate: Date,
      reservationId: number,
      reservationLines: PlanningReservationLineInterface[],
      reservationLineIndex: number,
      partnerName: string
    ) => {
      if (hasLinesOutOfRange()) {
        dialogService.open({
          header: 'Operación no permitida',
          content:
            'No se pueden manejar reservas que no se muestren al completo en el rango de fechas visualizado.',
          btnAccept: 'Ok',
        });
        return;
      }
      // SWAP MOVEMENT
      if (reservationId !== reservationIdSelected.value) {
        // drop into other reservation and both have same start & end => swap
        dialogService.open({
          header: 'Confirmar operación',
          content: `
              ¿Intercambiar reservas? <br>
              Reserva a nombre de <b>${partnerName}</b>
              <ul>
                <li><u>checkin: ${reservationLines[0].date.toLocaleDateString()}</u></li>
                <li><u>checkout: ${reservationLines[
                  reservationLines.length - 1
                ].date.toLocaleDateString()}</u></li>
              </ul>
              Reserva a nombre de <b>${reservationLinesSelected.value[0].partnerName}</b>
              <ul>
                <li><u>checkin: ${reservationLinesSelected.value[0].date.toLocaleDateString()}</u></li>
                <li><u>checkout: ${reservationLinesSelected.value[
                  reservationLinesSelected.value.length - 1
                ].date.toLocaleDateString()}</u></li>
              </ul>`,
          btnAccept: 'Ok',
          btnCancel: 'Cancelar',
          onAccept: async () => {
            void store.dispatch('layout/showSpinner', true);
            try {
              await store.dispatch('planning/swapReservationLines', {
                pmsPropertyId: store.state.properties.activeProperty?.id,
                roomId: roomIdTarget,
                date: targetDate,
                targetReservationLineIds: reservationLinesSelected.value.map((el) => el.id),
                affectedReservationLineIds: reservationLines.map((el) => el.id),
              });
              await refreshPlanning();
              if (store.state.reservations.currentReservation) {
                void store.dispatch(
                  'reservations/fetchReservation',
                  store.state.reservations.currentReservation.id
                );
                void store.dispatch(
                  'reservationLines/fetchReservationLines',
                  store.state.reservations.currentReservation.id
                );
              }
            } catch {
              dialogService.open({
                header: 'Error',
                content: 'Algo ha ido mal',
                btnAccept: 'Ok',
              });
            } finally {
              void store.dispatch('layout/showSpinner', false);
            }
          },
        });

        return;
      }
      if (overlapsSameReservation(targetDate)) {
        dialogService.open({
          header: 'Operación no permitida',
          content: 'De realizarse la operación, se generarían huecos o solapamientos.',
          btnAccept: 'Ok',
        });
        return;
      }
      // HORIZONTAL/VERTICAL MOVEMENT (NOT SWAP)
      if (reservationId === reservationIdSelected.value) {
        // check if drag movement drop in the same cell
        if (reservationLineIndexSelected.value !== reservationLineIndex) {
          if (!isInRange(targetDate)) {
            dialogService.open({
              header: 'Operación no permitida',
              content: 'No se puede mover una reserva fuera del rango visualizado.',
              btnAccept: 'Ok',
            });
            return;
          }
          if (!canBeAllocated(targetDate, roomIdTarget)) {
            dialogService.open({
              header: 'Operación no permitida',
              content: 'No hay espacio libre en la habitación destino.',
              btnAccept: 'Ok',
            });
          } else {
            // confirm operation
            dialogService.open({
              header: 'Confirmar operación',
              content: '¿Mover reserva?',
              btnAccept: 'Ok',
              btnCancel: 'Cancelar',
              onAccept: async () => {
                // do the movement
                void store.dispatch('layout/showSpinner', true);
                try {
                  await store.dispatch('planning/updateReservationLines', {
                    reservationLines: reservationLinesSelected.value,
                    roomIdTarget,
                    dateTarget: targetDate,
                    moreDays: reservationLineIndexSelected.value,
                  });
                } catch {
                  dialogService.open({
                    header: 'Error',
                    content: 'Algo ha ido mal',
                    btnAccept: 'Ok',
                  });
                } finally {
                  void store.dispatch('layout/showSpinner', false);
                }
              },
            });
          }
        }
      }

      // stop event propagation
      evt.stopPropagation();
    };

    watch(selectedDate, async (newValue, oldValue) => {
      if (newValue) {
        if (props.numPricesRulesToSave > 0) {
          if (
            await new Promise((resolve) =>
              dialogService.open({
                header: 'Hay cambios sin guardar',
                content: 'Existen cambios sin guardar en el planning de precios y restricciones.',
                btnAccept: 'Descartar los cambios',
                btnCancel: 'Cancelar',
                onClose: () => resolve(true),
                onAccept: () => resolve(false),
              })
            )
          ) {
            selectedDate.value = oldValue;
            return;
          }
        }
        context.emit('updateSelectedDate', newValue);
      }
    });

    watchEffect(
      () => {
        splittedReservationsBorders.value = [];
        drawLinesBetweenSplittedReservations();
      },
      {
        flush: 'post', // the method run after html is changed
      }
    );

    onMounted(() => {
      window.addEventListener('resize', onScreenResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onScreenResize);
    });

    return {
      activeProperty,
      dateStartMonth,
      dateStartYear,
      planning,
      planningHeaders,
      selectedReservation,
      bottomMiddle,
      bottomLeft,
      topMiddle,
      classDate,
      roomShortName,
      roomAmenityDefaultCode,
      roomTypeDefaultCode,
      roomCapacity,
      anyRestriction,
      widthReservationLineDesktop,
      reservationLineClass,
      widthReservationInfoDesktop,
      marginLeftFirstReservationLine,
      marginLeftFirstReservationLineClass,
      borderTopReservationLine,
      borderBottomReservationLine,
      borderRightReservationLine,
      borderLeftReservationLine,
      splittedReservationColor,
      openOverbookingFolioList,
      selectedDate,
      dateStart,
      dateEnd,
      today,
      mainSvg,
      reservationLinesDivs,
      splittedReservationsBorders,
      drawLinesBetweenSplittedReservations,
      outOfServiceTypeName,
      reservationColor,
      localeValue,
      openReservation,
      closeRightDrawer,
      onScreenResize,
      startDrag,
      dragEndCell,
      dragEnterCell,
      moveToToday,
      mouseDownStartDraggingReservationSlice,
      isDraggable,
      reservationIdSelected,
      reservationLineIndexSelected,
      reservationLinesSelected,
      dropAtEmptyDate,
      dropAtBusyDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  .top {
    width: 100%;
    min-height: $header_mobile_height;
    display: flex;
    flex-direction: row;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);
    .top-left {
      min-width: $left_column_mobile_width;
      .top-left-content {
        font-size: 17px;
        display: flex;
        height: 100%;
        .left {
          display: flex;
          flex-direction: column-reverse;
          flex: 1 1 auto;
          padding-top: 0.5rem;
          .dummy-left {
            width: 100%;
            height: 35px;
            border-right: 1px solid $roomdoo_lightgray;
          }
          .first {
            display: none;
            position: relative;
            border-color: #d9d9d9;
            margin-bottom: 1rem;
          }
          .second {
            display: none;
            color: black;
            span {
              cursor: pointer;
              border: 1px solid #000000;
              border-radius: 7px;
              padding: 0.1rem 0.4rem 0.2rem 0.3rem;
            }
          }
        }
        .right {
          cursor: pointer;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.65rem 0 0.3rem;
          display: none;
          img {
            height: 15px;
          }
        }
      }
    }
    .top-middle {
      min-width: calc(100% - #{$left_column_mobile_width});
      scroll-padding: 0px 0px 0px 0px;
      overflow-y: scroll;
      overflow-x: hidden;
      .top-middle-content {
        height: 100%;
        display: flex;
        .date-header {
          height: 100%;
          min-width: $cell_mobile_width;
          border-left: none;
          border-right: 1px solid $roomdoo_lightgray;
          position: relative;
          .date {
            padding-top: 0.35rem;
            padding-left: 0.3rem;
            font-weight: bold;
            font-size: 18px;
            display: none;
          }
          .date-one-letter {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            position: relative;
            height: 16px;
            span {
              z-index: 2;
            }
            .date-dummy-border {
              position: absolute;
              top: 0;
              left: -1;
              width: calc(#{$cell_mobile_width});
              height: 30px;
              background-color: white;
              z-index: 1;
              &:last-child,
              &:first-child {
                width: calc(#{$cell_mobile_width} + 1px);
              }
            }
            &.today {
              color: $roomdoo_red;
            }
          }
          .date-month-day {
            font-size: 17px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            img {
              height: 15px;
              width: 15px;
              z-index: 2;
            }
            .circle {
              z-index: 2;
              border-radius: 50%;
              height: 22px;
              width: 22px;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0.9rem;
              &.today {
                background-color: $roomdoo_red;
                span {
                  color: white;
                }
              }
            }
          }
          .bill-free {
            padding: 0 0.3rem;
            justify-content: space-between;
            align-items: center;
            height: 30px;
            overflow: hidden;
            display: none;

            .bill {
              font-size: 17px;
            }
            .free-rooms {
              font-size: 15px;
              color: $primary;
            }
            .no-free-rooms {
              color: $roomdoo_red;
              font-size: 15px;
            }
          }
          .occupancy {
            height: 1px;
            width: 100%;
            background-color: #aadeff;
            position: relative;
            display: none;
            .occupancy-data {
              position: absolute;
              top: -1px;
              height: 3px;
              background-color: $primary;
            }
          }
          .date-info {
            font-size: 11px;
            display: flex;
            padding: 0.2rem;
            text-align: center;
            line-height: 9px;
          }
          .date-info-overbooking {
            background-color: $roomdoo_red;
            color: white;
            height: 24px;
            font-size: 11px;
            word-break: break-all;
            cursor: pointer;
            img {
              height: 12px;
              margin-right: 0.4rem;
              display: none;
            }
            span {
              font-weight: bold;
            }
          }
          .date-info-free-rooms {
            color: $roomdoo_green;
            font-size: 10px;
            font-weight: bold;
            width: 100%;
            text-align: center;
          }
          .date-occupation {
            width: 100%;
            height: 100%;
            padding-top: 5px;
            text-align: left;
            display: none;
          }
          &.date-today {
            border-right: 1px solid $roomdoo_red;
            .date {
              background-color: $roomdoo_red;
              color: white;
            }
          }
          &.date-yesterday,
          &.date-yesterday-weekend {
            border-right: 1px solid $roomdoo_red;
          }
          &.date-header:last-child {
            border-right: none;
          }
        }
      }
    }
    .top-right {
      width: 80px;
      align-items: center;
      cursor: pointer;
      .icon {
        display: none;
        margin-left: 0.65rem;
        rotate: 180deg;
      }
    }
  }
  .bottom {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex: 1 1 auto;
    overflow: hidden;
    .bottom-left {
      min-width: $left_column_mobile_width;
      border-right: 1px solid #d0d0d0;
      overflow-x: scroll;
      overflow-y: hidden;
      .bottom-left-content {
        .dummy {
          height: calc(#{$cell_mobile_height} / 2);
        }
        .room-left {
          height: $cell_mobile_height;
          width: 100%;
          position: relative;
          .line {
            position: absolute;
            width: 2px;
            height: 0;
            top: 50%;
            right: 0;
            z-index: 1;
            height: 1px;
            // background-color: $roomdoo_lightgray;
            background-color: red;
          }
          .room-info {
            padding-left: 0.2rem;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 11px;
            .name,
            .category-name {
              font-weight: bold;
            }
            .room-name {
              display: flex;
              flex-direction: row;
              .category-name {
                padding-left: 0.2rem;
              }
              .amenity-name {
                display: none;
                padding-left: 0.5rem;
              }
            }
            .room-code,
            .room-type-code {
              font-size: 11px;
            }
            .room-code {
              font-weight: bold;
            }
            .room-type-code {
              margin-left: 0.2rem;
            }
          }
          .room-capacity {
            color: #b3b3b3;
            display: flex;
            align-items: center;
            top: 85%;
            .capacity-image-mobile {
              margin-left: 0.2rem;
            }
            .capacity-image {
              display: none;
            }
          }
        }
      }
    }
    .bottom-middle {
      width: calc(100% - #{$left_column_mobile_width});
      height: 100%;
      overflow-x: scroll;
      position: relative;
      #main-svg {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 5;
        user-select: none;
        pointer-events: none;
        display: none;
      }

      .bottom-middle-content {
        .dummy-content {
          display: flex;
          .dummy {
            min-width: $cell_mobile_width;
            min-height: calc(#{$cell_mobile_height} / 2);
            border-right: 1px solid $roomdoo_lightgray;
            &.target-date {
              border-right: 5px solid grey !important;
            }
            &.date-today {
              border-right: 1px solid $roomdoo_red;
            }
            &.date-yesterday-weekend {
              border-right: 1px solid $roomdoo_red;
            }
            &.date-yesterday {
              border-right: 1px solid $roomdoo_red;
            }
            &:last-child {
              border-right: none;
            }
          }
        }
        .row-planning {
          display: flex;
          .cell-planning {
            border-left: none;
            border-right: 1px solid $roomdoo_lightgray;
            border-top: none;
            height: $cell_mobile_height;
            min-width: $cell_mobile_width;
            display: flex;
            align-items: center;
            position: relative;
            &.target-date {
              border-right: 5px solid grey !important;
            }

            &.source-date {
              border-right: 2px solid black;
            }
            .restriction {
              height: 100%;
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
              display: none;
            }
            .line {
              position: absolute;
              top: 50%;
              left: 0;
              z-index: 1;
              height: 1px;
              background-color: $roomdoo_lightgray;
              width: 100%;
              &.target {
                height: 10px;
                top: calc(50% - 5px);
              }
            }
            .reservation {
              z-index: 5;
              color: white;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
              transform: translate(0, 0);
              &.margin-none {
                margin: 0;
              }
              &.margin-past {
                margin: 10px;
              }
              &.margin-left {
                margin-left: 12px;
              }
              .border-left-splitted {
                pointer-events: none;
                position: absolute;
                left: 0;
                z-index: 2;
                height: 32px;
                width: 3px;
              }
              .border-right-splitted {
                pointer-events: none;
                position: absolute;
                right: 0;
                z-index: 2;
                height: 32px;
                width: 3px;
              }

              .reservation-info-mobile,
              .reservation-info-desktop {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 3;
              }
              .reservation-info-mobile {
                height: 28px;
                font-size: 11px;
                display: flex;
                align-items: center;
                max-width: 100%;
                padding-right: 6px;

                .guest-name-mobile {
                  overflow: hidden;
                  max-height: 28px;
                  line-height: 12px;
                  font-weight: bold;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                  text-overflow: ellipsis;
                  word-wrap: break-word;
                }
              }
              .reservation-info-desktop {
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-left: 0.5rem;
                display: none;
                .first {
                  width: calc(100% - 30px);
                  display: flex;
                  align-items: center;
                  .guest-name {
                    margin-left: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                  }
                  .capacity {
                    margin-left: 0.3rem;
                    font-size: 15px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    img {
                      margin-left: 0.1rem;
                      height: 12px;
                      width: 12px;
                    }
                  }
                }
                .second {
                  font-size: 15px;
                  font-weight: bold;
                  margin-right: 0.3rem;
                  display: flex;
                  position: relative;
                  img {
                    width: 15px;
                  }
                  .not-paid {
                    position: absolute;
                    top: -2px;
                    right: 5px;
                    height: 20px;
                    border-right: 1px solid #c1edf7;
                    transform: rotate(27deg);
                  }
                }
              }
              .out-of-service-info-mobile {
                position: absolute;
                top: 0;
                left: 0;
                height: 28px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 5;
                background: repeating-linear-gradient(
                  -45deg,
                  white 2px,
                  white 4px,
                  #abdefe 4px,
                  #abdefe 8px
                );
                border: 1px solid $roomdoo_blue;
                padding-right: 3px;
                .text {
                  padding-left: 6px;
                  width: 100%;
                  color: $roomdoo_dark_blue;
                  font-size: 10px;
                  overflow: hidden;
                  max-height: 28px;
                  line-height: 12px;
                  max-width: 100%;
                  font-weight: bold;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                  text-overflow: ellipsis;
                }
                &.border-radius-left {
                  border-radius: 11px 0 0 11px;
                }
                &.border-radius-right {
                  border-radius: 0 11px 11px 0;
                }
                &.border-radius-all {
                  border-radius: 11px;
                }
              }
              .out-of-service-info-desktop {
                position: absolute;
                top: 0;
                left: 0;
                height: 32px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 5;
                background: repeating-linear-gradient(
                  -45deg,
                  white 2px,
                  white 4px,
                  #abdefe 4px,
                  #abdefe 8px
                );
                display: none;
                text-align: center;
                padding-right: 6px;
                padding-left: 6px;
                .text {
                  padding-left: 6px;
                  padding-right: 6px;
                  line-height: 18px;
                  color: $roomdoo_dark_blue;
                  font-size: 15px;
                  color: $roomdoo_blue;
                  font-weight: bold;
                  background-color: white;
                  text-transform: uppercase;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;

                  width: auto;
                  height: 20px;
                }
              }

              .reservation-line {
                width: 134px;
                height: 28px;
                position: relative;

                &.from-past-first-night-continues {
                  width: 39px;
                }

                &.from-past-next-splitted-or-last-night {
                  width: 60px;
                }
                &.full-cell {
                  width: 50px;
                }
                &.future-first-night-or-previous-splitted {
                  width: 38px;
                }
                &.full-cell-gap {
                  width: 48px;
                }
                &.first-night-continues {
                  width: 38px;
                }
                &.previous-splitted-next-not-splitted {
                  width: 38px;
                }
                &.last-night-or-previous-splitted-or-next-splitted {
                  width: 60px;
                }
                &.border-radius-left {
                  border-radius: 11px 0 0 11px;
                }
                &.border-radius-right {
                  border-radius: 0 11px 11px 0;
                }
                &.border-radius-all {
                  border-radius: 11px;
                }
              }
            }
            &.date-today {
              border-right: 1px solid $roomdoo_red;
            }
            &.date-yesterday-weekend {
              border-right: 1px solid $roomdoo_red;
            }
            &.date-yesterday {
              border-right: 1px solid $roomdoo_red;
            }
            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
  }
}

@media (min-width: 1024px) {
  $cell_width: 140px;
  .main-container {
    .top {
      min-height: $header_desktop_height;
      background-color: #f8f8f8;
      margin-left: 1rem;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);
      z-index: 2;
      .top-left {
        min-width: $left_column_desktop_width;
        border-right: 2px solid #d9d9d9;
        .top-left-content {
          padding-left: 2.5rem;

          .left {
            flex-direction: column;
            .dummy-left {
              display: none;
            }
            .first,
            .second {
              display: block;
              span {
                font-size: 15px;
              }
            }
          }
          .right {
            display: flex;
          }
        }
      }
      .top-middle {
        min-width: calc(100% - #{$left_column_desktop_width} - 80px - 10px);
        border-right: 2px solid #d9d9d9;

        .top-middle-content {
          padding-right: 8px;
          .date-header {
            min-width: $cell_desktop_width;
            border-right: 2px solid #d9d9d9;
            .date {
              display: block;
            }
            .date-one-letter,
            .date-month-day {
              display: none;
            }
            .bill-free {
              display: flex;
            }
            .occupancy {
              display: block;
            }
            .date-info {
              padding-left: 0.5rem;
              padding-top: 0.5rem;
            }
            .date-info-free-rooms {
              display: none;
            }
            .date-info-overbooking {
              height: 37px;
              font-size: 13px;
              text-transform: uppercase;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              img {
                display: inline;
              }
            }
            .date-occupation {
              display: block;
            }
            .date-info-free-rooms {
              display: none;
            }
            &.date-today,
            &.date-yesterday-weekend,
            &.date-yesterday {
              border-right: 2px solid $roomdoo_red;
            }
            &.date-weekend,
            &.date-tomorrow-weekend,
            &.date-before-weekend {
              border-right: 2px solid #808080;
            }
            &.date-weekend,
            &.date-tomorrow-weekend,
            &.date-yesterday-weekend {
              .date {
                background-color: #808080;
                color: white;
              }
            }
          }
        }
      }
      .top-right {
        min-width: 80px !important;
        display: flex;
        margin-left: 2px;
        .icon {
          display: flex;
        }
      }
    }
    .bottom {
      background-color: white;
      margin-left: 1rem;

      .bottom-left {
        width: 235px;
        border-right: 2px solid #d9d9d9;
        padding-left: 2.5rem;
        &::-webkit-scrollbar:horizontal {
          height: 0;
          width: 0;
          display: none;
        }
        &::-webkit-scrollbar-thumb:horizontal {
          display: none;
        }
        .bottom-left-content {
          // height: 900px;
          .dummy {
            height: calc(#{$cell_desktop_height} / 2);
          }
          .room-left {
            height: $cell_desktop_height;
            font-size: 17px;
            padding-right: 2.5rem;
            .line {
              display: none;
            }
            .room-info {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              padding-left: 0;
              font-size: 17px;
              .room-name {
                .amenity-name {
                  display: block;
                }
                .category-name {
                  padding-left: 0.5rem;
                }
              }
              .room-capacity {
                position: static;
                .capacity-image {
                  display: flex;
                  margin-left: 0.2rem;
                  margin-bottom: 1px;
                }
                .capacity-image-mobile {
                  display: none;
                }
              }
            }
            &:last-child {
              margin-bottom: 8px;
            }
          }
        }
      }
      .bottom-middle {
        width: calc(100% - #{$left_column_desktop_width} - 80px - 2px);
        border-right: 2px solid #d9d9d9;
        background-color: white;
        &.hide-horizontal-scrollbar {
          &::-webkit-scrollbar:horizontal {
            height: 0;
            width: 0;
            display: none;
          }
          &::-webkit-scrollbar-thumb:horizontal {
            display: none;
          }
        }
        #main-svg {
          display: block;
        }
        .bottom-middle-content {
          .dummy-content {
            .dummy {
              min-width: $cell_desktop_width;
              min-height: calc(#{$cell_desktop_height} / 2);
              border-right: 2px solid #d9d9d9;
            }
          }
          .row-planning {
            .cell-planning {
              width: $cell_desktop_width;
              height: $cell_desktop_height;
              min-width: $cell_desktop_width;
              border-right: 2px solid #d9d9d9;
              .restriction {
                display: block;
              }
              .reservation {
                cursor: pointer;
                &.margin-none {
                  margin: 0;
                }
                &.margin-past {
                  margin: 30px;
                }
                &.margin-left {
                  margin-left: 35px;
                }
                .border-left-splitted,
                .border-right-splitted {
                  height: 36px;
                  width: 4px;
                }
                .reservation-info-desktop {
                  display: flex;
                }
                .out-of-service-info-desktop {
                  display: flex;
                }
                .out-of-service-info-mobile {
                  display: none;
                }
                .reservation-info-mobile {
                  display: none;
                }
                .reservation-line {
                  height: 32px;
                  &.from-past-first-night-continues {
                    width: 110px;
                  }
                  &.from-past-next-splitted-or-last-night {
                    width: 170px;
                  }
                  &.full-cell {
                    width: 140px;
                  }
                  &.future-first-night-or-previous-splitted {
                    width: 103px;
                  }
                  &.full-cell-gap {
                    width: 135px;
                  }
                  &.first-night-continues {
                    width: 103px;
                  }
                  &.previous-splitted-next-not-splitted {
                    width: 103px;
                  }
                  &.last-night-or-previous-splitted-or-next-splitted {
                    width: 171px;
                  }
                  &.border-radius-left {
                    border-radius: 15px 0 0 15px;
                  }
                  &.border-radius-right {
                    border-radius: 0 15px 15px 0;
                  }
                  &.border-radius-all {
                    border-radius: 15px;
                  }
                }
              }
            }
          }
          .dummy-content > .dummy,
          .row-planning > .cell-planning {
            &.date-today,
            &.date-yesterday,
            &.date-yesterday-weekend {
              border-right-width: 2px;
            }
            &.date-tomorrow-weekend,
            &.date-weekend,
            &.date-before-weekend {
              border-color: #808080;
            }
          }
        }
      }
    }
  }
}
</style>
