<template>
  <router-view />
  <Spinner :show="showSpinner" />
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from '@/_legacy/store';
import Spinner from '@/_legacy/components/roomdooComponents/SpinnerComponent.vue';

export default defineComponent({
  components: {
    Spinner,
  },
  setup() {
    const store = useStore();

    const showSpinner = computed(() => store.state.layout.showSpinner);

    return {
      showSpinner,
    };
  },
});
</script>
