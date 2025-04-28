<template>
  <div class="main-content">
    <div class="dates">
      <div class="from">
        <div class="label">Desde:</div>
        <DatePicker
          v-model="dateFrom"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          size="small"
          :maxDate="dateTo || undefined"
        />
      </div>
      <div class="to">
        <div class="label">Hasta:</div>
        <DatePicker
          v-model="dateTo"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          size="small"
          :minDate="dateFrom || undefined"
        />
      </div>
    </div>
    <div class="filters">
      <div class="filter">
        <div class="label">Aplicar en:</div>
        <AppSelect
          size="small"
          class="select"
          optionLabel="name"
          placeholder="Selecciona opción"
          @change="resetValues"
          :options="[
            {
              name: 'Plan de disponibilidad',
              code: 'availabilityPlan',
            },
            {
              name: 'Tarifa',
              code: 'priceList',
            },
          ]"
          v-model="applyOn"
        />
      </div>
      <div class="filter" v-if="applyOn.code === 'availabilityPlan'">
        <div class="label">Planes de disponibildad</div>
        <MultiSelect
          size="small"
          class="select"
          v-model="selectedAvailabilityPlans"
          :options="
            availabilityPlans.map((plan) => ({
              id: plan.id ?? 0,
              name: plan.name ?? '',
            }))
          "
          optionLabel="name"
          placeholder="Seleccionar planes"
          :maxSelectedLabels="1"
          selectedItemsLabel="{0} planes seleccionados"
          display="comma"
          :showToggleAll="false"
        />
      </div>
      <div class="filter" v-if="applyOn.code === 'priceList'">
        <div class="label">Tarifas</div>
        <MultiSelect
          size="small"
          class="select"
          v-model="selectedPricelists"
          :options="
            pricelists.map((pricelist) => ({
              id: pricelist.id ?? 0,
              name: pricelist.name ?? '',
            }))
          "
          optionLabel="name"
          placeholder="Seleccionar tarifas"
          :maxSelectedLabels="1"
          selectedItemsLabel="{0} tarifas seleccionados"
          display="comma"
          :showToggleAll="false"
        />
      </div>

      <div class="filter">
        <div class="label">Tipos de habitación</div>
        <MultiSelect
          size="small"
          class="select"
          v-model="selectedRoomTypeIds"
          :options="
            roomTypes.map((roomType) => ({
              id: roomType.id ?? 0,
              name: roomType.name ?? '',
            }))
          "
          optionLabel="name"
          placeholder="Seleccionar tipos"
          :maxSelectedLabels="1"
          selectedItemsLabel="{0} tipos seleccionados"
          display="comma"
          :showToggleAll="false"
        />
      </div>
    </div>

    <div class="week-days-section">
      <div class="title">Días de la semana</div>
      <div class="days">
        <div class="first">
          <div class="day">
            <div class="label" @click="setAllDays(!allDaysToggle)">Todos</div>
            <ToggleSwitch v-model="allDaysToggle" @update:model-value="setAllDays" />
          </div>

          <div class="day">
            <div
              class="label"
              @click="
                mondayToggle = !mondayToggle;
                toggleIndividualDay();
              "
            >
              Lunes
            </div>
            <ToggleSwitch v-model="mondayToggle" @update:model-value="toggleIndividualDay" />
          </div>
          <div class="day">
            <div
              class="label"
              @click="
                tuesdayToggle = !tuesdayToggle;
                toggleIndividualDay();
              "
            >
              Martes
            </div>
            <ToggleSwitch v-model="tuesdayToggle" @update:model-value="toggleIndividualDay" />
          </div>
          <div class="day">
            <div
              class="label"
              @click="
                wednesdayToggle = !wednesdayToggle;
                toggleIndividualDay();
              "
            >
              Miércoles
            </div>
            <ToggleSwitch v-model="wednesdayToggle" @update:model-value="toggleIndividualDay" />
          </div>
        </div>
        <div class="second">
          <div class="day">
            <div
              class="label"
              @click="
                thursdayToggle = !thursdayToggle;
                toggleIndividualDay();
              "
            >
              Jueves
            </div>
            <ToggleSwitch v-model="thursdayToggle" @update:model-value="toggleIndividualDay" />
          </div>
          <div class="day">
            <div
              class="label"
              @click="
                fridayToggle = !fridayToggle;
                toggleIndividualDay();
              "
            >
              Viernes
            </div>
            <ToggleSwitch v-model="fridayToggle" @update:model-value="toggleIndividualDay" />
          </div>
          <div class="day">
            <div
              class="label"
              @click="
                saturdayToggle = !saturdayToggle;
                toggleIndividualDay();
              "
            >
              Sábado
            </div>
            <ToggleSwitch v-model="saturdayToggle" @update:model-value="toggleIndividualDay" />
          </div>
          <div class="day">
            <div
              class="label"
              @click="
                sundayToggle = !sundayToggle;
                toggleIndividualDay();
              "
            >
              Domingo
            </div>
            <ToggleSwitch v-model="sundayToggle" @update:model-value="toggleIndividualDay" />
          </div>
        </div>
      </div>
    </div>

    <div class="rules-section" v-if="applyOn.code === 'availabilityPlan'">
      <div class="title">Reglas de disponibilidad</div>
      <div class="rules">
        <div class="rule">
          <!-- quota -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="quotaToggleValue" class="toggle" />
              <div class="label" @click="quotaToggleValue = !quotaToggleValue">Cupo</div>
            </div>
            <InputNumber
              v-model="quotaInput"
              :disabled="!quotaToggleValue"
              size="small"
              :min="0"
              :max="99"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
          <!-- min stay -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="minStayToggleValue" class="toggle" />
              <div class="label" @click="minStayToggleValue = !minStayToggleValue">
                Estancia mín.
              </div>
            </div>
            <InputNumber
              v-model="minStayInput"
              :disabled="!minStayToggleValue"
              size="small"
              :min="0"
              :max="99"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
          <!-- max stay -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="maxStayToggleValue" class="toggle" />
              <div class="label" @click="maxStayToggleValue = !maxStayToggleValue">
                Estancia máx.
              </div>
            </div>
            <InputNumber
              v-model="maxStayInput"
              :disabled="!maxStayToggleValue"
              size="small"
              :min="0"
              :max="99"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
        </div>
        <div class="rule">
          <!-- max availability -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="maxAvailToggleValue" class="toggle small-toggle-switch" />
              <div class="label" @click="maxAvailToggleValue = !maxAvailToggleValue">
                Máx. dispo.
              </div>
            </div>
            <InputNumber
              v-model="maxAvailInput"
              :disabled="!maxAvailToggleValue"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
          <!-- min stay arrival -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="minStayArrivalToggleValue" class="toggle" />
              <div class="label" @click="minStayArrivalToggleValue = !minStayArrivalToggleValue">
                Est. mín. llegada
              </div>
            </div>
            <InputNumber
              v-model="minStayArrivalInput"
              :disabled="!minStayArrivalToggleValue"
              size="small"
              :min="0"
              :max="99"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
          <!-- max stay arrival -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="maxStayArrivalToggleValue" class="toggle" />
              <div class="label" @click="maxStayArrivalToggleValue = !maxStayArrivalToggleValue">
                Est. máx. llegada
              </div>
            </div>
            <InputNumber
              v-model="maxStayArrivalInput"
              :disabled="!maxStayArrivalToggleValue"
              size="small"
              :min="0"
              :max="99"
              :inputStyle="{
                width: '35px',
                height: '35px',
                padding: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }"
            />
          </div>
        </div>
        <div class="rule">
          <!-- closed -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="closedToggleValue" class="toggle" />
              <div class="label" @click="closedToggleValue = !closedToggleValue">Cerrada</div>
            </div>
            <Checkbox
              v-model="closedValue"
              :disabled="!closedToggleValue"
              binary
              class="checkbox"
            />
          </div>
          <!-- closed arrival -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="closedArrivalToggleValue" class="toggle" />
              <div class="label" @click="closedArrivalToggleValue = !closedArrivalToggleValue">
                Llegada cerrada
              </div>
            </div>
            <Checkbox
              v-model="closedArrivalValue"
              :disabled="!closedArrivalToggleValue"
              binary
              class="checkbox"
            />
          </div>
          <!-- closed departure -->
          <div class="rule-content">
            <div class="left">
              <ToggleSwitch v-model="closedDepartureToggleValue" class="toggle" />
              <div class="label" @click="closedDepartureToggleValue = !closedDepartureToggleValue">
                Salida cerrada
              </div>
            </div>
            <Checkbox
              v-model="closedDepartureValue"
              :disabled="!closedDepartureToggleValue"
              binary
              class="checkbox"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="price-section" v-if="applyOn.code === 'priceList'">
      <div class="label">Precio</div>
      <InputNumber v-model="priceValue" size="small" class="input" mode="currency" currency="EUR" />
    </div>

    <div
      class="items-to-overwrite"
      v-if="
        numberItemsRulesOverwrite !== 0 &&
        dateFrom &&
        dateTo &&
        (availabilityPlans || pricelists) &&
        roomTypes &&
        (priceValue ||
          minStayToggleValue ||
          maxStayToggleValue ||
          quotaToggleValue ||
          maxStayArrivalToggleValue ||
          minStayArrivalToggleValue ||
          maxAvailToggleValue ||
          closedToggleValue ||
          closedArrivalToggleValue ||
          closedDepartureToggleValue)
      "
    >
      <div class="number-to-overwrite">
        Se modificarán
        <span v-if="applyOn.code === 'availabilityPlan'" class="number-items-rules">
          {{ numberItemsRulesOverwrite }} reglas de disponibilidad:
        </span>
        <span v-else class="number-items-rules">
          {{ numberItemsRulesOverwrite }} items de tarifa:
        </span>
      </div>
      <div class="rules-to-modify">
        <div class="range">
          <div class="label">Fechas:</div>
          <div class="value">
            {{
              dateFrom.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            }}
            -
            {{
              dateTo.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            }}
          </div>
        </div>
        <div class="availability-plans" v-if="applyOn.code === 'availabilityPlan'">
          <div class="label">Planes de Disponibilidad:</div>
          <div
            class="value"
            v-for="(availabilityPlan, index) in selectedAvailabilityPlans"
            :key="index"
          >
            {{ availabilityPlan.name }}
          </div>
        </div>
        <div class="pricelists" v-else>
          <div class="label">Tarifas:</div>
          <div class="value" v-for="(pricelist, index) in selectedPricelists" :key="index">
            {{ pricelist.name }}
          </div>
        </div>
        <div class="room-types">
          <div class="label">Tipos de Habitación:</div>
          <div class="value" v-for="(roomType, index) in selectedRoomTypeIds" :key="index">
            {{ roomType.name }}
          </div>
        </div>
        <div class="rules" v-if="applyOn.code === 'availabilityPlan'">
          <div class="label">Reglas de disponibilidad:</div>
          <div class="value">
            <div v-if="minStayToggleValue">Estancia mín.: {{ minStayInput }}</div>
            <div v-if="maxStayToggleValue">Estancia máx.: {{ maxStayInput }}</div>
            <div v-if="quotaToggleValue">Cupo: {{ quotaInput }}</div>
            <div v-if="minStayArrivalToggleValue">Est. min. llegada: {{ minStayArrivalInput }}</div>
            <div v-if="maxStayArrivalToggleValue">Est. máx. llegada: {{ maxStayArrivalInput }}</div>
            <div v-if="maxAvailToggleValue">Máx. dispo.: {{ maxAvailInput }}</div>
            <div v-if="closedToggleValue">Cerrada: {{ closedValue ? 'Si' : 'No' }}</div>
            <div v-if="closedArrivalToggleValue">
              Llegada cerrada: {{ closedArrivalValue ? 'Si' : 'No' }}
            </div>
            <div v-if="closedDepartureToggleValue">
              Salida cerrada: {{ closedDepartureValue ? 'Si' : 'No' }}
            </div>
          </div>
        </div>
        <div class="price" v-if="applyOn.code === 'priceList'">
          <div class="label">Precio:</div>
          <div class="value">{{ priceValue }} €</div>
        </div>
      </div>
    </div>

    <div class="buttons">
      <AppButton
        :label="'Guardar y salir'"
        @click="
          saveItemsRules();
          $emit('close');
        "
        raised
        size="small"
        class="button"
        :disabled="disallowSave"
        :class="{ disabled: disallowSave }"
      />
      <AppButton
        :label="'Guardar y continuar'"
        @click="saveItemsRules"
        raised
        size="small"
        class="button"
        :disabled="disallowSave"
        :class="{ disabled: disallowSave }"
      />
      <AppButton
        :label="'Cancelar'"
        raised
        size="small"
        severity="secondary"
        class="button"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type Ref } from 'vue';
import DatePicker from 'primevue/datepicker';
import MultiSelect from 'primevue/multiselect';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import utilsDates from '@/utils/dates';

import { store } from '@/store';
import type { PayloadCreateAvailPlanRuleInterface } from '@/interfaces/PayloadCreateAvailPlanRuleInterface';
import type { PayloadCreatePricelistItemInterface } from '@/interfaces/PayloadCreatePricelistItemInterface';
import { dialogService } from '@/services/DialogService';
import type { AvailabilityPlanInterface } from '@/interfaces/AvailabilityPlanInterface';
import type { PricelistInterface } from '@/interfaces/PricelistInterface';
import type { RoomTypeInterface } from '@/interfaces/RoomTypeInterfaces';

export default defineComponent({
  components: {
    DatePicker,
    AppSelect: Select,
    MultiSelect,
    ToggleSwitch,
    InputNumber,
    Checkbox,
    AppButton: Button,
  },
  setup() {
    // date from and to inputs
    const dateFrom: Ref<Date | null> = ref(null);
    const dateTo: Ref<Date | null> = ref(null);
    // apply on select
    const applyOn = ref({
      name: 'Plan de disponibilidad',
      code: 'availabilityPlan',
    });
    // availability plans
    const selectedAvailabilityPlans: Ref<AvailabilityPlanInterface[]> = ref([]);
    const availabilityPlans = computed(() => store.state.availabilityPlans.availabilityPlans);
    // pricelists
    const selectedPricelists: Ref<PricelistInterface[]> = ref([]);
    const pricelists = computed(() => store.state.pricelists.pricelists);
    // room types
    const selectedRoomTypeIds: Ref<RoomTypeInterface[]> = ref([]);
    const roomTypes = computed(() => store.state.roomTypes.roomTypes);
    // toggle day switches
    const mondayToggle = ref(true);
    const tuesdayToggle = ref(true);
    const wednesdayToggle = ref(true);
    const thursdayToggle = ref(true);
    const fridayToggle = ref(true);
    const saturdayToggle = ref(true);
    const sundayToggle = ref(true);
    const allDaysToggle = ref(true);
    // price
    const priceValue = ref(0);
    // toggle rule switches
    const minStayToggleValue = ref(false);
    const maxStayToggleValue = ref(false);
    const quotaToggleValue = ref(false);
    const minStayArrivalToggleValue = ref(false);
    const maxStayArrivalToggleValue = ref(false);
    const maxAvailToggleValue = ref(false);
    const closedToggleValue = ref(false);
    const closedArrivalToggleValue = ref(false);
    const closedDepartureToggleValue = ref(false);
    // rule inputs
    const minStayInput = ref(0);
    const maxStayInput = ref(0);
    const quotaInput = ref(0);
    const minStayArrivalInput = ref(0);
    const maxStayArrivalInput = ref(0);
    const maxAvailInput = ref(0);
    const closedValue = ref(false);
    const closedArrivalValue = ref(false);
    const closedDepartureValue = ref(false);

    const activePropertyId = computed(() => store.state.properties.activeProperty?.id);

    const rangeDates = computed(() => {
      if (dateFrom.value && dateTo.value) {
        return utilsDates.getDatesRange(dateFrom.value, dateTo.value);
      }
      return [];
    });

    const numberItemsRulesOverwrite = computed(() => {
      let days = [
        sundayToggle.value ? 0 : -1,
        mondayToggle.value ? 1 : -1,
        tuesdayToggle.value ? 2 : -1,
        wednesdayToggle.value ? 3 : -1,
        thursdayToggle.value ? 4 : -1,
        fridayToggle.value ? 5 : -1,
        saturdayToggle.value ? 6 : -1,
      ];
      days = days.filter((el) => el !== -1);

      return (
        rangeDates.value.filter((el) => days.includes(el.getDay())).length *
        selectedRoomTypeIds.value.length *
        (applyOn.value.code === 'availabilityPlan'
          ? selectedAvailabilityPlans.value.length
          : selectedPricelists.value.length)
      );
    });

    const disallowSave = computed(
      () =>
        dateFrom.value === null ||
        dateTo.value === null ||
        selectedRoomTypeIds.value.length === 0 ||
        (applyOn.value.code === 'availabilityPlan' &&
          (availabilityPlans.value.length === 0 ||
            (minStayToggleValue.value === false &&
              maxStayToggleValue.value === false &&
              quotaToggleValue.value === false &&
              maxStayArrivalToggleValue.value === false &&
              minStayArrivalToggleValue.value === false &&
              maxAvailToggleValue.value === false &&
              closedToggleValue.value === false &&
              closedArrivalToggleValue.value === false &&
              closedDepartureToggleValue.value === false))) ||
        (applyOn.value.code === 'priceList' &&
          (pricelists.value.length === 0 || !priceValue.value || priceValue.value === 0)) ||
        (mondayToggle.value === false &&
          tuesdayToggle.value === false &&
          wednesdayToggle.value === false &&
          thursdayToggle.value === false &&
          fridayToggle.value === false &&
          saturdayToggle.value === false &&
          sundayToggle.value === false)
    );

    const setAllDays = (value: boolean) => {
      allDaysToggle.value = value;
      mondayToggle.value = value;
      tuesdayToggle.value = value;
      wednesdayToggle.value = value;
      thursdayToggle.value = value;
      fridayToggle.value = value;
      saturdayToggle.value = value;
      sundayToggle.value = value;
    };

    const toggleIndividualDay = () => {
      const allSelected =
        mondayToggle.value &&
        tuesdayToggle.value &&
        wednesdayToggle.value &&
        thursdayToggle.value &&
        fridayToggle.value &&
        saturdayToggle.value &&
        sundayToggle.value;

      const anyDeselected =
        !mondayToggle.value ||
        !tuesdayToggle.value ||
        !wednesdayToggle.value ||
        !thursdayToggle.value ||
        !fridayToggle.value ||
        !saturdayToggle.value ||
        !sundayToggle.value;

      if (allSelected) {
        allDaysToggle.value = true;
      } else if (anyDeselected) {
        allDaysToggle.value = false;
      }
    };

    const resetValues = () => {
      minStayInput.value = 0;
      maxStayInput.value = 0;
      maxStayArrivalInput.value = 0;
      minStayArrivalInput.value = 0;
      maxAvailInput.value = 0;
      closedValue.value = false;
      closedDepartureValue.value = false;
      closedArrivalValue.value = false;
      quotaInput.value = 0;
      priceValue.value = 0;
      allDaysToggle.value = true;
      sundayToggle.value = true;
      mondayToggle.value = true;
      tuesdayToggle.value = true;
      wednesdayToggle.value = true;
      thursdayToggle.value = true;
      fridayToggle.value = true;
      saturdayToggle.value = true;
      minStayToggleValue.value = false;
      maxStayToggleValue.value = false;
      minStayArrivalToggleValue.value = false;
      maxStayArrivalToggleValue.value = false;
      quotaToggleValue.value = false;
      maxAvailToggleValue.value = false;
      closedToggleValue.value = false;
      closedArrivalToggleValue.value = false;
      closedDepartureToggleValue.value = false;
      selectedRoomTypeIds.value = [];
      selectedAvailabilityPlans.value = [];
      selectedPricelists.value = [];
    };

    const saveItemsRules = async () => {
      const dates = rangeDates.value.filter(
        (el) =>
          (el.getDay() === 0 && sundayToggle.value) ||
          (el.getDay() === 1 && mondayToggle.value) ||
          (el.getDay() === 2 && tuesdayToggle.value) ||
          (el.getDay() === 3 && wednesdayToggle.value) ||
          (el.getDay() === 4 && thursdayToggle.value) ||
          (el.getDay() === 5 && fridayToggle.value) ||
          (el.getDay() === 6 && saturdayToggle.value)
      );

      if (applyOn.value.code === 'availabilityPlan') {
        const availabilityPlanRules = [] as PayloadCreateAvailPlanRuleInterface[];
        availabilityPlans.value.forEach((avPlanId) => {
          roomTypes.value.forEach((rtId) => {
            dates.forEach((date) => {
              const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              if (activePropertyId.value) {
                const minStay = minStayToggleValue.value ? minStayInput.value : null;
                const maxStay = maxStayToggleValue.value ? maxStayInput.value : null;
                const quota = quotaToggleValue.value ? quotaInput.value : null;
                const maxAvailability = maxAvailToggleValue.value ? maxAvailInput.value : null;
                const maxStayArrival = maxStayArrivalToggleValue.value
                  ? maxStayArrivalInput.value
                  : null;
                const minStayArrival = minStayArrivalToggleValue.value
                  ? minStayArrivalInput.value
                  : null;
                const closed = closedToggleValue.value ? closedValue.value : null;
                const closedArrival = closedArrivalToggleValue.value
                  ? closedArrivalValue.value
                  : null;
                const closedDeparture = closedDepartureToggleValue.value
                  ? closedDepartureValue.value
                  : null;
                const availabilityPlanRule = {
                  availabilityRuleId: -1,
                  minStay,
                  maxStay,
                  maxStayArrival,
                  minStayArrival,
                  closed,
                  closedDeparture,
                  closedArrival,
                  quota,
                  maxAvailability,
                  roomTypeId: rtId.id,
                  date: dateStr,
                  pmsPropertyId: activePropertyId.value,
                  availabilityPlanId: avPlanId.id,
                };
                availabilityPlanRules.push(availabilityPlanRule);
              }
            });
          });
        });
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('availabilityPlans/batchChangesAvailabilityPlanRules', {
            availabilityPlanRules,
          });
          resetValues();
          await Promise.all([
            store.dispatch('planning/fetchPlanningPricesRules', {
              dateStart: store.state.planning.dateStart,
              dateEnd: store.state.planning.dateEnd,
              propertyId: store.state.properties.activeProperty?.id,
              availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
              pricelistId: store.state.pricelists.activePricelist?.id,
            }),
            store.dispatch('planning/fetchPlanning', {
              dateStart: store.state.planning.dateStart,
              dateEnd: store.state.planning.dateEnd,
              propertyId: store.state.properties.activeProperty?.id,
              availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
            }),
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
      } else {
        const pricelistItems: PayloadCreatePricelistItemInterface[] = [];
        pricelists.value.forEach((pricelist) => {
          roomTypes.value.forEach((rtId) => {
            dates.forEach((date) => {
              const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              if (activePropertyId.value) {
                const pricelistItem = {
                  pricelistItemId: -1,
                  roomTypeId: rtId.id,
                  date: dateStr,
                  price: priceValue.value,
                  pmsPropertyId: activePropertyId.value,
                  pricelistId: pricelist.id,
                };
                pricelistItems.push(pricelistItem);
              }
            });
          });
        });
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('pricelists/batchChangesPricelistItems', { pricelistItems });
          resetValues();
          await store.dispatch('planning/fetchPlanningPricesRules', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
            pricelistId: store.state.pricelists.activePricelist?.id,
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
      }
    };

    return {
      dateFrom,
      dateTo,
      applyOn,
      selectedPricelists,
      pricelists,
      priceValue,
      selectedAvailabilityPlans,
      availabilityPlans,
      selectedRoomTypeIds,
      roomTypes,
      mondayToggle,
      tuesdayToggle,
      wednesdayToggle,
      thursdayToggle,
      fridayToggle,
      saturdayToggle,
      sundayToggle,
      allDaysToggle,
      minStayToggleValue,
      maxStayToggleValue,
      quotaToggleValue,
      minStayArrivalToggleValue,
      maxStayArrivalToggleValue,
      maxAvailToggleValue,
      closedToggleValue,
      closedArrivalToggleValue,
      closedDepartureToggleValue,
      minStayInput,
      maxStayInput,
      quotaInput,
      minStayArrivalInput,
      maxStayArrivalInput,
      maxAvailInput,
      closedValue,
      closedArrivalValue,
      closedDepartureValue,
      rangeDates,
      numberItemsRulesOverwrite,
      disallowSave,
      setAllDays,
      toggleIndividualDay,
      resetValues,
      saveItemsRules,
    };
  },
});
</script>
<style lang="scss" scoped>
.main-content {
  display: flex;
  flex-direction: column;
  height: auto;
  min-width: 320px;
  .dates {
    display: flex;
    flex-direction: column;
    .from,
    .to {
      max-width: 100%;
      display: flex;
      flex-direction: column;
      .label {
        font-weight: bold;
      }
    }
  }
  .filters {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
    background-color: $secondary;
    padding: 1rem;
    .filter {
      margin-top: 1rem;
      &:nth-child(1) {
        margin-top: 0;
      }
      .label {
        font-weight: bold;
      }
      .select {
        width: 100%;
      }
    }
  }
  .week-days-section {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    .title {
      font-weight: bold;
    }
    .days {
      display: flex;
      flex-direction: column;
      margin-top: 0.5rem;

      .first,
      .second {
        display: flex;
        justify-content: space-between;

        .day {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 65px;
          .label {
            cursor: pointer;
            font-weight: bold;
            user-select: none;
          }
        }
      }
      .second {
        margin-top: 0.5rem;
      }
    }
  }
  .rules-section {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    background-color: $secondary;
    .title {
      font-weight: bold;
      margin-left: 0.5rem;
      margin-top: 0.5rem;
    }
    .rules {
      display: flex;
      flex-direction: column;
      .rule {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding-top: 0;
        padding-bottom: 0;
        padding: 0 1rem;
        .rule-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 45px;

          .left {
            display: flex;
            .toggle {
              margin-right: 0.5rem;
            }
            .label {
              cursor: pointer;
              user-select: none;
              font-weight: bold;
              width: 125px;
              margin-right: 0.5rem;
              font-size: 12px;
            }
          }
          .checkbox {
            margin-right: 10px;
          }
          &:last-child {
            margin-bottom: 0;
          }
          .custom-input {
            width: 25px;
            height: 25px;
          }
        }
      }
    }
  }
  .price-section {
    margin-top: 1rem;
    background-color: $secondary;
    padding: 1rem;
    .label {
      font-weight: bold;
    }
    .input {
      width: 100%;
    }
  }
  .items-to-overwrite {
    margin-top: 1rem;
    .number-to-overwrite {
      span {
        font-weight: bold;
      }
    }
    .rules-to-modify {
      width: 100%;
      display: flex;
      flex-direction: column;
      .label {
        text-decoration: underline;
      }
      .range,
      .availability-plans,
      .pricelists,
      .room-types,
      .pridces,
      .rules {
        flex: 1;
      }
    }
  }
  .buttons {
    padding: 1rem 0;
    .button {
      display: block;
      width: 100%;
      margin-top: 1rem;
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    width: 850px !important;
    height: fit-content;
    .dates {
      flex-direction: row;
      // justify-content: space-between;
      .from,
      .to {
        max-width: none;
        margin-right: 1rem;
      }
    }
    .filters {
      flex-direction: row;
      justify-content: space-between;
      .filter {
        margin-right: 1rem;
        margin-top: 0;
        width: 33%;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .week-days-section {
      .days {
        flex-direction: row;
        justify-content: space-between;
        .first,
        .second {
          flex: 1;
        }
        .second {
          margin-top: 0;
          margin-left: 2rem;
        }
      }
    }
    .rules-section {
      .rules {
        flex-direction: row;
        .rule {
          padding: 0.5rem;
          &:nth-child(1) {
            .rule-content {
              justify-content: flex-start;
            }
          }
          &:nth-child(2) {
            .rule-content {
              justify-content: center;
            }
          }
          &:nth-child(3) {
            .rule-content {
              justify-content: flex-end;
            }
          }
        }
      }
    }
    .price-section {
      .input {
        width: auto;
      }
    }
    .items-to-overwrite {
      .rules-to-modify {
        flex-direction: row;
      }
    }
    .buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 0;
      padding-bottom: 0;
      .button {
        width: auto;
        margin: 0;
        margin-left: 1rem;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
