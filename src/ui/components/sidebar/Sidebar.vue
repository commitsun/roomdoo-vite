<template>
  <div
    class="sidebar"
    @mouseenter="openSidebar"
    @mouseleave="closeSidebar"
    :class="{ 'is-open': isOpen }"
  >
    <div>
      <SidebarHeader :isOpen="isOpen" />
      <SidebarMenu :isOpen="isOpen" @hide="$emit('hide')" />
    </div>
    <div>
      <SidebarSupport />
      <SidebarFooter :isOpen="isOpen" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

import SidebarHeader from './SidebarHeader.vue';
import SidebarMenu from './SidebarMenu.vue';
import SidebarSupport from './SidebarSupport.vue';
import SidebarFooter from './SidebarFooter.vue';

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
  setup(props) {
    const isOpen = ref(false);
    const openSidebar = (): void => {
      isOpen.value = true;
    };
    const closeSidebar = (): void => {
      isOpen.value = false;
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
      openSidebar,
      closeSidebar,
    };
  },
});
</script>
<style lang="scss" scoped>
.sidebar {
  font-size: 14px;
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
