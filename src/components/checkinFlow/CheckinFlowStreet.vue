<template>
  <div class="page-container">
    <div class="prev-title">
      Datos {{ currentIndexCheckin + 1
      }}<sup>{{ currentIndexCheckin === 0 || currentIndexCheckin === 2 ? 'er' : 'o' }}</sup> huésped
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">
        Calle de residencia
        <span class="asterisk">*</span>
      </span>
    </div>
    <div class="step-subtitle">Introduce la calle de residencia del huésped</div>
    <InputText
      v-model="street"
      class="input"
      @keydown.enter="onKeypressEnter()"
      @keydown.esc="$emit('closeCheckinFlow')"
      placeholder="Escribe aquí"
      :isBorder="false"
      placeholderBlue
      textColor="primary"
      :isError="validator.street.$errors.length > 0"
      ref="streetInputRef"
    />
    <div class="btn-continue-container">
      <div v-if="validator.street.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="15px"
          height="15px"
        />
        <span>
          {{ validator.street.$errors[0].$message }}
        </span>
      </div>
      <button v-if="street !== ''" class="btn-continue" @click="emitNextStep()">Aceptar</button>
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
  type ComponentPublicInstance,
  computed,
} from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/components/roomdooComponents/InputText.vue';

export default defineComponent({
  components: {
    CustomIcon,
    InputText,
  },
  props: {
    modelValue: {
      type: String,
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
  },

  setup(props, context) {
    let hasEmittedNext = false;
    const street = ref('');
    const streetInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);

    const validationRules = computed(() => ({
      street: {
        required: helpers.withMessage('La calle de residencia es obligatoria', required),
      },
    }));
    const validator = useVuelidate(validationRules, {
      street,
    });

    const emitNextStep = () => {
      validator.value.$touch();
      if (validator.value.$error) {
        return;
      }
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };
    const onKeypressEnter = () => {
      emitNextStep();
    };
    watch(street, () => {
      context.emit('update:modelValue', street.value);
      context.emit('setIsAllowedNextStep', street.value !== '');
    });
    onMounted(() => {
      // load model value and allow next step or not
      if (props.modelValue !== '') {
        street.value = props.modelValue;
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      streetInputRef.value?.focus();
    });

    return {
      street,
      streetInputRef,
      emitNextStep,
      onKeypressEnter,
      validator,
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

  .input {
    font-size: 20px;
    margin-top: 30px;
    width: 95%;
    padding-bottom: 0.5rem;
    height: auto;
  }
  .input::placeholder {
    color: #cae8f5;
  }
  .input-error {
    color: #982113;
    display: flex;
    align-items: center;
    margin-top: 1rem;
    padding: 0.25rem 0.75rem;
    background-color: #f3e3e3;
    border-radius: 20px;
    align-self: flex-start;
    span {
      margin-left: 10px;
      font-size: 14px;
    }
  }

  .btn-continue-container {
    display: flex;
    flex-direction: column;
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
      margin-top: 2.5rem;
      visibility: visible;
      border: none;
    }
    .btn-continue-hidden {
      visibility: hidden;
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
    .input {
      width: 500px;
      font-size: 30px;
    }

    .btn-continue {
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
      margin-top: 30px;
    }
  }
}
</style>
