<template>
  <div class="main-content">
    <div class="dates-content">
      <div class="dates">
        <div class="date">
          <span class="title-date"> Check-in </span>
          <span class="date-selected">
            <CustomIcon
              imagePath="/app-images/icon-calendar-blue.svg"
              color="primary"
              width="17px"
              height="17px"
              class="calendar-icon"
            />
            {{
              checkinDate.toLocaleDateString('default', {
                weekday: 'short',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
          <div class="date-calendar">
            <DatePicker
              v-model="checkinDate"
              class="datepicker"
              :maxDate="new Date(checkoutDate.getTime() - 86400000)"
              inline
            />
          </div>
        </div>
        <div class="date">
          <span class="title-date"> Check-out </span>
          <span class="date-selected">
            <CustomIcon
              imagePath="/app-images/icon-calendar-blue.svg"
              color="primary"
              width="17px"
              height="17px"
              class="calendar-icon"
            />
            {{
              checkoutDate.toLocaleDateString('default', {
                weekday: 'short',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
          <div class="date-calendar">
            <DatePicker
              v-model="checkoutDate"
              class="datepicker"
              :minDate="new Date(checkinDate.getTime() + 86400000)"
              inline
            />
          </div>
        </div>
      </div>
    </div>
    <div class="calendar-container splitted-container" v-if="currentReservation?.isSplitted">
      <div class="first">
        <div class="month-year">{{ dateStartMonth() }} {{ dateStartYear() }}</div>
      </div>
      <div class="calendar-content">
        <div
          class="day day-name"
          v-for="day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']"
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
          <div :class="item.reservationLine && !item.new ? 'content' : item.new ? 'new' : 'empty'">
            <div class="header-day">
              <div class="month-day">
                {{ item.date.getDate() }}
              </div>
            </div>
            <div class="select-container">
              <select v-if="item.reservationLine" v-model="item.reservationLine.roomId">
                <option
                  v-for="room in item.rooms"
                  :key="room.id"
                  :value="room.id"
                  :selected="item.reservationLine && item.reservationLine.roomId === room.id"
                >
                  {{ room.shortName }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="option" v-if="currentReservation?.pricelistId">
      <span> Establecer el precio según la tarifa asignada</span>
      <ToggleSwitch size="small" v-model="isPricePerPricelist" class="toggle" />
    </div>

    <div class="option-content">
      <span> ({{ pricelistName }})</span>
    </div>

    <div class="option" v-if="!isPricePerPricelist">
      <span class="option-title">Precio fijo por noche</span>
      <ToggleSwitch size="small" v-model="isFixedPricePerNight" class="toggle" />
    </div>

    <div class="option-content" v-if="!isPricePerPricelist && isFixedPricePerNight">
      <div class="input-group">
        <div class="label">Precio</div>
        <InputNumber
          :inputStyle="{
            width: '100%',
          }"
          v-model="price"
          @input="validatePrice()"
          size="small"
          class="input"
          :class="isPriceError ? 'input-error' : ''"
          mode="currency"
          currency="EUR"
        />
      </div>
      <div class="input-group">
        <div class="label">% Descuento</div>
        <InputNumber
          :inputStyle="{
            width: '100%',
          }"
          v-model="discount"
          @input="validateDiscount()"
          size="small"
          class="input"
          :class="isDiscountError ? 'input-error' : ''"
        />
      </div>
    </div>

    <div class="option" v-if="!isPricePerPricelist && !isFixedPricePerNight">
      <span class="option-title">Mostrar descuento en porcentajes</span>
      <ToggleSwitch size="small" v-model="isDiscountShowedAsPercentage" class="toggle" />
    </div>

    <div class="calendar-container" v-if="!isPricePerPricelist && !isFixedPricePerNight">
      <div class="month-year">{{ dateStartMonth() }} {{ checkinDate.getFullYear() }}</div>
      <div class="calendar-content">
        <div
          class="day day-name"
          v-for="day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']"
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
          <div :class="item.reservationLine && !item.new ? 'content' : item.new ? 'new' : 'empty'">
            <div class="header-day">
              <div class="month-day">
                {{ item.date.getDate() }}
              </div>
              <div
                class="price-day"
                v-if="item.reservationLine"
                :class="item.new ? 'price-new' : ''"
              >
                {{
                  (item.reservationLine.price * (1 - item.reservationLine.discount / 100)).toFixed(
                    2
                  )
                }}€
              </div>
            </div>

            <div class="inputs" v-if="item.reservationLine">
              <label>Precio €</label>
              <input
                name="price-nigh"
                type="number"
                v-model="item.reservationLine.price"
                :disabled="!item.new"
              />
              <label>dto {{ isDiscountShowedAsPercentage ? '%' : '€' }}</label>
              <input
                type="number"
                v-show="isDiscountShowedAsPercentage"
                v-model="item.reservationLine.discount"
                :disabled="!item.new"
                @input="
                  reservationPriceDiscountFromPercentage(
                    item.reservationLine?.discount ?? 0,
                    item.date
                  )
                "
              />
              <input
                type="number"
                v-show="!isDiscountShowedAsPercentage && item.new"
                v-model="item.reservationLine.discountPrice"
                @input="
                  reservationPercentageDiscountFromPrice(
                    item.reservationLine?.discountPrice ?? 0,
                    item.date
                  )
                "
              />
              <input
                v-show="!item.new && !isDiscountShowedAsPercentage"
                type="number"
                disabled
                :value="
                  ((item.reservationLine.discount * item.reservationLine.price) / 100).toFixed(2)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-changes">
      <div class="change">
        <span class="text"> Antes del cambio </span>
        <div class="nights-price old">
          <span class="nights">
            <span class="text-bold">
              {{ currentReservationLines.length }}
            </span>
            noches
          </span>
          <span class="separator" v-if="currentReservation?.pricelistId"> </span>
          <span class="price" v-if="currentReservation?.pricelistId">
            {{ oldReservationLinesTotalPrice.toFixed(2) }} €
          </span>
        </div>
        <span class="text">
          <span v-if="currentReservation?.checkin">
            {{
              new Date(currentReservation.checkin).toLocaleDateString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
          <CustomIcon
            imagePath="/app-images/trending-flat.svg"
            width="15px"
            height="15px"
            color="grey"
            class="icon"
          />
          <span v-if="currentReservation?.checkout">
            {{
              new Date(currentReservation.checkout).toLocaleDateString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
        </span>
      </div>

      <div class="arrow">
        <CustomIcon
          imagePath="/app-images/chevron-right.svg"
          width="40px"
          height="40px"
          class="icon-arrow-back"
          color="grey"
          colorHover="primary"
        />
      </div>
      <div class="change">
        <span class="text text-primary"> Después del cambio </span>
        <div class="flex nights-price">
          <span class="nights">
            <span class="text-bold">
              {{ newRange.length }}
            </span>
            noches
          </span>
          <div class="separator" v-if="currentReservation?.pricelistId"></div>
          <span class="price" v-if="currentReservation?.pricelistId">
            {{ newPricePerPricelistOrChangedByUser.toFixed(2) }}€
          </span>
        </div>
        <span class="text">
          <span class="text-primary">
            {{
              checkinDate.toLocaleDateString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
          <CustomIcon
            imagePath="/app-images/trending-flat.svg"
            width="15px"
            height="15px"
            class="icon"
            color="primary"
          />

          <span class="text-primary">
            {{
              checkoutDate.toLocaleDateString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            }}
          </span>
        </span>
      </div>
    </div>

    <div class="buttons">
      <AppButton
        label="Guardar"
        @click="saveChanges()"
        class="button"
        :disabled="
          isPriceError ||
          isDiscountError ||
          (someReservationLineInRangeWithNoRoom && currentReservation?.isSplitted)
        "
        :class="{
          disabled:
            isPriceError ||
            isDiscountError ||
            (someReservationLineInRangeWithNoRoom && currentReservation?.isSplitted),
        }"
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
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import useVuelidate from '@vuelidate/core';
import { required, decimal } from '@vuelidate/validators';

import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

import type { ReservationLineInterface } from '@/legacy/interfaces/ReservationLineInterface';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

import utilsDates, { localeSpain, ONE_DAY_IN_MS } from '@/legacy/utils/dates';
import { usePlanning } from '@/legacy/utils/usePlanning';
import { dialogService } from '@/legacy/services/DialogService';
import { useStore } from '@/legacy/store';
import type { RoomInterface } from '@/legacy/interfaces/RoomInterfaces';
import type { AvailabilityPerDayInterface } from '@/legacy/interfaces/AvailabilityPerDayInterface';

interface CalendarChangeDatesInterface {
  date: Date;
  reservationLine?: ReservationLineInterface;
  new: boolean;
  isInRange: boolean;
  rooms?: RoomInterface[];
}

export default defineComponent({
  components: {
    CustomIcon,
    DatePicker,
    ToggleSwitch,
    InputNumber,
    AppButton: Button,
  },
  setup(props, context) {
    const store = useStore();
    const route = useRoute();
    const { refreshPlanning } = usePlanning();
    const localeValue = ref(localeSpain);
    const checkinDate = ref(new Date());
    const checkoutDate = ref(new Date());
    const newRange = ref([] as Date[]);
    const isSettingSaleChannel = ref(false);
    const saleChannelSelected = ref(null);
    const roomSelected = ref(null);
    const isPricePerPricelist = ref(true);
    const isFixedPricePerNight = ref(true);
    const isDiscountShowedAsPercentage = ref(false);
    const isPriceError = ref(false);
    const isDiscountError = ref(false);
    const price = ref(0);
    const discount = ref(0);
    const calendarDates = ref([] as CalendarChangeDatesInterface[]);
    const availabilityPerDay = ref([] as AvailabilityPerDayInterface[]);
    const pricelistName = ref('no pricelist found');
    const saleChannels = computed(() => store.state.saleChannels.saleChannels);
    const availableRooms = computed(() => store.state.rooms.rooms);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const currentReservationLines = computed(() => store.state.reservationLines.reservationLines);

    const oldReservationLinesTotalPrice = computed(() =>
      currentReservationLines.value
        .map((el) => ({ price: el.price, discount: el.discount }))
        .reduce((acc, val) => acc + val.price - val.price * (val.discount / 100), 0)
    );

    const newPricePerPricelistOrChangedByUser = computed(() => {
      let result = 0;
      if (isFixedPricePerNight.value && !isPricePerPricelist.value) {
        return newRange.value.length * (price.value - price.value * (discount.value / 100));
      }

      calendarDates.value.forEach((el: CalendarChangeDatesInterface) => {
        if (el.isInRange && el.reservationLine) {
          result +=
            el.reservationLine.price -
            el.reservationLine.price * (el.reservationLine.discount / 100);
        }
      });
      return result;
    });

    const notNegativeNumber = () => {
      if (price.value < 0) {
        return false;
      }
      return true;
    };

    const isBetween0And100 = () => {
      if (discount.value < 0 || discount.value > 100) {
        return false;
      }
      return true;
    };

    const validationRules = computed(() => ({
      price: {
        required,
        decimal,
        notNegativeNumber,
      },
      discount: {
        decimal,
        isBetween0And100,
      },
    }));

    const someReservationLineInRangeWithNoRoom = computed(() => {
      return calendarDates.value.some((el) => el.isInRange && el.reservationLine?.roomId === -1);
    });

    const validator = useVuelidate(validationRules, {
      price,
      discount,
    });

    const dateStartMonth = () => {
      let result = '';
      if (checkinDate.value) {
        result = localeSpain.months[new Date(checkinDate?.value).getMonth()];
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

    const saveChanges = async () => {
      const reservationLines = calendarDates.value
        .filter((el) => el.isInRange)
        .map((el) => el.reservationLine)
        .map((el) => ({
          date: el?.date,
          price: el?.price,
          discount: el?.discount,
          roomId: currentReservation.value?.isSplitted
            ? el?.roomId
            : currentReservation.value?.preferredRoomId,
          pmsPropertyId: activeProperty.value?.id,
          reservationId: currentReservation.value?.id,
        }));

      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/updateReservation', {
          reservationId: currentReservation.value?.id,
          reservationLines,
        });
        if (route.fullPath.includes('planning')) {
          await refreshPlanning();
        }
        await Promise.all([
          store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id),
          store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
          store.dispatch('folios/fetchFolio', currentReservation.value?.folioId),
        ]);
      } catch (error) {
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

    const buildAvailabilityPerDay = async () => {
      availabilityPerDay.value = [];
      await Promise.all(
        utilsDates.getDatesRange(checkinDate.value, checkoutDate.value).map(async (date) => {
          const oneDayAfter = new Date(date);
          oneDayAfter.setDate(date.getDate() + 1);
          const response = await store.dispatch('rooms/fetchRoomsByAvailability', {
            pmsPropertyId: activeProperty.value?.id,
            availabilityFrom: date,
            availabilityTo: oneDayAfter,
            pricelistId: currentFolio.value?.pricelistId,
            currentLines: currentReservationLines.value.map((el) => el.id),
          });
          availabilityPerDay.value.push({
            date,
            rooms: (response.data as RoomInterface[]).filter(
              (el) =>
                el.capacity >= (currentReservation.value?.adults ?? 0) &&
                el.roomTypeClassId ===
                  store.state.roomTypes.roomTypes.find(
                    (el) => el.id === currentReservation.value?.roomTypeId
                  )?.classId
            ),
          });
        })
      );
    };

    const buildCalendarDates = async () => {
      // Assuming firstDayOfWeek = 1 (monday)
      calendarDates.value = [];
      let startDate;
      let endDate;
      let daysBeforeCheckin;
      let daysAfterCheckout;
      if (currentReservation.value) {
        startDate = new Date(checkinDate.value);
        if (startDate.getDay() === 0) {
          daysBeforeCheckin = 6;
        } else {
          daysBeforeCheckin = startDate.getDay() - 1;
        }
        endDate = new Date(checkoutDate.value);
        if (endDate.getDay() === 0) {
          daysAfterCheckout = 0;
        } else {
          daysAfterCheckout = 6 - (endDate.getDay() - 1);
        }
        startDate.setDate(startDate.getDate() - daysBeforeCheckin);
        endDate.setDate(endDate.getDate() + daysAfterCheckout);
        utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
          const night = currentReservationLines.value.find(
            (rl) =>
              new Date(rl.date).getTime() === date.getTime() &&
              date.getTime() >= checkinDate.value.getTime() &&
              date.getTime() < checkoutDate.value.getTime()
          );
          let item: CalendarChangeDatesInterface = {
            new: false,
            date,
            isInRange: false,
          };
          if (night) {
            item = {
              new: false,
              date,
              reservationLine: night,
              isInRange: true,
              rooms: availabilityPerDay.value.find((el) => el.date.getTime() === date.getTime())
                ?.rooms,
            };
          } else if (
            currentReservation.value &&
            date.getTime() >= checkinDate.value.getTime() &&
            date.getTime() < checkoutDate.value.getTime()
          ) {
            const priceFromPricelist = store.state.prices.prices.find(
              (el) => el.date.getTime() === date.getTime()
            )?.price;
            item = {
              new: true,
              date,
              rooms: availabilityPerDay.value.find((el) => el.date.getTime() === date.getTime())
                ?.rooms,
              reservationLine: {
                pmsPropertyId: activeProperty.value?.id ?? -1,
                date,
                price:
                  !isPricePerPricelist && isFixedPricePerNight
                    ? price.value
                    : priceFromPricelist ?? 0,
                discount: isFixedPricePerNight.value ? discount.value : 0,
                discountPrice: 0,
                roomId: -1,
              },
              isInRange: true,
            };
          }
          calendarDates.value.push(item);
        });
      }
    };

    const validatePrice = () => {
      validator.value.price.$touch();
      if (validator.value.price.$invalid) {
        isPriceError.value = true;
      } else {
        isPriceError.value = false;
      }
    };

    const validateDiscount = () => {
      validator.value.discount.$touch();
      if (validator.value.discount.$invalid) {
        isDiscountError.value = true;
      } else {
        isDiscountError.value = false;
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

    const reservationPriceDiscountFromPercentage = (newPercentageDiscount: number, date: Date) => {
      const item = calendarDates.value.find((el) => el.date.getTime() === date.getTime());
      if (item && item.reservationLine) {
        item.reservationLine.discountPrice = parseFloat(
          ((newPercentageDiscount * item.reservationLine.price) / 100).toFixed(2)
        );
      }
    };

    watch(isPricePerPricelist, (value) => {
      if (!value && !isFixedPricePerNight.value) {
        isFixedPricePerNight.value = true;
      } else if (value) {
        buildCalendarDates();
      }
    });

    watch(isFixedPricePerNight, (value) => {
      if (!value) {
        isDiscountShowedAsPercentage.value = true;
      }
    });

    watch([price, discount], () => {
      if (isFixedPricePerNight.value) {
        buildCalendarDates();
      }
    });

    watch(checkinDate, async (value) => {
      if (value !== null) {
        const lastNight = new Date(checkoutDate.value);
        lastNight.setDate(lastNight.getDate() - 1);
        newRange.value = utilsDates.getDatesRange(checkinDate.value, lastNight);
        if (currentReservation.value?.pricelistId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              pricelistId: currentReservation.value?.pricelistId,
              roomTypeId: currentReservation.value?.roomTypeId,
              dateFrom: checkinDate.value,
              dateTo: checkoutDate.value,
            });
          } catch (error) {
            dialogService.open({
              header: 'Error',
              content: 'Algo ha ido mal',
              btnAccept: 'Ok',
            });
          } finally {
            void store.dispatch('layout/showSpinner', false);
          }
        }
        await buildAvailabilityPerDay();
        buildCalendarDates();
      }
    });

    watch(checkoutDate, async (value) => {
      if (value !== null) {
        const lastNight = new Date(checkoutDate.value);
        lastNight.setDate(lastNight.getDate() - 1);
        newRange.value = utilsDates.getDatesRange(checkinDate.value, lastNight);
        if (currentReservation.value?.pricelistId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              pricelistId: currentReservation.value?.pricelistId,
              roomTypeId: currentReservation.value?.roomTypeId,
              dateFrom: checkinDate.value,
              dateTo: checkoutDate.value,
            });
          } catch (error) {
            dialogService.open({
              header: 'Error',
              content: 'Algo ha ido mal',
              btnAccept: 'Ok',
            });
          } finally {
            void store.dispatch('layout/showSpinner', false);
          }
        }
        await buildAvailabilityPerDay();
        buildCalendarDates();
      }
    });

    onMounted(async () => {
      if (store.state.reservations.currentReservation) {
        checkinDate.value = new Date(store.state.reservations.currentReservation.checkin);
        checkoutDate.value = new Date(store.state.reservations.currentReservation.checkout);
        price.value =
          store.state.roomTypes.roomTypes.find(
            (el) => el.id === store.state.reservations.currentReservation?.roomTypeId
          )?.price ?? 0;
      }
      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === currentFolio.value?.pricelistId
      );
      if (pricelist) {
        pricelistName.value = pricelist.name;
      } else if (currentFolio.value?.pricelistId) {
        await store.dispatch(
          'pricelists/fetchRestrictedPricelist',
          currentFolio.value?.pricelistId
        );
        pricelistName.value = store.state.pricelists.restrictedPricelist?.name ?? '';
      }
      await buildAvailabilityPerDay();
    });

    return {
      localeValue,
      checkinDate,
      checkoutDate,
      newRange,

      isSettingSaleChannel,
      saleChannels,
      saleChannelSelected,

      availableRooms,
      roomSelected,

      isPricePerPricelist,
      isFixedPricePerNight,
      price,
      discount,
      someReservationLineInRangeWithNoRoom,

      calendarDates,
      isDiscountShowedAsPercentage,
      buildCalendarDates,
      reservationPercentageDiscountFromPrice,
      reservationPriceDiscountFromPercentage,

      activeProperty,
      currentFolio,
      currentReservation,
      currentReservationLines,

      oldReservationLinesTotalPrice,
      newPricePerPricelistOrChangedByUser,

      validator,
      isPriceError,
      isDiscountError,

      dateStartMonth,
      dateStartYear,
      pricelistName,
      ONE_DAY_IN_MS,
      saveChanges,
      validatePrice,
      validateDiscount,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  .dates-content {
    display: flex;
    flex-direction: column;
    .dates {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .date {
        display: flex;
        flex-direction: column;

        .title-date {
          margin-top: 1rem;
          font-size: 1rem;
          font-weight: bold;
        }
        .date-selected {
          display: flex;
          align-items: center;
          color: $primary;
          font-weight: bold;
          font-size: 1rem;
          .calendar-icon {
            margin-right: 0.5rem;
          }
        }
        .date-calendar {
          .datepicker {
            width: 100%;
          }
        }
      }
    }
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
  .option-content {
    .input {
      width: 100%;
    }
  }
  .calendar-container {
    .month-year {
      font-weight: bold;
      text-decoration: underline;
    }
    .calendar-content {
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
              font-size: 0.8rem;
              text-align: right;
              &.price-new {
                color: $primary;
              }
            }
          }
          .select-container {
            select {
              &:focus {
                outline: none !important;
              }
              text-align: center;

              width: 100%;
              overflow: hidden;
              overflow-wrap: break-word;
              display: inline-block;
              white-space: pre-line;
              color: $primary;
              font-weight: bold;
              border: none;
              background-color: white;
              font-size: 1.1rem;
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
  .splitted-container {
    margin-top: 1rem;
  }
  .preview-changes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    .change {
      min-width: 150px;
      display: flex;
      flex-direction: column;
      .text {
        color: grey;
        text-align: center;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
          margin-left: 0.2rem;
          margin-right: 0.2rem;
        }
      }
      .text-primary {
        color: $primary;
      }
      .nights-price {
        height: 3.5rem;
        background-color: $primary;
        &.old {
          background-color: grey !important;
        }
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 145px;
        color: white;
        .nights {
          font-size: 0.8rem;
        }
        .separator {
          height: 50%;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          width: 1px;
          background-color: white;
        }
        .price {
          font-size: 1.2rem;
          font-weight: bold;
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
  .main-content {
    width: 660px;
    .dates-content {
      .dates {
        flex-direction: row;
        .date {
          width: 49%;

          &:last-child {
            .title-date {
              text-align: right;
            }
            .date-selected {
              flex-direction: row-reverse;
              .calendar-icon {
                margin-left: 0.5rem;
                margin-right: 0;
              }
            }
          }
        }
        .date-calendar {
          margin-top: 1rem;
        }
      }
    }
    .option-content {
      display: flex;
      .input-group {
        margin-right: 0.5rem;
      }
    }
    .calendar-container {
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
    .preview-changes {
      justify-content: space-around;
      .change {
        .nights-price {
          width: auto;
          .night {
            font-size: 1.2rem;
          }
          .price {
            font-size: 1.5rem;
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
