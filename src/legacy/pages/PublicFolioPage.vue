<template>
  <div
    class="page-container"
    v-if="
      precheckinInfo?.pmsPropertyStreet &&
      precheckinInfo?.pmsPropertyCity &&
      precheckinInfo?.pmsPropertyState &&
      precheckinInfo?.pmsPropertyLogo &&
      precheckinInfo?.pmsPropertyImage &&
      precheckinInfo?.pmsPropertyName
    "
  >
    <PrecheckinPropertyHeader
      :headerHeight="HEADER_HEIGHT"
      isFolio
      :pmsPropertyName="precheckinInfo?.pmsPropertyName"
      :pmsPropertyCity="precheckinInfo?.pmsPropertyCity"
      :pmsPropertyState="precheckinInfo?.pmsPropertyState"
      :pmsPropertyLogo="precheckinInfo?.pmsPropertyLogo"
      :pmsPropertyImage="precheckinInfo?.pmsPropertyImage"
    />
    <div
      class="content"
      :style="{
        height: `calc(100% - ${HEADER_HEIGHT})`,
      }"
    >
      <div class="folio-main-info">
        <div class="left" v-if="isShowingReservations" @click="showReservationsForPrecheckin">
          <CustomIcon
            class="arrow-back"
            color="black"
            imagePath="/app-images/arrow_forward_ios.svg"
            width="22px"
            height="22px"
          />
        </div>
        <div class="right">
          <div class="partner-name">
            {{ precheckinInfo?.folioPartnerName }}
          </div>
          <div class="room-type-description">
            <span v-if="!isShowingReservations">
              {{ precheckinInfo?.folioRoomTypesDescription }}
            </span>
            <span v-else>
              {{ precheckinInfo?.reservations.length }} reserva{{
                (precheckinInfo?.reservations ?? []).length > 1 ? 's' : ''
              }}
              - {{ precheckinInfo?.folioReference }}
            </span>
          </div>
          <div class="folio-reference" v-if="!isShowingReservations">
            {{ precheckinInfo?.folioReference }}
          </div>
        </div>
      </div>
      <PrecheckinLinks
        v-if="!isShowingReservations"
        isFolio
        :folioNumCheckins="precheckinInfo.folioNumCheckins"
        :folioCheckinNamesCompleted="precheckinInfo.folioCheckinNamesCompleted"
        :folioPortalLink="precheckinInfo.folioPortalLink"
        :folioPendingAmount="precheckinInfo.folioPendingAmount"
        :folioPaymentLink="precheckinInfo.folioPaymentLink"
        :pmsPropertyName="precheckinInfo.pmsPropertyName"
        :pmsPropertyPhoneNumber="precheckinInfo.pmsPropertyPhoneNumber"
        :pmsPropertyStreet="precheckinInfo.pmsPropertyStreet"
        :pmsPropertyCity="precheckinInfo.pmsPropertyCity"
        :pmsPropertyState="precheckinInfo.pmsPropertyState"
        @showReservationsForPrecheckin="showReservationsForPrecheckin()"
        @showReservationsForSharing="showReservationsForSharing()"
      />
      <PrecheckinReservationCard
        v-else
        v-for="(reservation, index) in precheckinInfo?.reservations"
        :key="reservation.id"
        :index="index"
        :checkin="reservation.checkin"
        :checkout="reservation.checkout"
        :nights="reservation.nights"
        :adults="reservation.adults"
        :children="reservation.children"
        :roomTypeName="reservation.roomTypeName"
        :id="reservation.id"
        :accessToken="reservation.accessToken"
        :isSharingReservationLinks="isSharingReservationLinks"
        :checkinNamesCompleted="reservation.checkinNamesCompleted"
      />
    </div>
    <PrecheckinFooter />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import PrecheckinPropertyHeader from '@/legacy/components/precheckin/PrecheckinPropertyHeader.vue';
import PrecheckinLinks from '@/legacy/components/precheckin/PrecheckinLinks.vue';
import PrecheckinReservationCard from '@/legacy/components/precheckin/PrecheckinReservationCard.vue';
import PrecheckinFooter from '@/legacy/components/precheckin/PrecheckinFooter.vue';

import { useStore } from '@/legacy/store';

const HEADER_HEIGHT = '200px';

export default defineComponent({
  components: {
    CustomIcon,
    PrecheckinPropertyHeader,
    PrecheckinLinks,
    PrecheckinReservationCard,
    PrecheckinFooter,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const isShowingReservations = ref(false);
    const isSharingReservationLinks = ref(false);
    const precheckinInfo = computed(() => store.state.precheckin.folioPublicInfo);
    const currentPath = `${window.location.href}`;
    const showReservationsForSharing = () => {
      isShowingReservations.value = true;
      isSharingReservationLinks.value = true;
    };
    const showReservationsForPrecheckin = () => {
      isShowingReservations.value = !isShowingReservations.value;
      if (!isShowingReservations.value) {
        isSharingReservationLinks.value = false;
      }
    };
    onBeforeMount(async () => {
      if (route.params.folioId && route.params.folioToken) {
        try {
          await store.dispatch('precheckin/fetchFolioPublicInfo', {
            id: route.params.folioId,
            token: route.params.folioToken,
            globalErrors: false,
          });
        } catch (e) {
          void router.push('/not-found');
        }
      }
    });
    return {
      currentPath,
      HEADER_HEIGHT,
      isShowingReservations,
      isSharingReservationLinks,
      precheckinInfo,
      showReservationsForPrecheckin,
      showReservationsForSharing,
    };
  },
});
</script>

<style lang="scss" scoped>
.page-container {
  user-select: none;
  height: calc(var(--vh, 1vh) * 100);
  min-width: 320px;
  .content {
    overflow-y: scroll;
    padding: 25px;
    padding-bottom: 8rem;
    height: 125%;
    .folio-main-info {
      display: flex;
      align-items: center;
      justify-content: center;
      .left {
        cursor: pointer;
        min-width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #78787826;
        .arrow-back {
          rotate: 90deg;
        }
        &:hover {
          background: #cccccc;
        }
      }
      .right {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .partner-name {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          position: relative;
          .arrow-back {
            background: #78787826;
            height: 40px;
            width: 40px;
            border-radius: 50%;
          }
          .name {
            flex: 1 1 auto;
          }
        }
        .room-type-description,
        .folio-reference {
          font-size: 16px;
          text-align: center;
        }
      }
    }
  }
}
@media (min-width: 768px) {
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3rem;
    height: 100vh;
    .content {
      overflow-y: auto;
      width: 768px;
      padding-right: 21px;
      padding-right: 0;
      padding-bottom: 2rem;
    }
  }
}
</style>
