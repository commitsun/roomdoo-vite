<template>
  <div
    :id="id"
    :style="stylePosition(indexDay, indexRoomType)"
    v-if="oldAvailabilityPlanRule && oldPricelistItem"
    class="edit-dialog"
  >
    <div class="top">
      <div class="left">
        {{ roomTypeName }} -
        {{ availabilityPlanRule.date.getDate().toString().padStart(2, '0') }}/{{
          (availabilityPlanRule.date.getMonth() + 1).toString().padStart(2, '0')
        }}/{{ availabilityPlanRule.date.getFullYear() }}
      </div>
      <div class="right">
        <CustomIcon
          @click="closePopup"
          class="close"
          :imagePath="'/app-images/close.svg'"
          :color="'#000000'"
          :colorHover="'primary'"
          :width="'13px'"
          :height="'13px'"
        />
      </div>
    </div>
    <div class="content">
      <div class="left-inputs-edit">
        <div
          :class="
            validator.currentPrice.$error
              ? 'text-red'
              : currentPrice !== oldPricelistItem.price
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentPrice.$error
                ? 'not-valid'
                : currentPrice !== oldPricelistItem.price
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentPrice"
            @input="validator.currentPrice.$touch"
          />
          <label for="priceItem" class="label"> Precio (€) </label>
        </div>

        <div
          :class="
            validator.currentQuota.$error
              ? 'text-red'
              : currentQuota !== oldAvailabilityPlanRule.quota
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentQuota.$error
                ? 'not-valid'
                : currentQuota !== oldAvailabilityPlanRule.quota
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentQuota"
            @input="validator.currentQuota.$touch"
          />
          <label for="quotaItem" class="label"> Cupo </label>
        </div>

        <div
          :class="
            validator.currentMaxAvailability.$error
              ? 'text-red'
              : currentMaxAvailability !== oldAvailabilityPlanRule.maxAvailability
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentMaxAvailability.$error
                ? 'not-valid'
                : currentMaxAvailability !== oldAvailabilityPlanRule.maxAvailability
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentMaxAvailability"
            @input="validator.currentMaxAvailability.$touch"
          />
          <label class="label"> Max. dispo. </label>
        </div>

        <div
          :class="
            validator.currentMinStay.$error
              ? 'text-red'
              : currentMinStay !== oldAvailabilityPlanRule.minStay
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentMinStay.$error
                ? 'not-valid'
                : currentMinStay !== oldAvailabilityPlanRule.minStay
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentMinStay"
            @input="validator.currentMinStay.$touch"
          />
          <label for="minStayItem" class="label"> Estancia mínima </label>
        </div>

        <div
          :class="
            validator.currentMaxStay.$error
              ? 'text-red'
              : currentMaxStay !== oldAvailabilityPlanRule.maxStay
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentMaxStay.$error
                ? 'not-valid'
                : currentMaxStay !== oldAvailabilityPlanRule.maxStay
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentMaxStay"
            @input="validator.currentMaxStay.$touch"
          />
          <label for="maxStayItem" class="label"> Estancia máxima </label>
        </div>
      </div>
      <div class="right-inputs-edit">
        <div
          :class="
            validator.currentMaxStayArrival.$error
              ? 'text-red'
              : currentMaxStayArrival !== oldAvailabilityPlanRule.maxStayArrival
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentMaxStayArrival.$error
                ? 'not-valid'
                : currentMaxStayArrival !== oldAvailabilityPlanRule.maxStayArrival
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentMaxStayArrival"
            @input="validator.currentMaxStayArrival.$touch"
          />
          <label for="maxStayArrivalItem" class="label"> Est. máx. llegada </label>
        </div>

        <div
          :class="
            validator.currentMinStayArrival.$error
              ? 'text-red'
              : currentMinStayArrival !== oldAvailabilityPlanRule.minStayArrival
              ? 'modified'
              : ''
          "
        >
          <input
            class="input-item-rule-value"
            :class="
              validator.currentMinStayArrival.$error
                ? 'not-valid'
                : currentMinStayArrival !== oldAvailabilityPlanRule.minStayArrival
                ? 'modified'
                : ''
            "
            type="number"
            v-model="currentMinStayArrival"
            @input="validator.currentMinStayArrival.$touch"
          />
          <label class="label"> Est. mín. llegada </label>
        </div>

        <div class="toggle-closed">
          <input name="closed" type="checkbox" v-model="currentClosed" />
          <label
            class="label"
            for="closed"
            @click="currentClosed = !currentClosed"
            :class="{ modified: currentClosed !== oldAvailabilityPlanRule.closed }"
          >
            Salida cerrada
          </label>
        </div>
        <div class="toggle-closed">
          <input name="closedArrival" type="checkbox" v-model="currentClosedArrival" />
          <label
            class="label"
            for="closedArrival"
            @click="currentClosedArrival = !currentClosedArrival"
            :class="{ modified: currentClosedArrival !== oldAvailabilityPlanRule.closedArrival }"
          >
            Llegada cerrada
          </label>
        </div>

        <div class="toggle-closed">
          <input name="closedDeparture" type="checkbox" v-model="currentClosedDeparture" />
          <label
            class="label"
            for="closedDeparture"
            @click="currentClosedDeparture = !currentClosedDeparture"
            :class="{
              modified: currentClosedDeparture !== oldAvailabilityPlanRule.closedDeparture,
            }"
          >
            Salida cerrada
          </label>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div
        v-if="anyChanges && validator.$errors.length === 0"
        class="unsaved-changes text-right text-primary"
      >
        Hay cambios sin guardar
      </div>
      <div class="buttons-container">
        <CustomButton
          text="Descartar"
          class="btn-cancel"
          textColor="primary"
          backgroundColor="white"
          borderColor="primary"
          backgroundColorHover="#3f4443"
          @click="closePopup"
        />
        <CustomButton
          text="Guardar"
          class="btn-save"
          textColor="white"
          backgroundColor="primary"
          borderColor="primary"
          backgroundColorHover="#3f4443"
          :disabled="!anyChanges || validator.$errors.length > 0"
          @click="saveValues"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type PayloadCreateAvailPlanRuleInterface } from '@/interfaces/PayloadCreateAvailPlanRuleInterface';
import { type PayloadCreatePricelistItemInterface } from '@/interfaces/PayloadCreatePricelistItemInterface';
import { defineComponent, ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { integer, required, decimal, minValue } from '@vuelidate/validators';

import { type PricelistItemInterface } from '@/interfaces/PricelistItemInterface';
import { type AvailabilityPlanRuleInterface } from '@/interfaces/AvailabilityPlanRuleInterface';
import { useStore } from '../../store';
import { dialogService } from '@/services/DialogService';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import CustomButton from '../roomdooComponents/CustomButton.vue';

export default defineComponent({
  components: {
    CustomIcon,
    CustomButton,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    indexDay: {
      type: Number,
      required: true,
    },
    indexRoomType: {
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
    pricelistItem: {
      type: Object,
      required: true,
    },
    availabilityPlanRule: {
      type: Object,
      required: true,
    },
    oldPricelistItem: {
      type: Object,
      required: true,
    },
    oldAvailabilityPlanRule: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // globals
    const store = useStore();
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activePricelist = computed(() => store.state.pricelists.activePricelist);
    const activeAvailabilityPlan = computed(
      () => store.state.availabilityPlans.activeAvailabilityPlan
    );

    // current pricelist item & avail rule editing
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
    const anyChanges = computed(
      () =>
        currentPrice.value !== props.oldPricelistItem.price ||
        currentQuota.value !== props.oldAvailabilityPlanRule.quota ||
        currentMaxAvailability.value !== props.oldAvailabilityPlanRule.maxAvailability ||
        currentMinStay.value !== props.oldAvailabilityPlanRule.minStay ||
        currentMaxStay.value !== props.oldAvailabilityPlanRule.maxStay ||
        currentMinStayArrival.value !== props.oldAvailabilityPlanRule.minStayArrival ||
        currentMaxStayArrival.value !== props.oldAvailabilityPlanRule.maxStayArrival ||
        currentClosed.value !== props.oldAvailabilityPlanRule.closed ||
        currentClosedArrival.value !== props.oldAvailabilityPlanRule.closedArrival ||
        currentClosedDeparture.value !== props.oldAvailabilityPlanRule.closedDeparture
    );

    // close advanced view
    const closePopup = () => {
      void store.dispatch('layout/setPopUpOpened', '');
    };

    // persist changes
    const saveValues = async () => {
      if (!anyChanges.value || validator.value.$errors.length > 0) return;
      void store.dispatch('layout/showSpinner', true);
      try {
        const pricelistItems: PayloadCreatePricelistItemInterface[] = [];
        const oldPricelistItemValue = props.oldPricelistItem as PricelistItemInterface;
        const oldAvailabilityPlanRuleValue =
          props.oldAvailabilityPlanRule as AvailabilityPlanRuleInterface;

        if (activePricelist.value?.id && activeProperty.value && oldPricelistItemValue) {
          const dateStr = `${oldPricelistItemValue.date.getFullYear()}-${(
            oldPricelistItemValue.date.getMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${oldPricelistItemValue.date.getDate().toString().padStart(2, '0')}`;
          pricelistItems.push({
            pricelistItemId: -1,
            roomTypeId: oldPricelistItemValue.roomTypeId,
            date: dateStr,
            price: currentPrice.value,
            pmsPropertyId: activeProperty.value.id,
            pricelistId: activePricelist.value.id,
          });
        }
        await store.dispatch('pricelists/createOrUpdatePricelistItems', {
          pricelistId: activePricelist.value?.id,
          pricelistItems,
        });

        const availabilityPlanRules: PayloadCreateAvailPlanRuleInterface[] = [];
        if (
          activeAvailabilityPlan.value?.id &&
          activeProperty.value &&
          oldAvailabilityPlanRuleValue
        ) {
          const dateStr = `${oldAvailabilityPlanRuleValue.date.getFullYear()}-${(
            oldAvailabilityPlanRuleValue.date.getMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${oldAvailabilityPlanRuleValue.date
            .getDate()
            .toString()
            .padStart(2, '0')}`;
          availabilityPlanRules.push({
            availabilityRuleId: -1,
            pmsPropertyId: activeProperty.value.id,
            roomTypeId: oldAvailabilityPlanRuleValue.roomTypeId,
            date: dateStr,
            minStay: currentMinStay.value,
            maxStay: currentMaxStay.value,
            minStayArrival: currentMinStayArrival.value,
            maxStayArrival: currentMaxStayArrival.value,
            maxAvailability: currentMaxAvailability.value,
            closed: currentClosed.value,
            closedDeparture: currentClosedDeparture.value,
            closedArrival: currentClosedArrival.value,
            quota: currentQuota.value,
            availabilityPlanId: activeAvailabilityPlan.value.id,
          });
        }
        await store.dispatch('availabilityPlans/createOrUpdateAvailabilityPlanRules', {
          availabilityPlanId: activeAvailabilityPlan.value?.id,
          availabilityPlanRules,
        });

        await store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        });
        await store.dispatch('planning/fetchPlanningPricesRules', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          pricelistId: store.state.pricelists.activePricelist?.id,
        });
        closePopup();
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

    // validations
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
        minValue: minValue(
          store.state.roomTypes.roomTypes.find((el) => el.id === props.roomTypeId)?.minPrice ?? 0
        ),
      },
      currentQuota: {
        required,
        integer,
        minValue: minValue(-1),
      },
      currentMaxAvailability: {
        required,
        integer,
        minValue: minValue(-1),
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

    // styles
    const stylePosition = (indexDay: number, indexRoomType: number) => {
      let style = '';
      if (indexDay > 22) {
        style += 'right: 35px;';
      } else {
        style += 'left: 144px;';
      }
      if (store.state.roomTypes.roomTypes.length - indexRoomType <= 1) {
        style += 'bottom: 0;';
      } else {
        style += 'top: 5px;';
      }
      return style;
    };

    return {
      // globals
      activeProperty,
      activePricelist,
      activeAvailabilityPlan,
      // current pricelist item & avail rule editing
      currentClosed,
      currentClosedArrival,
      currentClosedDeparture,
      currentPrice,
      currentQuota,
      currentMinStay,
      currentMaxStay,
      currentMaxStayArrival,
      currentMinStayArrival,
      currentMaxAvailability,
      anyChanges,
      // close advanced view
      closePopup,
      // persist changes
      saveValues,
      // validations
      validator,
      // styles
      stylePosition,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-dialog {
  display: flex;
  flex-direction: column;
  background-color: white;
  z-index: 1;
  position: absolute;
  padding: 1rem;
  width: 554px;
  height: auto;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;
  .top {
    display: flex;
    justify-content: space-between;
    .left {
      font-size: 1rem;
      font-weight: bold;
      color: $primary;
    }
    .right {
      font-size: 1.2rem;
      color: $corduroy;
      font-weight: bold;
      .close {
        cursor: pointer;
      }
    }
  }
  .content {
    display: flex;
    flex-direction: row;

    .left-inputs-edit {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-items: center;
    }
    .right-inputs-edit {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      .toggle-closed {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: start;
        input {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        input[type='checkbox']:checked {
          background-color: red;
        }
        label {
          margin-left: 5px;
          margin-top: 5px;
          cursor: pointer;
          user-select: none;
          &.modified {
            color: $primary;
          }
        }
      }
    }
    .modified {
      color: $primary;
    }
    input {
      border: 1px solid #01b6e3;
      width: 55px;
      height: 25px;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
      margin: 8px 5px 5px 5px;
      &.modified {
        color: $primary;
      }
      &:focus-visible {
        outline: 1.5px solid $primary;
      }
      &.not-valid {
        border: 1px solid red;
        color: red;
        &:focus-visible {
          outline: 1.5px solid red;
        }
      }
    }
    .label {
      font-weight: bold;
    }
  }
  .bottom {
    display: flex;
    flex-direction: column;
    .unsaved-changes {
      color: $primary;
      font-weight: bold;
    }
    .buttons-container {
      display: flex;
      justify-content: flex-end;
      .btn-cancel,
      .btn-save {
        max-width: 130px;
        height: 35px;
        font-size: 14px;
        margin-left: 10px;
      }
    }
  }
}
</style>
