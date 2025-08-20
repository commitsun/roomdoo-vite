<template>
  <div class="layout" :class="{ 'layout--menu-open': isMenuVisible }">
    <!-- BURGER & LOGO (mobile) -->
    <header class="layout__header layout__header--mobile">
      <button class="layout__hamburger" @click="isMenuVisible = true" aria-label="Open menu">
        ☰
      </button>
      <div class="layout__logo layout__logo--mobile">
        <img src="/logos/logo-black-new.svg" alt="Logo" />
      </div>
    </header>

    <!-- SIDEBAR (mobile & desktop) -->
    <aside class="layout__sidebar" @mouseleave="collapseSidebar">
      <!-- SIDEBAR HEADER (LOGO) -->
      <div class="layout__logo">
        <img src="/logos/logo-black-new.svg" alt="Logo" />
      </div>

      <!-- SIDEBAR NAVIGATION (APP SECTIONS & LINKS) -->
      <nav class="layout__nav" ref="nav">
        <router-link
          to="/"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/') }"
        >
          <i class="pi pi-objects-column layout__nav-link-icon" />
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/planning"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/planning') }"
        >
          <i class="pi pi-calendar layout__nav-link-icon" />
          <span>Planning de reservas</span>
        </router-link>

        <router-link
          to="/contacts"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/contacts') }"
        >
          <i class="pi pi-user layout__nav-link-icon" />
          <span>Contactos</span>
        </router-link>

        <router-link
          to="/transactions"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/transactions') }"
        >
          <i class="pi pi-euro layout__nav-link-icon" />
          <span>Registro de caja</span>
        </router-link>

        <router-link
          to="/invoices"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/invoices') }"
        >
          <i class="pi pi-credit-card layout__nav-link-icon" />
          <span>Facturación</span>
        </router-link>

        <!-- REPORTS trigger (kept as semantic modifier for JS -->
        <div
          class="layout__nav-link layout__nav-link--toggle"
          @click="isReportOptionsOpen = !isReportOptionsOpen"
        >
          <i class="pi pi-chart-bar layout__nav-link-icon" />
          <span>Informes</span>
          <i
            class="pi pi-sort-down-fill layout__nav-link-caret"
            :class="{ 'layout__nav-link-caret--rotated': isReportOptionsOpen }"
          />
        </div>

        <!-- Submenu -->
        <ul class="layout__submenu" :class="{ 'layout__submenu--open': isReportOptionsOpen }">
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-list-check layout__submenu-link-icon" />
              <span>Limpieza</span>
            </div>
          </li>
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-sign-in layout__submenu-link-icon" />
              <span>Entradas</span>
            </div>
          </li>
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-sign-out layout__submenu-link-icon" />
              <span>Salidas</span>
            </div>
          </li>
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-tags layout__submenu-link-icon" />
              <span>Servicios</span>
            </div>
          </li>
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-money-bill layout__submenu-link-icon" />
              <span>Pagos</span>
            </div>
          </li>
          <li class="layout__submenu-item">
            <div class="layout__submenu-link">
              <i class="pi pi-chart-pie layout__submenu-link-icon" />
              <span>INE</span>
            </div>
          </li>
        </ul>
        <!-- property links -->
        <div
          v-if="pmsPropertiesLinks.length === 1"
          class="layout__nav-link"
          :class="{ 'layout__nav-link--active': isActive('/contacts/detail/1') }"
          @click="openLink(pmsPropertiesLinks[0].id)"
        >
          <i class="pi pi-external-link layout__nav-link-icon" />
          <span>{{ pmsPropertiesLinks[0].label }}</span>
        </div>
        <template v-else-if="pmsPropertiesLinks.length > 1">
          <!-- LINKS trigger (kept as semantic modifier for JS -->
          <div
            class="layout__nav-link layout__nav-link--toggle"
            @click="isLinkOptionsOpen = !isLinkOptionsOpen"
          >
            <i class="pi pi-external-link layout__nav-link-icon" />
            <span>Enlaces</span>
            <i
              class="pi pi-sort-down-fill layout__nav-link-caret"
              :class="{ 'layout__nav-link-caret--rotated': isLinkOptionsOpen }"
            />
          </div>
          <!-- Submenu -->
          <ul class="layout__submenu" :class="{ 'layout__submenu--open': isLinkOptionsOpen }">
            <li class="layout__submenu-item" v-for="link in pmsPropertiesLinks" :key="link.id">
              <div class="layout__submenu-link" @click="openLink(link.id)">
                <i class="pi pi-link layout__submenu-link-icon" />
                <span>{{ link.label }}</span>
              </div>
            </li>
          </ul>
        </template>
      </nav>

      <!-- SIDEBAR FOOTER (support & user) -->
      <div class="layout__nav-footer">
        <div
          class="layout__support"
          v-if="pmsPropertySupportLink"
          @click="openLink(pmsPropertySupportLink.id)"
        >
          <i class="pi pi-headphones layout__nav-link-icon" />
          <span>{{ pmsPropertySupportLink.label }}</span>
        </div>

        <!-- promoted to independent block: property -->
        <div class="property">
          <div class="property__overlay" />
          <div class="property__content">
            <div class="property__title">
              <i class="pi pi-building layout__nav-link-icon" />
              <span>Hotel Roomdoo</span>
            </div>
            <div class="property__user">
              <div class="avatar-wrapper">
                <Avatar :image="user?.avatar" class="1mr-2" size="large" shape="circle" />
              </div>
              <div class="property__user-details">
                <div class="property__user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
                <div class="property__user-email">{{ user?.email }}</div>
              </div>
            </div>
          </div>
          <div class="property__version-info">{{ hash }}</div>
        </div>
      </div>
    </aside>

    <!-- Mobile backdrop -->
    <div v-if="isMenuVisible" class="layout__backdrop" @click="isMenuVisible = false"></div>

    <!-- Main content -->
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
// All code comments in English as requested
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Drawer from 'primevue/drawer';
import Avatar from 'primevue/avatar';
import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

const hash = import.meta.env.VITE_COMMIT_HASH || 'dev';

const userStore = useUserStore();
const pmsPropertiesStore = usePmsPropertiesStore();
const route = useRoute();

const isMenuVisible = ref(false);
const isReportOptionsOpen = ref(false);
const isLinkOptionsOpen = ref(false);
const nav = ref<HTMLElement | null>(null);
const rightDrawerVisible = ref(false);

const user = computed(() => userStore.user);

const pmsPropertySupportLink = computed(() =>
  pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isSupportLink)
);

const pmsPropertiesLinks = computed(() =>
  pmsPropertiesStore.pmsPropertyLinks.filter((link) => !link.isSupportLink)
);

const isActive = (path: string) => route.path === path;

const collapseSidebar = () => {
  isReportOptionsOpen.value = false;
  isLinkOptionsOpen.value = false;
  // Reset nav scroll position
  if (nav.value) {
    nav.value.scrollTop = 0;
  }
};

const openLink = async (linkId: number) => {
  const currentPmsPropertyId = pmsPropertiesStore.currentPmsPropertyId;
  if (currentPmsPropertyId) {
    const foundLink = await pmsPropertiesStore.fetchPmsPropertyLink(currentPmsPropertyId, linkId);
    window.open(foundLink, '_blank');
  }
};

watch(
  () => route.name,
  (name) => {
    if (typeof name === 'string') {
      rightDrawerVisible.value = name.includes('detail');
    }
  },
  { immediate: true }
);

onBeforeMount(() => {
  pmsPropertiesStore.fetchPmsProperties();
  const pmsPropertyId = route.params.pmsPropertyId as string;
  if (pmsPropertyId) {
    pmsPropertiesStore.setCurrentPmsPropertyId(parseInt(pmsPropertyId));
  }
});
</script>

<style scoped lang="scss">
/* ========== MOBILE FIRST ========== */
.layout {
  /* Global layout vars */
  --header-height: #{$header-height};
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100svh;

  /* Header (mobile) */
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

  /* Hamburger (mobile) */
  &__hamburger {
    margin-right: 1rem;
    background: none;
    border: none;
    color: black;
    cursor: pointer;
    font-size: 2.5rem;
  }

  /* Sidebar */
  &__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    height: 100svh;
    width: 300px;
    background-color: white;
    overflow: hidden;
    transform: translateX(-100%);
    transition: width 0.3s ease, transform 0.3s ease;
    user-select: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  /* Logo (shared) */
  &__logo {
    margin: 1rem;
    min-height: 35px;
    margin-bottom: 3rem;

    img {
      height: 100%;
      object-fit: cover;
      object-position: left center;
    }

    &--mobile {
      /* keeps BEM: always alongside .layout__logo */
    }
  }

  /* NAV ROOT */
  &__nav {
    margin: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1 1 auto;
    min-height: 0;
    padding: 0.5rem;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ---- NAV: shared icon styles (main links + submenu) via elements ---- */
  &__nav-link-icon,
  &__submenu-link-icon {
    font-size: 1.1rem;
    color: #acacac;
  }

  /* ---- NAV LINK (router-link + div toggle) ---- */
  &__nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
    margin-bottom: 1rem;
    cursor: pointer;

    /* caret element inside a nav-link */
    .layout__nav-link-caret {
      margin-left: auto;
      transition: transform 180ms ease;
    }

    &:hover,
    &--active,
    &.router-link-exact-active {
      .layout__nav-link-icon {
        color: black;
      }
      span {
        font-weight: bold;
      }
    }

    /* optional variant to denote "toggle" behavior (JS semantic only) */
    &--toggle {
    }
  }

  /* Caret rotation modifier */
  &__nav-link-caret--rotated {
    transform: rotate(180deg);
  }

  /* Truncation for inline text */
  &__nav-link span,
  &__support span {
    margin-right: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__support {
    i {
      font-size: 1.5rem;
      color: #ed4a1c;
      margin-right: 1.5rem;
      margin-left: 0.5rem;
    }
  }

  /* SUBMENU (animated) */
  &__submenu {
    list-style: none;
    padding-left: 0.5rem;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-4px);
    transition: height 200ms ease, opacity 160ms ease, transform 160ms ease;

    &--open {
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
      overflow: visible;
    }
  }

  &__submenu-item {
    margin: 0.25rem 0;
  }

  &__submenu-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;

    &:hover {
      .layout__submenu-link-icon {
        color: black;
      }
      span {
        font-weight: bold;
      }
    }
  }

  /* Nav footer */
  &__nav-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    min-height: 320px;
    overflow-x: hidden;
  }

  /* Support entry */
  &__support {
    background-color: #e9e9e980;
    border-radius: 10px;
    height: 35px;
    display: flex;
    align-items: center;
    margin: 0 1rem 1rem 1rem;
    cursor: pointer;
    img {
      width: 25px;
      height: 25px;
      margin-right: 15px;
      margin-left: 3px;
    }

    &:hover {
      font-weight: bold;
    }
  }

  /* Backdrop (mobile) */
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.4);
  }

  /* Main content */
  &__main {
    flex: 1;
    height: calc(100svh - #{$header-height});
    margin-left: 0;
    overflow: hidden;
    transition: margin-left 0.3s ease;
  }

  /* State: menu open (mobile) */
  &--menu-open &__sidebar {
    transform: translateX(0);
  }
}

/* Independent block: property */
.property {
  overflow-x: hidden;
  height: auto;
  flex: 1 1 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(https://cf.bstatic.com/xdata/images/hotel/max1024x768/508380506.jpg?k=1f0da3e6f32310757ec0f64c0984e0684b4df3efb38c6aa6495d4aec1fd20bde&o=);
  position: relative;

  &__overlay,
  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  &__title {
    margin: 1.5rem 1rem 0 1rem;
    display: flex;
    i {
      font-size: 1.8rem;
      color: white;
    }
    span {
      color: white;
      font-weight: bold;
      margin-left: 0.5rem;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
  }
  &__user {
    margin-left: 0.85rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: auto;

    &-details {
      margin-left: 0.25rem;
      color: white;
    }
    &-name,
    &-email {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
    &-name {
      font-weight: bold;
      font-size: 15px;
    }
    &-email {
      font-size: 11px;
    }
  }

  &__overlay {
    background-color: black;
    opacity: 0.5;
    z-index: 1;
  }
  &__content {
    z-index: 2;
    color: red;
  }

  &__version-info {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
    color: white;
    font-size: 0.8rem;
    user-select: text;
    opacity: 0.3;
    z-index: 3;
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

    &__sidebar {
      width: 65px;
      transform: translateX(0) !important;

      /* expand on hover */
      &:hover {
        width: 250px;
        /* allow scroll only when expanded */
        .layout__nav {
          overflow-y: auto;
        }
        .layout__nav-footer {
          .layout__support {
            background-color: #e9e9e980;
          }
          .property {
            background-image: url(https://cf.bstatic.com/xdata/images/hotel/max1024x768/508380506.jpg?k=1f0da3e6f32310757ec0f64c0984e0684b4df3efb38c6aa6495d4aec1fd20bde&o=);
          }
          .property__overlay {
            display: block;
          }
          .property__version-info {
            display: block;
          }
          .property__content {
            flex-direction: column;
          }
          .property__title {
            display: flex;
          }
          .property__user {
            /* keep as-is */
          }
        }
      }
    }

    &__support {
      background-color: white;
    }

    /* property block styles adjusted for desktop collapsed state */
    .property {
      background-image: none;
    }
    .property__overlay,
    .property__version-info {
      display: none;
    }
    .property__content {
      flex-direction: column-reverse;
    }
    .property__title {
      display: none;
    }

    &__nav {
      overflow-y: hidden;
    }

    &__main {
      height: 100svh;
      margin-left: 70px;
    }
  }
}
</style>
