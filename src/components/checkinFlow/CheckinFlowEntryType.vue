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
      <span class="title-text"> ¿Cómo vas a introducir los datos? </span>
    </div>
    <span class="step-subtitle"> Selecciona un modo para registrar los datos del huésped </span>

    <div
      class="options"
      @keypress="selectInputByKey($event)"
      @keydown.esc="$emit('closeCheckinFlow')"
      tabindex="0"
      ref="pageRef"
    >
      <div class="options-row">
        <div
          class="option"
          @click="setManualEntryByWizard()"
          @animationend="emitNextStep()"
          :class="{ blink: isManualEntryByWizard && isAnimation }"
        >
          <div class="triangle" v-if="isManualEntryByWizard">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <div class="option-icon">
            <CustomIcon
              imagePath="/app-images/magic_button.svg"
              color="#51B2DD"
              width="45px"
              height="45px"
            />
          </div>
          <div class="option-text">
            <div class="first">
              <span> A </span>
            </div>
            <div class="second">
              Asistente de <br />
              check-in
            </div>
          </div>
        </div>
        <div
          class="option"
          :class="{ 'not-allowed': !isOCRAvailable, blink: isOCRSelected && isAnimation }"
          @click="isOCRAvailable ? setOCR() : false"
          @animationend="emitNextStep()"
        >
          <div class="new-feature-feedback" v-if="isOCRAvailable && showNewFeatureFeedback">
            Nuevo
          </div>
          <div class="triangle" v-if="isOCRSelected">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <div class="option-icon">
            <CustomIcon
              imagePath="/app-images/icon-camera.svg"
              color="#51B2DD"
              width="45px"
              height="45px"
            />
          </div>
          <div class="option-text">
            <div class="first">
              <span> B </span>
            </div>
            <div class="second">
              Escanear <br />
              documento
            </div>
          </div>
        </div>
      </div>
      <div class="options-row" v-if="!isPrecheckin">
        <div
          class="option"
          @click="setRegularCostumer()"
          @animationend="emitNextStep()"
          :class="{ blink: isRegularCostumer && isAnimation }"
        >
          <div div class="triangle" v-if="isRegularCostumer">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <div class="option-icon">
            <CustomIcon
              imagePath="/app-images/icon-search-partner.svg"
              color="#51B2DD"
              width="45px"
              height="45px"
            />
          </div>
          <div class="option-text">
            <div class="first">
              <span> C </span>
            </div>
            <div class="second">
              Buscar cliente <br />
              habitual
            </div>
          </div>
        </div>
        <div
          class="option"
          :class="{ blink: isManualEntryByForm && isAnimation }"
          @animationend="emitDisplayForm()"
          @click="setManualEntryByForm()"
        >
          <div class="triangle" v-if="isManualEntryByForm">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <div class="option-icon">
            <CustomIcon
              imagePath="/app-images/icon-form.svg"
              color="#51B2DD"
              width="45px"
              height="45px"
            />
          </div>
          <div class="option-text">
            <div class="first">
              <span> D </span>
            </div>
            <div class="second">
              Formulario <br />
              clásico
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-container">
      <CustomButton
        text="Aceptar"
        class="btn-continue"
        v-if="isManualEntryByWizard || isManualEntryByForm || isOCRSelected || isRegularCostumer"
        @click="continueNextStep()"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, type Ref } from 'vue';

import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import CustomButton from '@/components/roomdooComponents/CustomButton.vue';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    CustomIcon,
    CustomButton,
  },
  props: {
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: String,
      required: false,
      default: '',
    },
    step: {
      type: Number,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isOCRAvailable: {
      type: Boolean,
      required: false,
      default: false,
    },
    showNewFeatureFeedback: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'setIsAllowedNextStep',
    'next',
    'closeCheckinFlow',
    'openCheckinPartnerModal',
    'persistCheckinPartner',
    'displayForm',
  ],
  setup(props, context) {
    let hasEmittedNext = false;
    const isManualEntryByWizard = ref(false);
    const isManualEntryByForm = ref(false);
    const isOCRSelected = ref(false);
    const isRegularCostumer = ref(false);
    const pageRef: Ref<HTMLDivElement | null> = ref(null);
    const isAnimation = ref(false);
    const store = useStore();

    const emitNextStep = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };
    const emitDisplayForm = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('displayForm');
        context.emit('persistCheckinPartner');
      }
    };

    const setManualEntryByWizard = () => {
      isManualEntryByWizard.value = !isManualEntryByWizard.value;
      isManualEntryByForm.value = false;
      isOCRSelected.value = false;
      isRegularCostumer.value = false;
      isAnimation.value = true;
      context.emit('setIsAllowedNextStep', isManualEntryByWizard.value);
      context.emit(
        'update:modelValue',
        isManualEntryByWizard.value ? `wizard${props.isPrecheckin ? '-precheckin' : ''}` : ''
      );
    };

    const setManualEntryByForm = () => {
      isManualEntryByForm.value = !isManualEntryByForm.value;
      isManualEntryByWizard.value = false;
      isOCRSelected.value = false;
      isRegularCostumer.value = false;
      isAnimation.value = true;
      context.emit('setIsAllowedNextStep', isManualEntryByForm.value);
      context.emit('update:modelValue', isManualEntryByForm.value ? 'form' : '');
    };

    const setOCR = () => {
      isOCRSelected.value = !isOCRSelected.value;
      isManualEntryByWizard.value = false;
      isManualEntryByForm.value = false;
      isRegularCostumer.value = false;
      isAnimation.value = true;
      context.emit('setIsAllowedNextStep', isOCRSelected.value);
      context.emit(
        'update:modelValue',
        isOCRSelected.value ? `ocr${props.isPrecheckin ? '-precheckin' : ''}` : ''
      );
    };

    const setRegularCostumer = () => {
      isRegularCostumer.value = !isRegularCostumer.value;
      isOCRSelected.value = false;
      isManualEntryByWizard.value = false;
      isManualEntryByForm.value = false;
      isAnimation.value = true;
      context.emit('setIsAllowedNextStep', isRegularCostumer.value);
      context.emit('update:modelValue', isRegularCostumer.value ? 'regular_customer' : '');
    };

    const selectInputByKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'enter') {
        emitNextStep();
      } else if (key === 'a') {
        setManualEntryByWizard();
      } else if (key === 'b') {
        setOCR();
      } else if (key === 'c') {
        setRegularCostumer();
      } else if (key === 'd' && props.isOCRAvailable) {
        setManualEntryByForm();
      }
    };

    const continueNextStep = () => {
      emitNextStep();
    };

    onMounted(() => {
      // allow next step or not
      if (props.modelValue !== '') {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      // load model value
      if (props.modelValue === 'wizard') {
        isManualEntryByWizard.value = true;
        isOCRSelected.value = false;
        isRegularCostumer.value = false;
        isManualEntryByForm.value = false;
      } else if (props.modelValue === 'form') {
        isManualEntryByWizard.value = false;
        isOCRSelected.value = false;
        isRegularCostumer.value = false;
        isManualEntryByForm.value = true;
      } else if (props.modelValue === 'ocr') {
        isManualEntryByWizard.value = false;
        isOCRSelected.value = true;
        isRegularCostumer.value = false;
        isManualEntryByForm.value = false;
      } else if (props.modelValue === 'regular_customer') {
        isManualEntryByWizard.value = false;
        isOCRSelected.value = false;
        isRegularCostumer.value = true;
        isManualEntryByForm.value = false;
      } else {
        isManualEntryByWizard.value = false;
        isOCRSelected.value = false;
        isRegularCostumer.value = false;
        isManualEntryByForm.value = false;
      }
      isAnimation.value = false;
      if (pageRef.value) {
        pageRef.value.focus();
      }
      void store.dispatch('ocrDocument/resetDocumentData');
    });

    return {
      isOCRSelected,
      isManualEntryByWizard,
      isManualEntryByForm,
      pageRef,
      isRegularCostumer,
      isAnimation,
      selectInputByKey,
      setOCR,
      setManualEntryByWizard,
      setManualEntryByForm,
      setRegularCostumer,
      continueNextStep,
      emitNextStep,
      emitDisplayForm,
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
    }
  }

  // subtitle
  .step-subtitle {
    width: 100%;
    font-size: 13px;
    color: #4f4f4f;
    margin: 0 1rem;
  }

  .options {
    margin-top: 30px;
    width: 100%;
    &:focus {
      outline: none;
    }
    .options-row {
      display: flex;
      margin-bottom: 10px;
      width: 100%;
      .option {
        background-color: #edf7fc;
        padding-top: 20px;
        flex: 1 1 auto;
        height: 125px;
        width: 200px;
        border: 2px solid $primary;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 5px;
        cursor: pointer;
        .new-feature-feedback {
          position: absolute;
          top: 0;
          left: 0;
          background-color: #814672;
          color: white;
          padding: 0 0.35rem;
          border-radius: 15px;
          font-size: 13px;
          font-weight: bold;
          margin: 5px 0 0 10px;
        }
        .triangle {
          position: absolute;
          top: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background-color: #51b2dd;
          clip-path: polygon(100% 0, 0 0, 100% 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          .check-mark {
            position: absolute;
            right: 5px;
            top: 5px;
            width: 20px;
            height: 20px;
          }
        }
        &:first-child {
          margin-right: 10px;
        }
        &.not-allowed {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .option-icon {
          display: flex;
          flex: 1 1 auto;
        }
        .option-text {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 14px;
          .first {
            margin-top: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            font-weight: bold;
            height: 20px;
            width: 20px;
            background-color: white;
            border: 1px solid $primary;
            color: $primary;
            margin-right: 10px;
            display: none;
          }
          .second {
            font-size: 16px;
            color: $primary;
            min-width: 100px;
            text-align: center;
          }
        }
      }
    }
  }

  .btn-container {
    display: flex;
    width: 100%;
    .btn-continue {
      height: 40px;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-top: 0.5rem;
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
    .options {
      width: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .options-row {
        .option {
          max-width: 160px;
          &.not-allowed {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .option-text {
            .first {
              display: flex;
            }
            .second {
              text-align: inherit;
            }
          }
        }
      }
    }
    .btn-container {
      display: flex;
      align-items: center;
      justify-content: center;
      .btn-continue {
        width: 200px;
        height: 40px;
        margin-top: 0.5rem;
      }
    }
  }
}

@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.5;
  }
}
.blink {
  animation: blink 0.5s forwards;
}
</style>
