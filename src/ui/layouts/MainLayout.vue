<template>
  <div class="layout" :class="{ 'menu-open': isMenuVisible }">
    <!-- SIDEBAR -->
    <Sidebar :menuOpen="isMenuVisible" @hide="isMenuVisible = false" />

    <!-- Backdrop mobile -->
    <div v-if="isMenuVisible" class="backdrop" @click="isMenuVisible = false"></div>

    <!-- Main -->
    <main class="main">
      <router-view :key="viewKey" @showMenu="isMenuVisible = true" />
    </main>

    <!-- Right drawer -->
    <Drawer v-model:visible="rightDrawerVisible" header="Drawer" position="right">
      <router-view name="drawer" />
    </Drawer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Drawer from 'primevue/drawer';

import Sidebar from '@/ui/components/sidebar/Sidebar.vue';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useExtraFeatureStore } from '@/infrastructure/stores/extraFeature';
import { useUserStore } from '@/infrastructure/stores/user';
import { useUIStore } from '@/infrastructure/stores/ui';
import { i18n } from '@/infrastructure/plugins/i18n';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';

export default defineComponent({
  name: 'MainLayout',
  components: {
    Sidebar,
    Drawer,
  },
  setup() {
    const route = useRoute();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const instanceStore = useInstanceStore();
    const userStore = useUserStore();
    const uiStore = useUIStore();
    const extraFeatureStore = useExtraFeatureStore();
    const isMenuVisible = ref(false);
    const rightDrawerVisible = ref(false);
    const viewKey = computed(() => `${route.fullPath}::${uiStore.reloadTick}`);
    watch(
      () => route.name,
      (name) => {
        if (typeof name === 'string') {
          rightDrawerVisible.value = name.includes('detail');
        }
      },
      { immediate: true },
    );

    onBeforeMount(async () => {
      await useLegacyStore().recoverCookies();
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
    return {
      isMenuVisible,
      rightDrawerVisible,
      viewKey,
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
  .header {
    display: flex;
    align-items: center;
    padding: 1rem;
    color: white;
    background-color: #f4f4f4;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &.mobile {
      display: flex;
    }
  }
  .hamburger {
    margin-right: 1rem;
    margin-left: 0.5rem;
    background: none;
    border: none;
    color: black;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 100%;
  }
  .logo {
    min-height: 35px;

    &.mobile {
      margin: 0;
    }

    img {
      height: 30px;
      object-fit: cover;
      object-position: left center;
    }
  }
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
    .header.mobile,
    .backdrop {
      display: none;
    }
    .main {
      height: 100svh;
      margin-left: 57px;
    }
  }
}
</style>
