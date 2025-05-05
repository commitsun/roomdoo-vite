<template>
  <div class="footer" v-if="currentStep !== 'feedback'">
    <div class="icons">
      <div class="icons-wrapper">
        <CustomIcon
          imagePath="/app-images/icon-burger.svg"
          color="#AFACAC"
          width="18px"
          height="18px"
          class="icon-burger"
          @click="$emit('restartCheckinFlow')"
        />
        <div
          class="icon-wrapper"
          v-for="(checkinPartner, index) in checkinPartners"
          :style="`padding-bottom:3px;${
            checkinPartner.id === activeCheckinPartnerId ? 'border-bottom: 2px solid #1E9ED9;' : ''
          }`"
          :key="checkinPartner.id"
        >
          <CustomIcon
            imagePath="/app-images/icon-user.svg"
            :color="iconColor(checkinPartner)"
            :width="`${checkinPartner.id === activeCheckinPartnerId ? '22px' : '19px'}`"
            :height="`${checkinPartner.id === activeCheckinPartnerId ? '22px' : '19px'}`"
            @click="$emit('setActiveCheckinPartnerByIndex', index)"
            class="icon-checkin"
            :class="isPrecheckin ? 'no-pointer' : ''"
          />
        </div>
        <div
          @click="$emit('nextCheckinPartner')"
          v-if="
            checkinPartners.length > 1 && currentStep !== 'start' && currentStep !== 'segmentation'
          "
        >
          <CustomIcon
            imagePath="/app-images/arrow_forward_ios.svg"
            color="#AFACAC"
            width="15px"
            height="15px"
            class="arrow-next-checkin-partner"
            :class="isPrecheckin ? 'no-pointer' : ''"
          />
        </div>
        <span v-if="numPendingCheckins > 0">
          {{ numPendingCheckins }} huésped{{ numPendingCheckins > 1 ? 'es' : '' }} pendiente{{
            numPendingCheckins > 1 ? 's' : ''
          }}
        </span>
        <span v-else> {{ checkinPartners.length }} huéspedes </span>
      </div>
      <div
        class="stepper-arrows"
        v-if="
          (currentStep !== 'start' && currentStep !== 'summaryCurrentCheckinPartner') ||
          (currentStep === 'summaryCurrentCheckinPartner' && isPrecheckin) ||
          (currentStep === 'summaryCurrentCheckinPartner' && isFormDisplayed) ||
          (currentStep === 'start' && isFormDisplayed && !isFingerSignDisplayed && !isPrecheckin)
        "
      >
        <div class="previous-arrow" @click="$emit('previous')">
          <CustomIcon
            imagePath="/app-images/arrow_forward_ios.svg"
            color="#FFFFFF"
            width="15px"
            height="15px"
            class="previous"
          />
        </div>
        <div
          class="next-arrow"
          @click="
            isAllowedNextStep === false ||
            isFormDisplayed ||
            currentStep === 'take-photo-front' ||
            currentStep === 'take-photo-back' ||
            currentStep === 'after-confirm-photo-back'
              ? false
              : $emit('next')
          "
          :class="{
            disabled:
              isAllowedNextStep === false ||
              isFormDisplayed ||
              currentStep === 'take-photo-front' ||
              currentStep === 'take-photo-back' ||
              currentStep === 'after-confirm-photo-back',
          }"
        >
          <CustomIcon
            imagePath="/app-images/arrow_forward_ios.svg"
            color="#FFFFFF"
            width="15px"
            height="15px"
            class="next"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    currentStep: {
      type: String,
      required: true,
    },
    checkinPartners: {
      type: Array as () => CheckinPartnerInterface[],
      required: true,
    },
    activeCheckinPartnerId: {
      type: [Number, String],
      required: false,
    },
    isFormDisplayed: {
      type: Boolean,
      required: true,
    },
    isFingerSignDisplayed: {
      type: Boolean,
      required: false,
      default: false,
    },
    isAllowedNextStep: {
      type: Boolean,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const numPendingCheckins = computed(
      () =>
        props.checkinPartners.filter(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState === 'draft' ||
            checkinPartner.checkinPartnerState === 'dummy'
        ).length
    );
    const iconColor = (checkinPartner: CheckinPartnerInterface) => {
      let color = 'rgba(0, 128, 0, 0.66)';
      if (checkinPartner.checkinPartnerState === 'dummy') {
        color = '#C4C4C4';
      }
      if (checkinPartner.checkinPartnerState === 'draft') {
        color = 'rgba(239, 148, 38, 0.75)';
      }
      if (checkinPartner.checkinPartnerState === 'precheckin') {
        color = 'rgba(81, 178, 221, 0.54)';
      }
      return color;
    };
    return {
      numPendingCheckins,
      iconColor,
    };
  },
});
</script>
<style lang="scss" scoped>
.footer {
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 65%,
    rgba(255, 255, 255, 0.5) 100%
  );
  position: absolute;
  bottom: 0;
  height: 80px;
  width: calc(100% - #{$scrollbar_width});
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  .icons {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .icons-wrapper {
      background-color: #f5f5f5;
      border-radius: 30px;
      padding: 0.25rem 1rem;
      display: flex;
      align-items: center;
      .icon-burger {
        margin-right: 5px;
        cursor: pointer;
      }
      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 3px;
      }
      .icon-checkin {
        cursor: pointer;
        &.no-pointer {
          cursor: default;
        }
      }
      .arrow-next-checkin-partner {
        transform: rotate(-90deg);
        cursor: pointer;
        margin-left: 8px;
        &.no-pointer {
          cursor: default;
        }
      }
    }
  }
  .stepper-arrows {
    display: flex;
    align-items: center;
    margin-left: 5px;
    margin-right: 20px;
    .previous-arrow {
      width: 30px;
      height: 30px;
      cursor: pointer;
      border-radius: 5px 0px 0px 5px;
      background-color: $primary;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 1px;
      border: none;
      .previous {
        transform: rotate(180deg);
        width: 12px;
        height: 12px;
      }
    }
    .next-arrow {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: $primary;
      width: 30px;
      height: 30px;
      border-radius: 0px 5px 5px 0px;
      border: none;
      .next {
        width: 12px;
        height: 12px;
      }
    }
    .disabled {
      cursor: not-allowed !important;
      touch-action: none;
      opacity: 0.3;
    }
  }
}

@media (min-width: 1024px) {
  .footer {
    .icons {
      .icons-wrapper {
        padding: 0.5rem 1.5rem;
        .icon-burger {
          margin-right: 1rem;
        }
        .arrow-next-checkin-partner {
          margin-left: 5px;
        }
        span {
          margin-left: 10px;
        }
      }
    }
    .stepper-arrows {
      margin-left: 25px;
    }
  }
}
</style>
