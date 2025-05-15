<template>
  <div
    class="page-container"
    ref="addressOptionsDivRef"
    @keypress="selectAddressOptionByKey($event)"
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
      <span class="title-text"> {{ $t('step_guest_address_title') }} </span>
    </div>
    <div class="step-subtitle">{{ $t('step_guest_address_subtitle') }}</div>
    <div class="residence-grid">
      <div
        v-for="(checkinPartner, index) in completedCheckinPartnersAddress"
        :key="checkinPartner.id"
        @click="selectAddressOptionByClick(checkinPartner.id)"
        class="residence-item"
        :class="{ blink: addressOptionSelected === checkinPartner.id && isAnimation }"
        @animationend="emitNextStep()"
      >
        <div class="triangle" v-if="addressOptionSelected === checkinPartner.id">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <div class="residence-title">
          <span class="residence-letter">
            {{ letters[index] }}
          </span>
          <span class="residence-name"> {{ $t('same_address') }} </span>
        </div>
        <span class="residence-address">
          {{ checkinPartner.residenceStreet }}
        </span>
        <span class="residence-address">
          {{ checkinPartner.residenceCity }},
          {{ checkinPartner.countryStateName }}
          ({{ countryCode(checkinPartner.countryId)?.toUpperCase() }})
        </span>
        <span class="residence-address">
          {{ checkinPartner.zip }}
        </span>
      </div>
      <div
        class="residence-item"
        @click="selectAddressOptionByClick(-1)"
        :class="{ blink: addressOptionSelected === -1 && isAnimation }"
        @animationend="emitNextStep()"
      >
        <div class="triangle" v-if="addressOptionSelected < 0">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <div class="residence-title">
          <span class="residence-letter">
            {{ letters[completedCheckinPartnersAddress.length] }}
          </span>
          <span class="residence-name"> {{ $t('new_address') }} </span>
        </div>
      </div>
    </div>
    <div class="btn-continue-container">
      <button class="btn-continue" @click="emitNextStep()" v-if="addressOptionSelected !== 0">
        {{ $t('accept') }}
      </button>
      <div v-else class="empty-div" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, type Ref } from 'vue';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { useStore } from '@/legacy/store';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: false,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    zip: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    countryState: {
      type: Number,
      required: false,
    },
    countryId: {
      type: Number,
      required: false,
    },
    street: {
      type: String,
      required: false,
    },
    step: {
      type: Number,
      required: true,
    },
    checkinPartners: {
      type: Array as () => CheckinPartnerInterface[],
      required: false,
    },
  },

  setup(props, context) {
    let hasEmittedNext = false;
    const store = useStore();
    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    const addressOptionSelected = ref(0);
    const addressOptionsDivRef: Ref<HTMLDivElement | null> = ref(null);
    const isAnimation = ref(false);

    const completedCheckinPartnersAddress = computed(() => {
      if (!props.checkinPartners) {
        return [];
      }
      const uniquePartners = props.checkinPartners
        .filter((el) => el.checkinPartnerState !== 'draft' && el.checkinPartnerState !== 'dummy')
        .reduce((unique: CheckinPartnerInterface[], checkinPartner) => {
          const isDuplicate = unique.some(
            (uniquePartner) =>
              uniquePartner.countryState === checkinPartner.countryState &&
              uniquePartner.zip === checkinPartner.zip &&
              uniquePartner.residenceCity === checkinPartner.residenceCity &&
              uniquePartner.residenceStreet === checkinPartner.residenceStreet
          );

          if (!isDuplicate) {
            unique.push(checkinPartner);
          }

          return unique;
        }, []);

      return uniquePartners;
    });

    const emitNextStep = () => {
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    const selectAddressOptionByKey = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();

      if (addressOptionSelected.value !== 0 && key === 'enter') {
        emitNextStep();
      } else if (key >= 'a' && key <= 'z' && key !== 'enter') {
        const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
        if (index < completedCheckinPartnersAddress.value.length) {
          const selectedId = completedCheckinPartnersAddress.value[index].id;

          if (addressOptionSelected.value === selectedId) {
            addressOptionSelected.value = 0;
          } else {
            addressOptionSelected.value = selectedId;
            isAnimation.value = true;
          }
        }
        if (index === completedCheckinPartnersAddress.value.length) {
          if (addressOptionSelected.value === -1) {
            addressOptionSelected.value = 0;
          } else {
            addressOptionSelected.value = -1;
            isAnimation.value = true;
          }
        }
      }
    };

    const selectAddressOptionByClick = (id: number) => {
      if (addressOptionSelected.value === id) {
        addressOptionSelected.value = 0;
        isAnimation.value = false;
      } else {
        addressOptionSelected.value = id;
        isAnimation.value = true;
      }
    };

    const countryCode = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    watch(addressOptionSelected, () => {
      context.emit('update:modelValue', addressOptionSelected.value);
      if (addressOptionSelected.value > 0) {
        if (props.checkinPartners) {
          const checkinPartner = props.checkinPartners.find(
            (el) => el.id === addressOptionSelected.value
          );
          if (checkinPartner) {
            context.emit('update:zip', checkinPartner.zip);
            context.emit('update:city', checkinPartner.residenceCity);
            context.emit('update:countryState', checkinPartner.countryState);
            context.emit('update:countryId', checkinPartner.countryId);
            context.emit('update:street', checkinPartner.residenceStreet);
          }
        }
      } else {
        context.emit('update:zip', '');
        context.emit('update:city', '');
        context.emit('update:countryState', 0);
        context.emit('update:countryId', 0);
        context.emit('update:street', '');
      }
      if (addressOptionSelected.value === 0) {
        context.emit('setIsAllowedNextStep', false);
      } else {
        context.emit('setIsAllowedNextStep', true);
      }
    });

    onMounted(() => {
      context.emit('setIsAllowedNextStep', false);
      if (props.modelValue) {
        addressOptionSelected.value = props.modelValue;
      }
      if (addressOptionsDivRef.value) {
        addressOptionsDivRef.value.focus();
      }
    });

    return {
      letters,
      completedCheckinPartnersAddress,
      addressOptionSelected,
      addressOptionsDivRef,
      emitNextStep,
      selectAddressOptionByKey,
      countryCode,
      isAnimation,
      selectAddressOptionByClick,
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
  .residence-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    margin-top: 30px;
    width: 100%;
    justify-content: center;
    align-items: center;
    &:focus {
      outline: none;
    }
    .residence-item {
      background-color: #edf7fc;
      border: 2px solid #51b2dd;
      border-radius: 5px;
      padding: 20px;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      color: #51b2dd;
      position: relative;
      .residence-title {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        margin-bottom: 0.5rem;
      }
      .residence-letter {
        font-size: 14px;
        background-color: white;
        border: 1px solid #90ceea;
        border-radius: 2px;
        width: 25px;
        height: 25px;
        margin-right: 0.5rem;
        text-align: center;
      }
      .residence-address {
        font-size: 14px;
        color: #51b2dd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
    .empty-div {
      width: 160px;
      height: 50px;
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
    .residence-grid {
      width: 600px;

      grid-template-columns: repeat(auto-fill, minmax(calc(100% / 3), 1fr));
      .residence-item {
        height: 140px;
        font-size: 18px;
        .residence-letter {
          font-size: 16px;
        }
        .residence-address {
          font-size: 14px;
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
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
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
