<template>
  <div class="reservation-services-container">
    <div class="data-service-first-row">
      <div class="left">
        <img src="/app-images/board-service-blue.svg" />
        <span> Régimen de la reserva </span>
      </div>
      <div class="right-link" @click="openServiceModal()">
        <CustomIcon
          imagePath="/app-images/icon-lock.svg"
          color="primary"
          width="12px"
          height="12px"
          v-if="currentReservation?.isBlocked"
        />
        <span class="link-title"> Gestionar régimen </span>
      </div>
    </div>
    <div class="service-container" v-if="boardServices.length > 0">
      <div class="service-title">
        <span>
          {{ boardServiceName() }}
        </span>
        <div class="service-title-right">
          <span class="service-amount"> {{ boardServiceAmountTotal().toFixed(2) }} € </span>
          <img
            class="three-dots"
            src="/app-images/three-dots-blue.svg"
            @click.stop="openBoardServicesOptionsMenu = !openBoardServicesOptionsMenu"
            @blur="openBoardServicesOptionsMenu = false"
            tabindex="1"
          />
        </div>
        <transition name="menu-services">
          <div class="services-menu" v-if="openBoardServicesOptionsMenu">
            <div @click.stop="openServiceModal()">
              <span> Editar régimen </span>
            </div>
            <div @click.stop="deleteBoardService()">
              <span> Eliminar régimen </span>
            </div>
          </div>
        </transition>
      </div>
      <div
        v-for="(boardService, indexBoardService) in boardServices"
        :key="boardService.id"
        class="service-container-inner"
      >
        <div
          class="service"
          @click="
            toggleBoardServiceLines[indexBoardService] = !toggleBoardServiceLines[indexBoardService]
          "
        >
          <div class="service-left">
            <img
              src="/app-images/arrow_forward_ios.svg"
              :class="toggleBoardServiceLines[indexBoardService] ? 'rotate-dropdown' : ''"
            />
            <span class="service-name">
              {{ boardService.name }}
            </span>
            <span class="service-qty">
              {{ boardService.quantity }} unidad{{ (boardService.quantity ?? 1) > 1 ? 'es' : '' }}
            </span>
          </div>
          <div class="service-right">
            <span> {{ boardService.priceTotal?.toFixed(2) }} € </span>
          </div>
        </div>
        <Transition name="accordion-transition">
          <div v-show="toggleBoardServiceLines[indexBoardService]">
            <div v-for="(serviceLine, index) in boardService.serviceLines" :key="serviceLine.id">
              <TransitionGroup name="accordion-transition">
                <div
                  v-if="index <= 2 || (showAllBoardServices[indexBoardService] && index > 2)"
                  class="service-grid"
                >
                  <span class="">
                    {{ serviceLineDate(serviceLine.date) }}
                  </span>
                  <span>
                    {{ serviceLine.quantity }} {{ serviceLine.quantity === 1 ? 'ud' : 'uds' }}.
                  </span>
                  <span> {{ serviceLine.priceUnit.toFixed(2) }} €/ud. </span>
                  <span v-if="serviceLine.discount"> -{{ serviceLine.discount }} % </span>
                  <div v-else />
                  <span> {{ (serviceLine.quantity * serviceLine.priceUnit).toFixed(2) }} € </span>
                </div>
                <hr
                  v-if="
                    index !== boardService.serviceLines.length - 1 &&
                    (index <= 2 || (showAllBoardServices[indexBoardService] && index > 2))
                  "
                />
              </TransitionGroup>
            </div>
            <div v-if="boardService.serviceLines.length > 3" class="show-more">
              <img
                src="/app-images/arrow_forward_ios.svg"
                :class="showAllBoardServices[indexBoardService] ? 'rotate-dropdown' : ''"
                @click="toggleShowAllBoardServices(indexBoardService)"
              />
              <span class="span-hover" @click="toggleShowAllBoardServices(indexBoardService)">
                <span v-if="showAllBoardServices[indexBoardService]">
                  Ver {{ boardService.serviceLines.length - 3 }} menos
                </span>
                <span v-if="!showAllBoardServices[indexBoardService]">
                  Ver {{ boardService.serviceLines.length - 3 }} más
                </span>
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <div v-else>
      <span class="no-board-service"> Sin régimen incluido </span>
    </div>
    <div class="data-service-first-row">
      <div class="left">
        <img src="/app-images/icon-shopping-cart.svg" />
        <span> Servicios adicionales </span>
      </div>
      <div class="right">
        <div class="btn-search-mobile" @click="openServiceDrawer()">Añadir servicio</div>
      </div>
    </div>
    <div class="search-container">
      <div class="search-services">
        <AutocompleteComponent
          id="partners-autocomplete"
          icon="search"
          v-model="selectedProductId"
          :items="itemsAutocompleteServices"
          placeholderShowingOptions="Buscar servicios adicionales"
          placeholderValue="Buscar servicios adicionales"
          :minChars="0"
          :maxHeight="150"
          :keepResultAfterChoose="true"
          :showAddNewOption="false"
          inputColorText="primary"
        >
          <template #icon>
            <img src="/app-images/search.svg" />
          </template>
        </AutocompleteComponent>
      </div>
      <div class="btn-search" v-if="selectedProductId !== 0" @click="addService(selectedProductId)">
        <span> Añadir servicio </span>
      </div>
    </div>
    <div class="extra-service-container" v-if="services.length > 0">
      <div
        v-for="(service, indexServices) in services"
        :key="service.id"
        class="extra-service-container-inner"
      >
        <div
          class="extra-service-title"
          :class="!toggleServiceLines[indexServices] ? 'extra-service-title-rounded' : ''"
          @click="toggleServiceLines[indexServices] = !toggleServiceLines[indexServices]"
        >
          <div class="extra-service-left">
            <img
              src="/app-images/arrow_forward_ios.svg"
              :class="toggleServiceLines[indexServices] ? 'rotate-dropdown' : ''"
            />
            <span class="service-name">
              {{ service.name }}
            </span>
            <span class="extra-service-qty">
              {{ service.quantity }} unidad{{ (service.quantity ?? 1) > 1 ? 'es' : '' }}
            </span>
          </div>
          <div class="extra-service-right">
            <span class="extra-service-amount"> {{ service.priceTotal?.toFixed(2) }} € </span>
            <img
              class="three-dots"
              src="/app-images/three-dots-blue.svg"
              @click.stop="
                openServicesOptionsMenu[indexServices] = !openServicesOptionsMenu[indexServices]
              "
              @blur="openServicesOptionsMenu[indexServices] = false"
              tabindex="1"
            />
          </div>
          <transition name="menu-services">
            <div class="services-menu" v-if="openServicesOptionsMenu[indexServices]">
              <div @click.stop="openServiceCalendarMode(indexServices)">
                <span> Editar servicio </span>
              </div>
              <div v-if="service.id" @click.stop="deleteService(service.id, indexServices)">
                <span> Eliminar servicio </span>
              </div>
            </div>
          </transition>
        </div>
        <Transition name="accordion-transition">
          <div v-if="toggleServiceLines[indexServices]">
            <div v-for="(serviceLine, index) in service.serviceLines" :key="serviceLine.id">
              <TransitionGroup name="accordion-transition">
                <div
                  class="service-grid"
                  v-if="index <= 2 || (showAllServices[indexServices] && index > 2)"
                >
                  <span>
                    {{ serviceLineDate(serviceLine.date) }}
                  </span>
                  <span>
                    {{ serviceLine.quantity }} ud{{ serviceLine.quantity > 1 ? 's' : '' }}.
                  </span>
                  <span> {{ serviceLine.priceUnit.toFixed(2) }} €/ud. </span>
                  <span v-if="serviceLine.discount"> -{{ serviceLine.discount }} % </span>
                  <div v-else />
                  <span> {{ priceTotalServices(serviceLine).toFixed(2) }} € </span>
                </div>
                <hr
                  v-if="
                    index !== service.serviceLines.length - 1 &&
                    (index <= 2 || (showAllServices[indexServices] && index > 2))
                  "
                />
              </TransitionGroup>
            </div>
            <div v-if="service.serviceLines.length > 3" class="show-more">
              <img
                src="/app-images/arrow_forward_ios.svg"
                :class="showAllServices[indexServices] ? 'rotate-dropdown' : ''"
                @click="toggleShowAllServices(indexServices)"
              />
              <span class="span-hover" @click="toggleShowAllServices(indexServices)">
                <span v-if="showAllServices[indexServices]">
                  Ver {{ service.serviceLines.length - 3 }} menos
                </span>
                <span v-if="!showAllServices[indexServices]">
                  Ver {{ service.serviceLines.length - 3 }} más
                </span>
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <div v-else>
      <span class="no-service"> Sin servicios adicionales </span>
    </div>
  </div>
  <Transition name="right-drawer-transition">
    <div class="search-mobile" v-if="isSearchServiceOpen">
      <AutocompleteMobile
        v-model="selectedMobileProductId"
        :items="itemsAutocompleteServices"
        placeholder="Buscar servicios adicionales"
      />
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, type Ref, watch, markRaw } from 'vue';
import type { ServiceInterface } from '@/_legacy/interfaces/ServiceInterface';
import type { ServiceLineInterface } from '@/_legacy/interfaces/ServiceLineInterface';
import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import ReservationServiceChanges from '@/_legacy/components/reservations/ReservationServiceChanges.vue';
import { useStore } from '@/_legacy/store';

import utilsDates from '@/_legacy/utils/dates';
import AutocompleteMobile from '@/_legacy/components/roomdooComponents/AutocompleteMobile.vue';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    AutocompleteComponent,
    AutocompleteMobile,
    CustomIcon,
  },

  setup() {
    const store = useStore();

    const services: Ref<ServiceInterface[]> = ref([]);
    const calendarDatesByService = ref([] as ServiceLineInterface[]);
    const selectedProductId = ref(0);
    const selectedMobileProductId = ref(0);
    const searchService = ref('');
    const changeServicesModal = ref(false);
    const openBoardServicesOptionsMenu = ref(false);
    const openServicesOptionsMenu = ref([] as boolean[]);
    const openDeleteBoardServiceModal = ref(false);
    const openDeleteServiceModal = ref([] as boolean[]);
    const toggleBoardServiceLines = ref([] as boolean[]);
    const toggleServiceLines = ref([] as boolean[]);
    const showAllBoardServices = ref([] as boolean[]);
    const showAllServices = ref([] as boolean[]);
    const isSearchServiceOpen = ref(false);
    const serviceIndex = ref(-1);
    const isReservationBlockedModalOpen = ref(false);

    const currentReservation = computed(() => store.state.reservations.currentReservation);

    const itemsAutocompleteServices = computed(() =>
      store.state.products.products.map((el) => ({ value: el.id, name: el.name }))
    );

    const boardServices = computed(() =>
      store.state.services.services.filter((service) => service.isBoardService)
    );

    const reservationServices = computed(() =>
      store.state.services.services.filter((service) => !service.isBoardService)
    );

    const agencyName = computed(
      () =>
        store.state.agencies.agencies.find((el) => el.id === currentReservation.value?.agencyId)
          ?.name
    );

    const boardServiceAmountTotal = () => {
      let total = 0;
      boardServices.value.forEach((service) => {
        total += service.priceTotal || 0;
      });
      return total;
    };

    const boardServiceName = () =>
      store.state.boardServices.boardServices.find(
        (el) => el.id === currentReservation.value?.boardServiceId
      )?.name;

    const getDayOfWeek = (date: Date) => {
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const dayIndex = date.getDay();
      return daysOfWeek[dayIndex];
    };

    const getMonthName = (date: Date) => {
      const months = [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ];
      const monthIndex = date.getMonth();
      return months[monthIndex];
    };

    const serviceLineDate = (dateString: string | Date) => {
      const date = new Date(dateString);
      const dayOfWeek = getDayOfWeek(date);
      const dayOfMonth = date.getDate();
      const month = getMonthName(date);
      return `${dayOfWeek}, ${dayOfMonth} de ${month}`;
    };

    const priceTotalServices = (serviceLine: ServiceLineInterface) => {
      let result = 0;
      const priceTotal = serviceLine.quantity * serviceLine.priceUnit;
      result = priceTotal - priceTotal * (serviceLine.discount / 100);
      return result;
    };

    const priceByDate = (date: Date) =>
      store.state.prices.prices.find((el) => el.date.getTime() === date.getTime());

    const addService = async (productId: number) => {
      void store.dispatch('layout/showSpinner', true);
      const product = store.state.products.products.find((el) => el.id === productId);
      let quantity = 1;
      let priceUnit = 0;

      if (product?.perPerson) {
        quantity = currentReservation.value?.adults ?? 0;
      }

      const items: ServiceLineInterface[] = [];

      if (product?.perDay) {
        await store.dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId: currentReservation.value?.pricelistId,
          productId,
          dateFrom: new Date(currentReservation.value?.checkin || 0),
          dateTo: new Date(currentReservation.value?.checkout || 0),
        });

        const startDate = new Date(currentReservation.value?.checkin || 0);
        const endDate = new Date(currentReservation.value?.checkout || 0);
        endDate.setDate(endDate.getDate() - 1);

        utilsDates.getDatesRange(startDate, endDate).forEach((date) => {
          priceUnit = priceByDate(new Date(date))?.price ?? 0;
          let serviceLine;
          if (product.consumedOn === 'before') {
            serviceLine = {
              priceUnit,
              date,
              quantity,
            };
          } else {
            date.setDate(date.getDate() + 1);
            priceUnit = priceByDate(new Date(date))?.price ?? 0;
            serviceLine = {
              priceUnit,
              date,
              quantity,
            };
          }
          items.push(serviceLine as ServiceLineInterface);
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await store.dispatch('prices/fetchPrices', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          pricelistId: currentReservation.value?.pricelistId,
          productId,
          dateFrom: today,
          dateTo: today,
        });
        items.push({
          priceUnit: priceByDate(today)?.price ?? 0,
          date: today,
          quantity,
          discount: 0,
        });
      }
      await store.dispatch('services/createService', {
        productId,
        reservationId: currentReservation.value?.id,
        serviceLines: items,
      });
      await Promise.all([
        store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id),
        store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
        store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id),
        store.dispatch('services/fetchServices', currentReservation.value?.id),
      ]);
      selectedProductId.value = 0;
      selectedMobileProductId.value = 0;
      void store.dispatch('layout/showSpinner', false);
    };

    const deleteBoardService = async () => {
      dialogService.open({
        header: 'Eliminar régimen',
        content: 'Estás a punto de eliminar este régimen. ¿Estás seguro?',
        btnAccept: 'Borrar',
        btnCancel: 'Cancelar',
        onAccept: async () => {
          void store.dispatch('layout/showSpinner', true);
          await store.dispatch('reservations/updateReservation', {
            reservationId: currentReservation.value?.id,
            boardServiceId: 0,
          });
          await Promise.all([
            store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id),
            store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
            store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id),
            store.dispatch('services/fetchServices', currentReservation.value?.id),
          ]);
          openDeleteBoardServiceModal.value = false;
          void store.dispatch('layout/showSpinner', false);
        },
      });
    };

    const deleteService = async (serviceId: number, indexService: number) => {
      dialogService.open({
        header: 'Eliminar servicio',
        content: 'Estás a punto de eliminar este servicio. ¿Estás seguro?',
        btnAccept: 'Borrar',
        btnCancel: 'Cancelar',
        onAccept: async () => {
          void store.dispatch('layout/showSpinner', true);
          await store.dispatch('services/deleteService', serviceId);
          await Promise.all([
            store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id),
            store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
            store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id),
            store.dispatch('services/fetchServices', currentReservation.value?.id),
          ]);
          openDeleteServiceModal.value[indexService] = false;
          void store.dispatch('layout/showSpinner', false);
        },
      });
    };

    const openServiceCalendarMode = (indexService: number) => {
      serviceIndex.value = indexService;
      changeServicesModal.value = true;
      dialogService.open({
        header: 'SERVICIOS',
        content: markRaw(ReservationServiceChanges),
        props: {
          serviceIndex,
        },
      });
      setTimeout(() => {
        serviceIndex.value = -1;
      }, 1);
    };
    const toggleShowAllBoardServices = (index: number) => {
      showAllBoardServices.value[index] = !showAllBoardServices.value[index];
    };
    const toggleShowAllServices = (index: number) => {
      showAllServices.value[index] = !showAllServices.value[index];
    };

    const openServiceDrawer = () => {
      isSearchServiceOpen.value = true;
      searchService.value = '';
    };

    const openServiceModal = () => {
      if (currentReservation.value?.isBlocked) {
        isReservationBlockedModalOpen.value = true;
        dialogService.open({
          iconHeader: '/app-images/icon-lock.svg',
          header: 'Reserva bloqueada',
          content: 'No es posible modificar el régimen de esta reserva',
          btnAccept: 'Ok',
        });
      } else {
        changeServicesModal.value = true;
        dialogService.open({
          header: 'SERVICIOS',
          content: markRaw(ReservationServiceChanges),
          props: {
            serviceIndex,
          },
        });
      }
    };

    watch(reservationServices, () => {
      services.value = reservationServices.value;
      toggleServiceLines.value = services.value.map(() => true);
    });

    watch(boardServices, () => {
      toggleBoardServiceLines.value = boardServices.value.map(() => true);
    });

    watch(selectedMobileProductId, async () => {
      if (selectedMobileProductId.value !== 0) {
        await addService(selectedMobileProductId.value);
        isSearchServiceOpen.value = false;
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch(
        'services/fetchServices',
        store.state.reservations.currentReservation?.id
      );
      void store.dispatch('layout/showSpinner', false);
      services.value = reservationServices.value;
      openServicesOptionsMenu.value = services.value.map(() => false);
      openDeleteServiceModal.value = services.value.map(() => false);
      toggleBoardServiceLines.value = boardServices.value.map(() => true);
      toggleServiceLines.value = services.value.map(() => true);
      showAllBoardServices.value = boardServices.value.map(() => false);
      showAllServices.value = services.value.map(() => false);
    });

    return {
      boardServices,
      services,
      reservationServices,
      currentReservation,
      selectedProductId,
      selectedMobileProductId,
      itemsAutocompleteServices,
      calendarDatesByService,
      changeServicesModal,
      openBoardServicesOptionsMenu,
      openDeleteBoardServiceModal,
      openServicesOptionsMenu,
      openDeleteServiceModal,
      toggleBoardServiceLines,
      toggleServiceLines,
      showAllBoardServices,
      showAllServices,
      isSearchServiceOpen,
      searchService,
      serviceIndex,
      isReservationBlockedModalOpen,
      agencyName,
      openServiceCalendarMode,
      boardServiceAmountTotal,
      boardServiceName,
      serviceLineDate,
      priceTotalServices,
      addService,
      deleteBoardService,
      deleteService,
      toggleShowAllBoardServices,
      toggleShowAllServices,
      openServiceDrawer,
      openServiceModal,
    };
  },
});
</script>
<style scoped lang="scss">
.reservation-services-container {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  .data-service-first-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1rem 0.8rem 1rem;
    font-weight: bold;
    .left {
      display: flex;
      align-items: center;
      font-weight: bold;
      img {
        margin-right: 0.5rem;
        width: 18px;
        height: 18px;
      }
    }
    .right-link {
      display: flex;
      align-items: center;
      color: $call_to_action_color;
      font-weight: 600;
      height: 30px;
      cursor: pointer;
      padding-right: 0.5rem;
      img {
        margin-right: 10px;
        width: 20px;
        height: 18px;
      }
      .link-title {
        margin-left: 0.2rem;
      }
    }
    .right {
      .btn-search-mobile {
        margin-right: 0.5rem;
        background-color: $call_to_action_color;
        color: white;
        border-radius: 5px;
        padding: 6px 10px;
        font-weight: bold;
      }
    }
  }
  .service-container {
    background-color: #faf8f8ab;
    margin: 0 1rem;
    border-radius: 10px;
    padding-bottom: 0.5rem;
    .service-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0 5px 13px;
      background-color: #f0fcff;
      border-radius: 10px 10px 0px 0px;
      position: relative;
      font-weight: bold;
      .service-title-right {
        display: flex;
        align-items: center;
        justify-content: center;
        .service-amount {
          color: white;
          background-color: #263941;
          padding: 0 0.5rem;
          border-radius: 15px;
          font-weight: bold;
        }
        .three-dots {
          cursor: pointer;
          width: 25px;
          height: 25px;
        }
      }
      .services-menu {
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
        right: 20px;
        cursor: pointer;
        padding: 0.2rem 0;
        div {
          padding: 0.3rem 1rem;
          &:hover {
            font-weight: bold;
          }
        }
      }
    }
    .service-container-inner {
      margin-top: 1rem;

      .service {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 13px;
        padding-right: 6px;
        font-size: 0.75rem;
        cursor: pointer;
        .service-left {
          display: flex;
          align-items: center;
          img {
            margin-right: 0.5rem;
            width: 14px;
            height: 14px;
            transition: transform 0.2s ease;
          }
          .rotate-dropdown {
            transform: rotate(180deg);
            transition: transform 0.2s ease;
          }
          .service-name {
            font-weight: bold;
          }
          .service-qty {
            background-color: #eaeaea;
            border-radius: 15px;
            padding: 0.15rem 0.75rem;
            margin-left: 0.75rem;
          }
        }
        .service-right {
          span {
            background-color: #eaeaea;
            border-radius: 15px;
            padding: 0.15rem 0.75rem;
          }
        }
      }
      .service-grid {
        display: grid;
        font-size: 0.75rem;
        grid-template-columns: 3fr 2fr 2fr 2fr 2fr;
        grid-auto-rows: auto;
        justify-items: center;
        align-items: center;
        margin-left: 1rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        span:nth-child(1) {
          justify-self: start;
        }
        span:nth-child(5) {
          justify-self: end;
          margin-right: 1rem;
        }
      }
      .service-line {
        display: flex;
        justify-content: space-between;
        padding: 0 1.3rem;
      }
      hr {
        border: none;
        height: 1px;
        background-color: #e1e0e0;
      }
      .services-menu {
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
        right: 20px;
        cursor: pointer;
        padding: 0.2rem 0;
        div {
          padding: 0.3rem 1rem;
          &:hover {
            font-weight: bold;
          }
        }
      }
      .show-more {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        padding: 0.75rem 0 1rem 0;
        img {
          cursor: pointer;
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }
        .span-hover {
          margin-left: 0.5rem;
          cursor: pointer;
        }
        .rotate-dropdown {
          transform: rotate(180deg);
          transition: transform 0.2s ease;
        }
      }
    }
  }
  .search-container {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 1rem;
    .search-services {
      font-size: 14px;
      width: 65%;
      height: 40px;
    }
  }
}

.extra-service-container {
  margin: 0 1rem;
  .extra-service-container-inner {
    border-radius: 10px;
    background-color: #faf8f8ab;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    .service {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 13px;
      cursor: pointer;
      .service-left {
        display: flex;
        align-items: center;
        img {
          margin-right: 0.5rem;
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }
        .rotate-dropdown {
          transform: rotate(180deg);
          transition: transform 0.2s ease;
        }
        .service-qty {
          background-color: #eaeaea;
          border-radius: 15px;
          padding: 0 0.75rem;
          margin-left: 0.75rem;
        }
        .service-name {
          font-weight: bold;
        }
      }
      .service-right {
        span {
          background-color: #eaeaea;
          border-radius: 15px;
          padding: 0.15rem 0.75rem;
        }
      }
    }
    .service-grid {
      font-size: 0.75rem;
      display: grid;
      grid-template-columns: 3fr 2fr 2fr 2fr 2fr;
      grid-auto-rows: auto;
      justify-items: center;
      align-items: center;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      span:nth-child(1) {
        justify-self: start;
      }
      span:nth-child(5) {
        justify-self: end;
        margin-right: 1rem;
      }
    }
    hr {
      border: none;
      height: 1px;
      background-color: #e1e0e0;
      width: 100%;
    }
    .services-menu {
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
      right: 20px;
      cursor: pointer;
      padding: 0.2rem 0;
      div {
        padding: 0.3rem 1rem;
        &:hover {
          font-weight: bold;
        }
      }
    }
    .show-more {
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      padding: 0.75rem 0 1rem 0;
      img {
        cursor: pointer;
        width: 14px;
        height: 14px;
        transition: transform 0.2s ease;
      }
      .span-hover {
        margin-left: 0.5rem;
        cursor: pointer;
      }
      .rotate-dropdown {
        transform: rotate(180deg);
        transition: transform 0.2s ease;
      }
    }
  }
  .extra-service-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0 5px 13px;
    background-color: #f0fcff;
    border-radius: 10px 10px 0px 0px;
    position: relative;
    margin-bottom: 0.5rem;
    cursor: pointer;
    width: 100%;
    font-size: 0.75rem;
    .extra-service-left {
      display: flex;
      align-items: center;
      width: 70%;
      img {
        margin-right: 0.5rem;
        width: 14px;
        height: 14px;
        transition: transform 0.2s ease;
      }
      .rotate-dropdown {
        transform: rotate(180deg);
        transition: transform 0.2s ease;
      }
      .extra-service-qty {
        background-color: #eaeaea;
        border-radius: 15px;
        padding: 0.1rem 0.7rem;
        margin-left: 0.75rem;
      }
      .service-name {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 50%;
      }
    }
    .extra-service-right {
      width: 30%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .extra-service-amount {
        color: white;
        background-color: #263941;
        padding: 0 0.5rem;
        border-radius: 15px;
        font-weight: bold;
      }
      .three-dots {
        cursor: pointer;
        width: 25px;
        height: 25px;
      }
    }
  }
  .extra-service-title-rounded {
    border-radius: 10px;
  }
}
.no-board-service {
  margin-left: 2rem;
  color: #848484;
  margin-top: 1rem;
}

.no-service {
  margin-left: 2rem;
  color: #848484;
}

.search-mobile {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 5;

  .search {
    padding: 1rem 1rem 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);

    .left {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      img {
        width: 15px;
        height: 15px;
        margin-right: 1rem;
      }
      input {
        width: 100%;
        outline: 0;
        border: 0;
        font-size: 18px;
      }
    }
    .right {
      .select-property-mobile {
        width: 35px;
        height: 35px;
        .property-image {
          border-radius: 50%;
          font-weight: bold;
          font-size: 1.3rem;
          display: flex;
          height: 100%;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          background-color: aquamarine;
        }
      }
    }
  }
  .options {
    padding-top: 1.3rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    margin-left: 0.5rem;
    max-height: calc(100% - 80px);
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    .option {
      border-bottom: 1px solid lightgray;
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      .logo {
        border-radius: 50%;
        font-weight: bold;
        display: flex;
        height: 32px;
        width: 32px;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        background-color: aquamarine;
        margin-right: 1rem;
      }
      .name {
        font-size: 18px;
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
  .reservation-services-container {
    font-size: 14px;
    margin: 0 0.7rem;
    .data-service-first-row {
      .left {
        img {
          width: 20px;
          height: 20px;
        }
      }
      .btn-search-mobile {
        display: none;
      }
    }

    .service-container {
      .service-container-inner {
        .service {
          padding: 0 13px;
          font-size: 1rem;
          .service-left {
            img {
              width: 14px;
              height: 14px;
              margin-right: 1rem;
            }
            .service-name {
              margin-right: 1rem;
              font-weight: bold;
            }
          }
        }
        .service-grid {
          font-size: 1rem;
          grid-template-columns: 2fr 2fr 2fr 2fr 2fr;
          margin: 0 1.5rem 0 1rem;
          span:nth-child(5) {
            margin: 0;
          }
        }
      }
    }
    .extra-service-container {
      .extra-service-container-inner {
        .extra-service-title {
          font-size: 1rem;
          .extra-service-left {
            .service-name {
              font-weight: bold;
            }
            img {
              width: 14px;
              height: 14px;
            }
          }
        }
        .service-grid {
          font-size: 1rem;
          grid-template-columns: 2fr 2fr 2fr 2fr 2fr;
          margin: 0 1.5rem 0 1rem;
          span:nth-child(5) {
            margin: 0;
          }
        }
      }
    }
    .search-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      margin-bottom: 1rem;
      .search-services {
        width: 65%;
        height: 40px;
        font-size: 14px;
      }
      .btn-search {
        height: 31px;
        width: 150px;
        background-color: $call_to_action_color;
        color: white;
        border-radius: 5px;
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }
  }
  .show-more {
    font-weight: bold;
    img {
      width: 14px !important;
      height: 14px !important;
    }
  }
}
.menu-services-enter-active,
.menu-services-leave-active {
  transition: all 0.2s ease-in-out;
}
.menu-services-enter-from,
.menu-services-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
.delete-board-service-modal {
  .delete-board-service-title {
    padding: 0.5rem 1rem;
  }
  .delete-board-service-body {
    padding: 0.5rem 1rem;
  }
  .delete-board-service-buttons {
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

.right-drawer-transition-enter-active,
.right-drawer-transition-leave-active {
  transition: all 0.5s;
}
.right-drawer-transition-enter-to,
.right-drawer-transition-leave-from {
  transform: translateX(0);
}
.right-drawer-transition-enter-from,
.right-drawer-transition-leave-to {
  transform: translateX(100%);
}
</style>
