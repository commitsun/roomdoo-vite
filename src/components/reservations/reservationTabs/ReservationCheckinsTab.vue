<template>
  <div class="main-content">
    <div class="title">
      <div class="title-left">
        <CustomIcon
          :imagePath="'/app-images/users.svg'"
          :color="'primary'"
          :width="titleIconSize()"
          :height="titleIconSize()"
        />
        <span> {{ reservation?.checkinPartnerCount }} Huéspedes en la reserva </span>
      </div>
      <div class="title-right">
        <div
          v-if="isReadyToCheckout() && reservation?.stateCode !== 'done'"
          class="btn-checkin-manage"
          @click="doCheckout()"
        >
          <img src="/app-images/logout-white.svg" />
          <span> Hacer check-out </span>
        </div>
        <div
          class="btn-checkin-manage-link"
          :class="{ 'btn-checkin-manage': isCheckinTodayButton }"
          v-else
          @click="isCheckinFlowStepperOpen = true"
        >
          <img v-if="isCheckinTodayButton" src="/app-images/check-mark.svg" />
          <span>
            {{ btnCheckinManageLabel() }}
          </span>
        </div>
      </div>
    </div>
    <div class="checkins-info">
      <div class="data-reservation-row">
        <span class="reservation-title"> Número de adultos </span>
        <span class="reservation-data-adults-children">
          {{ reservation?.adults }}
          Adulto{{ reservation?.adults && reservation?.adults > 1 ? 's' : '' }}
        </span>
      </div>
      <hr />
      <div class="data-reservation-row" v-if="reservation?.children && reservation?.children > 0">
        <span class="reservation-title"> Número de niños </span>
        <span class="reservation-data-adults-children">
          {{ reservation?.children }}
          Niño{{ reservation?.children && reservation?.children > 1 ? 's' : '' }}
        </span>
      </div>
      <hr v-if="reservation?.children && reservation?.children > 0" />
      <div
        class="data-reservation-row"
        v-if="reservation?.segmentationId && reservation?.segmentationId !== 0"
      >
        <span class="reservation-title"> Segmentación </span>
        <span class="reservation-data">
          {{ segmentationName }}
        </span>
      </div>
    </div>
    <div class="checkins-data-info">
      <div class="checkins-data-info-up">
        <div class="icons" v-for="checkinPartner in allCheckinPartners" :key="checkinPartner.id">
          <CustomIcon
            :imagePath="'/app-images/icon-user-light-blue.svg'"
            :color="getIconColor(checkinPartner)"
            :width="'13px'"
            :height="'17px'"
          />
        </div>
        <span v-if="reservation?.pendingCheckinData && reservation?.pendingCheckinData > 0">
          {{ reservation?.pendingCheckinData }}
          huésped{{ reservation?.pendingCheckinData > 1 ? 'es' : '' }} pendiente{{
            reservation?.pendingCheckinData > 1 ? 's' : ''
          }}
        </span>
        <span v-else> {{ reservation?.adults }} huéspedes </span>
        <div class="three-dots-icon">
          <CustomIcon
            :imagePath="'/app-images/three-dots-white.svg'"
            :color="'#71797C'"
            :width="'22px'"
            :height="'22px'"
            @click="isCheckinMenuOpen = !isCheckinMenuOpen"
            tabindex="1"
          />
          <transition name="menu-checkins">
            <div class="checkins-menu" v-if="isCheckinMenuOpen">
              <div
                v-if="
                  allCheckinPartners.some(
                    (el) => el.checkinPartnerState !== 'dummy' && el.checkinPartnerState !== 'draft'
                  )
                "
                @click="printAllCheckins()"
                class="print-checkins-menu"
              >
                <span> Imprimir todos </span>
              </div>
              <div
                v-if="allCheckinPartners.some((el)=>el.checkinPartnerState!=='dummy'
                && el.checkinPartnerState !== 'draft')"
                @click="viewAllCheckinsPDF()"
              >
                <span>
                  Ver todos
                </span>
              </div>
              <div @click="showSegmentation()" v-if="segmentations.length > 0">
                <span>
                  {{
                    reservation?.segmentationId ? 'Modificar segmentación' : 'Añadir segmentación'
                  }}
                </span>
              </div>
              <div @click="openAdultsModal()">
                <span> Modificar nº de huéspedes </span>
              </div>
              <div
                @click="undoOnboard()"
                v-if="reservation?.stateCode === 'onboard' && checkinToday()"
              >
                <span> Desmarcar llegada </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="card-wrap">
      <CheckinCardFlow
        v-for="checkinPartner in checkinPartners.filter((cp) => cp.checkinPartnerState !== 'dummy')"
        class="checkin-card-flow"
        :key="checkinPartner.id"
        :firstname="checkinPartner.firstname"
        :lastname="checkinPartner.lastname"
        :lastname2="checkinPartner.lastname2"
        :countryName="countryName(checkinPartner.nationality)"
        :countryCode="countryCode(checkinPartner.nationality)"
        :age="checkinPartnerAge(checkinPartner.birthdate)"
        :documentTypeName="documentType(checkinPartner.documentType)"
        :documentNumber="checkinPartner.documentNumber"
        :checkinPartnerState="checkinPartner.checkinPartnerState"
        :isExistingCheckinPartnerMandatoryDataComplete="
          checkinMandatoryDataComplete(
            checkinPartner,
            checkinPartner.documentType === DOCUMENT_TYPE_DNI,
            checkinPartner.documentType === DOCUMENT_TYPE_NIE,

            checkinPartner.countryId === NATIONALITY_CODE_SPAIN
          )
        "
        :isCheckinToday="isCheckinToday(checkinPartner)"
        :isSegmentation="reservation?.segmentationId ? true : false"
        isCollapsible
        @printCheckin="printCheckin(checkinPartner)"
        @viewPDFCheckin="viewCheckinPDF(checkinPartner)"
        @doCheckin="performDoCheckin(checkinPartner)"
        @displayForm="setActiveCheckinPartnerAndDisplayForm(checkinPartner)"
        @removeCheckinPartner="setActiveCheckinPartnerAndRemove(checkinPartner)"
        isFromDrawer
      />
    </div>
  </div>
  <div class="checkin-flow-overlay" v-if="isCheckinFlowStepperOpen" />
  <Transition name="checkin-flow-transition">
    <PrivateCheckinFlow @closeCheckinFlow="closeCheckinFlow()" v-if="isCheckinFlowStepperOpen" />
  </Transition>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, ref, type Ref, markRaw } from 'vue';
import type { AxiosResponse } from 'axios';
import { useRouter } from 'vue-router';

import type { CheckinPartnerInterface } from '@/interfaces/CheckinPartnerInterface';

import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import PrivateCheckinFlow from '@/components/checkinFlow/PrivateCheckinFlow.vue';
import ReservationSegmentation from '@/components/reservations/ReservationSegmentation.vue';
import CheckinPartnerForm from '@/components/partners/PartnerForm.vue';
import CheckinCardFlow from '@/components/checkinFlow/CheckinCardFlow.vue';
import ReservationModifyAdultsAndChildren from '@/components/reservations/ReservationModifyAdultsAndChildren.vue';

import { dialogService } from '@/services/DialogService';
import { useCheckinPartner } from '@/utils/useCheckinPartner';
import { useStore } from '@/store';
export default defineComponent({
  components: {
    CustomIcon,
    PrivateCheckinFlow,
    CheckinPartnerForm,
    CheckinCardFlow,
    ReservationSegmentation,
  },
  setup() {
    const { doCheckin, saveCheckinPartner, checkinMandatoryDataComplete, printCheckin, printAllCheckins, viewCheckinPDF, viewAllCheckinsPDF} =
      useCheckinPartner();
    const store = useStore();
    const router = useRouter();
    const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find(
      (el) => el.code === 'ES'
    )?.id;

    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (el) => el.code === 'D'
    )?.id;

    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (el) => el.code === 'N'
    )?.id;

    const isCheckinFlowStepperOpen = ref(false);
    const isCheckinPartnerCardOpen = ref([] as boolean[]);
    const openCheckinsMenu = ref([] as boolean[]);
    const todayDate = ref(new Date());
    todayDate.value.setHours(0, 0, 0, 0);
    const openEditModalCheckin = ref([] as boolean[]);
    const openRemoveCheckinConfirmation = ref(false);
    const isCheckinMenuOpen = ref(false);
    const showSegmentationModal = ref(false);
    const showAdultsModal = ref(false);

    const checkinPartnerSegmentation: Ref<CheckinPartnerInterface | null> = ref(null);
    const activeCheckinPartner: Ref<CheckinPartnerInterface | null> = ref(null);
    const isFormDisplayed = ref(false);
    const isCheckinTodayButton = ref(false);

    const reservation = computed(() => store.state.reservations.currentReservation);
    const allCheckinPartners = computed(() => store.state.checkinPartners.checkinpartners);
    const segmentations = computed(() => store.state.categories.categories);

    const checkinPartners = computed(() =>
      store.state.checkinPartners.checkinpartners.filter(
        (checkinPartner) =>
          checkinPartner.checkinPartnerState !== 'dummy' &&
          checkinPartner.checkinPartnerState !== 'cancelled'
      )
    );

    const checkinPartnerToAdd = computed(() =>
      store.state.checkinPartners.checkinpartners.find(
        (checkinPartner) => checkinPartner.checkinPartnerState === 'dummy'
      )
    );

    const segmentationName = computed(
      () =>
        store.state.categories.categories.find(
          (category) => category.id === reservation.value?.segmentationId
        )?.name
    );

    const closeCheckinFlow = () => {
      isCheckinFlowStepperOpen.value = false;
    };

    const isReadyToCheckin = (checkinPartner: CheckinPartnerInterface) => {
      const today = new Date();
      const checkinDate = new Date(reservation.value?.checkin ?? '');
      const isCheckinDateToday =
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear();
      const isCheckinDateBeforeToday = checkinDate < today;
      if (
        (isCheckinDateToday || isCheckinDateBeforeToday) &&
        checkinPartner.checkinPartnerState === 'precheckin'
      ) {
        return true;
      }
      return false;
    };

    const isReadyToCheckout = () => {
      const today = new Date();
      const checkoutDate = new Date(reservation.value?.checkout ?? '');
      const isCheckoutDateToday =
        checkoutDate.getDate() === today.getDate() &&
        checkoutDate.getMonth() === today.getMonth() &&
        checkoutDate.getFullYear() === today.getFullYear();
      const isCheckoutDateAfterToday = checkoutDate < today;
      if (
        (isCheckoutDateToday || isCheckoutDateAfterToday) &&
        (store.state.reservations.currentReservation?.stateCode === 'onboard' ||
          store.state.reservations.currentReservation?.stateCode === 'departure_delayed') &&
        allCheckinPartners.value.some(
          (checkinPartner) => checkinPartner.checkinPartnerState === 'onboard'
        )
      ) {
        return true;
      }
      return false;
    };

    const checkinToday = () => {
      const today = new Date();
      const checkinDate = new Date(reservation.value?.checkin ?? '');
      const isCheckinDateToday =
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear();
      return isCheckinDateToday;
    };

    const doCheckout = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/checkoutReservation', {
          reservationId: store.state.reservations.currentReservation?.id,
          toCheckout: true,
        });
        await Promise.all([
          store.dispatch(
            'reservations/fetchReservation',
            store.state.reservations.currentReservation?.id
          ),
          store.dispatch(
            'checkinPartners/fetchCheckinPartners',
            store.state.reservations.currentReservation?.id
          ),
        ]);
        if (router.currentRoute.value.path === '/planning/') {
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
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

    const undoOnboard = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/undoOnboard', {
          reservationId: store.state.reservations.currentReservation?.id,
        });
        await Promise.all([
          store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id),
          store.dispatch(
            'reservations/fetchReservation',
            store.state.reservations.currentReservation?.id
          ),
          store.dispatch(
            'checkinPartners/fetchCheckinPartners',
            store.state.reservations.currentReservation?.id
          ),
        ]);
        if (router.currentRoute.value.path === '/planning/') {
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
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

    const setActiveCheckinPartnerAndRemove = (checkinPartner: CheckinPartnerInterface) => {
      activeCheckinPartner.value = checkinPartner;
      openRemoveCheckinConfirmation.value = true;
      dialogService.open({
        header: 'Eliminar huésped',
        content: 'Estás a punto de eliminar este huésped. ¿Estás seguro?',
        btnAccept: 'Eliminar',
        btnCancel: 'Cancelar',
        onAccept: removeCheckinPartner,
      });
    };

    const removeCheckinPartner = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('checkinPartners/deleteCheckinPartner', {
          reservationId: reservation.value?.id,
          checkinPartnerId: activeCheckinPartner.value?.id,
        });
        await Promise.all([
          store.dispatch('reservations/fetchReservation', reservation.value?.id),
          store.dispatch('checkinPartners/fetchCheckinPartners', reservation.value?.id),
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
      openRemoveCheckinConfirmation.value = false;
    };

    const setActiveCheckinPartnerAndDisplayForm = (checkinPartner: CheckinPartnerInterface) => {
      activeCheckinPartner.value = checkinPartner;
      isFormDisplayed.value = true;
      dialogService.open({
        header: `${checkinPartner.name}`,
        content: markRaw(CheckinPartnerForm),
        props: {
          checkinPartner,
        },
      });
    };

    const getIconColor = (checkinPartner: CheckinPartnerInterface) => {
      let color = 'rgba(0, 128, 0, 0.66)';
      if (
        checkinPartner.checkinPartnerState === 'dummy' ||
        checkinPartner.checkinPartnerState === 'cancel'
      ) {
        color = '#D9D9D9';
      }
      if (checkinPartner.checkinPartnerState === 'draft') {
        color = 'rgba(239, 148, 38, 0.75)';
      }
      if (checkinPartner.checkinPartnerState === 'precheckin') {
        color = 'rgba(81, 178, 221, 0.54)';
      }
      return color;
    };
    const countryName = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.name;

    const countryCode = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    const checkinPartnerAge = (partnerBirthDate: Date | null) => {
      let age = 0;

      if (partnerBirthDate) {
        const today = new Date();
        age = today.getFullYear() - partnerBirthDate.getFullYear();
        const m = today.getMonth() - partnerBirthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < partnerBirthDate.getDate())) {
          age -= 1;
        }
      }

      return age;
    };

    const documentType = (documentTypeId: number) =>
      store.state.documentType.documentType.find((el) => el.id === documentTypeId)?.documentType;

    const openAdultsModal = () => {
      showAdultsModal.value = true;
      dialogService.open({
        header: `Huéspedes ${reservation.value?.name}`,
        content: markRaw(ReservationModifyAdultsAndChildren),
        props: {
          maxCapacity: store.state.rooms.rooms.find(
            (el) => el.id === reservation.value?.preferredRoomId
          )?.capacity,
          isOpenFromGeneralTab: true,
          adults: reservation.value?.adults,
          children: reservation.value?.children,
        },
      });
    };

    const state = (checkinState: string) => {
      if (checkinState === 'precheckin') {
        return 'Llegada pendiente';
      }
      if (checkinState === 'draft') {
        return 'Check-in incompleto';
      }
      if (checkinState === 'done') {
        return 'Check-out completado';
      }
      return 'Check-in completado';
    };

    const stateColor = (checkinState: string) => {
      let color = '#EF9426';
      if (checkinState === 'onboard' || checkinState === 'done') {
        color = '#258015';
      } else if (checkinState === 'precheckin') {
        color = 'rgba(81, 178, 221, 0.54)';
      }
      return color;
    };

    const cardHeaderBackgroundColor = (checkinState: string) => {
      let color = '#FF8A001A';
      if (checkinState === 'onboard' || checkinState === 'done') {
        color = '#F5FAF5';
      } else if (checkinState === 'precheckin') {
        color = '#EDF7FC';
      }
      const style = {
        backgroundColor: color,
      };
      return style;
    };

    const titleIconSize = () => {
      if (window.innerWidth < 768) {
        return '18px';
      }
      return '20px';
    };

    const isCheckinToday = (checkinPartner: CheckinPartnerInterface) => {
      const today = new Date();
      const checkinDate = new Date(reservation.value?.checkin ?? '');
      const isCheckinDateToday =
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear();
      const isCheckinDateBeforeToday = checkinDate < today;
      if (
        (isCheckinDateToday || isCheckinDateBeforeToday) &&
        checkinPartner.checkinPartnerState !== 'onboard' &&
        checkinPartner.checkinPartnerState !== 'done'
      ) {
        return true;
      }
      return false;
    };

    const btnCheckinManageLabel = () => {
      let btnLabel = '';
      const today = new Date();
      const checkinDate = new Date(reservation.value?.checkin ?? '');
      if (
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear() &&
        checkinPartners.value.every(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState === 'draft' ||
            checkinPartner.checkinPartnerState === 'dummy'
        )
      ) {
        btnLabel = 'Iniciar check-in';
        isCheckinTodayButton.value = true;
      } else if (checkinDate > today) {
        btnLabel = 'Registrar pre check-in';
        isCheckinTodayButton.value = false;
      } else if (
        checkinPartners.value.some(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState !== 'draft' &&
            checkinPartner.checkinPartnerState !== 'dummy'
        )
      ) {
        btnLabel = 'Asistente de check-in';
        isCheckinTodayButton.value = false;
      } else {
        btnLabel = 'Ajustar huéspedes';
        isCheckinTodayButton.value = false;
      }
      return btnLabel;
    };

    const performDoCheckin = async (checkinPartner: CheckinPartnerInterface) => {
      if (!reservation.value?.segmentationId && store.state.categories.categories.length > 0) {
        checkinPartnerSegmentation.value = checkinPartner;
        showSegmentationModal.value = true;
        dialogService.open({
          header: `Segmentación ${reservation.value?.name}`,
          content: markRaw(ReservationSegmentation),
          props: {
            parentName: 'ReservationGeneralTab',
            isOpenFromGeneralTab: true,
          },
        });
      } else {
        await doCheckin(checkinPartner);
      }
      openEditModalCheckin.value.forEach(
        // eslint-disable-next-line
        (el) => {
          el = false;
        }
      );
    };

    const performSaveCheckinPartner = async (checkinPartner: CheckinPartnerInterface) => {
      await saveCheckinPartner(checkinPartner);
      openEditModalCheckin.value.forEach(
        // eslint-disable-next-line
        (el) => {
          el = false;
        }
      );
    };

    const showSegmentation = () => {
      checkinPartnerSegmentation.value = null;
      showSegmentationModal.value = true;
      dialogService.open({
        header: `Segmentación ${reservation.value?.name}`,
        content: markRaw(ReservationSegmentation),
        props: {
          parentName: 'ReservationGeneralTab',
          isOpenFromGeneralTab: true,
        },
      });
    };

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch(
          'checkinPartners/fetchCheckinPartners',
          store.state.reservations.currentReservation?.id
        );
        isCheckinPartnerCardOpen.value = checkinPartners.value.map(() => false);
        openCheckinsMenu.value = checkinPartners.value.map(() => false);
        openEditModalCheckin.value = checkinPartners.value.map(() => false);

        if (store.state.layout.isMoveToGuestsTab) {
          isCheckinFlowStepperOpen.value = true;
          void store.dispatch('layout/setMoveToGuestsTab', false);
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
      DOCUMENT_TYPE_DNI,
      DOCUMENT_TYPE_NIE,
      NATIONALITY_CODE_SPAIN,
      todayDate,
      reservation,
      segmentationName,
      checkinPartners,
      allCheckinPartners,
      checkinPartnerToAdd,
      isCheckinFlowStepperOpen,
      isCheckinPartnerCardOpen,
      openCheckinsMenu,
      openRemoveCheckinConfirmation,
      openEditModalCheckin,
      isCheckinMenuOpen,
      showSegmentationModal,
      showAdultsModal,
      segmentations,
      checkinPartnerSegmentation,
      activeCheckinPartner,
      isFormDisplayed,
      isCheckinTodayButton,
      isCheckinToday,
      setActiveCheckinPartnerAndDisplayForm,
      closeCheckinFlow,
      isReadyToCheckin,
      isReadyToCheckout,
      checkinToday,
      getIconColor,
      countryName,
      checkinPartnerAge,
      documentType,
      state,
      stateColor,
      cardHeaderBackgroundColor,
      countryCode,
      titleIconSize,
      btnCheckinManageLabel,
      doCheckout,
      undoOnboard,
      removeCheckinPartner,
      setActiveCheckinPartnerAndRemove,
      openAdultsModal,
      printAllCheckins,
      viewCheckinPDF,
      viewAllCheckinsPDF,
      performDoCheckin,
      performSaveCheckinPartner,
      showSegmentation,
      checkinMandatoryDataComplete,
      printCheckin,
    };
  },
});
</script>
<style scoped lang="scss">
.main-content {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  margin-top: 1.25rem;
  .title {
    margin-left: 15px;
    display: flex;
    justify-content: space-between;
    .title-left {
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        margin-left: 6px;
        font-weight: 600;
        line-height: 16px;
      }
    }
    .title-right {
      font-size: 0.8rem;
      margin-right: 0.8rem;

      .btn-checkin-manage-link {
        color: $call_to_action_color;
        font-weight: bold;
        display: flex;
        padding: 6px 5px 3px 10px;
        cursor: pointer;
        margin-left: auto;
        text-align: right;
      }
      .btn-checkin-manage {
        background-color: $call_to_action_color;
        color: white;
        font-weight: bold;
        display: flex;
        align-items: center;
        border-radius: 5px;
        cursor: pointer;
        padding: 6px 10px;
        img {
          width: 14px;
          height: 14px;
          margin-right: 0.5rem;
        }
      }
    }
  }
  .checkins-data-info {
    display: flex;
    font-size: 14px;
    justify-content: center;

    .checkins-data-info-up {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      background-color: #f9f9f9;
      border-radius: 30px;
      padding: 0.5rem 0 0.5rem 2rem;
      width: fit-content;
      .icons {
        margin-right: 5px;
      }
      span {
        margin-left: 5px;
        line-height: 16px;
      }
      .three-dots-icon {
        float: right;
        margin-left: 0.5rem;
        padding-right: 0.5rem;
        cursor: pointer;
        position: relative;
        .checkins-menu {
          user-select: none;
          position: absolute;
          width: 225px;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          color: black;
          font-size: 14px;
          box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
          border-radius: 10px;
          right: 30px;
          top: 0;
          z-index: 50;
          cursor: pointer;
          padding: 0.2rem 0;
          font-weight: 100;
          div {
            padding: 0.3rem 1rem;
            &:hover {
              font-weight: bold;
            }
          }
          .print-checkins-menu {
            display: none;
          }
        }
      }
    }
    .add-checkin {
      cursor: pointer;
      padding: 3px 13px;
      width: 216px;
      height: 29px;
      background-color: $primary;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin: auto;
      margin-top: 15px;
      margin-bottom: 7px;
    }
  }
  .delete-checkin-modal {
    .delete-checkin-title {
      padding: 0.5rem 1rem;
    }
    .delete-checkin-body {
      padding: 0.5rem 1rem;
    }
    .delete-checkin-buttons {
      margin: 0.5rem 0;
      .btn-cancel {
        background-color: #f0f0f0;
        color: black;
        border-radius: 5px;
        padding: 0.3rem 1rem;
        border: none;
        box-shadow: 0px 1px 5px rgb(0 0 0 / 20%);
        cursor: pointer;
      }
      .btn-delete {
        background-color: $primary;
        color: white;
        border-radius: 5px;
        font-weight: bold;
        padding: 0.3rem 1rem;
        cursor: pointer;
        border: none;
        box-shadow: 0px 1px 5px rgb(0 0 0 / 20%);
        margin: 0.5rem 0.5rem 0.5rem 1rem;
      }
    }
  }
  .checkins-info {
    margin-top: 1rem;
    margin: 1rem 0.6rem 0 0.6rem;
    .data-reservation-row {
      display: flex;
      justify-content: space-between;
      .reservation-title {
        margin-left: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .reservation-data {
        font-weight: bold;
        margin-right: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .reservation-data-adults-children {
        font-weight: bold;
        background-color: $roomdoo_lightgray5;
        margin-right: 0.5rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 0.5rem;
        border-radius: 15px;
      }
    }
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
}

.adults-modal {
  width: 100%;
  .adults-modal-header {
    height: 50px;
    margin-left: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .btn-save {
      background-color: $call_to_action_color;
      border: none;
      padding: 0.25rem 0.75rem;
      color: white;
      font-weight: bold;
      font-size: 16px;
      border-radius: 8px;
      margin-right: 1rem;
      cursor: pointer;
    }
  }
  .adults-modal-body {
    width: 100%;
    border-top: 1px solid #e1e0e0;
    display: flex;
    flex-direction: column;
    padding-bottom: 2.5rem;
    .body-title {
      color: #263941;
      font-size: 16px;
      font-weight: bold;
      margin-left: 1rem;
      margin-top: 1rem;
    }
    .body-subtitle {
      color: #263941;
      font-size: 14px;
      font-weight: 500;
      margin-left: 1rem;
    }
    .persons {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;
      .adults {
        align-self: center;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e1e0e0;
        padding-bottom: 0.5rem;
        width: 170px;
        .adults-label {
          font-size: 16px;
          font-weight: bold;
        }
        .buttons {
          display: flex;
          align-items: center;
          button {
            width: 20px;
            height: 20px;
            border-radius: 5px;
            border: none;
            background-color: $primary;
            font-size: 18px;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:not([disabled]):hover {
              background-color: #e1e0e0;
              color: $primary;
            }
          }
          .number {
            font-size: 16px;
            font-weight: bold;
            width: 40px;
            text-align: center;
          }
        }
      }
      .children {
        align-self: center;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.5rem;
        margin-top: 0.5rem;
        width: 170px;
        .children-label {
          font-size: 16px;
          font-weight: bold;
        }
        .buttons {
          display: flex;
          align-items: center;
          button {
            width: 20px;
            height: 20px;
            border-radius: 5px;
            border: none;
            background-color: $primary;
            font-size: 18px;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:not([disabled]):hover {
              background-color: #e1e0e0;
              color: $primary;
            }
          }
          .number {
            font-size: 16px;
            font-weight: bold;
            width: 40px;
            text-align: center;
          }
        }
      }
    }
  }
}

.checkin-modal {
  .footer {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .left-footer {
      margin-right: 1rem;
    }
    .right-footer {
      display: flex;
      flex-direction: row-reverse;
      .checkin-button {
        margin-right: 1rem;
      }
    }
  }
}

@media (min-width: 1024px) {
  .main-content {
    font-size: 14px;
    .title {
      margin: 0.25rem 1rem 0.6rem 1.6rem;
      .title-right {
        font-size: 1rem;
        margin-right: 1.25rem;
        .btn-checkin-manage {
          padding: 0.25rem 1rem;
          img {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
    .checkins-info {
      margin: 1rem 0 0 0;
      .data-reservation-row {
        margin: 0 1.75rem 0 1.5rem;
      }
      hr {
        width: 92% !important;
      }
      .checkins-data-info {
        .checkins-data-info-up {
          .three-dots-icon {
            .checkins-menu {
              right: 65%;
              .print-checkins-menu {
                display: flex;
              }
            }
          }
        }
      }
    }
  }
  .title-checkin-partner-modal {
    font-size: 22px;
    font-weight: 600;
    padding: 1rem 2.5rem;
    width: 100%;
    color: #212a37;
    display: flex;
    flex-direction: column;
    .modal-title-state {
      font-size: 14px;
      display: flex;
      align-items: center;
      img {
        margin-right: 0.5rem;
      }
    }
  }

  .checkin-modal {
    .body {
      width: 800px;
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
  z-index: 99;
}
.accordion-transition-enter-active,
.accordion-transition-leave-active {
  transition: all 0.1s linear;
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

.menu-checkins-enter-active,
.menu-checkins-leave-active {
  transition: all 0.2s ease-in-out;
}
.menu-checkins-enter-from,
.menu-checkins-leave-to {
  opacity: 0;
  transform: scale(1.1);
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
