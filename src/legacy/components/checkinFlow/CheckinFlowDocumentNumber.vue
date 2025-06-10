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
        {{ $t('document_number_title') }}
        <span class="asterisk">*</span>
      </span>
    </div>

    <span class="step-subtitle">
      {{ $t('document_number_subtitle') }}
    </span>

    <InputText
      v-model="documentNumber"
      class="input"
      @keydown="handleKeypress($event)"
      :placeholder="$t('placeholder_write_here')"
      :isBorder="false"
      placeholderBlue
      textColor="primary"
      isFocusWhenMounted
      ref="documentNumberInputRef"
      isUpperCase
    />

    <div
      class="checkin-partner-existing-feedback"
      v-if="existingCheckinPartner && !isDocumentNumberAlreadyInReservation"
    >
      <span>
        {{ $t('document_already_exists') }}<br />
        <span v-if="!isExistingCheckinPartnerMandatoryDataComplete">
          <br />
          <b>{{ $t('guest_data_incomplete') }}</b>
          <br />
          {{ $t('guest_data_update_required') }}
        </span>
        <span v-else>
          <span v-if="!isPrecheckin">
            {{ $t('guest_data_confirm') }}
          </span>
          <span v-else> {{ $t('guest_data_completed') || 'Todos los datos están completos.' }} </span>
        </span>
      </span>
    </div>

    <div class="checkin-partner-existing-feedback" v-else-if="isDocumentNumberAlreadyInReservation">
      <span>
        <b>{{ $t('guest_already_in_reservation') }}</b><br />
      </span>
    </div>

    <div
      class="checkin-flow-card"
      v-if="existingCheckinPartner && !isDocumentNumberAlreadyInReservation"
    >
      <slot name="checkin-flow-card" />
    </div>

    <div class="btns-container">
      <div v-if="validator.documentNumber.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>{{ validator.documentNumber.$errors[0].$message }}</span>
      </div>

      <button
        class="btn-continue"
        @click="processDocumentNumber()"
        v-if="
          !existingCheckinPartner &&
          validateDocumentNumber(documentTypeCode, documentNumber, documentCountryId) &&
          documentNumber !== '' &&
          !isDocumentNumberAlreadyInReservation
        "
        @keydown.esc="$emit('closeCheckinFlow')"
      >
        {{ $t('accept') }}
      </button>

      <div
        class="existing-btns"
        v-if="existingCheckinPartner && !isDocumentNumberAlreadyInReservation"
      >
        <button
          ref="btnAcceptExistingCheckinPartnerRef"
          id="btn-save-existing-partner"
          class="btn-continue"
          @click="performSaveCheckinPartner()"
        >
          {{
            checkinPartnersToComplete.length - 1 > 0
              ? $t('save_and_continue_next_guest')
              : $t('save')
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  type Ref,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { type AxiosResponse } from 'axios';
import { isNIF } from 'better-dni';
import { useRoute } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';

import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  emits: [
    'update:modelValue',
    'setIsAllowedNextStep',
    'closeCheckinFlow',
    'next',
    'persistCheckinPartner',
    'continueCheckinFlow',
    'setActiveCheckinPartner',
    'persistExistingCheckinPartner',
    'clearExistingCheckinPartner',
  ],
  components: {
    CustomIcon,
    InputText,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    documentType: {
      type: Number,
      required: true,
    },
    documentCountryId: {
      type: Number,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    checkinPartnerId: {
      type: Number,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      default: false,
    },
    checkinPartners: {
      type: Array as () => CheckinPartnerInterface[],
      required: true,
    },
    reservationId: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props, context) {
    let hasEmittedNext = false;

    const { t } = useI18n();
    const store = useStore();
    const route = useRoute();

    const { checkinMandatoryDataComplete, validateDocumentNumber } = useCheckinPartner();

    const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find(
      (el) => el.code === 'ES'
    )?.id;

    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (el) => el.code === 'D'
    )?.id;

    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (el) => el.code === 'N'
    )?.id;

    const documentNumber = ref('');
    const documentNumberInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const btnAcceptExistingCheckinPartnerRef: Ref<HTMLButtonElement | null> = ref(null);

    const documentTypeCode = computed(
      () => store.state.documentType.documentType.find((el) => el.id === props.documentType)?.code
    );

    const checkinPartnersToComplete = computed(() =>
      props.checkinPartners.filter(
        (cp) => cp.checkinPartnerState === 'draft' || cp.checkinPartnerState === 'dummy'
      )
    );

    const isDocumentNumberAlreadyInReservation = computed(() => {
      let result = false;
      result =
        props.checkinPartners.some(
          (cp) =>
            (cp.documentNumber ?? '').toLowerCase() ===
              (documentNumber.value ?? '').toLowerCase() &&
            cp.documentType === props.documentType &&
            cp.id !== props.checkinPartnerId
        ) || store.state.precheckin.existingCheckinPartner?.isAlreadyInReservation === true;

      return result;
    });

    const existingCheckinPartner = computed(() => {
      let rdo = null;
      if (props.isPrecheckin) {
        if (store.state.precheckin.existingCheckinPartner) {
          rdo = {
            ...store.state.precheckin.existingCheckinPartner,
            id: props.checkinPartnerId,
            partnerId: store.state.precheckin.existingCheckinPartner.partnerId,
            reservationId: props.reservationId,
          };
        }
      } else if (store.state.checkinPartners.checkinPartner) {
        rdo = {
          ...store.state.checkinPartners.checkinPartner,
          id: props.checkinPartnerId,
          reservationId: props.reservationId,
        };
      }
      return rdo;
    });

    const isExistingCheckinPartnerMandatoryDataComplete = computed(() => {
      let result = false;
      const existingCheckinPartnerCopy = { ...existingCheckinPartner.value };
      delete existingCheckinPartnerCopy.reservationId;
      if (existingCheckinPartner.value) {
        result = checkinMandatoryDataComplete(
          // for this function is not necessary to pass the reservationId
          // so we can receive reservationId as number or string withouth
          // any other conflicts
          // so the operation is remove the reservationId from the object
          { ...existingCheckinPartner.value, reservationId: -1 },
          DOCUMENT_TYPE_DNI === existingCheckinPartner.value.documentType,
          DOCUMENT_TYPE_NIE === existingCheckinPartner.value.documentType,
          NATIONALITY_CODE_SPAIN === existingCheckinPartner.value.countryId
        );
      }
      return result;
    });

    const validDocumentNumber = () => {
      let rdo = true;
      if (props.documentType) {
        if (documentTypeCode.value && documentNumber.value && documentNumber.value.length > 0) {
          rdo = validateDocumentNumber(documentTypeCode.value, documentNumber.value, props.documentCountryId);
        }
      }
      return rdo;
    };

    const validationRules = computed(() => ({
      documentNumber: {
        validDocumentNumber: helpers.withMessage(t('invalid_document_number'), validDocumentNumber),
      },
    }));

    const validator = useVuelidate(validationRules, {
      documentNumber,
    });

    const processDocumentNumber = async () => {
      validator.value.$touch();
      if (validator.value.$error) {
        return;
      }
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        void store.dispatch('layout/showSpinner', true);
        try {
          if (props.isPrecheckin) {
            // look for existing checkin partner - PRECHECKIN
            await store.dispatch('precheckin/fetchPartnerByDocNumber', {
              documentNumber: documentNumber.value,
              documentType: props.documentType,
              reservationId: route.params.reservationId,
              token: route.params.reservationToken,
            });
          } else {
            // look for existing checkin partner - REGULAR CHECKIN
            await store.dispatch('checkinPartners/fetchCheckinPartnerByDocNumber', {
              documentNumber: documentNumber.value,
              documentType: props.documentType,
            });
          }
          // if afterall there is no existing checkin partner
          if (
            existingCheckinPartner.value === null &&
            Object.values(store.state.ocrDocument.documentData).every(
              (field) => field === null || field === '' || field === 0
            )
          ) {
            // TODO: REVIEW THIS
            context.emit('clearExistingCheckinPartner');
            // backend document validation
            const response = (await store.dispatch('partners/checkDocumentNumber', {
              documentNumber: documentNumber.value,
              documentType: props.documentType,
              documentCountryId: props.documentCountryId,
            })) as AxiosResponse<string>;
            if (response.status === 200) {
              context.emit('update:modelValue', documentNumber.value.toUpperCase());
              context.emit('next');
              context.emit('persistCheckinPartner');
            }
          } else if (
            Object.values(store.state.ocrDocument.documentData).some(
              (field) => field !== null && field !== '' && field !== 0
            )
          ) {
            context.emit('update:modelValue', documentNumber.value.toUpperCase());
            context.emit('next');
          } else {
            context.emit('update:modelValue', documentNumber.value.toUpperCase());
          }
        } catch (error) {
          context.emit('update:modelValue', '');
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
      }
    };

    const handleKeypress = async (event: KeyboardEvent) => {
      validator.value.$reset();
      if (
        (event.key === 'Enter' || event.key === 'Tab') &&
        documentNumber.value !== '' &&
        !isDocumentNumberAlreadyInReservation.value
      ) {
        await processDocumentNumber();

        btnAcceptExistingCheckinPartnerRef.value?.focus();
      } else if (event.key === 'Escape') {
        context.emit('closeCheckinFlow');
      } else {
        hasEmittedNext = false;
        void store.dispatch('checkinPartners/clearCheckinPartner');
        void store.dispatch('precheckin/clearExistingCheckinPartner');
      }
    };

    const performSaveCheckinPartner = () => {
      if (existingCheckinPartner.value) {
        context.emit('persistExistingCheckinPartner', existingCheckinPartner.value);
      }
      context.emit('continueCheckinFlow');
    };

    watch(existingCheckinPartner, async () => {
      if (existingCheckinPartner.value) {
        context.emit('setActiveCheckinPartner', {
          ...existingCheckinPartner.value,
          documentNumber: documentNumber.value,
        });
        if (existingCheckinPartner.value.countryId) {
          await store.dispatch(
            'countryStates/fetchCountryStates',
            existingCheckinPartner.value.countryId
          );
        }
      }
    });

    onMounted(() => {
      void store.dispatch('checkinPartners/clearCheckinPartner');
      if (
        Object.values(store.state.ocrDocument.documentData).every(
          (field) => field === null || field === '' || field === 0
        )
      ) {
        void store.dispatch('precheckin/clearExistingCheckinPartner');
      }
      documentNumber.value = props.modelValue;
      context.emit('setIsAllowedNextStep', false);
      documentNumberInputRef.value?.focus();
    });

    return {
      checkinPartnersToComplete,
      documentNumber,
      documentTypeCode,
      documentNumberInputRef,
      btnAcceptExistingCheckinPartnerRef,
      existingCheckinPartner,
      isExistingCheckinPartnerMandatoryDataComplete,
      isDocumentNumberAlreadyInReservation,
      validator,
      processDocumentNumber,
      handleKeypress,
      performSaveCheckinPartner,
      validateDocumentNumber,
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

  .input {
    font-size: 20px;
    margin-top: 30px;
    color: $primary;
    width: 90%;
    height: auto;
    padding-bottom: 0.5rem;
  }
  .input::placeholder {
    color: #cae8f5;
  }
  .input-error {
    color: #982113;
    display: flex;
    align-items: center;
    margin-top: 1rem;
    padding: 0.25rem 0.75rem;
    background-color: #f3e3e3;
    border-radius: 20px;
    align-self: flex-start;
    span {
      margin-left: 10px;
      font-size: 14px;
    }
  }

  .checkin-partner-existing-feedback {
    font-size: 15px;
    background-color: white;
    margin: 1rem 0;
    width: 88%;
    .no-checkin-data-complete {
      font-weight: bold;
    }
  }
  .checkin-partner-existing {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #faf8f8;
    border-radius: 12px;
    width: 90%;

    .checkin-partner-existing-title {
      background-color: #f0fcff;
      font-size: 16px;
      width: 100%;
      font-weight: bold;
      padding: 0.5rem 0;
      border-radius: 10px 10px 0px 0px;
      margin-bottom: 1rem;
      span {
        margin-left: 1rem;
      }
    }
    .card-content {
      padding-bottom: 1rem;
      width: 100%;
      .data-reservation-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        .reservation-title {
          margin-left: 1rem;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .reservation-data {
          font-weight: bold;
          margin-right: 1rem;
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
      }
      .btn-do-checkin {
        margin-top: 1rem;
        background-color: $primary;
        border-radius: 5px;
        padding: 0.25rem 1rem 0.25rem 0.5rem;
        float: right;
        margin-right: 0.8rem;
        font-weight: bold;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        &:focus {
          outline: none;
        }
        .icon-checkin {
          margin-right: 5px;
        }
      }
      .btn-reprint-checkin {
        margin-top: 1.2rem;
        background-color: transparent;
        padding: 0.25rem 1rem;
        margin-right: 0.5rem;
        font-weight: bold;
        border: none;
        color: $primary;
        float: right;
        cursor: pointer;
        font-size: 14px;
        &:focus {
          outline: none;
        }
      }
      .btn-edit-partner {
        margin-top: 1.2rem;
        background-color: transparent;
        padding: 0.25rem 1rem;
        margin-right: 1rem;
        font-weight: bold;
        border: none;
        color: $primary;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        &:focus {
          outline: none;
        }
        img {
          margin-right: 5px;
          width: 16px;
          height: 16px;
        }
      }
      hr {
        border: none;
        height: 1px;
        background-color: #e1e0e0;
        width: 95%;
      }
      .btn-save,
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
    }
  }
  .existing-btns {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .checkin-flow-card {
    width: 100%;
  }

  .btns-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .btn-continue {
      height: 40px;
      min-width: 160px;
      padding: 0.25rem 1rem;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-top: 30px;
      visibility: visible;
      border: none;
      &:focus {
        outline: none;
      }
    }
  }
  .title-checkin-partner-modal {
    padding: 0.5rem;
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
    .input {
      font-size: 30px;
      width: 500px;
      height: auto;
    }

    .checkin-partner-existing-feedback {
      font-size: 15px;
      width: 500px;
      margin: 1rem 0;
    }
    .checkin-partner-existing {
      width: 500px;
      .checkin-partner-existing-title {
        font-size: 16px;
        span {
          margin-left: 1rem;
        }
      }

      .card-content {
        margin: 0 1rem;
        .data-reservation-row {
          .reservation-title {
            margin-left: 1rem;
            font-size: 16px;
          }
          .reservation-data {
            font-size: 16px;
            margin-right: 1rem;
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
          display: flex;
          justify-content: flex-end;
          align-items: center;
          .btn-do-checkin {
            margin-top: 1rem;
            background-color: $primary;
            border-radius: 5px;
            padding: 0.25rem 1rem 0.25rem 0.5rem;
            margin-right: 1rem;
            font-weight: bold;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            &:focus {
              outline: none;
            }
            .icon-checkin {
              margin-right: 5px;
            }
          }
          .btn-edit-partner {
            margin-top: 1.2rem;
            background-color: transparent;
            padding-top: 0.25rem;
            padding-left: 1rem;
            margin-right: auto;
            font-weight: bold;
            border: none;
            color: $primary;
            font-size: 14px;
            cursor: pointer;
            &:focus {
              outline: none;
            }
          }
          .btn-reprint-checkin {
            margin-top: 1.2rem;
            background-color: transparent;
            padding: 0.25rem 1rem;
            font-weight: bold;
            border: none;
            color: $primary;
            font-size: 14px;
            cursor: pointer;
            &:focus {
              outline: none;
            }
          }
        }
        .btn-save,
        .btn-save-existing-partner {
          margin-top: 1rem;
          font-size: 14px;
          padding: 0.25rem 0.5rem;
          margin-right: 1rem;
          &:focus {
            outline: none;
          }
        }
      }
    }

    .checkin-flow-card {
      width: 550px;
    }
  }
  .input-error {
    font-size: 12px;
  }
}
</style>
