<template>
  <!-- root del sidebar -->
  <aside
    class="sidebar"
    :class="{ 'is-open': menuOpen }"
    @mouseleave="collapseSidebar"
    @mouseenter="checkPathAndExpandContacts()"
    @click="hideUserMenu()"
  >
    <!-- LOGO -->
    <div class="sidebar-logo">
      <img src="/logos/logo-black-new.svg" alt="Logo" />
    </div>

    <!-- PROPERTY SELECTOR -->
    <div class="property-selector">
      <Avatar
        v-if="currentPmsProperty"
        :image="currentPmsProperty.image"
        shape="square"
        class="avatar-desktop-closed property-avatar"
      />
      <Select
        :value="currentPmsProperty"
        :options="pmsProperties"
        optionLabel="name"
        optionValue="id"
        appendTo="self"
        ref="propertySelect"
        :pt="{
          root: {
            class: 'property-select-dropdown',
          },
          label: {
            style: {
              paddingLeft: '5px',
            },
          },
        }"
      >
        <template #value="{ value }">
          <div v-if="currentPmsProperty" class="value-wrapper">
            <Avatar
              :image="currentPmsProperty.image"
              shape="square"
              class="avatar-wrapper property-avatar"
            />
            <span>{{ currentPmsProperty.name }}</span>
          </div>
        </template>
        <template #option="{ option }">
          <div class="value-wrapper">
            <Avatar
              :image="option.image"
              class="avatar-desktop-open property-avatar"
              size="large"
              shape="square"
            />
            <span>{{ option.name }}</span>
          </div>
        </template>
      </Select>
    </div>

    <!-- se  -->
    <div class="separator">
      <hr />
    </div>

    <!-- NAVIGATION -->
    <nav class="sidebar-nav" ref="nav">
      <!-- DASHBOARD -->
      <router-link
        :to="`/${route.params.pmsPropertyId || ''}`"
        class="nav-link"
        :class="{ 'is-active': isActive('/') }"
      >
        <Users :size="14" class="nav-link-icon" />
        <span>{{ t('sidebar.dashboard') }}</span>
      </router-link>

      <!-- PLANNING -->
      <router-link
        :to="`/planning${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="nav-link"
        :class="{ 'is-active': isActive('/planning') }"
      >
        <i class="pi pi-calendar nav-link-icon" />
        <span>{{ t('sidebar.planning') }}</span>
      </router-link>

      <!-- CONTACTS -->
      <router-link
        :to="`/contacts${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="nav-link"
        :class="{ 'is-active': isActive('/contacts') }"
      >
        <i class="pi pi-users nav-link-icon" />
        <span>{{ t('sidebar.contacts.title') }}</span>
      </router-link>

      <!-- TRANSACTIONS -->
      <router-link
        :to="`/transactions${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="nav-link"
        :class="{ 'is-active': isActive('/transactions') }"
      >
        <i class="pi pi-euro nav-link-icon" />
        <span>{{ t('sidebar.cashRegister') }}</span>
      </router-link>

      <!-- INVOICES -->
      <router-link
        :to="`/invoices${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
        class="nav-link"
        :class="{ 'is-active': isActive('/invoices') }"
      >
        <i class="pi pi-credit-card nav-link-icon" />
        <span>{{ t('sidebar.billing') }}</span>
      </router-link>

      <!-- REPORTS -->
      <div class="nav-link nav-link-toggle" @click="isReportOptionsOpen = !isReportOptionsOpen">
        <i class="pi pi-chart-bar nav-link-icon" />
        <span>{{ t('sidebar.reports') }}</span>
        <i
          class="pi pi-sort-down-fill nav-link-caret"
          :class="{ 'is-rotated': isReportOptionsOpen }"
        />
      </div>

      <!-- REPORTS OPTIONS -->
      <ul class="submenu" :class="{ 'is-open': isReportOptionsOpen }">
        <li class="submenu-item" @click="openLegacyReport('kelly')">
          <div class="submenu-link">
            <i class="pi pi-list-check submenu-link-icon" />
            <span>{{ t('sidebar.housekeeping') }}</span>
          </div>
        </li>
        <li class="submenu-item" @click="openLegacyReport('arrivals')">
          <div class="submenu-link">
            <i class="pi pi-sign-in submenu-link-icon" />
            <span>{{ t('sidebar.arrivals') }}</span>
          </div>
        </li>
        <li class="submenu-item" @click="openLegacyReport('departures')">
          <div class="submenu-link">
            <i class="pi pi-sign-out submenu-link-icon" />
            <span>{{ t('sidebar.departures') }}</span>
          </div>
        </li>
        <li class="submenu-item" @click="openLegacyReport('transactions')">
          <div class="submenu-link">
            <i class="pi pi-tags submenu-link-icon" />
            <span>{{ t('sidebar.services') }}</span>
          </div>
        </li>
        <li class="submenu-item" @click="openLegacyReport('services')">
          <div class="submenu-link">
            <i class="pi pi-money-bill submenu-link-icon" />
            <span>{{ t('sidebar.payments') }}</span>
          </div>
        </li>
        <li class="submenu-item" @click="openLegacyReport('INE')">
          <div class="submenu-link">
            <i class="pi pi-chart-pie submenu-link-icon" />
            <span>INE</span>
          </div>
        </li>
      </ul>

      <!-- LINKS -->
      <div
        v-if="pmsPropertiesLinks.length === 1"
        class="nav-link"
        :class="{ 'is-active': isActive('/contacts/detail/1') }"
        @click="openLink(pmsPropertiesLinks[0].id)"
      >
        <i class="pi pi-external-link nav-link-icon" />
        <span>{{ pmsPropertiesLinks[0].label }}</span>
      </div>

      <!-- ONLY ONE LINK -->
      <template v-else-if="pmsPropertiesLinks.length > 1">
        <div class="nav-link nav-link-toggle" @click="isLinkOptionsOpen = !isLinkOptionsOpen">
          <i class="pi pi-external-link nav-link-icon" />
          <span>{{ t('sidebar.links') }}</span>
          <i
            class="pi pi-sort-down-fill nav-link-caret"
            :class="{ 'is-rotated': isLinkOptionsOpen }"
          />
        </div>

        <ul class="submenu" :class="{ 'is-open': isLinkOptionsOpen }">
          <li class="submenu-item" v-for="link in pmsPropertiesLinks" :key="link.id">
            <div class="submenu-link" @click="openLink(link.id)">
              <i class="pi pi-link submenu-link-icon" />
              <span>{{ link.label }}</span>
            </div>
          </li>
        </ul>
      </template>
    </nav>

    <!-- FOOTER -->
    <div class="sidebar-footer">
      <div
        class="support"
        v-if="pmsPropertySupportLink"
        @click="openLink(pmsPropertySupportLink.id)"
      >
        <i class="pi pi-headphones nav-link-icon" />
        <span>{{ pmsPropertySupportLink.label }}</span>
      </div>

      <!-- PROPERTY -->
      <div
        v-if="currentPmsProperty"
        class="property"
        :style="{ '--property-image': `url(${currentPmsProperty.image})` }"
      >
        <div class="property-overlay" />
        <div class="property-content">
          <div class="property-title">
            <i class="pi pi-building nav-link-icon" />
            <span>{{ currentPmsProperty.name }}</span>
          </div>
          <div class="property-user" @click.stop="toggleMenu">
            <div class="avatar-wrapper">
              <Avatar :image="user?.avatar" class="mr-2" size="large" shape="circle" />
            </div>
            <div class="property-user-details">
              <div class="property-user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
              <div class="property-user-email">{{ user?.email }}</div>
            </div>
            <div class="user-menu" :class="{ 'is-open': isUserMenuOpen }">
              <Menu :model="items" />
            </div>
          </div>
        </div>
        <div class="property-version-info">{{ hash }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Select from 'primevue/select';
import Menu from 'primevue/menu';
import { Users } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import UserSettings from '@/ui/components/user/UserSettings.vue';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import LegacyReport from '@/_legacy/components/reports/ReportComponent.vue';
import { useUIStore } from '@/infrastructure/stores/ui';

defineProps<{
  menuOpen: boolean;
}>();

type LegacyReportType = 'kelly' | 'arrivals' | 'departures' | 'transactions' | 'services' | 'INE';

const route = useRoute();
const userStore = useUserStore();
const pmsPropertiesStore = usePmsPropertiesStore();
const uiStore = useUIStore();
const router = useRouter();
const { t } = useI18n();
const { openDialog } = useAppDialog();

const hash = import.meta.env.ROOMDOO_COMMIT_HASH ?? 'dev';

const isUserMenuOpen = ref(false);
const isReportOptionsOpen = ref(false);
const isLinkOptionsOpen = ref(false);
const isContactsOptionsOpen = ref(false);
const propertySelect = ref();

const nav = ref<HTMLElement | null>(null);
const userSettingsHeader = computed(() => t('sidebar.userSettings'));

const items = computed(() => [
  {
    label: t('sidebar.options'),
    items: [
      {
        label: t('sidebar.settings'),
        icon: 'pi pi-cog',
        command: (): void => {
          openDialog(UserSettings, {
            props: { header: userSettingsHeader },
            onClose: ({ data }: { data?: { refresh?: boolean; action?: string } }) => {
              if (data?.refresh ?? false) {
                uiStore.refreshView();
              }
            },
          });
        },
      },
      {
        label: t('sidebar.logout'),
        icon: 'pi pi-sign-out',
        command: (): void => {
          userStore.logout();
          //TODO: remove with legacy
          useLegacyStore().removeVuexAndOldCookiesUser();
          void router.push({ name: 'login' });
        },
      },
    ],
  },
]);

const user = computed(() => userStore.user);

const currentPmsProperty = computed(() =>
  pmsPropertiesStore.pmsProperties.find((p) => p.id === pmsPropertiesStore.currentPmsPropertyId),
);
const pmsPropertySupportLink = computed(() =>
  pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isSupportLink),
);
const pmsPropertiesLinks = computed(() =>
  pmsPropertiesStore.pmsPropertyLinks.filter((link) => !link.isSupportLink),
);

const pmsProperties = computed(() => pmsPropertiesStore.pmsProperties.slice());

const isActive = (path: string): boolean => route.path === path;

const collapseSidebar = (): void => {
  isReportOptionsOpen.value = false;
  isLinkOptionsOpen.value = false;
  isContactsOptionsOpen.value = false;
  isUserMenuOpen.value = false;
  if (nav.value) {
    nav.value.scrollTop = 0;
  }
  propertySelect.value?.hide();
};

const checkPathAndExpandContacts = (): void => {
  if (
    route.path.startsWith('/contacts') ||
    route.path.startsWith('/customers') ||
    route.path.startsWith('/guests') ||
    route.path.startsWith('/suppliers') ||
    route.path.startsWith('/agencies')
  ) {
    isContactsOptionsOpen.value = true;
  }
  if (nav.value) {
    nav.value.scrollTop = 0;
  }
  propertySelect.value.overlayVisible = false;
};

const openLink = async (linkId: number): Promise<void> => {
  const currentPmsPropertyId = pmsPropertiesStore.currentPmsPropertyId;
  if (
    typeof currentPmsPropertyId === 'number' &&
    !isNaN(currentPmsPropertyId) &&
    currentPmsPropertyId !== 0
  ) {
    const foundLink = await pmsPropertiesStore.fetchPmsPropertyLink(currentPmsPropertyId, linkId);
    window.open(foundLink, '_blank');
  }
};

const toggleMenu = (): void => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};
const hideUserMenu = (): void => {
  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};

const openLegacyReport = (type: LegacyReportType): void => {
  const titles: Record<LegacyReportType, string> = {
    kelly: t('sidebar.housekeeping'),
    arrivals: t('sidebar.arrivals'),
    departures: t('sidebar.departures'),
    services: t('sidebar.services'),
    transactions: t('sidebar.payments'),
    INE: 'INE',
  };

  openDialog(LegacyReport, {
    props: { header: titles[type] },
    contentProps: { reportType: type },
  });
};
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  height: 100svh;
  width: 15.875rem;
  background-color: white;
  overflow: hidden;
  transform: translateX(-100%);
  transition:
    width 0.3s ease,
    transform 0.3s ease;
  user-select: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  &.is-open {
    transform: translateX(0);
  }

  .sidebar-logo {
    margin-top: 1.09rem;
    margin-left: 0.91rem;
    margin-right: 0.91rem;
    margin-bottom: 0.75rem;
    min-height: 35px;
    margin-bottom: 3rem;

    img {
      width: 11.52738rem;
      height: 100%;
      object-fit: cover;
      object-position: left center;
    }
  }

  .property-selector {
    min-height: 34px;
    width: 90%;
    margin-bottom: 12px;

    .property-avatar {
      width: 34px;
      height: 34px;
      overflow: hidden;
      flex-shrink: 0;
    }

    /* Force exactly the same size in all property avatars */
    .avatar-desktop-closed,
    .property-select-dropdown .avatar-wrapper,
    .property-select-dropdown .avatar-desktop-open,
    .property-select-dropdown .p-avatar {
      width: 34px !important;
      height: 34px !important;
      box-sizing: content-box;
    }

    .avatar-desktop-closed {
      display: none;
      margin-left: 12px;
      margin-top: 8px;
      margin-bottom: 8px;
      border-right: 1px solid white;
    }

    .property-select-dropdown {
      width: 100%;
      border: 1px solid transparent;
      margin-left: -5px;
      .p-avatar {
        overflow: hidden;
      }
      .value-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          margin-right: 1rem;
        }

        span {
          margin-left: 1.1rem;
          max-width: 180px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .separator {
    width: 35px;
    width: 100%;
    hr {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }
  }

  .sidebar-nav {
    margin: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1 1 auto;
    padding: 0.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    height: 0;
  }

  .nav-link-icon,
  .submenu-link-icon {
    font-size: 1.1rem;
    color: #acacac;
    min-width: 14px;
    flex-shrink: 0;
  }

  .nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
    margin-bottom: 1rem;
    cursor: pointer;

    .nav-link-caret {
      margin-left: auto;
      transition: transform 180ms ease;
    }

    &:hover,
    &.is-active,
    &.router-link-exact-active {
      .nav-link-icon {
        color: black;
      }

      span {
        font-weight: bold;
      }
    }
  }

  .nav-link-toggle {
    .nav-link-caret {
      &.is-rotated {
        transform: rotate(180deg);
      }
    }
  }

  .nav-link span,
  .support span {
    margin-right: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .submenu {
    list-style: none;
    padding-left: 0.5rem;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-4px);
    margin-top: -0.5rem;
    transition:
      max-height 200ms ease,
      opacity 160ms ease,
      transform 160ms ease;

    &.is-open {
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
      overflow: visible;
      margin-bottom: 0.75rem;
    }

    .submenu-item {
      margin-left: 1.8rem;

      .submenu-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        &:hover,
        &.router-link-active,
        &.router-link-exact-active {
          .submenu-link-icon {
            color: black;
          }

          span {
            font-weight: bold;
          }
        }
      }
    }
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    min-height: 320px;
    overflow-x: hidden;
  }

  .support {
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

    .property-overlay,
    .property-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .property-title {
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

    .property-user {
      position: relative;
      margin-left: 0.85rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;

      .property-user-details {
        margin-left: 0.25rem;
        color: white;
      }

      .property-user-name,
      .property-user-email {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 180px;
      }

      .property-user-name {
        font-weight: bold;
        font-size: 15px;
      }

      .property-user-email {
        font-size: 11px;
      }

      .user-menu {
        position: absolute;
        bottom: 100%;
        left: 0;
        width: 95%;
        margin-bottom: 0.5rem;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(10px);
        visibility: hidden;
        pointer-events: none;
        transition:
          max-height 0.25s ease,
          opacity 0.18s ease,
          transform 0.18s ease,
          visibility 0s linear 0.25s;

        &.is-open {
          max-height: 500px;
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
          pointer-events: auto;
          transition:
            max-height 0.25s ease,
            opacity 0.18s ease,
            transform 0.18s ease,
            visibility 0s;
        }
      }
    }

    .property-overlay {
      background-color: black;
      opacity: 0.5;
      z-index: 1;
    }

    .property-content {
      z-index: 2;
    }

    .property-version-info {
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
}

@media (min-width: 1024px) {
  .sidebar {
    width: 65px;
    transform: translateX(0) !important;

    .sidebar-nav {
      overflow-y: hidden;
    }

    .property {
      background-image: none;

      .property-overlay,
      .property-version-info {
        display: none;
      }

      .property-content {
        flex-direction: column-reverse;
        position: relative;
      }

      .property-title {
        display: none;
      }
    }

    .property-selector {
      .avatar-desktop-closed {
        display: flex;
      }

      .property-select-dropdown {
        width: 100%;
        background-color: #eff6ff;
        margin: 0 0.91rem;
        display: none;
      }
    }

    &:hover {
      width: 250px;

      .sidebar-nav {
        overflow-y: auto;
      }

      .sidebar-footer {
        .support {
          background-color: #e9e9e980;
        }

        .property {
          background-image: var(--property-image);

          .property-overlay {
            display: block;
          }

          .property-version-info {
            display: block;
          }

          .property-content {
            flex-direction: column;
          }

          .property-title {
            display: flex;
          }
        }
      }

      .property-selector {
        .avatar-desktop-closed {
          display: none;
        }

        .property-select-dropdown {
          display: flex;

          .value-wrapper {
            .avatar-desktop-open {
              width: 34px !important;
              height: 34px !important;
            }

            span {
              max-width: 110px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
}
</style>
