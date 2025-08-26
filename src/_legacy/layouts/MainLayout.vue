<template>
  <div class="layout-container" v-if="activeUser && activeProperty">
    <Sidebar :menuOpen="isMenuOpen" />
    <div class="overlay" @click="closeLeftDrawer" v-if="leftDrawerExpanded" />
    <div class="main-container" :class="rightDrawerExpanded ? 'main-container-shrinked' : ''">
      <router-view @openLeftDrawer="openLeftDrawer()" />
    </div>
    <div class="button-open-drawer" @click="openFolioList" v-if="route.name === 'planning'">
      <img src="/app-images/icon-menu.svg" class="arrow-left-img" />
    </div>
  </div>
  <Transition name="right-drawer-transition">
    <div class="right-drawer" id="right-drawer" v-if="rightDrawerExpanded">
      <div class="button-close-drawer" @click="closeRightDrawer">
        <img src="/app-images/icon-menu.svg" class="arrow-right-img" />
      </div>
      <BookingEngine v-if="currentRightDrawerView === 'NewFolioStep1'" />
      <FoliosList
        v-else-if="currentRightDrawerView === 'FolioList' && isRightDrawer"
        @moveToFirstReservation="moveToFirstReservation()"
      />
      <FolioComponent
        v-else-if="currentRightDrawerView === 'FolioDetail' && currentFolio"
        @moveToReservation="moveToReservation()"
      />
      <AutocompleteMobile
        v-if="currentRightDrawerView === 'PropertySelector'"
        v-model="selectedPropertyId"
        :items="
          sortedProperties.map((el) => ({
            value: el?.id ?? 0,
            name: el?.name ?? '',
            logo: el.hotelImageUrl ?? '',
          }))
        "
        placeholder="Buscar propiedad"
        :logoSelectedOption="initialsSelectedProperty()"
        showLogoOptions
      />
      <PartnerDetail v-else-if="currentRightDrawerView === 'PartnerDetail'" />
      <TransactionDetailMobile v-else-if="currentRightDrawerView === 'TransactionDetailMobile'" />
    </div>
  </Transition>
  <Spinner :show="showSpinner" />
  <div>
    <UserSettingsModal v-if="showUserSettingsModal" @close="showUserSettingsModal = false" />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  defineAsyncComponent,
  computed,
  ref,
  watch,
  onUnmounted,
  provide,
  onMounted,
  onBeforeMount,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/_legacy/store';
import Sidebar from '@/ui/components/sidebar/Sidebar.vue';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

const BookingEngine = defineAsyncComponent(
  () => import('@/_legacy/components/bookingEngine/BookingEngine.vue')
);
const FoliosList = defineAsyncComponent(() => import('@/_legacy/components/folios/FoliosList.vue'));
const FolioComponent = defineAsyncComponent(
  () => import('@/_legacy/components/folios/FolioComponent.vue')
);
const PartnerDetail = defineAsyncComponent(
  () => import('@/_legacy/components/partners/PartnerDetail.vue')
);
const AutocompleteMobile = defineAsyncComponent(
  () => import('@/_legacy/components/roomdooComponents/AutocompleteMobile.vue')
);
const TransactionDetailMobile = defineAsyncComponent(
  () => import('@/_legacy/components/transactions/TransactionDetailMobile.vue')
);
const UserSettingsModal = defineAsyncComponent(
  () => import('@/_legacy/components/users/UserSettings.vue')
);

import LeftDrawerSlide from '@/_legacy/components/leftDrawer/LeftDrawerSlide.vue';
import LeftDrawerFixed from '@/_legacy/components/leftDrawer/LeftDrawerFixed.vue';
import Spinner from '@/_legacy/components/roomdooComponents/SpinnerComponent.vue';

export default defineComponent({
  components: {
    UserSettingsModal,
    LeftDrawerSlide,
    LeftDrawerFixed,
    BookingEngine,
    FoliosList,
    FolioComponent,
    PartnerDetail,
    AutocompleteMobile,
    TransactionDetailMobile,
    Spinner,
    Sidebar,
  },
  emits: ['moveToReservation'],
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const showUserSettingsModal = ref(false);
    const peformShowUserSettingsModal = () => {
      showUserSettingsModal.value = true;
      void store.dispatch('layout/leftDrawerDisplayed', false);
    };
    let timeoutId: null | ReturnType<typeof setTimeout> = null;

    const selectedPropertyId = ref(0);
    const isRightDrawer = ref(false);
    const isPricelistExpanded = ref(false);
    const isMoveToReservation = ref(false);
    const isMoveToFirstReservation = ref(false);
    const isMenuOpen = ref(false);
    provide('moveToReservation', isMoveToReservation);
    provide('moveToFirstReservation', isMoveToFirstReservation);
    provide('selectedPropertyIdFromRightSelector', selectedPropertyId);

    const activeUser = computed(() => store.state.user.activeUser);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activePricelist = computed(() => store.state.pricelists.activePricelist);
    const rightDrawerExpanded = computed(() => store.state.layout.rightDrawerExpanded);
    const leftDrawerExpanded = computed(() => store.state.layout.leftDrawerExpanded);
    const currentRightDrawerView = computed(() => store.state.layout.showing);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const pricelistPlanningExpanded = computed(() => store.state.layout.pricelistPlanningExpanded);
    const showSpinner = computed(() => store.state.layout.showSpinner);

    const sortedProperties = computed(() => {
      const result = store.state.properties.properties.filter(
        (el) => el.id !== activeUser.value?.defaultPropertyId
      );
      const defaultProperty = store.state.properties.properties.find(
        (el) => el.id === activeUser.value?.defaultPropertyId
      );
      if (defaultProperty) {
        result.unshift(defaultProperty);
      }
      return result;
    });

    const activeAvailabilityPlan = computed(
      () => store.state.availabilityPlans.activeAvailabilityPlan
    );

    const closeRightDrawer = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
      void store.dispatch('reservations/setCurrentReservation', null);
      void store.dispatch('reservations/setCurrentReservations', null);
      void store.dispatch('folios/setCurrentFolio', null);
      void store.dispatch('partners/setCurrentPartner', null);
    };

    const initialsSelectedProperty = () => {
      let result = '';
      if (activeProperty.value && activeProperty.value.name) {
        result = activeProperty.value.name?.split(' ')[0][0].toUpperCase();
        if (activeProperty.value.name?.split(' ').length > 1) {
          result += activeProperty.value.name?.split(' ')[1][0].toUpperCase();
        }
      }
      return result;
    };
    const closeLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', false);
      isMenuOpen.value = false;
    };

    const openFolioList = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'FolioList');
      void store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const toggleFolioList = async () => {
      if (store.state.folios.lastFolioFilters) {
        await store.dispatch('folios/setLastFolioFilters', null);
      }
      isRightDrawer.value = !isRightDrawer.value;
      void store.dispatch('layout/rightDrawerDisplayed', isRightDrawer.value);
      void store.dispatch('layout/changeRightDrawerContent', 'FolioList');
    };

    const leftDrawerToggleHover = (value: boolean) => {
      void store.dispatch('layout/leftDrawerHovered', value);
    };

    const moveToReservation = () => {
      isMoveToReservation.value = true;
    };

    const moveToFirstReservation = () => {
      isMoveToFirstReservation.value = true;
    };

    const openLeftDrawer = () => {
      isMenuOpen.value = !isMenuOpen.value;
      // void store.dispatch('layout/leftDrawerDisplayed', isMenuOpen.value);
    };

    watch(pricelistPlanningExpanded, (value) => {
      if (value) {
        isRightDrawer.value = false;
        void store.dispatch('layout/rightDrawerDisplayed', false);
        void store.dispatch('reservations/setCurrentReservation', null);
        void store.dispatch('layout/changeRightDrawerContent', 'FolioList');
      }
    });

    watch(rightDrawerExpanded, (value) => {
      if (value) {
        isRightDrawer.value = true;
      } else {
        isRightDrawer.value = false;
        void store.dispatch('layout/setRightDrawerSearchParam', '');
      }
    });

    watch(selectedPropertyId, () => {
      if (selectedPropertyId.value !== activeProperty.value?.id && selectedPropertyId.value !== 0) {
        let path = `/${selectedPropertyId.value}`;
        if (route.name === 'transactions') {
          void store.dispatch('properties/setActiveProperty', selectedPropertyId.value);
          path = `/transactions/${selectedPropertyId.value}`;
        }
        void router.push(path);
        void store.dispatch('layout/rightDrawerDisplayed', false);
        void store.dispatch('layout/changeRightDrawerContent', 'FoliosList');
      }
    });

    onBeforeMount(async () => {
      if (!store.state.user.activeUser) {
        await store.dispatch('user/recoverCookies');
      }
      if (!activeUser.value) {
        router.push({
          name: 'login',
          params: { pmsPropertyId: route.params.pmsPropertyId },
        });
        return;
      }

      await store.dispatch('properties/fetchProperties');
      if (
        route.params.pmsPropertyId &&
        !store.state.properties.properties.find(
          (el) => el.id === parseInt(route.params.pmsPropertyId as string, 10)
        )
      ) {
        await router.push('/404');
        void store.dispatch('layout/showSpinner', false);
        return;
      }

      if (route.params.pmsPropertyId) {
        await store.dispatch(
          'properties/setActiveProperty',
          parseInt(route.params.pmsPropertyId as string, 10)
        );
      } else {
        await store.dispatch('properties/setActiveProperty', activeUser.value?.defaultPropertyId);
      }
      await pmsPropertiesStore.fetchPmsProperties();
      const pmsPropertyId = route.params.pmsPropertyId as string;
      if (pmsPropertyId) pmsPropertiesStore.setCurrentPmsPropertyId(parseInt(pmsPropertyId));
    });

    onMounted(() => {
      selectedPropertyId.value = activeProperty.value?.id || 0;
      timeoutId = setInterval(() => {
        void store.dispatch(
          'notifications/fetchNotificationsReservationsToAssign',
          activeProperty.value?.id
        );
      }, 60000);
    });

    onUnmounted(() => {
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    });

    return {
      showUserSettingsModal,
      peformShowUserSettingsModal,
      closeRightDrawer,
      rightDrawerExpanded,
      leftDrawerExpanded,
      closeLeftDrawer,
      openFolioList,
      moveToReservation,
      currentRightDrawerView,
      isRightDrawer,
      currentFolio,
      currentReservation,
      currentReservations,
      activeProperty,
      activeUser,
      toggleFolioList,
      leftDrawerToggleHover,
      sortedProperties,
      selectedPropertyId,
      initialsSelectedProperty,
      route,
      isPricelistExpanded,
      moveToFirstReservation,
      activePricelist,
      activeAvailabilityPlan,
      showSpinner,
      isMenuOpen,
      openLeftDrawer,
    };
  },
});
</script>
<style lang="scss" scoped>
.left-drawer {
  z-index: 100;
}
.layout-container {
  overflow-y: hidden;
  display: flex;
  .left-drawer-fixed {
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
    z-index: 100;
    background-color: white;
    margin: 0.5rem 0 0.5rem 0.5rem;
    height: 96svh;
    border-radius: 18px;
    margin-top: 15px;
  }

  .main-container {
    height: 100svh;
    width: 100%;
    transition: width 0.8s ease;
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
  }

  .button-open-drawer {
    display: none;
    height: 40px;
    width: 40px;
    background-color: $call_to_action_color;
    position: absolute;
    z-index: 3;
    right: 0;
    top: 15px;
    justify-content: center;
    align-items: center;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
  }
}
.button-close-drawer {
  display: none;
  height: 40px;
  width: 40px;
  background-color: $call_to_action_color;
  position: absolute;
  z-index: 3;
  top: 15px;
  left: -20px;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  filter: drop-shadow(0px 4px 14px rgba(0, 0, 0, 0.2));
}

.arrow-left-img {
  user-select: none;
}
.arrow-right-img {
  user-select: none;
  transform: rotate(180deg);
}
.overlay {
  position: absolute;
  height: 100vh;
  width: 100%;
  background-color: black;
  opacity: 0.3;
  z-index: 99;
  top: 0;
  left: 0;
}
.right-drawer {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  background-color: white;
  z-index: 100;
  box-shadow: 0px 12px 28px #c5cbd0;
  .icon-close {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.icon-close {
  position: absolute;
  top: 0;
  right: 0;
}
// right drawer transitions
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
// left drawer transitions
.left-drawer-transition-enter-active,
.left-drawer-transition-leave-active {
  transition: all 0.5s;
}
.left-drawer-transition-enter-to,
.left-drawer-transition-leave-from {
  transform: translateX(0);
}
.left-drawer-transition-enter-from,
.left-drawer-transition-leave-to {
  transform: translateX(-100%);
}
// MEDIA QUERIES
@media (min-width: 1024px) {
  .main-container {
    margin-left: 65px;
  }
  .left-drawer,
  .overlay {
    display: none;
  }
  .layout-container {
    background-color: #f0f0f0;
    .left-drawer-fixed {
      display: block;
    }
    .button-open-drawer {
      display: flex;
    }
    .arrow-left-img {
      user-select: none;
    }
    .arrow-right-img {
      user-select: none;
      transform: rotate(180deg);
    }
  }
  .button-close-drawer {
    display: flex;
  }
  .right-drawer {
    width: 700px;
  }
  .right-drawer-shrinked {
    width: calc(100% - 700px);
    height: 100vh;
    transition: width 0.8s ease;
  }
}
</style>
