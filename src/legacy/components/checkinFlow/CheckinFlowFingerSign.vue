<template>
  <div class="container-sign" @keydown.esc="$emit('closeCheckinFlow')" tabindex="0">
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
      <span class="title-text"> {{ $t('sign_title') }} </span>
    </div>
    <div class="step-subtitle" v-if="!isPreCheckin">
      {{ $t('sign_by', { name: checkinPartner.firstname + ' ' + checkinPartner.lastname + ' ' + checkinPartner.lastname2 }) }}
    </div>

    <div class="content">
      <div class="first-row">
        <div class="main-info">
          <div class="first">
            <div class="field">
              <div class="title" v-if="isPreCheckin">
                {{ $t('sign_file', { reference: reservationReference, room: roomTypeName }) }}
              </div>
              <div class="title" v-else>
                {{ $t('sign_file', { reference: currentReservation?.name, room: getCurrentRoomName() }) }}
              </div>
            </div>
            <div class="field">
              <div class="label">{{ $t('total_amount', { amount: isPreCheckin ? reservationAmount : currentFolio?.amountTotal }) }}</div>
            </div>
            <br />
            <div class="field">
              <div class="label">{{ propertyName }}</div>
            </div>
            <div class="field">
              <div class="data">{{ companyName }}</div>
            </div>
            <div class="field">
              <div class="data">{{ propertyAddress }}</div>
            </div>
            <div class="field">
              <div class="data">{{ propertyCity }}</div>
            </div>
            <div class="field" v-if="propertyCategory && propertyCategory !== ''">
              <div class="data">{{ $t('property_category', { category: propertyCategory }) }}</div>
            </div>
            <br />
          </div>
          <div class="second">
            <div class="field">
              <div class="title">{{ $t('traveler_data') }}</div>
            </div>
            <div class="field" v-if="checkinPartnerFullName !== ''">
              <div class="label">{{ checkinPartnerFullName }}</div>
            </div>
            <div class="field" v-if="checkinPartner.birthdate !== null">
              <div class="data">
                {{ $t('birthdate_label', {
                  birthdate: checkinPartner.birthdate?.toLocaleDateString('es-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })
                }) }}
              </div>
            </div>
            <div class="field" v-if="documentTypeName() !== ''">
              <div class="data">
                {{ $t('document_label', { type: documentTypeName(), number: checkinPartner.documentNumber }) }}
              </div>
            </div>
            <div class="field" v-if="genderName() !== ''">
              <div class="data">
                {{ $t('gender_label', { gender: genderName() }) }}
              </div>
            </div>
            <div class="field">
              <div class="data">
                {{ $t('checkin_date', {
                  date: checkin.toLocaleDateString('es-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })
                }) }}
              </div>
            </div>
            <div class="field">
              <div class="data">
                {{ $t('checkout_date', {
                  date: checkout.toLocaleDateString('es-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })
                }) }}
              </div>
            </div>
          </div>
          <br />
          <div class="third">
            <div class="field">
              <div class="title">{{ $t('terms_title') }}</div>
            </div>
            <div class="field cardex">
              {{ cardexWarning }}
            </div>
          </div>
        </div>
        <br />
        <div class="additional-text">
          {{ privacyPolicyText }}
        </div>
      </div>

      <div class="second-row">
        <div class="wrapper">
          <div class="signature-title">
            {{ $t('signed_by', {
              name: `${checkinPartner.firstname} ${checkinPartner.lastname} ${checkinPartner.lastname2}`,
              city: activeProperty?.city,
              datetime: new Date().toLocaleTimeString('es-ES', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
              })
            }) }}
          </div>
          <VueSignaturePad
            class="signature-pad"
            clearOnResize
            ref="signature"
            height="98%"
            width="98%"
            :max-width="2"
            :min-width="2"
            :options="{
              penColor: 'rgb(0,0,0)',
              backgroundColor: 'rgb(255,255,255)',
            }"
            @afterUpdateStroke="handleAfterUpdateStroke"
          />

          <button class="clear-btn" @click="clearSignature()">{{ $t('retry') }}</button>
        </div>
      </div>
      <button
        class="save-btn"
        :class="{ disabled: base64Data === '' }"
        @click="base64Data !== '' ? persistCheckinPartner() : false"
      >
        {{ $t('accept_and_continue') }}
      </button>
      <br />
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { VueSignaturePad } from '@selemondev/vue3-signature-pad';
import { useStore } from '@/legacy/store';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { useI18n } from 'vue-i18n';


export default defineComponent({
  components: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    VueSignaturePad,
  },
  props: {
    modelValue: {
      type: String,
      required: false,
    },
    step: {
      type: Number,
      required: true,
    },
    checkinPartner: {
      type: Object as () => CheckinPartnerInterface,
      required: true,
    },
    isPreCheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
    cardexWarning: {
      type: String,
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
    reservationAmount: {
      type: Number,
      required: true,
    },
    reservationReference: {
      type: String,
      required: true,
    },
    roomTypeName: {
      type: String,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const { t } = useI18n();

    const store = useStore();
    const signature = ref<any>();
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const base64Data = ref('');

    const getCurrentRoomName = () => {
      let roomName = '';
      const roomReservation = store.state.rooms.rooms.find(
        (room) => room.id === currentReservation.value?.preferredRoomId
      );
      if (roomReservation) {
        roomName = roomReservation.name;
      }
      return roomName;
    };

    const documentTypeName = () => {
      let result = '';
      const documentType = store.state.documentType.documentType.find(
        (document) => document.id === props.checkinPartner.documentType
      );
      if (documentType) {
        result = documentType.documentType;
      }
      return result;
    };

    const genderName = () => {
      const gender = props.checkinPartner.gender;
      if (gender === 'male') return t('male');
      if (gender === 'female') return t('female');
      if (gender === 'other') return t('other');
      return '';
    };

    const privacyPolicyText = computed(() => {
      let result;
      if (props.isPreCheckin) {
        result = store.state.precheckin.folioPublicInfo?.pmsPropertyPrivacyPolicy;
      } else {
        result = activeProperty.value?.companyPrivacyPolicy;
      }
      return result;
    });

    const propertyName = computed(() => {
      let result;
      if (props.isPreCheckin) {
        result = store.state.precheckin.folioPublicInfo?.pmsPropertyName;
      } else {
        result = activeProperty.value?.name;
      }
      return result;
    });

    const propertyAddress = computed(() => {
      let result;
      if (props.isPreCheckin && store.state.precheckin.folioPublicInfo) {
        result = `${store.state.precheckin.folioPublicInfo?.pmsPropertyStreet}, ${store.state.precheckin.folioPublicInfo?.pmsPropertyZip}`;
      } else if (activeProperty.value && activeProperty.value.street && activeProperty.value.zip) {
        result = `${activeProperty.value?.street}, ${activeProperty.value?.zip},`;
      }
      return result;
    });

    const propertyCity = computed(() => {
      let result;
      if (props.isPreCheckin) {
        result = store.state.precheckin.folioPublicInfo?.pmsPropertyCity;
      } else {
        result = activeProperty.value?.city;
      }
      return result;
    });

    const propertyCategory = computed(() => {
      let result;
      if (props.isPreCheckin) {
        result = store.state.precheckin.folioPublicInfo?.pmsPropertyIneCategory;
      } else {
        result = activeProperty.value?.ineCategory;
      }
      return result;
    });

    const checkinPartnerFullName = computed(() => {
      let result = '';
      if (
        props.checkinPartner &&
        props.checkinPartner.firstname !== '#' &&
        props.checkinPartner.lastname !== '#' &&
        props.checkinPartner.lastname2 !== '#'
      ) {
        result = `${props.checkinPartner.firstname} ${props.checkinPartner.lastname} ${props.checkinPartner.lastname2}`;
      }
      return result;
    });

    const companyName = computed(() => {
      let result;
      if (props.isPreCheckin) {
        result = store.state.precheckin.folioPublicInfo?.pmsCompanyName;
      } else {
        result = activeProperty.value?.companyName;
      }
      return result;
    });

    const persistCheckinPartner = () => {
      if (props.isPreCheckin) {
        context.emit('next');
      } else {
        context.emit('persistCheckinPartner');
        context.emit('closeFingerSign');
      }
    };

    const clearSignature = () => {
      if (signature.value?.clearCanvas) {
        base64Data.value = '';
        signature.value?.clearCanvas();
        context.emit('setIsAllowedNextStep', false);
        context.emit('update:modelValue', '');
      }
    };

    const handleAfterUpdateStroke = () => {
      if (signature.value?.saveSignature) {
        base64Data.value = signature.value.saveSignature('image/png') as unknown as string;
        base64Data.value = base64Data.value.replace(/^data:image\/(png|jpg);base64,/, '');
        context.emit('setIsAllowedNextStep', true);
        context.emit('update:modelValue', base64Data.value);
      }
    };

    onMounted(() => {
      if (props.modelValue && signature.value?.fromDataURL) {
        signature.value?.fromDataURL(`data:image/png;base64,${props.modelValue}`);
        base64Data.value = props.modelValue;
      }
      if (base64Data.value !== '') {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
    });
    return {
      currentReservation,
      currentFolio,
      activeProperty,
      signature,
      privacyPolicyText,
      propertyName,
      propertyAddress,
      propertyCategory,
      checkinPartnerFullName,
      companyName,
      propertyCity,
      base64Data,
      handleAfterUpdateStroke,
      documentTypeName,
      getCurrentRoomName,
      genderName,
      persistCheckinPartner,
      clearSignature,
    };
  },
});
</script>

<style lang="scss" scoped>
.container-sign {
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
  .content {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    .first-row {
      display: flex;
      flex-direction: column;
      .main-info {
        .field {
          display: flex;
          align-items: center;
          .title {
            font-weight: bold;
            color: $primary;
            margin-bottom: 1rem;
          }
          .label {
            font-weight: bold;
          }
        }
        .cardex {
          text-align: justify;
          font-size: 0.75rem;
        }
      }
      .additional-text {
        max-width: 100%;
        text-align: justify;
        font-size: 0.75rem;
      }
    }

    .second-row {
      display: flex;
      margin-top: 1rem;
      .wrapper {
        background-color: #c1edf73b;
        border: 1px solid $primary;
        border-radius: 10px;
        user-select: none;
        margin: 0 auto;
        margin-bottom: 1rem;
        position: relative;
        width: 100%;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        .signature-title {
          pointer-events: none;
          touch-action: none;
          font-size: 13px;
          position: absolute;
          top: 0;
          left: 0;
          max-width: 70%;
          margin: 0.5rem;
          font-weight: bold;
          text-align: left;
        }
        .clear-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          margin: 0.5rem;
          background-color: transparent;
          color: $primary;
          border: none;
          cursor: pointer;
          outline: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    .save-btn {
      background-color: $primary;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 0.5rem 3rem;
      font-size: 16px;
      cursor: pointer;
      margin: 1rem auto;
      font-weight: bold;
      width: fit-content;
      &:hover {
        opacity: 0.8;
      }
      .disabled {
        cursor: not-allowed !important;
        touch-action: none;
        opacity: 0.3;
      }
    }
  }
}
@media (min-width: 768px) {
  .container-sign {
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
    .content {
      .first-row {
        margin: 0 2rem;
        .main-info {
          display: flex;
          justify-content: space-between;
          .first,
          .second,
          .third {
            text-align: left;
            margin: 0 0.5rem;
            max-width: 200px;
          }
          br {
            display: none;
          }

          .first {
            .field:nth-child(2) {
              white-space: nowrap;
            }
          }

          .third {
            .field:not(.title) {
              max-width: 300px;
            }
          }
        }
      }
      .second-row {
        .wrapper {
          width: 350px;
          height: 200px;
        }
      }
    }
  }
}
</style>
