<template>
  <div class="page-container" @keydown.esc="$emit('closeCheckinFlow')" tabindex="0">
    <div class="prev-title">
      Datos {{ currentIndexCheckin + 1
      }}<sup>{{ currentIndexCheckin === 0 || currentIndexCheckin === 2 ? 'er' : 'o' }}</sup> huésped
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">
        Datos de residencia
        <span class="asterisk">*</span>
      </span>
    </div>
    <div class="step-subtitle">Introducir datos de residencia del huésped</div>
    <!-- zip autocomplete -->
    <div class="select-wrap" v-if="isSpanishGuest && !isHiddenCity">
      <CustomIcon
        imagePath="/app-images/search.svg"
        color="primary"
        width="20px"
        height="20px"
        class="search-icon"
      />
      <input
        class="input-filter-address"
        ref="addressSearchInputRef"
        type="text"
        placeholder="Busca por código postal o población"
        v-model="address"
        @blur="showFilteredAddresses = false"
        @input="filterAddress"
        @focus="
          filteredAddresses && address
            ? (showFilteredAddresses = true)
            : (showFilteredAddresses = false)
        "
        @keydown="handleAddressKey"
        @keypress.enter="selectAddress(filteredAddresses[focusedAddressIndex])"
        autocomplete="off"
      />
      <div class="address-filter" v-if="showFilteredAddresses">
        <div
          v-for="(filteredAddress, index) in filteredAddresses"
          :key="index"
          class="box-country"
          :class="`${index === focusedAddressIndex ? 'focused' : ''}`"
          @mousedown="selectAddress(filteredAddress)"
        >
          {{ filteredAddress.zipCode }}, {{ filteredAddress.cityId }},
          {{ filteredAddress.stateName }}
        </div>
      </div>
    </div>

    <!-- zip input -->
    <div class="input-wrap" v-if="!isHiddenZip">
      <span class="input-label"> Código postal </span>
      <InputText
        v-model="zip"
        class="input"
        @keydown.enter="focusOnCityInput()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :isBorder="false"
        textColor="primary"
        :isError="validator.zip.$errors.length > 0"
        ref="zipInputRef"
      />
      <div v-if="validator.zip.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>
          {{ validator.zip.$errors[0].$message }}
        </span>
      </div>
    </div>

    <!-- city input -->
    <div class="input-wrap" v-if="!isHiddenCity">
      <span class="input-label"> Población </span>
      <InputText
        v-model="city"
        class="input"
        @keydown.enter="focusOnStateInput()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :isBorder="false"
        textColor="primary"
        :isError="validator.city.$errors.length > 0"
        ref="cityInputRef"
      />
      <div v-if="validator.city.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>
          {{ validator.city.$errors[0].$message }}
        </span>
      </div>
    </div>

    <!-- state autocomplete -->
    <div class="input-wrap" v-if="countryStates && countryStates?.length > 0 && !isHiddenState">
      <span class="input-label"> Provincia </span>
      <div class="select-residence-state-wrap">
        <AutocompleteComponent
          :items="countryStates.map((state) => ({ value: state.id, name: state.name }))"
          id="checkin-flow-state-autocomplete"
          ref="residenceStateInputRef"
          v-model="residenceState"
          :minChars="0"
          :showAddNewOption="false"
          keepResultAfterChoose
          :maxHeight="150"
          :emptyResultsAfterClick="false"
          iconExpandCollapse
          inputColorText="primary"
          :isBorder="false"
          isChangeFocusOnEnter
          :resultsFontSize="18"
          @textSearchChanges="inputAutoCompleteCountriesChanged($event)"
          @focusOut="focusOutAutocomplete()"
          :spaceBetweenIconAndInput="0"
          :isError="validator.residenceState.$errors.length > 0"
        />
      </div>
      <div v-if="validator.residenceState.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>
          {{ validator.residenceState.$errors[0].$message }}
        </span>
      </div>
    </div>

    <button
      class="btn-continue"
      ref="btnContinue"
      id="btn-continue"
      @click="nextAndSave"
      v-show="showBtnContinue()"
    >
      Aceptar
    </button>
    <div v-if="!showBtnContinue()" class="empty-div" />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch,
  type Ref,
  type ComponentPublicInstance,
} from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, required, requiredIf } from '@vuelidate/validators';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/components/roomdooComponents/InputText.vue';
import AutocompleteComponent from '@/components/roomdooComponents/AutocompleteComponent.vue';
import { type AddressInterface } from '@/interfaces/AddressInterface';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    CustomIcon,
    AutocompleteComponent,
    InputText,
  },
  props: {
    countryId: {
      type: Number,
      required: true,
    },
    residenceZip: {
      type: String,
      required: true,
    },
    residenceCity: {
      type: String,
      required: true,
    },
    residenceStateId: {
      type: Number,
      required: true,
    },
    isSpanishGuest: {
      type: Boolean,
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
    isHiddenZip: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHiddenCity: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHiddenState: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    let hasEmittedNext = false;
    const store = useStore();
    const address = ref('');
    const showFilteredAddresses = ref(false);

    const zip = ref('');
    const city = ref('');
    const residenceState = ref(0);
    const countryStates = computed(() => store.state.countryStates.countryStates);
    const focusedAddressIndex = ref(0);
    const btnContinue: Ref<HTMLButtonElement | null> = ref(null);
    const addressSearchInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const zipInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const cityInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);

    const filteredAddresses = computed(() => store.state.address.addresess);

    const validationRules = computed(() => ({
      zip: {
        required: helpers.withMessage('El código postal es obligatorio', required),
      },
      city: {
        required: helpers.withMessage('La población es obligatoria', required),
      },
      residenceState: {
        required: helpers.withMessage(
          'La provincia es obligatoria',
          requiredIf(props.isSpanishGuest)
        ),
      },
    }));
    const validator = useVuelidate(validationRules, {
      zip,
      city,
      residenceState,
    });

    const filterAddress = async () => {
      if (address.value) {
        await store.dispatch('address/fetchAddress', address.value);
        focusedAddressIndex.value = 0;
        showFilteredAddresses.value = true;
      } else {
        void store.dispatch('address/removeAddresses');
        void store.dispatch('address/removeAddress');
        showFilteredAddresses.value = false;
      }
    };

    const showBtnContinue = () => {
      if (countryStates.value && countryStates.value.length > 0) {
        if (zip.value && city.value && residenceState.value) {
          return true;
        }
      } else if (
        (!countryStates.value || (countryStates.value && countryStates.value.length === 0)) &&
        zip.value &&
        city.value
      ) {
        return true;
      }
      return false;
    };

    const scrollToFocusedAddress = () => {
      const selectedElement = document.querySelector('.box-country.focused') as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'center',
        });
      }
    };

    const setFocusToAddressItem = (index: number) => {
      const item = document.querySelectorAll('.box-country')[index];
      const items = document.querySelectorAll('.box-country');
      items.forEach((el) => {
        el.classList.remove('focused');
        scrollToFocusedAddress();
      });
      if (item) {
        item.classList.add('focused');
      }
    };

    const focusAddressNextItem = () => {
      if (focusedAddressIndex.value < filteredAddresses.value.length - 1) {
        focusedAddressIndex.value += 1;
        setFocusToAddressItem(focusedAddressIndex.value);
      }
    };

    const focusAddressPreviousItem = () => {
      if (focusedAddressIndex.value > 0) {
        focusedAddressIndex.value -= 1;
        setFocusToAddressItem(focusedAddressIndex.value);
      }
    };

    const handleAddressKey = (event: KeyboardEvent) => {
      if (showFilteredAddresses.value) {
        const { key } = event;
        if (key === 'Escape') {
          showFilteredAddresses.value = false;
          address.value = '';
        } else if (key === 'ArrowDown') {
          event.preventDefault();
          focusAddressNextItem();
        } else if (key === 'ArrowUp') {
          event.preventDefault();
          focusAddressPreviousItem();
        }
      }
    };

    const focusOnCityInput = () => {
      const input = cityInputRef.value as HTMLInputElement;
      input.focus();
    };

    const nextAndSave = () => {
      validator.value.$touch();
      context.emit('next');
      context.emit('persistCheckinPartner');
    };

    const selectAddress = (addressSelected: AddressInterface) => {
      if (address.value === '' && !validator.value.$invalid) {
        nextAndSave();
        return;
      }
      if (addressSelected) {
        city.value = addressSelected.cityId;
        residenceState.value = addressSelected.stateId;
        zip.value = addressSelected.zipCode;
        address.value = '';
        showFilteredAddresses.value = false;

        if (!validator.value.$invalid) {
          btnContinue.value?.focus();
        }
      }
    };

    const focusOnStateInput = () => {
      if (countryStates.value && countryStates.value.length > 0) {
        const inputAutoCompleteWrapper = document.querySelector('.select-residence-state-wrap');
        if (inputAutoCompleteWrapper) {
          inputAutoCompleteWrapper.querySelector('input')?.focus();
        }
      } else if (!validator.value.$invalid) {
        if (!hasEmittedNext) {
          hasEmittedNext = true;
          context.emit('next');
        }
      }
    };

    const isAllowedNexStep = () => {
      if (!validator.value.$invalid) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
    };

    const inputAutoCompleteCountriesChanged = (value: string) => {
      if (value === '') {
        context.emit('update:residenceStateId', 0);
        residenceState.value = 0;
      } else {
        const countryState = countryStates.value.find((state) => state.name === value);
        if (countryState) {
          context.emit('update:residenceStateId', countryState.id);
          residenceState.value = countryState.id;
        } else {
          context.emit('update:residenceStateId', 0);
          residenceState.value = 0;
        }
      }
    };

    const focusOutAutocomplete = () => {
      if (showBtnContinue() && btnContinue.value) {
        btnContinue.value.style.display = 'block';
      }
      if (btnContinue.value) {
        btnContinue.value.focus();
      }
    };

    watch(zip, () => {
      if (zip.value !== '') {
        context.emit('update:residenceZip', zip.value);
      } else {
        context.emit('update:residenceZip', '');
      }
      isAllowedNexStep();
    });

    watch(city, () => {
      if (city.value !== '') {
        context.emit('update:residenceCity', city.value);
      } else {
        context.emit('update:residenceCity', '');
      }
      isAllowedNexStep();
    });

    watch(residenceState, () => {
      if (residenceState.value !== 0) {
        context.emit('update:residenceStateId', residenceState.value);
      } else {
        context.emit('update:residenceStateId', 0);
      }
      isAllowedNexStep();
    });

    watch(showFilteredAddresses, () => {
      if (!showFilteredAddresses.value) {
        focusedAddressIndex.value = 0;
        setFocusToAddressItem(focusedAddressIndex.value);
      }
    });

    onMounted(async () => {
      // allow next step or not
      if (props.residenceZip !== '' && props.residenceCity !== '' && props.residenceStateId !== 0) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      // load model from props
      if (props.residenceZip) {
        zip.value = props.residenceZip;
      }
      if (props.residenceCity) {
        city.value = props.residenceCity;
      }
      if (props.residenceStateId) {
        residenceState.value = props.residenceStateId;
      }
      // load country states
      if (props.countryId) {
        await store.dispatch('countryStates/fetchCountryStates', props.countryId);
      }
      if (addressSearchInputRef.value) {
        addressSearchInputRef.value.focus();
      } else if (zipInputRef.value) {
        zipInputRef.value.focus();
      } else if (cityInputRef.value) {
        cityInputRef.value.focus();
      } else {
        focusOnStateInput();
      }
    });

    return {
      btnContinue,
      address,
      showFilteredAddresses,
      filteredAddresses,
      zip,
      city,
      residenceState,
      countryStates,
      focusedAddressIndex,
      addressSearchInputRef,
      zipInputRef,
      cityInputRef,
      validator,
      inputAutoCompleteCountriesChanged,
      focusOutAutocomplete,
      filterAddress,
      selectAddress,
      showBtnContinue,
      handleAddressKey,
      focusOnCityInput,
      focusOnStateInput,
      nextAndSave,
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
  .select-wrap {
    position: relative;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    border: 1px solid $primary;
    border-radius: 10px;
    width: 100%;
    .address-filter {
      position: absolute;
      width: 100%;
      max-height: 250px;
      border-radius: 5px;
      overflow-y: scroll;
      background-color: white;
      box-shadow: 0px 0px 5px 0px rgba(75, 177, 224, 0.75);
      z-index: 2;
      transition: max-height 0.2s ease;
      top: 55px;
      &::-webkit-scrollbar {
        width: 11px;
        height: 11px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: lightgray;
        border-radius: 4px;
      }
      .box-country {
        padding: 5px;
        color: $primary;
        cursor: pointer;
      }

      .focused {
        background-color: #dbeff8;
      }
    }
    .countries-filter {
      position: absolute;
      width: 100%;
      max-height: 250px;
      border-radius: 5px;
      overflow-y: scroll;
      background-color: white;
      box-shadow: 0px 0px 5px 0px rgba(75, 177, 224, 0.75);
      z-index: 2;
      transition: max-height 0.2s ease;
      bottom: 0;
      &::-webkit-scrollbar {
        width: 11px;
        height: 11px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: lightgray;
        border-radius: 4px;
      }
      .box-country {
        padding: 5px;
        color: $primary;
        cursor: pointer;
      }
      .active {
        background-color: #dbeff8;
      }
    }
    .countries-filter-hidden {
      transition: max-height 0.2s ease;
      max-height: 0;
      overflow: hidden;
    }
    .down-arrow-wrapper {
      position: absolute;
      right: 0;
      top: 13px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      .down-arrow {
        width: 13px;
        height: 13px;
        transition: all 0.2s ease;
      }
      .down-arrow-up {
        transform: rotate(180deg);
        transition: all 0.2s ease;
      }
    }
    .input-filter-address {
      border: none;
      font-size: 18px;
      color: $primary;
      width: 100%;
      height: 50px;
      border-radius: 10px;

      &:focus {
        outline: none;
      }
    }
    .input-filter-address::placeholder {
      color: #cae8f5;
    }
    .search-icon {
      padding: 0 1rem;
    }
  }
  .input-wrap {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    .input-label {
      font-size: 16px;
      color: $primary;
      margin-top: 2rem;
    }
    .input {
      font-size: 18px;
      padding-bottom: 0.3rem;
    }
    .input-gender {
      cursor: pointer;
    }
    .down-arrow-wrapper {
      position: absolute;
      right: 0;
      top: 13px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      .down-arrow {
        width: 13px;
        height: 13px;
        transition: all 0.2s ease;
      }
      .down-arrow-up {
        transform: rotate(180deg);
        transition: all 0.2s ease;
      }
    }
    .dropdown-filter {
      position: absolute;
      top: 50px;
      width: 100%;
      max-height: 300px;
      border-radius: 5px;
      overflow-y: scroll;
      background-color: white;
      box-shadow: 0px 0px 5px 0px rgba(75, 177, 224, 0.75);
      z-index: 2;
      transition: max-height 0.2s ease;
      &::-webkit-scrollbar {
        width: 11px;
        height: 11px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: lightgray;
        border-radius: 4px;
      }
      .dropdown-box {
        padding: 5px;
        color: $primary;
        cursor: pointer;
      }
      .active {
        background-color: #dbeff8;
      }
    }
    .select-residence-state-wrap {
      width: 100%;
      font-size: 1rem;
      .select-input {
        cursor: pointer;
      }
      .countries-filter {
        position: absolute;
        width: 100%;
        max-height: 250px;
        border-radius: 5px;
        overflow-y: scroll;
        background-color: white;
        box-shadow: 0px 0px 5px 0px rgba(75, 177, 224, 0.75);
        z-index: 2;
        transition: max-height 0.2s ease;
        bottom: 50px;
        &::-webkit-scrollbar {
          width: 11px;
          height: 11px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: lightgray;
          border-radius: 4px;
        }
        .box-state {
          padding: 5px;
          color: $primary;
          cursor: pointer;
        }
        .active {
          background-color: #dbeff8;
        }
      }
      .countries-filter-hidden {
        transition: max-height 0.2s ease;
        max-height: 0;
        overflow: hidden;
      }
      .down-arrow-wrapper {
        position: absolute;
        right: 0;
        top: 13px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        .down-arrow {
          width: 13px;
          height: 13px;
          transition: all 0.2s ease;
        }
        .down-arrow-up {
          transform: rotate(180deg);
          transition: all 0.2s ease;
        }
      }
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
  }
  .btn-continue {
    width: 160px;
    height: 40px;
    background-color: $primary;
    color: #fff;
    font-weight: bold;
    border-radius: 5px;
    display: flex;
    align-self: center;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-top: 2.5rem;
    visibility: visible;
    border: none;
    &:focus {
      outline: none;
    }
  }
  .btn-continue-hidden {
    visibility: hidden;
  }
  .empty-div {
    width: 160px;
    height: 40px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2.5rem;
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
    .select-wrap {
      width: 500px;
      .input-filter-address {
        width: 100%;
        font-size: 20px;
      }
      .input-filter-address::placeholder {
        font-size: 18px;
      }
    }
    .input-wrap {
      width: 500px;
      .input-label {
        font-size: 20px;
      }
      .input {
        width: 100%;
        font-size: 30px;
      }
      .select-residence-state-wrap {
        font-size: 30px;
        .down-arrow-wrapper {
          position: absolute;
          right: 0;
          top: 4px;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          .down-arrow {
            width: 13px;
            height: 13px;
            transition: all 0.2s ease;
          }
          .down-arrow-up {
            transform: rotate(180deg);
            transition: all 0.2s ease;
          }
        }
        .countries-filter {
          bottom: 30px;
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
      width: 100%;
    }
  }
}
</style>
