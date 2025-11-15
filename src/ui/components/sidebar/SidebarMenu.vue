<template>
  <div class="sidebar-separator" />
  <!-- NAVIGATION -->
  <nav class="sidebar-nav" ref="nav" :class="{ 'is-open': isOpen }">
    <!-- DASHBOARD -->
    <router-link
      :to="`/${route.params.pmsPropertyId || ''}`"
      class="nav-link"
      :class="{ 'is-active': isActive('dashboard') }"
    >
      <House :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.dashboard') }}</span>
    </router-link>

    <!-- PLANNING -->
    <router-link
      :to="`/planning${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
      class="nav-link"
      :class="{ 'is-active': isActive('planning') }"
    >
      <CalendarDays :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.planning') }}</span>
    </router-link>

    <!-- CONTACTS -->
    <router-link
      :to="`/contacts${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
      class="nav-link"
      :class="{ 'is-active': isActive('contacts') }"
    >
      <Users :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.contacts.title') }}</span>
    </router-link>

    <!-- TRANSACTIONS -->
    <router-link
      :to="`/transactions${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
      class="nav-link"
      :class="{ 'is-active': isActive('transactions') }"
    >
      <Wallet :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.cashRegister') }}</span>
    </router-link>

    <!-- INVOICES -->
    <router-link
      :to="`/invoices${route.params.pmsPropertyId ? `/${route.params.pmsPropertyId}` : ''}`"
      class="nav-link"
      :class="{ 'is-active': isActive('invoices') }"
    >
      <ReceiptText :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.billing') }}</span>
    </router-link>

    <!-- REPORTS GROUP (THERE IS A REPORT PROPERTY LINK AVAILABLE )-->
    <div
      class="nav-link nav-link-toggle"
      @click="isReportOptionsOpen = !isReportOptionsOpen"
      v-if="pmsPropertyReportLink"
    >
      <ChartNoAxesCombined :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.reportsGroup') }}</span>
      <i class="pi pi-angle-right nav-link-caret" :class="{ 'is-rotated': isReportOptionsOpen }" />
    </div>
    <ul class="submenu" :class="{ 'is-open': isReportOptionsOpen }" v-if="pmsPropertyReportLink">
      <li class="submenu-item">
        <div class="submenu-link" @click="openGenerateReports">
          <FileChartColumnIncreasing :size="14" class="nav-link-icon" />
          <span>{{ t('sidebar.reports') }}</span>
        </div>
      </li>
      <li class="submenu-item">
        <div class="submenu-link" @click="openLink(pmsPropertyReportLink.id)">
          <ChartPie :size="14" class="nav-link-icon" />
          <span>{{ pmsPropertyReportLink.label }}</span>
        </div>
      </li>
    </ul>

    <!-- REPORTS ONLY ONE OPTION (THERE'S NO REPORT PROPERTY LINK AVAILABLE)-->
    <!-- TODO: route to reports -->
    <div
      class="nav-link nav-link-toggle"
      v-if="!pmsPropertyReportLink"
      @click="openGenerateReports"
    >
      <FileChartColumnIncreasing :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.reports') }}</span>
    </div>

    <!-- ONLY ONE LINK -->
    <div
      class="nav-link nav-link-toggle"
      v-if="pmsPropertiesLinks.length === 1"
      @click="openLink(pmsPropertiesLinks[0].id)"
    >
      <ExternalLink :size="14" class="nav-link-icon" />
      <span>{{ pmsPropertiesLinks[0].label }}</span>
    </div>

    <!-- LINKS GROUP (MORE THAN ONE OPTION)-->
    <div
      class="nav-link nav-link-toggle"
      @click="isLinkOptionsOpen = !isLinkOptionsOpen"
      v-if="pmsPropertiesLinks.length > 1"
    >
      <ExternalLink :size="14" class="nav-link-icon" />
      <span>{{ t('sidebar.links') }}</span>
      <i class="pi pi-angle-right nav-link-caret" :class="{ 'is-rotated': isLinkOptionsOpen }" />
    </div>
    <ul
      class="submenu"
      :class="{ 'is-open': isLinkOptionsOpen }"
      v-if="pmsPropertiesLinks.length > 1"
    >
      <li class="submenu-item" v-for="link in pmsPropertiesLinks" :key="link.id">
        <div class="submenu-link" @click="openLink(link.id)">
          <Link :size="14" class="nav-link-icon" />
          <span>{{ link.label }}</span>
        </div>
      </li>
    </ul>
  </nav>
</template>
<script lang="ts">
import { useRoute } from 'vue-router';
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  House,
  CalendarDays,
  Users,
  Wallet,
  ReceiptText,
  ChartNoAxesCombined,
  FileChartColumnIncreasing,
  ChartPie,
  ExternalLink,
  Link,
} from 'lucide-vue-next';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import ReportsBody from '@/ui/components/reports/Reports.vue';
import ReportsHeader from '@/ui/components/reports/ReportsHeader.vue';

export default defineComponent({
  name: 'SidebarMenu',
  components: {
    House,
    CalendarDays,
    Users,
    Wallet,
    ReceiptText,
    ChartNoAxesCombined,
    FileChartColumnIncreasing,
    ChartPie,
    ExternalLink,
    Link,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['hide'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const { openDialog } = useAppDialog();

    const isReportOptionsOpen = ref(false);
    const isLinkOptionsOpen = ref(false);

    const pmsPropertiesLinks = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.filter(
        (link) => !link.isSupportLink && !link.isReportLink,
      ),
    );

    const pmsPropertyReportLink = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isReportLink),
    );

    const isActive = (path: string): boolean => route.name === path;

    const openLink = async (linkId: number): Promise<void> => {
      const currentPmsPropertyId = pmsPropertiesStore.currentPmsPropertyId;
      if (
        typeof currentPmsPropertyId === 'number' &&
        !isNaN(currentPmsPropertyId) &&
        currentPmsPropertyId !== 0
      ) {
        const foundLink = await pmsPropertiesStore.fetchPmsPropertyLink(
          currentPmsPropertyId,
          linkId,
        );
        window.open(foundLink, '_blank');
      }
    };

    const openGenerateReports = (): void => {
      // eslint-disable-next-line no-console
      console.log('Open generate reports modal');
      emit('hide');
      openDialog(ReportsBody, {
        templates: {
          header: ReportsHeader,
        },
        props: { header: 'Generar informes' },
      });
    };

    watch(
      () => props.isOpen,
      (newIsOpen) => {
        if (!newIsOpen) {
          isReportOptionsOpen.value = false;
          isLinkOptionsOpen.value = false;
        }
      },
    );

    return {
      t,
      route,
      // icons
      House,
      CalendarDays,
      Users,
      Wallet,
      ReceiptText,
      ChartNoAxesCombined,
      FileChartColumnIncreasing,
      ChartPie,
      ExternalLink,
      Link,
      /// icons
      pmsPropertiesLinks,
      pmsPropertyReportLink,
      isReportOptionsOpen,
      isLinkOptionsOpen,
      isActive,
      openLink,
      openGenerateReports,
    };
  },
});
</script>
<style lang="scss" scoped>
.sidebar-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin-left: 7px;
  margin-right: 7px;
  margin-bottom: 18px;
}
.sidebar-nav {
  font-size: 14px;
  margin: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 auto;
  padding: 0 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;

  .nav-link,
  .submenu-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
    margin-bottom: 10px;
    cursor: pointer;
    user-select: none;
    // icon
    .nav-link-icon {
      color: #acacac;
      min-width: 14px;
      flex-shrink: 0;
    }
    // text
    span {
      margin-right: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      // border: 1px solid red;
    }

    // caret for toggles
    .nav-link-caret {
      margin-left: auto;
      transition: transform 180ms ease;
      &.is-rotated {
        transform: rotate(90deg);
      }
    }
    // active or hover state
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
  .submenu {
    list-style: none;
    padding-left: 25px;
    overflow: hidden;
    // animation props
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
    // animation transition
    transition:
      max-height 200ms ease,
      opacity 200ms ease,
      transform 200ms ease;
    &.is-open {
      // animation props when open
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
    }
  }
  &.is-open {
    scrollbar-gutter: stable;
  }
}
</style>
