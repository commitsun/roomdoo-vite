<template>
  <div
    class="page-container"
    @keypress="selectDocTypeByKey($event)"
    @keydown.esc="$emit('closeCheckinFlow')"
  >
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
        {{ $t('document_type_title') }}
        <span class="asterisk">*</span>
      </span>
    </div>

    <div class="step-subtitle">
      {{ $t('document_type_subtitle') }}
    </div>

    <div class="doc-type-grid" ref="docTypeRef" tabindex="0">
      <div
        v-for="(documentType, index) in documentTypes"
        :key="documentType.id"
        class="doc-type-item"
        @click="selectDocTypeByClick(documentType.id)"
        @animationend="emitNextStep()"
        :class="{ blink: docType === documentType.id && isAnimation }"
      >
        <div class="triangle" v-if="docType === documentType.id">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <span class="doc-type-letter">
          {{ letters[index] }}
        </span>
        <span class="doc-type-name">
          {{ documentType.documentType }}
        </span>
      </div>
    </div>

    <div class="btn-continue-container">
      <button
        class="btn-continue"
        @click="emitNextStep()"
        :class="docType === 0 ? 'btn-continue-hidden' : ''"
      >
        {{ $t('accept') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, type Ref } from 'vue';
import { useStore } from '@/legacy/store';

export default defineComponent({
  emits: ['update:modelValue', 'next', 'closeCheckinFlow', 'setIsAllowedNextStep'],
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    documentCountryId: {
      type: Number,
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
    const store = useStore();
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const docType = ref(0);
    const docTypeRef: Ref<HTMLDivElement | null> = ref(null);
    const isAnimation = ref(false);

    const documentTypes = computed(() =>
      store.state.documentType.documentType.filter(
        (dt) => dt.countryIds.length === 0 || dt.countryIds.includes(props.documentCountryId)
      )
    );

    const emitNextStep = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
      }
    };
    const selectDocTypeByKey = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      if (docType.value !== 0 && key === 'enter') {
        emitNextStep();
      } else if (key >= 'a' && key <= 'f' && key !== 'enter') {
        const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
        const selectedId = documentTypes.value[index].id;
        if (docType.value === selectedId) {
          docType.value = 0;
        } else {
          docType.value = selectedId;
          isAnimation.value = true;
        }
      }
    };
    const selectDocTypeByClick = (id: number) => {
      if (docType.value === id) {
        docType.value = 0;
      } else {
        docType.value = id;
        isAnimation.value = true;
      }
    };
    watch(docType, () => {
      context.emit('update:modelValue', docType.value);
      context.emit('setIsAllowedNextStep', docType.value !== 0);
    });
    onMounted(() => {
      context.emit('setIsAllowedNextStep', props.modelValue !== 0);
      docType.value = props.modelValue;
      // if the nationality is Spain the default document is DNI
      if (docTypeRef.value) {
        docTypeRef.value.focus();
      }
    });
    return {
      letters,
      docType,
      documentTypes,
      docTypeRef,
      emitNextStep,
      selectDocTypeByKey,
      isAnimation,
      selectDocTypeByClick,
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
  &:focus {
    outline: none;
  }
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
  .doc-type-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    margin-top: 10px;
    padding: 0 0.2rem;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    &:focus {
      outline: none;
    }
    .doc-type-item {
      background-color: #edf7fc;
      border: 2px solid #51b2dd;
      border-radius: 5px;
      padding: 20px;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #51b2dd;
      position: relative;
      height: 30px;
      .doc-type-letter {
        font-size: 14px;
        background-color: white;
        border: 1px solid #90ceea;
        border-radius: 2px;
        width: 25px;
        height: 25px;
        margin-right: 0.5rem;
        text-align: center;
      }
      .triangle {
        position: absolute;
        top: 0;
        right: 0;
        width: 35px;
        height: 35px;
        background-color: #51b2dd;
        clip-path: polygon(100% 0, 0 0, 100% 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        .check-mark {
          position: absolute;
          right: 4px;
          top: 2px;
          width: 15px;
          height: 15px;
        }
      }
    }
  }

  .btn-continue-container {
    display: flex;
    justify-content: center;
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
      margin-top: 1rem;
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
    .doc-type-grid {
      grid-template-columns: repeat(2, 1fr);
      height: 275px;
      margin-top: 30px;
      .doc-type-item {
        font-size: 16px;
        padding: 15px;
        height: auto;
        .doc-type-letter {
          font-size: 12px;
          width: 20px;
          height: 20px;
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
            right: 4px;
            top: 2px;
            width: 25px;
            height: 25px;
          }
        }
      }
    }
    .btn-continue {
      margin-top: 2.5rem;
      width: 140px;
      height: 35px;
      font-size: 16px;
      margin-top: 2rem;
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
