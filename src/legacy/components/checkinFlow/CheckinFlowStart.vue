<template>
  <div
    @keydown.enter="emitNextStep()"
    @keydown.esc="$emit('closeCheckinFlow')"
    class="page-container"
    tabindex="0"
    ref="firstPageContainerRef"
  >
    <img src="/app-images/icon-check-blue.svg" class="check-icon" />
    <span class="first-page-title"> {{ t('checkin_wizard') }} </span>
    <span class="partner-name"> {{ t('reservation_for') }} {{ partnerName }} </span>
    <span class="property">
      {{ propertyName }}
    </span>
    <span> {{ t('room_type') }} {{ roomTypeName }} </span>
    <span class="room">
      {{ reservationCode }}
    </span>
    <div class="reservation-info">
      <div class="reservation-info-titles">
        <span> {{ t('nights') }} </span>
        <span> {{ t('dates') }} </span>
        <span> {{ t('people') }} </span>
      </div>
      <div class="reservation-info-data">
        <span>
          {{ nights }} &nbsp;
          <img src="/app-images/icon-nights.svg" />
        </span>
        <span class="checkin-checkout" v-if="checkin.getFullYear() !== checkout.getFullYear()">
          {{
            capitalizeFirstLetter(
              checkin.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: '2-digit',
                month: 'short',
                day: 'numeric',
              })
            )
          }}
          <img class="arrow-right-blue" src="/app-images/arrow-right-blue.svg" />
          {{
            capitalizeFirstLetter(
              checkout.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: '2-digit',
                month: 'short',
                day: 'numeric',
              })
            )
          }}
        </span>
        <span class="checkin-checkout" v-else>
          {{
            capitalizeFirstLetter(
              checkin.toLocaleDateString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            )
          }}
          <img class="arrow-right-blue" src="/app-images/arrow-right-blue.svg" />
          {{
            capitalizeFirstLetter(
              checkout.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: '2-digit',
                month: 'short',
                day: 'numeric',
              })
            )
          }}
        </span>
        <span>
          {{ adults }}&nbsp; <span> </span>{{ children ? ` +${children}` : '' }}&nbsp;
          <img src="/app-images/icon-users-blue.svg" />
        </span>
      </div>
    </div>
    <div
      class="btn-print-all-container"
      v-if="!checkinPartners.every((cp) => cp.checkinPartnerState === 'dummy') && !isPrecheckin"
    >
      <span class="btn-print-all" @click="printAllCheckins"> {{ t('print_all_checkins') }} </span>
    </div>
    <div class="checkin-flow-card">
      <slot name="checkin-flow-card" />
    </div>
    <button
      class="btn-next-checkin"
      v-if="checkinPartnersToComplete.length > 0"
      @click="nextCheckinPartner()"
    >
      {{
        checkinPartners.every((cp) => cp.checkinPartnerState === 'dummy')
          ? t('start_checkin')
          : t('next_guest')
      }}
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, type Ref } from 'vue';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { useStore } from '@/legacy/store';
import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  emits: [
    'next',
    'closeCheckinFlow',
    'doCheckin',
    'resetCheckinPartnerActive',
    'nextCheckinPartnerToComplete',
  ],
  props: {
    propertyName: {
      type: String,
      required: true,
    },
    roomTypeName: {
      type: String,
      required: true,
    },
    partnerName: {
      type: String,
      required: true,
    },
    reservationCode: {
      type: String,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    checkin: {
      type: Date,
      required: true,
    },
    checkout: {
      type: Date,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
    },
    children: {
      type: Number,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
    checkinPartners: {
      type: Array as () => CheckinPartnerInterface[],
      required: true,
    },
  },
  setup(props, context) {
    const { t } = useI18n();
    const hasEmittedNext = false;
    const store = useStore();
    const { printAllCheckins } = useCheckinPartner();
    const firstPageContainerRef: Ref<HTMLDivElement | null> = ref(null);

    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const checkinPartnersToComplete = computed(() =>
      props.checkinPartners.filter(
        (cp) => cp.checkinPartnerState === 'draft' || cp.checkinPartnerState === 'dummy'
      )
    );

    const capitalizeFirstLetter = (date: string) => date.charAt(0).toUpperCase() + date.slice(1);

    const nextCheckinPartner = () => {
      context.emit('nextCheckinPartnerToComplete');
    };

    const emitNextStep = () => {
      if (!hasEmittedNext) {
        nextCheckinPartner();
      }
    };

    onMounted(() => {
      if (firstPageContainerRef.value) {
        firstPageContainerRef.value.focus();
      }
    });

    return {
      checkinPartnersToComplete,
      firstPageContainerRef,
      currentReservation,
      emitNextStep,
      capitalizeFirstLetter,
      nextCheckinPartner,
      printAllCheckins,
      t,
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
  .check-icon {
    width: 30px;
    height: 30px;
  }
  .first-page-title {
    font-size: 18px;
  }
  .partner-name {
    font-size: 18px;
    text-align: center;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .property {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .room {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .reservation-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    .reservation-info-titles {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      color: #797979;
      font-size: 14px;
    }
    .reservation-info-data {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: 30px;
      span {
        display: flex;
        align-items: center;
        img {
          width: 10px;
          height: 10px;
        }
      }
      .checkin-checkout {
        display: flex;
        align-items: center;
        margin: 0 1.5rem;
        .arrow-right-blue {
          margin: 0 6px;
          width: 8px;
          height: 8px;
        }
      }
    }
  }
  .btn-next-checkin {
    width: 250px;
    height: 50px;
    background-color: $primary;
    color: #fff;
    font-weight: bold;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    &:focus {
      outline: none;
    }
  }

  .btn-print-all-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    max-height: 380px;
    cursor: pointer;
    .btn-print-all {
      background-color: transparent;
      border: none;
      color: $primary;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 1rem;
      margin-right: 15px;
    }
  }
  .checkin-flow-card {
    width: 100%;
  }
}
@media (min-width: 1024px) {
  .page-container {
    justify-content: center;
    .check-icon {
      width: 60px;
      height: 60px;
    }
    .first-page-title {
      font-size: 24px;
    }
    .partner-name {
      font-size: 20px;
      margin-bottom: 30px;
    }
    .property {
      font-size: 16px;
      margin-bottom: 15px;
    }
    .room {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .btn-next-checkin {
      width: 250px;
      height: 50px;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: none;
      margin-top: 1rem;
    }
    .btn-print-all-container {
      width: 500px;
      align-self: center;
      display: flex;
      justify-content: flex-end;
    }
    .checkin-flow-card {
      width: 550px;
    }
  }
}
</style>
