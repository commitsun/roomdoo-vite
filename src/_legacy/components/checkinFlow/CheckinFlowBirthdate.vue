<template>
  <div class="page-container">
    <div class="prev-title">
      {{ $t('guest_data_title', { index: currentIndexCheckin + 1 }) }}
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
        {{ $t('birthdate_title') }}
        <span class="asterisk">*</span>
      </span>
    </div>
    <span class="step-subtitle">
      {{ $t('birthdate_subtitle') }}
    </span>
    <div class="date-input">
      <DatePicker
        ref="birthDateInputRef"
        v-model="birthdate"
        :placeholder="$t('date_format')"
        :maxDate="new Date()"
        :inputStyle="{
          color: '#51B2DD',
          fontSize: '30px',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid #51B2DD',
          borderRadius: '0px',
          width: '100%',
        }"
        @input="inputDate($event)"
        @keyup.enter="nextAndSave()"
      />
    </div>
    <div v-if="notValidAge" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span>{{ $t('birthdate_invalid_range') }}</span>
    </div>
    <div v-else-if="isUnderAge && !areThereAnyAdultsInFolio" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span>{{ $t('birthdate_no_adult') }}</span>
    </div>
    <div v-else-if="isUnderAge && areThereAnyAdultsInFolio" class="input-warning">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#FFA500"
        width="12px"
        height="12px"
      />
      <span>{{ $t('birthdate_minor_warning') }}</span>
    </div>
    <div v-if="isBirthdateWrongFormat" class="input-error">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span>{{ $t('birthdate_bad_format') }}</span>
    </div>
    <div class="btn-continue-container">
      <button class="btn-continue" @click="nextAndSave()" v-if="canProceedToNextStep">
        {{ $t('accept') }}
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
import DatePicker from 'primevue/datepicker';

import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import utilsDates from '@/_legacy/utils/dates';
import { useStore } from '@/_legacy/store';
import { getLocale } from '@/ui/plugins/i18n';

export default defineComponent({
  components: {
    DatePicker,
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

    const inputDate = (event: Event) => {
      const input = event.target as HTMLInputElement;

      //format of primevue datepicker
      const format = getLocale() === 'es' ? 'dd/mm/yyyy' : 'mm/dd/yyyy';

      const digits = input.value.replace(/\D/g, '');

      let newValue = '';
      let cursorPosition = input.selectionStart ?? digits.length;

      if (format.startsWith('yy')) {
        if (digits.length <= 4) {
          newValue = digits;
        } else if (digits.length <= 6) {
          newValue = `${digits.slice(0, 4)}/${digits.slice(4)}`;
        } else if (digits.length < 8) {
          newValue = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
        } else if (digits.length === 8) {
          const datepickerComponent = birthDateInputRef.value as any;
          datepickerComponent.overlayVisible = false;
        }
      } else {
        if (digits.length <= 2) {
          newValue = digits;
        } else if (digits.length <= 4) {
          newValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else if (digits.length < 8) {
          newValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        } else if (digits.length === 8) {
          const datepickerComponent = birthDateInputRef.value as any;
          datepickerComponent.overlayVisible = false;
        }
      }

      const oldLength = input.value.length;
      input.value = newValue;

      const newLength = newValue.length;
      const delta = newLength - oldLength;

      input.setSelectionRange((cursorPosition ?? 0) + delta, (cursorPosition ?? 0) + delta);
    };

    const onAfterEnterHandler = () => {
      if (!birthdate.value) {
        const datepicker = birthDateInputRef.value as any;
        datepicker?.$el?.querySelector('input')?.focus();
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

    onMounted(async () => {
      context.emit('registerOnEnter', onAfterEnterHandler);
      if (props.modelValue) {
        birthdate.value = props.modelValue;
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
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
      inputDate,
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
</style>
