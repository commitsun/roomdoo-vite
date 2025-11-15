<template>
  <div class="sidebar-header">
    <div class="logo" :class="{ 'is-open': isOpen }">
      <img src="/logos/logo-black-new.svg" alt="Roomdoo" />
    </div>
    <Select
      :value="currentPmsProperty"
      :options="pmsProperties"
      optionLabel="name"
      optionValue="id"
      appendTo="self"
      ref="refPropertySelect"
      :class="{ 'is-open': isOpen }"
      :pt="{
        root: {
          class: 'property-select-dropdown',
          style: {
            height: '38px',
            width: '235px',
            marginBottom: '23px',
            color: 'red',
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
            :image="currentPmsProperty.image"
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
            :image="option.image"
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
  </div>
</template>
<script lang="ts">
import Avatar from 'primevue/avatar';
import Select from 'primevue/select';
import { computed, defineComponent, ref, watch } from 'vue';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

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
    const refPropertySelect = ref();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const pmsProperties = computed(() => pmsPropertiesStore.pmsProperties.slice());

    const currentPmsProperty = computed(() =>
      pmsPropertiesStore.pmsProperties.find(
        (p) => p.id === pmsPropertiesStore.currentPmsPropertyId,
      ),
    );

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
      pmsProperties,
      currentPmsProperty,
      refPropertySelect,
    };
  },
});
</script>
<style lang="scss" scoped>
.sidebar-header {
  .logo,
  .property {
    width: 28px;
  }
  .logo {
    margin-bottom: 12px;
    overflow-x: hidden;
    border: none;
    margin-left: 14.5px;
    margin-top: 17.5px;
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
      border: 1px solid var(--p-select-border-color);
      box-shadow: var(--p-select-shadow);
      span {
        color: black;
      }
    }
  }
}
</style>
