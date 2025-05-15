<template>
  <div class="page-container" @keydown.esc="$emit('closeCheckinFlow')">
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
      {{ t('guest') }}
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text"> {{ t('summary') }} </span>
    </div>
    <div class="checkin-flow-card">
      <slot name="checkin-flow-card" />
    </div>
    <button
      class="btn-save-existing-partner"
      :class="{ 'btn-save-existing-partner-secondary': isCheckinToday() }"
      @click="$emit('continueCheckinFlow')"
      ref="btnSaveCheckinPartnerRef"
    >
      <template v-if="checkinPartnersToComplete.length > 0">
        {{
          checkinPartners.filter(
            (cp) => cp.checkinPartnerState === 'dummy' || cp.checkinPartnerState === 'draft'
          ).length === 1 &&
          (checkinPartnerActive.checkinPartnerState === 'dummy' ||
            checkinPartnerActive.checkinPartnerState === 'draft')
            ? t('save')
            : t('continue_with_next_guest')
        }}
      </template>
      <template v-else> {{ t('continue') }} </template>
    </button>
  </div>
</template>


<script lang="ts">
import { defineComponent, computed, ref, type Ref, type PropType } from 'vue';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { useStore } from '@/legacy/store';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    checkinPartnerId: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    lastName2: {
      type: String,
      required: false,
    },
    nationality: {
      type: Number,
      required: true,
    },
    documentTypeId: {
      type: Number,
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
    },
    birthDate: {
      type: [Date, null] as PropType<Date | null>,
      required: true,
    },
    isSegmented: {
      type: Boolean,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    checkinPartnerActive: {
      type: Object as PropType<CheckinPartnerInterface>,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const btnSaveCheckinPartnerRef: Ref<HTMLButtonElement | null> = ref(null);
    const isCheckinPartnerModalOpen = ref(false);

    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const checkinPartners = computed(() => store.state.checkinPartners.checkinpartners);

    const checkinPartnersToComplete = computed(() =>
      store.state.checkinPartners.checkinpartners.filter(
        (cp) => cp.checkinPartnerState === 'draft' || cp.checkinPartnerState === 'dummy'
      )
    );

    const documentType = (documentTypeId: number) =>
      store.state.documentType.documentType.find((el) => el.id === documentTypeId)?.documentType;

    const state = (checkinState: string) => {
      if (checkinState === 'onboard') {
        return t('checkin_completed');
      }
      if (checkinState === 'draft') {
        return t('checkin_incomplete');
      }
      if (checkinState === 'precheckin') {
        return t('pending_arrival');
      }
      if (checkinState === 'done') {
        return t('checkout_completed');
      }
      return '';
    };

    const isCheckinToday = () => {
      const today = new Date();
      const checkinDate = new Date(currentReservation.value?.checkin || '');
      if (
        today.getDate() >= checkinDate.getDate() &&
        today.getMonth() >= checkinDate.getMonth() &&
        today.getFullYear() >= checkinDate.getFullYear() &&
        props.checkinPartnerActive.checkinPartnerState !== 'onboard'
      ) {
        return true;
      }
      return false;
    };

    const headerStateColor = (checkinState: string) => {
      let color = '#F5FAF5';
      if (checkinState === 'precheckin') {
        color = '#F5FAF5';
      } else if (checkinState === 'draft') {
        color = 'rgba(255, 138, 0, 0.10)';
      }
      return color;
    };

    const stateColor = (checkinState: string) => {
      let color = 'rgba(0, 128, 0, 0.66)';
      if (checkinState === 'precheckin') {
        color = 'rgba(81, 178, 221, 0.54)';
      } else if (checkinState === 'draft') {
        color = 'rgba(239, 148, 38, 0.75)';
      }
      return color;
    };

    const countryCode = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    const countryName = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.name;

    const checkinPartnerAge = (partnerBirthDate: Date | null) => {
      let age = 0;
      if (partnerBirthDate) {
        const today = new Date();
        age = today.getFullYear() - partnerBirthDate.getFullYear();
        const m = today.getMonth() - partnerBirthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < partnerBirthDate.getDate())) {
          age -= 1;
        }
      }
      return age;
    };

    return {
      checkinPartnersToComplete,
      checkinPartners,
      btnSaveCheckinPartnerRef,
      isCheckinPartnerModalOpen,
      currentReservation,
      documentType,
      checkinPartnerAge,
      isCheckinToday,
      countryCode,
      countryName,
      state,
      stateColor,
      headerStateColor,
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
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
  .checkin-flow-card {
    width: 100%;
  }

  .btn-save-existing-partner {
    margin-top: 1rem;
    background-color: $primary;
    border-radius: 5px;
    padding: 0.25rem 1rem;
    float: right;
    margin-right: 1rem;
    font-weight: bold;
    color: white;
    border: none;
    cursor: pointer;
    &:focus {
      outline: none;
    }
  }
  .btn-save-existing-partner-secondary {
    background-color: #f5f5f5;
    color: $primary;
  }
  .title-checkin-partner-modal {
    padding: 0.5rem;
  }
}
@media (min-width: 1024px) {
  .page-container {
    justify-content: center;

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
    .checkin-flow-card {
      max-width: 550px;
    }
  }
}
</style>
