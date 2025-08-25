<template>
  <!-- root del sidebar -->
  <aside
    class="layout__sidebar"
    :class="{ 'layout__sidebar--open': menuOpen }"
    @mouseleave="collapseSidebar"
    @click="hideUserMenu()"
  >
    <!-- LOGO -->
    <div class="layout__logo">
      <img src="/logos/logo-black-new.svg" alt="Logo" />
    </div>

    <!-- NAVIGATION -->
    <nav class="layout__nav" ref="nav">
      <router-link
        :to="`/${route.params.pmsPropertyId || ''}`"
        class="layout__nav-link"
        :class="{ 'layout__nav-link--active': isActive('/') }"
      >
        <i class="pi pi-objects-column layout__nav-link-icon" />
        <span>{{ t('sidebar.dashboard') }}</span>
      </router-link>

      <router-link
        :to="`/planning${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="layout__nav-link"
        :class="{ 'layout__nav-link--active': isActive('/planning') }"
      >
        <i class="pi pi-calendar layout__nav-link-icon" />
        <span>{{ t('sidebar.planning') }}</span>
      </router-link>

      <router-link
        :to="`/contacts${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="layout__nav-link"
        :class="{ 'layout__nav-link--active': isActive('/contacts') }"
      >
        <i class="pi pi-user layout__nav-link-icon" />
        <span>{{ t('sidebar.contacts') }}</span>
      </router-link>

      <router-link
        :to="`/transactions${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="layout__nav-link"
        :class="{ 'layout__nav-link--active': isActive('/transactions') }"
      >
        <i class="pi pi-euro layout__nav-link-icon" />
        <span>{{ t('sidebar.cashRegister') }}</span>
      </router-link>

      <router-link
        :to="`/invoices${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="layout__nav-link"
        :class="{ 'layout__nav-link--active': isActive('/invoices') }"
      >
        <i class="pi pi-credit-card layout__nav-link-icon" />
        <span>{{ t('sidebar.billing') }}</span>
      </router-link>

      <!-- REPORTS -->
      <div
        class="layout__nav-link layout__nav-link--toggle"
        @click="isReportOptionsOpen = !isReportOptionsOpen"
      >
        <i class="pi pi-chart-bar layout__nav-link-icon" />
        <span>{{ t('sidebar.reports') }}</span>
        <i
          class="pi pi-sort-down-fill layout__nav-link-caret"
          :class="{ 'layout__nav-link-caret--rotated': isReportOptionsOpen }"
        />
      </div>

      <ul class="layout__submenu" :class="{ 'layout__submenu--open': isReportOptionsOpen }">
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-list-check layout__submenu-link-icon" />
            <span>{{ t('sidebar.housekeeping') }}</span>
          </div>
        </li>
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-sign-in layout__submenu-link-icon" />
            <span>{{ t('sidebar.arrivals') }}</span>
          </div>
        </li>
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-sign-out layout__submenu-link-icon" />
            <span>{{ t('sidebar.departures') }}</span>
          </div>
        </li>
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-tags layout__submenu-link-icon" />
            <span>{{ t('sidebar.services') }}</span>
          </div>
        </li>
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-money-bill layout__submenu-link-icon" />
            <span>{{ t('sidebar.payments') }}</span>
          </div>
        </li>
        <li class="layout__submenu-item">
          <div class="layout__submenu-link">
            <i class="pi pi-chart-pie layout__submenu-link-icon" />
            <span>INE</span>
          </div>
        </li>
      </ul>

      <!-- LINKS -->
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

    <!-- FOOTER -->
    <div class="layout__nav-footer">
      <div
        class="layout__support"
        v-if="pmsPropertySupportLink"
        @click="openLink(pmsPropertySupportLink.id)"
      >
        <i class="pi pi-headphones layout__nav-link-icon" />
        <span>{{ pmsPropertySupportLink.label }}</span>
      </div>

      <!-- PROPERTY -->
      <div
        v-if="currentPmsProperty"
        class="property"
        :style="{ '--property-image': `url(${currentPmsProperty.image})` }"
      >
        <div class="property__overlay" />
        <div class="property__content">
          <div class="property__title">
            <i class="pi pi-building layout__nav-link-icon" />
            <span>{{ currentPmsProperty.name }}</span>
          </div>
          <div class="property__user" @click.stop="toggleMenu">
            <div class="avatar-wrapper">
              <Avatar :image="user?.avatar" class="1mr-2" size="large" shape="circle" />
            </div>
            <div class="property__user-details">
              <div class="property__user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
              <div class="property__user-email">{{ user?.email }}</div>
            </div>
            <div class="property__user-menu" :class="{ 'is-open': isUserMenuOpen }">
              <Menu :model="items" />
            </div>
          </div>
        </div>
        <div class="property__version-info">{{ hash }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import Avatar from 'primevue/avatar';
import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import Menu from 'primevue/menu';
import UserSettings from '@/ui/components/user/UserSettings.vue';
import { useI18n } from 'vue-i18n';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import UserChangePassword from '../user/UserChangePassword.vue';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import { useRouter } from 'vue-router';

defineProps<{
  menuOpen: boolean;
}>();

const route = useRoute();
const userStore = useUserStore();
const pmsPropertiesStore = usePmsPropertiesStore();
const router = useRouter();
const { t } = useI18n();
const { open } = useAppDialog();

const hash = import.meta.env.VITE_COMMIT_HASH || 'dev';

const isUserMenuOpen = ref(false);
const isReportOptionsOpen = ref(false);
const isLinkOptionsOpen = ref(false);
const nav = ref<HTMLElement | null>(null);
const userSettingsHeader = computed(() => t('sidebar.userSettings'));
const userChangePasswordHeader = computed(() => t('sidebar.changePassword'));

const items = computed(() => [
  {
    label: t('sidebar.options'),
    items: [
      {
        label: t('sidebar.settings'),
        icon: 'pi pi-cog',
        command: () => {
          open(UserSettings, {
            props: { header: userSettingsHeader },
          });
        },
      },
      {
        label: t('sidebar.changePassword'),
        icon: 'pi pi-lock',
        command: () => {
          open(UserChangePassword, {
            props: { header: userChangePasswordHeader },
          });
        },
      },
      {
        label: t('sidebar.logout'),
        icon: 'pi pi-sign-out',
        command: () => {
          userStore.logout();
          //TODO: remove with legacy
          useLegacyStore().removeVuexAndOldCookiesUser();
          router.push({ name: 'login' });
        },
      },
    ],
  },
]);

const user = computed(() => userStore.user);
const currentPmsProperty = computed(() =>
  pmsPropertiesStore.pmsProperties.find((p) => p.id === pmsPropertiesStore.currentPmsPropertyId)
);
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
  isUserMenuOpen.value = false;
  if (nav.value) nav.value.scrollTop = 0;
};

const openLink = async (linkId: number) => {
  const currentPmsPropertyId = pmsPropertiesStore.currentPmsPropertyId;
  if (currentPmsPropertyId) {
    const foundLink = await pmsPropertiesStore.fetchPmsPropertyLink(currentPmsPropertyId, linkId);
    window.open(foundLink, '_blank');
  }
};

const toggleMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};
const hideUserMenu = () => {
  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};
</script>

<style scoped lang="scss">
.layout__sidebar {
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

  &--open {
    transform: translateX(0);
  }
}

.layout__logo {
  margin: 1rem;
  min-height: 35px;
  margin-bottom: 3rem;

  img {
    height: 100%;
    object-fit: cover;
    object-position: left center;
  }
}

.layout__nav {
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

.layout__nav-link-icon,
.layout__submenu-link-icon {
  font-size: 1.1rem;
  color: #acacac;
}

.layout__nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  margin-bottom: 1rem;
  cursor: pointer;

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
}

.layout__nav-link-caret--rotated {
  transform: rotate(180deg);
}

.layout__nav-link span,
.layout__support span {
  margin-right: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layout__submenu {
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

.layout__submenu-item {
  margin: 0.25rem 0;
}

.layout__submenu-link {
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

.layout__nav-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 320px;
  overflow-x: hidden;
}

.layout__support {
  background-color: #e9e9e980;
  border-radius: 10px;
  height: 35px;
  display: flex;
  align-items: center;
  margin: 0 1rem 1rem 1rem;
  cursor: pointer;

  i {
    font-size: 1.5rem;
    color: #ed4a1c;
    margin-right: 1.5rem;
    margin-left: 0.5rem;
  }

  &:hover {
    font-weight: bold;
  }
}

.property {
  overflow-x: hidden;
  height: auto;
  flex: 1 1 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: var(--property-image);
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
    position: relative;
    margin-left: 0.85rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
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
    &-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      width: 95%;
      margin-bottom: 0.5rem;

      /* estado cerrado */
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transform: translateY(10px);
      visibility: hidden;
      pointer-events: none;

      transition: max-height 0.25s ease, opacity 0.18s ease, transform 0.18s ease,
        visibility 0s linear 0.25s;
      &.is-open {
        max-height: 500px; // suficiente para tu menú
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        pointer-events: auto;

        transition: max-height 0.25s ease, opacity 0.18s ease, transform 0.18s ease, visibility 0s;
      }
    }
  }

  &__overlay {
    background-color: black;
    opacity: 0.5;
    z-index: 1;
  }
  &__content {
    z-index: 2;
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

@media (min-width: 1024px) {
  .layout__sidebar {
    width: 65px;
    transform: translateX(0) !important;

    &:hover {
      width: 250px;

      .layout__nav {
        overflow-y: auto;
      }
      .layout__nav-footer {
        .layout__support {
          background-color: #e9e9e980;
        }
        .property {
          background-image: var(--property-image);
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
      }
    }
  }

  .layout__nav {
    overflow-y: hidden;
  }
  /* estado colapsado por defecto */
  .property {
    background-image: none;
  }
  .property__overlay,
  .property__version-info {
    display: none;
  }
  .property__content {
    flex-direction: column-reverse;
    position: relative;
  }
  .property__title {
    display: none;
  }
}
</style>
