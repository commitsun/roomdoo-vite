<template>
  <div class="reservation-blocked-content">
    <div class="reservation-blocked">
      <div class="first-row">
        {{ firstMessagge }}
      </div>
      <br />
      <div class="second-row">
        {{ secondMessage }}
        <br />
        <br />
        {{ thirdMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  props: {
    isFolio: {
      type: Boolean,
      required: false,
      default: false,
    },
    moreThanOneReservation: {
      type: Boolean,
      required: false,
      default: false,
    },
    agencyName: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const firstMessagge = ref('');
    const secondMessage = ref('');
    const thirdMessage = ref('');
    onMounted(() => {
      if (props.isFolio && props.moreThanOneReservation) {
        firstMessagge.value = 'No es posible cancelar alguna de las reservas';
      } else {
        firstMessagge.value = 'No es posible cancelar la reserva';
      }
      if (props.agencyName) {
        if (props.isFolio && props.moreThanOneReservation) {
          secondMessage.value = `Alguna de las reservas ha sido vendida por ${props.agencyName} y algunas modificaciones están bloqueadas en Roomdoo.`;
          thirdMessage.value = `Por favor, informe al cliente de que para cancelar las reservas, debe realizarlo directamente a través de ${props.agencyName}.`;
        } else {
          secondMessage.value = `La reserva ha sido vendida por ${props.agencyName} y algunas modificaciones están bloqueadas en Roomdoo.`;
          thirdMessage.value = `Por favor, informe al cliente de que para cancelar la reserva, debe realizarlo directamente a través de ${props.agencyName}.`;
        }
      } else {
        if (props.isFolio && props.moreThanOneReservation) {
          secondMessage.value = `Alguna de las reservas está bloqueada en Roomdoo.`;
        } else {
          secondMessage.value = `La reserva está bloqueada en Roomdoo.`;
        }
      }
    });
    return {
      firstMessagge,
      secondMessage,
      thirdMessage,
    };
  },
});
</script>
<style lang="scss" scoped>
.reservation-blocked-content {
  width: 100%;
  text-align: justify;

  .reservation-blocked {
    .first-row {
      width: 100%;
      font-size: 1rem;
      font-weight: bold;
    }
    .second-row {
      font-size: 1rem;
      width: 100%;
      .agency-name {
        font-weight: bold;
      }
    }
  }
}
@media (min-width: 1024px) {
  .reservation-blocked-content {
    max-width: 600px;
  }
}
</style>
