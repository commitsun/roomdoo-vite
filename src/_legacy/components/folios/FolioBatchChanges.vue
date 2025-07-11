<template>
  <div class="main-content">
    <div class="header">
      <div class="folio-name">
        {{ folio.name }}
      </div>
      <div class="prices" v-if="modifiedReservations.filter((el) => el.selected).length > 0">
        <div class="old-price">{{ priceFolioBefore.toFixed(2) }}€</div>
        <CustomIcon
          class="arrow"
          imagePath="/app-images/trending-flat.svg"
          color="primary"
          width="32px"
          height="32px"
          v-if="priceFolioBefore !== priceFolioAfter"
        />
        <div class="new-price" v-if="priceFolioBefore !== priceFolioAfter">
          {{ priceFolioAfter.toFixed(2) }}€
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="filter">
        <div class="label">Checkin:</div>
        <DatePicker
          v-model="dateFrom"
          :showOtherMonths="false"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          size="small"
          :minDate="today"
          :maxDate="dateTo"
          :disabledDates="disabledCheckinDates"
          @monthChange="datePickerCheckinChanged($event)"
          @yearChange="datePickerCheckinChanged($event)"
        />
      </div>
      <div class="filter">
        <div class="label">Checkout:</div>
        <DatePicker
          v-model="dateTo"
          :showOtherMonths="false"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          size="small"
          :minDate="today"
          :disabledDates="disabledCheckoutDates"
          @monthChange="datePickerCheckoutChanged($event)"
          @yearChange="datePickerCheckoutChanged($event)"
        />
      </div>
      <div class="filter">
        <div
          class="label"
          :class="{
            error: validator.adults.$error,
          }"
        >
          Adultos:
        </div>
        <InputNumber
          class="input"
          v-model="adults"
          size="small"
          :inputStyle="{
            width: '100%',
          }"
          :invalid="validator.adults.$error"
        />
        <div class="error-message" v-if="validator.adults.$error">nº de adultos no válido</div>
      </div>
      <div class="filter">
        <div
          class="label"
          :class="{
            error: validator.children.$error,
          }"
        >
          Niños:
        </div>
        <InputNumber
          class="input"
          v-model="children"
          size="small"
          :inputStyle="{
            width: '100%',
          }"
          :invalid="validator.children.$error"
        />
        <div class="error-message" v-if="validator.children.$error">nº de niños no válido</div>
      </div>
    </div>

    <div class="filters">
      <div class="filter">
        <div class="label">Régimen:</div>
        <AppSelect
          size="small"
          class="select"
          optionLabel="name"
          optionValue="boardServiceId"
          placeholder="Selecciona opción"
          :options="commonBoardServices"
          v-model="selectedBoardService"
        />
      </div>
      <div class="filter">
        <div class="label">Servicios extra:</div>
        <MultiSelect
          size="small"
          class="select"
          v-model="selectedExtraServices"
          :options="extraServices"
          optionLabel="name"
          :optionValue="(el) => el"
          placeholder="Seleccionar servicio"
          :maxSelectedLabels="1"
          selectedItemsLabel="{0} servicios seleccionados"
          display="comma"
          :showToggleAll="false"
        />
      </div>
      <div class="filter">
        <div
          class="label"
          :class="{
            error: validator.fixedPricePerNight.$error,
          }"
        >
          Precio fijo noche:
        </div>
        <InputNumber
          v-model="fixedPricePerNight"
          size="small"
          class="input"
          mode="currency"
          currency="EUR"
          :invalid="validator.fixedPricePerNight.$error"
        />
        <div class="error-message" v-if="validator.fixedPricePerNight.$error">precio no válido</div>
      </div>
    </div>

    <div class="filters">
      <div class="filter">
        <div
          class="label"
          :class="{
            error: validator.percentDiscount.$error,
          }"
        >
          Porcentaje dto:
        </div>
        <InputNumber
          class="input"
          v-model="percentDiscount"
          inputId="percent"
          suffix="%"
          size="small"
          :minFractionDigits="0"
          :maxFractionDigits="2"
          :invalid="validator.percentDiscount.$error"
        />
        <div class="error-message" v-if="validator.percentDiscount.$error">
          porcentaje incorrecto
        </div>
      </div>
      <div
        class="filter toggle-container"
        :class="{
          disabled: !percentDiscount,
        }"
      >
        <ToggleSwitch v-model="isNightsDiscount" class="toggle" />
        <div class="label" @click="isNightsDiscount = !isNightsDiscount">Dto. noches</div>
      </div>
      <div
        class="filter toggle-container"
        :class="{
          disabled: !percentDiscount,
        }"
      >
        <ToggleSwitch v-model="isServicesDiscount" class="toggle" />
        <div class="label" @click="isServicesDiscount = !isServicesDiscount">Dto. servicios</div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Habitación</th>
            <th scope="col">Checkin</th>
            <th scope="col">Checkout</th>
            <th scope="col">Adultos</th>
            <th scope="col">Niños</th>
            <th scope="col">Régimen</th>
            <th scope="col">Servicios extra</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(reservation, reservationIndex) in modifiedReservations" :key="reservation.id">
            <!-- checkbox -->
            <td data-label="">
              <Checkbox
                binary
                class="checkbox"
                v-model="reservation.selected"
                @change="
                  buildNotAllowedCheckinDates(today.getMonth(), today.getFullYear());
                  buildNotAllowedCheckoutDates(today.getMonth(), today.getFullYear());
                  toggleSelectReservation(reservationIndex);
                "
              />
            </td>
            <!-- room name, room type name & sum reservation lines prices -->
            <td data-label="Room">
              {{
                reservation.isSplitted ? 'Reserva dividida' : roomShortName(reservation.roomId)
              }}-{{ roomTypeShortName(reservation.roomTypeId) }}
              <br />
              <span
                class="room-price"
                :class="{
                  modified:
                    reservation.reservationLines.reduce(
                      (a: number, b: ReservationLineInterface) =>
                        a + b.price * (1 - b.discount / 100),
                      0,
                    ) !==
                    reservations[reservationIndex].reservationLines.reduce(
                      (a: number, b: ReservationLineInterface) =>
                        a + b.price * (1 - b.discount / 100),
                      0,
                    ),
                }"
              >
                ({{
                  reservation.reservationLines
                    .reduce(
                      (a: number, b: ReservationLineInterface) =>
                        a + b.price * (1 - b.discount / 100),
                      0
                    )
                    .toFixed(2)
                }}
                €)
              </span>
            </td>
            <td
              data-label="Checkin"
              :class="{
                modified:
                  reservation.checkin.getTime() !==
                  reservations[reservationIndex].checkin.getTime(),
              }"
            >
              {{
                reservation.checkin.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </td>
            <td
              data-label="Checkout"
              :class="{
                modified:
                  reservation.checkout.getTime() !==
                  reservations[reservationIndex].checkout.getTime(),
              }"
            >
              {{
                reservation.checkout.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </td>
            <td
              data-label="Adults"
              :class="{
                modified: reservation.adults !== reservations[reservationIndex].adults,
              }"
            >
              {{ reservation.adults }}
            </td>
            <td
              data-label="Children"
              :class="{
                modified: reservation.children !== reservations[reservationIndex].children,
              }"
            >
              {{ reservation.children }}
            </td>
            <td
              data-label="Board services"
              :class="{
                modified:
                  reservation.extraServices
                    .filter((el) => el.isBoardService)
                    .map((el) =>
                      el.items
                        .map(
                          (i) =>
                            i.priceUnit * (i.discount !== 0 ? 1 - i.discount / 100 : 1) * i.quantity
                        )
                        .reduce((a, b) => a + b, 0)
                    )
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2) !==
                    reservations[reservationIndex].extraServices
                      .filter((el) => el.isBoardService)
                      .map((el) =>
                        el.items
                          .map(
                            (i) =>
                              i.priceUnit *
                              (i.discount !== 0 ? 1 - i.discount / 100 : 1) *
                              i.quantity
                          )
                          .reduce((a, b) => a + b, 0)
                      )
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2) ||
                  reservation.boardServiceId !== reservations[reservationIndex].boardServiceId,
              }"
            >
              {{ boardServiceName(reservation.boardServiceId) }} <br />
              (
              {{
                reservation.extraServices
                  .filter((el) => el.isBoardService)
                  .map((el) =>
                    el.items
                      .map(
                        (i) =>
                          i.priceUnit * (i.discount !== 0 ? 1 - i.discount / 100 : 1) * i.quantity
                      )
                      .reduce((a, b) => a + b, 0)
                  )
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
              }}
              €)
            </td>
            <td data-label="Extra services">
              <template v-for="(service, serviceIndex) in reservation?.extraServices">
                <Chip
                  v-if="!service.isBoardService"
                  :removable="!!service.serviceId"
                  @remove="removeOldExtraService(reservationIndex, serviceIndex, service.serviceId)"
                  :key="service.serviceId ?? service._uuid"
                  :label="service.name"
                  class="chip"
                />
              </template>
              <br />
              <span
                v-if="reservation.extraServices.filter((el) => !el.isBoardService).length > 0"
                :class="{
                  modified:
                    reservation.extraServices
                      .filter((el) => !el.isBoardService)
                      .map((el) =>
                        el.items
                          .map(
                            (i) =>
                              i.priceUnit *
                              (i.discount !== 0 ? 1 - i.discount / 100 : 1) *
                              i.quantity
                          )
                          .reduce((a, b) => a + b, 0)
                      )
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2) !==
                      reservations[reservationIndex].extraServices
                        .filter((el) => !el.isBoardService)
                        .map((el) =>
                          el.items
                            .map(
                              (i) =>
                                i.priceUnit *
                                (i.discount !== 0 ? 1 - i.discount / 100 : 1) *
                                i.quantity
                            )
                            .reduce((a, b) => a + b, 0)
                        )
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2) ||
                    (reservation.extraServices
                      .filter((el) => !el.isBoardService)
                      .map((el) => el.productId).length !==
                      reservations[reservationIndex].extraServices
                        .filter((el) => !el.isBoardService)
                        .map((el) => el.productId).length &&
                      reservation.extraServices
                        .filter((el) => !el.isBoardService)
                        .map((el) => el.productId)
                        .every((el) =>
                          reservation.extraServices.map((el) => el.productId).includes(el)
                        ) &&
                      reservations[reservationIndex].extraServices
                        .filter((el) => !el.isBoardService)
                        .map((el) => el.productId)
                        .every((el) =>
                          reservation.extraServices.map((el) => el.productId).includes(el)
                        )),
                }"
              >
                (
                {{
                  reservation.extraServices
                    .filter((el) => !el.isBoardService)
                    .map((el) =>
                      el.items?.map(
                        (i) =>
                          i.priceUnit * (i.discount !== 0 ? 1 - i.discount / 100 : 1) * i.quantity
                      )
                    )
                    .reduce((a, b) => a.concat(b), [])
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)
                }}
                €)
              </span>
            </td>
            <td
              data-label="Price"
              :class="{
                modified:
                  (
                    reservation.reservationLines.reduce(
                      (a, b) => a + b.price * (1 - b.discount / 100),
                      0
                    ) +
                    [...reservation.extraServices.map((el) => el.items)]
                      .reduce((a, b) => a.concat(b), [])
                      .reduce((a, b) => a + b.priceUnit * (1 - b.discount / 100) * b.quantity, 0)
                  ).toFixed(2) !==
                  (
                    reservations[reservationIndex].reservationLines.reduce(
                      (a, b) => a + b.price * (1 - b.discount / 100),
                      0
                    ) +
                    [...reservations[reservationIndex].extraServices.map((el) => el.items)]
                      .reduce((a, b) => a.concat(b), [])
                      .reduce((a, b) => a + b.priceUnit * (1 - b.discount / 100) * b.quantity, 0)
                  ).toFixed(2),
              }"
            >
              {{
                (
                  reservation.reservationLines.reduce(
                    (a, b) => a + b.price * (1 - b.discount / 100),
                    0
                  ) +
                  [...reservation.extraServices.map((el) => el.items)]
                    .reduce((a, b) => a.concat(b), [])
                    .reduce((a, b) => a + b.priceUnit * (1 - b.discount / 100) * b.quantity, 0)
                ).toFixed(2)
              }}
              €
            </td>
            <td class="toggle-button-container">
              <ToggleButton
                v-model="reservation.selected"
                onLabel="Seleccionada"
                offLabel="No seleccionada"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                class="select-button"
                @change="
                  buildNotAllowedCheckinDates(today.getMonth(), today.getFullYear());
                  buildNotAllowedCheckoutDates(today.getMonth(), today.getFullYear());
                  toggleSelectReservation(reservationIndex);
                "
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="buttons">
      <AppButton
        label="Guardar"
        @click="saveChanges(true)"
        raised
        size="small"
        class="button"
        :disabled="!isThereAnyChange"
        :class="{ disabled: !isThereAnyChange }"
      />
      <AppButton
        label="Cancelar"
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
import { computed, defineComponent, onMounted, ref, watch, type Ref } from 'vue';
import DatePicker, {
  type DatePickerMonthChangeEvent,
  type DatePickerYearChangeEvent,
} from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import ToggleButton from 'primevue/togglebutton';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';

import { v4 as uuidv4 } from 'uuid';

import useVuelidate from '@vuelidate/core';
import { integer, decimal, minValue, maxValue } from '@vuelidate/validators';
import { usePlanning } from '@/legacy/utils/usePlanning';

import { useStore } from '@/legacy/store';
import { useRoute, useRouter } from 'vue-router';

import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import type { BatchChangesInterface } from '@/legacy/interfaces/BatchChangesInterface';
import { dialogService } from '@/legacy/services/DialogService';
import type { RoomTypePrices } from '@/legacy/interfaces/RoomTypePrices';
import type { BoardServicePrices } from '@/legacy/interfaces/BoardServicePrices';
import type { ExtraServicePrices } from '@/legacy/interfaces/ExtraServicePrices';
import utilsDates, { ONE_DAY_IN_MS } from '@/legacy/utils/dates';
import type { AvailabilityInterface } from '@/legacy/interfaces/AvailabilityInterface';

import type { ReservationLineInterface } from '@/legacy/interfaces/ReservationLineInterface';
import type { ServiceLineInterface } from '@/legacy/interfaces/ServiceLineInterface';
import type { ProductInterface } from '@/legacy/interfaces/ProductInterface';
import type { ServiceInterface } from '@/legacy/interfaces/ServiceInterface';
import type { FolioInterface } from '@/legacy/interfaces/FolioInterface';

export default defineComponent({
  components: {
    CustomIcon,
    DatePicker,
    InputNumber,
    AppSelect: Select,
    ToggleSwitch,
    Checkbox,
    Chip,
    ToggleButton,
    AppButton: Button,
    MultiSelect,
  },
  props: {
    folio: {
      type: Object as () => FolioInterface,
      required: true,
    },
    fromBookingEngine: {
      type: Boolean,
      default: false,
      required: false,
    },
    reservations: {
      type: Array as () => BatchChangesInterface[],
      required: true,
    },
  },

  setup(props, context) {
    const route = useRoute();
    const router = useRouter();

    const store = useStore();
    const { refreshPlanning } = usePlanning();

    // consts today & tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime());
    tomorrow.setDate(today.getDate() + 1);

    const modifiedReservations = ref([] as BatchChangesInterface[]);
    const dateFrom = ref();
    const dateTo = ref();
    const disabledCheckinDates: Ref<Date[]> = ref([]);
    const disabledCheckoutDates: Ref<Date[]> = ref([]);
    const checkinAvailabilitys = ref([] as AvailabilityInterface[]);
    const checkoutAvailabilitys = ref([] as AvailabilityInterface[]);
    const adults: Ref<number | null> = ref(null);
    const children: Ref<number | null> = ref(null);
    const selectedBoardService = ref(-1);
    const selectedExtraService = ref();
    const selectedExtraServices = ref<(ProductInterface & { _uuid: string })[]>([]);
    const percentDiscount = ref();
    const isNightsDiscount = ref();
    const isServicesDiscount = ref();
    const fixedPricePerNight = ref();
    const roomPrices = ref([] as RoomTypePrices[]);
    const boardServicePrices = ref([] as BoardServicePrices[]);
    const extraServicePrices = ref([] as ExtraServicePrices[]);
    const calendarServicesToRemove = ref([] as number[]);
    const extraServices = computed(() => store.state.products.products);

    const maxAdults = computed(() =>
      Math.min(
        ...store.state.rooms.rooms
          .filter((el) =>
            modifiedReservations.value
              .filter((r) => r.selected)
              .map((r) => r.roomId)
              .includes(el.id)
          )
          .map((el) => el.capacity)
      )
    );

    const minCheckin = computed(
      () =>
        new Date(
          Math.min(
            ...modifiedReservations.value
              .filter((el) => el.selected)
              .map((el) => el.checkin.getTime())
          )
        )
    );
    const maxCheckout = computed(
      () =>
        new Date(
          Math.max(
            ...modifiedReservations.value
              .filter((el) => el.selected)
              .map((el) => el.checkout.getTime())
          )
        )
    );

    const minCheckout = computed(() => {
      const date = new Date(dateFrom.value);
      date.setDate(date.getDate() + 1);
      return date;
    });

    const commonBoardServices = computed(() => {
      const result: { name: string; boardServiceId: number }[] = [];
      const selectedRoomTypeIds = Array.from(
        new Set(modifiedReservations.value.filter((el) => el.selected).map((el) => el.roomTypeId))
      );
      if (selectedRoomTypeIds.length > 0) {
        let ret = new Set(store.state.boardServices.boardServices.map((bs) => bs.boardServiceId));
        selectedRoomTypeIds.forEach((roomTypeId) => {
          const setBoardServicesMappedRoomTypeId = new Set(
            store.state.boardServices.boardServices
              .filter((bs) => bs.roomTypeId === roomTypeId)
              .map((bs) => bs.boardServiceId)
          );
          ret = new Set([...ret].filter((x) => setBoardServicesMappedRoomTypeId.has(x)));
        });
        Array.from(ret).forEach((el) => {
          const toAdd = store.state.boardServices.boardServices.find(
            (bs) => bs.boardServiceId === el
          );
          if (toAdd) {
            result.push({
              name: toAdd.name,
              boardServiceId: toAdd.boardServiceId,
            });
          }
        });
      }
      return [
        {
          name: 'Sin régimen seleccionado',
          boardServiceId: -1,
        },
        {
          name: 'Solo alojamiento',
          boardServiceId: 0,
        },
        ...result,
      ];
    });

    const priceFolioBefore = computed(() => {
      // selected reservations
      const reservationsSelectedIds = modifiedReservations.value
        .filter((el) => el.selected)
        .map((el) => el.id);

      // reservation lines
      const reservationLinesTotalPrice = props.reservations
        .filter((el) => reservationsSelectedIds.includes(el.id))
        .map((el) =>
          el.reservationLines.map((l) => l.price * (l.discount !== 0 ? 1 - l.discount / 100 : 1))
        )
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => a + b, 0);

      // extra service lines
      const extraServiceLinesTotalPrice = props.reservations
        .filter((el) => reservationsSelectedIds.includes(el.id))
        .map((el) =>
          el.extraServices
            .map((e) =>
              e.items.map(
                (i) => i.priceUnit * (i.discount !== 0 ? i.discount / 100 : 1) * i.quantity
              )
            )
            .reduce((a, b) => a.concat(b), [])
        )
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => a + b, 0);

      return reservationLinesTotalPrice + extraServiceLinesTotalPrice;
    });

    const priceFolioAfter = computed(() => {
      // reservation lines
      const reservationLinesTotalPrice = modifiedReservations.value
        .filter((el) => el.selected)
        .map((el) =>
          el.reservationLines.map((l) => l.price * (l.discount !== 0 ? 1 - l.discount / 100 : 1))
        )
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => a + b, 0);

      // extra service lines
      const extraServiceLinesTotalPrice = modifiedReservations.value
        .filter((el) => el.selected)
        .map((el) =>
          el.extraServices
            .map((e) =>
              e.items.map(
                (i) => i.priceUnit * (i.discount !== 0 ? 1 - i.discount / 100 : 1) * i.quantity
              )
            )
            .reduce((a, b) => a.concat(b), [])
        )
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => a + b, 0);

      return reservationLinesTotalPrice + extraServiceLinesTotalPrice;
    });

    const isThereAnyChange = computed(() => {
      let result = false;
      if (
        (dateFrom.value ||
          dateTo.value ||
          adults.value ||
          children.value ||
          selectedBoardService.value !== -1 ||
          selectedExtraServices.value.length > 0 ||
          fixedPricePerNight.value ||
          priceFolioBefore.value !== priceFolioAfter.value ||
          (percentDiscount.value && (isNightsDiscount.value || isServicesDiscount))) &&
        !validator.value.$error
      ) {
        result = true;
      }
      return result;
    });

    const validPrice = (numberValue: number) => {
      if (numberValue !== null && numberValue <= 0) {
        return false;
      }
      return true;
    };

    const validDiscount = (numberValue: number) => {
      if (numberValue !== null && (numberValue < 0 || numberValue > 100)) {
        return false;
      }
      return true;
    };

    const validationRules = computed(() => ({
      adults: {
        integer,
        minValue: minValue(1),
        maxValue: maxValue(maxAdults.value),
      },
      children: {
        integer,
        minValue: minValue(0),
      },
      fixedPricePerNight: {
        decimal,
        validPrice,
      },
      percentDiscount: {
        decimal,
        validDiscount,
      },
    }));

    const validator = useVuelidate(validationRules, {
      adults,
      children,
      fixedPricePerNight,
      percentDiscount,
    });

    const updateCheckinAvailabilitys = async (from: Date) => {
      const firstDayOfMonth = new Date(from.getFullYear(), from.getMonth(), 1);
      const lastDayOfMonth = new Date(
        from.getFullYear(),
        from.getMonth(),
        utilsDates.daysInMonth(from.getMonth(), from.getFullYear())
      );

      await store.dispatch('availability/fetchAvailability', {
        pmsPropertyId: store.state.properties.activeProperty?.id,
        from: firstDayOfMonth,
        to: lastDayOfMonth,
        currentLines: !props.fromBookingEngine
          ? store.state.reservationLines.reservationLines.map((el) => el.id)
          : [],
      });
      checkinAvailabilitys.value = store.state.availability.availability;
    };

    const updatecheckoutAvailabilitys = async (from: Date, to: Date) => {
      const lastDayOfCheckoutMonth = new Date(
        to.getFullYear(),
        to.getMonth(),
        utilsDates.daysInMonth(to.getMonth(), to.getFullYear())
      );
      await store.dispatch('availability/fetchAvailability', {
        pmsPropertyId: store.state.properties.activeProperty?.id,
        from,
        to: lastDayOfCheckoutMonth,
        currentLines: !props.fromBookingEngine
          ? store.state.reservationLines.reservationLines.map((el) => el.id)
          : [],
      });
      checkoutAvailabilitys.value = store.state.availability.availability;
    };

    const buildNotAllowedCheckinDates = async (month: number, year: number) => {
      if (modifiedReservations.value.filter((el) => el.selected).length === 0) {
        return;
      }
      disabledCheckinDates.value = [];

      const selectedRoomIds = modifiedReservations.value
        .filter((el) => el.selected)
        .map((el) => el.roomId);

      await updateCheckinAvailabilitys(new Date(year, month, 1));

      const datesInRange = utilsDates.getDatesRange(
        new Date(year, month, 1),
        new Date(year, month, utilsDates.daysInMonth(month, year))
      );

      datesInRange.forEach((date) => {
        if (date < today) {
          disabledCheckinDates.value.push(date);
          return;
        }

        const availabilityRoomIds = checkinAvailabilitys.value.find(
          (el) => el.date.getTime() === date.getTime()
        )?.roomIds;

        const isUnavailable = availabilityRoomIds
          ? !selectedRoomIds.every((roomId) => availabilityRoomIds.includes(roomId))
          : true;

        if (isUnavailable) {
          disabledCheckinDates.value.push(date);
        }
      });
    };

    const buildNotAllowedCheckoutDates = async (month: number, year: number) => {
      if (modifiedReservations.value.filter((el) => el.selected).length === 0) {
        return;
      }
      disabledCheckoutDates.value = [];

      const selectedRoomIds = modifiedReservations.value
        .filter((el) => el.selected)
        .map((el) => el.roomId);

      let isAvailabilityFromCheckin = true;

      await updatecheckoutAvailabilitys(
        minCheckin.value,
        new Date(year, month, utilsDates.daysInMonth(month, year))
      );

      // rango de fechas entre el inicio del mes del checkin y el último día del mes
      const datesInRange = utilsDates.getDatesRange(
        new Date(year, minCheckin.value.getMonth(), 1),
        new Date(year, month, utilsDates.daysInMonth(month, year))
      );

      datesInRange.forEach((date) => {
        const isBeforeTodayOrFrom = date < today || date <= minCheckin.value;
        if (isBeforeTodayOrFrom) {
          disabledCheckoutDates.value.push(date);
          return;
        }

        const availabilityRoomIds = checkoutAvailabilitys.value.find(
          (el) => el.date.getTime() === date.getTime()
        )?.roomIds;

        const isUnavailable =
          !availabilityRoomIds ||
          !selectedRoomIds.every((roomId) => availabilityRoomIds.includes(roomId)) ||
          !isAvailabilityFromCheckin;
        if (isUnavailable) {
          const dateToInclude = new Date(date);
          dateToInclude.setDate(date.getDate() + 1);
          disabledCheckoutDates.value.push(dateToInclude);
          isAvailabilityFromCheckin = false;
        }
      });
    };

    // method to call from primevue datepicker adjusting month number
    const datePickerCheckinChanged = async (
      evt: DatePickerMonthChangeEvent | DatePickerYearChangeEvent
    ) => {
      await buildNotAllowedCheckinDates(evt.month - 1, evt.year);
    };

    // method to call from primevue datepicker adjusting month number
    const datePickerCheckoutChanged = async (
      evt: DatePickerMonthChangeEvent | DatePickerYearChangeEvent
    ) => {
      await buildNotAllowedCheckoutDates(evt.month - 1, evt.year);
    };

    const rebuildExtraServices = () => {
      modifiedReservations.value.forEach((el, index) => {
        if (el.selected) {
          // extra service of each reservation starts with board services
          el.extraServices = el.extraServices.filter((ex) => ex.isBoardService);
          // build old extra services from props
          props.reservations[index].extraServices
            .filter((ex) => !ex.isBoardService)
            .forEach((extraService) => {
              let items: ServiceLineInterface[] = [];
              // recover the product
              const product = store.state.products.products.find(
                (pr) => pr.id === extraService.productId
              );
              if (product) {
                // if product is per day
                if (product.perDay) {
                  // adjust dates to build extra services lines
                  let dateStart: Date;
                  let dateEnd: Date;
                  // if consumed on before dateStart is the same day as checkin
                  if (product.consumedOn === 'before') {
                    dateStart = new Date(el.checkin.getTime());
                    dateEnd = new Date(el.checkout.getTime() - ONE_DAY_IN_MS);
                  } else {
                    // if consumed on after dateStart is the next day to checkin
                    dateStart = new Date(el.checkin.getTime() + ONE_DAY_IN_MS);
                    dateEnd = new Date(el.checkout.getTime());
                  }
                  // filter extra service lines to get only the ones between
                  // dateStart and dateEnd
                  items = extraService.items.filter(
                    (i) =>
                      (i.date as Date).getTime() <= dateEnd.getTime() &&
                      (i.date as Date).getTime() >= dateStart.getTime()
                  );
                  // iterate between dateStart and dateEnd to build extra service lines
                  utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                    // get item if exist in items
                    const item = items.find((i) => (i.date as Date).getTime() === date.getTime());
                    // if item does not exist
                    if (!item) {
                      // get price for extra service date
                      const price = extraServicePrices.value
                        .find((f) => f.productId === product.id)
                        ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;
                      // if price exist
                      if (price) {
                        let discount = 0;
                        if (isServicesDiscount.value) {
                          discount = percentDiscount.value;
                        }
                        // add extra service line
                        items.push({
                          date,
                          discount,
                          quantity: product.perPerson ? el.adults : 1,
                          priceUnit: price,
                        });
                      }
                    }
                  });
                } else {
                  // if product is not per day
                  // get price for extra service date = today
                  const price = extraServicePrices.value
                    .find((f) => f.productId === product.id)
                    ?.prices.find((pr) => pr.date.getTime() === today.getTime())?.price;
                  // if price exist
                  if (price) {
                    let discount = 0;
                    if (isServicesDiscount.value) {
                      discount = percentDiscount.value;
                    }
                    // add extra service line
                    items = [
                      {
                        date: new Date(),
                        discount,
                        quantity: product.perPerson ? el.adults : 1,
                        priceUnit: price,
                      },
                    ];
                  }
                }
              }
              // add extra service to reservation
              el.extraServices.push({
                isBoardService: extraService.isBoardService,
                items,
                name: extraService.name,
                productId: extraService.productId,
                serviceId: extraService.serviceId,
                fromBatchChanges: false,
              });
            });

          // build new extra services from selectedExtraServices
          selectedExtraServices.value.forEach((service) => {
            // recover the product
            const product = extraServicePrices.value.find((p) => p.productId === service.id);
            // if product exists
            if (product) {
              const items: ServiceLineInterface[] = [];
              // if product is per day
              if (product.perDay) {
                // adjust dates to build extra services lines
                let dateStart;
                let dateEnd;
                // if consumed on before dateStart is the same day as checkin
                if (product.consumedOn === 'before') {
                  dateStart = new Date(el.checkin.getTime());
                  dateEnd = new Date(el.checkout.getTime() - ONE_DAY_IN_MS);
                } else {
                  //  if consumed on after dateStart is the next day to checkin
                  dateStart = new Date(el.checkin.getTime() + ONE_DAY_IN_MS);
                  dateEnd = new Date(el.checkout.getTime());
                }
                // iterate between dateStart and dateEnd to build extra service lines
                utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                  // get price for extra service date
                  const priceUnit =
                    extraServicePrices.value
                      .find((pr) => pr.productId === product.productId)
                      ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price ?? 0;
                  let discount = 0;
                  if (isServicesDiscount.value) {
                    discount = percentDiscount.value;
                  }
                  //  add extra service line
                  items.push({
                    priceUnit,
                    date,
                    quantity: product.perPerson ? el.adults : 1,
                    discount,
                  });
                });
              } else {
                // if product is not per day
                const priceUnit =
                  extraServicePrices.value
                    .find((pr) => pr.productId === product.productId)
                    ?.prices.find((pr) => pr.date.getTime() === today.getTime())?.price ?? 0;
                let discount = 0;
                if (isServicesDiscount.value) {
                  discount = percentDiscount.value;
                }
                // add extra service line
                items.push({
                  priceUnit,
                  date: new Date(),
                  quantity: product.perPerson ? el.adults : 1,
                  discount,
                });
              }
              // add extra service to reservation
              el.extraServices.push({
                productId: product.productId,
                name: product.name,
                items,
                isBoardService: false,
                fromBatchChanges: true,
                _uuid: service._uuid,
              });
            }
          });
        }
      });
    };

    const selectExtraService = () => {
      const product = store.state.products.products.find(
        (el) => el.id === selectedExtraService.value
      );
      if (product) {
        selectedExtraServices.value.push({
          ...product,
          _uuid: uuidv4(),
        });
        rebuildExtraServices();
      }
      selectedExtraService.value = null;
    };

    const removeOldExtraService = (
      reservationIndex: number,
      serviceIndex: number,
      serviceId?: number
    ) => {
      modifiedReservations.value[reservationIndex].extraServices.splice(serviceIndex, 1);
      if (serviceId) {
        calendarServicesToRemove.value.push(serviceId);
      }
    };

    const roomShortName = (roomId: number) =>
      store.state.rooms.rooms.find((el) => el.id === roomId)?.shortName;

    const roomTypeShortName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.defaultCode;

    const boardServiceName = (boardServiceId: number) =>
      store.state.boardServices.boardServices.find((el) => el.id === boardServiceId)?.name ??
      'Solo alojamiento';

    const loadPrices = async (checkinParam: Date, checkoutParam: Date) => {
      roomPrices.value = [];
      boardServicePrices.value = [];
      extraServicePrices.value = [];
      await Promise.all(
        Array.from(new Set(props.reservations.map((el) => el.roomTypeId))).map(
          async (roomTypeId) => {
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              pricelistId:
                store.state.pricelists.activePricelist?.id ??
                store.state.folios.currentFolio?.pricelistId,
              roomTypeId,
              dateFrom: checkinParam,
              dateTo: checkoutParam,
            });
            roomPrices.value.push({
              roomTypeId,
              prices: store.state.prices.prices,
            });
          }
        )
      );

      // pre load room type prices
      const roomTypeIds = Array.from(new Set(props.reservations.map((el) => el.roomTypeId)));
      await roomTypeIds.reduce(async (memo, roomTypeId) => {
        await memo;
        await store.dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId: store.state.pricelists.activePricelist?.id,
          roomTypeId,
          dateFrom: checkinParam,
          dateTo: checkoutParam,
        });
        roomPrices.value.push({
          roomTypeId,
          prices: store.state.prices.prices,
        });
      }, undefined as unknown);

      // pre load board service prices
      const boardServiceRoomTypeIds = store.state.boardServices.boardServices
        .filter((el) => roomTypeIds.includes(el.roomTypeId))
        .map((el) => el.id);

      await boardServiceRoomTypeIds.reduce(async (memo, boardServiceId) => {
        await memo;
        // fetch board service lines
        await store.dispatch('boardServiceLines/fetchBoardServiceLines', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          boardServiceId,
        });

        await store.state.boardServiceLines.boardServiceLines.reduce(
          async (memo2, boardServiceLine) => {
            await memo2;
            const payloadPrices = {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              pricelistId:
                store.state.pricelists.activePricelist?.id ??
                store.state.folios.currentFolio?.pricelistId,
              boardServiceId,
              dateFrom: checkinParam,
              dateTo: checkoutParam,
              boardServiceLineId: boardServiceLine.id,
            };
            await store.dispatch('prices/fetchPrices', payloadPrices);
            boardServicePrices.value.push({
              name: boardServiceLine.name,
              productId: boardServiceLine.productId,
              boardServiceId,
              boardServiceLineId: boardServiceLine.id,
              isAdults: boardServiceLine.isAdults,
              isChildren: boardServiceLine.isChildren,
              prices: store.state.prices.prices,
            });
          },
          undefined as unknown
        );
      }, undefined as unknown);

      await store.state.products.products.reduce(async (memo, product) => {
        await memo;
        await store.dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId:
            store.state.pricelists.activePricelist?.id ??
            store.state.folios.currentFolio?.pricelistId,
          productId: product.id,
          dateFrom: checkinParam,
          dateTo: checkoutParam,
        });
        const pricesForDates = store.state.prices.prices;
        await store.dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId:
            store.state.pricelists.activePricelist?.id ??
            store.state.folios.currentFolio?.pricelistId,
          productId: product.id,
          dateFrom: today,
          dateTo: today,
        });
        extraServicePrices.value.push({
          name: product.name,
          productId: product.id,
          perDay: product.perDay,
          perPerson: product.perPerson,
          prices: [...pricesForDates, ...store.state.prices.prices],
          consumedOn: product.consumedOn,
        });
      }, undefined as unknown);
    };

    const rebuildReservationLines = () => {
      // iterate modified reservations
      modifiedReservations.value.forEach((reservation, index) => {
        if (reservation.selected) {
          // if checkin or checkout global dates are not empty
          if (dateFrom.value || dateTo.value) {
            const reservationLines: ReservationLineInterface[] = [];
            // iterate between checkin and checkout
            utilsDates.getDatesRange(reservation.checkin, reservation.checkout).forEach((date) => {
              // if iteration date is not checkout
              if (reservation.checkout.getTime() !== date.getTime()) {
                const price = roomPrices.value
                  .find((p) => p.roomTypeId === reservation.roomTypeId)
                  ?.prices.find((d) => d.date.getTime() === date.getTime())?.price;
                // if price exist
                if (price) {
                  let lineDiscount = 0;
                  if (isNightsDiscount.value) {
                    if (!Number.isNaN(parseFloat(percentDiscount.value))) {
                      lineDiscount = parseFloat(percentDiscount.value);
                    }
                  }
                  // add reservation line
                  reservationLines.push({
                    date,
                    price,
                    discount: lineDiscount,
                    roomId: reservation.roomId,
                    pmsPropertyId: store.state.properties.activeProperty?.id ?? 0,
                    reservationId: reservation.id,
                  });
                }
              }
            });
            // set reservation lines to reservation
            reservation.reservationLines = reservationLines;
          } else {
            // if checkin and checkout global dates are empty
            // restart reservation lines to original reservation lines
            reservation.reservationLines = props.reservations[index].reservationLines;
          }
        }
      });
    };

    const rebuildBoardServiceLines = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await modifiedReservations.value.reduce(async (memo, res, index) => {
          await memo;
          if (res.selected) {
            // remove extra service and items that come from board services
            res.extraServices = res.extraServices.filter((ex) => !ex.isBoardService);
            // keep the original services and items but should rebuild
            // bc of the dates & adults & children
            if (selectedBoardService.value === -1) {
              res.boardServiceId = props.reservations[index].boardServiceId;

              // add non-board services from props
              res.extraServices = res.extraServices.filter((ex) => !ex.isBoardService);
              // iterate board services from props
              props.reservations[index].extraServices
                .filter((ex) => ex.isBoardService)
                .forEach((p) => {
                  let items: ServiceLineInterface[] = [];
                  const product = store.state.products.products.find((pr) => pr.id === p.productId);
                  if (product) {
                    if (product.perDay) {
                      let dateStart: Date;
                      let dateEnd: Date;
                      if (product.consumedOn === 'before') {
                        dateStart = new Date(res.checkin.getTime());
                        dateEnd = new Date(res.checkout.getTime() - ONE_DAY_IN_MS);
                      } else {
                        dateStart = new Date(res.checkin.getTime() + ONE_DAY_IN_MS);
                        dateEnd = new Date(res.checkout.getTime());
                      }
                      items = p.items.filter(
                        (i) =>
                          (i.date as Date).getTime() <= dateEnd.getTime() &&
                          (i.date as Date).getTime() >= dateStart.getTime()
                      );
                      utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                        const item = p.items.find(
                          (i) => (i.date as Date).getTime() === date.getTime()
                        );
                        const boardServicePriceForChildren = boardServicePrices.value
                          .find(
                            (f) => f.boardServiceLineId === p.boardServiceLineId && f.isChildren
                          )
                          ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;
                        const boardServicePriceForAdults = boardServicePrices.value
                          .find((f) => f.boardServiceLineId === p.boardServiceLineId && f.isAdults)
                          ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;
                        const boardServicePriceForAdultsAndChildren = boardServicePrices.value
                          .find(
                            (f) =>
                              f.boardServiceLineId === p.boardServiceLineId &&
                              f.isAdults &&
                              f.isChildren
                          )
                          ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;

                        let qty = 1;
                        let priceUnit = 0;
                        if (boardServicePriceForAdultsAndChildren) {
                          qty = res.adults + (res.children ?? 0);
                          priceUnit = boardServicePriceForAdultsAndChildren;
                        } else if (boardServicePriceForChildren) {
                          qty = res.children;
                          priceUnit = boardServicePriceForChildren;
                        } else if (boardServicePriceForAdults) {
                          qty = res.adults;
                          priceUnit = boardServicePriceForAdults;
                        }
                        if (
                          !item &&
                          (boardServicePriceForAdultsAndChildren ||
                            boardServicePriceForAdults ||
                            boardServicePriceForChildren)
                        ) {
                          let discount = 0;
                          if (isServicesDiscount.value) {
                            if (!Number.isNaN(parseFloat(percentDiscount.value))) {
                              discount = parseFloat(percentDiscount.value);
                            }
                          }
                          items.push({
                            date,
                            discount,
                            quantity: qty,
                            priceUnit: priceUnit ?? 0,
                          });
                        }
                      });
                    } else {
                      items.push({
                        priceUnit:
                          store.state.prices.prices.find(
                            (el) =>
                              el.date.getTime() ===
                              new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                today.getDate()
                              ).getTime()
                          )?.price ?? 0,
                        date: today,
                        quantity: product.perPerson ? res.adults : 1,
                        discount: 0,
                      });
                    }
                    if (items.every((i) => i.quantity > 0)) {
                      res.extraServices.push({
                        isBoardService: true,
                        items,
                        name: p.name,
                        productId: p.productId,
                        serviceId: p.serviceId,
                        fromBatchChanges: false,
                        boardServiceLineId: p.boardServiceLineId,
                      });
                    }
                  }
                });
            } else if (selectedBoardService.value === 0) {
              // no board service
              res.boardServiceId = 0;
            } else {
              // selected board service
              res.boardServiceId = selectedBoardService.value;
              const boardServiceRoomType = store.state.boardServices.boardServices.find(
                (el) =>
                  el.boardServiceId === selectedBoardService.value &&
                  el.roomTypeId === res.roomTypeId
              );
              res.boardServiceId = boardServiceRoomType?.id ?? 0;
              await store.dispatch('boardServiceLines/fetchBoardServiceLines', {
                pmsPropertyId: store.state.properties.activeProperty?.id,
                boardServiceId: boardServiceRoomType?.id,
              });
              store.state.boardServiceLines.boardServiceLines.forEach((bsl) => {
                const items: ServiceLineInterface[] = [];
                const product = store.state.products.products.find((pr) => pr.id === bsl.productId);
                if (product) {
                  if (product.perDay) {
                    let dateStart;
                    let dateEnd;
                    if (product.consumedOn === 'before') {
                      dateStart = new Date(res.checkin.getTime());
                      dateEnd = new Date(res.checkout.getTime() - ONE_DAY_IN_MS);
                    } else {
                      dateStart = new Date(res.checkin.getTime() + ONE_DAY_IN_MS);
                      dateEnd = new Date(res.checkout.getTime());
                    }
                    utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                      const boardServicePriceForChildren = boardServicePrices.value
                        .find((f) => f.boardServiceLineId === bsl.id && f.isChildren)
                        ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;
                      const boardServicePriceForAdults = boardServicePrices.value
                        .find((f) => f.boardServiceLineId === bsl.id && f.isAdults)
                        ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;
                      const boardServicePriceForAdultsAndChildren = boardServicePrices.value
                        .find((f) => f.boardServiceLineId === bsl.id && f.isAdults && f.isChildren)
                        ?.prices.find((pr) => pr.date.getTime() === date.getTime())?.price;

                      let qty = 1;
                      let priceUnit = 0;
                      if (boardServicePriceForAdultsAndChildren) {
                        qty = res.adults + (res.children ?? 0);
                        priceUnit = boardServicePriceForAdultsAndChildren;
                      } else if (boardServicePriceForChildren) {
                        qty = res.children;
                        priceUnit = boardServicePriceForChildren;
                      } else if (boardServicePriceForAdults) {
                        qty = res.adults;
                        priceUnit = boardServicePriceForAdults;
                      }
                      let discount = 0;
                      if (isServicesDiscount.value) {
                        if (!Number.isNaN(parseFloat(percentDiscount.value))) {
                          discount = parseFloat(percentDiscount.value);
                        }
                      }
                      items.push({
                        priceUnit,
                        date,
                        quantity: qty,
                        discount,
                      });
                    });
                  } else {
                    let discount = 0;
                    if (isServicesDiscount.value) {
                      if (!Number.isNaN(parseFloat(percentDiscount.value))) {
                        discount = parseFloat(percentDiscount.value);
                      }
                    }
                    items.push({
                      priceUnit:
                        store.state.prices.prices.find(
                          (el) =>
                            el.date.getTime() ===
                            new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              today.getDate()
                            ).getTime()
                        )?.price ?? 0,
                      date: today,
                      quantity: product.perPerson ? res.adults : 1,
                      discount,
                    });
                  }
                  if (items.every((i) => i.quantity > 0)) {
                    res.extraServices.push({
                      isBoardService: true,
                      boardServiceLineId: bsl.id,
                      items,
                      name: bsl.name,
                      productId: bsl.productId,
                      fromBatchChanges: true,
                    });
                  }
                }
              });
            }
          }
        }, undefined as unknown);
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

    const adjustDiscounts = () => {
      modifiedReservations.value.forEach((el, index) => {
        if (el.selected) {
          if (percentDiscount.value || percentDiscount.value === 0) {
            if (isNightsDiscount.value) {
              el.reservationLines.forEach((line) => {
                line.discount = percentDiscount.value;
              });
            } else {
              el.reservationLines.forEach((line) => {
                const oldDiscount = props.reservations[index].reservationLines.find(
                  (rl) => (rl.date as Date).getTime() === (line.date as Date).getTime()
                )?.discount;
                line.discount = oldDiscount ?? 0;
              });
            }
            if (isServicesDiscount.value) {
              el.extraServices.forEach((ex) => {
                ex.items.forEach((i) => {
                  i.discount = percentDiscount.value;
                });
              });
            } else {
              el.extraServices.forEach((ex) => {
                ex.items.forEach((i) => {
                  const oldDiscount = props.reservations[index].extraServices
                    .find((es) => es.serviceId === ex.serviceId)
                    ?.items.find(
                      (it) => new Date(it.date).getTime() === new Date(i.date).getTime()
                    )?.discount;
                  i.discount = oldDiscount ?? 0;
                });
              });
            }
          } else {
            el.reservationLines.forEach((line) => {
              const oldDiscount = props.reservations[index].reservationLines.find(
                (rl) => (rl.date as Date).getTime() === (line.date as Date).getTime()
              )?.discount;
              line.discount = oldDiscount ?? 0;
            });
            el.extraServices.forEach((ex) => {
              ex.items.forEach((i) => {
                const oldDiscount = props.reservations[index].extraServices
                  .find((es) => es.serviceId === ex.serviceId)
                  ?.items.find(
                    (it) => new Date(it.date).getTime() === new Date(i.date).getTime()
                  )?.discount;
                i.discount = oldDiscount ?? 0;
              });
            });
          }
        }
      });
    };

    const toggleSelectReservation = (index: number) => {
      if (!modifiedReservations.value[index].selected) {
        modifiedReservations.value[index] = {
          ...modifiedReservations.value[index],
          checkin: new Date(props.reservations[index].checkin),
          checkout: new Date(props.reservations[index].checkout),
          adults: props.reservations[index].adults,
          children: props.reservations[index].children,
          boardServiceId: props.reservations[index].boardServiceId,
          extraServices: props.reservations[index].extraServices.map((es) => ({
            fromBatchChanges: es.fromBatchChanges,
            serviceId: es.serviceId,
            isBoardService: es.isBoardService,
            boardServiceLineId: es.boardServiceLineId,
            name: es.name,
            productId: es.productId,
            items: es.items.map((item) => ({
              date: new Date(item.date),
              discount: item.discount,
              id: item.id,
              priceUnit: item.priceUnit,
              quantity: item.quantity,
            })),
          })),
          reservationLines: props.reservations[index].reservationLines.map((rl) => ({
            date: new Date(rl.date),
            price: rl.price,
            discount: rl.discount,
            roomId: rl.roomId,
            pmsPropertyId: rl.pmsPropertyId,
            reservationId: rl.reservationId,
          })),
        };
      }
    };

    const saveChanges = (isClosingAfterChanges: boolean) => {
      dialogService.open({
        header: 'Confirmar operación',
        content: 'Guardar los cambios?',
        btnAccept: 'Guardar',
        btnCancel: 'Cancelar',
        onAccept: async () => {
          void store.dispatch('layout/showSpinner', true);
          try {
            if (props.fromBookingEngine) {
              context.emit('accept', {
                modifiedReservations: modifiedReservations.value
                  .filter((el) => el.selected)
                  .map((el) => ({
                    id: el.id,
                    adults: el.adults,
                    children: el.children,
                    checkin: el.checkin,
                    checkout: el.checkout,
                    boardServiceId: el.boardServiceId,
                    roomTypeId: el.roomTypeId,
                    reservationLines: el.reservationLines.map((rl) => ({
                      date: rl.date,
                      price: rl.price,
                      discount: rl.discount,
                      roomId: rl.roomId,
                      pmsPropertyId: rl.pmsPropertyId,
                      id: rl.id,
                      discountPrice: rl.discountPrice,
                      cancelDiscount: rl.cancelDiscount,
                      reservationId: rl.reservationId,
                    })),
                    extraServices: el.extraServices.map((e) => ({
                      boardServiceLineId: e.boardServiceLineId,
                      isBoardService: e.isBoardService,
                      name: e.name,
                      productId: e.productId,
                      items: e.items.map((i) => ({
                        date: i.date,
                        discount: i.discount,
                        priceUnit: i.priceUnit,
                        quantity: i.quantity,
                      })),
                    })),
                  })),
              });
            } else {
              const folio = {
                reservations: modifiedReservations.value.map((el) => ({
                  id: el.id,
                  checkin: el.checkin as Date,
                  checkout: el.checkout,
                  adults: el.adults,
                  children: el.children,
                  boardServiceId: el.boardServiceId,
                  reservationLines: el.reservationLines.map((rl) => ({
                    date: rl.date,
                    price: rl.price,
                    discount: rl.discount,
                    roomId: rl.roomId,
                  })),
                  services: el.extraServices.map((s) => {
                    const serviceData = {
                      id: s.serviceId,
                      isBoardService: s.isBoardService,
                      productId: s.productId,
                      serviceLines: s.items.map((l) => ({
                        date: l.date,
                        discount: l.discount,
                        priceUnit: l.priceUnit,
                        quantity: l.quantity,
                      })),
                    };

                    if (!s.serviceId) {
                      delete serviceData.id;
                    }

                    return serviceData;
                  }),
                })),
              };

              await store.dispatch('folios/updateFolioBatchChanges', {
                folioId: props.folio.id,
                reservations: folio.reservations,
              });
              await refreshPlanning();
              if (router.currentRoute.value.name === 'planning') {
                void store.dispatch('planning/fetchPlanning', {
                  dateStart: store.state.planning.dateStart,
                  dateEnd: store.state.planning.dateEnd,
                  propertyId: store.state.properties.activeProperty?.id,
                  availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
                });
              }
              if (props.folio.id) {
                void store.dispatch('folios/fetchFolio', props.folio.id);
                void store.dispatch('reservations/fetchReservations', props.folio.id);
              }
              if (store.state.reservations.currentReservation) {
                void store.dispatch(
                  'reservations/fetchReservation',
                  store.state.reservations.currentReservation.id
                );
                void store.dispatch(
                  'reservationLines/fetchReservationLines',
                  store.state.reservations.currentReservation.id
                );
                void store.dispatch(
                  'services/fetchServices',
                  store.state.reservations.currentReservation?.id
                );
                void store.dispatch(
                  'reservationServices/fetchReservationServices',
                  store.state.reservations.currentReservation?.id
                );
              }
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

          if (isClosingAfterChanges) {
            context.emit('close');
          }
        },
      });
    };

    watch(dateFrom, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (modifiedReservations.value.filter((el) => el.selected).length > 0) {
          if (dateFrom.value) {
            await buildNotAllowedCheckoutDates(
              dateFrom.value.getMonth(),
              dateFrom.value.getFullYear()
            );
          }
          // reset checkout
          dateTo.value = null;
          modifiedReservations.value.forEach((r, index) => {
            if (r.selected) {
              r.checkout = props.reservations[index].checkout;
            }
          });

          // load rooms, services and board services prices
          const checkinParam = dateFrom.value ?? minCheckin.value;
          const checkoutParam = dateTo.value ?? maxCheckout.value;
          await loadPrices(checkinParam, checkoutParam);

          // set checkin value to selected reservations
          let checkoutDateChangeIsPerformed = false;
          modifiedReservations.value.forEach((el, index) => {
            if (el.selected) {
              // if checkin is not empty
              if (dateFrom.value) {
                el.checkin = dateFrom.value;
                if (el.checkin >= el.checkout && !checkoutDateChangeIsPerformed) {
                  checkoutDateChangeIsPerformed = true;
                }
              } else {
                // if checkin is empty restore original checkin
                el.checkin = new Date(props.reservations[index].checkin);
              }
              // if services are present rebuild extra services
              if (el.extraServices.length > 0) {
                rebuildExtraServices();
              }
            }
          });
          // adjust checkout to avoid checkin > checkout
          if (checkoutDateChangeIsPerformed && dateFrom.value) {
            const newCheckout = new Date(dateFrom.value.getTime());
            // new checkout is the next day to checkin
            newCheckout.setDate(dateFrom.value.getDate() + 1);
            // set checkout to selected reservations
            modifiedReservations.value
              .filter((el) => el.selected)
              .forEach((el) => {
                el.checkout = newCheckout;
              });
            // set checkout string value to input
            dateTo.value = newCheckout;
          }
          // rebuild reservation lines
          rebuildReservationLines();
          // rebuild board service lines
          await rebuildBoardServiceLines();
          // rebuild extra services
          rebuildExtraServices();
        }
        if (dateFrom.value) {
          await buildNotAllowedCheckoutDates(
            dateFrom.value.getMonth(),
            dateFrom.value.getFullYear()
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
    });

    watch(dateTo, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (modifiedReservations.value.filter((el) => el.selected).length > 0) {
          // load rooms, services and board services prices
          const checkinParam = dateFrom.value ?? minCheckin.value;
          const checkoutParam = dateTo.value ?? maxCheckout.value;
          await loadPrices(checkinParam, checkoutParam);
          // set checkout value to selected reservations
          modifiedReservations.value.forEach((el, index) => {
            if (el.selected) {
              // if checkout is not empty
              if (dateTo.value) {
                el.checkout = dateTo.value;
              } else {
                //  if checkout is empty restore original checkout
                el.checkout = new Date(props.reservations[index].checkout);
              }
              // if services are present rebuild extra services
              if (el.extraServices.length > 0) {
                rebuildExtraServices();
              }
            }
          });
          // rebuild reservation lines
          rebuildReservationLines();
          await rebuildBoardServiceLines();
        }
        if (dateTo.value) {
          await buildNotAllowedCheckoutDates(dateTo.value.getMonth(), dateTo.value.getFullYear());
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
    });

    watch(fixedPricePerNight, () => {
      validator.value.$touch();
      if (validator.value.fixedPricePerNight.$error) {
        return;
      }
      if (fixedPricePerNight.value) {
        isNightsDiscount.value = false;
      }
      modifiedReservations.value.forEach((res, reservationIndex) => {
        if (res.selected) {
          res.reservationLines.forEach((line) => {
            if (fixedPricePerNight.value) {
              line.price = parseFloat(fixedPricePerNight.value) ?? 0;
            } else {
              const previousLine = props.reservations[reservationIndex].reservationLines.find(
                (el) => (el.date as Date).getTime() === (line.date as Date).getTime()
              );
              if (previousLine) {
                line.price = previousLine.price;
              } else {
                line.price =
                  roomPrices.value
                    .find((roomType) => roomType.roomTypeId === res.roomTypeId)
                    ?.prices.find(
                      (roomPrice) => roomPrice.date.getTime() === (line.date as Date).getTime()
                    )?.price ?? 0;
              }
            }
          });
        }
      });
    });

    watch([adults, children], () => {
      validator.value.$touch();
      if (validator.value.adults.$error || validator.value.children.$error) {
        return;
      }
      modifiedReservations.value.forEach((el, index) => {
        if (el.selected) {
          // get products that are per person from reservation extra services
          const extraServicesProductIdsPerPerson = store.state.products.products
            .filter((ex) => ex.perPerson)
            .map((ex) => ex.id);

          let newAdultsValue: number;
          let newChildrenValue: number;

          // new adults value
          if (adults.value) {
            newAdultsValue = adults.value;
          } else {
            newAdultsValue = props.reservations[index].adults;
          }

          // new children value
          if (children.value) {
            newChildrenValue = children.value;
          } else {
            newChildrenValue = props.reservations[index].children;
          }
          // get children board services to add
          const boardServiceRoomTypeId = store.state.boardServices.boardServices.find(
            (bs) => bs.roomTypeId === el.roomTypeId && bs.boardServiceId === el.boardServiceId
          )?.id;

          const childrenBoardServicesToAdd = boardServicePrices.value.filter(
            (cb) => cb.isChildren && !cb.isAdults && cb.boardServiceId === boardServiceRoomTypeId
          );

          // if children value is 0 and new children value is greater than 0
          if (el.children === 0 && newChildrenValue > 0) {
            // add extra services only for children
            if (childrenBoardServicesToAdd.length > 0) {
              let items: ServiceLineInterface[] = [];

              // iterate between checkin and checkout to build extra service lines for children
              childrenBoardServicesToAdd.forEach((x) => {
                items = [];
                const product = extraServices.value.find((p) => p.id === x.productId);
                if (product) {
                  if (product.perDay) {
                    let dateStart;
                    let dateEnd;
                    if (product.consumedOn === 'before') {
                      dateStart = new Date(el.checkin.getTime());
                      dateEnd = new Date(el.checkout.getTime() - ONE_DAY_IN_MS);
                    } else {
                      dateStart = new Date(el.checkin.getTime() + ONE_DAY_IN_MS);
                      dateEnd = new Date(el.checkout.getTime());
                    }
                    utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                      const priceUnit =
                        x.prices.find((pr) => pr.date.getTime() === date.getTime())?.price ?? 0;
                      items.push({
                        priceUnit,
                        date,
                        quantity: newChildrenValue,
                        discount: 0,
                      });
                    });
                  } else {
                    items.push({
                      priceUnit:
                        store.state.prices.prices.find(
                          (y) =>
                            y.date.getTime() ===
                            new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              today.getDate()
                            ).getTime()
                        )?.price ?? 0,
                      date: today,
                      quantity: product.perPerson ? newChildrenValue : 1,
                      discount: 0,
                    });
                  }
                }
                el.extraServices.push({
                  isBoardService: true,
                  items,
                  name: x.name,
                  productId: x.productId,
                  serviceId: x.boardServiceId,
                  fromBatchChanges: true,
                  boardServiceLineId: x.boardServiceLineId,
                });
              });
            }
          } else if (el.children > 0 && newChildrenValue === 0) {
            // remove extra services only for children
            el.extraServices = el.extraServices.filter(
              (ex) =>
                !childrenBoardServicesToAdd
                  .map((x) => x.boardServiceLineId)
                  .includes(ex.boardServiceLineId ?? 0)
            );
          }
          // update reservation adults and children values
          el.adults = newAdultsValue;
          el.children = newChildrenValue;
          el.extraServices.forEach((ex) => {
            if (ex.isBoardService) {
              let qty: number;
              const bsl = boardServicePrices.value.find(
                (bsli) => bsli.boardServiceLineId === ex.boardServiceLineId
              );
              if (bsl?.isAdults && bsl.isChildren) {
                qty = newAdultsValue + newChildrenValue;
              } else if (bsl?.isChildren) {
                qty = newChildrenValue;
              } else {
                qty = newAdultsValue;
              }
              ex.items.forEach((i) => {
                i.quantity = qty ?? i.quantity;
              });
            } else if (extraServicesProductIdsPerPerson.includes(ex.productId)) {
              ex.items.forEach((i) => {
                if (adults.value && adults.value >= 1 && adults.value <= maxAdults.value) {
                  i.quantity = adults.value;
                } else {
                  i.quantity = props.reservations[index].adults;
                }
              });
            }
          });
        }
      });
    });

    watch(selectedBoardService, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await rebuildBoardServiceLines();
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      }
    });

    watch(selectedExtraServices, () => {
      rebuildExtraServices();
    });

    watch([percentDiscount, isNightsDiscount, isServicesDiscount], () => {
      validator.value.$touch();
      if (validator.value.percentDiscount.$error) {
        return;
      }
      if (percentDiscount.value === null) {
        isNightsDiscount.value = false;
        isServicesDiscount.value = false;
      }
      adjustDiscounts();
    });

    onMounted(async () => {
      props.reservations
        .filter((el) => !el.isSplitted && !(el.stateCode === 'cancel'))
        .forEach((res) => {
          modifiedReservations.value.push({
            id: res.id,
            pricelistId: res.pricelistId,
            checkin: new Date(res.checkin),
            checkout: new Date(res.checkout),
            roomTypeId: res.roomTypeId,
            roomId: res.roomId,
            boardServiceId: res.boardServiceId,
            adults: res.adults,
            children: res.children,
            selected: true,
            reservationLines: res.reservationLines.map((rl) => ({
              date: new Date(rl.date),
              price: rl.price,
              discount: rl.discount,
              roomId: rl.roomId,
              pmsPropertyId: rl.pmsPropertyId,
              reservationId: rl.reservationId,
            })),
            extraServices: res.extraServices.map((es) => ({
              fromBatchChanges: es.fromBatchChanges,
              serviceId: es.serviceId,
              isBoardService: es.isBoardService,
              boardServiceLineId: es.boardServiceLineId,
              name: es.name,
              productId: es.productId,
              items: es.items.map((item) => ({
                date: new Date(item.date),
                discount: item.discount,
                id: item.id,
                priceUnit: item.priceUnit,
                quantity: item.quantity,
              })),
            })),
            isSplitted: res.isSplitted,
            stateCode: res.stateCode,
          });
        });
      if (modifiedReservations.value.filter((el) => el.selected).length > 0) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await loadPrices(minCheckin.value, maxCheckout.value);
          await buildNotAllowedCheckinDates(today.getMonth(), today.getFullYear());
          await buildNotAllowedCheckoutDates(today.getMonth(), today.getFullYear());
        } catch (error) {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
          console.error(error);
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
      }
    });

    return {
      dateFrom,
      dateTo,
      today,
      minCheckin,
      minCheckout,
      maxCheckout,
      checkinAvailabilitys,
      checkoutAvailabilitys,
      disabledCheckinDates,
      disabledCheckoutDates,
      adults,
      children,
      selectedBoardService,
      selectedExtraService,
      fixedPricePerNight,
      percentDiscount,
      isNightsDiscount,
      isServicesDiscount,
      extraServices,
      commonBoardServices,
      modifiedReservations,
      priceFolioBefore,
      priceFolioAfter,
      selectedExtraServices,
      calendarServicesToRemove,
      validator,
      isThereAnyChange,
      removeOldExtraService,
      adjustDiscounts,
      roomShortName,
      roomTypeShortName,
      boardServiceName,
      selectExtraService,
      datePickerCheckinChanged,
      datePickerCheckoutChanged,
      buildNotAllowedCheckinDates,
      buildNotAllowedCheckoutDates,
      toggleSelectReservation,
      saveChanges,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  .header {
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    .folio-name,
    .prices {
      display: flex;
      align-items: center;
      font-weight: bold;
    }
    .new-price {
      color: $primary;
    }
  }

  .filters {
    .filter {
      min-height: 75px;
      .label {
        font-weight: bold;
        user-select: none;
        &.error {
          color: red;
        }
      }
      .datepicker,
      .input,
      .select {
        width: 100%;
      }
      .error-message {
        color: red;
        font-size: 0.7rem;
      }

      &.toggle-container {
        display: flex;
        align-items: center;
        .label {
          margin-left: 10px;
          user-select: none;
          cursor: pointer;
        }
        &.disabled {
          opacity: 0.4;
          .label,
          .toggle {
            pointer-events: none;
          }
        }
      }
    }
  }

  .table-container {
    width: 100%;
    margin-top: 0.5rem;
    table {
      width: 100%;
      font-size: 0.8rem;
      thead {
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
        user-select: none;
      }
      tr {
        padding: 0.5rem;
        border-radius: 1rem;
        display: block;
        margin-bottom: 0.625em;
        background-color: $secondary;
      }
      td {
        display: block;
        text-align: right;
        .chip {
          padding: 0.25rem;
          font-size: 0.7rem;
          margin-left: 0.25rem;
          margin-bottom: 0.25rem;
          &:first-child {
            margin-left: 0;
          }
        }
        .checkbox {
          display: none;
        }
        &.toggle-button-container {
          display: block;
          .select-button {
            width: 100%;
            font-size: 0.7rem;
          }
        }
        &.modified,
        .room-price.modified,
        span.modified {
          font-weight: bold;
          color: $primary;
        }
      }
      td::before {
        content: attr(data-label);
        float: left;
        font-weight: bold;
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
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    width: 800px;
    .header {
      .folio-name {
        font-size: 1.2rem;
      }
      .prices {
        .old-price,
        .arrow,
        .new-price {
          font-size: 1.2rem;
        }

        .arrow {
          margin: 0 0.5rem;
        }
      }
    }
    .filters {
      display: flex;
      .filter {
        flex: 1;
        margin-right: 1rem;
        &:last-child {
          margin-right: 0;
        }
        &.toggle-container {
          padding-top: 0.5rem;
        }
      }
    }
    .table-container {
      table {
        width: 100%;
        border-collapse: collapse;
        thead {
          display: table-header-group;
          border: none;
          clip: auto;
          height: auto;
          margin: 0;
          overflow: visible;
          padding: 0;
          position: static;
          width: 100%;
          text-align: center;
        }
        tr {
          display: table-row;
          border-radius: 0;
          padding: 0 !important;
          background-color: transparent;
        }
        th {
          padding: 0.5em;
          background-color: $secondary;
          color: $primary;
          padding: 12px;
          font-weight: normal;
        }

        td {
          display: table-cell;
          text-align: center;
          padding: 0.5em;
          .checkbox {
            display: flex;
          }
          &.toggle-button-container {
            display: none;
          }
          &::before {
            content: none;
          }
        }
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
