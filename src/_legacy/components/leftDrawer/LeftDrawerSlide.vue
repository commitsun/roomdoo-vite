<template>
  <div class="left-drawer">
    <!-- TOP MENU -->
    <div class="left-drawer-top">
      <!-- LOGO -->
      <div class="logo-container">
        <img src="/logos/logo-black-new.svg" @click="navigateTo(endPath)" />
      </div>
      <!-- OPTION ITEMS -->
      <div class="items-container">
        <div
          @click="navigateTo(endPath)"
          :class="route.fullPath === endPath || route.fullPath === '/' ? 'selected' : ''"
        >
          <div class="icon-dashboard" />
          <span>Dashboard</span>
        </div>
        <div
          @click="navigateTo('/planning' + endPath)"
          :class="
            route.fullPath === '/planning' + endPath || route.fullPath === '/planning'
              ? 'selected'
              : ''
          "
        >
          <div class="icon-planning" />
          <span> Planning de reservas </span>
        </div>

        <div
          @click="navigateTo('/partners' + endPath)"
          :class="
            route.fullPath === '/partners' + endPath || route.fullPath === '/partners'
              ? 'selected'
              : ''
          "
        >
          <div class="icon-clients" />
          <span> Clientes </span>
        </div>
        <div
          @click="navigateTo('/transactions' + endPath)"
          :class="
            route.fullPath === '/transactions' + endPath || route.fullPath === '/transactions'
              ? 'selected'
              : ''
          "
        >
          <div class="icon-cash" />
          <span> Registro de caja </span>
        </div>
        <div
          @click="navigateTo('/invoices' + endPath)"
          :class="
            route.fullPath === '/invoices' + endPath || route.fullPath === '/invoices'
              ? 'selected'
              : ''
          "
        >
          <div class="icon-billing" />
          <span> Facturación </span>
        </div>
        <div @click="isReportsOpened = !isReportsOpened">
          <div class="icon-reports" />
          <span> Informes </span>
          <img
            src="/app-images/dropdown-black.svg"
            class="dropdown-icon"
            :class="isReportsOpened ? 'rotate' : ''"
          />
        </div>

        <!-- transition menu -->
        <div class="report-options" v-if="isReportsOpened">
          <span @click="openReportsDialog('kelly')"> Limpieza </span>
          <span @click="openReportsDialog('arrivals')"> Entradas </span>
          <span @click="openReportsDialog('departures')"> Salidas </span>
          <span @click="openReportsDialog('services')"> Servicios </span>
          <span @click="openReportsDialog('transactions')"> Pagos </span>
          <span @click="openReportsDialog('INE')"> INE </span>
        </div>
      </div>
      <div class="support-menu" @click="openSupportTab()">
        <img src="/app-images/support-icon.svg" />
        <span>Soporte de Roomdoo</span>
      </div>
    </div>
    <!-- BOTTOM MENU -->
    <div class="left-drawer-bottom">
      <!-- OVERLAY WHEN DRAWER IS EXPANDED -->
      <div class="left-drawer-overlay" />
      <!-- PROPERTY INFO  -->
      <div
        class="property-info"
        :class="showUserSettingsModal ? 'user-settings-open' : ''"
        @click="showVersionContIncrement()"
      >
        <span>
          {{ activeProperty?.name }}
        </span>
      </div>
      <!-- NOTIFICATIONS INFO -->
      <div class="notifications" v-if="numReservationsToAssign > 0">
        <img src="/app-images/ring.svg" />
        <div class="bubble-notifications">
          <span> {{ numReservationsToAssign }} </span>
        </div>
      </div>
      <!-- USER INFO -->
      <Transition>
        <div class="user-options" v-if="isSettingsOpened">
          <div class="user-settings" @mousedown="$emit('showUserSettingsModal')">
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
        class="user-container"
        :class="showUserSettingsModal ? 'user-settings-open' : ''"
        @click="isSettingsOpened = !isSettingsOpened"
        tabindex="1"
        @blur="isSettingsOpened = false"
      >
        <div class="avatar-container">
          <img
            class="user-avatar"
            :src="activeUser?.userImageUrl"
            v-if="activeUser?.userImageUrl && activeUser?.userImageUrl !== 'null'"
          />
          <img class="user-avatar" src="/app-images/avatar.png" v-else />
        </div>
        <div class="user-info">
          <div class="user-name">
            {{ activeUser?.userName }}
          </div>
          <div class="user-email">
            <span class="link">
              {{ activeUser?.userEmail }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="showVersionCont > 5" class="version-info">{{ hash }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ReportComponent from '@/_legacy/components/reports/ReportComponent.vue';
import { useStore } from '@/_legacy/store';
import { useSupport } from '@/_legacy/utils/useSupport';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  setup() {
    const hash = import.meta.env.VITE_COMMIT_HASH || 'dev';

    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { openSupportTab } = useSupport();
    const isReportsOpened = ref(false);
    const isSettingsOpened = ref(false);
    const showUserSettingsModal = ref(false);
    const showVersionCont = ref(0);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const activeUser = computed(() => store.state.user.activeUser);

    const numReservationsToAssign = computed(
      () => store.state.notifications.numReservationsToAssign
    );

    const endPath = computed(() => {
      let result = '';
      const indexSlashAndProperty = route.fullPath.search(/\d/);
      if (indexSlashAndProperty !== -1) {
        result = `${route.fullPath.substring(indexSlashAndProperty)}`;
      } else {
        result = '';
      }
      if (route.path !== '/') {
        result = `/${result}`;
      }
      return result;
    });

    const navigateTo = (pathTo: string) => {
      void store.dispatch('layout/leftDrawerDisplayed', false);
      void router.push(pathTo);
    };

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
      } else if (reportType === 'INE') {
        title = 'INE';
      }
      dialogService.open({
        header: title ?? '',
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

    const showVersionContIncrement = () => {
      showVersionCont.value += 1;
    };

    return {
      showVersionCont,
      hash,
      route,
      activeProperty,
      activeUser,
      navigateTo,
      logout,
      isReportsOpened,
      openReportsDialog,
      numReservationsToAssign,
      isSettingsOpened,
      showUserSettingsModal,
      endPath,
      openSupportTab,
      showVersionContIncrement,
    };
  },
});
</script>
<style lang="scss" scoped>
.left-drawer {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 80%;
  max-width: 350px;
  top: 0;
  left: 0;
  background-color: rgb(245, 134, 247);
  z-index: 3;
  user-select: none;
  overflow: scroll;
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    display: none;
  }
  .left-drawer-top {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    background-color: #f0f0f0;
    .logo-container {
      padding: 2rem 0 1rem 1.5rem;
      img {
        height: 40px;
      }
    }
    .items-container {
      margin-left: 0.7rem;
      div {
        display: flex;
        align-items: center;
        margin: 0.6rem 0;
        padding-left: 1rem;
        cursor: pointer;

        div {
          width: 25px;
          height: 25px;
          background-color: #acacac;

          &.icon-dashboard {
            mask: url(/app-images/icon-dashboard-black.svg) no-repeat center / contain;
          }
          &.icon-planning {
            mask: url(/app-images/calendar-grey.svg) no-repeat center / contain;
          }
          &.icon-clients {
            mask: url(/app-images/user-gray.svg) no-repeat center / contain;
          }
          &.icon-reports {
            mask: url(/app-images/graph.svg) no-repeat center / contain;
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
          margin-left: 0.8rem;
          font-size: 14px;
        }
        .dropdown-icon {
          margin-left: 0.5rem;
          padding-top: 0.2rem;
        }
        .rotate {
          margin-top: 0.4rem;
          transform: rotate(180deg);
        }
      }
      .selected {
        font-weight: bold;
        .icon-dashboard {
          mask: url(/app-images/icon-dashboard-black-filled.svg) no-repeat center / contain;
        }
        .icon-planning {
          mask: url(/app-images/calendar-grey-filled.svg) no-repeat center / contain;
        }
        .icon-clients {
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
      }
      .report-options {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-left: 0 2rem 0 0;
        margin-bottom: 0.75rem;
        span {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          width: 100%;
          margin-left: 2.35rem;
        }
      }
    }
    .support-menu {
      background-color: #e9e9e980;
      margin: 0 1rem;
      margin-top: auto;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      height: 35px;
      border-radius: 10px;
      padding-left: 13px;
      img {
        width: 23px;
        height: 23px;
        margin-right: 15px;
      }
    }
  }
  .left-drawer-bottom {
    height: 250px;
    background-image: url('/app-images/property-dummy.png');
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem 0 2rem 0;
    position: relative;
    .property-info,
    .notifications {
      margin-left: 1rem;
    }
    .property-info {
      color: white;
      font-size: 16px;
      display: flex;
      align-items: center;
      z-index: 1;
      img {
        margin-right: 0.5rem;
        width: 25px;
        height: 25px;
      }
      span {
        font-weight: bold;
      }
    }
    .notifications {
      display: flex;
      height: 40px;
      width: 40px;
      border-radius: 11px;
      background-color: #ffffff57;
      justify-content: center;
      align-items: center;
      position: relative;
      user-select: none;
      margin-top: 0.7rem;
      img {
        width: 65%;
      }
      .bubble-notifications {
        position: absolute;
        top: -7px;
        right: -10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: tomato;
        color: white;
        font-size: 0.6rem;
        font-weight: bold;
      }
    }
    .v-enter-active,
    .v-leave-active {
      transition: scaleY 0.2s;
    }
    .v-enter-active,
    .v-leave-active {
      transition: transform 0.2s;
    }
    .v-enter-to,
    .v-leave-from {
      transform: scaleY(1);
    }
    .v-enter-from,
    .v-leave-to {
      transform: scaleY(0);
    }
    .user-options {
      font-size: 14px;
      display: flex;
      flex-direction: column;
      background-color: #f8f8f8;
      border-radius: 10px;
      position: absolute;
      width: calc(100% - 1rem);
      margin: 0 0.5rem;
      bottom: 33%;
      transform-origin: bottom;
      z-index: 50;
      .user-settings {
        padding-top: 17px;
        padding-bottom: 10px;
        display: flex;
        align-items: center;
        font-size: 14px;
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
        margin-bottom: 2rem;
        img {
          margin-left: 26px;
          margin-right: 13px;
          height: 20px;
          width: 20px;
        }
      }
    }
    .user-container {
      color: white;
      font-weight: bold;
      font-size: 0.8rem;
      display: flex;
      padding: 13px 0 0 1rem;
      z-index: 2;
      .avatar-container {
        .user-avatar {
          border-radius: 11px;
          width: 45px;
          height: 45px;
          object-fit: cover;
        }
      }
      .user-info {
        margin-left: 0.5rem;
        padding-top: 2px;
        width: 80%;
        .user-name {
          font-size: 16px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .version-info {
      position: absolute;
      left: 15px;
      bottom: 5px;
      color: white;
      font-size: 12px;
      user-select: text;
    }
    .user-settings-open {
      z-index: 0;
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

/* transitions */
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
