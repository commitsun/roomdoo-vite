<template>
  <div class="support-link" v-if="pmsPropertySupportLink">
    <Headset :size="14" class="nav-link-icon" />
    <span>{{ pmsPropertySupportLink.label }}</span>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Headset } from 'lucide-vue-next';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
export default defineComponent({
  name: 'SidebarSupport',
  components: {
    Headset,
  },
  setup() {
    const pmsPropertiesStore = usePmsPropertiesStore();

    const pmsPropertySupportLink = computed(() =>
      pmsPropertiesStore.pmsPropertyLinks.find((link) => link.isSupportLink),
    );
    return {
      pmsPropertySupportLink,
    };
  },
});
</script>
<style lang="scss" scoped>
.support-link {
  user-select: none;
  margin: 1rem;
  margin-bottom: 7rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0 0.5rem;
  overflow-x: hidden;
  min-height: 21px;
  .nav-link-icon {
    color: #acacac;
    min-width: 14px;
    flex-shrink: 0;
  }
  span {
    margin-right: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:hover {
    cursor: pointer;
    .nav-link-icon {
      color: black;
    }
    span {
      font-weight: bold;
    }
  }
}
</style>
