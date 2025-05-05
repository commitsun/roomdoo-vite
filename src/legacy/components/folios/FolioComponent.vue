<template>
  <div class="folio-detail">
    <div
      class="folio-header"
      :class="{
        'bg-out': currentFolio?.reservationType === 'out',
        'bg-confirm': currentFolio?.state === 'confirm',
        'bg-draft': currentFolio?.state === 'draft',
      }"
    >
      <div class="first-row">
        <img
          class="arrow-left-img"
          :src="
            currentFolio?.state === 'cancel' || currentFolio?.state === 'done'
              ? '/app-images/arrow-left-blue.svg'
              : '/app-images/arrow-left-black.svg'
          "
          @click="backToFolioList"
        />
        <div class="num-reservations-circles">
          <span class="num-reservations" :style="circleBorderStyle()">
            {{ currentReservations?.length }}
          </span>
          <div
            v-if="currentReservations && currentReservations?.length > 1"
            class="circle-1"
            :style="circleBorderStyle()"
          />
          <div
            v-if="currentReservations && currentReservations?.length > 2"
            class="circle-2"
            :style="circleBorderStyle()"
          />
        </div>
        <span class="parent-name">
          {{ currentFolio?.partnerName }}
        </span>
        <div class="three-dots-menu-mobile">
          <img
            src="/app-images/three-dots-white.svg"
            @click="isOpenMenu = !isOpenMenu"
            @blur="isOpenMenu = false"
            tabindex="1"
          />
          <transition name="menu">
            <div
              class="folio-menu"
              :style="currentFolio?.state === 'cancel' ? 'top: -20px' : 'top: -37px'"
              v-if="isOpenMenu && currentFolio && currentFolio.id && currentReservations"
            >
              <div
                v-if="currentFolio?.state != 'done' && currentFolio?.state != 'cancel'"
                @click="updateFolio()"
              >
                Añadir habitaciones
              </div>
              <div
                v-if="
                  currentFolio?.state != 'done' &&
                  currentFolio?.state != 'cancel' &&
                  !(
                    currentReservations?.filter((el) => el.isSplitted || el.stateCode === 'cancel')
                      .length === currentReservations?.length
                  )
                "
                @click="openBatchChangesDialog(currentFolio?.id)"
              >
                Modificación en lote
              </div>
              <div
                v-if="
                  currentReservations?.some(
                    (el) => el.stateCode === 'draft' || el.stateCode === 'cancel'
                  )
                "
                @click="confirmReservations()"
                class="option-confirm"
              >
                <span> Confirmar Reservas </span>
                <span class="menu-len-reservations"> ({{ currentReservations?.length }}) </span>
              </div>
              <div
                class="option-cancel"
                v-if="
                  currentReservations &&
                  currentReservations?.some(
                    (el) =>
                      el.stateCode === 'draft' ||
                      el.stateCode === 'confirm' ||
                      el.stateCode === 'arrival_delayed'
                  )
                "
                @click="cancelReservations(currentFolio.id)"
              >
                <span> Cancelar reservas </span>
                <span class="menu-len-reservations"> ({{ currentReservations?.length }}) </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <div class="second-row">
        <div class="left">
          <div class="left-first-row">
            <img
              class="back-arrow-img"
              :src="
                currentFolio?.state === 'done' || currentFolio?.state === 'cancel'
                  ? '/app-images/back-arrow-blue.svg'
                  : '/app-images/back-arrow-white.svg'
              "
              @click="backToFolioList"
            />
            <div class="num-reservations-circles">
              <span class="num-reservations" :style="circleBorderStyle()">
                {{ currentReservations?.length }}
              </span>
              <div
                v-if="currentReservations && currentReservations?.length > 1"
                class="circle-1"
                :style="circleBorderStyle()"
              />
              <div
                v-if="currentReservations && currentReservations?.length > 2"
                class="circle-2"
                :style="circleBorderStyle()"
              />
            </div>

            <div
              class="folio-closure-reason"
              v-if="currentFolio?.reservationType === 'out' && currentFolio?.closureReasonId"
            >
              <div class="stripe-box">
                <div class="white-box">
                  Fuera de venta: {{ getOutOfServiceTypeName(currentFolio.closureReasonId) }}
                </div>
              </div>
            </div>
            <span class="parent-name" v-else>
              {{ currentFolio?.partnerName }}
            </span>

            <img
              class="agency-img"
              v-if="currentFolio?.agencyId && agencyImageSrc"
              :src="agencyImageSrc"
            />
          </div>
          <div class="left-second-row">
            <div
              v-for="roomClass in currentRoomTypeClasses"
              :key="roomClass.roomTypeClass.id"
              class="classes"
            >
              <span class="class-name">
                {{ roomClass.numRoomTypeClass }} {{ roomClass.roomTypeClass.name }}
              </span>
              <span class="class-code">
                {{ roomClass.numRoomTypeClass }} {{ roomClass.roomTypeClass.defaultCode }}
              </span>
            </div>
          </div>
          <div class="left-third-row">
            <span
              class="folio-id"
              :style="{
                color: currentFolio?.reservationType === 'out' ? 'black' : 'white',
              }"
            >
              {{ currentFolio?.name }}
            </span>
            <span class="folio-state">
              <div class="circle" :style="`background-color: ${colorFolioState()}`" />
              <span :style="`color: ${colorFolioState()}`" v-if="currentFolio">
                {{ folioStateText(currentFolio) }}
              </span>
            </span>
          </div>
        </div>
        <div class="right">
          <div
            class="amounts"
            :class="currentFolio?.pendingAmount === 0 ? 'paid-amount' : ''"
            v-if="currentFolio?.reservationType !== 'out'"
          >
            <span class="amount-total">
              {{ currentFolio?.amountTotal?.toFixed(2).toString().replace('.', ',') }}€
              <span class="total-span"> Total </span>
            </span>
            <span class="pending-amount">
              <span :class="currentFolio?.pendingAmount === 0 ? 'paid-span' : ''">
                {{ folioPendingAmount() }}
              </span>
            </span>
          </div>
          <div class="three-dots-menu">
            <img
              src="/app-images/three-dots-white.svg"
              @click="isSomeItemMenu ? (isOpenMenu = !isOpenMenu) : null"
              @blur="isOpenMenu = false"
              tabindex="1"
              :class="!isSomeItemMenu ? 'disabled' : ''"
            />
            <transition name="menu">
              <div
                class="folio-menu"
                :style="currentFolio?.state === 'cancel' ? 'top: -20px' : 'top: -37px'"
                v-if="isOpenMenu && currentFolio && currentFolio.id && currentReservations"
              >
                <div v-if="isAllowedAddRooms(currentFolio)" @click="updateFolio()">
                  Añadir habitaciones
                </div>
                <div
                  v-if="isAllowedBatchChanges(currentFolio, currentReservations)"
                  @click="openBatchChangesDialog(currentFolio.id)"
                >
                  Modificación en lote
                </div>
                <div
                  v-if="isAllowedConfirmReservations(currentFolio, currentReservations)"
                  @click="confirmReservations()"
                  class="option-confirm"
                >
                  <span> Confirmar Reservas </span>
                  <span class="menu-len-reservations"> ({{ currentReservations?.length }}) </span>
                </div>
                <div
                  class="option-cancel"
                  v-if="isAllowedCancelReservations(currentFolio, currentReservations)"
                  @click="cancelReservations(currentFolio.id)"
                >
                  <span> Cancelar reservas </span>
                  <span class="menu-len-reservations"> ({{ currentReservations?.length }}) </span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <div class="folio-detail-content" ref="scrollable" @scroll="scrollEnabled ? onScroll() : null">
      <div
        class="second-header"
        :style="`z-index: ${currentReservations ? currentReservations?.length + 1 : 0}`"
      >
        <div
          class="internal-comment"
          :style="isInternalCommentOpened ? 'box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);' : ''"
        >
          <div
            class="internal-comment-title"
            :class="!isInternalCommentOpened ? 'internal-comment-title-closed' : ''"
            @click="toggleInternalComment()"
          >
            <div class="internal-comment-title-left">
              <img src="/app-images/pin.svg" />
              <span v-if="currentFolio?.reservationType !== 'out'">
                Notas y comentarios internos
              </span>
              <span v-else> Descripción fuera de venta </span>
            </div>
            <div class="internal-comment-title-right">
              <span v-if="!currentFolio?.internalComment" @click="openInternalComments" @click.stop>
                Añadir
              </span>
              <span v-else @click="openInternalComments()" @click.stop> Editar </span>
              <img
                v-if="currentFolio?.internalComment"
                :class="isInternalCommentOpened ? 'dropdown-img-up' : 'dropdown-img'"
                src="/app-images/arrow-left-black.svg"
              />
            </div>
          </div>
          <transition name="accordion-transition" mode="out-in">
            <div class="internal-comment-content" v-if="isInternalCommentOpened">
              <div class="internal-comment-text-drawer" v-if="isInternalCommentOpened">
                {{ currentFolio?.internalComment }}
              </div>
              <div
                class="internal-comment-more"
                @click="openInternalComments()"
                v-if="isInternalCommentOpened"
              >
                Ver más
              </div>
            </div>
          </transition>
        </div>
        <div class="tabs">
          <div
            class="tab"
            :class="currentTabSelected === 'folio' ? 'selected' : ''"
            @click="setTabValue('folio')"
          >
            <span> General </span>
          </div>
          <div
            class="tab"
            :class="currentTabSelected === 'reservations' ? 'selected' : ''"
            @click="setTabValue('reservations')"
          >
            <span>
              {{
                currentReservations && currentReservations?.length > 1
                  ? `${currentReservations?.length}`
                  : ''
              }}
              Reserva{{ currentReservations && currentReservations?.length > 1 ? 's' : '' }}
            </span>
          </div>
          <div
            class="tab"
            :class="
              currentFolio?.reservationType === 'out'
                ? 'disabled'
                : currentTabSelected === 'charges'
                ? 'selected'
                : ''
            "
            @click="currentFolio?.reservationType !== 'out' ? setTabValue('charges') : null"
          >
            <span> Cobros </span>
          </div>
          <div
            class="tab"
            :class="
              currentFolio?.reservationType === 'out'
                ? 'disabled'
                : currentTabSelected === 'invoices'
                ? 'selected'
                : ''
            "
            @click="currentFolio?.reservationType !== 'out' ? setTabValue('invoices') : null"
          >
            <span> Facturar </span>
          </div>
          <div
            class="tab"
            :class="currentTabSelected === 'messages' ? 'selected' : ''"
            @click="setTabValue('messages')"
          >
            <span> Mensajes </span>
          </div>
          <div class="slider"></div>
        </div>
      </div>
      <div class="tab-content" v-if="currentTabSelected === 'folio'">
        <FolioInfo @setTabValue="setTabValue($event)" />
      </div>
      <div class="tab-content" v-if="currentTabSelected === 'reservations'">
        <ReservationDetail
          v-if="(currentReservations && currentReservations.length === 1) || reservation"
          @moveToReservation="moveToReservation()"
        />
        <div v-else-if="currentReservations && currentReservations.length > 1 && !reservation">
          <div v-for="(classes, index) in reservationsByClass(currentReservations)" :key="index">
            <div class="separator" v-if="currentReservations.length > 1">
              <div class="line-left" />
              <div class="number-reservations">
                <img :src="classIcon(index.toString())" style="height: 15px; width: 15px" />
                {{ classes.length }} {{ className(index.toString()) }}
              </div>
              <div class="line-right" />
            </div>
            <div
              class="reservations"
              v-for="reservation in classes.sort((a, b) => {
                if (a.folioSequence && b.folioSequence && a.folioSequence < b.folioSequence)
                  return -1;
                if (a.folioSequence && b.folioSequence && a.folioSequence > b.folioSequence)
                  return 1;
                else return 0;
              })"
              :key="reservation.id"
            >
              <ReservationComponent
                v-if="currentFolio"
                :reservation="reservation"
                :folio="currentFolio"
                class="reservation-pill"
                @click="setCurrentreservation(reservation.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="tab-content-tr-inv-msg" v-if="currentTabSelected === 'charges'">
        <FolioTransactions />
      </div>
      <div class="tab-content-tr-inv-msg" v-if="currentTabSelected === 'invoices'">
        <FolioInvoicing />
      </div>
      <div class="tab-content-tr-inv-msg" v-if="currentTabSelected === 'messages'">
        <FolioMessagesComponent @goToReservationCard="openDetailTab()" />
      </div>
      <FolioCheckins
        v-if="currentTabSelected === 'folioCheckins'"
        :currentReservations="currentReservations ?? []"
      />
      <div class="buttons" v-if="currentTabSelected !== 'folioCheckins'">
        <a
          class="print-folio"
          :href="`${currentFolio?.portalUrl}&report_type=pdf`"
          target="_blank"
          v-if="currentFolio?.portalUrl && currentFolio.reservationType !== 'out'"
        >
          <img src="/app-images/icon-pdf.svg" class="icon-print" />
          <span> Imprimir folio </span>
        </a>
        <div
          class="masive-changes"
          @click="openBatchChangesDialog(currentFolio?.id)"
          v-if="currentFolio?.reservationType !== 'out'"
        >
          <img src="/app-images/icon-list.svg" class="icon" />
          <span> Cambios del folio en lote </span>
        </div>
        <a
          class="link-folio"
          :href="folioPublicLink"
          target="_blank"
          v-if="folioPublicLink && currentFolio?.reservationType !== 'out'"
        >
          <img src="/app-images/icon-link.svg" class="icon-link" />
          <span> Enlace público </span>
        </a>
        <div
          class="open-sales"
          @click="cancelReservations(currentFolio.id)"
          v-if="
            currentFolio?.reservationType === 'out' &&
            currentFolio.state !== 'cancel' &&
            currentFolio &&
            currentFolio.id
          "
        >
          <CustomIcon
            imagePath="/app-images/check-mark.svg"
            color="#263941"
            width="13px"
            height="13px"
            class="icon"
          />
          <span> Abrir ventas </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type BatchChangesInterface } from '@/legacy/interfaces/BatchChangesInterface';
import { defineComponent, computed, onMounted, ref, type Ref, watch, markRaw } from 'vue';

import { type ReservationInterface } from '@/legacy/interfaces/ReservationInterface';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { useStore } from '@/legacy/store';
import FolioInternalComments from '@/legacy/components/folios/FolioInternalComments.vue';
import ReservationComponent from '@/legacy/components/reservations/ReservationComponent.vue';
import ReservationDetail from '@/legacy/components/reservations/ReservationDetail.vue';
import FolioInfo from '@/legacy/components/folios/FolioInfo.vue';
import FolioBatchChanges from '@/legacy/components/folios/FolioBatchChanges.vue';
import FolioOrReservationCancelBlocked from '@/legacy/components/alerts/FolioOrReservationCancelBlocked.vue';
import FolioMessagesComponent from '@/legacy/components/folios/FolioMessagesComponent.vue';
import FolioTransactions from '@/legacy/components/folios/FolioTransactions.vue';
import FolioCheckins from '@/legacy/components/folios/FolioCheckins.vue';
import FolioInvoicing from '@/legacy/components/folios/FolioInvoicing.vue';

import { usePlanning } from '@/legacy/utils/usePlanning';
import {
  isAllowedAddRooms,
  isAllowedBatchChanges,
  isAllowedConfirmReservations,
  isAllowedCancelReservations,
  folioStateText,
} from '@/legacy/utils/folio';
import { dialogService } from '@/legacy/services/DialogService';
import type { roomTypeClassesInterface } from '@/legacy/interfaces/roomTypeClassesInterface';

export default defineComponent({
  components: {
    FolioInfo,
    FolioMessagesComponent,
    FolioInvoicing,
    FolioTransactions,
    ReservationComponent,
    ReservationDetail,
    FolioCheckins,
    CustomIcon,
  },
  emits: ['moveToReservation'],
  setup(props, context) {
    const { refreshPlanning } = usePlanning();

    const store = useStore();
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const reservation = computed(() => store.state.reservations.currentReservation);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const forceMoveFolioTab = computed(() => store.state.layout.forceMoveFolioTab);
    const folioPublicLink = computed(
      () =>
        `${window.location.origin}/${currentFolio.value?.id ?? 0}/precheckin/${
          currentFolio.value?.accessToken ?? ''
        }`
    );
    const currentRoomTypeClasses = computed(() => {
      const roomTypeClasses: roomTypeClassesInterface[] = [];
      currentReservations.value?.forEach((reser) => {
        const roomTypeClassId = store.state.roomTypes.roomTypes.find(
          (el) => el.id === reser.roomTypeId
        )?.classId;
        const roomTypeClass = store.state.roomTypeClasses.roomTypeClasses.find(
          (el) => el.id === roomTypeClassId
        );
        if (roomTypeClass) {
          const roomTypeClassIndex = roomTypeClasses.findIndex(
            (el) => el.roomTypeClass === roomTypeClass
          );
          if (roomTypeClassIndex === -1) {
            roomTypeClasses.push({
              numRoomTypeClass: 1,
              roomTypeClass,
            });
          } else {
            roomTypeClasses[roomTypeClassIndex].numRoomTypeClass += 1;
          }
        }
      });
      return roomTypeClasses;
    });
    const getOutOfServiceTypeName = (closureReasonId: number) => {
      let result = '';
      result =
        store.state.roomClosureReasons.roomClosureReasons.find((el) => el.id === closureReasonId)
          ?.name ?? '';
      return result;
    };
    const currentReservation: Ref<ReservationInterface | null> = ref(null);
    const scrollEnabled = ref(true);
    const scrollPosition = ref(0);
    const currentTabSelected = ref('folio');
    const showEditPartnerModal = ref(false);
    const partnerDialog = ref(false);
    const isOpenMenu = ref(false);
    const isReservationBlockedModalOpen = ref(false);

    const isInternalCommentOpened = currentFolio.value?.internalComment ? ref(true) : ref(false);
    const internalComments: Ref<string | undefined> = ref('');
    const scrollable: Ref<HTMLElement | null> = ref(null);
    const isBatchChangesDialog = ref(false);
    const reservationsMappedForBatchChanges = ref([] as BatchChangesInterface[]);

    const agencyName = computed(
      () => store.state.agencies.agencies.find((el) => el.id === currentFolio.value?.agencyId)?.name
    );

    const agencyImageSrc = computed(
      () =>
        store.state.agencies.agencies.find((el) => el.id === currentFolio.value?.agencyId)?.imageUrl
    );

    const saleChannelName = computed(
      () =>
        store.state.saleChannels.saleChannels.find(
          (el) => el.id === currentFolio.value?.saleChannelId
        )?.name
    );

    const isSomeItemMenu = computed(() => {
      let result = false;
      if (currentFolio.value && currentReservations.value) {
        if (
          isAllowedAddRooms(currentFolio.value) ||
          isAllowedBatchChanges(currentFolio.value, currentReservations.value) ||
          isAllowedConfirmReservations(currentFolio.value, currentReservations.value) ||
          isAllowedCancelReservations(currentFolio.value, currentReservations.value)
        ) {
          result = true;
        }
      }
      return result;
    });

    const reservationsByClass = (reservations: ReservationInterface[]) => {
      const reservationsByClassId: { [key: number]: ReservationInterface[] } = {};
      reservations.forEach((rsv) => {
        const { roomTypeClassId } = rsv;

        if (roomTypeClassId) {
          if (reservationsByClassId[roomTypeClassId]) {
            reservationsByClassId[roomTypeClassId].push(rsv);
          } else {
            reservationsByClassId[roomTypeClassId] = [rsv];
          }
        }
      });
      return reservationsByClassId;
    };

    const className = (classId: string) =>
      store.state.roomTypeClasses.roomTypeClasses.find((el) => el.id === parseInt(classId, 10))
        ?.name;

    const classIcon = (classId: string) =>
      store.state.roomTypeClasses.roomTypeClasses.find((el) => el.id === parseInt(classId, 10))
        ?.imageUrl ?? '';

    const saveInternalNotes = async () => {
      await store.dispatch('folios/updateFolio', {
        folioId: store.state.folios.currentFolio?.id,
        internalComment: internalComments.value,
      });
      await store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id);
      if (currentFolio.value?.internalComment) {
        isInternalCommentOpened.value = true;
      } else {
        isInternalCommentOpened.value = false;
      }
    };

    const toggleInternalComment = () => {
      scrollEnabled.value = false;
      if (currentFolio.value?.internalComment) {
        isInternalCommentOpened.value = !isInternalCommentOpened.value;
        setTimeout(() => {
          scrollEnabled.value = true;
        }, 500);
      }
    };

    const folioPendingAmount = () => {
      let pendingAmount = 'pagado';
      if (currentFolio.value?.pendingAmount && currentFolio.value.amountTotal) {
        let amount = currentFolio.value?.pendingAmount;
        if (currentFolio.value?.pendingAmount < 0) {
          amount *= -1;
        }
        const numAmount = `${amount.toFixed(2).toString().replace('.', ',')}€`;
        if (currentFolio.value.pendingAmount === currentFolio.value.amountTotal) {
          pendingAmount = 'pendiente';
        } else if (
          currentFolio.value.pendingAmount > 0 &&
          currentFolio.value.pendingAmount < currentFolio.value.amountTotal
        ) {
          pendingAmount = `${numAmount} pendiente`;
          if (window.screen.width < 1024) {
            pendingAmount = `${numAmount} pte.`;
          }
        } else if (currentFolio.value.pendingAmount < 0) {
          pendingAmount = `${numAmount} sobrepago`;
          if (window.screen.width < 1024) {
            pendingAmount = `${numAmount} spago.`;
          }
        }
      }
      return pendingAmount;
    };

    const updateFolio = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'NewFolioStep1');
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

    const openBatchChangesDialog = async (folioId: number | undefined) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/fetchReservations', folioId);
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
            folioName: currentFolio.value?.name,
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

    const saveBatchChanges = async () => {
      await store.dispatch('reservationLines/fetchCurrentFolioReservationLines');
      await store.dispatch(
        'services/fetchFolioServices',
        currentReservations.value?.map((el) => el.id)
      );
      buildReservationMappedForBatchChanges();
    };

    const closeBatchChanges = () => {
      isBatchChangesDialog.value = false;
    };

    const confirmReservations = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('folios/confirmFolioReservations', {
          folioId: currentFolio.value?.id,
          confirmReservations: true,
        });
        await store.dispatch('folios/fetchFolio', currentFolio.value?.id);
        await store.dispatch('reservations/fetchReservations', currentFolio.value?.id);
        await refreshPlanning();
        if (store.state.reservations.currentReservation) {
          await store.dispatch(
            'reservations/fetchReservation',
            store.state.reservations.currentReservation?.id
          );
          await store.dispatch(
            'services/fetchServices',
            store.state.reservations.currentReservation?.id
          );
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

    const cancelReservations = async (folioId: number) => {
      await store.dispatch('folios/fetchFolio', folioId);
      await store.dispatch('reservations/fetchReservations', folioId);
      if (currentReservations.value && currentReservations.value.some((el) => el.isBlocked)) {
        let titleDialog = '';
        const agencyName = store.state.agencies.agencies.find(
          (el) => el.id === currentFolio.value?.agencyId
        )?.name;
        const moreThanOneReservation = currentReservations.value.length > 1;
        if (moreThanOneReservation) {
          titleDialog = 'Reservas bloqueadas';
        } else {
          titleDialog = 'Reserva bloqueada';
        }
        if (agencyName) {
          titleDialog += ` por ${agencyName}`;
        }
        dialogService.open({
          iconHeader: '/app-images/icon-lock.svg',
          header: titleDialog,
          content: markRaw(FolioOrReservationCancelBlocked),
          props: {
            agencyName: agencyName,
            isFolio: true,
            moreThanOneReservation: moreThanOneReservation,
          },
        });
      } else {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('folios/cancelFolioReservations', {
            folioId,
            cancelReservations: true,
          });
          await store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id);
          await store.dispatch(
            'reservations/fetchReservations',
            store.state.folios.currentFolio?.id
          );
          isOpenMenu.value = false;
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
      }
    };

    const folioCreateDate = () => {
      let folioCreateDateValue = '';
      if (currentFolio.value?.createDate) {
        const folioCreate = new Date(currentFolio.value.createDate);
        folioCreateDateValue = `${folioCreate.getDate()}/${
          folioCreate.getMonth() + 1
        }/${folioCreate.getFullYear()} a las ${folioCreate.getHours()}:${folioCreate.getMinutes()}`;
      }
      return folioCreateDateValue;
    };

    const folioHeaderBackgroundColorStyle = () => {
      let backgroundColor = '#263941';
      if (currentFolio.value?.reservationType === 'out') {
        backgroundColor = '#AADEFF';
      } else if (currentFolio.value?.state === 'confirm') {
        backgroundColor = '#1E9ED9';
      } else if (currentFolio.value?.state === 'cancel') {
        backgroundColor = '#263941';
      } else if (currentFolio.value?.state === 'draft') {
        backgroundColor = '#DCA81C';
      }
      const style = {
        backgroundColor,
      };
      return style;
    };

    const colorFolioState = () => {
      let folioStateColor = '#263941';
      if (currentFolio.value?.state === 'confirm') {
        folioStateColor = '#1E9ED9';
      } else if (currentFolio.value?.state === 'cancel') {
        folioStateColor = '#FF0000';
      } else if (currentFolio.value?.state === 'draft') {
        folioStateColor = '#DCA81C';
      }
      return folioStateColor;
    };

    const circleBorderStyle = () => {
      let borderColor = '#263941';
      let color = '#263941';
      if (currentFolio.value?.reservationType === 'out') {
        color = 'black';
      } else if (currentFolio.value?.state === 'confirm') {
        borderColor = '#1E9ED9';
        color = '#1E9ED9';
      } else if (currentFolio.value?.state === 'cancel') {
        borderColor = '#263941';
        color = '#FF0000';
      } else if (currentFolio.value?.state === 'draft') {
        borderColor = '#DCA81C';
        color = '#DCA81C';
      }
      const style = {
        border: `1px solid ${borderColor}`,
        color,
      };
      return style;
    };

    const setCurrentreservation = (reservationId: number) => {
      void store.dispatch('reservations/fetchReservation', reservationId);
    };

    const setTabValue = (tab: string) => {
      currentTabSelected.value = tab;
    };

    const openDetailTab = () => {
      currentTabSelected.value = 'reservations';
    };

    const moveToReservation = () => {
      context.emit('moveToReservation');
    };

    const onScroll = () => {
      const currentScrollPos = scrollable.value?.scrollTop || 0;

      if (isInternalCommentOpened.value && currentScrollPos > scrollPosition.value) {
        isInternalCommentOpened.value = false;
      }
      scrollPosition.value = currentScrollPos;
    };

    const backToFolioList = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'FolioList');
      void store.dispatch('folios/setCurrentFolio', null);
      void store.dispatch('reservations/setCurrentReservations', []);
      void store.dispatch('reservations/setCurrentReservation', null);
    };

    const openInternalComments = () => {
      dialogService.open({
        iconHeader: '/app-images/pin.svg',
        header: 'Editar notas y comentarios internos',
        content: markRaw(FolioInternalComments),
      });
    };

    watch(reservation, () => {
      currentReservation.value = reservation.value;
    });

    watch(currentFolio, () => {
      scrollable.value?.scrollTo(0, 0);
      internalComments.value = currentFolio.value?.internalComment;
      if (currentFolio.value?.internalComment) {
        isInternalCommentOpened.value = true;
      } else {
        isInternalCommentOpened.value = false;
      }
    });

    watch(forceMoveFolioTab, () => {
      if (forceMoveFolioTab.value !== '') {
        setTabValue(forceMoveFolioTab.value);
        void store.dispatch('layout/clearForceMoveFolioTab');
      }
    });

    onMounted(async () => {
      await store.dispatch('reservations/fetchReservations', currentFolio.value?.id);
      if (currentFolio.value?.partnerId) {
        void store.dispatch('partners/fetchCurrentPartner', currentFolio.value?.partnerId);
      }
      if (reservation.value && reservation.value.reservationType !== 'out') {
        setTabValue('reservations');
      }
      if (
        store.state.layout.isMoveToGuestsTab &&
        currentReservations.value &&
        currentReservations.value.length > 1
      ) {
        setTabValue('folioCheckins');
        void store.dispatch('layout/setMoveToGuestsTab', false);
      }
      internalComments.value = currentFolio.value?.internalComment;
    });

    return {
      currentFolio,
      currentReservation,
      currentReservations,
      currentRoomTypeClasses,
      saleChannelName,
      isInternalCommentOpened,
      internalComments,
      partnerDialog,
      showEditPartnerModal,
      agencyName,
      isOpenMenu,
      isBatchChangesDialog,
      reservationsMappedForBatchChanges,
      currentTabSelected,
      scrollable,
      scrollEnabled,
      reservation,
      agencyImageSrc,
      folioPublicLink,
      isSomeItemMenu,
      isReservationBlockedModalOpen,
      isAllowedAddRooms,
      isAllowedBatchChanges,
      isAllowedConfirmReservations,
      isAllowedCancelReservations,
      setCurrentreservation,
      backToFolioList,
      saveInternalNotes,
      folioHeaderBackgroundColorStyle,
      folioCreateDate,
      folioStateText,
      colorFolioState,
      updateFolio,
      openBatchChangesDialog,
      saveBatchChanges,
      closeBatchChanges,
      confirmReservations,
      cancelReservations,
      setTabValue,
      circleBorderStyle,
      onScroll,
      folioPendingAmount,
      reservationsByClass,
      className,
      classIcon,
      toggleInternalComment,
      moveToReservation,
      openDetailTab,
      getOutOfServiceTypeName,
      openInternalComments,
    };
  },
});
</script>

<style scoped lang="scss">
.folio-detail {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .folio-header {
    width: 100%;
    color: white;
    display: flex;
    flex-direction: column;
    background-color: #263941;
    &.bg-out {
      background-color: #aadeff;
    }
    &.bg-confirm {
      background-color: #1e9ed9;
    }
    &.bg-draft {
      background-color: #dca81c;
    }
    .first-row {
      display: flex;
      align-items: center;
      width: 95%;
      margin-left: 0.8rem;
      margin-top: 0.3rem;
      font-weight: bold;

      .arrow-left-img {
        height: 14.18px;
        width: 8.34px;
        margin-right: 10px;
        user-select: none;
      }
      .num-reservations-circles {
        position: relative;
        height: 27px;
        width: 27px;
        font-size: 14px;
        margin-right: 10px;
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
          user-select: none;
          z-index: 3;
          position: absolute;
          right: 0;
        }
        .circle-1 {
          border-radius: 50%;
          background-color: white;
          height: 25px;
          width: 25px;
          color: black;
          position: absolute;
          right: -4px;
          z-index: 2;
        }
        .circle-2 {
          border-radius: 50%;
          background-color: white;
          color: black;
          position: absolute;
          z-index: 1;
          height: 21px;
          width: 21px;
          right: -8px;
        }
      }
      .parent-name {
        font-size: 20px;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 33px;
        white-space: nowrap;
        max-width: 260px;
      }

      .three-dots-menu-mobile {
        margin-left: auto;
        position: relative;
        display: flex;
        align-items: center;
        .folio-menu {
          user-select: none;
          position: absolute;
          width: 200px;
          height: fit-content;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          color: black;
          font-size: 14px;
          box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.08);
          border-radius: 10px;
          cursor: pointer;
          z-index: 5;
          padding: 0.2rem 0;
          right: 17px;
          margin-top: 35px;
          z-index: 100;
          div {
            padding: 0.3rem 1rem;
            &:hover {
              font-weight: bold;
            }
          }
          .option-cancel {
            display: flex;
            align-items: center;
            color: #f21e1e;
            .menu-len-reservations {
              margin-left: 0.2rem;
            }
          }
          .option-confirm {
            display: flex;
            align-items: center;
            color: $primary;
            .menu-len-reservations {
              margin-left: 0.2rem;
            }
          }
        }
      }
    }
    .second-row {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      .left {
        display: flex;
        flex-direction: column;
        height: 100%;
        .left-first-row {
          display: none;
          align-items: center;
          width: 100%;
          flex-wrap: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .back-arrow-img {
            height: 22px;
            width: 22px;
            margin-right: 14px;
            cursor: pointer;
            user-select: none;
            align-items: center;
          }
          .agency-img {
            user-select: none;
            width: 26px;
            height: 26px;
            background-color: white;
            border-radius: 3px;
            padding: 2px;
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
              border: 1px solid #263941;
              height: 100%;
              width: 100%;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              user-select: none;
              z-index: 3;
              position: absolute;
              right: 0;
            }
            .circle-1 {
              border-radius: 50%;
              background-color: white;
              height: 25px;
              width: 25px;
              color: black;
              position: absolute;
              right: -4px;
              z-index: 2;
            }
            .circle-2 {
              border-radius: 50%;
              background-color: white;
              color: black;
              position: absolute;
              z-index: 1;
              height: 21px;
              width: 21px;
              right: -8px;
            }
          }
          .parent-name,
          .folio-closure-reason {
            margin: 0 1rem;
            font-size: 22px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .folio-closure-reason {
            width: 75%;
            .stripe-box {
              background: repeating-linear-gradient(
                -45deg,
                white 2px,
                white 4px,
                #abdefe 4px,
                #abdefe 8px
              );
              padding: 7px 10px;
              .white-box {
                width: fit-content;
                color: black;
                background-color: rgba(255, 255, 255, 0.8);
                padding-left: 10px;
                padding-right: 10px;
              }
            }
          }
        }

        .left-second-row {
          display: flex;
          align-items: center;
          margin-left: 1.8rem;
          flex-wrap: wrap;
          .classes {
            display: flex;
            .class-code {
              border-radius: 10px;
              background-color: white;
              color: #263941;
              margin-right: 0.5rem;
              font-size: 12px;
              padding: 0 0.5rem;
              margin-top: 0.5rem;
            }
            .class-name {
              display: none;
              border-radius: 10px;
              background-color: white;
              color: #263941;
              margin-right: 0.5rem;
              font-size: 12px;
              padding: 0 0.5rem;
              margin-top: 0.5rem;
            }
          }
        }
        .left-third-row {
          display: flex;
          align-items: center;
          margin: 0.5rem 0 0.7rem 2rem;
          .folio-id {
            font-size: 14px;
            margin-right: 1rem;
          }
          .folio-state {
            border-radius: 10px;
            background-color: white;
            color: #263941;
            margin-right: 0.5rem;
            font-size: 12px;
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
        }
      }
      .right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        // min-width: 27%;
        margin-right: 1rem;
        margin-bottom: 0.5rem;
        .amounts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5px 15px;
          background-color: white;
          border: 2px solid #ef9426;
          border-radius: 50px;
          color: black;
          height: 50px;
          text-align: center;
          .amount-total {
            font-size: 14px;

            .total-span {
              display: none;
            }
          }
          .pending-amount {
            font-size: 12px;
            color: #f25022;
            margin-top: -5px;
            display: block;
            line-height: 1;
            .paid-span {
              color: #008000;
            }
          }
        }
        .paid-amount {
          border: 2px solid #008000;
        }
        img {
          cursor: pointer;
          user-select: none;
          margin-left: 0.5rem;
        }

        .three-dots-menu {
          position: relative;
          display: none;
          .folio-menu {
            user-select: none;
            position: absolute;
            width: 200px;
            display: flex;
            flex-direction: column;
            background-color: #ffffff;
            color: black;
            font-size: 14px;
            box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.08);
            border-radius: 10px;
            cursor: pointer;
            z-index: 100;
            padding: 0.2rem 0;
            left: -175px;
            margin-top: 0.8rem;
            div {
              padding: 0.3rem 1rem;
              &:hover {
                font-weight: bold;
              }
            }
            .option-cancel {
              display: flex;
              align-items: center;
              color: #f21e1e;
              .menu-len-reservations {
                margin-left: 0.2rem;
              }
            }
            .option-confirm {
              display: flex;
              align-items: center;
              color: $primary;
              .menu-len-reservations {
                margin-left: 0.2rem;
              }
            }
          }
        }
      }
    }
  }
  .folio-detail-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    .second-header {
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: white;
      margin-bottom: 0.5rem;
      padding: 14px 9px 0 9px;
      .internal-comment {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        // box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
        .internal-comment-title {
          display: flex;
          align-items: center;
          background: rgba(255, 185, 0, 0.42);
          border-radius: 10px 10px 0 0;
          justify-content: space-between;
          user-select: none;
          cursor: pointer;
          .internal-comment-title-left {
            display: flex;
            align-items: center;

            img {
              height: 16px;
              width: 16px;
              margin: 8px 6px 8px 11px;
            }
            span {
              font-size: 14px;
            }
          }
          .internal-comment-title-right {
            display: flex;
            align-items: center;
            margin-right: 12px;
            span {
              background-color: white;
              border-radius: 5px;
              text-align: center;
              padding: 0 0.5rem;
              &:hover {
                background-color: #c8c8c8;
                color: white;
                font-weight: bold;
              }
            }
            .dropdown-img {
              height: 10px;
              margin-right: 15px;
              margin-left: 10px;
              transition: transform 100ms linear;
            }
            .dropdown-img-up {
              height: 10px;
              margin-right: 15px;
              margin-left: 10px;
              transform: rotate(-90deg);
              transition: transform 100ms linear;
            }
          }
        }
        .internal-comment-title-closed {
          border-radius: 10px;
          transition: border-radius 0.3s ease-in-out;
        }
        .internal-comment-content {
          margin: 0.5rem 1rem 1rem 1rem;

          .internal-comment-text-drawer {
            font-size: 14px;
            border-radius: 10px;
            display: -webkit-box;
            line-clamp: 5;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 135px;
            white-space: pre-wrap;
          }
          .internal-comment-more {
            background-color: #f0f0f0;
            text-align: center;
            cursor: pointer;
            padding: 0.1rem 1rem;
            border-radius: 5px;
            float: right;
            &:hover {
              background-color: #c8c8c8;
              color: white;
              font-weight: bold;
            }
          }
        }
      }
      .tabs {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        margin: 1rem 0;
        font-size: 12px;
        z-index: 1;
        background-color: #f0f0f0;
        border-radius: 20px;
        color: #848484;
        position: relative;
        .tab {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          cursor: pointer;
          justify-content: center;
          padding: 0.5rem 0;
          transition: all 0.2s linear;
          position: relative;
          span {
            user-select: none;
            z-index: 25;
          }
        }
        .selected {
          color: black;
          font-weight: bold;
        }
        .slider {
          position: absolute;
          left: 0;
          height: 90%;
          background: linear-gradient(45deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%);
          box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);
          border-radius: 45px;
          z-index: 0;
          transition: all 0.3s linear;
        }
        .tab:nth-of-type(1).selected ~ .slider {
          left: 0.5%;
          width: 19%;
        }
        .tab:nth-of-type(2).selected ~ .slider {
          left: 20%;
          width: 20%;
        }
        .tab:nth-of-type(3).selected ~ .slider {
          left: 40%;
          width: 20%;
        }
        .tab:nth-of-type(4).selected ~ .slider {
          left: 60%;
          width: 20%;
        }
        .tab:nth-of-type(5).selected ~ .slider {
          left: 80%;
          width: 19.5%;
        }
      }
    }
    .tab-content,
    .tab-content-tr-inv-msg {
      padding: 0 9px 14px 9px;
      .separator {
        display: flex;
        align-items: center;
        width: 100%;
        position: relative;

        .line-left {
          flex: 1;
          height: 1.5px;
          background-color: #263941;
        }
        .line-right {
          flex: 1;
          height: 1.5px;
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
      .reservations {
        .reservation-pill {
          cursor: pointer;
        }
      }
    }
  }
  .buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    user-select: none;
    padding: 20px 9px;
    .print-folio {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      height: 30px;
      background-color: #f0f0f0;
      width: 100%;
      border-radius: 5px;
      text-decoration: none;
      color: black;
      .icon-print {
        width: 20px;
        height: 20px;
        margin-right: 14px;
      }
    }
    .masive-changes,
    .open-sales {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      height: 30px;
      background-color: #f0f0f0;
      width: 100%;
      border-radius: 5px;
      .icon {
        width: 20px;
        height: 20px;
        margin-right: 14px;
      }
    }

    .link-folio {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      background-color: $call_to_action_color;

      color: white;
      border-radius: 5px;
      height: 30px;
      width: 100%;
      font-weight: 600;
      text-decoration: none;
      .icon-link {
        width: 20px;
        height: 20px;
        margin-right: 16px;
      }
    }
  }
}
.modal-container {
  border-radius: 10px !important;
  .modal-header {
    padding: 0;
    .internal-comment-title {
      width: 100%;
      color: black;

      .internal-comment-title-left {
        display: flex;
        align-items: center;
        margin: 12px 0;
        img {
          height: 16px;
          width: 16px;
          margin: 0 0.5rem 0 1rem;
        }
        span {
          font-size: 14px;
          margin-right: 2.8rem;
        }
      }
    }
    .folio-partner-title {
      width: 100%;
      color: black;
      margin: 12px 0 12px 2rem;
      display: flex;
      align-items: center;
      img {
        margin-right: 0.5rem;
      }
    }
  }
  .modal-body {
    .internal-comment-content {
      font-size: 14px;
      margin: 1rem 0.5rem 0 0.5rem;
      width: 97%;
      .internal-comment-text {
        font-size: 14px;
        width: 100%;
        resize: none;
        border: none;
        outline: none;
        min-height: 172px;
      }
    }
    .buttons {
      margin: 0 0.5rem 1rem 0;
      display: flex;
      justify-content: flex-end;
      .btn-save {
        background-color: $primary;
        color: white;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-size: 14px;
        border: none;
        box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2);
        margin-left: 0.5rem;
        cursor: pointer;
      }
      .btn-cancel {
        background-color: #f0f0f0;
        color: black;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-size: 14px;
        border: none;
        box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      }
    }
  }
}
.reservation-blocked-modal {
  height: 100%;
  .reservation-blocked-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: $primary;
    margin-left: 0.5rem;
    .title {
      margin-left: 0.5rem;
      color: black;
    }
  }
  .reservation-blocked-content {
    height: 100%;
    padding: 1rem;
    .reservation-blocked {
      padding-bottom: 1rem;
      .first-row {
        font-weight: bold;
      }
    }
  }
}

@media (min-width: 1024px) {
  .folio-detail {
    .folio-header {
      .first-row {
        display: none;
      }
      .second-row {
        .left {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-left: 40px;
          margin-top: 1rem;
          flex: 1 1 auto;
          flex-wrap: nowrap;
          overflow: hidden;
          .left-first-row {
            display: flex;
            .parent-name {
              margin-left: 12px;
              font-weight: bold;
              max-width: 300px;
            }
          }
          .left-second-row {
            display: flex;
            align-items: center;
            margin-left: 2.3rem;
            .classes {
              .class-code {
                display: none;
              }
              .class-name {
                display: flex;
                font-size: 14px;
                font-weight: 500;
              }
            }
          }
          .left-third-row {
            margin-left: 2.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0;
            .folio-id {
              font-size: 18px;
            }
            .folio-state {
              font-size: 14px;
            }
          }
        }
        .right {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          position: relative;
          margin-right: 2rem;
          // min-width: 30%;
          .amounts {
            .amount-total {
              font-size: 17px;
              .total-span {
                display: inline;
              }
            }
            .pending-amount {
              font-size: 14px;
              .pending-ab-span {
                display: none;
              }
            }
          }
          img {
            cursor: pointer;
            user-select: none;
            margin-left: 0.5rem;
          }
          .three-dots-menu {
            display: inline;
            img {
              width: 40px;
              height: 40px;
              margin: 0;
            }
          }
        }
      }
    }
    .folio-detail-content {
      padding-bottom: 10px;
      -ms-overflow-style: block;
      scrollbar-width: block;
      width: 100%;
      &::-webkit-scrollbar {
        display: block;
      }
      .second-header {
        // margin-bottom: .5rem;
        padding: 18px 20px 0 20px;
        width: 100%;
        .internal-comment {
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          .internal-comment-title {
            height: 32px;
            .internal-comment-title-left {
              margin: 6px 0;
              img {
                height: 16px;
                width: 16px;
                margin: 0 1rem 0 1.5rem;
              }
              span {
                font-size: 16px;
              }
            }
            .internal-comment-title-right {
              span {
                margin-right: 0.5rem;
                &:hover {
                  background-color: #c8c8c8;
                  color: white;
                  font-weight: bold;
                }
              }
            }
          }
          .internal-comment-content {
            margin: 0.5rem 1rem 1rem 1rem;
            .internal-comment-text-drawer {
              font-size: 16px;
              padding: 0.5rem;
              border-radius: 10px;
              display: -webkit-box;
              line-clamp: 5;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              max-height: 135px;
              white-space: pre-wrap;
            }
            .internal-comment-more {
              background-color: #f0f0f0;
              border-radius: 5px;
              text-align: center;
              padding: 0.1rem 1rem;
              cursor: pointer;
              margin-right: 0.5rem;
              font-size: 14px;
              float: right;
              &:hover {
                background-color: #c8c8c8;
                color: white;
                font-weight: bold;
              }
            }
          }
        }
        .tabs {
          font-size: 14px;
        }
      }
      .tab-content {
        padding: 0;
        .line-left {
          margin-left: 1.25rem;
        }
        .line-right {
          margin-right: 1.25rem;
        }
        .reservations {
          margin: 0 20px;
        }
      }
      .tab-content-tr-inv-msg {
        margin: 0 1rem;
      }
    }
    .buttons {
      margin-top: 25px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      width: 100%;
      padding: 0 20px;
      .print-folio {
        width: fit-content;
        cursor: pointer;
        padding: 0 1rem;
        margin: 0;
      }
      .masive-changes {
        width: fit-content;
        cursor: pointer;
        padding: 0 1rem;
        margin: 0 1.5rem;
      }

      .open-sales {
        width: fit-content;
        cursor: pointer;
        padding: 0 1rem;
      }
      .link-folio {
        width: fit-content;
        cursor: pointer;
        padding: 0 1rem;
        margin: 0;
      }
    }
  }
  .modal-container {
    border-radius: 10px !important;
    .modal-header {
      padding: 0;
      .internal-comment-title {
        width: 100%;
        color: black;
        .internal-comment-title-left {
          display: flex;
          align-items: center;
          margin: 12px 0;
          img {
            height: 22px;
            width: 22px;
            margin: 0 1rem 0 2rem;
          }
          span {
            font-size: 15px;
            font-weight: bold;
          }
        }
      }
      .folio-partner-title {
        width: 100%;
        color: black;
        margin: 12px 0 12px 2rem;
        display: flex;
        align-items: center;
        img {
          margin-right: 0.5rem;
        }
      }
    }
    .modal-body {
      .internal-comment-content {
        .internal-comment-text {
          font-size: 16px;
          padding: 0.5rem;
          margin: 1rem;
          width: 600px;
          border-radius: 10px;
          min-height: 300px;
          max-height: 400px;
          resize: none;
          border: none;
          outline: none;
        }
      }
      .buttons {
        margin: 1rem;
        .btn-save {
          background-color: $primary;
          color: white;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 14px;
          font-weight: bold;
          border: none;
          box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        .btn-cancel {
          background-color: #f0f0f0;
          color: black;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 14px;
          font-weight: bold;
          border: none;
          box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          margin-left: 0.5rem;
        }
      }
    }
  }
  .reservation-blocked-modal {
    height: 100%;
    .reservation-blocked-title {
      height: 60px;
      margin-left: 1.5rem;
      font-size: 18px;
      .title {
        margin-left: 0.5rem;
      }
    }
    .reservation-blocked-content {
      width: 600px;
      padding: 1rem 1.5rem;
      border-top: 1px solid #d9d9d9;
      font-size: 16px;
    }
  }
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

.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease-in-out;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
