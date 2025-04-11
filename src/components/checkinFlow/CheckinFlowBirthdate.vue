<template>
  <div class="page-container">
    <div class="prev-title">
      Datos {{ currentIndexCheckin + 1
      }}<sup class="sup">{{
        currentIndexCheckin === 0 || currentIndexCheckin === 2 ? 'er' : 'o'
      }}</sup>
      huésped
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">
        Fecha de nacimiento
        <span class="asterisk">*</span>
      </span>
    </div>
    <span class="step-subtitle"> Introduce la fecha de nacimiento del huésped </span>
    <div class="date-input">
      <InputDate
        id="birthdate-input"
        ref="birthDateInputRef"
        v-model="birthdate"
        class="input"
        :includeCalendar="true"
        :openYearViewFirst="true"
        :firstYearInRange="new Date().getFullYear() - 40"
        placeholder="DD/MM/AAAA"
        placeholderBlue
        textColor="primary"
        @dateSelected="birthdate = $event"
        @enter="nextAndSave()"
        @keydown.esc="$emit('closeCheckinFlow')"
        @badFormatting="isBirthdateWrongFormat = $event"
      />
    </div>
    <!-- not valid age -->
    <div v-if="notValidAge" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span>
        La fecha de nacimiento no puede ser posterior a la fecha actual ni anterior a 120 años
      </span>
    </div>
    <!-- not an adult and not adults in folio-->
    <div v-else-if="isUnderAge && !areThereAnyAdultsInFolio" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span> Primero debes registrar un adulto </span>
    </div>
    <!-- not an adult and there are adults in folio-->
    <div v-else-if="isUnderAge && areThereAnyAdultsInFolio" class="input-warning">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#FFA500"
        width="12px"
        height="12px"
      />
      <span> Estás registrando a un menor. Deberás vincularlo a un adulto responsable. </span>
    </div>
    <!-- not a valid date -->
    <div v-if="isBirthdateWrongFormat" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span> El formato de fecha es incorrecto </span>
    </div>
    <div class="btn-continue-container">
      <button class="btn-continue" @click="nextAndSave()" v-if="canProceedToNextStep">
        Aceptar
      </button>
      <div v-else class="empty-div" />
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  type Ref,
  type PropType,
  computed,
  type ComponentPublicInstance,
} from 'vue';
import InputDate from '@/components/roomdooComponents/InputDate.vue';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import utilsDates from '@/utils/dates';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    InputDate,
    CustomIcon,
  },

  props: {
    modelValue: {
      type: [Date, null] as PropType<Date | null>,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      required: false,
    },
    reservationId: {
      type: Number,
      required: false,
    },
    reservationToken: {
      type: String,
      required: false,
    },
  },

  setup(props, context) {
    const store = useStore();

    let hasEmittedNext = false;
    const birthdate: Ref<Date | undefined> = ref(props.modelValue ?? undefined);
    const isBirthdateWrongFormat = ref(false);
    const birthDateInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const { yearsFrom } = utilsDates;

    const notValidAge = computed(() => {
      let result = false;
      if (birthdate.value) {
        if (yearsFrom(birthdate.value) > 120 || yearsFrom(birthdate.value) < 0) {
          result = true;
        }
      }
      return result;
    });

    const isUnderAge = computed(() => {
      let result = false;
      if (birthdate.value) {
        if (yearsFrom(birthdate.value) < 18) {
          result = true;
        }
      }
      return result;
    });

    const areThereAnyAdultsInFolio = computed(() => {
      let result = false;
      if (props.isPrecheckin) {
        result = store.state.precheckin.areThereAnyAdultsInFolio;
      } else if (store.state.folios.currentFolio) {
        result = store.state.folios.adultsInFolio.length > 0;
      }
      return result;
    });

    const canProceedToNextStep = computed(
      () =>
        birthdate.value &&
        !notValidAge.value &&
        !isBirthdateWrongFormat.value &&
        ((isUnderAge.value && areThereAnyAdultsInFolio.value) || !isUnderAge.value)
    );

    const nextAndSave = () => {
      if (canProceedToNextStep.value && !hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
      }
    };

    watch(birthdate, async () => {
      if (birthdate.value && !notValidAge.value && !isBirthdateWrongFormat.value) {
        context.emit('update:modelValue', birthdate.value);
        if (props.isPrecheckin) {
          await store.dispatch('precheckin/checkSomeAdultsInFolio', {
            reservationId: props.reservationId,
            token: props.reservationToken,
          });
        } else if (store.state.folios.currentFolio) {
          await store.dispatch('folios/fetchAdultsInFolio', store.state.folios.currentFolio.id);
        }
      } else {
        context.emit('update:modelValue', null);
      }
    });

    watch(canProceedToNextStep, (value) => {
      if (value) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
    });

    onMounted(() => {
      if (props.modelValue) {
        birthdate.value = props.modelValue;
      }
      birthDateInputRef.value?.focus();
    });

    return {
      birthdate,
      notValidAge,
      isUnderAge,
      isBirthdateWrongFormat,
      areThereAnyAdultsInFolio,
      canProceedToNextStep,
      birthDateInputRef,
      nextAndSave,
    };
  },
});
</script>
<style scoped lang="scss">
.page-container {
  width: 100%;
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  // prev-title
  .prev-title {
    width: 100%;
    text-align: center;
    sup {
      text-decoration: underline;
      font-size: 0.5rem;
    }
  }
  // title
  .step-title {
    width: 100%;
    display: flex;
    margin: 0 1rem;
    .step {
      color: $primary;
      display: flex;
      align-items: center;
      font-size: 20px;
      margin-right: 0.75rem;
      img {
        transform: rotate(180deg);
        width: 16px;
        height: 16px;
      }
    }
    .title-text {
      font-size: 20px;
      font-weight: bold;
      .asterisk {
        color: #ed4a1c;
      }
    }
  }

  // subtitle
  .step-subtitle {
    width: 100%;
    font-size: 13px;
    color: #4f4f4f;
    margin: 0 1rem;
  }

  .date-input {
    height: 45px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 1rem;
    .input {
      border: none;
      font-size: 20px;
      border-bottom: 1px solid #cae8f5;
      margin-top: 30px;
      color: $primary;
      width: 100%;
      &:focus {
        outline: none;
        border-bottom: 1px solid $primary;
      }
    }
    .input::placeholder {
      color: #cae8f5;
    }
  }

  .input-error,
  .input-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-align: center;
    span {
      margin-left: 10px;
      font-size: 14px;
    }
  }
  .input-error {
    color: #982113;
    background-color: #f3e3e3;
  }
  .input-warning {
    color: #ffa500;
    background-color: #fff3e0;
  }

  .btn-continue-container {
    display: flex;
    justify-content: center;
    align-items: center;
    .btn-continue {
      width: 160px;
      height: 40px;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-top: 30px;
      visibility: visible;
      border: none;
    }
    .empty-div {
      width: 160px;
      height: 40px;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 30px;
    }
  }
}

@media (min-width: 1024px) {
  .page-container {
    justify-content: center;
    // prev-title
    .prev-title {
      align-self: center;
      color: #8b8a8d;
      font-weight: 600;
      margin-bottom: 1rem;
      margin-left: 0;
      sup {
        font-size: 0.75rem;
      }
    }

    // title
    .step-title {
      width: auto;
      font-size: 25px;
      .step {
        font-size: 25px;
        align-self: center;
        img {
          width: 14px;
          height: 14px;
        }
      }
      .title-text {
        font-size: 25px;
        width: 100%;
      }
    }

    // subtitle
    .step-subtitle {
      width: auto;
      font-size: 18px;
    }

    .date-input {
      width: 500px;
      .input {
        border: none;
        font-size: 30px;
        border-bottom: 1px solid #cae8f5;
        margin-top: 30px;
        color: $primary;
        width: 100%;
        &:focus {
          outline: none;
          border-bottom: 1px solid $primary;
        }
      }
      .input::placeholder {
        color: #cae8f5;
      }
    }
    .input-error {
      span {
        font-size: 12px;
        text-align: center;
      }
    }

    .btn-continue {
      width: 160px;
      height: 40px;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-top: 30px;
      visibility: visible;
      border: none;
    }
  }
}
/* registrar adulto */
</style>
