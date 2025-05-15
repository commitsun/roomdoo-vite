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
      {{ $t('guest') }}
    </div>

    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">
        {{ $t('regular_customer_search') }}
      </span>
    </div>

    <div class="step-subtitle">{{ $t('search_by') }}</div>

    <div class="autocomplete-customer-search">
      <AutocompleteComponent
        :items="itemsAutocompleteCustomer"
        v-model="selectedPartnerId"
        :minChars="5"
        :showAddNewOption="false"
        keepResultAfterChoose
        :maxHeight="150"
        :emptyResultsAfterClick="false"
        iconExpandCollapse
        inputColorText="primary"
        :isBorder="false"
        :resultsFontSize="20"
        isChangeFocusOnEnter
        @textSearchChanges="fetchGuest($event)"
        icon="app-images/icon-search-partner.svg"
        @isOpen="isOpenAutocomplete = $event"
        @keydown.esc="handleKeyPressEsc($event)"
        ref="autocompleteCustomerSearchRef"
      >
        <template #icon>
          <CustomIcon
            imagePath="/app-images/icon-search-partner.svg"
            color="primary"
            width="20px"
            height="20px"
          />
        </template>
      </AutocompleteComponent>
    </div>

    <div
      class="checkin-partner-existing-feedback"
      v-if="existingCheckinPartner && !isExistingCheckinPartnerAlreadyInReservation"
    >
      <span>
        {{ $t('guest_already_exists') }}<br />
        <span v-if="!isExistingCheckinPartnerMandatoryDataComplete">
          <br />
          <b>{{ $t('guest_data_incomplete') }}</b><br />
          {{ $t('guest_data_update_required') }}
        </span>
        <span v-else>
          {{ $t('guest_data_confirm') }}
        </span>
      </span>
    </div>

    <div
      class="checkin-partner-existing-feedback"
      v-else-if="isExistingCheckinPartnerAlreadyInReservation"
    >
      <span>
        <b>{{ $t('guest_already_in_reservation') }}</b><br />
        {{ $t('guest_check_duplicates') }}
      </span>
    </div>

    <div class="checkin-flow-card">
      <slot
        name="checkin-flow-card"
        v-if="existingCheckinPartner && !isExistingCheckinPartnerAlreadyInReservation"
      />
    </div>

    <div class="btns-container">
      <div
        class="existing-btns"
        v-if="existingCheckinPartner && !isExistingCheckinPartnerAlreadyInReservation"
      >
        <button
          class="btn-continue"
          :class="{ 'btn-continue-secondary': isCheckinToday() }"
          @click="performSaveCheckinPartner()"
          id="btn-save-existing-partner"
        >
          {{
            checkinPartnersToComplete.length - 1 > 0
              ? $t('continue_with_next_guest')
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
  watch,
  type Ref,
  onMounted,
  onUnmounted,
  type ComponentPublicInstance,
} from 'vue';

import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { type PartnerInterface } from '@/legacy/interfaces/PartnerInterface';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import { usePartner } from '@/legacy/utils/usePartner';

import { useStore } from '@/legacy/store';

export default defineComponent({
  props: {
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
  },
  components: {
    AutocompleteComponent,
    CustomIcon,
  },
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const { checkinMandatoryDataComplete } = useCheckinPartner();

    const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find(
      (el) => el.code === 'ES'
    )?.id;

    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (el) => el.code === 'D'
    )?.id;

    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (el) => el.code === 'N'
    )?.id;

    const selectedPartnerId = ref(0);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const isOpenAutocomplete = ref(false);
    const autocompleteCustomerSearchRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> =
      ref(null);

    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const partners = computed(() => store.state.partners.partners);

    const checkinPartnersToComplete = computed(() =>
      store.state.checkinPartners.checkinpartners.filter(
        (cp) => cp.checkinPartnerState === 'draft' || cp.checkinPartnerState === 'dummy'
      )
    );

    const existingCheckinPartner = computed(() => {
      let rdo: CheckinPartnerInterface | null = null;
      if (store.state.partners.currentPartner && currentReservation.value?.id) {
        const {
          name,
          firstname,
          lastname,
          lastname2,
          email,
          mobile,
          documentNumber,
          documentType,
          documentExpeditionDate,
          documentCountryId,
          documentSupportNumber,
          gender,
          birthdate,
          residenceStreet,
          residenceCity,
          nationality,
        } = store.state.partners.currentPartner;
        rdo = {
          id: props.checkinPartnerId,
          reservationId: currentReservation.value?.id,
          name,
          firstname,
          lastname,
          lastname2,
          email,
          mobile,
          documentCountryId,
          documentNumber,
          documentType,
          documentExpeditionDate,
          documentSupportNumber,
          gender,
          birthdate,
          residenceStreet,
          residenceCity,
          nationality,
          zip: store.state.partners.currentPartner.residenceZip,
          countryId: store.state.partners.currentPartner.residenceCountryId,
          countryState: store.state.partners.currentPartner.stateId,
        };
      }
      return rdo;
    });

    const isExistingCheckinPartnerMandatoryDataComplete = computed(() => {
      let result = false;
      if (existingCheckinPartner.value) {
        result = checkinMandatoryDataComplete(
          existingCheckinPartner.value,
          DOCUMENT_TYPE_DNI === existingCheckinPartner.value.documentType,
          DOCUMENT_TYPE_NIE === existingCheckinPartner.value.documentType,
          NATIONALITY_CODE_SPAIN === existingCheckinPartner.value.countryId
        );
      }
      return result;
    });

    const isExistingCheckinPartnerAlreadyInReservation = computed(() => {
      let result = false;
      if (
        existingCheckinPartner.value &&
        existingCheckinPartner.value.documentNumber &&
        existingCheckinPartner.value.documentType
      ) {
        result = store.state.checkinPartners.checkinpartners.some(
          (cp) =>
            cp.documentNumber === existingCheckinPartner.value?.documentNumber &&
            cp.documentType === existingCheckinPartner.value?.documentType &&
            cp.id !== existingCheckinPartner.value?.id
        );
      }
      return result;
    });

    const handleKeyPressEsc = (event: KeyboardEvent) => {
      if (isOpenAutocomplete.value) {
        event.stopPropagation();
      }
    };

    const fetchGuest = async (name: string) => {
      selectedPartnerId.value = 0;
      await store.dispatch('partners/removePartners');
      if (name.length >= 5) {
        fetchPartners({
          limit: 20,
          offset: 0,
          multiFieldSearch: name,
        });
      }
    };

    const isCheckinToday = () => {
      const today = new Date();
      const checkinDate = new Date(store.state.reservations.currentReservation?.checkin || '');
      if (
        today.getDate() >= checkinDate.getDate() &&
        today.getMonth() >= checkinDate.getMonth() &&
        today.getFullYear() >= checkinDate.getFullYear()
      ) {
        return true;
      }
      return false;
    };

    const performSaveCheckinPartner = () => {
      if (existingCheckinPartner.value) {
        context.emit('persistExistingCheckinPartner', existingCheckinPartner.value);
      }
      context.emit('continueCheckinFlow');
    };

    watch(selectedPartnerId, () => {
      if (store.state.partners.partners.length > 0 && selectedPartnerId.value !== 0) {
        const partner =
          store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
        selectedPartner.value = partner;
        if (partner) {
          void store.dispatch('partners/setCurrentPartner', partner);
        }
      } else if (selectedPartnerId.value === 0) {
        void store.dispatch('partners/setCurrentPartner', null);
      }
    });

    watch(existingCheckinPartner, async () => {
      if (existingCheckinPartner.value) {
        context.emit('setActiveCheckinPartner', existingCheckinPartner.value);
        if (existingCheckinPartner.value.countryId) {
          await store.dispatch(
            'countryStates/fetchCountryStates',
            existingCheckinPartner.value.countryId
          );
        }
      }
    });

    watch(partners, () => {
      itemsAutocompleteCustomer.value = partners.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
    });

    onMounted(() => {
      void store.dispatch('partners/clearCurrentPartner');
      void store.dispatch('checkinPartners/clearCheckinPartner');
      autocompleteCustomerSearchRef.value?.focus();
      context.emit('setIsAllowedNextStep', false);
    });

    onUnmounted(() => {
      void store.dispatch('partners/removePartners');
      void store.dispatch('partners/clearCurrentPartner');
    });

    return {
      itemsAutocompleteCustomer,
      selectedPartnerId,
      currentReservation,
      checkinPartnersToComplete,
      fetchGuest,
      isCheckinToday,
      isOpenAutocomplete,
      autocompleteCustomerSearchRef,
      handleKeyPressEsc,
      existingCheckinPartner,
      isExistingCheckinPartnerMandatoryDataComplete,
      isExistingCheckinPartnerAlreadyInReservation,
      performSaveCheckinPartner,
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
    }
  }

  // subtitle
  .step-subtitle {
    width: 100%;
    font-size: 13px;
    color: #4f4f4f;
    margin: 0 1rem;
  }
  .autocomplete-customer-search {
    width: 100%;
    padding: 0 0.5rem;
    margin-top: 50px;
    font-size: 30px;
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
        margin-right: 1.2rem;
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
      .buttons {
        display: flex;
        align-items: center;
        justify-content: center;
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
    padding: 1rem;
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
    .btn-continue-secondary {
      background-color: #f5f5f5;
      color: $primary;
    }
    .empty-div {
      width: 160px;
      height: 40px;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 30px;
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
    .autocomplete-customer-search {
      width: 90%;
      max-width: 700px;
    }
    .checkin-partner-existing-feedback {
      font-size: 15px;
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
            margin-right: 0;
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
}
</style>
