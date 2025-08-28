<template>
  <div
    class="menu-button checkin-completed"
    v-if="isFolio && folioNumCheckins && folioNumCheckins === folioCheckinNamesCompleted.length"
  >
    <div class="icon">
      <CustomIcon
        color="#008000"
        imagePath="/app-images/check-mark.svg"
        width="24px"
        height="24px"
      />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('checkin_completed') }}</div>
      <div class="guests">
        {{ folioCheckinNamesCompleted.join(', ') }}
      </div>
    </div>
  </div>
  <div
    class="menu-button checkin-completed"
    v-else-if="
      !isFolio &&
      reservationNumCheckins &&
      reservationNumCheckins === reservationCheckinNamesCompleted.length
    "
  >
    <div class="icon">
      <CustomIcon
        color="#008000"
        imagePath="/app-images/check-mark.svg"
        width="24px"
        height="24px"
      />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('checkin_completed') }}</div>
      <div class="guests">
        {{ reservationCheckinNamesCompleted.join(', ') }}
      </div>
    </div>
  </div>

  <div class="menu-button checkin-button" v-else @click="clickOnCheckinButton()">
    <div class="icon">
      <CustomIcon color="white" imagePath="/app-images/check-mark.svg" width="24px" height="24px" />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('menu_checkin_action') }}</div>
    </div>
  </div>

  <div
    class="menu-button"
    v-if="isFolio && folioNumCheckins && folioNumCheckins !== folioCheckinNamesCompleted.length"
    @click="$emit('showReservationsForSharing')"
  >
    <div class="icon">
      <CustomIcon color="#3F4443" imagePath="/app-images/share.svg" width="24px" height="24px" />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('menu_invite_others') }}</div>
    </div>
  </div>
  <hr />
  <template v-if="folioPendingAmount && folioPendingAmount > 0 && folioPaymentLink !== ''">
    <div class="menu-button payment-button" @click="openPaymentLink()">
      <div class="icon">
        <CustomIcon
          color="white"
          imagePath="/app-images/credit-card.svg"
          width="24px"
          height="24px"
        />
      </div>
      <div class="text">
        <div class="main-text">
          {{ $t('menu_pay_now', { amount: folioPendingAmount.toString().replace('.', ',') }) }}
        </div>
      </div>
    </div>
    <hr />
  </template>

  <div
    class="menu-button"
    v-if="pmsPropertyName && pmsPropertyStreet && pmsPropertyCity"
    @click="openLocation()"
  >
    <div class="icon">
      <CustomIcon color="#3F4443" imagePath="/app-images/location.svg" width="24px" height="24px" />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('menu_how_to_arrive') }}</div>
    </div>
  </div>
  <div class="menu-button" @click="callPhoneNumber()">
    <div class="icon">
      <CustomIcon color="#3F4443" imagePath="/app-images/phone.svg" width="24px" height="24px" />
    </div>
    <div class="text">
      <div class="main-text">{{ $t('menu_contact') }}</div>
    </div>
  </div>
  <template v-if="isFolio">
    <hr />
    <div class="menu-button" @click="openFolioPortal()">
      <div class="icon"></div>
      <div class="text">
        <div class="main-text">{{ $t('menu_view_details') }}</div>
      </div>
    </div>
    <div class="menu-button" @click="downloadFolioPortal()">
      <div class="icon"></div>
      <div class="text">
        <div class="main-text">{{ $t('menu_download') }}</div>
      </div>
    </div>
  </template>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import { useStore } from '@/_legacy/store';
import { useRoute, useRouter } from 'vue-router';
import { i18n } from '@/ui/plugins/i18n';

export default defineComponent({
  emits: [
    'showReservationsForPrecheckin',
    'openReservationCheckinFlow',
    'showReservationsForSharing',
  ],
  props: {
    isFolio: {
      type: Boolean,
      default: false,
    },
    folioNumCheckins: {
      type: Number,
      required: false,
      default: 0,
    },
    reservationNumCheckins: {
      type: Number,
      required: false,
      default: 0,
    },
    folioCheckinNamesCompleted: {
      type: Array as () => string[],
      required: false,
      default: () => [],
    },
    reservationCheckinNamesCompleted: {
      type: Array as () => string[],
      required: false,
      default: () => [],
    },
    folioPortalLink: {
      type: String,
      required: false,
      default: '',
    },
    folioPendingAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    folioPaymentLink: {
      type: String,
      required: false,
      default: '',
    },
    pmsPropertyName: {
      type: String,
      required: true,
    },
    pmsPropertyPhoneNumber: {
      type: String,
      required: true,
    },
    pmsPropertyStreet: {
      type: String,
      required: true,
    },
    pmsPropertyCity: {
      type: String,
      required: true,
    },
    pmsPropertyState: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup(props, context) {
    const store = useStore();

    const route = useRoute();
    const router = useRouter();
    const folioReservations = computed(() => store.state.precheckin.folioPublicInfo?.reservations);

    const downloadFolioPortal = () => {
      if (props.folioPortalLink) {
        window.open(`${props.folioPortalLink}&report_type=pdf&download=true`, '_blank');
      }
    };
    const openFolioPortal = () => {
      window.open(props.folioPortalLink, '_blank');
    };
    const openPaymentLink = () => {
      window.open(props.folioPaymentLink, '_blank');
    };

    const clickOnCheckinButton = () => {
      if (props.isFolio) {
        if (folioReservations.value?.length === 1) {
          const reservationId = folioReservations.value[0].id;
          const reservationToken = folioReservations.value[0].accessToken;
          const langParam = route.params.lang || i18n.global.locale.value;
          router.push({
            path: `/${reservationId}/precheckin-reservation/${reservationToken}/${langParam}`,
            query: {
              wizard: 'true',
            },
          });
        } else {
          context.emit('showReservationsForPrecheckin');
        }
      } else {
        context.emit('openReservationCheckinFlow');
      }
    };

    const openLocation = () => {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${props.pmsPropertyName}+${props.pmsPropertyStreet}+${props.pmsPropertyCity}+${props.pmsPropertyState}`,
        '_blank'
      );
    };
    const callPhoneNumber = () => {
      window.location.href = `tel:${props.pmsPropertyPhoneNumber ?? ''}`;
    };
    return {
      folioReservations,
      clickOnCheckinButton,
      downloadFolioPortal,
      openFolioPortal,
      openPaymentLink,
      openLocation,
      callPhoneNumber,
    };
  },
  components: {
    CustomIcon,
  },
});
</script>
<style lang="scss" scoped>
.menu-button {
  width: 100%;
  padding: 1rem;
  background: #78787826;
  height: 50px;
  margin: 15px 0;
  border-radius: 8px;
  display: flex;
  cursor: pointer;
  &:hover {
    background: #7878784d;
  }
  .text,
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon {
    min-width: 24px;
  }
  .text {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    .main-text {
      text-align: center;
      font-weight: bold;
    }
    .guests {
      display: -webkit-box;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      max-width: 80%;
      max-height: 50%;
    }
  }
}
.checkin-button {
  background-color: $primary;
  color: white;
  &:hover {
    background: #6cc7f0;
  }
}
.checkin-completed {
  border: 1px solid #008000;
  background-color: rgba(0, 128, 0, 0.15);
  padding-top: 0;
  overflow: hidden;
  .icon {
    padding-top: 1rem;
  }
  .text {
    .main-text {
      padding-top: 10px;
    }
    .guests {
      top: -5px;
    }
  }
}
.payment-button {
  background: linear-gradient(98.71deg, #372772 26.68%, #4bb1e0 131.08%);
  color: white;
  &:hover {
    background: #6cc7f0;
  }
}
hr {
  border-top: 1px solid #f0f0f0;
}
</style>
