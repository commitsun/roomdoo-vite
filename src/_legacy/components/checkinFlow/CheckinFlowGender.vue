<template>
  <div
    class="page-container"
    ref="genderDivRef"
    @keypress="selectGenderByKey($event)"
    @keydown.esc="$emit('closeCheckinFlow')"
    tabindex="0"
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
        {{ $t('gender') }}
        <span class="asterisk">*</span>
      </span>
    </div>
    <span class="step-subtitle"> {{ $t('select_gender') }} </span>
    <div class="gender-grid" tabindex="0">
      <div
        v-for="(gender, index) in genders"
        :key="gender.id"
        class="gender-item"
        @click="selectGenderByClick(gender.id)"
        :class="{ blink: genderRef === gender.id && isAnimation }"
        @animationend="emitNextStep()"
      >
        <div class="triangle" v-if="genderRef === gender.id">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <span class="gender-letter">
          {{ letters[index] }}
        </span>
        <span class="gender-name">
          {{ gender.name }}
        </span>
      </div>
    </div>
    <div class="btn-continue-container">
      <button class="btn-continue" @click="emitNextStep()" v-if="genderRef !== ''">
        {{ $t('accept') }}
      </button>
      <div v-else class="empty-div" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
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
    const { t } = useI18n();
    let hasEmittedNext = false;
    const letters = ['A', 'B', 'C'];
    const genderRef = ref('');
    const genders = ref([
      { id: 'male', name: t('male') },
      { id: 'female', name: t('female') },
      { id: 'other', name: t('other') },
    ]);
    const genderDivRef: Ref<HTMLDivElement | null> = ref(null);
    const isAnimation = ref(false);

    const emitNextStep = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    const selectGenderByKey = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();

      if (genderRef.value !== '' && key === 'enter') {
        emitNextStep();
      } else if (key >= 'a' && key <= 'c' && key !== 'enter') {
        const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
        const selectedId = genders.value[index].id;
        if (genderRef.value === selectedId) {
          genderRef.value = '';
        } else {
          genderRef.value = selectedId;
          isAnimation.value = true;
        }
      }
    };

    const selectGenderByClick = (id: string) => {
      if (genderRef.value === id) {
        genderRef.value = '';
      } else {
        genderRef.value = id;
        isAnimation.value = true;
      }
    };

    watch(genderRef, () => {
      context.emit('update:modelValue', genderRef.value);
      context.emit('setIsAllowedNextStep', genderRef.value !== '');
    });

    onMounted(() => {
      // load model value and allow next step or not
      if (props.modelValue !== '') {
        genderRef.value = props.modelValue;
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      isAnimation.value = false;
      if (genderDivRef.value) {
        genderDivRef.value.focus();
      }
    });

    return {
      genderRef,
      genders,
      letters,
      genderDivRef,
      emitNextStep,
      selectGenderByKey,
      isAnimation,
      selectGenderByClick,
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
  &:focus {
    outline: none;
  }
  .gender-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    margin-top: 30px;
    width: 100%;
    &:focus {
      outline: none;
    }
    .gender-item {
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
      .gender-letter {
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
      margin-top: 2.5rem;
      visibility: visible;
      border: none;
    }
    .btn-continue-hidden {
      visibility: hidden;
    }
  }
  .empty-div {
    width: 160px;
    height: 40px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2.5rem;
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
    .gender-grid {
      grid-template-columns: repeat(3, 1fr);
      width: 500px;
      .gender-item {
        font-size: 18px;
        padding: 18px;
        height: 80px;
        .gender-letter {
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
