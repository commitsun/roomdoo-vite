<template>
  <div class="main-container">
    <div class="board-service" v-if="!currentReservation?.isBlocked">
      <div class="label">Régimen incluido en la habitación:</div>
      <div class="input">
        <AppSelect
          size="small"
          class="select"
          placeholder="Selecciona opción"
          :options="[...boardServices, { id: 0, name: 'Sin régimen incluido' }]"
          v-model="boardServiceSelected"
          optionLabel="name"
          optionValue="id"
        />
      </div>
    </div>

    <div class="extra-services">
      <div
        v-for="(service, serviceIndex) in calendarDatesByService"
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
              <span v-if="service.serviceId"> {{ service.priceTotal.toFixed(2) }}€ </span>
              <CustomIcon
                imagePath="/app-images/trending-flat.svg"
                width="20px"
                height="20px"
                color="primary"
                v-if="service.viewMode !== 'preview' && service.serviceId"
              />

              <span v-if="service.viewMode === 'modify'" class="text-primary">
                {{
                  (
                    service.quantity *
                    ((service.priceForAllLines ?? 0) *
                      (1 - (service.discountForAllLines ?? 0) / 100))
                  ).toFixed(2)
                }}€
              </span>
              <span v-else-if="service.viewMode === 'calendar'" class="text-primary">
                {{
                  service.items
                    .filter((el) => el.serviceLine)
                    .map(
                      (el) =>
                        ((el.serviceLine?.priceUnit ?? 0) -
                          (el.serviceLine?.priceUnit ?? 0) *
                            ((el.serviceLine?.discount ?? 0) / 100)) *
                        (el.serviceLine?.quantity ?? 0),
                    )
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)
                }}€
              </span>
            </div>
          </div>
          <div class="extra-service-units-modify-delete">
            <div class="left">
              <span v-if="service.viewMode === 'modify'">
                {{ service.quantity }}
              </span>
              <span v-else>
                {{
                  service.items
                    .filter((el) => el.serviceLine)
                    .map((el) => el.serviceLine?.quantity ?? 0)
                    .reduce((a, b) => a + b, 0)
                }}
              </span>
              unidad{{ service.quantity > 1 ? 'es' : '' }}
            </div>
            <div class="right">
              <div
                class="link"
                @click="removeService(serviceIndex, service.serviceId)"
                v-if="
                  service.viewMode === 'preview' ||
                  (service.viewMode === 'calendar' && service.perDay)
                "
              >
                Eliminar
              </div>
              <div
                class="link"
                @click="previewServiceView(serviceIndex, service.serviceId)"
                v-if="service.viewMode === 'calendar' && service.serviceId"
              >
                Restaurar
              </div>
              <div
                class="link"
                v-if="service.viewMode === 'preview'"
                @click="fixedFieldsServiceView(serviceIndex)"
              >
                Modificar
              </div>
              <div
                class="link"
                @click="fixedFieldsServiceView(serviceIndex)"
                v-if="service.viewMode === 'calendar' && service.perDay"
              >
                Modificar para todas las fechas
              </div>
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
            <div class="label">Precio Ud:</div>
            <div class="input">
              <InputNumber
                class="input"
                v-model="service.priceForAllLines"
                size="small"
                :minFractionDigits="0"
                :maxFractionDigits="2"
                mode="currency"
                currency="EUR"
              />
            </div>
          </div>

          <div class="input-group">
            <div class="label">Descuento (%):</div>
            <div class="input">
              <InputNumber
                class="input"
                v-model="service.discountForAllLines"
                size="small"
                :minFractionDigits="0"
                :maxFractionDigits="2"
              />
            </div>
          </div>

          <div class="links">
            <div class="link" @click="removeService(serviceIndex, service.serviceId)">Eliminar</div>
            <div
              class="link"
              @click="previewServiceView(serviceIndex, service.serviceId)"
              v-if="service.serviceId"
            >
              Restaurar
            </div>
            <div class="link" v-if="service.perDay" @click="perDayServiceView(serviceIndex)">
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
          {{ new Date(currentReservation?.checkin as Date).getFullYear() }}
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
                      item.date,
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
                      item.date,
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <div class="buttons">
      <AppButton label="Guardar" @click="saveChanges()" class="button" />
      <AppButton
        label="Cancelar"
        raised
        size="small"
        severity="secondary"
        class="button"
        @click="cancelChanges()"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';

import { type ServiceInterface } from '@/legacy/interfaces/ServiceInterface';
import { type ServiceLineInterface } from '@/legacy/interfaces/ServiceLineInterface';
import { defineComponent, ref, onMounted, computed, watch } from 'vue';

import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import utilsDates, { localeSpain } from '@/legacy/utils/dates';
import { dialogService } from '@/legacy/services/DialogService';
import { useStore } from '@/legacy/store';

interface CalendarItemInterface {
  date: Date;
  serviceLine?: ServiceLineInterface;
}

interface CalendarContentInterface {
  isDiscountShowedAsPercentage: boolean;
  serviceId?: number;
  productId: number;
  serviceName: string;
  perDay: boolean;
  viewMode: string;
  priceForAllLines: number | undefined;
  discountForAllLines: number | undefined;
  priceTotal: number;
  priceSubtotal: number;
  quantity: number;
  items: CalendarItemInterface[];
}

export default defineComponent({
  props: {
    serviceIndex: {
      type: Number,
      required: false,
    },
  },
  components: {
    AppSelect: Select,
    CustomIcon,
    InputNumber,
    ToggleSwitch,
    AppButton: Button,
  },
  setup(props, context) {
    const store = useStore();

    const isIncludeBoardServiceInRoomPrice = ref(false);
    const boardServiceSelected = ref(0);
    const extraServiceSelected = ref(0);
    const calendarDatesByService = ref([] as CalendarContentInterface[]);
    const calendarServicesToRemove = ref([] as number[]);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activePricelistId = computed(() => store.state.pricelists.activePricelist);
    const products = computed(() => store.state.products.products);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const currentReservationLines = computed(() => store.state.reservationLines.reservationLines);

    const boardServices = computed(() =>
      store.state.boardServices.boardServices.filter(
        (el) => el.roomTypeId === currentReservation.value?.roomTypeId,
      ),
    );

    const currentReservationServices = computed(() =>
      store.state.services.services.filter((el) => !el.isBoardService),
    );

    const changedServiceLines = computed(() => {
      const out: Array<{ serviceId?: number; line: ServiceLineInterface }> = [];
      calendarDatesByService.value.forEach((svc) => {
        svc.items.forEach((it) => {
          const sl = it.serviceLine as any;
          if (!sl) {
            return;
          }

          if (sl.virtual && sl.quantity === 0) {
            return;
          }

          const orig = sl.originalQuantity;
          const changed = orig === undefined ? true : sl.quantity !== orig;

          if (changed) {
            out.push({ serviceId: svc.serviceId, line: it.serviceLine! });
          }
        });
      });

      return out;
    });

    const dateStartMonth = () => {
      let result = '';
      if (currentReservation.value) {
        result = localeSpain.months[new Date(currentReservation?.value.checkin).getMonth()];
      }
      return result;
    };

    const dateStartYear = () => {
      let result = '';
      if (currentReservation.value) {
        result = new Date(currentReservation?.value.checkin).getFullYear().toString();
      }
      return result;
    };

    const priceByDate = (date: Date) =>
      store.state.prices.prices.find((el) => el.date.getTime() === date.getTime());

    const servicePercentageDiscountFromPrice = (
      serviceIndex: number,
      newPriceDiscount: number,
      date: Date,
    ) => {
      const item = calendarDatesByService.value[serviceIndex]?.items.find(
        (el) => el.date.getTime() === date.getTime(),
      );
      if (item && item.serviceLine) {
        item.serviceLine.discount = parseFloat(
          ((newPriceDiscount * 100) / item.serviceLine.priceUnit).toFixed(2),
        );
      }
    };

    const servicePriceDiscountFromPercentage = (
      serviceIndex: number,
      newPercentageDiscount: number,
      date: Date,
    ) => {
      const item = calendarDatesByService.value[serviceIndex]?.items.find(
        (el) => el.date.getTime() === date.getTime(),
      );

      if (item && item.serviceLine) {
        item.serviceLine.discountPrice = parseFloat(
          ((newPercentageDiscount * item.serviceLine.priceUnit) / 100).toFixed(2),
        );
      }
    };

    const oldTotalPriceServices = (serviceId: number) => {
      let result = 0;

      const service = currentReservationServices.value.find((el) => el.id === serviceId);
      if (service) {
        service.serviceLines.forEach((line) => {
          result += (line.priceUnit - line.priceUnit * (line.discount / 100)) * line.quantity;
        });
      }
      return result;
    };

    const addService = async (productId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (currentReservation.value) {
          const product = products.value.find((el) => el.id === productId);

          let quantity = 1;
          let priceTotal = 0;

          if (product?.perPerson) {
            quantity = currentReservation.value?.adults ?? 0;
          }

          let quantityHeader = 0;
          const items: CalendarItemInterface[] = [];

          if (product?.perDay) {
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: activeProperty.value?.id,
              pricelistId: activePricelistId.value?.id,
              productId,
              dateFrom: new Date(currentReservation.value?.checkin),
              dateTo: new Date(currentReservation.value?.checkout),
            });

            const startDate = new Date(currentReservation.value?.checkin);
            const endDate = new Date(currentReservation.value?.checkout);

            const checkinDate = new Date(currentReservation.value?.checkin);
            const checkoutDate = new Date(currentReservation.value?.checkout);

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

            utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
              const priceUnit = priceByDate(new Date(date))?.price ?? 0;
              let serviceLine;
              if (
                date.getTime() >= checkinDate.getTime() &&
                date.getTime() < checkoutDate.getTime() &&
                product.consumedOn === 'before'
              ) {
                priceTotal += priceUnit * quantity;
                quantityHeader += quantity;
                serviceLine = {
                  priceUnit,
                  date,
                  quantity,
                  discount: 0,
                  discountPrice: 0,
                };
              } else if (
                date.getTime() > checkinDate.getTime() &&
                date.getTime() <= checkoutDate.getTime() &&
                product.consumedOn === 'after'
              ) {
                quantityHeader += quantity;
                priceTotal += priceUnit * quantity;
                serviceLine = {
                  priceUnit,
                  date,
                  quantity,
                  discount: 0,
                };
              }

              items.push({
                date,
                serviceLine,
              });
            });
          } else {
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: activeProperty.value?.id,
              pricelistId: activePricelistId.value?.id,
              productId,
              dateFrom: store.state.reservations.currentReservation?.checkout as Date,
              dateTo: store.state.reservations.currentReservation?.checkout as Date,
            });
            quantityHeader += quantity;
            items.push({
              date: store.state.reservations.currentReservation?.checkout as Date,
              serviceLine: {
                priceUnit:
                  priceByDate(store.state.reservations.currentReservation?.checkout as Date)
                    ?.price ?? 0,
                date: store.state.reservations.currentReservation?.checkout as Date,
                quantity,
                discount: 0,
              },
            });
          }

          if (product) {
            let priceForAllLines;
            const lines = items.map((el) => el.serviceLine).filter((el) => el !== undefined);
            if (lines.every((val) => val?.priceUnit === lines[0]?.priceUnit)) {
              priceForAllLines = lines[0]?.priceUnit;
            }
            calendarDatesByService.value.push({
              isDiscountShowedAsPercentage: true,
              productId: product.id,
              serviceName: product?.name,
              perDay: product?.perDay,
              viewMode: 'modify',
              priceForAllLines,
              discountForAllLines: 0,
              priceTotal,
              priceSubtotal: 0,
              quantity: quantityHeader,
              items,
            });
          }
        }
        extraServiceSelected.value = -1;
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

    const previewServiceView = (serviceIndex: number, serviceId: number | undefined) => {
      const serviceState = currentReservationServices.value.find((el) => el.id === serviceId);
      if (serviceState) {
        calendarDatesByService.value
          .find((el) => el.serviceId === serviceId)
          ?.items.forEach((el) => {
            const lineState = serviceState.serviceLines.find(
              (line) => el.date.getDate() === new Date(line.date).getDate(),
            );
            if (lineState) {
              el.serviceLine = {
                priceUnit: lineState?.priceUnit,
                date: lineState?.date,
                quantity: lineState?.quantity,
                discount: lineState?.discount,
                discountPrice: (lineState.discount / 100) * lineState.priceUnit,
                id: lineState?.id,
              };
            }
          });
      }
      calendarDatesByService.value[serviceIndex].viewMode = 'preview';
    };

    const fixedFieldsServiceView = (serviceIndex: number) => {
      calendarDatesByService.value[serviceIndex].viewMode = 'modify';
    };

    const perDayServiceView = (serviceIndex: number) => {
      calendarDatesByService.value[serviceIndex].viewMode = 'calendar';
    };

    const removeService = (serviceIndex: number, serviceId: number | undefined) => {
      if (serviceId) {
        calendarServicesToRemove.value.push(serviceId);
      }
      calendarDatesByService.value.splice(serviceIndex, 1);
    };

    const toMidnight = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const padToWeek = (start: Date, end: Date) => {
      const s = new Date(start);
      const e = new Date(end);
      const daysBefore = s.getDay() === 0 ? 6 : s.getDay() - 1;
      const daysAfter = e.getDay() === 0 ? 0 : 6 - (e.getDay() - 1);
      s.setDate(s.getDate() - daysBefore);
      e.setDate(e.getDate() + daysAfter);
      return { start: s, end: e };
    };

    const buildCalendarDatesByService = () => {
      store.state.services.services
        .filter((el) => !el.isBoardService)
        .forEach((el: ServiceInterface) => {
          let priceForAllLines;
          let discountForAllLines;

          if (
            el.serviceLines.every(
              (val) =>
                val.priceUnit === el.serviceLines[0].priceUnit &&
                val.discount === el.serviceLines[0].discount,
            )
          ) {
            priceForAllLines = el.serviceLines[0].priceUnit;
            discountForAllLines = el.serviceLines[0].discount;
          } else {
            priceForAllLines = 0;
            discountForAllLines = 0;
          }

          const serviceDates: CalendarItemInterface[] = [];
          const product = products.value.find((p) => p.id === el.productId);

          if (product?.perDay) {
            const checkin = toMidnight(
              new Date(store.state.reservations.currentReservation?.checkin as any),
            );
            const checkout = toMidnight(
              new Date(store.state.reservations.currentReservation?.checkout as any),
            );

            const consumedOn = (product as any)?.consumedOn ?? 'before';

            let startDate = new Date(checkin);
            let endDate = new Date(checkout);

            ({ start: startDate, end: endDate } = padToWeek(startDate, endDate));

            const extraEditableDay =
              consumedOn === 'after' ? checkin.getTime() : checkout.getTime();

            utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
              const day = toMidnight(new Date(date));
              const dayTs = day.getTime();

              let serviceLine = el.serviceLines.find(
                (sl) => toMidnight(new Date(sl.date)).getTime() === dayTs,
              );

              if (serviceLine) {
                serviceLine.discountPrice = (serviceLine.discount / 100) * serviceLine.priceUnit;
                (serviceLine as any).originalQuantity = serviceLine.quantity;
              }

              if (
                !serviceLine &&
                (dayTs === extraEditableDay ||
                  (dayTs > checkin.getTime() && dayTs < checkout.getTime()))
              ) {
                const basePrice = priceForAllLines ?? 0;
                serviceLine = {
                  date: new Date(day),
                  quantity: 0,
                  priceUnit: basePrice,
                  discount: discountForAllLines ?? 0,
                  discountPrice: ((discountForAllLines ?? 0) / 100) * basePrice,
                };
                (serviceLine as any).originalQuantity = 0;
                (serviceLine as any).virtual = true;
              }

              serviceDates.push({ date: day, serviceLine });
            });
          } else {
            serviceDates.push({
              date: store.state.reservations.currentReservation?.checkout as Date,
              serviceLine: el.serviceLines[0],
            });
          }

          calendarDatesByService.value.push({
            isDiscountShowedAsPercentage: true,
            serviceId: el.id,
            productId: el.productId,
            serviceName: el.name ?? '',
            perDay: product?.perDay ?? false,
            viewMode: 'preview',
            priceForAllLines,
            priceTotal: el.priceTotal ?? 0,
            priceSubtotal: el.priceSubtotal ?? 0,
            quantity: el.quantity ?? 0,
            discountForAllLines,
            items: serviceDates,
          });
        });
    };

    const saveChanges = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (
          currentReservation.value &&
          boardServiceSelected.value !== currentReservation.value?.boardServiceId
        ) {
          await store.dispatch('reservations/updateReservation', {
            reservationId: currentReservation.value.id,
            boardServiceId: boardServiceSelected.value,
          });
        }
        await Promise.all(
          calendarServicesToRemove.value.map(async (el) => {
            await store.dispatch('services/deleteService', el);
          }),
        );

        await Promise.all(
          calendarDatesByService.value
            .filter((el) => el.items)
            .map(async (el) => {
              const serviceLines: ServiceLineInterface[] = [];
              if (el.viewMode === 'calendar') {
                el.items.forEach((i) => {
                  if (
                    (i.serviceLine &&
                      changedServiceLines.value.find((sl) => sl.line === i.serviceLine)) ||
                    i.serviceLine?.id
                  ) {
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
                  if (
                    (i.serviceLine &&
                      changedServiceLines.value.find((sl) => sl.line === i.serviceLine)) ||
                    i.serviceLine?.id
                  ) {
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
              if (!el.serviceId) {
                await store.dispatch('services/createService', {
                  reservationId: currentReservation.value?.id,
                  productId: el.productId,
                  serviceLines,
                });
              } else {
                await store.dispatch('services/updateService', {
                  reservationId: currentReservation.value?.id,
                  serviceId: el.serviceId,
                  serviceLines,
                });
              }
            }),
        );
        await Promise.all([
          store.dispatch('folios/fetchFolio', currentFolio.value?.id),
          store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
          store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id),
          store.dispatch('services/fetchServices', currentReservation.value?.id),
        ]);
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

    const cancelChanges = async () => {
      if (changedServiceLines.value.length > 0) {
        void store.dispatch('layout/showSpinner', true);
        await store.dispatch('services/fetchServices', currentReservation.value?.id);
        void store.dispatch('layout/showSpinner', false);
      }
      context.emit('close');
    };

    onMounted(() => {
      if (currentReservation.value?.boardServiceId) {
        boardServiceSelected.value = currentReservation.value.boardServiceId;
      }
      buildCalendarDatesByService();
      if (props.serviceIndex !== undefined && props.serviceIndex > -1) {
        const svc = calendarDatesByService.value[props.serviceIndex];
        if (svc?.perDay) {
          perDayServiceView(props.serviceIndex);
        } else {
          calendarDatesByService.value[props.serviceIndex].viewMode = 'modify';
        }
      }
    });

    return {
      isIncludeBoardServiceInRoomPrice,
      boardServiceSelected,
      extraServiceSelected,
      calendarDatesByService,
      calendarServicesToRemove,
      activeProperty,
      activePricelistId,
      products,
      currentFolio,
      currentReservation,
      currentReservationLines,
      currentReservationServices,
      boardServices,
      dateStartMonth,
      dateStartYear,
      oldTotalPriceServices,
      servicePercentageDiscountFromPrice,
      servicePriceDiscountFromPercentage,
      addService,
      removeService,
      previewServiceView,
      fixedFieldsServiceView,
      perDayServiceView,
      buildCalendarDatesByService,
      saveChanges,
      cancelChanges,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  height: 100%;
  .board-service {
    margin-bottom: 1rem;
    .label {
      font-weight: bold;
      user-select: none;
    }
    .select {
      width: 100%;
    }
  }
  .extra-services {
    .link {
      cursor: pointer;
      user-select: none;
      color: $primary;
      text-decoration: underline;
      font-weight: bold;
    }

    .extra-service {
      .extra-service-preview {
        .extra-service-name-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .extra-service-title {
            font-weight: bold;
            font-size: 1.5rem;
          }
          .extra-service-price {
            font-weight: bold;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            .text-primary {
              color: $primary;
            }
          }
        }
        .extra-service-units-modify-delete {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .left {
            font-weight: bold;
          }
          .right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
        }
      }
      .extra-service-modify {
        .input-group {
          .input {
            width: 100%;
          }
        }
        .links {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
      }
      .discount-format {
        margin-bottom: 1rem;
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
    hr {
      width: 100%;
      background-color: $primary;
      height: 1px;
      margin-top: 1rem;
      margin-bottom: 1rem;
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
    width: 750px;
    .board-service {
      .select {
        width: auto;
      }
    }
    .extra-services {
      .extra-service {
        .extra-service-modify {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
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
