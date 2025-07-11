<template>
  <div class="price-total">
    <div class="title">
      <CustomIcon imagePath="/app-images/payments.svg" color="primary" width="22px" height="16px" />
      <span>Precio total</span>
    </div>
    <div class="prices-settings" @click="openPricesChanges()">Ajustar precios</div>
  </div>
  <div class="price-total-info">
    <div class="data-reservation-row">
      <span class="reservation-title"> Precio de {{ reservationRoomTypeClassName() }} </span>
      <span class="reservation-data">
        {{ reservation?.priceOnlyRoom?.toFixed(2).toString().replace('.', ',') }}€
      </span>
    </div>
    <hr />
    <div class="data-reservation-row discount" v-if="reservation?.discount">
      <span class="reservation-title"> Descuentos habitación </span>
      <span class="reservation-data" v-if="reservation?.discount">
        -{{ reservation?.discount?.toFixed(2).toString().replace('.', ',') || ' ' }}€
      </span>
    </div>
    <hr v-if="reservation?.discount" />
    <div class="data-reservation-row">
      <span class="reservation-title"> Precio de los servicios </span>
      <span class="reservation-data">
        {{ reservation?.priceOnlyServices?.toFixed(2).toString().replace('.', ',') || ' ' }}€
      </span>
    </div>
    <hr />
    <div class="data-reservation-row discount" v-if="reservation?.servicesDiscount">
      <span class="reservation-title"> Descuentos servicios </span>
      <span class="reservation-data" v-if="reservation?.servicesDiscount">
        -{{ reservation?.servicesDiscount?.toFixed(2).toString().replace('.', ',') || ' ' }}€
      </span>
    </div>
    <hr v-if="reservation?.servicesDiscount" />
    <div class="data-reservation-row">
      <span class="reservation-title total-text"> Importe total IVA incluido (PVP) </span>
      <span class="reservation-data total-content">
        {{ reservation?.priceTotal?.toFixed(2).toString().replace('.', ',') }}€
      </span>
    </div>
  </div>
  <div class="commission" v-if="reservation?.commissionAmount">
    <span>* Reserva comisionada</span>
    <span
      >{{ reservation.commissionPercent }}% por {{ saleChannelName() }} ({{
        reservation?.commissionAmount
      }}€)
    </span>
  </div>
  <div class="sale-info">
    <div class="data-reservation-row">
      <span class="reservation-title"> Tarifa aplicada </span>
      <span class="reservation-data">
        {{ pricelistName }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row">
      <span class="reservation-title"> Tipo de habitación vendida </span>
      <span class="reservation-data">
        {{ roomTypeName(reservation?.roomTypeId || 0) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row" v-if="cancelationRuleName(reservation?.pricelistId || 0)">
      <span class="reservation-title"> Política de cancelación </span>
      <span class="reservation-data">
        {{ cancelationRuleName(reservation?.pricelistId || 0) }}
      </span>
    </div>
  </div>
  <div class="price-detail">
    <div class="title">
      <CustomIcon
        imagePath="/app-images/receipt_long.svg"
        color="primary"
        width="18px"
        height="20px"
      />
      <span>Precios desglosados</span>
    </div>
  </div>
  <div class="card">
    <div
      class="card-title"
      @click="toggleCardExpanded()"
      :class="!showCard ? 'card-title-close' : ''"
    >
      <div class="card-title-left">
        <img
          src="/app-images/arrow-left-blue.svg"
          class="arrow-img"
          :class="!showCard ? 'arrow-img-rotate' : ''"
        />
        <span> Precio de {{ reservationRoomTypeClassName() }} </span>
        <div class="units">
          <CustomIcon
            imagePath="/app-images/icon-nights.svg"
            color="#263941"
            width="10px"
            height="10px"
            class="night-icon"
          />
          <span
            >{{ reservation?.nights }} noche{{ (reservation?.nights ?? 1) > 1 ? 's' : '' }}</span
          >
        </div>
      </div>
      <div class="card-title-right">
        <div class="amount">
          <span>{{ reservation?.priceOnlyRoom?.toFixed(2).toString().replace('.', ',') }}</span>
          <span>€</span>
        </div>
        <div class="three-dots">
          <CustomIcon
            imagePath="/app-images/three-dots-white.svg"
            color="primary"
            width="20px"
            height="20px"
            @click.stop="openBoardServiceOptions = !openBoardServiceOptions"
            @blur="openBoardServiceOptions = false"
            tabindex="1"
          />
          <transition>
            <div class="services-options" v-if="openBoardServiceOptions">
              <div @mousedown="openPricesChanges()">Editar</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <Transition name="accordion-transition">
      <div v-if="showCard">
        <div v-for="(line, index) in reservationLines" :key="line.id">
          <div class="line" v-if="index <= 3 || (showAllLines && index > 3)">
            <span class="line-date">{{ formatedDate(line.date) }}</span>
            <span class="line-price"
              >{{ line.price?.toFixed(2).toString().replace('.', ',') }}€</span
            >
            <span class="line-discount" v-if="line.discount > 0">
              -{{ line.discount?.toFixed(2).toString().replace('.', ',') }}%</span
            >
            <div v-else></div>
            <span>{{ getLinePriceTotal(line).toFixed(2).toString().replace('.', ',') }}€</span>
          </div>
          <hr
            v-if="
              index != reservationLines.length - 1 && (index <= 3 || (showAllLines && index > 3))
            "
          />
        </div>
        <div v-if="reservationLines.length > 4" class="show-more">
          <img
            src="/app-images/dropdown.svg"
            :class="showAllLines ? 'rotate-dropdown' : ''"
            @click="showAllLines = !showAllLines"
          />
          <span class="span-hover" @click="showAllLines = !showAllLines">
            <span v-if="showAllLines"> Ver {{ reservationLines.length - 4 }} menos </span>
            <span v-if="!showAllLines"> Ver {{ reservationLines.length - 4 }} más </span>
          </span>
        </div>
      </div>
    </Transition>
  </div>
  <div class="card" v-if="reservation?.numServices && reservation.numServices > 0">
    <div
      class="card-title"
      @click="toggleServicesCardExpanded()"
      :class="!showServicesCard ? 'card-title-close' : ''"
    >
      <div class="card-title-left">
        <img
          src="/app-images/arrow-left-blue.svg"
          class="arrow-img"
          :class="!showServicesCard ? 'arrow-img-rotate' : ''"
        />
        <span>Precio de servicios</span>
        <div class="units">
          <span>{{ quantityTotal() }} unidad{{ quantityTotal() > 1 ? 'es' : '' }}</span>
        </div>
      </div>
      <div class="card-title-right">
        <div class="amount">
          <span>
            {{ reservation?.priceOnlyServices?.toFixed(2).toString().replace('.', ',') }}€
          </span>
        </div>
        <div class="three-dots">
          <CustomIcon
            imagePath="/app-images/three-dots-white.svg"
            color="primary"
            width="20px"
            height="20px"
            @click.stop="openServicesOptions = !openServicesOptions"
            @blur="openServicesOptions = false"
            tabindex="1"
          />
          <transition>
            <div class="services-options" v-if="openServicesOptions">
              <div @mousedown="$emit('setTabValue', 'services')">Ver detalle</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <Transition name="accordion-transition">
      <div v-if="showServicesCard">
        <div v-if="reservation.boardServiceId" class="service-line">
          <span class="service-name">{{ boardServiceQuantity() }} · {{ boardServiceName() }}</span>
          <span>{{ boardServicePriceTotal().toFixed(2) }}€</span>
        </div>
        <hr v-if="reservation.boardServiceId" />
        <div
          v-for="(service, index) in reservationNotBoardServices"
          :key="service.id"
          class="extra-service"
        >
          <div class="service-line" v-if="index <= 2 || (showAllServices && index > 2)">
            <span class="service-name">{{ service.quantity }} · {{ service.name }}</span>
            <span>{{ service.priceTotal?.toFixed(2).toString() }}€</span>
          </div>
          <hr
            v-if="
              index != reservationNotBoardServices.length - 1 &&
              (index <= 2 || (showAllServices && index > 2))
            "
          />
        </div>
        <div v-if="reservationNotBoardServices.length > 3" class="show-more">
          <img
            src="/app-images/dropdown.svg"
            :class="showAllServices ? 'rotate-dropdown' : ''"
            @click="showAllServices = !showAllServices"
          />
          <span class="span-hover" @click="showAllServices = !showAllServices">
            <span v-if="showAllServices">
              Ver {{ reservationNotBoardServices.length - 3 }} menos
            </span>
            <span v-if="!showAllServices">
              Ver {{ reservationNotBoardServices.length - 3 }} más
            </span>
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, markRaw, onMounted, ref, watch } from 'vue';
import type { ReservationLineInterface } from '@/_legacy/interfaces/ReservationLineInterface';
import { useStore } from '@/_legacy/store';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import { dialogService } from '@/_legacy/services/DialogService';
import PricesChanges from '@/_legacy/components/reservations/ReservationPriceChanges.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  emits: ['setTabValue', 'isShowingNightsDetail'],
  setup() {
    const store = useStore();

    const changePricesModal = ref(false);
    const showCard = ref(true);
    const showAllLines = ref(false);
    const showAllServices = ref(false);
    const showServicesCard = ref(true);
    const openServicesOptions = ref(false);
    const openBoardServiceOptions = ref(false);
    const isShowingNightsDetail = ref(false);
    const pricelistName = ref('');

    const reservation = computed(() => store.state.reservations.currentReservation);
    const reservationLines = computed(() => store.state.reservationLines?.reservationLines);

    const reservationServices = computed(() => store.state.services.services);

    const reservationNotBoardServices = computed(() =>
      store.state.services.services.filter((el) => !el.isBoardService)
    );

    const roomTypeName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.name;

    const saleChannelName = () => {
      if (reservation.value?.agencyId) {
        return store.state.agencies.agencies.find((el) => el.id === reservation.value?.agencyId)
          ?.name;
      }
      return store.state.saleChannels.saleChannels.find(
        (el) => el.id === reservation.value?.saleChannelId
      )?.name;
    };

    const boardServiceQuantity = () => {
      let quantity = 0;
      reservationServices.value.forEach((el) => {
        if (el.isBoardService) {
          quantity += el.quantity || 0;
        }
      });
      return quantity;
    };

    const quantityTotal = () => {
      let quantity = 0;
      reservationServices.value.forEach((el) => {
        if (!el.isBoardService) {
          quantity += el.quantity || 0;
        }
      });
      quantity += boardServiceQuantity();
      return quantity;
    };

    const boardServiceName = () =>
      store.state.boardServices.boardServices.find(
        (el) => el.id === reservation.value?.boardServiceId
      )?.name;

    const boardServicePriceTotal = () => {
      let price = 0;
      reservationServices.value.forEach((el) => {
        if (el.isBoardService) {
          price += el.priceTotal || 0;
        }
      });
      return price;
    };

    const cancelationRuleName = (pricelistId: number) => {
      const ruleId = store.state.pricelists.pricelists.find(
        (el) => el.id === pricelistId
      )?.cancelationRuleId;

      return store.state.cancelationRules.cancelationRules.find((el) => el.id === ruleId)?.name;
    };

    const toggleCardExpanded = () => {
      showCard.value = !showCard.value;
    };

    const toggleServicesCardExpanded = () => {
      showServicesCard.value = !showServicesCard.value;
    };

    const formatedDate = (dateFormat: string | Date) => {
      const date = new Date(dateFormat);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.toLocaleString('default', { year: '2-digit' });
      let result = '';
      if (date.getDay() === 0) {
        result = 'Dom, ';
      } else if (date.getDay() === 1) {
        result = 'Lun, ';
      } else if (date.getDay() === 2) {
        result = 'Mar, ';
      } else if (date.getDay() === 3) {
        result = 'Mie, ';
      } else if (date.getDay() === 4) {
        result = 'Jue, ';
      } else if (date.getDay() === 5) {
        result = 'Vie, ';
      } else if (date.getDay() === 6) {
        result = 'Sab, ';
      }
      result += `${date.getDate()} ${month.charAt(0).toUpperCase() + month.slice(1, 3)} ${year}`;
      return result;
    };

    const getLinePriceTotal = (line: ReservationLineInterface) => {
      let result = 0;
      result = line.price * (line.discount / 100);
      return line.price - result;
    };

    const reservationRoomTypeClassName = () => {
      const roomTypeClassId = store.state.roomTypes.roomTypes.find(
        (el) => el.id === reservation.value?.roomTypeId
      )?.classId;

      const roomTypeClass = store.state.roomTypeClasses.roomTypeClasses.find(
        (el) => el.id === roomTypeClassId
      );

      return roomTypeClass?.name || '';
    };

    const openPricesChanges = () => {
      changePricesModal.value = true;
      dialogService.open({
        header: 'CAMBIO DE PRECIOS',
        content: markRaw(PricesChanges),
      });
    };

    watch(reservation, async () => {
      if (store.state.reservations.currentReservation) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await Promise.all([
            store.dispatch(
              'services/fetchServices',
              store.state.reservations.currentReservation?.id
            ),
            store.dispatch(
              'reservationLines/fetchReservationLines',
              store.state.reservations.currentReservation?.id
            ),
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
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch(
          'reservationLines/fetchReservationLines',
          store.state.reservations.currentReservation?.id
        );
        await store.dispatch(
          'services/fetchServices',
          store.state.reservations.currentReservation?.id
        );
        const pricelist = store.state.pricelists.pricelists.find(
          (el) => el.id === reservation.value?.pricelistId
        );
        if (pricelist) {
          pricelistName.value = pricelist.name;
        } else if (reservation.value?.pricelistId) {
          await store.dispatch(
            'pricelists/fetchRestrictedPricelist',
            reservation.value?.pricelistId
          );
          pricelistName.value = store.state.pricelists.restrictedPricelist?.name ?? '';
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

    return {
      reservation,
      reservationLines,
      reservationServices,
      reservationNotBoardServices,
      changePricesModal,
      isShowingNightsDetail,
      showCard,
      showAllLines,
      showAllServices,
      pricelistName,
      showServicesCard,
      openServicesOptions,
      openBoardServiceOptions,
      quantityTotal,
      boardServiceName,
      boardServiceQuantity,
      boardServicePriceTotal,
      saleChannelName,
      roomTypeName,
      cancelationRuleName,
      toggleCardExpanded,
      toggleServicesCardExpanded,
      formatedDate,
      getLinePriceTotal,
      reservationRoomTypeClassName,
      openPricesChanges,
    };
  },
});
</script>
<style scoped lang="scss">
.price-total {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .prices-settings {
    cursor: pointer;
    font-size: 13px;
    color: $call_to_action_color;
    margin-right: 23px;
  }
}
.price-total-info {
  .discount {
    margin-left: 10px;
  }
}
.commission {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-left: 27px;
  font-size: 14px;
  font-style: italic;
  color: #263941;
  :first-child {
    font-weight: 500;
  }
}
.title {
  margin-left: 15px;
  display: flex;
  align-items: center;
  font-weight: bold;
  span {
    margin-left: 9px;
    font-size: 13px;
  }
}
.data-reservation-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #263941;
  .reservation-title {
    margin-left: 23px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .reservation-data {
    margin-right: 23px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .total-content {
    background: #f7f7f7;
    border-radius: 15px;
    padding-left: 13px;
    padding-right: 13px;
    margin-right: 1.55rem !important;
  }
}
.price-total,
.price-total-info,
.commission,
.sale-info,
.price-detail {
  hr {
    border: none;
    height: 1px;
    background-color: #e1e0e0;
    width: 95%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    margin-left: 5%;
  }
}
.sale-info {
  margin: 50px 0;
}
.card-title {
  display: flex;
  background: #f0fcff;
  width: 100%;
  padding-top: 5px;
  padding-left: 13px;
  padding-bottom: 5px;
  margin-bottom: 0.5rem;
  align-items: center;
  border-radius: 10px 10px 0px 0px;
  cursor: pointer;
  .card-title-left {
    width: 70%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    span {
      font-size: 12px;
      padding-left: 10px;
      padding-right: 10px;
    }
    .arrow-img {
      width: 10px;
      height: 10px;
      transform: rotate(90deg);
      transition: transform 0.2s linear;
      user-select: none;
    }
    .arrow-img-rotate {
      width: 10px;
      height: 10px;
      transform: rotate(-90deg);
      transition: transform 0.2s linear;
      user-select: none;
    }
    .units {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eaeaea;
      border-radius: 15px;
      height: 20px;
      padding-left: 0.5rem;
      span {
        padding-left: 5px;
        padding-right: 5px;
      }
    }
  }
  .card-title-right {
    width: 30%;
    display: flex;
    justify-content: flex-end;
    font-weight: bold;
    .amount {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 10px;
      padding-right: 10px;
      height: 20px;
      background: #263941;
      border-radius: 15px;
      color: white;
      font-size: 12px;
    }
    .three-dots {
      position: relative;
      .services-options {
        user-select: none;
        position: absolute;
        width: 180px;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        color: black;
        font-size: 14px;
        box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
        border-radius: 10px;
        cursor: pointer;
        padding: 0.2rem 0;
        left: -175px;
        top: 5px;
        div {
          padding: 0.3rem 1rem;
          &:hover {
            font-weight: bold;
          }
        }
      }
    }
  }
}
.card-title-close {
  border-radius: 10px;
}
.card {
  margin: 20px 8px;
  padding-bottom: 0.5rem;
  background: rgba(250, 248, 248, 0.67);
  border-radius: 10px;
  hr {
    border: none;
    width: 100% !important;
    height: 1px !important;
    background-color: #e1e0e0 !important;
  }

  .line {
    margin-left: 1rem;
    margin-right: 0.5rem;
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 2fr;
    grid-auto-rows: auto;
    grid-gap: 1rem;
    align-items: center;
    font-size: 0.8rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    span:nth-child(1) {
      margin-left: 5px;
    }
    span:nth-child(4) {
      justify-self: end;
      margin-right: 5px;
    }
  }
  .service-line {
    display: flex;
    justify-content: space-between;
    margin-left: 1rem;
    margin-right: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
    color: #263941;
    span {
      margin-right: 5px;
    }
    .service-name {
      width: 50%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .show-more {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.75rem 0 1rem 0;
    img {
      cursor: pointer;
      width: 10px;
      height: 10px;
      transition: transform 0.8s ease;
    }
    .span-hover {
      margin-left: 0.5rem;
      cursor: pointer;
    }
    .rotate-dropdown {
      transform: rotate(180deg);
      transition: transform 0.8s ease;
    }
  }
}
.accordion-transition-enter-active,
.accordion-transition-leave-active {
  transition: all 0.2s linear;
}
.accordion-transition-enter-to,
.accordion-transition-leave-from {
  max-height: 150px;
  overflow: hidden;
}
.accordion-transition-enter-from,
.accordion-transition-leave-to {
  max-height: 0;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .title {
    margin-left: 27px;
    span {
      font-size: 14px;
    }
  }
  .price-total {
    .prices-settings {
      font-size: 14px;
      font-weight: bold;
      margin-right: 38px;
    }
  }
  .data-reservation-row {
    font-size: 14px;
    .reservation-title {
      margin-left: 38px;
    }
    .reservation-data {
      margin-right: 38px;
    }
  }

  hr {
    width: 92% !important;
  }
  .card {
    margin: 25px 15px;
    .line {
      span {
        font-size: 1rem;
      }
    }
    .service-line {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      font-size: 1rem;
    }
  }
  .card-title {
    .card-title-left {
      span {
        font-size: 14px;
      }
      .arrow-img {
        width: 14px;
        height: 14px;
        margin-top: 2px;
      }
      .arrow-img-rotate {
        width: 14px;
        height: 14px;
      }
      .units {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eaeaea;
        border-radius: 15px;
        span {
          font-size: 14px;
          padding-left: 10px;
          padding-right: 10px;
        }
      }
    }
    .card-title-right {
      .amount {
        font-size: 14px;
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }
}
</style>
