import { useStore } from '@/legacy/store';
import { useRouter } from 'vue-router';
export function usePlanning() {
  const store = useStore();
  const router = useRouter();

  async function refreshPlanning() {
    let apiCalls = [];
    let roomIds;
    if (store.state.planning.filteredRoomIds.length === 0) {
      roomIds = store.state.rooms.rooms.map((room) => room.id);
    } else {
      roomIds = store.state.planning.filteredRoomIds;
    }
    if (router.currentRoute.value.name === 'planning') {
      apiCalls = [
        store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        }),
        store.dispatch('planning/fetchPlanningHeaders', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          roomIds,
        }),
        store.dispatch('planning/fetchPlanningPricesRules', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          pricelistId: store.state.pricelists.activePricelist?.id,
        }),
      ];

      await Promise.all(apiCalls);
    }
  }

  return { refreshPlanning };
}
