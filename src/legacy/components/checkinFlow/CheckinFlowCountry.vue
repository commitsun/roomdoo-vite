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
        {{ title }}
        <span class="asterisk">*</span>
      </span>
    </div>
    <div class="step-subtitle">
      {{ subtitle }}
    </div>

    <AutocompleteComponent
      :disable="noDocument"
      class="autocomplete-country"
      id="country-checkin-flow-autocomplete"
      v-model="countryId"
      :items="
        countries.map((el) => ({
          value: el.id,
          name: el.name,
          image: `/country-flags/${el.code.toLowerCase()}.svg`,
        }))
      "
      :minChars="0"
      :showAddNewOption="false"
      :maxHeight="250"
      :emptyResultsAfterClick="false"
      keepResultAfterChoose
      iconExpandCollapse
      :resultsFontSize="18"
      isChangeFocusOnEnter
      inputColorText="primary"
      :isBorder="false"
      @focusOut="isAnimation = true"
      icon="2"
      :class="{ blink: isAnimation }"
      @animationend="emitNextStep()"
      isRoundedIcons
    />

    <div v-if="isUnderFourteen" class="input-warning">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#FFA500"
        width="12px"
        height="12px"
      />
      <span>{{ $t('under_14_warning') }}</span>
    </div>

    <div class="btn-continue-container">
      <button class="btn-continue" @click="emitNextStep()" v-if="countryId !== 0">
        {{ $t('accept') }}
      </button>
    </div>

    <div class="btn-continue-container flex-column">
      <div class="checkbox-container" v-if="isUnderFourteen && !isNationality && countryId === 0">
        <CheckboxComponent class="checkbox" v-model="noDocument" />
        <span @click="noDocument = !noDocument">{{ $t('minor_has_no_document') }}</span>
      </div>
      <button
        class="btn-continue"
        @click="emitNextStep()"
        v-if="isUnderFourteen && !isNationality && countryId === 0 && noDocument"
      >
        {{ $t('continue') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import CheckboxComponent from '@/legacy/components/roomdooComponents/CheckboxComponent.vue';

import { useStore } from '@/legacy/store';

export default defineComponent({
  components: {
    AutocompleteComponent,
    CustomIcon,
    CheckboxComponent,
  },
  emits: [
    'update:modelValue',
    'next',
    'setIsAllowedNextStep',
    'closeCheckinFlow',
    'persistCheckinPartner',
    'noDocumentSelected',
  ],
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: 'Nacionalidad',
    },
    subtitle: {
      type: String,
      required: false,
      default: 'Selecciona la nacionalidad',
    },
    step: {
      type: Number,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    isUnderFourteen: {
      type: Boolean,
      required: false,
      default: false,
    },
    isNationality: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    let hasEmittedNext = false;
    const store = useStore();
    const countryId = ref(0);
    const countries = computed(() => store.state.countries.countries);
    const isAnimation = ref(false);
    const noDocument = ref(false);
    const emitNextStep = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    watch(countryId, () => {
      context.emit('update:modelValue', countryId.value);
      context.emit('setIsAllowedNextStep', countryId.value !== 0);
    });

    watch(noDocument, () => {
      if (noDocument.value) {
        context.emit('noDocumentSelected');
        context.emit('setIsAllowedNextStep', true);
      }
    });

    onMounted(() => {
      countryId.value = props.modelValue;
      context.emit(
        'setIsAllowedNextStep',
        countryId.value !== 0 || (props.isUnderFourteen && noDocument.value)
      );
    });

    return {
      countryId,
      countries,
      isAnimation,
      noDocument,
      emitNextStep,
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
  .autocomplete-country {
    width: calc(100% - 2rem);
    height: 45px;
    margin-top: 1rem;
    font-size: 1rem;
  }
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
    width: 100%;
    flex-direction: column;
    .checkbox-container {
      margin-top: 0.5rem;
      display: flex;
      .checkbox {
        height: 20px;
        width: 20px;
        background-color: white;
        margin-right: 0.5rem;
      }
      cursor: pointer;
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
      margin-top: 2.5rem;
      border: none;
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
    .autocomplete-country {
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
