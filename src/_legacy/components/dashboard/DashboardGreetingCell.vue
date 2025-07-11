<template>
  <div class="greeting cell">
    <div class="bubble-notifications" v-if="numReservationsToAssign > 0">
      <span> {{ numReservationsToAssign }} </span>
    </div>
    <div class="name-notifications">
      <div class="greeting-name">{{ greeting }} {{ activeUser?.userFirstName ?? '' }},</div>
      <div v-if="numReservationsToAssign > 0" class="greeting-notifications">
        tienes {{ numReservationsToAssign }} notificaciones pendientes.
      </div>
      <div v-else class="greeting-notifications">no tienes notificaciones pendientes.</div>
    </div>
    <div class="select-property-desk" v-if="properties.length > 1">
      <AutocompleteComponent
        id="properties-autocomplete"
        :placeholderValue="activeProperty?.name ?? ''"
        placeholderShowingOptions="Buscar propiedad"
        placeholderColor="#000000"
        icon="apartment"
        v-model="selectedPropertyId"
        :items="sortedProperties.map((el) => ({ value: el?.id ?? 0, name: el?.name ?? '' }))"
        iconExpandCollapse
        :showAddNewOption="false"
        :minChars="0"
        :emptyResultsAfterClick="false"
        :top="39"
        :spaceBetweenIconAndInput="0"
      >
        <template #icon>
          <img src="/app-images/property-black.svg" />
        </template>
      </AutocompleteComponent>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/_legacy/store';
import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';

export default defineComponent({
  components: {
    AutocompleteComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const selectedPropertyId = ref(1);

    const properties = computed(() => store.state.properties.properties);
    const activeUser = computed(() => store.state.user.activeUser);
    const activeProperty = computed(() => store.state.properties.activeProperty);

    const sortedProperties = computed(() => {
      const result = store.state.properties.properties.filter(
        (el) => el.id !== activeUser.value?.defaultPropertyId
      );
      const defaultProperty = store.state.properties.properties.find(
        (el) => el.id === activeUser.value?.defaultPropertyId
      );
      if (defaultProperty) {
        result.unshift(defaultProperty);
      }
      return result;
    });
    const numReservationsToAssign = computed(
      () => store.state.notifications.numReservationsToAssign
    );
    const greeting = computed(() => {
      let result = 'Buenas noches';
      const currentTime = new Date().getHours();
      if (currentTime >= 6 && currentTime < 12) {
        result = 'Buenos días';
      }
      if (currentTime >= 12 && currentTime < 19) {
        result = 'Buenas tardes';
      }
      return result;
    });

    watch(selectedPropertyId, async () => {
      if (selectedPropertyId.value !== activeProperty.value?.id && selectedPropertyId.value !== 0) {
        await store.dispatch('properties/setActiveProperty', selectedPropertyId.value);
        void router.push(`/${selectedPropertyId.value}`);
        void store.dispatch('layout/rightDrawerDisplayed', false);
      }
    });

    onMounted(() => {
      if (activeProperty.value?.id) {
        selectedPropertyId.value = activeProperty.value?.id;
      }
    });

    return {
      selectedPropertyId,
      numReservationsToAssign,
      properties,
      greeting,
      activeUser,
      activeProperty,
      sortedProperties,
    };
  },
});
</script>

<style lang="scss" scoped>
.cell {
  border-radius: 20px;
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 8px;
  margin-right: 8px;
}
.greeting {
  grid-area: greeting;
  padding-top: 18px;
  padding-bottom: 13px;
  position: relative;
  background: linear-gradient(90deg, #4bb1e0 13%, #372772 90.5%);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .bubble-notifications {
    position: absolute;
    top: -10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: tomato;
    color: white;
    font-weight: bold;
    padding: 1rem;
  }
  .name-notifications {
    .greeting-name {
      font-size: 18px;
      font-weight: 700;
      line-height: normal;
      color: white;
    }
    .greeting-notifications {
      color: white;
      font-size: 14px;
      font-weight: 400;
      line-height: normal;
    }
  }
  .select-property-desk {
    margin-top: 12px;
    height: 39px;
    font-size: 15px !important;
    z-index: 8;
  }
}

@media (min-width: 768px) {
  .greeting {
    .bubble-notifications {
      height: 25px;
      width: 25px;
      font-size: 16px;
    }
    .name-notifications {
      .greeting-name {
        font-size: 26px;
      }

      .greeting-notifications {
        font-size: 16px;
      }
    }
    .select-property-desk {
      margin-top: 18px;
      font-size: 18px;
    }
  }
}
</style>
