<template>
  <div class="page-container">
    <div class="prev-title">
      {{
        $t('guest_data_title', { index: currentIndexCheckin + 1 })
      }}
      <sup>
        {{
          currentIndexCheckin === 0
            ? $t('ordinal_1')
            : currentIndexCheckin === 1
            ? $t('ordinal_2')
            : currentIndexCheckin === 2
            ? $t('ordinal_3')
            : $t('ordinal_other')
        }}
      </sup>
      {{ $t('guest') }}
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text"> {{ $t('how_enter_data') }} </span>
    </div>
    <span class="step-subtitle"> {{ $t('select_mode_guest_data') }} </span>

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
              {{ $t('checkin_wizard') }}
            </div>
          </div>
        </div>
        <div
          class="option"
          :class="{ 'not-allowed': !isOCRAvailable, blink: isOCRSelected && isAnimation }"
          @click="isOCRAvailable ? setOCR() : false"
          @animationend="emitNextStep()"
        >
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
              {{ $t('scan_document') }}
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
              {{ $t('search_regular_customer') }}
            </div>
          </div>
        </div>
        <div
          class="option option-form"
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
              {{ $t('classic_form') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-container">
      <CustomButton
        :text="$t('accept')"
        class="btn-continue"
        v-if="isManualEntryByWizard || isManualEntryByForm || isOCRSelected || isRegularCostumer"
        @click="continueNextStep()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type Ref } from 'vue';

import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import CustomButton from '@/legacy/components/roomdooComponents/CustomButton.vue';
import { useStore } from '@/legacy/store';
import { useI18n } from 'vue-i18n';

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
    const { t } = useI18n();
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
          justify-content: center;
        }
        .option-text {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 14px;
          min-height: 56px;
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
            width: 90%;
            margin-left: 1.2rem;
            .first {
              display: flex;
              min-width: 20px;
              min-height: 20px;
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
