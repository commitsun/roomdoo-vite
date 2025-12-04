<template>
  <div class="sidebar-header">
    <div class="logo" :class="{ 'is-open': isOpen }">
      <img src="/logos/logo-text.svg" alt="Roomdoo" />
    </div>
    <Select
      :value="currentPmsProperty"
      @value-change="setCurrentPmsPropertyId($event)"
      :options="pmsProperties"
      optionLabel="name"
      optionValue="id"
      appendTo="self"
      ref="refPropertySelect"
      :class="{ 'is-open': isOpen }"
      :filter="pmsProperties.length > 5"
      :pt="{
        root: {
          class: 'property-select-dropdown',
          style: {
            height: '38px',
            width: '235px',
            color: 'red',
          },
        },
        header: {
          style: {
            padding: '8px',
          },
        },
        label: {
          style: {
            padding: '4px',
          },
        },
        option: {
          style: {
            padding: '4px',
          },
        },
      }"
    >
      <template #value="{ value }">
        <div v-if="currentPmsProperty" class="value-wrapper">
          <Avatar
            :image="
              currentPmsProperty.image
                ? currentPmsProperty.image
                : '/images/default-property-image.svg'
            "
            shape="square"
            :pt="{
              root: {
                style: {
                  width: '28px',
                  height: '28px',
                  overflow: 'hidden',
                },
              },
            }"
          />
          <span>{{ currentPmsProperty.name }}</span>
        </div>
      </template>
      <template #option="{ option }">
        <div class="value-wrapper">
          <Avatar
            :image="option.image ? option.image : '/images/default-property-image.svg'"
            class="avatar-desktop-open property-avatar"
            size="large"
            shape="square"
            :pt="{
              root: {
                style: {
                  width: '28px',
                  height: '28px',
                  overflow: 'hidden',
                },
              },
            }"
          />
          <span>{{ option.name }}</span>
        </div>
      </template>
    </Select>
    <div class="sidebar-separator" />
  </div>
</template>
<script lang="ts">
import Avatar from 'primevue/avatar';
import Select from 'primevue/select';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import { useUIStore } from '@/infrastructure/stores/ui';

export default defineComponent({
  components: {
    Avatar,
    Select,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const route = useRoute();
    const uiStore = useUIStore();

    const router = useRouter();
    const refPropertySelect = ref();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const pmsProperties = computed(() => pmsPropertiesStore.pmsProperties.slice());

    const currentPmsProperty = computed(() =>
      pmsPropertiesStore.pmsProperties.find(
        (p) => p.id === pmsPropertiesStore.currentPmsPropertyId,
      ),
    );

    const setCurrentPmsPropertyId = async (propertyId: number): Promise<void> => {
      await pmsPropertiesStore.setCurrentPmsPropertyId(propertyId);
      await useLegacyStore().setCurrentPmsPropertyId(propertyId);

      const newParams = {
        ...route.params,
        pmsPropertyId: String(propertyId),
      };

      await router.push({
        name: route.name ?? undefined,
        params: newParams,
        query: route.query,
      });

      uiStore.reloadTick++;
    };

    watch(
      () => props.isOpen,
      (newIsOpen) => {
        if (!newIsOpen) {
          refPropertySelect.value.overlayVisible = false;
          refPropertySelect.value.focused = false;
        }
      },
    );
    return {
      refPropertySelect,
      pmsProperties,
      currentPmsProperty,
      setCurrentPmsPropertyId,
    };
  },
});
</script>
<style lang="scss" scoped>
.sidebar-header {
  height: 106px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .logo,
  .property {
    width: 28px;
  }
  .logo {
    overflow-x: hidden;
    border: none;
    margin-left: 14.5px;
    img {
      height: 28px;
      width: auto;
      object-fit: cover;
      object-position: left center;
    }
    &.is-open {
      width: 204px;
    }
  }
  .property-select-dropdown {
    margin-top: 1rem;
    margin-left: 10px;
    border-color: transparent;
    box-shadow: none;
    width: 100%;
    .value-wrapper {
      display: flex;
      align-items: center;
      span {
        margin-left: 10px;
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: white;
      }
    }
    &.is-open {
      // border: 1px solid var(--p-select-border-color);
      box-shadow: var(--p-select-shadow);
      background-color: #eff6ff;
      span {
        color: black;
      }
    }
  }
  .sidebar-separator {
    height: 1px;
    background-color: #e0e0e0;
    margin-left: 7px;
    margin-right: 7px;
  }
}
</style>
