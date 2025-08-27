<template>
  <div class="content">
    <div class="room-type-names" ref="roomNamesElement" id="room-type-names">
      <div
        class="room-left"
        :class="{ hidden: !roomTypeIdsToFilter.includes(el.roomTypeId) }"
        v-for="el in planningPricesRules"
        :key="el.roomTypeId"
        :style="{
          'min-height': `${70 + numRulesToView * 20}px`,
        }"
      >
        <div class="room-info">
          <div class="room-type-name">
            {{ roomTypeDefaultCode(el.roomTypeId) }}
          </div>
          <div class="room-type-number">{{ numberOfRoomsByType(el.roomTypeId) }} hab.</div>
        </div>
      </div>
      <div
        class="gap"
        v-if="pricelistItemsToSave.length > 0 || availabilityPlanRulesToSave.length > 0"
      />
    </div>
    <div class="calendar" ref="calendarElement" id="calendar-pricelists">
      <div
        class="row-planning"
        v-for="(el, indexRoomType) in planningPricesRules"
        :key="el.roomTypeId"
        :class="{ hidden: !roomTypeIdsToFilter.includes(el.roomTypeId) }"
      >
        <div
          class="date"
          :class="classDate(item.date)"
          v-for="(item, indexDay) in el.dates"
          :key="`${indexDay}-${el.roomTypeId}`"
          :id="`${indexDay}-${el.roomTypeId}`"
          :style="{
            'min-height': `${70 + numRulesToView * 20}px`,
          }"
        >
          <CellPricelistItemAvailabilityPlanRule
            :indexDay="indexDay"
            :indexRoomType="indexRoomType"
            :roomTypeIdsToFilter="roomTypeIdsToFilter"
            :freeRooms="item.freeRooms"
            :roomTypeId="el.roomTypeId"
            :date="item.date"
            :pricelistItemId="item.pricelistItemId"
            :availabilityPlanRuleId="item.availabilityPlanRuleId"
            :initialPrice="item.price"
            :initialQuota="item.quota"
            :initialMaxAvail="item.maxAvail"
            :initialMinStay="item.minStay"
            :initialMaxStay="item.maxStay"
            :initialMinStayArrival="item.minStayArrival"
            :initialMaxStayArrival="item.maxStayArrival"
            :initialClosed="item.closed"
            :initialClosedArrival="item.closedArrival"
            :initialClosedDeparture="item.closedDeparture"
            :reset="reset"
            @updatePriceListItem="updatePriceListItem($event)"
            @updateAvailabilityPlanRule="updateAvailabilityPlanRule($event)"
            @resetAvailabilityPlanRule="resetAvailabilityPlanRule($event)"
            @resetPriceListItem="resetPriceListItem($event)"
            @reset="resetCell"
            @errorAvailabilityPlanRule="setErrorAvailabilityPlanRule($event)"
            @errorPricelistItem="setErrorPricelistItem($event)"
          />
        </div>
      </div>
      <AppButton
        :pt="{
          label: {
            style: {
              fontWeight: 'bold',
            },
          },
        }"
        v-if="
          pricelistItemsToSave.length > 0 ||
          availabilityPlanRulesToSave.length > 0 ||
          errorsPricelistItems.length > 0 ||
          errorsAvailabilityPlanRules.length > 0
        "
        label="DESCARTAR"
        raised
        size="small"
        severity="secondary"
        @click="discardChanges"
        class="btn-cancel-changes"
      />
      <AppButton
        :pt="{
          label: {
            style: {
              fontWeight: 'bold',
            },
          },
        }"
        v-if="
          pricelistItemsToSave.length > 0 ||
          availabilityPlanRulesToSave.length > 0 ||
          errorsPricelistItems.length > 0 ||
          errorsAvailabilityPlanRules.length > 0
        "
        label="GUARDAR CAMBIOS"
        raised
        size="small"
        severity="secondary"
        @click="persistChanges"
        class="btn-save-changes"
      />
      <div
        class="gap"
        v-if="
          pricelistItemsToSave.length > 0 ||
          availabilityPlanRulesToSave.length > 0 ||
          errorsPricelistItems.length > 0 ||
          errorsAvailabilityPlanRules.length > 0
        "
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, type Ref } from 'vue';
import Button from 'primevue/button';

import { type PricelistItemInterface } from '@/_legacy/interfaces/PricelistItemInterface';
import { type AvailabilityPlanRuleInterface } from '@/_legacy/interfaces/AvailabilityPlanRuleInterface';
import CellPricelistItemAvailabilityPlanRule from './CellPricelistItemAvailabilityPlanRule.vue';

import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    AppButton: Button,
    CellPricelistItemAvailabilityPlanRule,
  },
  emits: ['updateScrollLeft', 'numPricesRulesToSave'],
  props: {
    roomTypeIds: {
      type: Array,
      required: true,
    },
    roomTypeClassIds: {
      type: Array,
      required: true,
    },
  },
  setup(props, context) {
    const store = useStore();

    let contReset = 0;

    const reset = ref(false);
    const today: Ref<Date> = ref(new Date());
    today.value.setHours(0, 0, 0, 0);
    const syncScroll = ref(true);
    const roomNamesElement: Ref<null | HTMLElement> = ref(null);
    const calendarElement: Ref<null | HTMLElement> = ref(null);
    const pricelistItemsToSave = ref([] as PricelistItemInterface[]);
    const availabilityPlanRulesToSave = ref([] as AvailabilityPlanRuleInterface[]);
    const errorsPricelistItems = ref([] as { roomTypeId: number; date: Date }[]);
    const errorsAvailabilityPlanRules = ref([] as { roomTypeId: number; date: Date }[]);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activePricelist = computed(() => store.state.pricelists.activePricelist);
    const dateStart = computed(() => store.state.planning.dateStart);
    const dateEnd = computed(() => store.state.planning.dateEnd);
    const planningPricesRules = computed(() => store.state.planning.planningPricesRules);

    const activeAvailabilityPlan = computed(
      () => store.state.availabilityPlans.activeAvailabilityPlan
    );

    const roomTypeIdsToFilter = computed(() => {
      let roomTypeIdsFilteredByRoomType;
      if (props.roomTypeIds.length !== 0) {
        roomTypeIdsFilteredByRoomType = store.state.roomTypes.roomTypes
          .filter((el) => props.roomTypeIds.includes(el.id))
          .map((el) => el.id);
      } else {
        roomTypeIdsFilteredByRoomType = store.state.roomTypes.roomTypes.map((el) => el.id);
      }
      let roomTypeIdsFilteredByRoomTypeClass;
      if (props.roomTypeClassIds.length !== 0) {
        roomTypeIdsFilteredByRoomTypeClass = store.state.roomTypes.roomTypes
          .filter((el) => props.roomTypeClassIds.includes(el.classId))
          .map((el) => el.id);
      } else {
        roomTypeIdsFilteredByRoomTypeClass = store.state.roomTypes.roomTypes.map((el) => el.id);
      }
      const roomTypeIdsWithRooms = store.state.roomTypes.roomTypes
        .filter((el) => store.state.rooms.rooms.map((r) => r.roomTypeId).includes(el.id))
        .map((el) => el.id);

      const setA = new Set(roomTypeIdsFilteredByRoomType);
      const setB = new Set(roomTypeIdsFilteredByRoomTypeClass);
      const setC = new Set(roomTypeIdsWithRooms);
      const resultIds = new Set([...setA].filter((x) => setB.has(x)));
      return Array.from(new Set([...resultIds].filter((x) => setC.has(x))));
    });

    const numRulesToView = computed(
      () => store.state.user.activeUser?.availabilityRuleFields?.length || 0
    );

    const roomTypes = computed(() =>
      store.state.roomTypes.roomTypes.filter((rt) => roomTypeIdsToFilter.value.includes(rt.id))
    );

    const scrollCalendar = (evt: Event) => {
      if (syncScroll.value) {
        context.emit('updateScrollLeft', (evt.target as HTMLElement).scrollLeft);
      }
      if (roomNamesElement.value) {
        roomNamesElement.value.scrollTop = (evt.target as HTMLElement).scrollTop;
      }
    };

    const numberOfRoomsByType = (roomTypeId: number) =>
      store.state.rooms.rooms.filter((el) => el.roomTypeId === roomTypeId).length;

    const roomTypeDefaultCode = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.defaultCode ?? '';

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
        (yesterday.getDay() === 5 || yesterday.getDay() === 6)
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

    // modify/create pricelist item
    const updatePriceListItem = (item: PricelistItemInterface) => {
      // find error index
      const errorIndex = errorsPricelistItems.value.findIndex(
        (el) => el.roomTypeId === item.roomTypeId && el.date.getTime() === item.date.getTime()
      );
      // clear error
      if (errorIndex !== -1) {
        errorsPricelistItems.value.splice(errorIndex, 1);
      }
      // find item index
      const index = pricelistItemsToSave.value.findIndex(
        (el) => el.roomTypeId === item.roomTypeId && el.date.getTime() === item.date.getTime()
      );
      // update/create item to change
      if (index !== -1) {
        pricelistItemsToSave.value[index].price = item.price;
      } else {
        pricelistItemsToSave.value.push(item);
      }
    };
    // modify/create availability plan rule
    const updateAvailabilityPlanRule = (rule: AvailabilityPlanRuleInterface) => {
      // find error index
      const errorIndex = errorsAvailabilityPlanRules.value.findIndex(
        (el) => el.roomTypeId === rule.roomTypeId && el.date.getTime() === rule.date.getTime()
      );
      // clear error
      if (errorIndex !== -1) {
        errorsAvailabilityPlanRules.value.splice(errorIndex, 1);
      }
      // find rule index
      const index = availabilityPlanRulesToSave.value.findIndex(
        (el) => el.roomTypeId === rule.roomTypeId && el.date.getTime() === rule.date.getTime()
      );
      // update/create rule to change
      if (index !== -1) {
        availabilityPlanRulesToSave.value[index] = rule;
      } else {
        availabilityPlanRulesToSave.value.push(rule);
      }
    };

    // reset pricelist item
    const resetPriceListItem = (item: PricelistItemInterface) => {
      // find error index
      const errorIndex = errorsPricelistItems.value.findIndex(
        (el) => el.roomTypeId === item.roomTypeId && el.date.getTime() === item.date.getTime()
      );
      // clear error
      if (errorIndex !== -1) {
        errorsPricelistItems.value.splice(errorIndex, 1);
      }
      // find item index
      const index = pricelistItemsToSave.value.findIndex(
        (el) => el.roomTypeId === item.roomTypeId && el.date.getTime() === item.date.getTime()
      );
      // reset item
      if (index !== -1) {
        pricelistItemsToSave.value.splice(index, 1);
      }
    };

    // reset availability plan rule
    const resetAvailabilityPlanRule = (rule: AvailabilityPlanRuleInterface) => {
      // find error index
      const errorIndex = errorsAvailabilityPlanRules.value.findIndex(
        (el) => el.roomTypeId === rule.roomTypeId && el.date.getTime() === rule.date.getTime()
      );
      // clear error
      if (errorIndex !== -1) {
        errorsAvailabilityPlanRules.value.splice(errorIndex, 1);
      }
      // find rule index
      const index = availabilityPlanRulesToSave.value.findIndex(
        (el) => el.roomTypeId === rule.roomTypeId && el.date.getTime() === rule.date.getTime()
      );
      // reset rule
      if (index !== -1) {
        availabilityPlanRulesToSave.value.splice(index, 1);
      }
    };

    const discardChanges = async () => {
      // reset all changes
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('planning/fetchPlanningPricesRules', {
        dateStart: store.state.planning.dateStart,
        dateEnd: store.state.planning.dateEnd,
        propertyId: store.state.properties.activeProperty?.id,
        availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        pricelistId: store.state.pricelists.activePricelist?.id,
      });
      void store.dispatch('layout/showSpinner', false);
      pricelistItemsToSave.value = [];
      availabilityPlanRulesToSave.value = [];
      errorsPricelistItems.value = [];
      errorsAvailabilityPlanRules.value = [];
      reset.value = true;
    };

    const resetCell = () => {
      /**
       * If all cells are reset, reset button is disabled
       * and reset value is set to false
       */
      contReset += 1;
      if (
        contReset ===
        planningPricesRules.value.length * planningPricesRules.value[0].dates.length
      ) {
        reset.value = false;
        contReset = 0;
      }
    };

    const setErrorPricelistItem = (error: { roomTypeId: number; date: Date }) => {
      // check if error already exists
      const index = errorsPricelistItems.value.findIndex(
        (el) => el.roomTypeId === error.roomTypeId && el.date.getTime() === error.date.getTime()
      );
      // if not, add it
      if (index === -1) {
        errorsPricelistItems.value.push(error);
      }
    };

    const setErrorAvailabilityPlanRule = (error: { roomTypeId: number; date: Date }) => {
      // check if error already exists
      const index = errorsAvailabilityPlanRules.value.findIndex(
        (el) => el.roomTypeId === error.roomTypeId && el.date.getTime() === error.date.getTime()
      );
      // if not, add it
      if (index === -1) {
        errorsAvailabilityPlanRules.value.push(error);
      }
    };

    const persistChanges = async () => {
      void store.dispatch('layout/showSpinner', true);
      if (pricelistItemsToSave.value.length > 0) {
        await store.dispatch('pricelists/createOrUpdatePricelistItems', {
          pricelistId: store.state.pricelists.activePricelist?.id,
          pricelistItems: pricelistItemsToSave.value.map((el) => ({
            ...el,
            date: `${el.date.getFullYear()}-${(el.date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${el.date.getDate().toString().padStart(2, '0')}`,
            pricelistId: store.state.pricelists.activePricelist?.id,
            pmsPropertyId: store.state.properties.activeProperty?.id,
          })),
        });
      }
      if (availabilityPlanRulesToSave.value.length > 0) {
        await store.dispatch('availabilityPlans/createOrUpdateAvailabilityPlanRules', {
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          availabilityPlanRules: availabilityPlanRulesToSave.value.map((el) => ({
            ...el,
            date: `${el.date.getFullYear()}-${(el.date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${el.date.getDate().toString().padStart(2, '0')}`,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
            pmsPropertyId: store.state.properties.activeProperty?.id,
          })),
        });
        await store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        });
      }
      await store.dispatch('planning/fetchPlanningPricesRules', {
        dateStart: store.state.planning.dateStart,
        dateEnd: store.state.planning.dateEnd,
        propertyId: store.state.properties.activeProperty?.id,
        availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        pricelistId: store.state.pricelists.activePricelist?.id,
      });

      pricelistItemsToSave.value = [];
      availabilityPlanRulesToSave.value = [];
      void store.dispatch('layout/showSpinner', false);
    };

    watch(dateStart, async () => {
      await discardChanges();
    });

    watch(
      [pricelistItemsToSave, availabilityPlanRulesToSave],
      () => {
        context.emit(
          'numPricesRulesToSave',
          pricelistItemsToSave.value.length + availabilityPlanRulesToSave.value.length
        );
      },
      { deep: true }
    );

    return {
      activeProperty,
      activePricelist,
      activeAvailabilityPlan,
      dateStart,
      dateEnd,
      roomTypeIdsToFilter,
      numberOfRoomsByType,
      scrollCalendar,
      today,
      classDate,
      roomTypes,
      numRulesToView,
      roomNamesElement,
      calendarElement,
      reset,
      roomTypeDefaultCode,
      planningPricesRules,
      updatePriceListItem,
      updateAvailabilityPlanRule,
      resetPriceListItem,
      resetAvailabilityPlanRule,
      pricelistItemsToSave,
      availabilityPlanRulesToSave,
      discardChanges,
      resetCell,
      errorsPricelistItems,
      errorsAvailabilityPlanRules,
      setErrorAvailabilityPlanRule,
      setErrorPricelistItem,
      persistChanges,
    };
  },
});
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  width: calc(100% - 65px);
  .gap {
    margin-bottom: 3.5rem;
  }
  .room-type-names {
    overflow-y: hidden;
    overflow-x: scroll;
    height: 100%;
    padding-left: 2.5rem;
    min-width: 235px;
    border-right: 2px solid #d9d9d9;
    .room-left {
      display: flex;
      align-items: center;
      width: 100%;
      .room-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        .room-type-name {
          font-size: 17px;
          font-weight: bold;
        }
        .room-type-number {
          padding-right: 2.5rem;
          font-size: 16px;
        }
      }
      &:last-child {
        margin-bottom: 18px;
      }
    }
  }
  .calendar {
    width: calc((140px * 26));
    overflow: scroll;
    .row-planning {
      display: flex;
      max-width: 900px;
      .date {
        min-width: 140px;
        padding: 0.3rem;
        border-right: 2px solid #d9d9d9;
        &.date-today,
        &.date-yesterday-weekend,
        &.date-yesterday {
          border-right: 2px solid $roomdoo_red;
        }
        &.date-tomorrow-weekend,
        &.date-weekend,
        &.date-before-weekend {
          border-right-color: #808080;
        }
        &:last-child {
          border-right: none;
        }
      }
    }
    .btn-save-changes {
      font-weight: bold !important;
      color: white;
      background-color: $primary;
      border-radius: 10px;
      height: 3rem;
      width: 20rem;
      margin-top: 20px;
      position: absolute;
      overflow-x: auto;
      right: 50px;
      bottom: 13px;
      &:hover {
        background-color: $corduroy;
      }
    }
    .btn-cancel-changes {
      font-weight: bold !important;
      color: $primary;
      background-color: white;
      border-radius: 10px;
      border: 1px solid #01b6e3;
      height: 3rem;
      width: 15rem;
      margin-top: 20px;
      position: absolute;
      overflow-x: auto;
      right: 400px;
      bottom: 13px;
      &:hover {
        background-color: $corduroy;
      }
    }
  }
}
</style>
