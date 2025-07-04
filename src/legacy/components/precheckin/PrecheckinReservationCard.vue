<template>
  <div class="reservation-card">
    <div
      class="reservation-card-header"
      @click="
        checkinNamesCompleted.length < adults
          ? isSharingReservationLinks
            ? shareReservationLink()
            : openReservationCheckin()
          : false
      "
      :class="checkinNamesCompleted.length === adults ? 'completed' : ''"
      :style="{
        border: isSharingReservationLinks ? '1px solid #263941' : 'none',
      }"
    >
      <div class="reservation-header-number">
        {{ index + 1 }}
      </div>
      <div class="reservation-header-info">
        <!-- share reservation link -->
        <div class="reservation-title" v-if="isSharingReservationLinks">
          {{ t('share_checkin') }}
        </div>

        <!-- some checkins completed but pending checkins -->
        <div
          class="reservation-title"
          v-else-if="checkinNamesCompleted.length < adults && checkinNamesCompleted.length > 0"
        >
          {{ t('guests_missing', { count: adults - checkinNamesCompleted.length }) }}
        </div>

        <!-- all checkins completed -->
        <div class="reservation-title" v-else-if="checkinNamesCompleted.length === adults">
          {{ t('checkin_completed') }}
        </div>
        <div class="reservation-title" v-else>
          {{ t('checkin_for_guests', { count: adults + children }) }}
        </div>

        <!-- room type name or guest names -->
        <div class="reservation-subtitle" v-if="checkinNamesCompleted.length === 0">
          {{ roomTypeName }}
        </div>
        <div class="reservation-subtitle" v-else-if="checkinNamesCompleted.length <= adults">
          {{ checkinNamesCompleted.join(', ') }}
        </div>
      </div>
      <div class="reservation-header-link" v-if="isSharingReservationLinks">
        <CustomIcon
          v-if="adults > checkinNamesCompleted.length"
          color="white"
          imagePath="/app-images/share.svg"
          width="24px"
          height="24px"
        />
        <CustomIcon
          v-else
          color="#008000"
          imagePath="/app-images/icon-checkin.svg"
          width="24px"
          height="24px"
        />
      </div>
    </div>
    <div class="reservation-card-body">
      <div class="titles">
        <div>{{ t('nights') }}</div>
        <div>{{ t('dates') }}</div>
        <div>{{ t('people') }}</div>
      </div>
      <div class="reservation-info">
        <div class="nights">
          {{ nights }} &nbsp;
          <CustomIcon
            color="primary"
            imagePath="/app-images/icon-nights.svg"
            width="10px"
            height="10px"
          />
        </div>
        <div class="dates">
          {{
            checkin.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
          }}
          -
          {{
            checkout.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
          }}
        </div>
        <div class="people">
          <div class="adults">
            {{ adults }}
          </div>
          <div class="plus" v-if="children > 0">+</div>
          <div class="children" v-if="children > 0">
            {{ children }}
          </div>
          <CustomIcon
            class="icon-people"
            color="primary"
            imagePath="/app-images/icon-users-blue.svg"
            width="10px"
            height="10px"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, markRaw, ref } from 'vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import ShareLinkModal from '@/legacy/components/precheckin/ShareLinkModal.vue';
import { dialogService } from '@/legacy/services/DialogService';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { selectedLang } from '@/ui/plugins/i18n';
export default defineComponent({
  components: {
    CustomIcon,
    ShareLinkModal,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    id: {
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
    roomTypeName: {
      type: String,
      required: true,
    },
    children: {
      type: Number,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    checkinNamesCompleted: {
      type: Array as () => string[],
      required: false,
      default: () => [],
    },
    isSharingReservationLinks: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const pathToShare = ref('');
    const shareReservationLink = () => {
      const baseUrl = window.location.href.split('/').slice(0, 3).join('/');
      pathToShare.value = `${baseUrl}/${props.id}/precheckin-reservation/${props.accessToken}`;

      const canShare = 'share' in window.navigator;
      if (canShare) {
        void navigator.share({
          title: document.title,
          url: pathToShare.value,
        });
      } else {
        dialogService.open({
          header: 'Compartir enlace',
          content: markRaw(ShareLinkModal),
          closable: true,
          props: {
            link: pathToShare.value,
          },
        });
      }
    };

    const openReservationCheckin = () => {
      const langParam = route.params.lang || selectedLang;
      router.push({
        path: `/${props.id}/precheckin-reservation/${props.accessToken}/${langParam}`,
        query: {
          wizard: 'true',
        },
      });
    };

    return {
      pathToShare,
      shareReservationLink,
      openReservationCheckin,
      t,
    };
  },
});
</script>
<style lang="scss" scoped>
.reservation-card {
  border-bottom: 1px solid #f0f0f0;
  margin: 15px 0;
  .reservation-card-header {
    cursor: pointer;
    background-color: #78787826;
    border-radius: 8px;
    height: 50px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 20px;
    .reservation-header-number {
      border-radius: 50%;
      background-color: $primary;
      color: white;
      min-width: 25px;
      min-height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
    }
    .reservation-header-info {
      flex: 1 1 auto;
      font-size: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      height: 50px;
      .reservation-title {
        font-weight: bold;
        max-height: 50%;
      }
      .reservation-subtitle {
        display: block;
        text-align: center;
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding-left: 0.5rem;
      }
    }
    .reservation-header-link {
      min-width: 50px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #263941;
      border-radius: 0 8px 8px 0;
    }
    &.completed {
      border: 1px solid #008000;
      &:hover {
        background-color: #78787826;
      }
      cursor: default;

      .reservation-header-number {
        background-color: #008000;
      }
      .reservation-header-link {
        background-color: transparent;
      }
    }
    &:hover {
      background-color: #7878784d;
    }
  }
  .reservation-card-body {
    background-color: white;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    padding-left: 12px;
    padding-right: 12px;
    .titles {
      display: flex;
      justify-content: space-between;
      div {
        font-size: 12px;
        color: #797979;
        text-align: center;
        &:nth-child(2) {
          flex: 1 1 auto;
        }
      }
    }
    .reservation-info {
      display: flex;
      justify-content: space-between;
      .nights,
      .dates,
      .people {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: #3f4443;
        font-weight: bold;
        text-align: center;
        &:nth-child(2) {
          flex: 1 1 auto;
        }
      }
      .people {
        display: flex;
        justify-content: center;
        align-items: center;
        .children {
          font-size: 12px;
        }
        .plus,
        .icon-people,
        .children {
          margin-left: 3px;
        }
      }
    }
  }
}
</style>
