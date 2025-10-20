<template>
  <div class="main-content">
    <div class="title">Ajusta el número de huéspedes de la reserva</div>
    <div class="subtitle">
      El número total de personas no puede exceder la capacidad de la habitación.
    </div>

    <div class="persons">
      <div class="adults">
        <span class="label"> Adultos</span>
        <div class="buttons">
          <button @click="numberAdults--" :disabled="numberAdults === 1">-</button>
          <span class="number">{{ numberAdults }}</span>
          <button @click="numberAdults++" :disabled="numberAdults === maxCapacity">+</button>
        </div>
      </div>
      <div class="children">
        <span class="label"> Niños</span>
        <div class="buttons">
          <button @click="numberChildren--" :disabled="numberChildren === 0">-</button>
          <span class="number">{{ numberChildren }}</span>
          <button @click="numberChildren++" :disabled="numberChildren === 9">+</button>
        </div>
      </div>
    </div>
    <div class="buttons-save">
      <AppButton
        label="Guardar"
        @click="saveAdultsAndChildren()"
        raised
        size="small"
        class="button"
        :disabled="numberAdults === adults && numberChildren === children"
      />
      <AppButton
        label="Cancelar"
        raised
        size="small"
        severity="secondary"
        class="button"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Button from 'primevue/button';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  props: {
    maxCapacity: {
      type: Number,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
    },
    children: {
      type: Number,
      required: true,
    },
  },
  components: {
    AppButton: Button,
  },
  emits: ['close'],
  setup(props, context) {
    const store = useStore();

    const numberAdults = ref(0);
    const numberChildren = ref(0);
    const reservation = computed(() => store.state.reservations.currentReservation);
    const currentFolioId = computed(() => store.state.folios.currentFolio?.id);
    const saveAdultsAndChildren = async () => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('reservations/updateReservation', {
        reservationId: reservation.value?.id,
        adults: numberAdults.value,
        children: numberChildren.value,
      });
      await Promise.all([
        store.dispatch('reservations/fetchReservation', reservation.value?.id),
        store.dispatch('reservations/fetchReservations', currentFolioId.value),
        store.dispatch('checkinPartners/fetchFolioCheckinPartners', currentFolioId.value),
        store.dispatch('checkinPartners/fetchCheckinPartners', reservation.value?.id),
      ]);
      void store.dispatch('layout/showSpinner', false);
      context.emit('close');
    };

    onMounted(() => {
      numberAdults.value = props.adults;
      numberChildren.value = props.children;
    });
    return {
      numberAdults,
      numberChildren,
      saveAdultsAndChildren,
    };
  },
});
</script>

<style scoped lang="scss">
.main-content {
  .title {
    font-weight: bold;
  }
  .persons {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
    .adults,
    .children {
      padding-top: 1rem;
      padding-bottom: 1rem;
      align-self: center;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e1e0e0;
      width: 170px;
      .label {
        font-size: 14px;
        font-weight: bold;
      }
      .buttons {
        display: flex;
        align-items: center;
        button {
          width: 25px;
          height: 25px;
          border-radius: 5px;
          border: none;
          background-color: $primary;
          font-size: 14px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            background-color: #e1e0e0;
            color: $primary;
          }
          &:disabled {
            background-color: #e1e0e0;
            color: #b5b5b5;
            cursor: not-allowed;
          }
        }
        .number {
          font-size: 14px;
          font-weight: bold;
          width: 40px;
          text-align: center;
        }
      }
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .buttons-save {
    margin-top: 2rem;
    .button {
      display: block;
      width: 100%;
      margin-top: 1rem;
      &:first-child {
        margin-top: 0;
      }
      &:disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    .buttons-save {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 0;
      padding-bottom: 0;
      .button {
        width: auto;
        margin: 0;
        margin-left: 1rem;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
