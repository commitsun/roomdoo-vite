<template>
  <div class="page-container">
    <div class="top">
      <img src="/app-images/icon-check-blue.svg" class="check-icon" />
      <div class="checkin-name">
        {{ currentCheckinName.replace('null', '') }}
      </div>
    </div>
    <div class="icons">
      <div class="icons-wrapper">
        <div
          class="icon-wrapper"
          v-for="checkinPartner in checkinPartners"
          :key="checkinPartner.id"
        >
          <CustomIcon
            imagePath="/app-images/icon-user-light-blue.svg"
            :color="getIconColor(checkinPartner)"
            width="20px"
            height="20px"
            class="icon-checkin"
          />
        </div>
        <div class="feedback-wrapper">
          <div
            class="feedback"
            v-if="
              checkinPartners.every(
                (checkinPartner) =>
                  checkinPartner.checkinPartnerState === 'onboard' ||
                  checkinPartner.checkinPartnerState === 'precheckin',
              )
            "
          >
            {{ $t('all_checkins_completed') }}
          </div>
          <div class="feedback" v-else>
            {{
              currentIndexCheckin === 0 ? $t('checkin_first_label') : `${currentIndexCheckin + 1}º`
            }}
            check-in
            {{
              checkinPartners[currentIndexCheckin].checkinPartnerState === 'draft'
                ? $t('checkin_status_partial')
                : $t('completed')
            }}
          </div>
          <div v-if="numPendingCheckins > 0">
            {{ $t('pending_checkins', { count: numPendingCheckins }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';

export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    currentCheckinName: {
      type: String,
      required: true,
    },
    checkinPartners: {
      type: Array as () => CheckinPartnerInterface[],
      required: true,
    },
  },

  setup(props, context) {
    const numPendingCheckins = computed(
      () =>
        props.checkinPartners.filter(
          (checkinPartner) =>
            checkinPartner.checkinPartnerState === 'draft' ||
            checkinPartner.checkinPartnerState === 'dummy',
        ).length,
    );
    const getIconColor = (checkinPartner: CheckinPartnerInterface) => {
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
    onMounted(() => {
      setTimeout(() => {
        context.emit('next');
      }, 2000);
    });
    return {
      numPendingCheckins,
      getIconColor,
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
  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    .check-icon {
      width: 60px;
      height: 60px;
    }
    .checkin-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 30px;
    }
  }
  .icons {
    display: flex;
    justify-content: center;
    align-items: center;
    .icons-wrapper {
      background-color: #f5f5f5;
      border-radius: 30px;
      padding: 0.5rem 1.5rem;
      display: flex;
      align-items: center;
      span {
        margin-left: 10px;
      }
      .feedback-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 1rem;
        .feedback {
          font-weight: bold;
          color: #000;
        }
      }
    }
  }
}
@media (min-width: 1024px) {
  .page-container {
    justify-content: center;
  }
}
</style>
