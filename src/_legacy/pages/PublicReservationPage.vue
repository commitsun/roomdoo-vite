<template>
  <div class="page-container">
    <PrecheckinPropertyHeader
      v-if="
        precheckinInfo?.pmsPropertyCity &&
        precheckinInfo?.pmsPropertyState &&
        precheckinInfo?.pmsPropertyLogo &&
        precheckinInfo?.pmsPropertyImage &&
        precheckinInfo?.pmsPropertyName
      "
      :headerHeight="HEADER_HEIGHT"
      :pmsPropertyName="precheckinInfo?.pmsPropertyName"
      :pmsPropertyCity="precheckinInfo?.pmsPropertyCity"
      :pmsPropertyState="precheckinInfo?.pmsPropertyState"
      :pmsPropertyImage="precheckinInfo?.pmsPropertyImage"
      :pmsPropertyLogo="precheckinInfo?.pmsPropertyLogo"
    />
    <div
      class="content"
      :style="{
        height: `calc(100% - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT})`,
      }"
    >
      <div class="folio-main-info">
        <div class="right">
          <div class="partner-name">
            {{ precheckinInfo?.folioPartnerName }}
          </div>
          <div class="room-type-description">
            <span>
              {{ precheckinInfo?.reservations[0].roomTypeName }}
            </span>
          </div>
          <div class="folio-reference">
            {{ precheckinInfo?.reservations[0].reservationReference }}
          </div>
        </div>
      </div>
      <PrecheckinLinks
        v-if="
          precheckinInfo?.pmsPropertyPhoneNumber &&
          precheckinInfo?.pmsPropertyCity &&
          precheckinInfo?.pmsPropertyName &&
          precheckinInfo?.pmsPropertyStreet
        "
        :reservationCheckinNamesCompleted="precheckinInfo?.reservations[0].checkinNamesCompleted"
        :reservationNumCheckins="
          precheckinInfo?.reservations[0].adults + precheckinInfo?.reservations[0].children
        "
        :folioPortalLink="precheckinInfo?.folioPortalLink"
        :folioPendingAmount="precheckinInfo?.folioPendingAmount"
        :pmsPropertyName="precheckinInfo?.pmsPropertyName"
        :pmsPropertyPhoneNumber="precheckinInfo?.pmsPropertyPhoneNumber"
        :pmsPropertyStreet="precheckinInfo?.pmsPropertyStreet"
        :pmsPropertyCity="precheckinInfo?.pmsPropertyCity"
        :pmsPropertyState="precheckinInfo?.pmsPropertyState"
        @openReservationCheckinFlow="isCheckinFlowStepperOpen = true"
      />
    </div>
    <PrecheckinFooter />
  </div>
  <Teleport to="body">
    <div class="checkin-flow-overlay" v-if="isCheckinFlowStepperOpen" />
    <Transition name="checkin-flow-transition">
      <PublicCheckinFlow
        v-if="isCheckinFlowStepperOpen"
        @closeCheckinFlow="closeCheckinFlow()"
        :reservationIndex="0"
      />
    </Transition>
  </Teleport>
</template>
<script lang="ts">
import { defineComponent, computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PrecheckinPropertyHeader from '@/_legacy/components/precheckin/PrecheckinPropertyHeader.vue';
import PrecheckinLinks from '@/_legacy/components/precheckin/PrecheckinLinks.vue';
import PublicCheckinFlow from '@/_legacy/components/checkinFlow/PublicCheckinFlow.vue';
import PrecheckinFooter from '@/_legacy/components/precheckin/PrecheckinFooter.vue';
import { useStore } from '@/_legacy/store';

const HEADER_HEIGHT = '200px';
const FOOTER_HEIGHT = '30px';
export default defineComponent({
  components: {
    PrecheckinPropertyHeader,
    PrecheckinLinks,
    PublicCheckinFlow,
    PrecheckinFooter,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const isCheckinFlowStepperOpen = ref(false);

    const precheckinInfo = computed(() => store.state.precheckin.folioPublicInfo);

    const closeCheckinFlow = () => {
      isCheckinFlowStepperOpen.value = false;
    };
    onBeforeMount(async () => {
      if (route.params.reservationId && route.params.reservationToken) {
        try {
          await store.dispatch('precheckin/fetchReservationPublicInfo', {
            id: route.params.reservationId,
            token: route.params.reservationToken,
            globalErrors: false,
          });
          await store.dispatch('documentType/fetchDocumentTypes');
          await store.dispatch('countries/fetchCountries');
        } catch (e) {
          void router.push('/404-not-found');
        }
      }
      if (route.query.wizard) {
        isCheckinFlowStepperOpen.value = true;
      }
    });
    return {
      HEADER_HEIGHT,
      FOOTER_HEIGHT,
      precheckinInfo,
      isCheckinFlowStepperOpen,
      closeCheckinFlow,
    };
  },
});
</script>

<style lang="scss" scoped>
.page-container {
  user-select: none;
  overflow-y: hidden;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 95);
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
            border: 1px solid red;
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

.checkin-flow-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

@media (min-width: 768px) {
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3rem;

    .content {
      overflow-y: auto;
      width: 768px;
      padding-right: 21px;
      padding-right: 0;
      padding-bottom: 2rem;
    }
  }
}

.checkin-flow-transition-enter-active,
.checkin-flow-transition-leave-active {
  transition: all 0.3s linear;
}
.checkin-flow-transition-enter-to,
.checkin-flow-transition-leave-from {
  transform: translateX(0);
}
.checkin-flow-transition-enter-from,
.checkin-flow-transition-leave-to {
  transform: translateX(100%);
}
</style>
