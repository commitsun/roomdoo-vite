<template>
  <div
    class="pricelist-restriction-date"
    @mouseenter="showEditOption = true"
    @mouseleave="showEditOption = false"
    :class="{ active: showAdvancedPricelistItem }"
  >
    <!-- PRICE -->
    <div
      class="pricelist-avail-rule-item-row"
      :class="validator.price.$error ? 'not-valid' : price !== initialPrice ? 'modified' : ''"
    >
      <div class="price">
        <input
          type="number"
          step="any"
          class="price-input"
          v-model="price"
          @input="updatePrice"
          :class="{ active: showAdvancedPricelistItem }"
        />
        <span class="currency"> € </span>
      </div>
      <div v-if="!showEditOption" class="free-rooms" :class="freeRooms === 0 ? 'full' : ''">
        {{ `${freeRooms === 0 ? 'Lleno' : `${freeRooms} libre${freeRooms > 1 ? 's' : ''}`}` }}
      </div>
      <div v-else @click="toogleAdvancedPricelistItem">
        <CustomIcon
          imagePath="/app-images/icon-edit.svg"
          class="icon-edit"
          color="primary"
          width="17px"
          height="17px"
        />
      </div>
    </div>
    <hr :class="(quota === 0 || maxAvail === 0 || closed) ? 'red' : (freeRooms === 0) ? 'grey' : ''" />
    <!-- QUOTA -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('quota')"
      class="pricelist-avail-rule-item-row"
      :class="validator.quota.$error ? 'not-valid' : quota !== initialQuota ? 'modified' : ''"
      @click="($refs.inputQuota as HTMLInputElement).focus()"
    >
      <div class="label">Cupo</div>
      <div
        class="rule-value"
        :class="validator.quota.$error ? 'not-valid' : quota !== initialQuota ? 'modified' : ''"
      >
        <input
          ref="inputQuota"
          type="number"
          class="restriction-input"
          v-model="quota"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- MIN STAY -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('min_stay')"
      class="pricelist-avail-rule-item-row"
      :class="validator.minStay.$error ? 'not-valid' : minStay !== initialMinStay ? 'modified' : ''"
      @click="($refs.inputMinStay as HTMLInputElement).focus()"
    >
      <div class="label">Estancia mín.</div>
      <div
        class="rule-value"
        :class="
          validator.minStay.$error ? 'not-valid' : minStay !== initialMinStay ? 'modified' : ''
        "
      >
        <input
          ref="inputMinStay"
          type="number"
          class="restriction-input"
          v-model="minStay"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- MAX STAY -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_stay')"
      class="pricelist-avail-rule-item-row"
      :class="validator.maxStay.$error ? 'not-valid' : maxStay !== initialMaxStay ? 'modified' : ''"
      @click="($refs.inputMaxStay as HTMLInputElement).focus()"
    >
      <div class="label">Estancia máx.</div>
      <div
        class="rule-value"
        :class="
          validator.maxStay.$error ? 'not-valid' : maxStay !== initialMaxStay ? 'modified' : ''
        "
      >
        <input
          ref="inputMaxStay"
          type="number"
          class="restriction-input"
          v-model="maxStay"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- MAX AVAIL -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_avail')"
      class="pricelist-avail-rule-item-row"
      :class="
        validator.maxAvail.$error ? 'not-valid' : maxAvail !== initialMaxAvail ? 'modified' : ''
      "
      @click="($refs.inputMaxAvail as HTMLInputElement).focus()"
    >
      <div class="label">Máx. dispo.</div>
      <div
        class="rule-value"
        :class="
          validator.maxAvail.$error ? 'not-valid' : maxAvail !== initialMaxAvail ? 'modified' : ''
        "
      >
        <input
          ref="inputMaxAvail"
          type="number"
          class="restriction-input"
          v-model="maxAvail"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- MIN STAY ARRIVAL -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('min_stay_arrival')"
      class="pricelist-avail-rule-item-row"
      :class="
        validator.minStayArrival.$error
          ? 'not-valid'
          : minStayArrival !== initialMinStayArrival
          ? 'modified'
          : ''
      "
      @click="($refs.inputMinStayArrival as HTMLInputElement).focus()"
    >
      <div class="label">Est. mín. lleg.</div>
      <div
        class="rule-value"
        :class="
          validator.minStayArrival.$error
            ? 'not-valid'
            : minStay !== initialMinStayArrival
            ? 'modified'
            : ''
        "
      >
        <input
          ref="inputMinStayArrival"
          type="number"
          class="restriction-input"
          v-model="minStayArrival"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- MAX STAY ARRIVAL -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_stay_arrival')"
      class="pricelist-avail-rule-item-row"
      :class="
        validator.maxStayArrival.$error
          ? 'not-valid'
          : maxStayArrival !== initialMaxStayArrival
          ? 'modified'
          : ''
      "
      @click="($refs.inputMaxStayArrival as HTMLInputElement).focus()"
    >
      <div class="label">Est. máx. lleg.</div>
      <div
        class="rule-value"
        :class="
          validator.maxStayArrival.$error
            ? 'not-valid'
            : maxStay !== initialMaxStayArrival
            ? 'modified'
            : ''
        "
      >
        <input
          ref="inputMaxStayArrival"
          type="number"
          class="restriction-input"
          v-model="maxStayArrival"
          @input="updateAvailabilityPlanRule"
          :class="{ active: showAdvancedPricelistItem }"
        />
      </div>
    </div>

    <!-- CLOSED -->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed')"
      :class="{ modified: closed !== initialClosed }"
      class="pricelist-avail-rule-item-row"
    >
      <label class="label" :for="roomTypeId + 'closed' + date.toISOString()"> Cerrada </label>
      <input
        type="checkbox"
        :id="roomTypeId + 'closed' + date.toISOString()"
        v-model="closed"
        @change="updateAvailabilityPlanRule"
      />
    </div>

    <!-- CLOSED ARRIVAL-->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed_arrival')"
      :class="{ modified: closedArrival !== initialClosedArrival }"
      class="pricelist-avail-rule-item-row"
    >
      <label class="label" :for="roomTypeId + 'closedArrival' + date.toISOString()">
        Llegada cerrada
      </label>
      <input
        type="checkbox"
        :id="roomTypeId + 'closedArrival' + date.toISOString()"
        v-model="closedArrival"
        @change="updateAvailabilityPlanRule"
      />
    </div>

    <!-- CLOSED DEPARTURE-->
    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed_departure')"
      :class="{ modified: closedDeparture !== initialClosedDeparture }"
      class="pricelist-avail-rule-item-row"
    >
      <label class="label" :for="roomTypeId + 'closedDeparture' + date.toISOString()">
        Salida cerrada
      </label>
      <input
        type="checkbox"
        :id="roomTypeId + 'closedDeparture' + date.toISOString()"
        v-model="closedDeparture"
        @change="updateAvailabilityPlanRule"
      />
    </div>

    <div v-if="numNotDefaultRules > 0" class="number-rules-no-show">
      <span class="value" @click="toogleAdvancedPricelistItem">
        +
        {{ numNotDefaultRules }}
      </span>
    </div>

    <AdvancedPricelistItemEdit
      v-if="showAdvancedPricelistItem"
      :id="currentPopUp"
      :indexDay="indexDay"
      :indexRoomType="indexRoomType"
      :roomTypeIdsToFilter="roomTypeIdsToFilter"
      :roomTypeId="roomTypeId"
      :roomTypeName="roomTypeName(roomTypeId)"
      :pricelistItem="{
        date: date,
        roomTypeId: roomTypeId,
        id: pricelistItemId,
        price: price,
      }"
      :availabilityPlanRule="{
        date: date,
        roomTypeId: roomTypeId,
        id: availabilityPlanRuleId,
        quota: quota,
        maxAvailability: maxAvail,
        minStay: minStay,
        maxStay: maxStay,
        minStayArrival: minStayArrival,
        maxStayArrival: maxStayArrival,
        closed: closed,
        closedArrival: closedArrival,
        closedDeparture: closedDeparture,
      }"
      :oldAvailabilityPlanRule="{
        date: date,
        roomTypeId: roomTypeId,
        id: availabilityPlanRuleId,
        quota: initialQuota,
        maxAvailability: initialMaxAvail,
        minStay: initialMinStay,
        maxStay: initialMaxStay,
        minStayArrival: initialMinStayArrival,
        maxStayArrival: initialMaxStayArrival,
        closed: initialClosed,
        closedArrival: initialClosedArrival,
        closedDeparture: initialClosedDeparture,
      }"
      :oldPricelistItem="{
        date: date,
        roomTypeId: roomTypeId,
        id: pricelistItemId,
        price: initialPrice,
      }"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, integer, decimal, minValue } from '@vuelidate/validators';
import AdvancedPricelistItemEdit from '@/legacy/components/planningPricelists/AdvancedPricelistItemEdit.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

import { useStore } from '@/legacy/store';

export default defineComponent({
  props: {
    indexDay: {
      type: Number,
      required: true,
    },
    indexRoomType: {
      type: Number,
      required: true,
    },
    roomTypeIdsToFilter: {
      type: Array as () => number[],
      required: true,
    },
    roomTypeId: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    pricelistItemId: {
      type: Number,
      nullable: true,
    },
    availabilityPlanRuleId: {
      type: Number,
      nullable: true,
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    initialQuota: {
      type: Number,
      required: true,
    },
    initialMaxAvail: {
      type: Number,
      required: true,
    },
    initialMinStay: {
      type: Number,
      required: true,
    },
    initialMaxStay: {
      type: Number,
      required: true,
    },
    initialMinStayArrival: {
      type: Number,
      required: true,
    },
    initialMaxStayArrival: {
      type: Number,
      required: true,
    },
    initialClosed: {
      type: Boolean,
      required: true,
    },
    initialClosedArrival: {
      type: Boolean,
      required: true,
    },
    initialClosedDeparture: {
      type: Boolean,
      required: true,
    },
    freeRooms: {
      type: Number,
      required: true,
    },
    reset: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    AdvancedPricelistItemEdit,
    CustomIcon,
  },
  setup(props, context) {
    const store = useStore();

    const price = ref(0);
    const quota = ref(0);
    const maxAvail = ref(0);
    const minStay = ref(0);
    const maxStay = ref(0);
    const minStayArrival = ref(0);
    const maxStayArrival = ref(0);
    const closed = ref(false);
    const closedArrival = ref(false);
    const closedDeparture = ref(false);
    const showEditOption = ref(false);

    const activeUser = computed(() => store.state.user.activeUser);
    const availabilityRuleFields = activeUser.value?.availabilityRuleFields;

    const activePricelist = computed(() => store.state.pricelists.activePricelist);
    const validationRules = computed(() => ({
      price: {
        required,
        decimal,
        minValue: minValue(
          store.state.roomTypes.roomTypes.find((el) => el.id === props.roomTypeId)?.minPrice ?? 0
        ),
      },
      quota: {
        required,
        integer,
        minValue: minValue(-1),
      },
      maxAvail: {
        required,
        integer,
        minValue: minValue(-1),
      },
      minStay: {
        required,
        integer,
        minValue: minValue(0),
      },
      maxStay: {
        required,
        integer,
        minValue: minValue(0),
      },
      minStayArrival: {
        required,
        integer,
        minValue: minValue(0),
      },
      maxStayArrival: {
        required,
        integer,
        minValue: minValue(0),
      },
    }));

    const numNotDefaultRules = computed(() => {
      let rdo = 0;
      if (
        props.initialQuota !== -1 &&
        !activeUser.value?.availabilityRuleFields.includes('quota')
      ) {
        rdo += 1;
      }
      if (
        props.initialMaxAvail !== -1 &&
        !activeUser.value?.availabilityRuleFields.includes('max_avail')
      ) {
        rdo += 1;
      }
      if (
        props.initialMinStay !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('min_stay')
      ) {
        rdo += 1;
      }
      if (
        props.initialMaxStay !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('max_stay')
      ) {
        rdo += 1;
      }
      if (
        props.initialMinStayArrival !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('min_stay_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.initialMaxStayArrival !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('max_stay_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.initialClosed !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed')
      ) {
        rdo += 1;
      }
      if (
        props.initialClosedArrival !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.initialClosedDeparture !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed_departure')
      ) {
        rdo += 1;
      }
      return rdo;
    });

    const currentPopUp = computed(() => {
      let result = '';

      result += props.roomTypeId;
      result += '-';
      result += props.date.toISOString();

      return result;
    });

    const showAdvancedPricelistItem = computed(
      () => store.state.layout.popUpOpen === currentPopUp.value
    );

    const validator = useVuelidate(validationRules, {
      price,
      quota,
      maxAvail,
      minStay,
      maxStay,
      minStayArrival,
      maxStayArrival,
    });

    const updatePrice = () => {
      validator.value.$touch();
      if (validator.value.$error) {
        context.emit('errorPricelistItem', {
          roomTypeId: props.roomTypeId,
          date: props.date,
        });
        return;
      }
      if (price.value !== props.initialPrice) {
        context.emit('updatePriceListItem', {
          roomTypeId: props.roomTypeId,
          date: props.date,
          pricelistItemId: props.pricelistItemId,
          price: price.value,
        });
      } else {
        context.emit('resetPriceListItem', {
          roomTypeId: props.roomTypeId,
          date: props.date,
          pricelistItemId: props.pricelistItemId,
        });
      }
    };

    const updateAvailabilityPlanRule = () => {
      validator.value.$touch();
      if (validator.value.$error) {
        context.emit('errorAvailabilityPlanRule', {
          roomTypeId: props.roomTypeId,
          date: props.date,
        });
        return;
      }
      if (
        quota.value !== props.initialQuota ||
        maxAvail.value !== props.initialMaxAvail ||
        minStay.value !== props.initialMinStay ||
        maxStay.value !== props.initialMaxStay ||
        minStayArrival.value !== props.initialMinStayArrival ||
        maxStayArrival.value !== props.initialMaxStayArrival ||
        closed.value !== props.initialClosed ||
        closedArrival.value !== props.initialClosedArrival ||
        closedDeparture.value !== props.initialClosedDeparture
      ) {
        context.emit('updateAvailabilityPlanRule', {
          roomTypeId: props.roomTypeId,
          date: props.date,
          availabilityRuleId: props.availabilityPlanRuleId,
          quota: quota.value,
          maxAvailability: maxAvail.value,
          minStay: minStay.value,
          maxStay: maxStay.value,
          minStayArrival: minStayArrival.value,
          maxStayArrival: maxStayArrival.value,
          closed: closed.value,
          closedArrival: closedArrival.value,
          closedDeparture: closedDeparture.value,
        });
      } else {
        context.emit('resetAvailabilityPlanRule', {
          roomTypeId: props.roomTypeId,
          date: props.date,
          availabilityRuleId: props.availabilityPlanRuleId,
        });
      }
    };

    const roomTypeName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.name ?? '';

    const toogleAdvancedPricelistItem = () => {
      if (showAdvancedPricelistItem.value) {
        void store.dispatch('layout/setPopUpOpened', '');
      } else {
        void store.dispatch('layout/setPopUpOpened', currentPopUp.value);
      }
    };

    watch(
      () => props.initialPrice,
      (newVal) => {
        price.value = newVal;
      }
    );

    watch(
      () => props.initialQuota,
      (newVal) => {
        quota.value = newVal;
      }
    );

    watch(
      () => props.initialMaxAvail,
      (newVal) => {
        maxAvail.value = newVal;
      }
    );

    watch(
      () => props.initialMinStay,
      (newVal) => {
        minStay.value = newVal;
      }
    );

    watch(
      () => props.initialMaxStay,
      (newVal) => {
        maxStay.value = newVal;
      }
    );

    watch(
      () => props.initialMinStayArrival,
      (newVal) => {
        minStayArrival.value = newVal;
      }
    );

    watch(
      () => props.initialMaxStayArrival,
      (newVal) => {
        maxStayArrival.value = newVal;
      }
    );

    watch(
      () => props.initialClosed,
      (newVal) => {
        closed.value = newVal;
      }
    );

    watch(
      () => props.initialClosedArrival,
      (newVal) => {
        closedArrival.value = newVal;
      }
    );

    watch(
      () => props.initialClosedDeparture,
      (newVal) => {
        closedDeparture.value = newVal;
      }
    );

    watch(
      () => props.reset,
      (newVal) => {
        if (newVal) {
          price.value = props.initialPrice;
          quota.value = props.initialQuota;
          maxAvail.value = props.initialMaxAvail;
          minStay.value = props.initialMinStay;
          maxStay.value = props.initialMaxStay;
          minStayArrival.value = props.initialMinStayArrival;
          maxStayArrival.value = props.initialMaxStayArrival;
          closed.value = props.initialClosed;
          closedArrival.value = props.initialClosedArrival;
          closedDeparture.value = props.initialClosedDeparture;
          context.emit('reset');
        }
      }
    );

    onMounted(() => {
      price.value = props.initialPrice;
      quota.value = props.initialQuota;
      maxAvail.value = props.initialMaxAvail;
      minStay.value = props.initialMinStay;
      maxStay.value = props.initialMaxStay;
      minStayArrival.value = props.initialMinStayArrival;
      maxStayArrival.value = props.initialMaxStayArrival;
      closed.value = props.initialClosed;
      closedArrival.value = props.initialClosedArrival;
      closedDeparture.value = props.initialClosedDeparture;
    });

    return {
      activePricelist,
      activeUser,
      availabilityRuleFields,
      showEditOption,
      price,
      quota,
      maxAvail,
      minStay,
      maxStay,
      minStayArrival,
      maxStayArrival,
      closed,
      closedArrival,
      closedDeparture,
      validator,
      updatePrice,
      updateAvailabilityPlanRule,
      numNotDefaultRules,
      showAdvancedPricelistItem,
      currentPopUp,
      roomTypeName,
      toogleAdvancedPricelistItem,
    };
  },
});
</script>
<style lang="scss" scoped>
.pricelist-restriction-date {
  position: relative;
  background-color: $secondary;
  height: 100%;
  width: 100%;
  padding: 0.3rem 0.5rem;
  &.active {
    background-color: #aadeff;
  }
  .pricelist-avail-rule-item-row {
    height: 20px;
    display: flex;
    justify-content: space-between;
    align-content: flex-start;
    position: relative;
    user-select: none;
    .price {
      height: 1.5rem;
      font-weight: bold;
      .price-input {
        padding-left: 1rem;
        font-weight: bold;
        width: 4.2rem !important;
        height: 16px;
        border: 0;
        margin-bottom: 5px;
        background-color: $secondary;
        &.active {
          background-color: #aadeff;
        }
      }
      .currency {
        user-select: none;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 2px;
      }
      &.modified {
        color: $primary;
        input {
          color: $primary;
        }
      }
    }

    input:not([type='checkbox']) {
      &:focus {
        outline: 1px solid $primary;
        border-radius: 1px;
        background-color: white;
      }
      &.active {
        background-color: #aadeff;
      }
    }
    label {
      cursor: pointer;
    }
    .free-rooms {
      height: 1.5rem;
      font-weight: 300;
      text-align: center;
      &.full {
        color: $roomdoo_black;
      }
    }
    .icon-edit {
      cursor: pointer;
    }
    .label {
      font-weight: 300;
      font-size: 0.9rem;
    }
    .rule-value {
      font-weight: bold;
      font-size: 0.9rem;
    }
    .restriction-input {
      width: 30px;
      height: 16px;
      border: 0;
      margin-bottom: 5px;
      background-color: $secondary;
      text-align: right;
    }
    &.modified {
      color: $primary;
      input {
        color: $primary;
      }
    }
    &.not-valid {
      .label {
        color: red;
      }
      input {
        color: red;
      }
      .price {
        .currency {
          color: red;
        }
      }
    }
  }
  .number-rules-no-show {
    font-weight: bold;
    font-size: 0.7rem;
    font-weight: bold;
    color: $corduroy;
    height: 20px;
    .value {
      cursor: pointer;
      &:hover {
        color: $primary;
      }
    }
  }
  hr {
    border-top: 3px solid $primary;
    margin-top: 0.1rem;
    margin-bottom: 0;
    &.red {
      border-top: 3px solid red;
    }
    &.grey {
      border-top: 3px solid #808080;
    }
  }
}
</style>
