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
        Fecha de expedición
        <span class="asterisk">*</span>
      </span>
    </div>
    <div class="step-subtitle">Introduce la fecha de expedición del documento</div>
    <div class="date-input">
      <InputDate
        ref="documentExpeditionDateRef"
        v-model="documentExpeditionDate"
        id="doc-expedition-input"
        class="input"
        :openYearViewFirst="true"
        :includeCalendar="true"
        :placeholder="'DD/MM/AAAA'"
        :firstYearInRange="new Date().getFullYear() - 19"
        textColor="primary"
        placeholderBlue
        @dateSelected="documentExpeditionDate = $event"
        @enter="nextAndSave()"
        @keydown.esc="$emit('closeCheckinFlow')"
        @badFormatting="isDocumentExpeditionWrongFormat = $event"
      />
      <div
        v-if="isDocumentExpeditionGreaterThanToday && !isDocumentExpeditionWrongFormat"
        class="input-error"
      >
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span> La fecha de expedición no puede ser posterior que la fecha actual </span>
      </div>
      <div v-if="isDocumentExpeditionWrongFormat" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span> El formato de fecha es incorrecto </span>
      </div>
      <div
        v-if="isDocumentExpeditionLesserThan40Years && !isDocumentExpeditionWrongFormat"
        class="input-error"
      >
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span> La fecha de expedición no puede ser anterior a 40 años </span>
      </div>
    </div>
    <div class="btn-continue-container">
      <button
        class="btn-continue"
        @click="nextAndSave()"
        v-if="
          documentExpeditionDate &&
          !isDocumentExpeditionGreaterThanToday &&
          !isDocumentExpeditionLesserThan40Years &&
          !isDocumentExpeditionWrongFormat
        "
      >
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
  type Ref,
  type PropType,
  watch,
  computed,
  type ComponentPublicInstance,
} from 'vue';
import InputDate from '@/legacy/components/roomdooComponents/InputDate.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

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
  },

  setup(props, context) {
    let hasEmittedNext = false;
    const documentExpeditionDate: Ref<Date | undefined> = ref(props.modelValue ?? undefined);
    const documentExpeditionDateRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> =
      ref(null);
    const isDocumentExpeditionWrongFormat = ref(false);

    const isDocumentExpeditionGreaterThanToday = computed(() => {
      let result = false;
      if (documentExpeditionDate.value) {
        const today = new Date();
        if (documentExpeditionDate.value.getTime() > today.getTime()) {
          result = true;
        }
      }
      return result;
    });

    const isDocumentExpeditionLesserThan40Years = computed(() => {
      let result = false;
      if (documentExpeditionDate.value) {
        const today = new Date();
        if (today.getFullYear() - 40 > documentExpeditionDate.value.getFullYear()) {
          result = true;
        }
      }
      return result;
    });

    const nextAndSave = () => {
      if (
        documentExpeditionDate.value &&
        !isDocumentExpeditionGreaterThanToday.value &&
        !isDocumentExpeditionLesserThan40Years.value &&
        !isDocumentExpeditionWrongFormat.value
      ) {
        if (!hasEmittedNext) {
          hasEmittedNext = true;
          context.emit('next');
          context.emit('persistCheckinPartner');
        }
      }
    };

    watch(documentExpeditionDate, () => {
      if (
        !isDocumentExpeditionGreaterThanToday.value &&
        !isDocumentExpeditionLesserThan40Years.value &&
        !isDocumentExpeditionWrongFormat.value &&
        documentExpeditionDate.value
      ) {
        context.emit('update:modelValue', documentExpeditionDate.value);
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('update:modelValue', null);
        context.emit('setIsAllowedNextStep', false);
      }
    });

    onMounted(() => {
      // load model value and allow next step or not
      if (props.modelValue) {
        documentExpeditionDate.value = props.modelValue;
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      documentExpeditionDateRef.value?.focus();
    });

    return {
      documentExpeditionDate,
      isDocumentExpeditionGreaterThanToday,
      isDocumentExpeditionLesserThan40Years,
      isDocumentExpeditionWrongFormat,
      documentExpeditionDateRef,
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
    .input-error {
      color: #982113;
      display: flex;
      align-items: center;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      background-color: #f3e3e3;
      border-radius: 20px;
      span {
        margin-left: 10px;
        font-size: 14px;
      }
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
        font-size: 30px;
        margin-top: 30px;
        width: 100%;
      }
      .input::placeholder {
        color: #cae8f5;
      }
      .input-error {
        span {
          margin-left: 10px;
          font-size: 12px;
        }
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
