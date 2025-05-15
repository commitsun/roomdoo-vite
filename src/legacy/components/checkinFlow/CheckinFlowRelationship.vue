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
        {{ $t('responsible_adult_title') }}
        <span class="asterisk">*</span>
      </span>
    </div>

    <span class="step-subtitle">
      {{ $t('responsible_adult_subtitle') }}
    </span>

    <div class="input-wrap" v-if="isPrecheckin">
      <span class="input-label">{{ $t('responsible_adult_document_label') }}</span>
      <InputText
        isUpperCase
        v-model="adultDocumentNumber"
        borderColor="#CAE8F5"
        :isBorder="false"
        :isError="false"
        :placeholderBlue="true"
        textColor="primary"
        @blur="blurAdultDocumentNumber"
        @focus="focusAdultDocumentNumber"
        class="input-text"
        ref="adultDocumentNumberInputRef"
      />
    </div>
    <div class="input-wrap" v-else>
      <span class="input-label">{{ $t('responsible_adult_label') }}</span>
      <AutocompleteComponent
        class="input-text"
        v-model="selectedResponsibleCheckinPartnerId"
        :items="adultsInFolio"
        focusable
        inputColorText="primary"
        iconExpandCollapse
        keepResultAfterChoose
        :isBorder="false"
        :maxHeight="200"
        :showAddNewOption="false"
        :resultsFontSize="18"
        :emptyResultsAfterClick="false"
        :minChars="0"
        ref="responsibleCheckinPartnerIdInputRef"
      />
    </div>
    <div class="input-wrap">
      <span class="input-label">{{ $t('relationship_label') }}</span>
      <AutocompleteComponent
        class="input-text"
        v-model="selectedRelationShip"
        :items="optionsRelationship.map((item) => ({ value: item.id, name: $t(item.text) }))"
        focusable
        inputColorText="primary"
        iconExpandCollapse
        keepResultAfterChoose
        :isBorder="false"
        :maxHeight="200"
        :showAddNewOption="false"
        :resultsFontSize="18"
        :emptyResultsAfterClick="false"
        :minChars="0"
      />
    </div>

    <div class="input-error" v-if="isAdultDocumentNumberMissingInFolio && adultDocumentNumber !== ''">
      <CustomIcon
        imagePath="/app-images/icon-alert.svg"
        color="#982113"
        width="12px"
        height="12px"
      />
      <span>
        {{ $t('responsible_adult_not_found') }}
      </span>
    </div>
    <div class="additional-info">
      <span>{{ $t('responsible_adult_note') }}</span>
    </div>
    <div class="btn-continue-container" v-if="canProceedToNextStep">
      <button class="btn-continue" @click="next()">
        {{ $t('accept') }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  type Ref,
  type ComponentPublicInstance,
} from 'vue';
import { useStore } from '@/legacy/store';

import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    AutocompleteComponent,
    InputText,
    CustomIcon,
  },

  props: {
    relationship: {
      type: String,
      required: false,
      default: '',
    },
    documentLegalRepresentative: {
      type: String,
      required: false,
      default: '',
    },
    responsibleCheckinPartnerId: {
      type: Number,
      required: false,
      default: 0,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    isPrecheckin: {
      type: Boolean,
      required: false,
      default: false,
    },
    reservationId: {
      type: Number,
      required: false,
    },
    reservationToken: {
      type: String,
      required: false,
    },
  },

  setup(props, context) {
    const store = useStore();
    const { t } = useI18n();
    const optionsRelationship = [
      { id: 1, code: 'PM', text: t('parent') },
      { id: 2, code: 'TU', text: t('guardian') },
      { id: 3, code: 'TI', text: t('uncle_aunt') },
      { id: 4, code: 'HR', text: t('sibling') },
      { id: 5, code: 'AB', text: t('grandparent') },
      { id: 6, code: 'BA', text: t('great_grandparent') },
      { id: 7, code: 'CD', text: t('brother_sister_in_law') },
      { id: 8, code: 'CY', text: t('spouse') },
      { id: 9, code: 'SB', text: t('nephew_niece') },
      { id: 10, code: 'SG', text: t('parent_in_law') },
      { id: 11, code: 'YN', text: t('son_daughter_in_law') },
      { id: 12, code: 'OT', text: t('other') }
    ];
    let hasEmittedNext = false;

    const adultDocumentNumber = ref('');
    const selectedRelationShip = ref(0);
    const selectedResponsibleCheckinPartnerId = ref(0);
    const isAdultDocumentNumberMissingInFolio = ref(false);
    const adultDocumentNumberInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> =
      ref(null);
    const responsibleCheckinPartnerIdInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> =
      ref(null);

    const adultsInFolio = computed(() =>
      store.state.folios.adultsInFolio.map((el) => ({
        value: el.id ?? 0,
        name: el.name ?? '',
      }))
    );

    const canProceedToNextStep = computed(() => {
      let result = false;
      if (props.isPrecheckin) {
        result =
          selectedRelationShip.value !== 0 &&
          !isAdultDocumentNumberMissingInFolio.value &&
          adultDocumentNumber.value !== '';
      } else {
        result =
          selectedRelationShip.value !== 0 && selectedResponsibleCheckinPartnerId.value !== 0;
      }
      return result;
    });

    const blurAdultDocumentNumber = async () => {
      await store.dispatch('precheckin/checkSomeAdultsInFolio', {
        reservationId: props.reservationId,
        token: props.reservationToken,
        documentNumber: adultDocumentNumber.value,
      });
      if (store.state.precheckin.areThereAnyAdultsInFolio) {
        isAdultDocumentNumberMissingInFolio.value = false;
        context.emit('update:documentLegalRepresentative', adultDocumentNumber.value);
      } else {
        isAdultDocumentNumberMissingInFolio.value = true;
      }
    };
    const focusAdultDocumentNumber = () => {
      isAdultDocumentNumberMissingInFolio.value = false;
      context.emit('update:documentLegalRepresentative', '');
    };

    const next = () => {
      if (canProceedToNextStep.value && !hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
      }
    };
    watch(
      canProceedToNextStep,
      (value) => {
        if (value) {
          context.emit('setIsAllowedNextStep', true);
        } else {
          context.emit('setIsAllowedNextStep', false);
        }
      },
      { immediate: true }
    );

    watch(selectedRelationShip, () => {
      const selectedRelationShipCode =
        optionsRelationship.find((item) => item.id === selectedRelationShip.value)?.code || '';
      context.emit('update:relationship', selectedRelationShipCode);
    });

    watch(selectedResponsibleCheckinPartnerId, () => {
      context.emit('update:responsibleCheckinPartnerId', selectedResponsibleCheckinPartnerId.value);
    });

    onMounted(async () => {
      if (props.documentLegalRepresentative) {
        adultDocumentNumber.value = props.documentLegalRepresentative;
      }
      if (props.relationship) {
        selectedRelationShip.value =
          optionsRelationship.find((item) => item.code === props.relationship)?.id || 0;
      }
      if (!props.isPrecheckin && store.state.folios.currentFolio) {
        await store.dispatch('folios/fetchAdultsInFolio', store.state.folios.currentFolio.id);
        if (props.responsibleCheckinPartnerId) {
          const responsibleAdult = adultsInFolio.value.find(
            (el) => el.value === props.responsibleCheckinPartnerId
          );
          if (responsibleAdult) {
            selectedResponsibleCheckinPartnerId.value = responsibleAdult.value;
          }
        }
      }
      if (adultDocumentNumberInputRef.value) {
        adultDocumentNumberInputRef.value.focus();
      } else if (responsibleCheckinPartnerIdInputRef.value) {
        responsibleCheckinPartnerIdInputRef.value.focus();
      }
    });

    return {
      adultDocumentNumber,
      selectedRelationShip,
      isAdultDocumentNumberMissingInFolio,
      optionsRelationship,
      canProceedToNextStep,
      adultsInFolio,
      selectedResponsibleCheckinPartnerId,
      adultDocumentNumberInputRef,
      responsibleCheckinPartnerIdInputRef,
      blurAdultDocumentNumber,
      focusAdultDocumentNumber,
      next,
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

  .input-wrap {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    padding: 0 1rem;
    .input-label {
      font-size: 18px;
      color: $primary;
      margin-top: 2rem;
    }
    .input-text {
      width: 100%;
      font-size: 20px;
      color: $primary;
      padding: 0.5rem 0;
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
  .input-error {
    color: #982113;
    display: flex;
    align-items: center;
    margin-top: 1.5rem;
    padding: 0.25rem 0.75rem;
    background-color: #f3e3e3;
    border-radius: 20px;
    span {
      margin-left: 10px;
      font-size: 14px;
    }
  }
  .additional-info {
    margin-top: 0.5rem;
    color: gray;
    margin-left: 10px;
    font-size: 16px;
    padding: 0.5rem 1rem;
    text-align: justify;
    font-style: italic;
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
      margin-top: 30px;
      visibility: visible;
      border: none;
    }
  }
  .empty-div {
    width: 160px;
    height: 40px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
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
      text-align: center;
    }
    .input-wrap {
      width: 500px;
      .input-label {
        font-size: 20px;
      }
      input {
        width: 100%;
        font-size: 30px;
      }
      .input-text {
        font-size: 30px;
      }
      .input-error {
        span {
          font-size: 12px;
        }
      }
    }
    .btn-continue {
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
      margin-top: 30px;
    }
    .empty-div {
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
      margin-top: 30px;
    }
  }
}
</style>
