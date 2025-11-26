<template>
  <div
    class="sidebar"
    @mouseenter="openSidebar"
    @mouseleave="closeSidebar"
    :class="{ 'is-open': isOpen }"
  >
    <SidebarHeader :isOpen="isOpen" />
    <SidebarMenu
      :isOpen="isOpen"
      :pmsPropertiesLinks="pmsPropertiesLinks"
      :pmsPropertyReportLink="pmsPropertyReportLink"
      @hide="$emit('hide')"
      @openLink="openLink($event)"
    />
    <SidebarFooter
      :isOpen="isOpen"
      :pmsPropertySupportLink="pmsPropertySupportLink"
      @openLink="openLink($event)"
      @hide="hide()"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';

import SidebarHeader from './SidebarHeader.vue';
import SidebarMenu from './SidebarMenu.vue';
import SidebarSupport from './SidebarSupport.vue';
import SidebarFooter from './SidebarFooter.vue';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

export default defineComponent({
  name: 'Sidebar',
  components: {
    SidebarHeader,
    SidebarMenu,
    SidebarSupport,
    SidebarFooter,
  },
  props: {
    menuOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['hide'],
  setup(props, context) {
    const pmsPropertiesStore = usePmsPropertiesStore();
    const isOpen = ref(false);

    const pmsPropertiesLinks = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.filter(
        (link) => !link.isSupportLink && !link.isReportLink,
      ),
    );

    const pmsPropertySupportLink = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isSupportLink),
    );

    const pmsPropertyReportLink = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isReportLink),
    );

    const openSidebar = (): void => {
      isOpen.value = true;
    };
    const closeSidebar = (): void => {
      isOpen.value = false;
    };
    const openLink = async (linkId: number): Promise<void> => {
      // eslint-disable-next-line no-console
      console.log('openLink called with linkId:', linkId);
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
    const hide = (): void => {
      isOpen.value = false;
      context.emit('hide');
    };
    watch(
      () => props.menuOpen,
      (newVal) => {
        isOpen.value = newVal;
      },
      { immediate: true },
    );
    return {
      isOpen,
      pmsPropertiesLinks,
      pmsPropertySupportLink,
      pmsPropertyReportLink,
      openSidebar,
      closeSidebar,
      openLink,
      hide,
    };
  },
});
</script>
<style lang="scss" scoped>
.sidebar {
  font-size: 14px;
  padding: 1rem 0;
  position: absolute;
  top: 0;
  left: 0;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 57px;
  overflow: hidden;
  background-color: white;
  z-index: 1001;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition:
    width 0.3s ease,
    transform 0.3s ease;
  &.is-open {
    display: flex;
    width: 254px;
    transform: translateX(0);
  }
}
@media (min-width: 1024px) {
  .sidebar {
    display: flex;
    width: 57px;
    transform: translateX(0);
    &.is-open {
      width: 254px;
    }
  }
}
</style>
