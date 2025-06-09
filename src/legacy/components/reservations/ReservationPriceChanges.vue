<template>
  <div class="main-container">
    <div class="title">
      {{
        (
          oldReservationLinesTotalPrice +
          oldTotalPriceAllServices +
          totalPriceAllBoardServices
        ).toFixed(2)
      }}€

      <CustomIcon
        imagePath="/app-images/trending-flat.svg"
        width="20px"
        height="20px"
        color="primary"
        class="icon"
        v-if="
          isShowingNightsDetail ||
          calendarDatesByService.map((el) => el.viewMode).some((el) => el !== 'preview')
        "
      />
      <span
        class="text-primary"
        v-if="
          isShowingNightsDetail ||
          calendarDatesByService.map((el) => el.viewMode).some((el) => el !== 'preview')
        "
      >
        {{
          (newReservationLinesTotalPrice + newServicesTotalPrice + boardServicesTotalPrice).toFixed(
            2
          )
        }}€
      </span>
    </div>

    <div class="main-content">
      <div class="reservation-blocked" v-if="currentReservation?.isBlocked">
        <div class="first-row">
          <CustomIcon
            :imagePath="'/app-images/icon-lock.svg'"
            :color="'primary'"
            :width="'13px'"
            :height="'13px'"
          />
          <span class="feedback-title"> Reserva bloqueada por {{ agencyName }} </span>
        </div>
        <p>
          No es posible modificar la tarifa, categoría de habitación ni precio por noche de esta
          reserva.
        </p>
        <br />
        <p>
          Por favor, informe al cliente que para cambiar las fechas de esta reserva, debe realizarlo
          directamente a través de {{ agencyName }}.
        </p>
        <br />
      </div>
      <div class="selectors">
        <div class="input-group">
          <div class="label">Tarifa:</div>
          <div class="input">
            <AppSelect
              size="small"
              class="select"
              placeholder="Selecciona opción"
              :options="pricelists"
              v-model="selectedPricelistId"
              optionLabel="name"
              optionValue="id"
              :disabled="currentReservation?.isBlocked"
            />
          </div>
        </div>

        <div class="input-group">
          <div class="label">Categoría de habitación:</div>
          <div class="input">
            <AppSelect
              size="small"
              class="select"
              placeholder="Selecciona opción"
              :options="roomTypes"
              v-model="selectedRoomTypeId"
              optionLabel="name"
              optionValue="id"
              :disabled="currentReservation?.isBlocked"
            />
          </div>
        </div>
      </div>

      <div
        class="selectors-help"
        v-if="!(currentReservation?.isBlocked || currentReservation?.reservationType === 'staff')"
      >
        <div class="left">
          <div class="label">
            <div class="text-1">Actualizar precios de la reserva</div>
            <div class="text-2">
              Modificar los precios de las noches según lo establecido en la tarifa y categoría de
              habitación
            </div>
          </div>
        </div>
        <div class="right">
          <ToggleSwitch size="small" v-model="isPricelistApplied" />
          <div :class="{ 'text-primary': isPricelistApplied }">
            {{
              (priceReservationLinesAfterApplyingPricelist - newReservationLinesTotalPrice < 0
                ? ''
                : '+') +
              (priceReservationLinesAfterApplyingPricelist - newReservationLinesTotalPrice).toFixed(
                2
              )
            }}€
          </div>
        </div>
      </div>

      <div class="night-prices">
        <div class="night-prices-header">
          <div class="text">Precio total de noches</div>
          <div class="price">
            <div class="price-links">
              <div class="price">
                <span> {{ oldReservationLinesTotalPrice.toFixed(2) }}€ </span>

                <CustomIcon
                  imagePath="/app-images/trending-flat.svg"
                  width="20px"
                  height="20px"
                  color="primary"
                  v-if="isShowingNightsDetail"
                />

                <span class="text-primary" v-if="isShowingNightsDetail">
                  {{ newReservationLinesTotalPrice.toFixed(2) }}€
                </span>
              </div>
              <div class="links">
                <div
                  v-if="!isShowingNightsDetail && currentReservation?.reservationType === 'normal'"
                  class="link text-right"
                  @click="isShowingNightsDetail = true"
                >
                  Ver detalle
                </div>
                <div v-else class="link text-right" @click="restoreReservationNightsPrice()">
                  {{ currentReservation?.reservationType === 'normal' ? 'Restaurar' : '' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="night-prices-content" v-if="isShowingNightsDetail">
          <div class="fixed-price-per-night" v-if="!currentReservation?.isBlocked">
            <div class="label-input">
              <div class="label">
                <span class="text-1"> Modificar precio fijo por noche </span>
                <span> Establecer el mismo precio para todas las noches. </span>
              </div>
              <div class="input-wrapper" v-if="isFixedPriceByNight">
                <input
                  type="number"
                  v-model="fixedPriceByNight"
                  @input="inputFixedPricePerNight"
                  :class="isFixedPriceError ? 'input-error' : ''"
                />
                <span class="currency"> € </span>
              </div>
            </div>
            <div class="toggle-wrapper">
              <ToggleSwitch size="small" v-model="isFixedPriceByNight" />
            </div>
          </div>
          <div class="fixed-price-per-reservation" v-if="!currentReservation?.isBlocked">
            <div class="label-input">
              <div class="label">
                <span class="text-1"> Modificar el total de la reserva </span>
                <span>
                  Establecer el precio total distribuyendo el importe entre todas las noches.
                </span>
              </div>
              <div class="input-wrapper" v-if="isFixedPriceTotalReservation">
                <input
                  type="number"
                  v-model="fixedPriceTotalReservation"
                  @input="inputTotalPrice()"
                  :class="isTotalPriceError ? 'input-error' : ''"
                />
                <span class="currency"> € </span>
              </div>
            </div>
            <div class="toggle-wrapper">
              <ToggleSwitch size="small" v-model="isFixedPriceTotalReservation" />
            </div>
          </div>

          <div class="discount-format" v-if="!isFixedPriceByNight && !isFixedPriceTotalReservation">
            <div class="option-info">
              <div class="option-title">Mostrar descuento en porcentajes</div>
            </div>

            <div class="toggle-container">
              <ToggleSwitch size="small" v-model="isDiscountShowedAsPercentage" />
            </div>
          </div>
          <div v-if="!isFixedPriceByNight && !isFixedPriceTotalReservation" class="calendar-title">
            {{ dateStartMonth() }}
            {{ (currentReservation?.checkin as Date).getFullYear() }}
          </div>
          <div
            class="calendar-content"
            v-if="!isFixedPriceByNight && !isFixedPriceTotalReservation"
          >
            <div
              class="day day-name"
              v-for="day in [
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
                'Domingo',
              ]"
              :key="day"
            >
              <span class="long">
                {{ day }}
              </span>
              <span class="short">
                {{ day[0] }}
              </span>
            </div>
            <div class="day" v-for="(item, index) in calendarDates" :key="index">
              <div :class="item.reservationLine ? 'content' : 'empty'">
                <div class="header-day">
                  <div class="month-day">
                    <div class="day-num">
                      {{ item.date.getDate() }}
                    </div>
                  </div>
                  <div v-if="item.reservationLine" class="price-day">
                    {{
                      (
                        item.reservationLine.price *
                        (1 - item.reservationLine.discount / 100)
                      ).toFixed(2)
                    }}€
                  </div>
                </div>
                <div class="inputs" v-if="item.reservationLine">
                  <label>precio €</label>
                  <input
                    type="number"
                    v-model="item.reservationLine.price"
                    :disabled="isPricelistApplied || currentReservation?.isBlocked"
                  />
                  <label>dto {{ isDiscountShowedAsPercentage ? '%' : '€' }}</label>
                  <input
                    type="number"
                    v-show="isDiscountShowedAsPercentage"
                    v-model="item.reservationLine.discount"
                    @input="
                      reservationPriceDiscountFromPercentage(
                        item.reservationLine?.discount ?? 0,
                        item.date
                      )
                    "
                    :disabled="isPricelistApplied"
                  />
                  <input
                    type="number"
                    v-show="!isDiscountShowedAsPercentage"
                    v-model="item.reservationLine.discountPrice"
                    @input="
                      reservationPercentageDiscountFromPrice(
                        item.reservationLine?.discountPrice ?? 0,
                        item.date
                      )
                    "
                    :disabled="isPricelistApplied"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="extra-services-header" v-if="currentReservationBoardServices.length > 0">
        <div class="text" v-if="currentReservation?.boardServiceId">
          Precio régimen {{ boardServiceName(currentReservation.boardServiceId) }}
        </div>
        <div class="price">
          <div class="price-links">
            <div class="price">{{ totalPriceAllBoardServices.toFixed(2) }}€</div>
            <div class="links">
              <div
                class="link"
                @click="isShowingBoardServiceDetail = !isShowingBoardServiceDetail"
                v-if="currentReservationBoardServices && currentReservationBoardServices.length > 0"
              >
                {{ !isShowingBoardServiceDetail ? 'Ver' : 'Ocultar' }} detalle
              </div>
            </div>
          </div>
        </div>
      </div>

      <span v-if="isShowingBoardServiceDetail">
        <div
          v-for="service in calendarDatesByService.filter((el) => el.isBoardService)"
          :key="service.serviceId"
          class="extra-service"
        >
          <hr />
          <div class="extra-service-preview">
            <div class="extra-service-name-price flex justify-between items-center">
              <span class="extra-service-title">
                {{ service.serviceName }}
              </span>
              <div class="extra-service-price">
                <span v-if="service.serviceId">
                  {{ boardServicePriceByService(service.serviceId).toFixed(2) }}€
                </span>
              </div>
            </div>
            <div class="extra-service-units-modify-delete flex justify-between">
              <div class="flex column">
                <div class="">
                  <span class="text-bold">
                    {{
                      service.items
                        .filter((el) => el.serviceLine)
                        .map((el) => el.serviceLine?.quantity ?? 0)
                        .reduce((a, b) => a + b, 0)
                    }}
                  </span>
                  unidad{{ service.quantity > 1 ? 'es' : '' }}
                </div>
              </div>
            </div>
          </div>

          <div class="calendar-title">
            {{ dateStartMonth() }}
            {{ (currentReservation?.checkin as Date).getFullYear() }}
          </div>

          <div class="extra-service-calendar">
            <div
              class="day day-name"
              v-for="day in [
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
                'Domingo',
              ]"
              :key="day"
            >
              <span class="long">
                {{ day }}
              </span>
              <span class="short">
                {{ day[0] }}
              </span>
            </div>
            <div class="day" v-for="(item, index) in service.items" :key="index">
              <div :class="item.serviceLine ? 'content' : 'empty'">
                <div class="header-day">
                  <div class="month-day">
                    <div class="day-num">
                      {{ item.date.getDate() }}
                    </div>
                  </div>
                  <div v-if="item.serviceLine" class="price-day">
                    {{
                      (
                        item.serviceLine.priceUnit *
                        (1 - item.serviceLine.discount / 100) *
                        item.serviceLine.quantity
                      ).toFixed(2)
                    }}€
                  </div>
                </div>
                <div class="inputs" v-if="item.serviceLine">
                  <label>uds.</label>
                  <input type="number" :value="item.serviceLine.quantity" disabled />
                  <label>€/ud.</label>
                  <input type="number" :value="item.serviceLine.priceUnit" disabled />
                  <label>% dto.</label>
                  <input type="number" :value="item.serviceLine.discount" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </span>

      <div class="extra-services-header" v-if="currentReservationServices.length > 0">
        <div class="text">Precio total de servicios extra</div>
        <div class="price-details-container">
          <div class="price">
            <div class="price-links">
              <div class="price">
                <span class="price-changes">
                  {{ oldTotalPriceAllServices.toFixed(2) }}€
                  <CustomIcon
                    imagePath="/app-images/trending-flat.svg"
                    width="20px"
                    height="20px"
                    color="primary"
                    class="icon"
                    v-if="
                      calendarDatesByService.map((el) => el.viewMode).some((el) => el !== 'preview')
                    "
                  />
                  <span
                    class="text-primary"
                    v-if="
                      calendarDatesByService.map((el) => el.viewMode).some((el) => el !== 'preview')
                    "
                  >
                    {{ newServicesTotalPrice.toFixed(2) }}€
                  </span>
                </span>
              </div>
              <div class="links">
                <div
                  class="link"
                  @click="isShowingServiceDetail = !isShowingServiceDetail"
                  v-if="currentReservationServices && currentReservationServices.length > 0"
                >
                  {{ !isShowingServiceDetail ? 'Ver' : 'Ocultar' }} detalle
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template v-if="isShowingServiceDetail">
        <div
          v-for="(service, serviceIndex) in calendarDatesByService.filter(
            (el) => !el.isBoardService
          )"
          :key="service.serviceId"
          class="extra-service"
        >
          <hr />
          <div class="extra-service-preview">
            <div class="extra-service-name-price">
              <span class="extra-service-title">
                {{ service.serviceName }}
              </span>
              <div class="extra-service-price">
                <span v-if="service.serviceId" class="text-1">
                  {{ oldTotalPriceByService(service.serviceId).toFixed(2) }}€
                </span>

                <CustomIcon
                  imagePath="/app-images/trending-flat.svg"
                  width="20px"
                  height="20px"
                  color="primary"
                  class="icon"
                  v-if="service.viewMode !== 'preview' && service.serviceId"
                />
                <span
                  v-if="service.viewMode === 'modify' || !service.serviceId"
                  class="text-primary"
                >
                  {{
                    (
                      service.quantity *
                      ((service.priceForAllLines ?? 0) *
                        (1 - (service.discountForAllLines ?? 0) / 100))
                    ).toFixed(2)
                  }}€
                </span>
                <span
                  v-else-if="service.viewMode === 'calendar' || !service.serviceId"
                  class="text-primary"
                >
                  {{
                    service.items
                      .filter((el) => el.serviceLine)
                      .map(
                        (el) =>
                          ((el.serviceLine?.priceUnit ?? 0) -
                            (el.serviceLine?.priceUnit ?? 0) *
                              ((el.serviceLine?.discount ?? 0) / 100)) *
                          (el.serviceLine?.quantity ?? 0)
                      )
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2)
                  }}€
                </span>
              </div>
            </div>
            <div class="extra-service-units-modify-delete">
              <div>
                <span class="text-bold" v-if="service.viewMode === 'modify'">
                  {{ service.quantity }}
                </span>
                <span class="text-bold" v-else>
                  {{
                    service.items
                      .filter((el) => el.serviceLine)
                      .map((el) => el.serviceLine?.quantity ?? 0)
                      .reduce((a, b) => a + b, 0)
                  }}
                </span>
                &nbsp;unidad{{ service.quantity > 1 ? 'es' : '' }}
              </div>
              <div
                class="link"
                v-if="service.viewMode === 'preview'"
                @click="fixedFieldsServiceView(service.serviceId)"
              >
                Ver detalle
              </div>
              <div
                class="link"
                @click="fixedFieldsServiceView(service.serviceId)"
                v-if="service.viewMode === 'calendar' && service.perDay"
              >
                Modificar para todas las fechas
              </div>
            </div>
          </div>

          <div class="extra-service-modify" v-if="service.viewMode === 'modify'">
            <div class="input-group" v-if="!service.perDay">
              <div class="label">Unidades:</div>
              <div class="input">
                <InputNumber
                  class="input"
                  v-model="service.quantity"
                  size="small"
                  :minFractionDigits="0"
                  :maxFractionDigits="0"
                />
              </div>
            </div>
            <div class="input-group">
              <div class="label">Precio Ud.:</div>
              <div class="input">
                <InputNumber
                  class="input"
                  v-model="service.priceForAllLines"
                  size="small"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  mode="currency"
                  currency="EUR"
                />
              </div>
            </div>
            <div class="input-group">
              <div class="label">Descuento:</div>
              <div class="input">
                <InputNumber
                  class="input"
                  v-model="service.discountForAllLines"
                  size="small"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                />
              </div>
            </div>
            <div class="links">
              <div
                class="link"
                @click="previewServiceView(service.serviceId)"
                v-if="service.serviceId"
              >
                Restaurar
              </div>
              <div
                class="link q-ml-md"
                v-if="
                  (service.viewMode === 'modify' || service.viewMode === 'modify') && service.perDay
                "
                @click="perDayServiceView(service.serviceId)"
              >
                Modificar por día
              </div>
            </div>
          </div>

          <div class="discount-format" v-if="service.viewMode === 'calendar'">
            <div class="option-info">
              <div class="option-title">Mostrar descuento en porcentajes</div>
            </div>

            <ToggleSwitch size="small" v-model="service.isDiscountShowedAsPercentage" />
          </div>

          <div v-if="service.viewMode === 'calendar'" class="calendar-title">
            {{ dateStartMonth() }}
            {{ (currentReservation?.checkin as Date).getFullYear() }}
          </div>
          <div class="extra-service-calendar" v-if="service.viewMode === 'calendar'">
            <div
              class="day day-name"
              v-for="day in [
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
                'Domingo',
              ]"
              :key="day"
            >
              <span class="long">
                {{ day }}
              </span>
              <span class="short">
                {{ day[0] }}
              </span>
            </div>
            <div class="day" v-for="(item, index) in service.items" :key="index">
              <div :class="item.serviceLine ? 'content' : 'empty'">
                <div class="header-day">
                  <div class="month-day">
                    {{ item.date.getDate() }}
                  </div>
                  <div v-if="item.serviceLine" class="price-day">
                    {{
                      (
                        item.serviceLine.priceUnit *
                        (1 - item.serviceLine.discount / 100) *
                        item.serviceLine.quantity
                      ).toFixed(2)
                    }}€
                  </div>
                </div>
                <div v-if="item.serviceLine" class="inputs">
                  <label>Uds.</label>
                  <input type="number" v-model="item.serviceLine.quantity" />
                  <label>€/ud.</label>
                  <input type="number" v-model="item.serviceLine.priceUnit" />
                  <label>dto {{ service.isDiscountShowedAsPercentage ? '%' : '€' }}</label>
                  <input
                    type="number"
                    v-show="service.isDiscountShowedAsPercentage"
                    v-model="item.serviceLine.discount"
                    @input="
                      servicePriceDiscountFromPercentage(
                        serviceIndex,
                        item.serviceLine?.discount ?? 0,
                        item.date
                      )
                    "
                  />
                  <input
                    type="number"
                    v-show="!service.isDiscountShowedAsPercentage"
                    v-model="item.serviceLine.discountPrice"
                    @input="
                      servicePercentageDiscountFromPrice(
                        serviceIndex,
                        item.serviceLine?.discountPrice ?? 0,
                        item.date
                      )
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="buttons">
      <AppButton
        :label="'Guardar'"
        @click="saveChanges()"
        class="button"
        :disabled="isFixedPriceError || isTotalPriceError"
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
import { defineComponent, ref, computed, onMounted, watch, type Ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { decimal } from '@vuelidate/validators';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

import { type ReservationLineInterface } from '@/legacy/interfaces/ReservationLineInterface';
import type { ServiceLineInterface } from '@/legacy/interfaces/ServiceLineInterface';
import type { ServiceInterface } from '@/legacy/interfaces/ServiceInterface';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

import { useStore } from '@/legacy/store';
import utilsDates, { localeSpain } from '@/legacy/utils/dates';
import { dialogService } from '@/legacy/services/DialogService';

interface CalendarChangeDatesInterface {
  date: Date;
  reservationLine?: ReservationLineInterface;
  isInRange: boolean;
}
interface CalendarItemInterface {
  date: Date;
  serviceLine?: ServiceLineInterface;
}

interface CalendarContentInterface {
  isDiscountShowedAsPercentage: boolean;
  serviceId?: number;
  isBoardService: boolean;
  productId: number;
  serviceName: string;
  perDay: boolean;
  viewMode: string;
  priceForAllLines: number | undefined;
  discountForAllLines: number | undefined;
  priceTotal: number;
  priceSubtotal: number;
  priceTaxes: number;
  quantity: number;
  items: CalendarItemInterface[];
}

export default defineComponent({
  components: {
    CustomIcon,
    AppSelect: Select,
    ToggleSwitch,
    InputNumber,
    AppButton: Button,
  },
  props: {
    showNightsDetail: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, context) {
    const store = useStore();
    const selectedPricelistId = ref(-1);
    const selectedRoomTypeId = ref(-1);
    const isPricelistApplied = ref(false);
    const isFixedPriceByNight = ref(false);
    const isFixedPriceTotalReservation = ref(false);
    const isShowingNightsDetail = ref(false);
    const isDiscountShowedAsPercentage = ref(false);
    const isShowingServiceDetail = ref(false);
    const isShowingBoardServiceDetail = ref(false);
    const fixedPriceByNight: Ref<number | null> = ref(null);
    const fixedPriceTotalReservation: Ref<number | null> = ref(null);
    const priceReservationLinesAfterApplyingPricelist = ref(0);
    const calendarDates = ref([] as CalendarChangeDatesInterface[]);
    const calendarDatesByService = ref([] as CalendarContentInterface[]);
    const isFixedPriceError = ref(false);
    const isTotalPriceError = ref(false);

    const currentReservation = computed(() => store.state.reservations.currentReservation);

    const pricelists = computed(() => {
      const result = [...store.state.pricelists.pricelists];
      const currentPricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === currentReservation.value?.pricelistId
      );
      if (!currentPricelist && store.state.pricelists.restrictedPricelist) {
        result.push(store.state.pricelists.restrictedPricelist);
      }
      return result;
    });

    const roomTypes = computed(() => store.state.roomTypes.roomTypes);
    const currentReservationLines = computed(() => store.state.reservationLines.reservationLines);
    const products = computed(() => store.state.products.products);

    const currentReservationServices = computed(() =>
      store.state.services.services.filter((el) => !el.isBoardService)
    );

    const currentReservationBoardServices = computed(() =>
      store.state.services.services.filter((el) => el.isBoardService)
    );

    const oldReservationLinesTotalPrice = computed(() =>
      currentReservationLines.value
        .map((el) => ({ price: el.price, discount: el.discount }))
        .reduce((acc, val) => acc + val.price - val.price * (val.discount / 100), 0)
    );

    const newReservationLinesTotalPrice = computed(() => {
      let result = 0;
      if (isFixedPriceTotalReservation.value) {
        result = fixedPriceTotalReservation.value ?? 0;
      } else if (isFixedPriceByNight.value) {
        result = (fixedPriceByNight.value ?? 0) * currentReservationLines.value.length;
      } else {
        calendarDates.value.forEach((el) => {
          if (el.reservationLine) {
            result +=
              el.reservationLine.price -
              el.reservationLine.price * (el.reservationLine.discount / 100);
          }
        });
      }
      return result;
    });

    const oldTotalPriceAllServices = computed(() => {
      let result = 0;
      currentReservationServices.value.forEach((service) => {
        result += service.serviceLines
          .map(
            (line) =>
              ((line.priceUnit ?? 0) - (line.priceUnit ?? 0) * ((line.discount ?? 0) / 100)) *
              line.quantity
          )
          .reduce((a, b) => a + b, 0);
      });
      return result;
    });

    const totalPriceAllBoardServices = computed(() => {
      let result = 0;
      currentReservationBoardServices.value.forEach((service) => {
        result += service.serviceLines
          .map(
            (line) =>
              ((line.priceUnit ?? 0) - (line.priceUnit ?? 0) * ((line.discount ?? 0) / 100)) *
              line.quantity
          )
          .reduce((a, b) => a + b, 0);
      });
      return result;
    });

    const oldTotalPriceByService = (serviceId: number) => {
      let result = 0;
      const service = currentReservationServices.value.find((el) => el.id === serviceId);
      if (service) {
        service.serviceLines.forEach((line) => {
          result +=
            ((line.priceUnit ?? 0) - (line.priceUnit ?? 0) * ((line.discount ?? 0) / 100)) *
            line.quantity;
        });
      }
      return result;
    };

    const newServicesTotalPrice = computed(() => {
      let result = 0;
      calendarDatesByService.value
        .filter((el) => !el.isBoardService)
        .forEach((service) => {
          if (service.viewMode === 'calendar') {
            service.items.forEach((el) => {
              if (el.serviceLine) {
                result +=
                  ((el.serviceLine.priceUnit ?? 0) -
                    (el.serviceLine.priceUnit ?? 0) * ((el.serviceLine.discount ?? 0) / 100)) *
                  el.serviceLine.quantity;
              }
            });
          } else if (service.viewMode === 'modify') {
            result +=
              ((service.priceForAllLines ?? 0) -
                (service.priceForAllLines ?? 0) * ((service.discountForAllLines ?? 0) / 100)) *
              service.quantity;
          } else if (service.viewMode === 'preview') {
            result += oldTotalPriceByService(service.serviceId ?? 0);
          }
        });

      return result;
    });

    const boardServicesTotalPrice = computed(() => {
      let result = 0;
      calendarDatesByService.value
        .filter((el) => el.isBoardService)
        .forEach((service) => {
          result += service.priceTotal;
        });
      return result;
    });

    const agencyName = computed(
      () =>
        store.state.agencies.agencies.find((el) => el.id === currentReservation.value?.agencyId)
          ?.name
    );

    const boardServiceName = (boardServiceId: number) =>
      store.state.boardServices.boardServices.find((el) => el.id === boardServiceId)?.name;

    const boardServicePriceByService = (serviceId: number) => {
      let result = 0;
      const service = currentReservationBoardServices.value.find((el) => el.id === serviceId);
      if (service) {
        service.serviceLines.forEach((line) => {
          result +=
            ((line.priceUnit ?? 0) - (line.priceUnit ?? 0) * ((line.discount ?? 0) / 100)) *
            line.quantity;
        });
      }
      return result;
    };

    const fixedFieldsServiceView = (serviceId: number | undefined) => {
      if (serviceId) {
        const serviceIndex = calendarDatesByService.value.findIndex(
          (el) => el.serviceId === serviceId
        );
        if (serviceIndex !== -1) {
          calendarDatesByService.value[serviceIndex].viewMode = 'modify';
        }
      }
    };

    const perDayServiceView = (serviceId: number | undefined) => {
      if (serviceId) {
        const serviceIndex = calendarDatesByService.value.findIndex(
          (el) => el.serviceId === serviceId
        );
        if (serviceIndex !== -1) {
          calendarDatesByService.value[serviceIndex].viewMode = 'calendar';
        }
      }
    };

    const dateStartMonth = () => {
      let result = '';
      if (currentReservation.value?.checkin) {
        result = localeSpain.months[new Date(currentReservation.value.checkin).getMonth()];
      }
      return result;
    };

    const reservationPriceDiscountFromPercentage = (newPercentageDiscount: number, date: Date) => {
      const item = calendarDates.value.find((el) => el.date.getTime() === date.getTime());
      if (item && item.reservationLine) {
        item.reservationLine.discountPrice = parseFloat(
          ((newPercentageDiscount * item.reservationLine.price) / 100).toFixed(2)
        );
      }
    };

    const reservationPercentageDiscountFromPrice = (newPriceDiscount: number, date: Date) => {
      const item = calendarDates.value.find((el) => el.date.getTime() === date.getTime());
      if (item && item.reservationLine) {
        item.reservationLine.discount = parseFloat(
          ((newPriceDiscount * 100) / item.reservationLine.price).toFixed(2)
        );
      }
    };

    const servicePercentageDiscountFromPrice = (
      serviceIndex: number,
      newPriceDiscount: number,
      date: Date
    ) => {
      const item = calendarDatesByService.value[serviceIndex]?.items.find(
        (el) => el.date.getTime() === date.getTime()
      );
      if (item && item.serviceLine) {
        item.serviceLine.discount = parseFloat(
          ((newPriceDiscount * 100) / item.serviceLine.priceUnit).toFixed(2)
        );
      }
    };

    const servicePriceDiscountFromPercentage = (
      serviceIndex: number,
      newPercentageDiscount: number,
      date: Date
    ) => {
      const item = calendarDatesByService.value[serviceIndex]?.items.find(
        (el) => el.date.getTime() === date.getTime()
      );

      if (item && item.serviceLine) {
        item.serviceLine.discountPrice = parseFloat(
          ((newPercentageDiscount * item.serviceLine.priceUnit) / 100).toFixed(2)
        );
      }
    };

    const restoreReservationNightsPrice = () => {
      isShowingNightsDetail.value = false;
      calendarDates.value
        .filter((el) => el.reservationLine)
        .forEach((el) => {
          if (el.reservationLine) {
            const line = currentReservationLines.value.find(
              (l) => (l.date as Date).getTime() === el.date.getTime()
            );
            if (line) {
              el.reservationLine.price = line.price;
              el.reservationLine.discount = line.discount;
            }
          }
        });
      isPricelistApplied.value = false;
    };

    const previewServiceView = (serviceId: number | undefined) => {
      if (serviceId) {
        const serviceIndex = calendarDatesByService.value.findIndex(
          (el) => el.serviceId === serviceId
        );
        if (serviceIndex !== -1) {
          calendarDatesByService.value[serviceIndex].viewMode = 'preview';
        }
      }
    };

    const buildCalendarDates = () => {
      calendarDates.value = [];
      let startDate;
      let endDate;
      let daysBeforeCheckin;
      let daysAfterCheckout;
      if (
        currentReservation.value &&
        currentReservation.value.checkin &&
        currentReservation.value.checkout
      ) {
        startDate = new Date(currentReservation.value.checkin);
        if (startDate.getDay() === 0) {
          daysBeforeCheckin = 6;
        } else {
          daysBeforeCheckin = startDate.getDay() - 1;
        }
        endDate = new Date(currentReservation.value.checkout);
        if (endDate.getDay() === 0) {
          daysAfterCheckout = 0;
        } else {
          daysAfterCheckout = 6 - (endDate.getDay() - 1);
        }
        startDate.setDate(startDate.getDate() - daysBeforeCheckin);
        endDate.setDate(endDate.getDate() + daysAfterCheckout);
        const checkinDate = new Date(currentReservation.value.checkin);
        const checkoutDate = new Date(currentReservation.value.checkout);

        utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
          const night = currentReservationLines.value.find(
            (rl) =>
              new Date(rl.date).getTime() === date.getTime() &&
              date.getTime() >= checkinDate.getTime() &&
              date.getTime() < checkoutDate.getTime()
          );
          let item: CalendarChangeDatesInterface = {
            date,
            isInRange: false,
          };
          if (night) {
            item = {
              date,
              reservationLine: {
                date: night.date,
                price: night.price,
                discount: night.discount,
                discountPrice: night.discount ? night.price * (night.discount / 100) : 0,
                roomId: night.roomId,
                pmsPropertyId: night.pmsPropertyId,
                id: night.id,
                cancelDiscount: night.cancelDiscount,
                reservationId: night.reservationId,
              },
              isInRange: true,
            };
            if (item.reservationLine && isPricelistApplied.value) {
              item.reservationLine.discount = 0;
              item.reservationLine.discountPrice = 0;
              item.reservationLine.price =
                store.state.prices.prices.find(
                  (el) => el.date.getTime() === (night.date as Date).getTime()
                )?.price ?? 0;
            }
          }
          calendarDates.value.push(item);
        });
      }
    };

    const buildCalendarDatesByService = () => {
      store.state.services.services.forEach((el: ServiceInterface) => {
        let priceForAllLines;
        let discountForAllLines;

        if (
          el.serviceLines.every(
            (val) =>
              val.priceUnit === el.serviceLines[0].priceUnit &&
              val.discount === el.serviceLines[0].discount
          )
        ) {
          priceForAllLines = el.serviceLines[0].priceUnit;
          discountForAllLines = el.serviceLines[0].discount;
        } else {
          priceForAllLines = 0;
          discountForAllLines = 0;
        }

        const times = el.serviceLines.map((sl) => new Date(sl.date).getTime());
        const startDate = new Date(Math.min(...times));
        const endDate = new Date(Math.max(...times));

        let daysBeforeCheckin;
        let daysAfterCheckout;

        if (startDate.getDay() === 0) {
          daysBeforeCheckin = 6;
        } else {
          daysBeforeCheckin = startDate.getDay() - 1;
        }
        if (endDate.getDay() === 0) {
          daysAfterCheckout = 0;
        } else {
          daysAfterCheckout = 6 - (endDate.getDay() - 1);
        }
        startDate.setDate(startDate.getDate() - daysBeforeCheckin);
        endDate.setDate(endDate.getDate() + daysAfterCheckout);

        const serviceDates: CalendarItemInterface[] = [];
        const product = products.value.find((p) => p.id === el.productId);

        if (product?.perDay) {
          utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
            const serviceLine = el.serviceLines.find(
              (sl) => new Date(sl.date).getTime() === new Date(date).getTime()
            );
            if (serviceLine) {
              serviceLine.discountPrice = (serviceLine.discount / 100) * serviceLine.priceUnit;
            }
            serviceDates.push({
              date,
              serviceLine,
            });
          });
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          serviceDates.push({
            date: today,
            serviceLine: el.serviceLines[0],
          });
        }

        calendarDatesByService.value.push({
          isDiscountShowedAsPercentage: true,
          serviceId: el.id,
          isBoardService: el.isBoardService,
          productId: el.productId,
          serviceName: el.name ?? '',
          perDay: product?.perDay ?? false,
          viewMode: 'preview',
          priceForAllLines,
          priceTotal: el.priceTotal ?? 0,
          priceSubtotal: el.priceSubtotal ?? 0,
          priceTaxes: el.priceTaxes ?? 0,
          quantity: el.quantity ?? 0,
          discountForAllLines,
          items: serviceDates,
        });
      });
    };

    const fixedPriceNegativeNumber = () => {
      if (isFixedPriceByNight.value && fixedPriceByNight.value && fixedPriceByNight.value < 0) {
        return false;
      }
      return true;
    };
    const totalPriceNegativeNumber = () => {
      if (
        isFixedPriceTotalReservation.value &&
        fixedPriceTotalReservation.value &&
        fixedPriceTotalReservation.value < 0
      ) {
        return false;
      }
      return true;
    };
    const validationRules = computed(() => ({
      fixedPriceByNight: {
        decimal,
        fixedPriceNegativeNumber,
      },
      fixedPriceTotalReservation: {
        decimal,
        totalPriceNegativeNumber,
      },
    }));

    const validator = useVuelidate(validationRules, {
      fixedPriceByNight,
      fixedPriceTotalReservation,
    });

    const inputFixedPricePerNight = () => {
      validator.value.fixedPriceByNight.$touch();
      if (validator.value.fixedPriceByNight.$invalid) {
        isFixedPriceError.value = true;
      } else {
        isFixedPriceError.value = false;
      }
    };
    const inputTotalPrice = () => {
      validator.value.fixedPriceTotalReservation.$touch();
      if (validator.value.fixedPriceTotalReservation.$invalid) {
        isTotalPriceError.value = true;
      } else {
        isTotalPriceError.value = false;
      }
    };

    const saveChanges = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        let pricePerNight = fixedPriceByNight.value;

        if (isFixedPriceTotalReservation.value) {
          pricePerNight =
            (fixedPriceTotalReservation.value ?? 0) / currentReservationLines.value.length;
        }
        const reservationLines = calendarDates.value
          .filter((el) => el.reservationLine)
          .map((el) => el.reservationLine)
          .map((el) => ({
            date: el?.date,
            price:
              isFixedPriceByNight.value || isFixedPriceTotalReservation.value
                ? pricePerNight
                : el?.price,
            discount:
              isFixedPriceByNight.value || isFixedPriceTotalReservation.value ? 0 : el?.discount,
            roomId: el?.roomId,
            pmsPropertyId: store.state.properties.activeProperty?.id,
            reservationId: currentReservation.value?.id,
          }));

        await store.dispatch('reservations/updateReservation', {
          reservationId: currentReservation.value?.id,
          reservationLines,
          pricelistId: selectedPricelistId.value,
          roomTypeId: selectedRoomTypeId.value,
        });

        await Promise.all(
          calendarDatesByService.value
            .filter((el) => el.items)
            .map(async (el) => {
              const serviceLines: ServiceLineInterface[] = [];
              if (el.viewMode === 'calendar') {
                el.items.forEach((i) => {
                  if (i.serviceLine) {
                    serviceLines.push({
                      priceUnit: i.serviceLine.priceUnit,
                      discount: i.serviceLine.discount,
                      date: new Date(i.serviceLine.date),
                      quantity: i.serviceLine.quantity,
                    });
                  }
                });
              } else if (el.viewMode === 'modify') {
                el.items.forEach((i) => {
                  if (i.serviceLine) {
                    if (el.perDay) {
                      serviceLines.push({
                        priceUnit: el.priceForAllLines ?? 0,
                        discount: el.discountForAllLines ?? 0,
                        quantity: i.serviceLine.quantity,
                        date: new Date(i.date),
                      });
                    } else {
                      serviceLines.push({
                        priceUnit: el.priceForAllLines ?? 0,
                        discount: el.discountForAllLines ?? 0,
                        quantity: el.quantity,
                        date: new Date(i.date),
                      });
                    }
                  }
                });
              }
              await store.dispatch('services/updateService', {
                reservationId: currentReservation.value?.id,
                serviceId: el.serviceId,
                serviceLines,
              });
            })
        );

        void store.dispatch('planning/fetchAlertsPerDay', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
        });
        void store.dispatch('planning/fetchDailyBillings', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
        });
        void store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        });
        await store.dispatch(
          'reservationLines/fetchReservationLines',
          currentReservation.value?.id
        );
        void store.dispatch('reservations/fetchReservation', currentReservation.value?.id);
        void store.dispatch('folios/fetchFolio', currentReservation.value?.folioId);
        void store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id);
        void store.dispatch('services/fetchServices', currentReservation.value?.id);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
        context.emit('close');
      }
    };

    watch(isFixedPriceByNight, (value) => {
      if (value) {
        isFixedPriceTotalReservation.value = false;
        fixedPriceTotalReservation.value = 0;
      }
    });

    watch(isFixedPriceTotalReservation, (value) => {
      if (value) {
        isFixedPriceByNight.value = false;
        fixedPriceByNight.value = 0;
      }
    });

    watch(isPricelistApplied, (value) => {
      if (value) {
        isShowingNightsDetail.value = true;
      }
      buildCalendarDates();
    });

    watch([selectedPricelistId, selectedRoomTypeId], ([valuePricelist, valueRoomTypeId]) => {
      let checkinDate;
      let checkoutDate;
      if (currentReservation.value) {
        checkinDate = new Date(currentReservation.value.checkin);
        checkoutDate = new Date(currentReservation.value.checkout);
        checkoutDate.setDate(checkoutDate.getDate() - 1);
      }

      void store
        .dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId: valuePricelist,
          roomTypeId: valueRoomTypeId,
          dateFrom: checkinDate,
          dateTo: checkoutDate,
        })
        .then(() => {
          priceReservationLinesAfterApplyingPricelist.value = store.state.prices.prices
            .map((el) => el.price)
            .reduce((a, b) => a + b, 0);
        });
    });

    onMounted(async () => {
      selectedPricelistId.value = currentReservation.value?.pricelistId ?? -1;
      selectedRoomTypeId.value = currentReservation.value?.roomTypeId ?? -1;
      buildCalendarDates();
      buildCalendarDatesByService();
      if (props.showNightsDetail) {
        isShowingNightsDetail.value = true;
      }
      if (currentReservation.value?.pricelistId) {
        await store.dispatch(
          'pricelists/fetchRestrictedPricelist',
          currentReservation.value?.pricelistId
        );
      }
    });

    return {
      selectedPricelistId,
      selectedRoomTypeId,

      isPricelistApplied,
      isFixedPriceByNight,
      isFixedPriceTotalReservation,
      isShowingNightsDetail,
      isDiscountShowedAsPercentage,
      isShowingServiceDetail,
      isShowingBoardServiceDetail,

      fixedPriceByNight,
      fixedPriceTotalReservation,
      priceReservationLinesAfterApplyingPricelist,

      pricelists,
      roomTypes,
      currentReservation,
      currentReservationLines,
      currentReservationServices,
      currentReservationBoardServices,
      agencyName,

      dateStartMonth,

      calendarDates,
      newReservationLinesTotalPrice,
      oldReservationLinesTotalPrice,

      reservationPercentageDiscountFromPrice,
      reservationPriceDiscountFromPercentage,
      restoreReservationNightsPrice,

      calendarDatesByService,
      previewServiceView,
      fixedFieldsServiceView,
      perDayServiceView,
      servicePercentageDiscountFromPrice,
      servicePriceDiscountFromPercentage,
      inputFixedPricePerNight,
      inputTotalPrice,
      isFixedPriceError,
      isTotalPriceError,

      oldTotalPriceAllServices,
      totalPriceAllBoardServices,
      oldTotalPriceByService,
      boardServicePriceByService,
      boardServicesTotalPrice,
      boardServiceName,
      newServicesTotalPrice,

      saveChanges,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  height: 100%;
  .title {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
    .icon {
      margin-right: 0.5rem;
      margin-left: 0.5rem;
    }
    .text-primary {
      color: $primary;
    }
  }

  .main-content {
    padding-top: 1rem;
    padding-bottom: 1rem;
    .reservation-blocked {
      .first-row {
        font-weight: bold;
        display: flex;
        align-items: center;
        .feedback-title {
          margin-left: 0.5rem;
        }
      }
    }
    .selectors {
      .input-group {
        &:not(:last-child) {
          margin-bottom: 1rem;
        }
        .label {
          font-weight: bold;
          margin-bottom: 0.2rem;
        }
        .select {
          width: 100%;
        }
      }
      .pricelist-selector,
      .room-type-selector {
        flex: 1 1 auto;
        .label {
          font-weight: bold;
          margin-bottom: 0.2rem;
        }
        select {
          width: 100%;
          height: 25px;
          background-color: $secondary;
          font-weight: bold;
          color: $primary;
          border: 2px solid $primary;
        }
      }
      .pricelist-selector {
        padding-right: 1rem;
      }
      .room-type-selector {
        padding-left: 1rem;
      }
    }

    .selectors-help {
      margin-top: 1rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .left {
        .text-1 {
          font-weight: bold;
        }
        .text-2 {
          font-size: 0.9rem;
        }
      }
      .right {
        min-width: 20%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;

        .text-primary {
          color: $primary;
        }
      }
    }
    .night-prices {
      margin-top: 1rem;

      .night-prices-header {
        display: flex;
        justify-content: space-between;

        .text {
          font-weight: bold;
          font-size: 1rem;
        }
        .price-links {
          font-size: 1rem;
          font-weight: bold;
          display: flex;
          flex-direction: column;

          align-items: flex-end;
          .price {
            display: flex;
            .text-primary {
              color: $primary;
            }
          }
          .links {
            .link {
              color: $primary;
              font-weight: bold;
              text-decoration: underline;
              cursor: pointer;
              user-select: none;
            }
          }
        }
      }
      .night-prices-content {
        .text-1 {
          font-weight: bold;
        }
        .fixed-price-per-night,
        .fixed-price-per-reservation {
          display: flex;
          align-items: center;
          margin-top: 1rem;
          .label-input {
            display: flex;
            justify-content: space-between;
            flex: 2 1 auto;
            padding-right: 2rem;
            .label {
              display: flex;
              flex-direction: column;
              .text {
                font-weight: bold;
              }
              .help {
                font-size: 0.8rem;
              }
            }
            .input-wrapper {
              display: flex;
              align-items: center;
              position: relative;
              .input-error {
                border: 1px solid red;
                &:focus {
                  outline: 1px solid red;
                }
              }
              .currency {
                position: absolute;
                right: 0.5rem;
                color: $primary;
                font-weight: bold;
              }
              input {
                max-width: 70px;
                height: 25px;
                border: 2px solid $primary;
                border-radius: 4px;
              }
            }
          }
        }

        .discount-format {
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .calendar-title {
          text-decoration: underline;
        }
        .calendar-content {
          margin-right: 0.5rem;
          width: 100%;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          .day-name {
            text-align: center;
            .long {
              display: none;
            }
          }
          .day {
            &:not(.day-name) {
              min-height: 50px;
            }
            width: calc(100% / 7);
            padding: 0.1rem;
            .empty,
            .new,
            .content {
              border-radius: 4px;
              padding: 0.2rem;
              padding-top: 0;
              height: 100%;
            }

            .empty,
            .new,
            .content {
              border: 1px solid $primary;
              color: $corduroy;
              background-color: white;
              .header-day {
                .month-day {
                  font-weight: bold;
                }
                .price-day {
                  font-size: 0.7rem;
                  text-align: right;
                  &.price-new {
                    color: $primary;
                  }
                }
              }
              .inputs {
                width: 100%;
                label,
                input {
                  font-size: 0.55rem;
                }
                input {
                  width: 100%;
                  padding-left: 0.2rem;
                  height: 20px;
                  font-size: 0.7rem;
                  border: 1px solid black;
                  // disabled
                  &:disabled {
                    cursor: not-allowed;
                    color: grey;
                  }
                }
              }
            }
            .empty {
              background-color: $tertiary;
              color: white;
              border: none;
            }
            .new {
              background-color: #daf7fc;
              input {
                background-color: white;
              }
            }
          }
        }
      }
    }

    .extra-services-header {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;

      .text {
        font-weight: bold;
        font-size: 1rem;
      }
      .price {
        font-size: 1rem;
        font-weight: bold;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        .price {
          display: flex;
          .text-primary {
            color: $primary;
          }
          .price-changes {
            display: flex;
          }
        }
        .links {
          display: flex;
          justify-content: flex-end;
          .link {
            color: $primary;
            font-weight: bold;
            text-decoration: underline;
            cursor: pointer;
            user-select: none;
          }
        }
      }
    }

    .extra-service {
      margin-top: 1rem;
      .extra-service-preview {
        .extra-service-name-price {
          display: flex;
          justify-content: space-between;
          .extra-service-price {
            display: flex;
            .text-primary {
              color: $primary;
            }
          }

          .text-1 {
            font-weight: bold;
          }

          .text-primary {
            font-weight: bold;
            color: $primary;
          }
        }
        .extra-service-units-modify-delete {
          display: flex;
          justify-content: space-between;
          .link {
            color: $primary;
            font-weight: bold;
            text-decoration: underline;
            cursor: pointer;
            user-select: none;
          }
        }
      }
      .extra-service-modify {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        .input-group {
          width: 100%;
          margin: 0.5rem 0;
          .input {
            width: 100%;
          }
        }
        .links {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          .link {
            color: $primary;
            font-weight: bold;
            text-decoration: underline;
            cursor: pointer;
            user-select: none;
            &:last-child {
              margin-left: 0.5rem;
            }
          }
        }
      }
      .discount-format {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
      .discount-format {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
      .calendar-title {
        text-decoration: underline;
      }
      .extra-service-calendar {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .day-name {
          text-align: center;
          .long {
            display: none;
          }
        }
        .day {
          &:not(.day-name) {
            min-height: 50px;
          }
          width: calc(100% / 7);
          padding: 0.1rem;
          .empty,
          .new,
          .content {
            border-radius: 4px;
            padding: 0.2rem;
            padding-top: 0;
            height: 100%;
          }

          .empty,
          .new,
          .content {
            border: 1px solid $primary;
            color: $corduroy;
            background-color: white;
            .header-day {
              .month-day {
                font-weight: bold;
              }
              .price-day {
                font-size: 0.7rem;
                text-align: right;
                &.price-new {
                  color: $primary;
                }
              }
            }
            .inputs {
              width: 100%;
              label,
              input {
                font-size: 0.55rem;
              }
              input {
                width: 100%;
                padding-left: 0.2rem;
                height: 20px;
                font-size: 0.7rem;
                border: 1px solid black;
              }
            }
          }
          .empty {
            background-color: $tertiary;
            color: white;
            border: none;
          }
          .new {
            background-color: #daf7fc;
            input {
              background-color: white;
            }
          }
        }
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
  .main-container {
    width: 700px;
    .main-content {
      .selectors {
        display: flex;
        .input-group:last-child {
          margin-left: 3rem;
        }
      }
      .night-prices {
        .night-prices-content {
          .calendar-content {
            .day-name {
              text-align: left;
              .long {
                display: block;
              }
              .short {
                display: none;
              }
            }
            .day {
              .new,
              .content {
                .header-day {
                  display: flex;
                  justify-content: space-between;
                  .price-day {
                    display: block;
                    font-size: 1rem;
                  }
                }
                .inputs {
                  label,
                  input {
                    font-size: 0.9rem;
                  }
                }
              }
            }
          }
        }
      }
      .extra-service {
        .extra-service-calendar {
          .day-name {
            text-align: left;
            .long {
              display: block;
            }
            .short {
              display: none;
            }
          }
          .day {
            .new,
            .content {
              .header-day {
                display: flex;
                justify-content: space-between;
                .price-day {
                  display: block;
                  font-size: 1rem;
                }
              }
              .inputs {
                label,
                input {
                  font-size: 0.9rem;
                }
              }
            }
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
