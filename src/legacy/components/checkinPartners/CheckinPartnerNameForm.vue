<template>
  <div class="checkin-partner-name-form">
    <label for="firstname">Nombre</label>
    <InputText id="firstname" v-model="partnerNameEditable.firstname" />

    <label for="lastname">Apellido</label>
    <InputText id="lastname" v-model="partnerNameEditable.lastname" />

    <label for="lastname2">Segundo Apellido</label>
    <InputText id="lastname2" v-model="partnerNameEditable.lastname2" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
export default defineComponent({
  props: {
    partnerNameEditable: {
      type: Object as () => { firstname: string; lastname: string; lastname2: string },
      required: true,
    },
  },
  components: {
    InputText,
  },
});
</script>
<style scoped>
.checkin-partner-name-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: bold;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 15px;
  }
}
@media (min-width: 1024px) {
  .checkin-partner-name-form {
    input {
      width: 400px;
    }
  }
}
</style>
