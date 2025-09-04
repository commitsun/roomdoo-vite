<template>
  <div class="layout" :class="{ 'layout--menu-open': isMenuVisible }">
    <!-- HEADER (mobile) -->
    <header class="layout__header layout__header--mobile">
      <button class="layout__hamburger" @click="isMenuVisible = true" aria-label="Open menu">
        <i class="pi pi-bars" style="font-size: 1.5rem" />
      </button>
      <div class="layout__logo layout__logo--mobile">
        <img src="/logos/logo-black-new.svg" alt="Logo" />
      </div>
    </header>

    <!-- SIDEBAR -->
    <Sidebar :menuOpen="isMenuVisible" />

    <!-- Backdrop móvil -->
    <div v-if="isMenuVisible" class="layout__backdrop" @click="isMenuVisible = false"></div>

    <!-- Main -->
    <main class="layout__main">
      <router-view />
    </main>

    <!-- Right drawer -->
    <Drawer v-model:visible="rightDrawerVisible" header="Drawer" position="right">
      <router-view name="drawer" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Drawer from 'primevue/drawer';
import Sidebar from '@/ui/components/sidebar/Sidebar.vue';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useUserStore } from '@/infrastructure/stores/user';

const route = useRoute();
const pmsPropertiesStore = usePmsPropertiesStore();
const instanceStore = useInstanceStore();
const userStore = useUserStore();

const isMenuVisible = ref(false);
const rightDrawerVisible = ref(false);

watch(
  () => route.name,
  (name) => {
    if (typeof name === 'string') rightDrawerVisible.value = name.includes('detail');
  },
  { immediate: true }
);

onBeforeMount(async () => {
  await instanceStore.fetchInstance();

  await pmsPropertiesStore.fetchPmsProperties();
  const pmsPropertyId = (route.params.pmsPropertyId as string) || '';
  if (pmsPropertyId) {
    pmsPropertiesStore.setCurrentPmsPropertyId(parseInt(pmsPropertyId));
  } else if (userStore.user?.defaultPmsProperty) {
    pmsPropertiesStore.setCurrentPmsPropertyId(userStore.user.defaultPmsProperty.id);
  }
});
</script>

<style scoped lang="scss">
/* ========== MOBILE FIRST ========== */
.layout {
  --header-height: #{$header-height};
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100svh;

  &__header {
    display: flex;
    align-items: center;
    padding: 1rem;
    color: white;
    background-color: #f4f4f4;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &--mobile {
      display: flex;
    }
  }

  &__hamburger {
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

  &__logo {
    min-height: 35px;

    &--mobile {
      margin: 0;
    }
    img {
      height: 30px;
      object-fit: cover;
      object-position: left center;
    }
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.4);
  }

  &__main {
    flex: 1;
    height: calc(100svh - #{$header-height});
    margin-left: 0;
    overflow: hidden;
    transition: margin-left 0.3s ease;
  }
}

/* ========== DESKTOP ========== */
@media (min-width: 1024px) {
  .layout {
    flex-direction: row;

    &__header--mobile,
    &__backdrop {
      display: none;
    }

    &__main {
      height: 100svh;
      margin-left: 70px;
    }
  }
}
</style>
