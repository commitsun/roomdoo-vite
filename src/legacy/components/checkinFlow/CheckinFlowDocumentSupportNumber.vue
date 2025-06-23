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
      <span class="title-text">
        {{ $t('support_number_title') }}
        <span class="asterisk">*</span>
      </span>
    </div>
    <span class="step-subtitle">
      {{ $t('support_number_subtitle') }}
    </span>

    <InputText
      v-model="supportNumber"
      class="input"
      @keydown="validator.$reset()"
      @keydown.enter="nextAndSave()"
      @keydown.esc="$emit('closeCheckinFlow')"
      :placeholder="documentType === 'D' ? 'AAA123456' : 'E12345678'"
      :isBorder="false"
      placeholderBlue
      textColor="primary"
      :isError="validator.supportNumber.$errors.length > 0"
      ref="supportNumberInput"
      isUpperCase
    />

    <div class="btn-continue-container">
      <div v-if="validator.supportNumber.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>
          {{ validator.supportNumber.$errors[0].$message }}
        </span>
      </div>
      <button
        class="btn-continue"
        @click="nextAndSave()"
        v-if="supportNumber.length === 9 && validator.supportNumber.$errors.length === 0"
      >
        {{ $t('accept') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  type ComponentPublicInstance,
  type Ref,
  computed,
} from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import { useI18n } from 'vue-i18n';

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
    documentType: {
      type: String,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
  },

  setup(props, context) {
    const REGEX_SUPPORT_NUMBER_DNI = /^[A-Za-z]{3}\d{6}$/;
    const REGEX_SUPPORT_NUMBER_NIE = /^E\d{8}$/;


    const { t } = useI18n();
    let hasEmittedNext = false;
    const supportNumber = ref('');
    const supportNumberInput: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);

    const validSupportNumber = () => {
      let result = false;

      if (supportNumber.value.length === 9 &&
        (props.documentType === 'D' && REGEX_SUPPORT_NUMBER_DNI.test(supportNumber.value) ||
          props.documentType === 'N' && REGEX_SUPPORT_NUMBER_NIE.test(supportNumber.value)
        )
      ) {
        result = true;
      }
      return result;
    };

    const validationRules = computed(() => ({
      supportNumber: {
        validSupportNumber: helpers.withMessage(t('invalid_support_number'), validSupportNumber),
      },
    }));

    const validator = useVuelidate(validationRules, {
      supportNumber,
    });

    const nextAndSave = () => {
      validator.value.$touch();
      if (validator.value.$errors.length > 0) {
        return;
      }
      if (supportNumber.value.length === 9 && !hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    watch(supportNumber, () => {
      if (supportNumber.value.length === 9 &&
        (props.documentType === 'D' && REGEX_SUPPORT_NUMBER_DNI.test(supportNumber.value) ||
          props.documentType === 'N' && REGEX_SUPPORT_NUMBER_NIE.test(supportNumber.value)
        )
      ) {
        context.emit('update:modelValue', supportNumber.value);
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('update:modelValue', '');
        context.emit('setIsAllowedNextStep', false);
      }
    });

    onMounted(() => {
      // load model value and allow next step or not
      if (props.modelValue !== '') {
        supportNumber.value = props.modelValue;
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      supportNumberInput.value?.focus();
    });

    return {
      supportNumber,
      supportNumberInput,
      nextAndSave,
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
    width: 90%;
    height: auto;
    padding-bottom: 0.5rem;
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
    justify-content: center;
    align-items: center;
    width: 100%;
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
      margin-top: 1.5rem;
      font-size: 30px;
    }
    .input-error {
      margin-top: 1rem;
      span {
        font-size: 12px;
      }
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
