<template>
  <div class="checkin-partner-existing">
    <div
      class="checkin-partner-existing-title"
      :class="[!isBodyOpen ? 'title-closed-body' : '', isFromStart ? 'bottom-rounded-corners' : '']"
      @click="isBodyOpen = !isBodyOpen"
      :style="{
        cursor: isCollapsible ? 'pointer' : 'default',
        backgroundColor: checkinPartnerState ? headerStateColor(checkinPartnerState) : '#F0FCFF',
        paddingLeft: isCollapsible ? '0' : '0.5rem',
      }"
    >
      <CustomIcon
        v-if="isCollapsible && checkinPartnerState !== undefined"
        :imagePath="'/app-images/dropdown.svg'"
        :color="stateColor(checkinPartnerState)"
        :width="'12px'"
        :height="'12px'"
        :class="!isBodyOpen ? 'dropdown-icon' : 'dropdown-icon-rotate'"
      />
      <span v-if="isPreCheckin && isFromStart">
        {{ checkinPartnerIndex + 1 }}<sup>{{ checkinPartnerIndex === 1 ? 'o' : 'er' }}</sup> huésped
        {{ isFromStart ? 'completado' : '' }}
      </span>
      <span
        class="checkin-partner-existing-name"
        v-else-if="
          firstname && lastname && firstname !== '#' && lastname !== '#' && lastname2 !== '#'
        "
      >
        {{ firstname }}
        {{ lastname }} {{ lastname2 }}
      </span>
      <span class="checkin-partner-existing-name" v-else>
        {{ documentNumber }}
      </span>

      <span
        v-if="checkinPartnerState !== undefined"
        class="checkin-partner-existing-state"
        :style="{
          color: `${stateColor(checkinPartnerState)}`,
          marginRight: isFromDrawer ? '.25rem' : '1rem',
        }"
      >
        <img src="/app-images/icon-checkbox.svg" v-if="checkinPartnerState === 'onboard'" />
        {{ state(checkinPartnerState) }}
      </span>
      <CustomIcon
        v-if="isFromDrawer"
        :imagePath="'/app-images/three-dots-white.svg'"
        :color="stateColor(checkinPartnerState ?? '')"
        :width="'25px'"
        :height="'25px'"
        tabindex="1"
        @click.stop="openCheckinMenu = !openCheckinMenu"
        @blur="openCheckinMenu = false"
      />
      <transition name="menu-checkins">
        <div class="checkins-menu" v-if="isFromDrawer && openCheckinMenu">
          <div
            class="print-checkin-menu"
            v-if="checkinPartnerState !== 'draft'"
            @mousedown.stop="$emit('printCheckin')"
          >
            <span> Imprimir </span>
          </div>
          <div v-if="checkinPartnerState !== 'draft'" @mousedown.stop="$emit('viewPDFCheckin')">
            <span> Ver check-in </span>
          </div>
          <div
            @mousedown.stop="$emit('displayForm')"
            v-if="
              isCheckinToday &&
              (checkinPartnerState === 'precheckin' || checkinPartnerState === 'draft')
            "
          >
            <span> Modificar huésped </span>
          </div>
          <div
            @mousedown.stop="$emit('removeCheckinPartner')"
            v-if="checkinPartnerState !== 'onboard' && checkinPartnerState !== 'done'"
          >
            <span> Eliminar huésped </span>
          </div>
        </div>
      </transition>
    </div>
    <Transition name="accordion-transition">
      <div
        class="card-content"
        v-if="(isCollapsible && isBodyOpen) || (!isCollapsible && !isFromStart)"
      >
        <div
          class="data-reservation-row"
          v-if="countryName !== '' && !isExistingCheckinPartner"
          :style="{ paddingLeft: isFromDrawer ? '.75rem' : '0' }"
        >
          <span class="reservation-title"> Nacionalidad </span>
          <span class="reservation-data" :style="{ marginRight: isFromDrawer ? '1.5rem' : '1rem' }">
            <img :src="`/country-flags/${countryCode}.svg`" class="flag" />
            {{ countryName }}
          </span>
        </div>

        <hr v-if="age !== 0 && !isExistingCheckinPartner" />
        <div
          class="data-reservation-row"
          v-if="age > 0 && !isExistingCheckinPartner"
          :style="{ paddingLeft: isFromDrawer ? '.75rem' : '0' }"
        >
          <span class="reservation-title"> Edad </span>
          <span class="reservation-data" :style="{ marginRight: isFromDrawer ? '1.5rem' : '1rem' }">
            {{ age }}
          </span>
        </div>
        <hr v-if="documentTypeName !== '' && documentNumber !== '' && !isExistingCheckinPartner" />
        <div
          class="data-reservation-row"
          v-if="documentTypeName !== '' && documentNumber !== '' && !isExistingCheckinPartner"
          :style="{ paddingLeft: isFromDrawer ? '.75rem' : '0' }"
        >
          <span class="reservation-title">
            {{ documentTypeName }}
          </span>
          <div
            class="doc-number"
            :style="{
              marginRight: isFromDrawer ? '1.5rem' : '1rem',
              cursor: isFromDrawer ? 'pointer' : 'text',
            }"
            @click="copyDocumentNumberToClipboard()"
            @mouseenter="showTooltip = true"
            @mouseleave="hideTooltip()"
          >
            <CustomIcon
              :imagePath="'/app-images/copy-to-clipboard-icon.svg'"
              color="primary"
              width="20px"
              height="20px"
              class="icon-copy"
              v-if="isFromDrawer"
            />
            {{ documentNumber }}
          </div>
          <div
            v-if="documentNumber !== '' && isFromDrawer"
            class="tooltip"
            :class="{ 'show-tooltip': showTooltip }"
            ref="tooltip"
          >
            Copiar
          </div>
        </div>
        <div v-else-if="isPreCheckin" class="data-reservation-row">
          <div class="reservation-title">Los datos del huésped ya existen en el sistema.</div>
        </div>
        <div class="buttons">
          <button
            class="btn-edit-partner"
            @click="$emit('displayForm')"
            v-if="!isFromDrawer && !isPreCheckin"
          >
            <img
              v-if="!isExistingCheckinPartnerMandatoryDataComplete"
              src="/app-images/icon-alert.svg"
            />
            {{ isExistingCheckinPartnerMandatoryDataComplete ? 'Editar datos' : 'Completar datos' }}
          </button>
          <div class="print-btns" v-if="!isFromDrawer && !isPreCheckin">
            <button
              class="btn-sign-checkin"
              v-if="isExistingCheckinPartnerMandatoryDataComplete"
              @click="$emit('displayFingerSign')"
            >
              <CustomIcon
                v-if="!checkinSignature"
                :imagePath="'/app-images/icon-signature.svg'"
                color="primary"
                :width="'18px'"
                :height="'18px'"
                class="icon-print-sign"
              />
              {{ checkinSignature ? 'Firmado' : 'Firmar' }}
            </button>
            <button
              class="btn-reprint-checkin"
              v-if="isExistingCheckinPartnerMandatoryDataComplete"
              @click="$emit('printCheckin')"
            >
              <CustomIcon
                :imagePath="'/app-images/icon-pdf.svg'"
                color="primary"
                :width="'18px'"
                :height="'18px'"
                class="icon-print-sign"
              />
              Imprimir
            </button>
            <button
              class="btn-view-pdf"
              v-if="isExistingCheckinPartnerMandatoryDataComplete"
              @click="$emit('viewPDFCheckin')"
            >
              <CustomIcon
                :imagePath="'/app-images/visibility-on.svg'"
                color="primary"
                :width="'18px'"
                :height="'18px'"
                class="icon-print-sign"
              />
              Ver check-in
            </button>
          </div>
          <button
            v-if="isCheckinToday && isExistingCheckinPartnerMandatoryDataComplete"
            class="btn-do-checkin"
            @click="$emit('doCheckin')"
            ref="doCheckinButton"
          >
            <CustomIcon
              :imagePath="'/app-images/icon-check-light.svg'"
              :color="'#FFFFFF'"
              :width="'20px'"
              :height="'20px'"
              class="icon-checkin"
            />
            Marcar llegada
          </button>
          <button
            class="btn-continue-checkin"
            @click="$emit('selectActiveCheckinPartner')"
            v-if="checkinPartnerState === 'draft' && !isFromDrawer"
          >
            Continuar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    checkinPartnerIndex: {
      type: Number,
      required: false,
      default: 0,
    },
    firstname: {
      type: String,
      required: false,
      default: '',
    },
    lastname: {
      type: String,
      required: false,
      default: '',
    },
    lastname2: {
      type: String,
      required: false,
      default: '',
    },
    countryName: {
      type: String,
      required: false,
      default: '',
    },
    countryCode: {
      type: String,
      required: false,
      default: '',
    },
    age: {
      type: Number,
      required: false,
      default: 0,
    },
    documentTypeName: {
      type: String,
      required: false,
      default: '',
    },
    documentNumber: {
      type: String,
      required: false,
      default: '',
    },
    checkinPartnerState: {
      type: String,
      required: false,
      default: undefined,
    },
    isExistingCheckinPartnerMandatoryDataComplete: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPreCheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCheckinToday: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSegmentation: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCollapsible: {
      type: Boolean,
      required: false,
      default: false,
    },
    isFromDrawer: {
      type: Boolean,
      required: false,
      default: false,
    },
    checkinSignature: {
      type: String,
      required: false,
    },
    isFromStart: {
      type: Boolean,
      required: false,
      default: false,
    },
    isExistingCheckinPartner: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const isBodyOpen = ref(true);
    const openCheckinMenu = ref(false);
    const doCheckinButton = ref<HTMLButtonElement | null>(null);
    const tooltip = ref<HTMLDivElement | null>(null);
    const showTooltip = ref(false);

    const state = (checkinState: string) => {
      let checkinStateText = 'Check-in incompleto';
      if (checkinState === 'precheckin') {
        checkinStateText = 'Llegada pendiente';
      } else if (checkinState === 'onboard') {
        checkinStateText = 'Check-in completado';
      } else if (checkinState === 'done') {
        checkinStateText = 'Check-out completado';
      }
      return checkinStateText;
    };

    const headerStateColor = (checkinState: string) => {
      let color = '#FF8A001A';
      if (checkinState === 'onboard' || checkinState === 'done') {
        color = '#F5FAF5';
      } else if (checkinState === 'precheckin') {
        color = '#EDF7FC';
      }
      return color;
    };

    const stateColor = (checkinState: string) => {
      let color = '#EF9426';
      if (checkinState === 'onboard' || checkinState === 'done') {
        color = '#258015';
      } else if (checkinState === 'precheckin') {
        color = 'rgba(81, 178, 221, 0.54)';
      }
      return color;
    };

    const hideTooltip = () => {
      showTooltip.value = false;
      if (tooltip.value) {
        tooltip.value.textContent = 'Copiar';
        tooltip.value.style.right = '30px';
      }
    };

    const copyDocumentNumberToClipboard = () => {
      void navigator.clipboard.writeText(props.documentNumber);
      if (tooltip.value) {
        tooltip.value.textContent = '¡Copiado!';
        tooltip.value.style.right = '20px';
      }
    };

    onMounted(() => {
      if (props.isCollapsible) {
        isBodyOpen.value = false;
      }
    });

    return {
      state,
      headerStateColor,
      stateColor,
      copyDocumentNumberToClipboard,
      hideTooltip,
      isBodyOpen,
      doCheckinButton,
      openCheckinMenu,
      showTooltip,
      tooltip,
    };
  },
});
</script>

<style lang="scss" scoped>
.checkin-partner-existing {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #faf8f8;
  border-radius: 12px;
  margin: 1rem;

  .checkin-partner-existing-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f0fcff;
    font-size: 14px;
    width: 100%;
    font-weight: bold;
    padding: 0.5rem 0;
    border-radius: 10px 10px 0px 0px;
    position: relative;
    &.bottom-rounded-corners {
      border-radius: 12px !important;
    }
    sup {
      text-decoration: underline;
    }
    .dropdown-icon {
      margin-left: 0.5rem;
      margin-top: 2px;
      transition: transform 0.2s ease;
    }
    .dropdown-icon-rotate {
      margin-left: 0.5rem;
      margin-top: 2px;
      transform: rotate(180deg);
      transition: transform 0.2s ease;
    }
    .checkin-partner-existing-name {
      font-size: 12px;
      margin-left: 0.5rem;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 45%;
    }
    .checkin-partner-existing-state {
      font-size: 12px;
      display: flex;
      align-items: center;
      margin-top: 1px;
      margin-left: auto;
      text-align: right;
      img {
        margin-right: 5px;
        margin-top: 1px;
      }
    }
    .checkins-menu {
      user-select: none;
      position: absolute;
      width: auto;
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
      color: black;
      font-size: 14px;
      box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
      border-radius: 10px;
      right: 30px;
      top: 0;
      z-index: 50;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      font-weight: 100;
      div {
        padding: 0.3rem 0.15rem;
        &:hover {
          font-weight: bold;
        }
      }
      .print-checkin-menu {
        display: none;
      }
    }
  }
  .title-closed-body {
    border-radius: 10px;
  }
  .card-content {
    padding-bottom: 1rem;
    width: 100%;
    .data-reservation-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      position: relative;

      .reservation-title {
        margin-left: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .reservation-data {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        .flag {
          margin-right: 0.5rem;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
        }
      }
      .doc-number {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-copy {
          margin-right: 0.5rem;
        }
      }
      .tooltip {
        position: absolute;
        background-color: $primary;
        color: white;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        border-radius: 5px;
        width: fit-content;
        bottom: 35px;
        right: 30px;
        font-weight: bold;
        font-size: 15px;
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform: translateY(100%);
        visibility: hidden;
        opacity: 0;
        padding-left: 0.3rem;
      }
      .tooltip::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: $primary transparent transparent;
      }
      .show-tooltip {
        visibility: visible;
        transform: translateY(0);
        opacity: 1;
      }
    }
    hr {
      width: 95%;
      margin: 0.5rem auto;
    }
    .data-reservation-row:first-of-type {
      margin-top: 1rem;
    }
    .buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0.5rem 0 0.5rem;
      font-size: 10px;

      .btn-edit-partner {
        display: flex;
        align-items: center;
        background-color: transparent;
        font-weight: bold;
        border: none;
        color: $primary;
        cursor: pointer;
        &:focus {
          outline: none;
        }
        img {
          margin-right: 5px;
          margin-bottom: 3px;
          width: 14px;
          height: 14px;
        }
      }
      .print-btns {
        display: flex;
        margin-left: auto;
        .btn-reprint-checkin,
        .btn-sign-checkin,
        .btn-view-pdf {
          display: flex;
          align-items: center;
          background-color: transparent;
          font-weight: bold;
          border: none;
          color: $primary;
          cursor: pointer;
          &:focus {
            outline: none;
          }
          .icon-print-sign {
            margin-left: 1rem;
            margin-right: 0.5rem;
          }
        }
        .btn-sign-checkin,
        .btn-view-pdf {
          display: flex;
        }
        .btn-reprint-checkin {
          display: none;
        }
      }
      .btn-do-checkin {
        background-color: $primary;
        border-radius: 5px;
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        margin-left: auto;
        &:focus {
          outline: none;
        }
        .icon-checkin {
          margin-right: 5px;
        }
      }
      .btn-continue-checkin {
        background-color: $primary;
        border-radius: 5px;
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        color: white;
        border: none;
        cursor: pointer;
        &:focus {
          outline: none;
        }
      }
    }

    hr {
      border: none;
      height: 1px;
      background-color: #e1e0e0;
      width: 95%;
    }
  }
}

@media (min-width: 1024px) {
  .checkin-partner-existing {
    .checkin-partner-existing-title {
      font-size: 16px;

      .checkins-menu {
        width: auto;
        .print-checkin-menu {
          display: flex;
        }
      }
      .checkin-partner-existing-name,
      .checkin-partner-existing-state {
        font-size: 14px;
      }
      .checkin-partner-existing-name {
        max-width: auto;
      }
    }

    .card-content {
      margin: 0 1rem;
      .data-reservation-row {
        .reservation-title {
          margin-left: 1rem;
          font-size: 16px;
        }
        .reservation-data,
        .doc-number {
          font-size: 16px;
          .flag {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
      }
      .data-reservation-row:last-of-type {
        margin-bottom: 1rem;
      }
      .buttons {
        font-size: 14px;
        .print-btns {
          .btn-reprint-checkin {
            display: flex;
          }
          .btn-view-pdf {
            display: flex;
          }
        }
      }
    }
  }
}

.accordion-transition-enter-active,
.accordion-transition-leave-active {
  transition: all 0.1s linear;
}
.accordion-transition-enter-to,
.accordion-transition-leave-from {
  max-height: 150px;
  overflow: hidden;
}
.accordion-transition-enter-from,
.accordion-transition-leave-to {
  max-height: 0;
  overflow: hidden;
}

.menu-checkins-enter-active,
.menu-checkins-leave-active {
  transition: all 0.2s ease-in-out;
}
.menu-checkins-enter-from,
.menu-checkins-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
