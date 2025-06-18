<template>
  <div class="reservations">
    <div
      class="reservation-container"
      v-for="(reservation, index) in sortedReservations"
      :key="reservation.id"
    >
      <div class="reservation-pill-container">
        <Reservation
          v-if="currentFolio"
          :reservation="reservation"
          :folio="currentFolio"
          class="reservation-pill"
        />
      </div>
      <div class="title">
        <div class="title-left">
          <div class="icon">
            <CustomIcon
              imagePath="/app-images/users.svg"
              color="primary"
              width="18px"
              height="18px"
            />
          </div>
          <span>
            {{ reservation?.adults }} Huésped{{
              reservation?.adults && reservation?.adults > 1 ? 'es' : ''
            }}
            en la reserva
          </span>
        </div>
        <div class="title-right">
          <div
            v-if="isBtnToCheckout[index]"
            class="btn-checkin-manage"
            @click="doCheckout(reservation.id, index)"
          >
            <img src="/app-images/logout-white.svg" />
            <span> Hacer check-out </span>
          </div>
          <div
            class="btn-checkin-manage-link"
            :class="{ 'btn-checkin-manage': isCheckinTodayButton[index] }"
            v-else
            @click="openCheckinFlow(reservation.id)"
          >
            <img src="/app-images/check-mark.svg" />
            <span>
              {{ btnCheckinManageLabel(reservation, index) }}
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
            {{ segmentationName(reservation?.segmentationId) }}
          </span>
        </div>
        <div class="checkins-data-info">
          <div class="checkins-data-info-up">
            <div
              class="icons"
              v-for="checkinPartner in allCheckinPartners.filter(
                (el) => el.reservationId === reservation.id
              )"
              :key="checkinPartner.id"
            >
              <CustomIcon
                imagePath="/app-images/icon-user-light-blue.svg"
                :color="getIconColor(checkinPartner)"
                width="13px"
                height="17px"
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
                imagePath="/app-images/three-dots-white.svg"
                color="#71797C"
                width="22px"
                height="22px"
                @click="isCheckinMenuOpen[index] = !isCheckinMenuOpen[index]"
                @blur="isCheckinMenuOpen[index] = false"
                tabindex="1"
              />
              <transition name="menu-checkins">
                <div class="checkins-menu" v-if="isCheckinMenuOpen[index]">
                  <div
                    v-if="
                      allCheckinPartners
                        .filter((el) => el.reservationId === reservation.id)
                        .some(
                          (el) =>
                            el.checkinPartnerState !== 'dummy' && el.checkinPartnerState !== 'draft'
                        )
                    "
                    @click="printAllCheckins(reservation.id)"
                    class="print-checkins-menu"
                  >
                    <span> Imprimir todos </span>
                  </div>
                  <div
                    v-if="
                      allCheckinPartners
                        .filter((el) => el.reservationId === reservation.id)
                        .some(
                          (el) =>
                            el.checkinPartnerState !== 'dummy' && el.checkinPartnerState !== 'draft'
                        )
                    "
                    @click="viewAllCheckinsPDF()"
                  >
                    <span> Ver todos </span>
                  </div>
                  <div
                    @click="showSegmentation(reservation.id, index)"
                    v-if="segmentations.length > 0"
                  >
                    <span>
                      {{
                        reservation?.segmentationId
                          ? 'Modificar segmentación'
                          : 'Añadir segmentación'
                      }}
                    </span>
                  </div>
                  <div @click="openAdultsModal(reservation, index)">
                    <span> Modificar nº de huéspedes </span>
                  </div>
                  <div
                    @click="undoOnboard(reservation.id)"
                    v-if="reservation?.stateCode === 'onboard' && checkinToday(reservation)"
                  >
                    <span> Desmarcar llegada </span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
        <div
          class="card-wrap"
          v-for="(checkinPartner, indexCheckin) in allCheckinPartners.filter(
            (el) => el.reservationId === reservation.id && el.checkinPartnerState !== 'dummy'
          )"
          :key="checkinPartner.id"
        >
          <CheckinCardFlow
            class="checkin-card-flow"
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
            :isCheckinToday="isCheckinToday(checkinPartner, reservation)"
            :isSegmentation="reservation?.segmentationId ? true : false"
            isCollapsible
            @printCheckin="setCurrentReservationAndPrintCheckin(checkinPartner, reservation)"
            @viewPDFCheckin="viewCheckinPDF(checkinPartner)"
            @doCheckin="performDoCheckin(checkinPartner, index)"
            @displayForm="setActiveCheckinPartnerAndDisplayForm(checkinPartner, indexCheckin)"
            @removeCheckinPartner="setActiveCheckinPartnerAndRemove(checkinPartner, indexCheckin)"
            isFromDrawer
          />
        </div>
      </div>
      <div class="checkin-flow-overlay" v-if="isCheckinFlowStepperOpen" />
      <Transition name="checkin-flow-transition">
        <PrivateCheckinFlow
          @closeCheckinFlow="closeCheckinFlow()"
          v-if="isCheckinFlowStepperOpen"
        />
      </Transition>
    </div>
  </div>
</template>
<script lang="ts">
import { type AxiosResponse } from 'axios';
import { defineComponent, computed, onMounted, ref, type Ref, markRaw } from 'vue';
import { useRouter } from 'vue-router';

import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { type ReservationInterface } from '@/legacy/interfaces/ReservationInterface';

import PrivateCheckinFlow from '@/legacy/components/checkinFlow/PrivateCheckinFlow.vue';
import ReservationSegmentation from '@/legacy/components/reservations/ReservationSegmentation.vue';
import CheckinPartnerForm from '@/legacy/components/checkinPartners/CheckinPartnerForm.vue';
import CheckinCardFlow from '@/legacy/components/checkinFlow/CheckinCardFlow.vue';
import Reservation from '@/legacy/components/reservations/ReservationComponent.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import ReservationModifyAdultsAndChildren from '@/legacy/components/reservations/ReservationModifyAdultsAndChildren.vue';

import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';

export default defineComponent({
  props: {
    currentReservations: {
      type: Array as () => ReservationInterface[],
      required: true,
    },
  },
  components: {
    Reservation,
    CustomIcon,
    PrivateCheckinFlow,
    CheckinPartnerForm,
    CheckinCardFlow,
    ReservationSegmentation,
  },
  setup(props) {
    const {
      doCheckin,
      saveCheckinPartner,
      checkinMandatoryDataComplete,
      printCheckin,
      viewCheckinPDF,
      viewAllCheckinsPDF,
    } = useCheckinPartner();
    const router = useRouter();

    const store = useStore();
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
    const openRemoveCheckinConfirmation = ref([] as boolean[]);
    const isCheckinMenuOpen = ref([] as boolean[]);
    const showSegmentationModal = ref([] as boolean[]);
    const showAdultsModal = ref([] as boolean[]);
    const numberAdults = ref(0);
    const numberChildren = ref(0);
    const checkinPartnerSegmentation: Ref<CheckinPartnerInterface | null> = ref(null);
    const activeCheckinPartner: Ref<CheckinPartnerInterface | null> = ref(null);
    const isFormDisplayed = ref([] as boolean[]);
    const isCheckinTodayButton = ref([] as boolean[]);
    const isBtnToCheckout = ref([] as boolean[]);

    const currentFolio = computed(() => store.state.folios.currentFolio);
    const reservation = computed(() => store.state.reservations.currentReservation);
    const allCheckinPartners = computed(() => store.state.checkinPartners.folioCheckinPartners);
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

    const sortedReservations = computed(() => {
      const stateOrder: { [key: string]: number } = {
        confirm: 1,
        draft: 1,
        arrival_delayed: 2,
        onboard: 3,
        departure_delayed: 4,
        done: 5,
      };

      return props.currentReservations
        .filter((rsrvtion) => rsrvtion.stateCode !== 'cancel' && rsrvtion.isOverNightRoom)
        .sort((a, b) => {
          const dateA = new Date(a.checkin).getTime();
          const dateB = new Date(b.checkin).getTime();
          if (dateA !== dateB) {
            return dateA - dateB;
          }

          const stateA = stateOrder[a.stateCode as keyof typeof stateOrder] ?? 5;
          const stateB = stateOrder[b.stateCode as keyof typeof stateOrder] ?? 5;
          return stateA - stateB;
        });
    });

    const segmentationName = (segmentationId: number) =>
      store.state.categories.categories.find((category) => category.id === segmentationId)?.name;

    const closeCheckinFlow = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
      isCheckinFlowStepperOpen.value = false;
    };

    const isReadyToCheckout = (rsrvtion: ReservationInterface) => {
      const today = new Date();
      const checkoutDate = new Date(rsrvtion.checkout ?? '');
      const isCheckoutDateToday =
        checkoutDate.getDate() === today.getDate() &&
        checkoutDate.getMonth() === today.getMonth() &&
        checkoutDate.getFullYear() === today.getFullYear();
      const reservationCheckins = allCheckinPartners.value.filter(
        (checkinPartner) => checkinPartner.reservationId === rsrvtion.id
      );
      if (
        isCheckoutDateToday &&
        reservationCheckins.some(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState === 'onboard' ||
            checkinPartner.checkinPartnerState === 'departure_delayed'
        )
      ) {
        return true;
      }
      return false;
    };

    const checkinToday = (rsrvtion: ReservationInterface) => {
      const today = new Date();
      const checkinDate = new Date(rsrvtion.checkin ?? '');
      const isCheckinDateToday =
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear();
      return isCheckinDateToday;
    };

    const base64ToArrayBuffer = (data: string) => {
      const bString = window.atob(data);
      const bLength = bString.length;
      const bytes = new Uint8Array(bLength);
      for (let i = 0; i < bLength; i += 1) {
        const ascii = bString.charCodeAt(i);
        bytes[i] = ascii;
      }
      return bytes;
    };
    const doCheckout = async (reservationId: number, index: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/checkoutReservation', {
          reservationId,
          toCheckout: true,
        });
        await Promise.all([
          store.dispatch('reservations/fetchReservations', currentFolio.value?.id),
          store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id),
        ]);
        if (router.currentRoute.value.name === 'planning') {
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          await store.dispatch('dashboard/fetchPendingReservations', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            dateFrom: yesterday,
            dateTo: tomorrow,
          });
        }
        isBtnToCheckout.value[index] = false;
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

    const undoOnboard = async (reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/undoOnboard', { reservationId });
        await Promise.all([
          store.dispatch('folios/fetchFolio', currentFolio.value?.id),
          store.dispatch('reservations/fetchReservations', currentFolio.value?.id),
          store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id),
        ]);
        if (router.currentRoute.value.name === 'planning') {
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          await store.dispatch('dashboard/fetchPendingReservations', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            dateFrom: yesterday,
            dateTo: tomorrow,
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

    const setActiveCheckinPartnerAndRemove = (
      checkinPartner: CheckinPartnerInterface,
      index: number
    ) => {
      activeCheckinPartner.value = checkinPartner;
      openRemoveCheckinConfirmation.value[index] = true;
      dialogService.open({
        header: 'Eliminar huésped',
        content: 'Estás a punto de eliminar este huésped. ¿Estás seguro?',
        btnAccept: 'Eliminar',
        btnCancel: 'Cancelar',
        onAccept: () => removeCheckinPartner(checkinPartner.reservationId ?? 0, index),
      });
    };

    const removeCheckinPartner = async (reservationId: number, index: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('checkinPartners/deleteCheckinPartner', {
          reservationId,
          checkinPartnerId: activeCheckinPartner.value?.id,
        });
        await Promise.all([
          store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id),
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
      openRemoveCheckinConfirmation.value[index] = false;
    };

    const setActiveCheckinPartnerAndDisplayForm = async (
      checkinPartner: CheckinPartnerInterface,
      index: number
    ) => {
      if (store.state.reservations.reservations) {
        await store.dispatch(
          'reservations/setCurrentReservation',
          store.state.reservations.reservations[index]
        );
      }
      activeCheckinPartner.value = checkinPartner;
      isFormDisplayed.value[index] = true;
      dialogService.open({
        header: `${checkinPartner.name}`,
        content: markRaw(CheckinPartnerForm),
        props: {
          checkinPartner,
        },
      });
    };

    const setCurrentReservationAndPrintCheckin = async (
      checkinPartner: CheckinPartnerInterface,
      rsrvtion: ReservationInterface
    ) => {
      await store.dispatch('reservations/setCurrentReservation', rsrvtion);
      void printCheckin(checkinPartner);
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

    const openAdultsModal = (rsrvtion: ReservationInterface, index: number) => {
      numberAdults.value = rsrvtion.adults ?? 0;
      numberChildren.value = rsrvtion.children ?? 0;
      showAdultsModal.value[index] = true;
      if (store.state.reservations.reservations) {
        void store.dispatch(
          'reservations/setCurrentReservation',
          store.state.reservations.reservations[index]
        );
      }
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

    const isForbiddenMoreAdults = (reservationRoomId: number) => {
      const roomCapacity = store.state.rooms.rooms.find(
        (el) => el.id === reservationRoomId
      )?.capacity;
      if (roomCapacity && numberAdults.value >= roomCapacity) {
        return true;
      }
      return false;
    };

    const saveAdultsAndChildren = async (reservationId: number, index: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/updateReservation', {
          reservationId,
          adults: numberAdults.value,
          children: numberChildren.value,
        });
        await Promise.all([
          store.dispatch('reservations/fetchReservations', currentFolio.value?.id),
          store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id),
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
      showAdultsModal.value[index] = false;
    };

    const printAllCheckins = async (reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        const response = (await store.dispatch(
          'checkinPartners/fetchPdfAllCheckins',
          reservationId
        )) as AxiosResponse<{ binary: string }>;
        if (response.data) {
          const content = base64ToArrayBuffer(`${response.data.binary}`);
          const blob = new Blob([content], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          document.body.appendChild(iframe);
          if (iframe) {
            iframe.contentWindow?.print();
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

    const isCheckinToday = (
      checkinPartner: CheckinPartnerInterface,
      rsrvtion: ReservationInterface
    ) => {
      const today = new Date();
      const checkinDate = new Date(rsrvtion.checkin ?? '');
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

    const btnCheckinManageLabel = (rsrvtion: ReservationInterface, index: number) => {
      let btnLabel = '';
      const today = new Date();
      const checkinDate = new Date(rsrvtion.checkin ?? '');
      const reservationCheckins = allCheckinPartners.value.filter(
        (checkinPartner) => checkinPartner.reservationId === rsrvtion.id
      );
      if (
        checkinDate.getTime() <= today.getTime() &&
        reservationCheckins.every(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState === 'draft' ||
            checkinPartner.checkinPartnerState === 'dummy'
        )
      ) {
        btnLabel = 'Iniciar check-in';
        isCheckinTodayButton.value[index] = true;
      } else if (checkinDate.getTime() > today.getTime()) {
        btnLabel = 'Registrar pre check-in';
        isCheckinTodayButton.value[index] = false;
      } else if (
        reservationCheckins.some(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState !== 'draft' &&
            checkinPartner.checkinPartnerState !== 'dummy' &&
            checkinPartner.checkinPartnerState !== 'done'
        )
      ) {
        btnLabel = 'Asistente de check-in';
        isCheckinTodayButton.value[index] = false;
      }
      return btnLabel;
    };

    const openCheckinFlow = async (reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/fetchReservation', reservationId);
        await store.dispatch('checkinPartners/fetchCheckinPartners', reservationId);
        isCheckinFlowStepperOpen.value = true;
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

    const performDoCheckin = async (
      checkinPartner: CheckinPartnerInterface,
      reservationIndex: number
    ) => {
      if (store.state.reservations.reservations) {
        await store.dispatch(
          'reservations/setCurrentReservation',
          store.state.reservations.reservations[reservationIndex]
        );
      }
      if (!reservation.value?.segmentationId && store.state.categories.categories.length > 0) {
        checkinPartnerSegmentation.value = checkinPartner;
        showSegmentationModal.value[reservationIndex] = true;
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
      openEditModalCheckin.value.forEach((el) => {
        el = false;
      });
    };

    const performSaveCheckinPartner = async (checkinPartner: CheckinPartnerInterface) => {
      await saveCheckinPartner(checkinPartner);
      openEditModalCheckin.value.forEach((el) => {
        el = false;
      });
    };

    const showSegmentation = async (reservationId: number, index: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/fetchReservation', reservationId);
        checkinPartnerSegmentation.value = null;
        showSegmentationModal.value[index] = true;
        dialogService.open({
          header: `Segmentación ${reservation.value?.name}`,
          content: markRaw(ReservationSegmentation),
          props: {
            parentName: 'ReservationGeneralTab',
            isOpenFromGeneralTab: true,
          },
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
    };

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (store.state.reservations.reservations) {
          await store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolio.value?.id);

          isCheckinPartnerCardOpen.value = allCheckinPartners.value.map(() => false);
          openRemoveCheckinConfirmation.value = allCheckinPartners.value.map(() => false);
          openCheckinsMenu.value = allCheckinPartners.value.map(() => false);
          openEditModalCheckin.value = allCheckinPartners.value.map(() => false);
          isFormDisplayed.value = allCheckinPartners.value.map(() => false);
          isCheckinMenuOpen.value = props.currentReservations.map(() => false);
          showSegmentationModal.value = props.currentReservations.map(() => false);
          showAdultsModal.value = props.currentReservations.map(() => false);
          isCheckinTodayButton.value = props.currentReservations.map(() => false);
          isBtnToCheckout.value = props.currentReservations.map((el) => {
            if (isReadyToCheckout(el)) {
              return true;
            }
            return false;
          });
          numberAdults.value = reservation.value?.adults ?? 0;
          numberChildren.value = reservation.value?.children ?? 0;
          if (store.state.layout.isMoveToGuestsTab) {
            isCheckinFlowStepperOpen.value = true;
            void store.dispatch('layout/setMoveToGuestsTab', false);
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
    });

    return {
      currentFolio,
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
      numberAdults,
      numberChildren,
      segmentations,
      checkinPartnerSegmentation,
      activeCheckinPartner,
      isFormDisplayed,
      isCheckinTodayButton,
      isBtnToCheckout,
      sortedReservations,
      isCheckinToday,
      setActiveCheckinPartnerAndDisplayForm,
      setCurrentReservationAndPrintCheckin,
      closeCheckinFlow,
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
      openCheckinFlow,
      doCheckout,
      undoOnboard,
      removeCheckinPartner,
      setActiveCheckinPartnerAndRemove,
      openAdultsModal,
      saveAdultsAndChildren,
      isForbiddenMoreAdults,
      printAllCheckins,
      performDoCheckin,
      performSaveCheckinPartner,
      showSegmentation,
      checkinMandatoryDataComplete,
      printCheckin,
      viewCheckinPDF,
      viewAllCheckinsPDF,
    };
  },
});
</script>
<style scoped lang="scss">
.reservations {
  height: 100%;
  overflow-y: auto;
  .reservation-container {
    box-shadow: 0px 1px 5px 0px #0000007d;
    margin: 20px 10px;
    border-radius: 10px;
    padding-top: 1px;
    padding-bottom: 12px;
    .reservation-pill-container {
      margin: 0 12px;
    }
    .title {
      margin-left: 15px;
      display: flex;
      justify-content: space-between;
      .title-left {
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          height: 100%;
          display: flex;
          align-items: center;
        }
        span {
          margin-left: 6px;
          font-weight: 600;
          line-height: 16px;
        }
      }
      .title-right {
        margin-right: 1rem;
        .btn-checkin-manage-link {
          color: $primary;
          font-weight: bold;
          display: flex;
          padding: 6px 5px 3px 10px;
          cursor: pointer;
          margin-left: auto;
        }
        .btn-checkin-manage {
          background-color: $primary;
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
      }
    }
    .delete-checkin-modal {
      .delete-checkin-title {
        padding: 0.5rem 0;
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
    .segmentation-modal {
      .segmentation-modal-header {
        margin-left: 1rem;
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
}

@media (min-width: 1024px) {
  .reservations {
    .reservation-container {
      margin: 20px 20px;
      .checkins-info {
        margin: 1rem 0 0 0;
        .data-reservation-row {
          margin: 0 1.75rem 0 1.5rem;
        }
        hr {
          width: 92%;
        }
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
      .segmentation-modal {
        width: 100%;
        .segmentation-modal-header {
          height: 100%;
          width: 600px;
          margin-left: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .segmentation-modal-body {
          width: 1000px;
          height: 600px;
          border-top: 1px solid #e1e0e0;
        }
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
  background-color: #000000;
  opacity: 0.1;
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
