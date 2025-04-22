<template>
  <div class="container-left-drawer-fixed" @mouseenter="isOpen = true" @mouseleave="closeExpanded">
    <div class="top" v-if="!isOpen">
      <div class="logo" />
      <div class="items">
        <!-- dashboard -->
        <div
          class="item-container"
          :class="route.fullPath === '/' || route.fullPath === endPath ? 'selected' : ''"
        >
          <div class="item icon-dashboard" />
        </div>
        <!-- planning -->
        <div
          class="item-container"
          :class="
            route.fullPath === '/planning' + endPath || route.fullPath === '/planning'
              ? 'selected'
              : ''
          "
        >
          <div class="item icon-planning" />
        </div>
        <!-- partners -->
        <div
          class="item-container"
          :class="
            route.fullPath === '/partners' + endPath || route.fullPath === '/partners'
              ? 'selected'
              : ''
          "
        >
          <div class="item icon-partners" />
        </div>
        <!-- cash register -->
        <div
          class="item-container"
          :class="
            route.fullPath === '/transactions' || route.fullPath === '/transactions' + endPath
              ? 'selected'
              : ''
          "
        >
          <div class="item icon-cash" />
        </div>
        <!-- billing -->
        <div
          class="item-container"
          :class="
            route.fullPath === '/invoices' || route.fullPath === '/invoices' + endPath
              ? 'selected'
              : ''
          "
        >
          <div class="item icon-billing" />
        </div>
        <!-- reports -->
        <div class="item-container">
          <div class="item icon-reports" />
        </div>
      </div>
    </div>
    <div class="support-menu-collapsed" v-if="!isOpen">
      <img src="/app-images/support-icon.svg" />
    </div>
    <div class="bottom" v-if="!isOpen">
      <div class="user-container">
        <div class="avatar-container">
          <img
            class="user-avatar"
            :src="activeUser?.userImageUrl"
            v-if="activeUser?.userImageUrl && activeUser?.userImageUrl !== 'null'"
          />
          <img v-else class="user-avatar" src="/app-images/avatar.png" />
        </div>
      </div>
    </div>
    <div class="container-expanded" v-show="isOpen">
      <div class="top">
        <div class="logo-expanded" @click="navigateTo(endPath)">
          <img src="/logos/logo-black-new.svg" alt="logo" />
        </div>
        <div class="items">
          <div
            class="item-container"
            :class="route.fullPath === '/' || route.fullPath === endPath ? 'selected' : ''"
            @click="navigateTo(endPath)"
          >
            <div class="item icon-dashboard" />
            <span>Dashboard</span>
          </div>
          <div
            class="item-container"
            :class="
              route.fullPath === '/planning' + endPath || route.fullPath === '/planning'
                ? 'selected'
                : ''
            "
            @click="navigateTo('/planning' + endPath)"
          >
            <div class="item icon-planning" />
            <span>Calendario de reservas</span>
          </div>
          <div
            class="item-container"
            :class="
              route.fullPath === '/partners' + endPath || route.fullPath === '/partners'
                ? 'selected'
                : ''
            "
            @click="navigateTo('/partners' + endPath)"
          >
            <div class="item icon-partners" />
            <span>Clientes</span>
          </div>
          <div
            class="item-container"
            :class="
              route.fullPath === '/transactions' || route.fullPath === '/transactions' + endPath
                ? 'selected'
                : ''
            "
            @click="navigateTo('/transactions' + endPath)"
          >
            <div class="item icon-cash" />
            <span>Registro de caja</span>
          </div>
          <div
            class="item-container"
            :class="
              route.fullPath === '/invoices' || route.fullPath === '/invoices' + endPath
                ? 'selected'
                : ''
            "
            @click="navigateTo('/invoices' + endPath)"
          >
            <div class="item icon-billing" />
            <span>Facturación</span>
          </div>
          <div
            class="item-container"
            :class="isReportsOpened ? 'reports-opened' : ''"
            @click="isReportsOpened = !isReportsOpened"
          >
            <div class="item icon-reports" :class="isReportsOpened ? 'selected' : ''" />
            <span :class="isReportsOpened ? 'reports-opened' : ''"> Informes </span>
            <div :class="isReportsOpened ? 'rotate' : ''" class="dropdown-icon" />
          </div>
          <div class="report-options" v-if="isReportsOpened">
            <span @click="openReportsDialog('kelly')"> Limpieza </span>
            <span @click="openReportsDialog('arrivals')"> Entradas </span>
            <span @click="openReportsDialog('departures')"> Salidas </span>
            <span @click="openReportsDialog('services')"> Servicios </span>
            <span @click="openReportsDialog('transactions')"> Pagos </span>
            <span @click="openReportsDialog('traveller')"> Parte de viajeros </span>
            <span @click="openReportsDialog('INE')"> INE </span>
          </div>
          <div
            class="item-container hidden"
            :class="route.fullPath === '/settings' ? 'selected' : ''"
            @click="navigateTo('/settings' + endPath)"
          >
            <div class="item icon-settings" />
            <span>Ajustes</span>
          </div>
        </div>
      </div>
      <div class="support-menu" @click="openSupportTab()">
        <img src="/app-images/support-icon.svg" />
        <span>Soporte de Roomdoo</span>
      </div>
      <div
        class="bottom-expanded"
        :style="{ backgroundImage: `url(${activeProperty?.hotelImageUrl})` }"
      >
        <div class="left-drawer-overlay" />
        <Transition name="user-options-transition">
          <div class="user-options" v-if="isSettingsOpened">
            <div class="user-settings" @mousedown="openSettingsModal">
              <img src="/app-images/user-settings.svg" />
              <span>Configuración</span>
            </div>
            <div class="logout" @mousedown="logout()">
              <img src="/app-images/logout.svg" />
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </Transition>
        <div
          class="user-container-expanded"
          @click="isSettingsOpened = !isSettingsOpened"
          @blur="isSettingsOpened = false"
          tabindex="1"
        >
          <div class="avatar-container-expanded">
            <img
              class="user-avatar-expanded"
              :src="activeUser?.userImageUrl"
              v-if="activeUser?.userImageUrl && activeUser?.userImageUrl !== 'null'"
            />
            <img class="user-avatar-expanded" src="/app-images/avatar.png" v-else />
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ activeUser?.userName }}
            </div>
            <div class="user-email">
              <span>
                {{ activeUser?.userEmail }}
              </span>
            </div>
          </div>
        </div>
        <div class="property-info">
          <img src="/app-images/property-white.svg" />
          <span>
            {{ activeProperty?.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div>
    <UserSettingsModal v-if="showUserSettingsModal" @close="showUserSettingsModal = false" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/store';
import ReportComponent from '@/components/reports/ReportComponent.vue';
import UserSettingsModal from '@/components/users/UserSettings.vue';
import { useSupport } from '@/utils/useSupport';
import { dialogService } from '@/services/DialogService';

export default defineComponent({
  components: {
    UserSettingsModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { openSupportTab } = useSupport();

    const isOpen = ref(false);
    const isReportsOpened = ref(false);
    const isSettingsOpened = ref(false);
    const showUserSettingsModal = ref(false);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activeUser = computed(() => store.state.user.activeUser);

    const endPath = computed(() => {
      let result = '';
      const indexSlashAndProperty = route.fullPath.search(/\d/);
      if (indexSlashAndProperty !== -1) {
        result = `${route.fullPath.substring(indexSlashAndProperty)}`;
      } else {
        result = '';
      }
      result = `/${result}`;

      return result;
    });

    const openReportsDialog = (reportType: string) => {
      let title;
      if (reportType === 'kelly') {
        title = 'INFORME DE LIMPIEZA';
      } else if (reportType === 'arrivals') {
        title = 'INFORME DE ENTRADAS';
      } else if (reportType === 'departures') {
        title = 'INFORME DE SALIDAS';
      } else if (reportType === 'services') {
        title = 'INFORME DE SERVICIOS';
      } else if (reportType === 'transactions') {
        title = 'INFORME DE PAGOS';
      } else if (reportType === 'traveller') {
        title = 'INFORME DE PARTE DE VIAJEROS';
      } else if (reportType === 'INE') {
        title = 'INE';
      } else {
        title = 'INFORME';
      }
      dialogService.open({
        header: title,
        content: markRaw(ReportComponent),
        closable: true,
        props: {
          reportType,
        },
      });
    };

    const logout = async () => {
      await store.dispatch('user/reset', {});
      await store.dispatch('properties/reset', {});
      void router.push('/login');
    };

    const closeExpanded = () => {
      isOpen.value = false;
      isReportsOpened.value = false;
      isSettingsOpened.value = false;
    };

    const navigateTo = (pathTo: string) => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
      void router.push(pathTo);
    };

    const openSettingsModal = () => {
      showUserSettingsModal.value = true;
    };

    return {
      route,
      activeUser,
      activeProperty,
      openReportsDialog,
      isReportsOpened,
      isSettingsOpened,
      showUserSettingsModal,
      logout,
      isOpen,
      closeExpanded,
      navigateTo,
      openSettingsModal,
      endPath,
      openSupportTab,
    };
  },
});
</script>

<style lang="scss" scoped>
.container-left-drawer-fixed {
  user-select: none;
  height: 97vh;
  width: 57px;
  display: flex;
  flex-direction: column;
  .top {
    z-index: 410;
    flex: 1;
    background-color: white;
    padding-top: 0.5rem;
    border-radius: 12px 12px 0 0;
    position: relative;
    .logo,
    .logo-expanded {
      cursor: pointer;
      display: flex;
      margin-top: 1rem;
      width: 100%;
      height: 35px;
    }
    .logo {
      overflow-x: hidden;
      background-image: url('/logos/logo-black-new.svg');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: 0.825rem;
    }
    .logo-expanded {
      height: 35px;
      padding-left: 0.85rem;
    }
    .items {
      margin-top: 3rem;
      margin-left: 0.65rem;
      display: flex;
      flex-direction: column;
      .item-container {
        cursor: pointer;
        height: 2.5rem;
        width: auto;
        color: white;
        border-radius: 9px;
        display: flex;
        align-items: center;
        margin: 0 0.6rem 0.75rem 0.6rem;
        .item {
          background-color: #acacac;
          height: 1.5rem;
          width: 1.5rem;
          &.icon-dashboard {
            mask: url(/app-images/icon-dashboard-black.svg) no-repeat center / contain;
          }
          &.icon-planning {
            mask: url(/app-images/calendar-grey.svg) no-repeat center / contain;
          }
          &.icon-partners {
            mask: url(/app-images/user-gray.svg) no-repeat center / contain;
          }
          &.icon-reports {
            mask: url(/app-images/graph.svg) no-repeat center / contain;
            &.selected {
              background-color: black;
            }
          }
          &.icon-cash {
            mask: url(/app-images/euro.svg) no-repeat center / contain;
          }
          &.icon-billing {
            mask: url(/app-images/bill.svg) no-repeat center / contain;
          }
          &.icon-settings {
            mask: url(/app-images/settings.svg) no-repeat center / contain;
          }
        }
        span {
          color: #4f4f4f;
          margin-left: 0.8rem;
        }
        .dropdown-icon {
          margin-left: 0.5rem;
          margin-top: 0.3rem;
          height: 9px;
          width: 9px;
          mask: url(/app-images/dropdown-black.svg) no-repeat center / contain;
          background-color: #4f4f4f;
        }
        .rotate {
          margin-top: 0.3rem;
          transform: rotate(-180deg);
        }
        .reports-opened {
          font-weight: bold;
        }
        &.selected {
          color: black;
          font-weight: bold;
          .icon-dashboard {
            mask: url(/app-images/icon-dashboard-black-filled.svg) no-repeat center / contain;
          }
          .icon-planning {
            mask: url(/app-images/calendar-grey-filled.svg) no-repeat center / contain;
          }
          .icon-partners {
            mask: url(/app-images/user-gray-filled.svg) no-repeat center / contain;
          }
          .icon-cash {
            mask: url(/app-images/euro-filled.svg) no-repeat center / contain;
          }
          .icon-billing {
            mask: url(/app-images/bill-filled.svg) no-repeat center / contain;
          }
          div {
            background-color: black;
          }
          span {
            color: black;
          }
        }
        &:not(.selected):hover {
          .item {
            background-color: black;
          }
          span {
            font-weight: bold;
          }
          .dropdown-icon {
            background-color: black;
          }
        }
      }
      .reports-opened {
        margin-bottom: 0;
      }
    }
  }
  .support-menu {
    background-color: #e9e9e980;
    margin-bottom: 20px;
    margin-left: 0.65rem;
    padding-left: 0.5rem;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    height: 35px;
    border-radius: 10px;
    cursor: pointer;
    img {
      width: 25px;
      height: 25px;
      margin-right: 15px;
    }
    &:hover {
      font-weight: bold;
    }
  }
  .support-menu-collapsed {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    padding-left: 1.15rem;
    background-color: white;
    height: 35px;
    border-radius: 12px;
    img {
      width: 25px;
      height: 25px;
    }
  }
  .bottom {
    height: 250px;
    z-index: 410;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-direction: column-reverse;
    background-color: white;
    padding: 1rem 0.3rem 2rem 0;
    align-items: center;
    border-radius: 0 0 12px 12px;
    .user-container {
      color: white;
      font-weight: bold;
      font-size: 0.8rem;
      display: flex;
      margin-left: 1.2rem;
      margin-right: 0.7rem;
      border-radius: 0 10px 10px 0;
      height: 60px;
      width: 100%;
      .avatar-container {
        width: 100%;
        display: flex;
        align-items: center;
        .user-avatar {
          border-radius: 11px;
          width: 45px;
          height: 45px;
          object-fit: cover;
        }
      }
    }
  }

  .container-expanded {
    position: absolute;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      height: 0;
      width: 0;
      display: none;
    }
    &::-webkit-scrollbar-thumb {
      display: none;
    }
    top: 0;
    left: 0;
    z-index: 409;
    height: 97vh;
    width: 230px;
    background-color: white;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    margin: 0.5rem 0 0.5rem 0.48rem;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
    margin-top: 15px;
    .report-options {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-left: 35px;
      max-height: 500px;
      transition: all 0.5s;
      padding-top: -10px;
      font-size: 13px;
      span {
        padding-left: 1rem;
        margin-bottom: 0.5rem;
        width: 100%;
        cursor: pointer;
        &:hover {
          font-weight: bold;
        }
      }
    }
    .bottom-expanded {
      z-index: 410;
      height: 250px;
      background-repeat: none;
      background-size: cover;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      position: relative;
      padding: 1rem 0.3rem 2rem 0;
      .property-info {
        margin-left: 1.3rem;
        color: white;
        font-size: 16px;
        display: flex;
        align-items: center;
        z-index: 409;
        height: 48px;
        img {
          margin-right: 0.5rem;
          width: 25px;
          height: 25px;
        }
        span {
          font-weight: bold;
        }
      }
      .user-options {
        color: black;
        font-size: 14px;
        display: flex;
        flex-direction: column;
        background-color: #f8f8f8;
        border-radius: 10px;
        position: absolute;
        width: calc(96% - 5px);
        margin-left: 7px;
        bottom: 34%;
        transform-origin: bottom;
        .user-settings {
          padding-top: 17px;
          padding-bottom: 10px;
          display: flex;
          align-items: center;
          font-size: 14px;
          cursor: pointer;
          &:hover {
            font-weight: bold;
          }
          img {
            margin-left: 23px;
            margin-right: 13px;
            height: 23px;
            width: 23px;
          }
        }
        .logout {
          padding-top: 10px;
          display: flex;
          align-items: center;
          font-size: 14px;
          margin-bottom: 1.5rem;
          cursor: pointer;
          &:hover {
            font-weight: bold;
          }
          img {
            margin-left: 26px;
            margin-right: 13px;
            height: 20px;
            width: 20px;
          }
        }
      }
      .user-container-expanded {
        color: white;
        font-weight: bold;
        border-radius: 10px;
        z-index: 9;
        height: 60px;
        width: 100%;
        display: flex;
        align-items: center;
        cursor: pointer;
        .avatar-container-expanded {
          display: flex;
          .user-avatar-expanded {
            border-radius: 11px;
            width: 45px;
            height: 45px;
            margin-left: 4px;
            object-fit: cover;
          }
        }
        .user-info {
          margin-left: 6px;
          width: 73%;
          .user-name {
            font-size: 14px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .user-email {
            font-size: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
      .left-drawer-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        opacity: 0.6;
      }
    }
  }
}
/* transitions */

.ffade-out-enter-active,
.ffade-out-leave-active {
  transition: opacity 0.18s ease;
}

.ffade-out-enter-from,
.ffade-out-leave-to {
  opacity: 0;
}

.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.18s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}
.user-options-transition-enter-active,
.user-options-transition-leave-active {
  transition: scaleY 0.2s;
}
.user-options-transition-enter-active,
.user-options-transition-leave-active {
  transition: transform 0.2s;
}
.user-options-transition-enter-to,
.user-options-transition-leave-from {
  transform: scaleY(1);
}
.user-options-transition-enter-from,
.user-options-transition-leave-to {
  transform: scaleY(0);
}

.settings-modal-transition-enter-active,
.settings-modal-transition-leave-active {
  transition: all 0.2s;
}
.settings-modal-transition-enter-to,
.settings-modal-transition-leave-from {
  -webkit-transform: scale(1);
  transform: scale(1);
  opacity: 1;
}
.settings-modal-transition-enter-from,
.settings-modal-transition-leave-to {
  opacity: 0;
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
