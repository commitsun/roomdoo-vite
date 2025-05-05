<template>
  <div class="new-reservations cell">
    <div class="top">
      <div class="title">Últimas reservas recibidas</div>
      <div
        v-for="folio in folios"
        :key="folio.id"
        class="folio"
        @click="openFolioDetail(folio.id || 0)"
      >
        <div class="folio-left">
          <div class="num-reservations-circles">
            <span class="num-reservations" :style="circleBorderStyle(folio)">
              {{ folio?.numReservations }}
            </span>
            <div
              v-if="(folio?.numReservations ?? 0) > 1"
              class="circle-1"
              :style="circleBorderStyle(folio)"
            />
            <div
              v-if="(folio?.numReservations ?? 0) > 2"
              :style="circleBorderStyle(folio)"
              class="circle-2"
            />
          </div>
        </div>
        <div
          class="folio-mid"
          :style="{
            paddingRight: !(
              (folio.agencyId && agencyImage(folio.agencyId)) ||
              (folio.saleChannelId && saleChannelImage(folio.saleChannelId))
            )
              ? '26px'
              : '0',
          }"
        >
          <div class="mid-top">
            <span class="folio-partner">
              {{ folio?.partnerName }}
            </span>
            <div
              class="pill"
              :class="{ today: calculateDifferenceDate(folio.firstCheckin) === 'Para hoy' }"
            >
              {{ calculateDifferenceDate(folio.firstCheckin) }}
            </div>
          </div>
          <div class="mid-bottom">
            <div class="pill state">
              <div
                class="circle"
                :style="`background-color: ${colorReservationsState(folio.state || '')}`"
              />
              <span>
                {{ folioStateText(folio) }}
              </span>
            </div>
            <div class="pill hour" v-if="folio.createDate">
              <img src="/app-images/hour.svg" />
              <span class="hour-text">
                {{ calculatePastDifferenceDate(folio.createDate) }}
              </span>
            </div>
            <div class="pill amount">
              <div
                class="circle"
                :style="`background-color: ${folioAmountColor(folio.paymentStateCode || '')}`"
              />
              <span>
                {{ getDecimals(folio.amountTotal || 0) }}
              </span>
            </div>
          </div>
        </div>
        <div class="folio-right">
          <img
            v-if="folio.agencyId && agencyImage(folio.agencyId)"
            :src="`${agencyImage(folio.agencyId)}`"
          />
          <img
            v-else-if="folio.saleChannelId && saleChannelImage(folio.saleChannelId)"
            :src="`${saleChannelImage(folio.saleChannelId || 0)}`"
          />
        </div>
      </div>
      <div class="alternative-folios-text" v-if="folios.length == 0">
        No se han recibido reservas
      </div>
    </div>
    <div class="pagination" v-if="folios.length > 0">
      <div @click="previousPage()" class="circle-icon" :class="{ disabled: currentPage === 0 }">
        <CustomIcon
          imagePath="/app-images/back-arrow-black.svg"
          color="#263941"
          width="13px"
          height="13px"
        />
      </div>
      <div class="current-page">
        <span>
          {{ currentPage * NUM_LAST_FOLIOS_VIEWED + 1 }} -
          {{ currentPage * NUM_LAST_FOLIOS_VIEWED + folios.length }} de {{ numFolios }}
        </span>
      </div>
      <div
        @click="nextPage()"
        class="circle-icon"
        :class="{ disabled: (currentPage + 1) * 7 >= numFolios }"
      >
        <CustomIcon
          imagePath="/app-images/back-arrow-black.svg"
          color="#263941"
          width="13px"
          height="13px"
          class="icon-right"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { type FolioInterface } from '@/legacy/interfaces/FolioInterface';
import { folioStateText } from '@/legacy/utils/folio';
import utilsDates from '@/legacy/utils/dates';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';

export default defineComponent({
  components: {
    CustomIcon,
  },

  setup() {
    const store = useStore();
    const NUM_LAST_FOLIOS_VIEWED = 7;

    const currentPage = ref(0);
    const folios = computed(() => store.state.dashboard.lastReceivedFolios);
    const numFolios = computed(() => store.state.dashboard.numLastReceivedFolios);
    const activeProperty = computed(() => store.state.properties.activeProperty);

    const openFolioDetail = async (folioId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
        ]);
        await store.dispatch('layout/rightDrawerDisplayed', true);
        await store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');

        if (store.state.reservations.reservations) {
          const firstFolioReservation = store.state.reservations.reservations[0];
          await store.dispatch('reservations/fetchReservation', firstFolioReservation.id);
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
    };

    const circleBorderStyle = (folio: FolioInterface) => {
      let borderColor = '#263941';
      let color = '#263941';
      if (folio.state === 'confirm') {
        borderColor = '#1E9ED9';
        color = '#1E9ED9';
      } else if (folio.state === 'cancel') {
        borderColor = '#263941';
        color = '#FF0000';
      } else if (folio.state === 'draft') {
        borderColor = '#DCA81C';
        color = '#DCA81C';
      }
      const style = {
        border: `1px solid ${borderColor}`,
        color,
      };
      return style;
    };

    const calculateDifferenceDate = (dateString: string | undefined): string => {
      if (dateString) {
        const date = new Date(dateString);
        const today = new Date();

        const differenceMilliseconds = date.getTime() - today.getTime();
        const differenceDays = Math.floor(differenceMilliseconds / (1000 * 60 * 60 * 24));

        if (differenceDays === 0) {
          return 'Para hoy';
        }

        if (differenceDays === 1) {
          return 'Para mañana';
        }

        if (differenceDays > 1 && differenceDays < 7) {
          return `Faltan ${differenceDays} días`;
        }

        if (differenceDays >= 7 && differenceDays < 14) {
          return 'Próxima semana';
        }

        if (differenceDays >= 14 && differenceDays < 31) {
          const weeks = Math.floor(differenceDays / 7);
          return `Faltan ${weeks} semanas`;
        }

        if (date.getMonth() === today.getMonth()) {
          return 'Próximo mes';
        }

        if (date > today) {
          const differenceMonths = date.getMonth() - today.getMonth();
          return `Faltan ${differenceMonths} meses`;
        }

        const differenceYears = date.getFullYear() - today.getFullYear();
        return `Faltan ${differenceYears} años`;
      }
      return '';
    };
    const calculatePastDifferenceDate = (date: Date | undefined): string => {
      if (date) {
        const today = new Date();

        if (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        ) {
          // La fecha es hoy, devuelve solo la hora
          const hours = date.getHours();
          const minutes = date.getMinutes();
          return `Hoy a las ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }

        const differenceDays: number = utilsDates.calculateDifferenceDays(date, today);

        if (differenceDays === 1) {
          const hours = date.getHours();
          const minutes = date.getMinutes();
          return `Ayer a las ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }

        if (differenceDays > 1 && differenceDays < 7) {
          return `Hace ${differenceDays} días`;
        }

        if (differenceDays >= 7 && differenceDays < 14) {
          return 'La semana pasada';
        }

        if (differenceDays >= 14 && differenceDays < 31) {
          const weeks = Math.floor(differenceDays / 7);
          return `Hace ${weeks} semanas`;
        }

        if (
          date.getMonth() === today.getMonth() - 1 &&
          date.getFullYear() === today.getFullYear()
        ) {
          return 'El mes pasado';
        }

        if (date < today && date.getFullYear() === today.getFullYear()) {
          const differenceMonths = today.getMonth() - date.getMonth();
          return `Hace ${differenceMonths} meses`;
        }

        const differenceYears = today.getFullYear() - date.getFullYear();
        return `Hace ${differenceYears} años`;
      }

      return '';
    };

    const colorReservationsState = (folioState: string) => {
      let folioStateColor = '#263941';
      if (folioState === 'confirm') {
        folioStateColor = '#1E9ED9';
      } else if (folioState === 'cancel') {
        folioStateColor = '#FF0000';
      } else if (folioState === 'draft') {
        folioStateColor = '#DCA81C';
      }
      return folioStateColor;
    };

    const folioAmountColor = (folioPaymentCode: string) => {
      let color = '#F25022';
      if (folioPaymentCode === 'paid') {
        color = '#008000';
      }
      return color;
    };

    const getDecimals = (price: number) => {
      const parts = price.toString().split('.');
      if (parts.length === 1) {
        parts[1] = '00';
      } else if (parts[1].length === 1) {
        parts[1] += '0';
      }
      return `${parts[0]},${parts[1]}€`;
    };

    const agencyImage = (agencyId: number) =>
      store.state.agencies.agencies.find((el) => el.id === agencyId)?.imageUrl;

    const saleChannelImage = (saleChannelId: number) =>
      store.state.saleChannels.saleChannels.find((el) => el.id === saleChannelId)?.iconUrl;

    const nextPage = () => {
      if ((currentPage.value + 1) * 7 < numFolios.value) {
        currentPage.value += 1;
      }
    };

    const previousPage = () => {
      if (currentPage.value > 0) {
        currentPage.value -= 1;
      }
    };

    watch(currentPage, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('dashboard/fetchLastReceivedFolios', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          offset: currentPage.value * NUM_LAST_FOLIOS_VIEWED,
          limit: NUM_LAST_FOLIOS_VIEWED,
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
    });

    watch(activeProperty, () => {
      currentPage.value = 0;
    });

    return {
      folios,
      openFolioDetail,
      circleBorderStyle,
      calculateDifferenceDate,
      calculatePastDifferenceDate,
      colorReservationsState,
      folioStateText,
      folioAmountColor,
      getDecimals,
      agencyImage,
      saleChannelImage,
      currentPage,
      numFolios,
      NUM_LAST_FOLIOS_VIEWED,
      activeProperty,
      nextPage,
      previousPage,
    };
  },
});
</script>

<style lang="scss" scoped>
.new-reservations {
  grid-area: reservations;
  padding: 13px 13px 13px 13px;
  border-radius: 20px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .top {
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .folio {
      padding: 4px 9px;
      background-color: $primary;
      border-radius: 10px;
      height: 44px;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      .folio-left {
        display: flex;
        align-items: center;
        margin-right: 10px;
        .num-reservations-circles {
          position: relative;
          height: 22px;
          width: 22px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          .num-reservations {
            border-radius: 50%;
            background-color: white;
            color: #263941;
            border: 1px solid #263941;
            height: 100%;
            width: 100%;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            z-index: 3;
            position: absolute;
            top: 0;
            right: 0;
          }
          .circle-1 {
            border-radius: 50%;
            background-color: white;
            height: 20px;
            width: 20px;
            color: black;
            position: absolute;
            right: -3px;
            z-index: 2;
            border: 1px solid #263941;
          }
          .circle-2 {
            border-radius: 50%;
            background-color: white;
            color: black;
            position: absolute;
            z-index: 1;
            height: 16px;
            width: 16px;
            right: -6px;
          }
        }
      }
      .folio-mid {
        display: flex;
        flex-direction: column;
        margin-right: 10px;
        flex: 1 1 auto;
        .mid-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 15px;
          margin-bottom: 4px;
          position: relative;
          .folio-partner {
            position: absolute;
            font-size: 15px;
            font-weight: bold;
            color: white;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 50%;
          }
          .pill {
            font-size: 12px;
            border: 1px solid white;
            color: white;
            border-radius: 30px;
            padding: 2px 7px;
            display: flex;
            height: 100%;
            align-items: center;
            font-weight: 500;
            position: absolute;
            right: 0;
            .text-pill {
              color: pink;
            }
            &.today {
              background-color: #f24e1e;
            }
          }
        }
        .mid-bottom {
          display: flex;
          justify-content: space-between;
          height: 15px;
          font-size: 12px;
          font-weight: 500;
          .pill {
            background-color: white;
            color: black;
            border-radius: 10px;
            padding: 0 0.5rem;
            display: flex;
            align-items: center;
            .circle {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              margin-right: 0.2rem;
            }
          }
          .hour {
            margin-left: 3px;
            margin-right: 3px;
            color: #6f6f6f;
            max-width: 33.3%;
            display: none;
            img {
              width: 11px;
              height: 11px;
              margin-right: 2px;
            }
            .hour-text {
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }
          }
          .amount {
            margin-left: auto;
          }
        }
      }
      .folio-right {
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          width: 26px;
          height: 26px;
          background-color: white;
          border-radius: 3px;
          padding: 2px;
        }
      }
    }
    .alternative-folios-text {
      margin-top: 2rem;
      font-size: 16px;
    }
  }
  .pagination {
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    .circle-icon {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background-color: #f1f1f1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 3px;
      margin-right: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background-color: #a3a0a0;
      }
      &.disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      .icon-right {
        rotate: 180deg;
      }
    }
    .current-page {
      width: 120px;
      text-align: center;
    }
  }
}
@media (min-width: 768px) {
  .new-reservations {
    padding: 15px 20px 0 20px !important;
    .top {
      .title {
        font-size: 18px;
      }
      .folio {
        height: 55px;
        .folio-mid {
          .mid-top {
            height: 25px;
            .folio-partner {
              font-size: 18px;
              width: 45%;
            }
            .pill {
              font-size: 13px;
              height: 17px;
            }
          }
          .mid-bottom {
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media (min-width: 1023px) {
  .new-reservations {
    .top {
      .folio {
        .folio-mid {
          .mid-top {
            .folio-partner {
              width: 58%;
            }
          }
          .mid-bottom {
            .pill {
              &.hour {
                display: flex;
              }
            }
          }
        }
      }
    }
  }
}
</style>
