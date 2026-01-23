<template>
  <div class="layout" :class="{ 'menu-open': isMenuVisible }">
    <!-- sidebar -->
    <Sidebar :menuOpen="isMenuVisible" @hide="isMenuVisible = false" />

    <!-- backdrop mobile -->
    <div v-if="isMenuVisible" class="backdrop" @click="isMenuVisible = false"></div>

    <!-- main -->
    <main class="main">
      <router-view
        :key="viewKey"
        @showMenu="isMenuVisible = true"
        @open-reservation-drawer="handleOpenReservationDrawer"
      />
    </main>
  </div>

  <!-- reservation drawer -->
  <Transition name="right-drawer-transition">
    <div v-if="isReservationDrawerVisible" class="right-drawer">
      <div class="button-close-drawer" @click="closeReservationDrawer">
        <img src="/app-images/icon-menu.svg" class="arrow-right-img" />
      </div>
      <div v-if="isLoadingReservation" class="loading-container">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>
      <FolioComponent v-else-if="hasFolioData" />
      <div v-else class="empty-container">
        <p class="text-surface-500">{{ t('chat.reservation.notFound') }}</p>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';

import Sidebar from '@/ui/components/sidebar/Sidebar.vue';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useExtraFeatureStore } from '@/infrastructure/stores/extraFeature';
import { useUserStore } from '@/infrastructure/stores/user';
import { useUIStore } from '@/infrastructure/stores/ui';
import { i18n } from '@/infrastructure/plugins/i18n';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import { useStore } from '@/_legacy/store';

// lazy load FolioComponent
const FolioComponent = defineAsyncComponent(
  () => import('@/_legacy/components/folios/FolioComponent.vue'),
);

export default defineComponent({
  name: 'ChatLayout',
  components: {
    Sidebar,
    ProgressSpinner,
    FolioComponent,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const store = useStore();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const instanceStore = useInstanceStore();
    const userStore = useUserStore();
    const uiStore = useUIStore();
    const extraFeatureStore = useExtraFeatureStore();

    const isMenuVisible = ref(false);
    const isReservationDrawerVisible = ref(false);
    const isLoadingReservation = ref(false);

    const viewKey = computed(() => `${route.fullPath}::${uiStore.reloadTick}`);

    // check if folio data is loaded in Vuex store
    const hasFolioData = computed(() => store.state.folios.currentFolio !== null);

    const handleOpenReservationDrawer = async (folioId: number): Promise<void> => {
      isLoadingReservation.value = true;
      isReservationDrawerVisible.value = true;

      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
        ]);

        // Fetch first reservation details if available
        const reservations = store.state.reservations.reservations;
        if (reservations && reservations.length > 0) {
          const firstReservation = reservations[0];
          await store.dispatch('reservations/fetchReservation', firstReservation.id);
        }
      } finally {
        isLoadingReservation.value = false;
      }
    };

    const closeReservationDrawer = (): void => {
      isReservationDrawerVisible.value = false;
    };

    onBeforeMount(async () => {
      await instanceStore.fetchInstance();
      await pmsPropertiesStore.fetchPmsProperties();
      await useLegacyStore().fetchPmsProperties();
      const pmsPropertyId = (route.params.pmsPropertyId as string) || '';
      if (pmsPropertyId) {
        await pmsPropertiesStore.setCurrentPmsPropertyId(parseInt(pmsPropertyId));
      } else if (userStore.user?.defaultPmsProperty) {
        await pmsPropertiesStore.setCurrentPmsPropertyId(userStore.user.defaultPmsProperty.id);
      }
      if (userStore.user && userStore.user.lang) {
        const userLanguage = userStore.user.lang.replace('_', '-');
        i18n.global.locale.value = userLanguage;
        updatePrimevueLocale(userLanguage);
      }
      await extraFeatureStore.fetchExtraFeatures();
    });

    // Clean up folio data when drawer closes
    watch(isReservationDrawerVisible, (visible) => {
      if (!visible) {
        void store.dispatch('folios/setCurrentFolio', null);
        void store.dispatch('reservations/setCurrentReservations', []);
        void store.dispatch('reservations/setCurrentReservation', null);
      }
    });

    return {
      t,
      isMenuVisible,
      isReservationDrawerVisible,
      isLoadingReservation,
      hasFolioData,
      viewKey,
      handleOpenReservationDrawer,
      closeReservationDrawer,
    };
  },
});
</script>

<style scoped lang="scss">
.layout {
  --header-height: #{$header-height};
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100svh;

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .main {
    flex: 1;
    height: calc(100svh - #{$header-height});
    margin-left: 0;
    overflow: hidden;
    transition: margin-left 0.3s ease;
  }
}

@media (min-width: 1024px) {
  .layout {
    flex-direction: row;

    .backdrop {
      display: none;
    }

    .main {
      height: 100svh;
      margin-left: 57px;
    }
  }
}

// right drawer styles (same as legacy MainLayout)
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

.arrow-right-img {
  user-select: none;
  transform: rotate(180deg);
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 1.5rem;
}

// Right drawer transitions
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

@media (min-width: 1024px) {
  .right-drawer {
    width: 700px;
  }

  .button-close-drawer {
    display: flex;
  }
}
</style>
