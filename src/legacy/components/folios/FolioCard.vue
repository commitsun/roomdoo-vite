<template>
  <div class="folio-card">
    <div
      class="folio-header"
      :class="{ 'folio-header-closed': !isOpen }"
      :style="{
        background:
          folio.reservationType === 'out'
            ? 'repeating-linear-gradient(' +
              ' -70deg,white,white 2px,rgb(171,222,254) 2px, ' +
              ' rgb(171, 222, 254) 10px) !important'
            : folio.state === 'confirm'
            ? '#1E9ED9'
            : folio.state === 'draft'
            ? '#DCA81C'
            : '#263941',
      }"
      @click="isOpen = !isOpen"
    >
      <div class="folio-header-left">
        <CustomIcon
          imagePath="/app-images/dropdown-white.svg"
          :color="folio.reservationType === 'out' ? 'black' : 'white'"
          width="24px"
          height="24px"
          :class="isOpen ? 'dropdown-img-up' : 'dropdown-img'"
        />
        <div class="num-reservations-circles">
          <span
            class="num-reservations"
            :style="{
              border: `1px solid ${circleBorderStyle(folio)}`,
              color: `${circleBorderStyle(folio)}`,
            }"
          >
            {{ folio.reservations.length }}
          </span>
          <div
            v-if="folio.reservations.length > 1"
            class="circle-1"
            :style="{
              border: `1px solid ${circleBorderStyle(folio)}`,
              color: `${circleBorderStyle(folio)}`,
            }"
          />
          <div
            v-if="folio.reservations.length > 2"
            class="circle-2"
            :style="{
              border: `1px solid ${circleBorderStyle(folio)}`,
              color: `${circleBorderStyle(folio)}`,
            }"
          />
        </div>
      </div>
      <div class="folio-header-mid">
        <span
          class="folio-closure-reason"
          v-if="folio.reservationType === 'out' && folio.closureReasonId"
        >
          Fuera de venta: {{ getOutOfServiceTypeName(folio.closureReasonId) }}
        </span>
        <span class="folio-partner-name" v-else>
          {{ folio.partnerName }}
        </span>
        <div class="pills">
          <span class="reservation-state">
            <div
              class="circle"
              :style="`background-color: ${colorReservationsState(folio.state || '')}`"
            />
            <span :style="`color: ${colorReservationsState(folio.state || '')}`">
              {{ folioStateText(folio) }}
            </span>
          </span>
          <div
            class="reservations-class"
            v-if="
              reservationsByCategory.length === 1 &&
              reservationsByCategory[0].reservations[0].roomTypeClassId &&
              folio.reservations.length === 1 &&
              folio.reservationType !== 'out'
            "
          >
            <span>
              {{ reservationsByCategory[0].roomTypeClassName }}
            </span>
          </div>
        </div>
      </div>
      <div class="folio-header-right">
        <div
          class="folio-amount"
          v-if="folio.reservationType === 'normal'"
          :style="`border: 1.5px solid ${folioAmountColor(folio.paymentStateCode || '')}`"
        >
          <span class="amount-total"> {{ folio.amountTotal?.toFixed(2).replace('.', ',') }}€ </span>
          <span
            class="pending-amount"
            :style="`color: ${folioAmountColor(folio.paymentStateCode || '')}`"
          >
            {{ folioPendingAmount(folio.pendingAmount || 0, folio.amountTotal || 0) }}
          </span>
        </div>

        <div class="three-dots">
          <CustomIcon
            imagePath="/app-images/three-dots-white.svg"
            :color="folio.reservationType === 'out' ? 'black' : 'white'"
            width="33px"
            height="33px"
            :class="
              !isSomeItemMenu(folio) ? 'disabled' : isOpen ? 'dropdown-img-up' : 'dropdown-img'
            "
            @click.stop="
              !isOpen ? (isOpen = true) : isSomeItemMenu(folio) ? (isOpenMenu = !isOpenMenu) : null
            "
            @blur="isOpenMenu = false"
            tabindex="1"
          />
          <transition name="menu">
            <div class="folio-menu" v-if="isOpenMenu">
              <div v-if="isAllowedAddRooms(folio)" @mousedown="updateFolio(folio.id)">
                Añadir habitaciones
              </div>
              <div v-if="isAllowedBatchChanges(folio)" @mousedown="openBatchChangesDialog(folio)">
                Modificación en lote
              </div>
              <div
                v-if="isAllowedConfirmReservations(folio) && folio.id"
                @mousedown="confirmReservations(folio.id ?? 0)"
                class="option-confirm"
              >
                <span> Confirmar reservas </span>
                <span class="menu-len-reservations"> ({{ folio.reservations.length }}) </span>
              </div>
              <div
                class="option-cancel"
                v-if="isAllowedCancelReservations(folio) && folio.id"
                @mousedown="cancelReservations()"
              >
                <CustomIcon
                  :imagePath="'/app-images/icon-lock.svg'"
                  :color="'primary'"
                  :width="'12px'"
                  :height="'12px'"
                  v-if="folio.reservations.some((el) => el.isBlocked)
                  && folio.firstCheckin
                  && new Date(folio.firstCheckin).getTime() >= today().getTime()"
                  class="icon-cancel"
                />
                <CustomIcon
                  :imagePath="'/app-images/icon-alert-2.svg'"
                  :color="'red'"
                  :width="'12px'"
                  :height="'12px'"
                  v-else-if="folio.reservations.some((el) => el.isBlocked)
                  && folio.firstCheckin
                  && new Date(folio.firstCheckin).getTime() < today().getTime()"
                  class="icon-cancel"
                />
                <span class="cancel-text"> Cancelar reservas </span>
                <span class="menu-len-reservations"> ({{ folio.reservations.length }}) </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <transition name="accordion-transition">
      <div class="folio-body" v-if="isOpen">
        <div class="body-info">
          <div class="body-info-left">
            <div class="folio-info" v-if="folio.reservationType !== 'out'">
              <img src="/app-images/icon-folio.svg" />
              <div>
                <span>
                  {{ folio.name }}
                </span>
                <span class="partner-name">
                  {{ folio.partnerName }}
                </span>
              </div>
            </div>
          </div>
          <div class="body-info-right">
            <div class="sale-info">
              <div class="pricelist">
                {{ pricelistName }}
              </div>
              <div>
                <span v-if="folio.agencyId">
                  Vendida por
                  <span class="text-bold">
                    {{ getAgencyName(folio.agencyId) }}
                  </span>
                </span>
                <span v-else>
                  Vendida por
                  <span class="text-bold">
                    {{ saleChannelName(folio.saleChannelId || 0) }}
                  </span>
                </span>
              </div>
            </div>
            <img
              v-if="folio.agencyId && agencyImage(folio.agencyId)"
              :src="agencyImage(folio.agencyId)"
            />
            <img
              v-else-if="folio.saleChannelId && saleChannelImage(folio.saleChannelId)"
              :src="saleChannelImage(folio.saleChannelId || 0)"
            />
          </div>
        </div>
        <div class="body-reservations">
          <div v-for="roomTypeClass in reservationsByCategory" :key="roomTypeClass.roomTypeClassId">
            <div class="separator" v-if="folio.reservations.length > 1">
              <div class="hr"></div>
              <div class="number-reservations">
                <img
                  :src="classIcon(roomTypeClass.roomTypeClassId)"
                  style="height: 15px; width: 15px"
                />
                {{ roomTypeClass.reservations.length }} {{ roomTypeClass.roomTypeClassName }}
              </div>
              <div class="hr"></div>
            </div>

            <div
              v-for="(reservation, indexReservation) in roomTypeClass.reservations.sort(
                (a: ReservationInterface, b: ReservationInterface) => {
                  if (a.folioSequence && b.folioSequence && a.folioSequence < b.folioSequence)
                    return -1;
                  if (a.folioSequence && b.folioSequence && a.folioSequence > b.folioSequence)
                    return 1;
                  else return 0;
                },
              )"
              :key="reservation.id"
            >
              <Reservation
                :reservation="reservation"
                :folio="folio"
                class="reservation-pill"
                @click="setCurrentReservation(folio.id || 0, reservation.id)"
                v-if="indexReservation <= 4 || (showAll && indexReservation > 4)"
              />
            </div>

            <div v-if="roomTypeClass.reservations.length > 5" class="show-more">
              <img
                src="/app-images/dropdown.svg"
                :class="showAll ? 'rotate-dropdown' : ''"
                @click="showAll = !showAll"
              />
              <span class="span-hover" @click="showAll = !showAll">
                <span v-if="roomTypeClass.reservations && showAll">
                  Ver {{ roomTypeClass.reservations.length - 5 }}
                  {{ roomTypeClass.roomTypeClassName }} menos
                </span>
                <span v-if="roomTypeClass.reservations && !showAll">
                  Ver {{ roomTypeClass.reservations.length - 5 }}
                  {{ roomTypeClass.roomTypeClassName }} más
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="body-actions">
          <div
            class="view-reservation-btn"
            @click="
              moveToFirstReservation(
                folio.reservations.find((el: ReservationInterface) => el.stateCode !== 'cancel') ??
                  null
              )
            "
            v-if="
              folio.reservations.filter(
                (el: ReservationInterface) => el.stateCode !== 'cancel' && !el.isReselling,
              ).length > 0 && !anyCheckinToday(folio.reservations)
            "
          >
            <img src="/app-images/icon-eye.svg" class="icon-eye" />
            <span> Ver reserva en el planning </span>
          </div>
          <div
            class="open-checkin-btn"
            v-if="
              folio.reservations.filter(
                (el: ReservationInterface) => el.stateCode !== 'cancel' && !el.isReselling,
              ).length > 0 && anyCheckinToday(folio.reservations)
            "
            @click="doCheckinAction(folio)"
          >
            <img src="/app-images/check-mark.svg" class="icon-eye" />
            <span> Iniciar check-in </span>
          </div>
          <div class="show-folio-detail" @click="openFolioDetail(folio.id || 0)">
            <span>Ver más</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onBeforeMount, markRaw, computed } from 'vue';
import { type FolioInterface } from '@/legacy/interfaces/FolioInterface';
import { type ReservationInterface } from '@/legacy/interfaces/ReservationInterface';
import type { BatchChangesInterface } from '@/legacy/interfaces/BatchChangesInterface';
import FolioBatchChanges from '@/legacy/components/folios//FolioBatchChanges.vue';
import { usePlanning } from '@/legacy/utils/usePlanning';
import Reservation from '@/legacy/components/reservations/ReservationComponent.vue';
import FolioOrReservationCancelBlocked from '@/legacy/components/alerts/FolioOrReservationCancelBlocked.vue';
import { useRouter } from 'vue-router';

import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import {
  folioStateText,
  isAllowedAddRooms,
  isAllowedBatchChanges,
  isAllowedConfirmReservations,
  isAllowedCancelReservations,
} from '@/legacy/utils/folio';

import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';
import type { ReservationsByCategoryInterface } from '@/legacy/interfaces/ReservationsByCategoryInterface';

export default defineComponent({
  props: {
    folio: {
      type: Object as () => FolioInterface,
      required: true,
    },
  },
  components: {
    CustomIcon,
    Reservation,
  },
  emits: ['moveToFirstReservation'],
  setup(props, context) {
    const store = useStore();
    const router = useRouter();
    const { refreshPlanning } = usePlanning();

    const isOpen = ref(true);
    const isOpenMenu = ref(false);
    const isBatchChangesDialog = ref(false);
    const agencyName = ref('');

    const pricelistName = ref('');
    const reservationsMappedForBatchChanges = ref([] as BatchChangesInterface[]);
    const showAll = ref(false);

    const today = (): Date => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    };

    const circleBorderStyle = (folio: FolioInterface) => {
      let color = '#263941';
      if (folio.reservationType === 'out') {
        color = 'black';
      } else if (folio.state === 'confirm') {
        color = '#1E9ED9';
      } else if (folio.state === 'cancel') {
        color = '#263941';
      } else if (folio.state === 'draft') {
        color = '#DCA81C';
      }
      return color;
    };
    const getOutOfServiceTypeName = (closureReasonId: number) => {
      let result = '';
      result =
        store.state.roomClosureReasons.roomClosureReasons.find((el) => el.id === closureReasonId)
          ?.name ?? '';
      return result;
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

    const folioPendingAmount = (folioPendingToAmount: number, folioAmountTotal: number) => {
      let pendingAmount = 'pagado';
      if (folioPendingToAmount && folioAmountTotal) {
        let amount = folioPendingToAmount;
        if (folioPendingToAmount < 0) {
          amount *= -1;
        }
        const numAmount = `${amount.toFixed(2).toString().replace('.', ',')}€`;
        if (folioPendingToAmount === folioAmountTotal) {
          pendingAmount = 'pendiente';
        } else if (folioPendingToAmount > 0 && folioPendingToAmount < folioAmountTotal) {
          pendingAmount = `${numAmount} pendiente`;
          if (window.screen.width < 1024) {
            pendingAmount = `${numAmount} pte.`;
          }
        } else if (folioPendingToAmount < 0) {
          pendingAmount = `${numAmount} sobrepago`;
          if (window.screen.width < 1024) {
            pendingAmount = `${numAmount} spago.`;
          }
        }
      }
      return pendingAmount;
    };

    const isSomeItemMenu = (folio: FolioInterface) => {
      let result = false;
      if (
        isAllowedAddRooms(folio) ||
        isAllowedBatchChanges(folio) ||
        isAllowedConfirmReservations(folio) ||
        isAllowedCancelReservations(folio)
      ) {
        result = true;
      }
      return result;
    };
    const updateFolio = async (folioId: number | undefined) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
        ]);
        void store.dispatch('layout/changeRightDrawerContent', 'NewFolioStep1');
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

    const buildReservationMappedForBatchChanges = () => {
      reservationsMappedForBatchChanges.value = [];
      store.state.reservations.reservations?.forEach((el) => {
        if (el.adults) {
          reservationsMappedForBatchChanges.value.push({
            id: el.id,
            pricelistId: el.pricelistId ?? 0,
            checkin: el.checkin as Date,
            checkout: el.checkout as Date,
            roomTypeId: el.roomTypeId,
            roomId: el.preferredRoomId ?? -1,
            adults: el.adults,
            children: el.children ?? 0,
            boardServiceId: el.boardServiceId ?? 0,
            reservationLines: store.state.reservationLines.reservationLines
              .filter((rl) => rl.reservationId === el.id)
              .map((rl) => ({
                date: rl.date,
                price: rl.price,
                discount: rl.discount,
                roomId: rl.roomId,
                pmsPropertyId: rl.pmsPropertyId,
                reservationId: rl.reservationId,
              })),
            extraServices: store.state.services.folioServices
              .filter((e) => e.reservationId === el.id)
              .map((e) => ({
                productId: e.productId,
                serviceId: e.id,
                isBoardService: e.isBoardService,
                name: e.name ?? '',
                fromBatchChanges: false,
                boardServiceLineId: e.boardServiceLineId,
                items: e.serviceLines.map((l) => ({
                  priceUnit: l.priceUnit,
                  date: l.date as Date,
                  quantity: l.quantity,
                  discount: l.discount,
                  discountPrice: l.discountPrice,
                  id: l.id,
                })),
                perPerson:
                  store.state.products.products.find((p) => p.id === e.productId)?.perPerson ??
                  false,
                perday:
                  store.state.products.products.find((p) => p.id === e.productId)?.perDay ?? false,
              })),
            isSplitted: el.isSplitted,
            selected: true,
            stateCode: el.stateCode ?? '',
          });
        }
      });
    };

    const openBatchChangesDialog = async (folio: FolioInterface) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/fetchReservations', folio.id);
        await store.dispatch('reservationLines/fetchCurrentFolioReservationLines');

        await store.dispatch(
          'services/fetchFolioServices',
          store.state.reservations.reservations?.map((el) => el.id)
        );
        buildReservationMappedForBatchChanges();

        dialogService.open({
          header: 'CAMBIOS EN LOTE',
          content: markRaw(FolioBatchChanges),
          props: {
            folio: folio,
            folioName: props.folio.name,
            fromBookingEngine: false,
            reservations: reservationsMappedForBatchChanges,
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

    const confirmReservations = async (folioId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('folios/confirmFolioReservations', {
          folioId,
          confirmReservations: true,
        });
        const payload = {
          propertyId: store.state.properties.activeProperty?.id,
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          limit: store.state.folios.folios.length,
        };
        await store.dispatch('folios/fetchFolios', payload);
        isOpenMenu.value = false;
        isOpen.value = true;
        await refreshPlanning();
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

    const getAgencyName = (agencyId: number) =>
      store.state.agencies.agencies.find((el) => el.id === agencyId)?.name;

    const doCancelReservations = async() => {
      void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('folios/cancelFolioReservations', {
            folioId: props.folio.id,
            cancelReservations: true,
          });
          const payload = {
            propertyId: store.state.properties.activeProperty?.id,
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            limit: store.state.folios.folios.length,
          };
          await store.dispatch('folios/fetchFolios', payload);
          isOpenMenu.value = false;
          isOpen.value = true;
          if (router.currentRoute.value.name === 'planning') {
            await refreshPlanning();
          }
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('reservations/setCurrentReservations', null);
          void store.dispatch('folios/setCurrentFolio', null);
          void store.dispatch('layout/showSpinner', false);
        }
      }


    const cancelReservations = async () => {
      await store.dispatch('folios/fetchFolio', props.folio.id);
      agencyName.value = getAgencyName(store.state.folios.currentFolio?.agencyId ?? 0) ?? '';
      await store.dispatch('reservations/fetchReservations', props.folio.id);

      if (props.folio.reservations.some((el) => el.isBlocked)) {
        let titleDialog = '';
        const agencyDisplayName = store.state.agencies.agencies.find(
          (el) => el.id === props.folio.agencyId
        )?.name;
        if (
          props.folio.firstCheckin
          && new Date(props.folio.firstCheckin).getTime() >= today().getTime()
        ) {
          const moreThanOneReservation = props.folio.reservations.length > 1;
          if (moreThanOneReservation) {
            titleDialog = 'Reservas bloqueadas';
          } else {
            titleDialog = 'Reserva bloqueada';
          }
          if (agencyDisplayName) {
            titleDialog += ` por ${agencyDisplayName}`;
          }
          dialogService.open({
            iconHeader: '/app-images/icon-lock.svg',
            header: titleDialog,
            content: markRaw(FolioOrReservationCancelBlocked),
            props: {
              agencyName: agencyDisplayName,
              isFolio: true,
              moreThanOneReservation: moreThanOneReservation,
            },
          });
        } else {
          titleDialog = '¿Quieres cancelar esta reserva como No Show (no presentado) en Roomdoo?';
          dialogService.open({
            iconHeader: '/app-images/icon-alert-2.svg',
            iconHeaderColor: 'red',
            header: titleDialog,
            content: agencyDisplayName ? `Esta acción no notifica ni afecta a ${agencyDisplayName}, solo se aplicará en Roomdoo.<br>Si procede penalización o gestión de comisiones, debes gestionarlo también desde la extranet de la OTA.<br><br>Accede al panel de ${agencyDisplayName} para aplicar cambios ahí.` : '',
            props: {
              agencyName: agencyDisplayName,
            },
            onAccept: () => {
              doCancelReservations();
            },
            btnAccept: 'Marcar No show',
            btnCancel: 'Cancelar',
          });
        }
      } else {
        doCancelReservations();
      };
    };

    const agencyImage = (agencyId: number) =>
      store.state.agencies.agencies.find((el) => el.id === agencyId)?.imageUrl;

    const saleChannelImage = (saleChannelId: number) =>
      store.state.saleChannels.saleChannels.find((el) => el.id === saleChannelId)?.iconUrl;

    const saleChannelName = (saleChannelId: number) =>
      store.state.saleChannels.saleChannels.find((el) => el.id === saleChannelId)?.name;

    const classIcon = (classId: number) =>
      store.state.roomTypeClasses.roomTypeClasses.find((el) => el.id === classId)?.imageUrl ?? '';

    const setCurrentReservation = async (folioId: number, reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
          store.dispatch('reservations/fetchReservation', reservationId),
          store.dispatch('reservationLines/fetchReservationLines', reservationId),
        ]);
        void store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
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

    const openFolioDetail = async (folioId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
        ]);
        void store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
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

    const anyCheckinToday = (reservations: ReservationInterface[]) => {
      let result = false;
      reservations.forEach((reservation) => {
        if (
          reservation.checkin &&
          new Date(reservation.checkin).getTime() <= new Date().getTime() &&
          (reservation.stateCode === 'confirm' ||
            reservation.stateCode === 'draft' ||
            reservation.stateCode === 'arrival_delayed')
        ) {
          result = true;
        }
      });
      return result;
    };

    const doCheckinAction = async (folio: FolioInterface) => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('reservations/fetchReservations', folio.id);
      try {
        if (folio.reservations.length === 1) {
          await store.dispatch('folios/setCurrentFolio', folio);
          await store.dispatch('reservations/setCurrentReservation', folio.reservations[0]);
          await store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
          void store.dispatch('layout/setMoveToGuestsTab', true);
        } else if (folio.reservations.length > 1) {
          await store.dispatch('folios/setCurrentFolio', folio);
          await store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
          void store.dispatch('layout/setMoveToGuestsTab', true);
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

    const moveToFirstReservation = (reservation: ReservationInterface | null) => {
      if (!reservation) {
        return;
      }
      context.emit('moveToFirstReservation', reservation);
    };

    const reservationsByCategory = computed(() => {
      const result: ReservationsByCategoryInterface[] = [];
      store.state.roomTypeClasses.roomTypeClasses.forEach((roomTypeClass) => {
        const reservations = props.folio.reservations
          .filter((reservation) => reservation.roomTypeClassId === roomTypeClass.id)
          .sort((a, b) => {
            if (a.folioSequence && b.folioSequence && a.folioSequence < b.folioSequence) return -1;
            if (a.folioSequence && b.folioSequence && a.folioSequence > b.folioSequence) return 1;
            return 0;
          });
        if (reservations && reservations.length > 0) {
          result.push({
            roomTypeClassId: roomTypeClass.id,
            roomTypeClassName: roomTypeClass.name,
            reservations,
          });
        }
      });
      return result.sort((a, b) => a.roomTypeClassId - b.roomTypeClassId);
    });

    onBeforeMount(async () => {
      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === props.folio.pricelistId
      );
      if (pricelist) {
        pricelistName.value = pricelist.name;
      } else if (props.folio.pricelistId) {
        await store.dispatch('pricelists/fetchRestrictedPricelist', props.folio.pricelistId);
        pricelistName.value = store.state.pricelists.restrictedPricelist?.name ?? '';
      }
    });

    return {
      isOpen,
      showAll,
      isOpenMenu,
      isBatchChangesDialog,
      reservationsMappedForBatchChanges,
      agencyName,
      pricelistName,
      reservationsByCategory,
      today,
      moveToFirstReservation,
      doCheckinAction,
      anyCheckinToday,
      openFolioDetail,
      setCurrentReservation,
      classIcon,
      saleChannelName,
      saleChannelImage,
      getAgencyName,
      cancelReservations,
      confirmReservations,
      folioPendingAmount,
      folioAmountColor,
      circleBorderStyle,
      getOutOfServiceTypeName,
      colorReservationsState,
      folioStateText,
      isSomeItemMenu,
      isAllowedAddRooms,
      isAllowedBatchChanges,
      isAllowedConfirmReservations,
      isAllowedCancelReservations,
      updateFolio,
      openBatchChangesDialog,
      agencyImage,
    };
  },
});
</script>

<style lang="scss" scoped>
.folio-card {
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  border-radius: 10px;
  .folio-header {
    user-select: none;
    display: flex;
    color: white;
    height: 54px;
    border-radius: 10px 10px 0px 0px;
    cursor: pointer;
    .folio-header-left {
      display: flex;
      align-items: center;
      padding-left: 4px;
      .dropdown-img {
        transition: transform 0.2s linear;
      }
      .dropdown-img-up {
        transform: rotate(-180deg);
        transition: transform 0.2s linear;
      }
      .num-reservations-circles {
        position: relative;
        height: 27px;
        width: 27px;
        display: flex;
        align-items: center;
        justify-content: center;
        .num-reservations {
          border-radius: 50%;
          background-color: white;
          color: #263941;
          height: 100%;
          width: 100%;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          user-select: none;
          z-index: 3;
          position: absolute;
          top: 0;
          left: 0;
        }
        .circle-1 {
          border-radius: 50%;
          background-color: white;
          height: 25px;
          width: 25px;
          position: absolute;
          right: -4px;
          z-index: 2;
        }
        .circle-2 {
          border-radius: 50%;
          background-color: white;
          position: absolute;
          z-index: 1;
          height: 21px;
          width: 21px;
          right: -8px;
        }
      }
    }
    .folio-header-mid {
      padding-left: 10px;
      padding-top: 5px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      .folio-partner-name {
        font-weight: bold;
        font-size: 12px;
      }
      .folio-closure-reason {
        font-weight: bold;
        font-size: 12px;
        color: black;
        background-color: rgba(255, 255, 255, 0.8);
        padding: 0 10px;
      }
      .pills {
        display: flex;
        font-size: 11px;
        font-weight: bold;
        .reservation-state {
          background-color: white;
          color: #263941;
          border-radius: 10px;
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          user-select: none;
          .circle {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 0.3rem;
          }
        }
        .reservations-class {
          background-color: white;
          color: #263941;
          border-radius: 10px;
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          margin-left: 6px;

          img {
            height: 12.8px;
            width: 14.17px;
            margin-right: 5px;
          }
        }
      }
    }
    .folio-header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1 1 auto;

      .folio-amount {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: white;
        border-radius: 50px;
        color: black;
        padding: 0.2rem 1rem;
        line-height: 1.2;
        min-width: 24%;
        .amount-total {
          font-size: 14px;
          font-weight: bold;
        }
        .pending-amount {
          font-size: 12px;
          font-weight: bold;
          color: #f25022;
        }
        .amount {
          font-size: 12px;
          font-weight: bold;
          color: #008000;
        }
      }
      .three-dots {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          height: 33px;
          width: 33px;
        }
        .folio-menu {
          user-select: none;
          position: absolute;
          width: 220px;
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
          top: -10px;
          div {
            padding: 0.3rem 0 0.3rem 1rem;
            &:hover {
              font-weight: bold;
            }
          }
          .option-cancel {
            display: flex;
            align-items: center;
            color: #f21e1e;
            .icon-cancel {
              margin-bottom: 1px;
            }
            .cancel-text {
              margin-left: 0.3rem;
            }
            .menu-len-reservations {
              margin-left: 0.2rem;
              font-variant-ligatures: none;
            }
          }
          .option-confirm {
            display: flex;
            align-items: center;
            color: $primary;
            .menu-len-reservations {
              margin-left: 0.2rem;
              font-variant-ligatures: none;
            }
          }
        }
      }
    }
  }
  .folio-header-closed {
    border-radius: 10px;
    transition: border-radius 0.6s;
  }
  .folio-body {
    margin-top: 20px;
    margin-bottom: 20px;
    .body-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 17px;
      padding: 0 18px;
      .body-info-left {
        display: flex;
        flex-direction: column;
        .folio-info {
          display: flex;
          align-items: center;
          img {
            height: 17px;
            width: 15px;
          }
          div {
            line-height: 20px;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            margin-left: 12px;
            .partner-name {
              font-weight: bold;
            }
          }
        }
      }
      .body-info-right {
        display: flex;
        align-items: center;
        .sale-info {
          margin-right: 0.6rem;
          display: flex;
          flex-direction: column;
          text-align: right;
          font-size: 1rem;
          .text-bold {
            font-weight: bold;
          }
        }
        img {
          width: 30px;
          height: 30px;
        }
      }
    }
    .body-reservations {
      margin-left: 15px;
      margin-right: 15px;
      div {
        .separator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          .hr {
            height: 1.5px;
            flex: 1 1 auto;
            background-color: #263941;
          }
          .number-reservations {
            background-color: #263941;
            border-radius: 10px;
            padding: 0px 10px;
            display: flex;
            align-items: center;
            height: 20px;
            color: white;
            img {
              margin-right: 5px;
            }
          }
        }
      }
      .reservation-pill {
        cursor: pointer;
      }
      .show-more {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30px;
        img {
          height: 12px;
          width: 12px;
          margin-right: 5px;
          margin-top: 2px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .rotate-dropdown {
          transform: rotate(180deg);
          transition: transform 0.2s ease;
        }
        .span-hover {
          cursor: pointer;
          span {
            font-size: 14px;
          }
        }
      }
    }
    .body-actions {
      margin-top: 26px;
      margin-left: 15px;
      margin-right: 18px;
      display: flex;
      justify-content: space-between;
      .view-reservation-btn {
        display: none;
        align-items: center;
        justify-content: center;
        background-color: $roomdoo_lightgray3;
        padding: 3px 13px;
        border-radius: 5px;
        cursor: pointer;
        img {
          margin-right: 0.5rem;
        }
      }

      .open-checkin-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $primary;
        padding: 3px 13px;
        border-radius: 5px;
        cursor: pointer;
        color: white;
        img {
          margin-right: 0.5rem;
        }
      }

      .show-folio-detail {
        cursor: pointer;
        padding: 3px 13px;
        width: 81px;
        height: 31px;
        background-color: $primary;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-left: auto;
      }
    }
  }
}

@media (min-width: 1024px) {
  .folio-card {
    .folio-header {
      .folio-header-mid {
        .folio-partner-name,
        .folio-closure-reason {
          font-size: 16px;
        }
        .pills {
          font-size: 12px;
        }
      }
    }
    .folio-body {
      .body-info {
        .body-info-left {
          .folio-info {
            img {
              height: 20px;
              width: 18px;
            }
            div {
              font-size: 16px;
            }
          }
        }
        .body-info-right {
          font-size: 16px;
          line-height: 20px;
        }
      }
      .body-actions {
        .view-reservation-btn {
          display: flex;
        }
      }
      .body-reservations {
        .show-more {
          .span-hover {
            span {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}
</style>
