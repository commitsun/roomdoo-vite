<template>
  <div
    class="pricelist-restriction-date"
    :class="{ active: showAdvancedPricelistItem }"
    @mouseenter="showEditOption = true"
    @mouseleave="showEditOption = false"
  >
    <div
      class="pricelist-avail-rule-item-row"
      :class="
        validator.currentPrice.$error
          ? 'not-valid'
          : currentPrice !== oldPricelistItem?.price
          ? 'modified'
          : ''
      "
    >
      <div class="price">
        <input
          type="number"
          step="any"
          class="price-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentPrice"
          @input="
            updatePricelistItem(
              {
                roomTypeId: pricelistItem.roomTypeId,
                date: pricelistItem.date,
                pricelistItemId: pricelistItem.pricelistItemId,
                price: currentPrice,
              },
              ($event.target as HTMLInputElement).value
            )
          "
        />
        <span class="currency"> € </span>
      </div>
      <div v-if="!showEditOption" class="free-rooms" :class="freeRooms === 0 ? 'full' : ''">
        {{ `${freeRooms === 0 ? 'Lleno' : `${freeRooms} libre${freeRooms > 1 ? 's' : ''}`}` }}
      </div>
      <div v-else @click="toogleAdvancedPricelistItem">
        <q-icon class="icon-edit" name="edit" />
      </div>
    </div>

    <hr />

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('quota')"
      class="pricelist-avail-rule-item-row"
      :class="
        validator.currentQuota.$error
          ? 'not-valid'
          : currentQuota !== oldAvailabilityPlanRule?.quota
          ? 'modified'
          : ''
      "
      @click="($refs.inputQuota as HTMLInputElement).focus()"
    >
      <!-- :class="{'modified': currentQuota !== oldAvailabilityPlanRule?.quota}" -->
      <div class="label">Cupo</div>
      <div class="rule-value">
        <input
          ref="inputQuota"
          type="number"
          class="restriction-input"
          :class="
            validator.currentQuota.$error ? 'not-valid' : showAdvancedPricelistItem ? 'active' : ''
          "
          v-model="currentQuota"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              minStay: availabilityPlanRule.minStay,
              minStayArrival: availabilityPlanRule.minStayArrival,
              maxStay: availabilityPlanRule.maxStay,
              maxStayArrival: availabilityPlanRule.maxStayArrival,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              maxAvailability: availabilityPlanRule.maxAvailability,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_avail')"
      class="pricelist-avail-rule-item-row"
      :class="
        validator.currentMaxAvailability.$error
          ? 'not-valid'
          : currentMaxAvailability !== oldAvailabilityPlanRule?.maxAvailability
          ? 'modified'
          : ''
      "
      @click="($refs.inputMaxAvail as HTMLInputElement).focus()"
    >
      <div class="label">Máx. Dispo.</div>
      <div class="rule-value">
        <input
          ref="inputMaxAvail"
          type="number"
          class="restriction-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentMaxAvailability"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              minStay: availabilityPlanRule.minStay,
              minStayArrival: availabilityPlanRule.minStayArrival,
              maxStay: availabilityPlanRule.maxStay,
              maxStayArrival: availabilityPlanRule.maxStayArrival,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: availabilityPlanRule.quota,
              maxAvailability: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('min_stay')"
      :class="
        validator.currentMinStay.$error
          ? 'not-valid'
          : currentMinStay !== oldAvailabilityPlanRule?.minStay
          ? 'modified'
          : ''
      "
      class="pricelist-avail-rule-item-row"
      @click="($refs.inputMinStay as HTMLInputElement).focus()"
    >
      <div class="label">Estancia Mín.</div>
      <div class="rule-value">
        <input
          ref="inputMinStay"
          type="number"
          class="restriction-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentMinStay"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              minStayArrival: availabilityPlanRule.minStayArrival,
              maxStay: availabilityPlanRule.maxStay,
              maxStayArrival: availabilityPlanRule.maxStayArrival,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: availabilityPlanRule.quota,
              maxAvailability: availabilityPlanRule.maxAvailability,
              minStay: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_stay')"
      :class="
        validator.currentMaxStay.$error
          ? 'not-valid'
          : currentMaxStay !== oldAvailabilityPlanRule?.maxStay
          ? 'modified'
          : ''
      "
      class="pricelist-avail-rule-item-row"
      @click="($refs.inputMaxStay as HTMLInputElement).focus()"
    >
      <div class="label">Estancia Max.</div>
      <div class="rule-value">
        <input
          ref="inputMaxStay"
          type="number"
          class="restriction-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentMaxStay"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              minStayArrival: availabilityPlanRule.minStayArrival,
              maxStayArrival: availabilityPlanRule.maxStayArrival,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: availabilityPlanRule.quota,
              maxAvailability: availabilityPlanRule.maxAvailability,
              minStay: availabilityPlanRule.minStay,
              maxStay: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('max_stay_arrival')"
      :class="
        validator.currentMaxStayArrival.$error
          ? 'not-valid'
          : currentMaxStayArrival !== oldAvailabilityPlanRule?.maxStayArrival
          ? 'modified'
          : ''
      "
      class="pricelist-avail-rule-item-row"
      @click="($refs.inputMaxStayArrival as HTMLInputElement).focus()"
    >
      <div class="label">Est. Máx. Lleg.</div>
      <div class="rule-value">
        <input
          ref="inputMaxStayArrival"
          type="number"
          class="restriction-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentMaxStayArrival"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              minStayArrival: availabilityPlanRule.minStayArrival,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: availabilityPlanRule.quota,
              maxAvailability: availabilityPlanRule.maxAvailability,
              minStay: availabilityPlanRule.minStay,
              maxStay: availabilityPlanRule.maxStay,
              maxStayArrival: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('min_stay_arrival')"
      :class="
        validator.currentMinStayArrival.$error
          ? 'not-valid'
          : currentMinStayArrival !== oldAvailabilityPlanRule?.minStayArrival
          ? 'modified'
          : ''
      "
      class="pricelist-avail-rule-item-row"
      @click="($refs.inputMinStayArrival as HTMLInputElement).focus()"
    >
      <div class="label">Est. Min. Lleg.</div>
      <div class="rule-value">
        <input
          ref="inputMinStayArrival"
          type="number"
          class="restriction-input"
          :class="{ active: showAdvancedPricelistItem }"
          v-model="currentMinStayArrival"
          @input="
            updateAvailabilityPlanRule({
              date: availabilityPlanRule.date,
              availabilityRuleId: availabilityPlanRule.availabilityRuleId,
              closed: availabilityPlanRule.closed,
              closedDeparture: availabilityPlanRule.closedDeparture,
              closedArrival: availabilityPlanRule.closedArrival,
              availabilityPlanId: availabilityPlanRule.availabilityPlanId,
              roomTypeId: availabilityPlanRule.roomTypeId,
              quota: availabilityPlanRule.quota,
              maxAvailability: availabilityPlanRule.maxAvailability,
              minStay: availabilityPlanRule.minStay,
              maxStay: availabilityPlanRule.maxStay,
              maxStayArrival: availabilityPlanRule.maxStayArrival,
              minStayArrival: parseFloat(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed')"
      :class="{ modified: currentClosed !== oldAvailabilityPlanRule?.closed }"
      class="pricelist-avail-rule-item-row"
    >
      <label
        class="label"
        :for="availabilityPlanRule.roomTypeId + 'closed' + availabilityPlanRule.date.toISOString()"
      >
        Cerrada
      </label>
      <input
        type="checkbox"
        :id="availabilityPlanRule.roomTypeId + 'closed' + availabilityPlanRule.date.toISOString()"
        v-model="currentClosed"
        @change="
          updateAvailabilityPlanRule({
            date: availabilityPlanRule.date,
            availabilityRuleId: availabilityPlanRule.availabilityRuleId,
            closedDeparture: availabilityPlanRule.closedDeparture,
            closedArrival: availabilityPlanRule.closedArrival,
            availabilityPlanId: availabilityPlanRule.availabilityPlanId,
            roomTypeId: availabilityPlanRule.roomTypeId,
            quota: availabilityPlanRule.quota,
            maxAvailability: availabilityPlanRule.maxAvailability,
            minStay: availabilityPlanRule.minStay,
            maxStay: availabilityPlanRule.maxStay,
            maxStayArrival: availabilityPlanRule.maxStayArrival,
            minStayArrival: availabilityPlanRule.minStayArrival,
            closed: ($event.target as HTMLInputElement).checked,
          })
        "
      />
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed_arrival')"
      class="pricelist-avail-rule-item-row"
      :class="{ modified: currentClosedArrival !== oldAvailabilityPlanRule?.closedArrival }"
    >
      <label
        :for="
          availabilityPlanRule.roomTypeId +
          'closedArrival' +
          availabilityPlanRule.date.toISOString()
        "
        class="label"
      >
        Llegada Cerrada
      </label>
      <input
        type="checkbox"
        :id="
          availabilityPlanRule.roomTypeId +
          'closedArrival' +
          availabilityPlanRule.date.toISOString()
        "
        v-model="currentClosedArrival"
        @change="
          updateAvailabilityPlanRule({
            date: availabilityPlanRule.date,
            availabilityRuleId: availabilityPlanRule.availabilityRuleId,
            closedDeparture: availabilityPlanRule.closedDeparture,
            availabilityPlanId: availabilityPlanRule.availabilityPlanId,
            roomTypeId: availabilityPlanRule.roomTypeId,
            quota: availabilityPlanRule.quota,
            maxAvailability: availabilityPlanRule.maxAvailability,
            minStay: availabilityPlanRule.minStay,
            maxStay: availabilityPlanRule.maxStay,
            maxStayArrival: availabilityPlanRule.maxStayArrival,
            minStayArrival: availabilityPlanRule.minStayArrival,
            closed: availabilityPlanRule.closed,
            closedArrival: ($event.target as HTMLInputElement).checked,
          })
        "
      />
    </div>

    <div
      v-if="activeUser?.availabilityRuleFields?.includes('closed_departure')"
      :class="{ modified: currentClosedDeparture !== oldAvailabilityPlanRule?.closedDeparture }"
      class="pricelist-avail-rule-item-row"
    >
      <label
        class="label"
        :for="
          availabilityPlanRule.roomTypeId +
          'closedDeparture' +
          availabilityPlanRule.date.toISOString()
        "
      >
        Salida Cerrada
      </label>
      <input
        type="checkbox"
        :id="
          availabilityPlanRule.roomTypeId +
          'closedDeparture' +
          availabilityPlanRule.date.toISOString()
        "
        v-model="currentClosedDeparture"
        @change="
          updateAvailabilityPlanRule({
            date: availabilityPlanRule.date,
            availabilityRuleId: availabilityPlanRule.availabilityRuleId,
            availabilityPlanId: availabilityPlanRule.availabilityPlanId,
            roomTypeId: availabilityPlanRule.roomTypeId,
            quota: availabilityPlanRule.quota,
            maxAvailability: availabilityPlanRule.maxAvailability,
            minStay: availabilityPlanRule.minStay,
            maxStay: availabilityPlanRule.maxStay,
            maxStayArrival: availabilityPlanRule.maxStayArrival,
            minStayArrival: availabilityPlanRule.minStayArrival,
            closed: availabilityPlanRule.closed,
            closedArrival: availabilityPlanRule.closedArrival,
            closedDeparture: ($event.target as HTMLInputElement).checked,
          })
        "
      />
    </div>

    <div v-if="numNotDefaultRules > 0" class="number-rules-no-show">
      <span class="value" @click="toogleAdvancedPricelistItem">
        +
        {{ numNotDefaultRules }}
      </span>
    </div>

    <AdvancedPricelistItemEdit
      v-if="showAdvancedPricelistItem && oldAvailabilityPlanRule && oldPricelistItem"
      :id="currentPopUp"
      :indexDay="indexDay"
      :indexRoomType="indexRoomType"
      :roomTypeId="roomTypeId"
      :roomTypeName="roomTypeName"
      :pricelistItem="pricelistItem"
      :availabilityPlanRule="availabilityPlanRule"
      @updatePricelistItemFromAdvanced="updatePricelistItemFromAdvanced"
      @updateAvailabilityPlanRuleFromAdvanced="updateAvailabilityPlanRuleFromAdvanced"
      :oldAvailabilityPlanRule="oldAvailabilityPlanRule"
      :oldPricelistItem="oldPricelistItem"
    />
  </div>
</template>
<script lang="ts">
import { type AvailabilityPlanRuleInterface } from '@/interfaces/AvailabilityPlanRuleInterface';
import { type PricelistItemInterface } from '@/interfaces/PricelistItemInterface';
import { defineComponent, ref, type Ref, computed, onMounted, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { integer, required, decimal } from '@vuelidate/validators';
import AdvancedPricelistItemEdit from './AdvancedPricelistItemEdit.vue';
import { useStore } from '@/store';

export default defineComponent({
  components: { AdvancedPricelistItemEdit },
  props: {
    pricelistItem: {
      type: Object,
      required: true,
    },
    availabilityPlanRule: {
      type: Object,
      required: true,
    },
    freeRooms: {
      required: true,
      type: Number,
    },
    indexRoomType: {
      type: Number,
      required: true,
    },
    indexDay: {
      type: Number,
      required: true,
    },
    roomTypeId: {
      type: Number,
      required: true,
    },
    roomTypeName: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const store = useStore();

    const currentPrice = ref(props.pricelistItem.price as number);
    const currentMinStay = ref(props.availabilityPlanRule.minStay as number);
    const currentMinStayArrival = ref(props.availabilityPlanRule.minStayArrival as number);
    const currentMaxStay = ref(props.availabilityPlanRule.maxStay as number);
    const currentMaxStayArrival = ref(props.availabilityPlanRule.maxStayArrival as number);
    const currentClosed = ref(props.availabilityPlanRule.closed as boolean);
    const currentClosedDeparture = ref(props.availabilityPlanRule.closedDeparture as boolean);
    const currentClosedArrival = ref(props.availabilityPlanRule.closedArrival as boolean);
    const currentMaxAvailability = ref(props.availabilityPlanRule.maxAvailability as number);
    const currentQuota = ref(props.availabilityPlanRule.quota as number);
    const oldPricelistItem: Ref<PricelistItemInterface | null> = ref(null);
    const oldAvailabilityPlanRule: Ref<AvailabilityPlanRuleInterface | null> = ref(null);
    const showEditOption = ref(false);

    const activeUser = computed(() => store.state.user.activeUser);
    const availabilityRuleFields = activeUser.value?.availabilityRuleFields;

    const activePricelist = computed(() => store.state.pricelists.activePricelist);

    const activeAvailabilityPlan = computed(
      () => store.state.availabilityPlans.activeAvailabilityPlan
    );

    const numNotDefaultRules = computed(() => {
      let rdo = 0;
      if (
        props.availabilityPlanRule.quota !== -1 &&
        !activeUser.value?.availabilityRuleFields.includes('quota')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.maxAvailability !== -1 &&
        !activeUser.value?.availabilityRuleFields.includes('max_avail')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.minStay !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('min_stay')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.maxStay !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('max_stay')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.minStayArrival !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('min_stay_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.maxStayArrival !== 0 &&
        !activeUser.value?.availabilityRuleFields.includes('max_stay_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.closed !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.closedArrival !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed_arrival')
      ) {
        rdo += 1;
      }
      if (
        props.availabilityPlanRule.closedDeparture !== false &&
        !activeUser.value?.availabilityRuleFields.includes('closed_departure')
      ) {
        rdo += 1;
      }
      return rdo;
    });

    const currentPopUp = computed(() => {
      let result = '';
      if (
        props.availabilityPlanRule &&
        props.availabilityPlanRule.roomTypeId &&
        props.availabilityPlanRule.date
      ) {
        result += props.availabilityPlanRule.roomTypeId;
        result += '-';
        result += (props.availabilityPlanRule.date as Date).toISOString();
      }
      return result;
    });

    const showAdvancedPricelistItem = computed(
      () => store.state.layout.popUpOpen === currentPopUp.value
    );

    const notNegativeNumber = (numberValue: number) => {
      if (numberValue < 0) {
        return false;
      }
      return true;
    };

    const validationRules = computed(() => ({
      currentPrice: {
        required,
        decimal,
        notNegativeNumber,
      },
      currentQuota: {
        required,
        integer,
      },
      currentMaxAvailability: {
        required,
        integer,
      },
      currentMinStay: {
        required,
        integer,
        notNegativeNumber,
      },
      currentMinStayArrival: {
        required,
        integer,
        notNegativeNumber,
      },
      currentMaxStay: {
        required,
        integer,
        notNegativeNumber,
      },
      currentMaxStayArrival: {
        required,
        integer,
        notNegativeNumber,
      },
    }));

    const validator = useVuelidate(validationRules, {
      currentPrice,
      currentQuota,
      currentMaxAvailability,
      currentMinStay,
      currentMinStayArrival,
      currentMaxStay,
      currentMaxStayArrival,
    });

    const updatePricelistItem = (value: PricelistItemInterface, newPrice: string) => {
      validator.value.$touch();
      if (validator.value.currentPrice.$errors.length > 0) {
        context.emit('pricelistError', true);
        return;
      }
      if (parseFloat(newPrice)) {
        const modified = currentPrice.value !== oldPricelistItem.value?.price;
        context.emit('update:pricelistItem', {
          roomTypeId: value.roomTypeId,
          date: value.date,
          pricelistItemId: value.pricelistItemId,
          price: parseFloat(newPrice),
          modified,
        });
      }
    };

    const updatePricelistItemFromAdvanced = (value: PricelistItemInterface) => {
      currentPrice.value = value.price ?? 0;
      oldPricelistItem.value = props.pricelistItem as PricelistItemInterface;
      context.emit('update:pricelistItem', {
        roomTypeId: value.roomTypeId,
        date: value.date,
        pricelistItemId: value.pricelistItemId,
        price: value.price,
        modified: false,
      });
      oldPricelistItem.value = value;
    };

    const updateAvailabilityPlanRule = (value: AvailabilityPlanRuleInterface) => {
      validator.value.$touch();
      if (validator.value.$errors.length > 0) {
        context.emit('availabilityPlanError', true);
        return;
      }
      const modified =
        currentQuota.value !== oldAvailabilityPlanRule.value?.quota ||
        currentMaxAvailability.value !== oldAvailabilityPlanRule.value?.maxAvailability ||
        currentMinStay.value !== oldAvailabilityPlanRule.value?.minStay ||
        currentMinStayArrival.value !== oldAvailabilityPlanRule.value?.minStayArrival ||
        currentMaxStay.value !== oldAvailabilityPlanRule.value?.maxStay ||
        currentMaxStayArrival.value !== oldAvailabilityPlanRule.value?.maxStayArrival ||
        currentClosed.value !== oldAvailabilityPlanRule.value?.closed ||
        currentClosedArrival.value !== oldAvailabilityPlanRule.value?.closedArrival ||
        currentClosedDeparture.value !== oldAvailabilityPlanRule.value?.closedDeparture;
      context.emit('update:availabilityPlanRule', {
        roomTypeId: value.roomTypeId,
        date: value.date,
        availabilityRuleId: value.availabilityRuleId,
        minStay: value.minStay,
        minStayArrival: value.minStayArrival,
        maxStay: value.maxStay,
        maxStayArrival: value.maxStayArrival,
        closed: value.closed,
        closedDeparture: value.closedDeparture,
        closedArrival: value.closedArrival,
        quota: value.quota,
        maxAvailability: value.maxAvailability,
        modified,
      });
    };

    const updateAvailabilityPlanRuleFromAdvanced = (value: AvailabilityPlanRuleInterface) => {
      currentMinStay.value = value.minStay ?? 0;
      currentMinStayArrival.value = value.minStayArrival ?? 0;
      currentMaxStay.value = value.maxStay ?? 0;
      currentMaxStayArrival.value = value.maxStayArrival ?? 0;
      currentClosed.value = value.closed ?? false;
      currentClosedDeparture.value = value.closedDeparture ?? false;
      currentClosedArrival.value = value.closedArrival ?? false;
      currentMaxAvailability.value = value.maxAvailability ?? -1;
      currentQuota.value = value.quota ?? -1;
      oldAvailabilityPlanRule.value = props.availabilityPlanRule as AvailabilityPlanRuleInterface;
      context.emit('update:availabilityPlanRule', {
        roomTypeId: value.roomTypeId,
        date: value.date,
        availabilityRuleId: value.availabilityRuleId,
        minStay: value.minStay,
        minStayArrival: value.minStayArrival,
        maxStay: value.maxStay,
        maxStayArrival: value.maxStayArrival,
        closed: value.closed,
        closedDeparture: value.closedDeparture,
        closedArrival: value.closedArrival,
        quota: value.quota,
        maxAvailability: value.maxAvailability,
        modified: false,
      });
      oldAvailabilityPlanRule.value = value;
    };

    const toogleAdvancedPricelistItem = () => {
      if (showAdvancedPricelistItem.value) {
        void store.dispatch('layout/setPopUpOpened', '');
      } else {
        void store.dispatch('layout/setPopUpOpened', currentPopUp.value);
      }
    };

    watch(
      () => props.pricelistItem.modified as boolean,
      (newVal, oldVal) => {
        if (!newVal && oldVal) {
          oldPricelistItem.value = props.pricelistItem as PricelistItemInterface;
          currentPrice.value = oldPricelistItem.value.price ?? 0;
        }
      }
    );

    watch(
      () => props.availabilityPlanRule.modified as boolean,
      (newVal, oldVal) => {
        if (!newVal && oldVal) {
          oldAvailabilityPlanRule.value =
            props.availabilityPlanRule as AvailabilityPlanRuleInterface;
          currentMinStay.value = oldAvailabilityPlanRule.value.minStay ?? 0;
          currentMinStayArrival.value = oldAvailabilityPlanRule.value.minStayArrival ?? 0;
          currentMaxStay.value = oldAvailabilityPlanRule.value.maxStay ?? 0;
          currentMaxStayArrival.value = oldAvailabilityPlanRule.value.maxStayArrival ?? 0;
          currentClosed.value = oldAvailabilityPlanRule.value.closed ?? false;
          currentClosedDeparture.value = oldAvailabilityPlanRule.value.closedDeparture ?? false;
          currentClosedArrival.value = oldAvailabilityPlanRule.value.closedArrival ?? false;
          currentMaxAvailability.value = oldAvailabilityPlanRule.value.maxAvailability ?? -1;
          currentQuota.value = oldAvailabilityPlanRule.value.quota ?? -1;
        }
      }
    );

    watch(
      () => props.pricelistItem,
      () => {
        oldPricelistItem.value = props.pricelistItem as PricelistItemInterface;
        currentPrice.value = oldPricelistItem.value.price ?? 0;
      }
    );

    watch(
      () => props.availabilityPlanRule,
      () => {
        oldAvailabilityPlanRule.value = props.availabilityPlanRule as AvailabilityPlanRuleInterface;
        currentMinStay.value = oldAvailabilityPlanRule.value.minStay ?? 0;
        currentMinStayArrival.value = oldAvailabilityPlanRule.value.minStayArrival ?? 0;
        currentMaxStay.value = oldAvailabilityPlanRule.value.maxStay ?? 0;
        currentMaxStayArrival.value = oldAvailabilityPlanRule.value.maxStayArrival ?? 0;
        currentClosed.value = oldAvailabilityPlanRule.value.closed ?? false;
        currentClosedDeparture.value = oldAvailabilityPlanRule.value.closedDeparture ?? false;
        currentClosedArrival.value = oldAvailabilityPlanRule.value.closedArrival ?? false;
        currentMaxAvailability.value = oldAvailabilityPlanRule.value.maxAvailability ?? -1;
        currentQuota.value = oldAvailabilityPlanRule.value.quota ?? -1;
      }
    );

    onMounted(() => {
      oldPricelistItem.value = props.pricelistItem as PricelistItemInterface;
      oldAvailabilityPlanRule.value = props.availabilityPlanRule as AvailabilityPlanRuleInterface;
    });

    return {
      activeAvailabilityPlan,
      activePricelist,
      activeUser,
      availabilityRuleFields,
      currentPrice,
      currentMinStay,
      currentMinStayArrival,
      currentMaxStay,
      currentMaxStayArrival,
      currentClosed,
      currentClosedDeparture,
      currentClosedArrival,
      currentMaxAvailability,
      currentQuota,
      numNotDefaultRules,
      oldPricelistItem,
      oldAvailabilityPlanRule,
      validator,
      updatePricelistItem,
      updateAvailabilityPlanRule,
      updatePricelistItemFromAdvanced,
      updateAvailabilityPlanRuleFromAdvanced,
      showEditOption,
      currentPopUp,
      showAdvancedPricelistItem,
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
    .price {
      height: 1.5rem;
      font-size: 0.9rem;
      font-weight: bold;
      .price-input {
        padding-left: 0.8rem;
        font-weight: bold;
        width: 3.7rem;
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
      font-size: 0.8rem;
      height: 1.5rem;
      font-weight: 300;
      text-align: center;
      &.full {
        color: $roomdoo_black;
      }
    }
    .icon-edit {
      max-height: 1.5rem;
      color: $primary;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .label {
      font-weight: 300;
      font-size: 0.8rem;
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
        font-weight: bold;
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
  }
}
</style>
