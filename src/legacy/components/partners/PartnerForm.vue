<template>
  <div class="main-content">
    <div class="existing-partner" v-if="showCompleteAllData">
      <span class="label"> Ya existe un huésped asociado a este documento:</span>
      <div class="link-open-existing-data" @click="completeAllData()">
        Abrir datos de
        <span v-if="!partnerToComplete?.isAgency && !partnerToComplete?.isCompany">
          {{ partnerToComplete?.firstname ? partnerToComplete?.firstname : '' }}
          {{ partnerToComplete?.lastname ? partnerToComplete?.lastname : '' }}
          {{ partnerToComplete?.lastname2 ? partnerToComplete?.lastname2 : '' }}
        </span>
        <span v-else-if="partnerToComplete?.isAgency || partnerToComplete?.isCompany">
          {{ partnerToComplete?.name }}
        </span>
      </div>
    </div>
    <div class="partner-row">
      <div class="partner-col">
        <div class="partner-fields">
          <div class="partner-field">
            <div class="label">Tipo de contacto</div>
            <AppSelect
              class="input"
              size="small"
              v-model="contactType"
              optionLabel="label"
              optionValue="value"
              :options="contactTypeOptions"
            />
          </div>
          <div class="partner-field" v-if="contactType === 'person'">
            <div class="label">Tipo de documento</div>
            <AppSelect
              size="small"
              class="select"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona opción"
              v-model="documentType"
              :options="documentTypeOptions"
            />
          </div>
          <div class="partner-field">
            <div class="label" v-if="contactType === 'person'">Nº de documento</div>
            <div class="label" v-else>CIF</div>
            <InputText class="input" v-model="vat" size="small" @blur="getPartnerByVat()" />
          </div>
        </div>
        <div class="partner-fields">
          <div class="partner-field">
            <div class="label">Nombre</div>
            <InputText
              class="input"
              v-model="firstname"
              size="small"
              v-if="contactType === 'person'"
            />
            <InputText class="input" v-model="agencyName" size="small" v-else />
          </div>
          <div class="partner-field" v-if="contactType === 'person'">
            <div class="label">Primer apellido</div>
            <InputText class="input" v-model="lastname" size="small" />
          </div>
          <div class="partner-field" v-if="contactType === 'person'">
            <div class="label">Segundo apellido</div>
            <InputText class="input" v-model="lastname2" size="small" />
          </div>
        </div>
      </div>
    </div>

    <div class="tabs-wrapper">
      <Tabs v-model:value="tabSelected" scrollable>
        <TabList>
          <Tab
            value="invoicing-data-tab"
            :style="{
              paddingLeft: '0',
            }"
          >
            Facturación
          </Tab>
          <Tab value="contact-data-tab">Datos de contacto</Tab>
          <Tab value="personal-data-tab" v-if="contactType === 'person'"> Datos personales </Tab>
          <Tab value="sales-data-tab">Ventas</Tab>
          <Tab value="agency-data-tab" v-if="contactType === 'agency'">Agencia</Tab>
        </TabList>
        <TabPanels
          :style="{
            padding: '0',
          }"
        >
          <TabPanel value="invoicing-data-tab" class="tab-panel">
            <div class="tab-container">
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field invoicing-policy">
                      <div class="label">Política de facturación</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="invoicingPolicy"
                        :options="invoicingPolicyOptions"
                      />
                    </div>
                  </div>
                  <div
                    class="partner-fields"
                    v-if="invoicingPolicy && invoicingPolicy === 'checkout'"
                  >
                    <div class="partner-field invoicing-policy">
                      <div class="label">Días despues del checkout</div>
                      <InputNumber
                        class="input"
                        v-model="invoicingDaysAfterCheckout"
                        size="small"
                      />
                    </div>
                  </div>
                  <div
                    class="partner-fields"
                    v-if="invoicingPolicy && invoicingPolicy === 'month_day'"
                  >
                    <div class="partner-field invoicing-policy">
                      <div class="label">Día del mes</div>
                      <InputNumber class="input" v-model="invoicingMonthDay" size="small" />
                    </div>
                  </div>
                </div>
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Dirección</div>
                      <InputText class="input" v-model="invoicingStreet" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Código Postal</div>
                      <InputText
                        class="input"
                        v-model="invoicingZip"
                        size="small"
                        @blur="getAddressByZip()"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Población</div>
                      <InputText class="input" v-model="invoicingCity" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">País</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="invoicingCountry"
                        :options="countryNames"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Provincia</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="invoicingCountryState"
                        :options="invoicingCountryStates"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="contact-data-tab" class="tab-panel">
            <div class="toggle-wrapper">
              <ToggleSwitch size="small" v-model="useInvoicingAddress" class="toggle" />
              <span @click="useInvoicingAddress = !useInvoicingAddress">
                Usar dirección de facturación
              </span>
            </div>
            <div class="tab-container contact-data">
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Dirección</div>
                      <InputText
                        class="input"
                        v-model="residenceStreet"
                        size="small"
                        :disabled="useInvoicingAddress"
                        :class="{
                          disabled: useInvoicingAddress,
                        }"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Código Postal</div>
                      <InputText
                        class="input"
                        v-model="residenceZip"
                        size="small"
                        @blur="getAddressByZip()"
                        :disabled="useInvoicingAddress"
                        :class="{
                          disabled: useInvoicingAddress,
                        }"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Población</div>
                      <InputText
                        class="input"
                        v-model="residenceCity"
                        size="small"
                        :disabled="useInvoicingAddress"
                        :class="{
                          disabled: useInvoicingAddress,
                        }"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">País</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="residenceCountry"
                        :options="countryNames"
                        :disabled="useInvoicingAddress"
                        :class="{
                          disabled: useInvoicingAddress,
                        }"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Provincia</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="residenceCountryState"
                        :options="residenceCountryStates"
                        :disabled="useInvoicingAddress"
                        :class="{
                          disabled: useInvoicingAddress,
                        }"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="overwrite-alert-row" v-if="isOverwritingAddress">
                        <CustomIcon
                          imagePath="/app-images/icon-alert.svg"
                          width="20px"
                          height="20px"
                          class="icon"
                          color="red"
                        />
                        Se sobreescribirá la dirección de contacto
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Email</div>
                      <InputText class="input" v-model="email" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Teléfono</div>
                      <InputText class="input" v-model="phone" size="small" />
                    </div>
                    <div class="partner-field">
                      <div class="label">Móvil</div>
                      <InputText class="input" v-model="mobile" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Idioma</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="language"
                        :options="languages"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Notas internas</div>
                      <AppTextArea v-model="comment" class="input" :rows="1" size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="personal-data-tab" class="tab-panel">
            <div class="tab-container">
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Fecha de nacimiento</div>
                      <DatePicker
                        :showOtherMonths="false"
                        v-model="birthDate"
                        class="datepicker"
                        showIcon
                        inputClass="input-date-picker"
                        dateFormat="dd/mm/yy"
                        placeholder="DD/MM/YYYY"
                        size="small"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Edad</div>
                      <InputNumber class="input" v-model="age" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Género</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="gender"
                        :options="genderOptions"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Nacionalidad</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="nationality"
                        :options="countryNames"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="sales-data-tab">
            <div class="tab-container">
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Comercial</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="user"
                        :options="users"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Plazo de pago</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="paymentTerm"
                        :options="paymentTerms"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Tarifa</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="pricelist"
                        :options="pricelists"
                      />
                    </div>
                    <div class="partner-field">
                      <div class="label">Referencia</div>
                      <InputText class="input" v-model="reference" size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="agency-data-tab">
            <div class="tab-container">
              <div class="partner-row">
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field invoicing-to">
                      <div class="label">Facturar a...</div>
                      <div class="radio-button-option">
                        <RadioButton v-model="invoiceToAgency" inputId="agency" value="always" />
                        <label for="agency">Agencia</label>
                      </div>
                      <div class="radio-button-option">
                        <RadioButton v-model="invoiceToAgency" inputId="guest" value="never" />
                        <label for="guest">Cliente</label>
                      </div>
                      <div class="radio-button-option">
                        <RadioButton v-model="invoiceToAgency" inputId="manual" value="manual" />
                        <label for="manual">Elegir manualmente</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="partner-col">
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Canal de venta</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="saleChannel"
                        :options="saleChannels"
                      />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Comisión</div>
                      <InputNumber class="input" v-model="commission" size="small" />
                    </div>
                  </div>
                  <div class="partner-fields">
                    <div class="partner-field">
                      <div class="label">Tarifa específica</div>
                      <AppSelect
                        size="small"
                        class="select"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona opción"
                        v-model="pricelist"
                        :options="pricelists"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <div class="buttons-panel">
      <AppButton
        class="button save"
        label="Guardar"
        size="small"
        @click="savePartner()"
        :disabled="
          (contactType === 'person' && !(firstname && lastname)) ||
          (contactType === 'company' && !vat) ||
          (contactType === 'agency' && !agencyName)
        "
        :class="{
          disabled:
            (contactType === 'person' && !(firstname && lastname)) ||
            (contactType === 'company' && !vat) ||
            (contactType === 'agency' && !agencyName),
        }"
      />
      <AppButton class="button cancel" label="Cancelar" size="small" @click="$emit('close')" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type Ref, onMounted, watch } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';

import { useStore } from '@/legacy/store';
import { usePartner } from '@/legacy/utils/usePartner';
import { usePlanning } from '@/legacy/utils/usePlanning';

import type { CountryStatesInterface } from '@/legacy/interfaces/CountryStatesInterface';
import { dialogService } from '@/legacy/services/DialogService';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import type { PartnerInterface } from '@/legacy/interfaces/PartnerInterface';
import type { AxiosResponse } from 'axios';

export default defineComponent({
  props: {
    namePartner: {
      type: String,
    },
    resetCurrentPartner: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  components: {
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AppSelect: Select,
    InputText,
    ToggleSwitch,
    AppTextArea: Textarea,
    DatePicker,
    InputNumber,
    CustomIcon,
    AppButton: Button,
    RadioButton,
  },
  setup(props, context) {
    const { fetchPartners } = usePartner();
    const { refreshPlanning } = usePlanning();
    const store = useStore();
    // consts
    const contactTypeOptions = [
      { label: 'Particular', value: 'person' },
      { label: 'Empresa', value: 'company' },
      { label: 'Agencia', value: 'agency' },
    ];
    const documentTypeOptions = [
      { label: 'NIF / Documento Identidad', value: '02' },
      { label: 'Pasaporte', value: '03' },
      { label: 'Documento Nacional Oficial', value: '04' },
      { label: 'Certificado de Residencia', value: '05' },
      { label: 'Otro Documento', value: '06' },
    ];
    const invoicingPolicyOptions = [
      { label: 'Basada en la del hotel', value: 'property' },
      { label: 'Manual', value: 'manual' },
      { label: 'Basada en el día del checkout', value: 'checkout' },
      { label: 'Facturar día de mes concreto', value: 'month_day' },
    ];
    const genderOptions = [
      { label: 'Hombre', value: 'male' },
      { label: 'Mujer', value: 'female' },
      { label: 'Otro', value: 'other' },
    ];
    // main data
    const contactType = ref('');
    const documentType: Ref<null | string> = ref(null);
    const vat = ref('');
    const firstname = ref('');
    const lastname = ref('');
    const lastname2 = ref('');
    // invoicing data
    const invoicingStreet = ref('');
    const invoicingPolicy: Ref<null | string> = ref(null);
    const invoicingZip = ref('');
    const invoicingCity = ref('');
    const invoicingCountry: Ref<null | number> = ref(null);
    const invoicingCountryState: Ref<null | number> = ref(null);
    const invoicingCountryStates = ref([] as CountryStatesInterface[]);
    const invoicingDaysAfterCheckout = ref(0);
    const invoicingMonthDay = ref(0);
    // residence data & personal contact information data
    const useInvoicingAddress = ref(false);
    const residenceStreet = ref('');
    const residenceZip = ref('');
    const residenceCity = ref('');
    const residenceCountry: Ref<null | number> = ref(null);
    const residenceCountryState: Ref<null | number> = ref(null);
    const residenceCountryStates = ref([] as CountryStatesInterface[]);
    const email = ref('');
    const phone = ref('');
    const mobile = ref('');
    const language: Ref<null | string> = ref(null);
    const comment = ref('');
    // personal data
    const birthDate = ref();
    const age = ref(0);
    const gender: Ref<null | string> = ref(null);
    const nationality: Ref<null | number> = ref(null);
    // sales data
    const user: Ref<null | number> = ref(null);
    const paymentTerm: Ref<null | number> = ref(null);
    const pricelist: Ref<null | number> = ref(null);
    const reference = ref('');
    // agency data
    const commission = ref(0);
    const invoiceToAgency = ref('always');
    const agencyName = ref('');
    // internal
    const saleChannel: Ref<null | number> = ref(null);
    const partnerToComplete: Ref<PartnerInterface | null> = ref(null);
    const setAddressByZip = ref(false);
    const isOverwritingAddress = ref(false);
    const tabSelected = ref('invoicing-data-tab');
    const dateValue = ref(null);
    const dateOfBirthDatepicker = ref(null);
    const duplicatedContact = ref(false);
    const showCompleteAllData = ref(false);

    // computed's
    const countryStates = computed(() => store.state.countryStates.countryStates);

    const partner = computed(() => store.state.partners.currentPartner);

    const users = computed(() =>
      store.state.users.users.map((el) => ({ value: el.id, label: el.name }))
    );

    const saleChannels = computed(() =>
      store.state.saleChannels.saleChannels.map((el) => ({ value: el.id, label: el.name }))
    );

    const paymentTerms = computed(() =>
      store.state.paymentTerms.paymentTerms.map((el) => ({ value: el.id, label: el.name }))
    );

    const pricelists = computed(() =>
      store.state.pricelists.pricelists.map((el) => ({ value: el.id, label: el.name }))
    );

    const languages = computed(() =>
      store.state.languages.languages.map((el) => ({ value: el.code, label: el.name }))
    );

    const countryNames = computed(() =>
      store.state.countries.countries.map((el) => ({ value: el.id, label: el.name }))
    );

    const setInvoicingCountryId = () => {
      [invoicingCountry.value] = store.state.countries.countries
        .filter((el) => el.id === partner.value?.countryId)
        .map((el) => el.id);
    };

    const setResidenceCountryId = () => {
      [residenceCountry.value] = store.state.countries.countries
        .filter((el) => el.id === partner.value?.residenceCountryId)
        .map((el) => el.id);
    };

    const setResidenceCountryStateId = () => {
      if (store.state.countryStates.countryStates) {
        residenceCountryState.value =
          store.state.countryStates.countryStates.find(
            (el) => el.id === partner.value?.residenceStateId
          )?.id ?? null;
      }
    };

    const getPartnerByVat = async () => {
      if (vat.value && partner.value === null) {
        void store.dispatch('layout/showSpinner', true);
        try {
          const response = (await store.dispatch(
            'partners/fetchPartnerByVat',
            vat.value
          )) as AxiosResponse<PartnerInterface>;
          if (response && response.data.id) {
            partnerToComplete.value = response.data;
            showCompleteAllData.value = true;
          }
        } catch {
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

    const getAddressByZip = async () => {
      let zip = '';
      if (tabSelected.value === 'contact-data-tab') {
        zip = residenceZip.value;
      } else if (tabSelected.value === 'invoicing-data-tab') {
        zip = invoicingZip.value;
      }
      if (zip !== '') {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('address/fetchAddressByZip', zip);
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        const { address } = store.state.address;
        if (address) {
          setAddressByZip.value = true;
          if (address.countryId && tabSelected.value === 'contact-data-tab') {
            [residenceCountry.value] = store.state.countries.countries
              .filter((el) => el.id === address.countryId)
              .map((el) => el.id);
          } else if (address.countryId && tabSelected.value === 'invoicing-data-tab') {
            [invoicingCountry.value] = store.state.countries.countries
              .filter((el) => el.id === address.countryId)
              .map((el) => el.id);
          }
          if (address.cityId && tabSelected.value === 'contact-data-tab') {
            residenceCity.value = address.cityId;
          } else if (address.cityId && tabSelected.value === 'invoicing-data-tab') {
            invoicingCity.value = address.cityId;
          }
        }
      }
    };

    const completeAllData = async () => {
      if (partnerToComplete.value) {
        contactType.value = partnerToComplete.value.isAgency
          ? 'agency'
          : partnerToComplete.value.isCompany
          ? 'company'
          : 'person';
        firstname.value = partnerToComplete.value.firstname ?? '';
        lastname.value = partnerToComplete.value.lastname ?? '';
        lastname2.value = partnerToComplete.value.lastname2 ?? '';
        residenceStreet.value = partnerToComplete.value.residenceStreet ?? '';
        residenceZip.value = partnerToComplete.value.residenceZip ?? '';
        residenceCity.value = partnerToComplete.value.residenceCity ?? '';
        vat.value = partnerToComplete.value.vatNumber ?? '';
        email.value = partnerToComplete.value.email ?? '';
        phone.value = partnerToComplete.value.phone ?? '';
        mobile.value = partnerToComplete.value.mobile ?? '';
        comment.value = partnerToComplete.value.comment ?? '';
        invoiceToAgency.value = partnerToComplete.value.invoiceToAgency ?? 'always';
        invoicingStreet.value = partnerToComplete.value.street ?? '';
        invoicingZip.value = partnerToComplete.value.zip ?? '';
        invoicingCity.value = partnerToComplete.value.city ?? '';
        invoicingDaysAfterCheckout.value = partnerToComplete.value.daysAutoInvoice ?? 0;
        invoicingMonthDay.value = partnerToComplete.value.invoicingMonthDay ?? 0;
        reference.value = partnerToComplete.value.salesReference ?? '';
        commission.value = partnerToComplete.value.commission ?? 0;
        documentType.value = partnerToComplete.value.vatDocumentType ?? null;
        invoicingCountry.value = partnerToComplete.value.countryId ?? null;
        language.value = partnerToComplete.value.language;
        invoicingPolicy.value = partnerToComplete.value.invoicingPolicy ?? null;
        if (partnerToComplete.value.birthdate) {
          birthDate.value = new Date(partnerToComplete.value.birthdate);
        }
        gender.value =
          genderOptions.find((el) => el.value === partnerToComplete.value?.gender)?.value ?? null;
        nationality.value = partnerToComplete.value.nationality;
        if (partnerToComplete.value.userId) {
          user.value = partnerToComplete.value.userId;
        }
        if (partnerToComplete.value.paymentTerms) {
          paymentTerm.value = partnerToComplete.value.paymentTerms;
        }
        if (partnerToComplete.value.pricelistId) {
          pricelist.value = partnerToComplete.value.pricelistId;
        }
        if (partnerToComplete.value.isAgency || partnerToComplete.value.isCompany) {
          if (partnerToComplete.value?.firstname) {
            agencyName.value += partnerToComplete.value?.firstname;
          }
          if (partnerToComplete.value?.lastname) {
            agencyName.value += partnerToComplete.value?.lastname;
          }
          if (partnerToComplete.value?.lastname2) {
            agencyName.value += partnerToComplete.value?.lastname2;
          }
          if (partnerToComplete.value.isCompany) {
            useInvoicingAddress.value = true;
          }
        }
        if (partnerToComplete.value.saleChannelId) {
          saleChannel.value = partnerToComplete.value.saleChannelId;
        }

        await store.dispatch('partners/setCurrentPartner', partnerToComplete.value);
        partnerToComplete.value = null;
        if (duplicatedContact.value) {
          duplicatedContact.value = false;
        }
        showCompleteAllData.value = false;
      }
    };

    const savePartner = async () => {
      let isAgency = false;
      let isCompany = false;
      let lastnameVal: string | undefined = '';
      if (contactType.value === 'agency' || contactType.value === 'company') {
        lastnameVal = agencyName.value;
        if (contactType.value === 'agency') {
          isAgency = true;
        }
        if (contactType.value === 'company') {
          isCompany = true;
        }
      } else {
        lastnameVal = lastname.value;
      }
      let payload = {
        id: -1,
        firstname: firstname.value,
        lastname: lastnameVal,
        lastname2: lastname2.value,
        email: email.value,
        mobile: mobile.value,
        phone: phone.value,
        vatNumber: vat.value,
        vatDocumentType: documentType.value,
        gender: gender.value,
        birthdate: birthDate.value,
        residenceStreet: residenceStreet.value,
        residenceZip: residenceZip.value,
        residenceCity: residenceCity.value,
        nationality: nationality.value,
        residenceStateId: residenceCountryState.value,
        residenceCountryId: residenceCountry.value,
        street: invoicingStreet.value,
        zip: invoicingZip.value,
        city: invoicingCity.value,
        stateId: invoicingCountryState.value,
        countryId: invoicingCountry.value,
        isAgency,
        isCompany,
        comment: comment.value,
        language: language.value,
        userId: user.value,
        paymentTerms: paymentTerm.value,
        pricelistId: pricelist.value,
        salesReference: reference.value,
        saleChannelId: saleChannel.value,
        commission: commission.value,
        invoicingPolicy: invoicingPolicy.value,
        daysAutoInvoice: invoicingDaysAfterCheckout.value,
        invoicingMonthDay: invoicingMonthDay.value,
        invoiceToAgency: invoiceToAgency.value,
      };
      let partnerId: number;
      void store.dispatch('layout/showSpinner', true);
      try {
        if (!partner.value && partnerToComplete.value) {
          dialogService.open({
            header: 'Ya existe un contacto con este nº de documento',
            content: '¿Quieres abrir la ficha del cliente?',
            btnCancel: 'no',
            btnAccept: 'Si',
            onAccept: () => {
              completeAllData();
            },
          });
          return;
        }

        if (!partner.value) {
          const response = (await store.dispatch(
            'partners/createPartner',
            payload
          )) as AxiosResponse<number>;
          partnerId = response.data;
        } else {
          payload = { ...payload, id: partner.value.id };
          await store.dispatch('partners/updatePartner', payload);
          partnerId = partner.value.id;
        }
        await store.dispatch('partners/removePartners');
        fetchPartners({
          limit: 20,
          offset: 0,
        });
        await store.dispatch('partners/fetchCurrentPartner', partnerId);
        context.emit('partnerCreated');
        await refreshPlanning();
        context.emit('accept');
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    watch(invoicingStreet, () => {
      if (useInvoicingAddress.value) {
        residenceStreet.value = invoicingStreet.value;
      }
    });

    watch(invoicingZip, () => {
      if (useInvoicingAddress.value) {
        residenceZip.value = invoicingZip.value;
      }
    });

    watch(invoicingCity, () => {
      if (useInvoicingAddress.value) {
        residenceCity.value = invoicingCity.value;
      }
    });

    watch(invoicingCountryState, () => {
      if (useInvoicingAddress.value) {
        residenceCountryState.value = invoicingCountryState.value;
      }
    });

    watch(residenceCountry, async () => {
      if (residenceCountry.value) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('countryStates/fetchCountryStates', residenceCountry.value);
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        if (store.state.countryStates.countryStates) {
          if (useInvoicingAddress.value && !setAddressByZip.value) {
            residenceCountryStates.value = store.state.countryStates.countryStates.map((el) => ({
              value: el.id,
              label: el.name,
            })) as unknown as CountryStatesInterface[];
            const countryState = store.state.countryStates.countryStates.find(
              (el) => el.id === invoicingCountryState.value
            );
            if (countryState) {
              residenceCountryState.value = countryState.id;
            } else {
              residenceCountryState.value = null;
            }
          } else if (!useInvoicingAddress.value && !setAddressByZip.value) {
            residenceCountryStates.value = store.state.countryStates.countryStates.map((el) => ({
              value: el.id,
              label: el.name,
            })) as unknown as CountryStatesInterface[];
            const countryState = store.state.countryStates.countryStates.find(
              (el) => el.id === partner.value?.residenceStateId
            );
            if (countryState) {
              residenceCountryState.value = countryState.id;
            } else {
              residenceCountryState.value = null;
            }
          } else if (setAddressByZip.value) {
            residenceCountryStates.value = store.state.countryStates.countryStates?.map((el) => ({
              value: el.id,
              label: el.name,
            })) as unknown as CountryStatesInterface[];
            const countryState = store.state.countryStates.countryStates?.find(
              (el) => el.id === store.state.address.address?.stateId
            );
            if (countryState) {
              residenceCountryState.value = countryState.id;
            }
            setAddressByZip.value = false;
          }
          void store.dispatch('address/removeAddress');
        }
      }
    });

    watch(invoicingCountry, async () => {
      invoicingCountryState.value = null;
      if (invoicingCountry.value) {
        await store.dispatch('countryStates/fetchCountryStates', invoicingCountry.value);
        if (store.state.countryStates.countryStates && !setAddressByZip.value) {
          invoicingCountryStates.value = store.state.countryStates.countryStates.map((el) => ({
            value: el.id,
            label: el.name,
          })) as unknown as CountryStatesInterface[];
          const partnerState = partner.value?.stateId
            ? partner.value.stateId
            : partnerToComplete.value?.stateId;
          const countryState = store.state.countryStates.countryStates.find(
            (el) => el.id === partnerState
          );
          if (countryState) {
            invoicingCountryState.value = countryState.id;
          }
        } else if (store.state.countryStates.countryStates && setAddressByZip.value) {
          invoicingCountryStates.value = store.state.countryStates.countryStates?.map((el) => ({
            value: el.id,
            label: el.name,
          })) as unknown as CountryStatesInterface[];
          const countryState = store.state.countryStates.countryStates?.find(
            (el) => el.id === store.state.address.address?.stateId
          );
          if (countryState) {
            invoicingCountryState.value = countryState.id;
          }
          void store.dispatch('address/removeAddress');
        }
        if (useInvoicingAddress.value) {
          residenceCountry.value = invoicingCountry.value;
        }
      }
    });

    watch(birthDate, () => {
      const today = new Date();
      if (birthDate.value) {
        let newAge = today.getFullYear() - birthDate.value.getFullYear();
        const month = today.getMonth() - birthDate.value.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.value.getDate())) {
          newAge -= 1;
        }
        age.value = newAge;
      } else {
        age.value = 0;
      }
    });

    watch(useInvoicingAddress, () => {
      if (useInvoicingAddress.value) {
        if (
          (residenceStreet.value && invoicingStreet.value !== residenceStreet.value) ||
          (residenceZip.value && invoicingZip.value !== residenceZip.value) ||
          (residenceCity.value && invoicingCity.value !== residenceCity.value) ||
          (residenceCountry.value && invoicingCountry.value !== residenceCountry.value) ||
          (residenceCountryState.value &&
            invoicingCountryState.value !== residenceCountryState.value)
        ) {
          isOverwritingAddress.value = true;
        } else {
          isOverwritingAddress.value = false;
        }
        residenceStreet.value = invoicingStreet.value;
        residenceZip.value = invoicingZip.value;
        residenceCity.value = invoicingCity.value;
        residenceCountry.value = invoicingCountry.value;
        residenceCountryState.value = invoicingCountryState.value;
      } else {
        residenceStreet.value = partner.value?.residenceStreet ? partner.value.residenceStreet : '';
        residenceZip.value = partner.value?.residenceZip ? partner.value?.residenceZip : '';
        residenceCity.value = partner.value?.residenceCity ? partner.value?.residenceCity : '';
        if (partner.value?.countryId) {
          setResidenceCountryId();
        } else {
          residenceCountry.value = null;
        }
        if (partner.value?.stateId) {
          setResidenceCountryStateId();
        } else {
          residenceCountryState.value = null;
        }
        isOverwritingAddress.value = false;
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('paymentTerms/fetchPaymentTerms'),
          store.dispatch('categories/fetchCategories'),
          store.dispatch('languages/fetchLanguages'),
          store.dispatch(
            'saleChannels/fetchSaleChannels',
            store.state.properties.activeProperty?.id
          ),
          store.dispatch('pricelists/fetchPricelists', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
          }),
          store.dispatch('users/fetchUsers', store.state.properties.activeProperty?.id),
        ]);
        await store.dispatch('countries/fetchCountries');
        if (props.resetCurrentPartner) {
          await store.dispatch('partners/removePartner');
          partnerToComplete.value = null;
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
      if (partner.value) {
        if (partner.value.firstname) {
          firstname.value = partner.value.firstname;
        }
        if (partner.value.lastname) {
          lastname.value = partner.value.lastname;
        }
        if (partner.value.lastname2) {
          lastname2.value = partner.value.lastname2;
        }

        if (partner.value.residenceStreet) {
          residenceStreet.value = partner.value.residenceStreet;
        }
        if (partner.value.residenceZip) {
          residenceZip.value = partner.value.residenceZip;
        }
        if (partner.value.residenceCity) {
          residenceCity.value = partner.value.residenceCity;
        }
        if (partner.value.residenceCountryId) {
          setResidenceCountryId();
        }
        if (partner.value.residenceStateId) {
          setResidenceCountryStateId();
        }

        if (partner.value.street) {
          invoicingStreet.value = partner.value.street;
        }
        if (partner.value.zip) {
          invoicingZip.value = partner.value.zip;
        }
        if (partner.value.city) {
          invoicingCity.value = partner.value.city;
        }
        if (partner.value.vatNumber) {
          vat.value = partner.value.vatNumber;
        }
        if (partner.value.email) {
          email.value = partner.value.email;
        }
        if (partner.value.phone) {
          phone.value = partner.value.phone;
        }
        if (partner.value.mobile) {
          mobile.value = partner.value.mobile;
        }
        if (partner.value.birthdate) {
          birthDate.value = new Date(partner.value.birthdate);
        }
        if (partner.value.age) {
          age.value = partner.value.age;
        }
        if (partner.value.countryId) {
          setInvoicingCountryId();
        }

        if (partner.value.nationality) {
          nationality.value = partner.value.nationality;
        }
        if (partner.value.vatDocumentType) {
          if (partner.value.vatDocumentType !== '02') {
            [documentType.value] = documentTypeOptions
              .filter((el) => el.value === partner.value?.vatDocumentType)
              .map((el) => el.value);
          } else {
            const countryName = store.state.countries.countries.find(
              (el) => el.id === partner.value?.nationality
            )?.name;
            if (countryName === 'Spain' || countryName === 'España') {
              documentType.value = '02';
            } else {
              documentType.value = '04';
            }
          }
        }
        if (partner.value.gender) {
          const genderName = genderOptions.find((el) => el.value === partner.value?.gender)?.label;
          if (genderName) {
            gender.value = partner.value?.gender;
          }
        }
        if (partner.value.language) {
          language.value = partner.value.language;
        }
        if (partner.value.saleChannelId) {
          saleChannel.value = partner.value.saleChannelId;
        }
        if (partner.value.userId) {
          user.value = partner.value.userId;
        }
        if (partner.value.pricelistId) {
          pricelist.value = partner.value.pricelistId;
        }
        if (partner.value.paymentTerms) {
          paymentTerm.value = partner.value.paymentTerms;
        }
        if (partner.value.invoicingPolicy) {
          invoicingPolicyOptions.forEach((el) => {
            if (el.value === partner.value?.invoicingPolicy) {
              invoicingPolicy.value = el.value;
            }
          });
        }
      } else if (props.namePartner) {
        const partnerName = props.namePartner.split(' ');
        const first = partnerName[0];
        firstname.value = first;
        if (partnerName.length === 2) {
          const second = partnerName[1];
          lastname.value = second;
        }
        if (partnerName.length === 3) {
          const second = partnerName[1];
          lastname.value = second;
          const third = partnerName[2];
          lastname.value = second;
          lastname2.value = third;
        }
      }

      contactType.value = partner.value?.isAgency
        ? 'agency'
        : partner.value?.isCompany
        ? 'company'
        : 'person';

      comment.value = partner.value?.comment ? partner.value?.comment : '';
      useInvoicingAddress.value =
        residenceStreet.value === invoicingStreet.value &&
        residenceZip.value === invoicingZip.value &&
        residenceCity.value === invoicingCity.value &&
        residenceCountry.value === invoicingCountry.value &&
        residenceCountryState.value === invoicingCountryState.value;
      reference.value = partner.value?.salesReference ? partner.value.salesReference : '';
      commission.value = partner.value?.commission ? partner.value.commission : 0;
      invoiceToAgency.value = partner.value?.invoiceToAgency
        ? partner.value.invoiceToAgency
        : 'always';
      invoicingDaysAfterCheckout.value = partner.value?.daysAutoInvoice
        ? partner.value.daysAutoInvoice
        : 0;
      invoicingMonthDay.value = partner.value?.invoicingMonthDay
        ? partner.value.invoicingMonthDay
        : 0;

      if (partner.value?.firstname) {
        agencyName.value += partner.value.firstname;
      }
      if (partner.value?.lastname) {
        agencyName.value += partner.value.lastname;
      }
      if (partner.value?.lastname2) {
        agencyName.value += partner.value.lastname2;
      }
    });

    return {
      contactTypeOptions,
      documentTypeOptions,
      invoicingPolicyOptions,
      genderOptions,
      contactType,
      documentType,
      vat,
      firstname,
      lastname,
      lastname2,
      invoicingStreet,
      invoicingPolicy,
      invoicingZip,
      invoicingCity,
      invoicingCountry,
      invoicingCountryState,
      invoicingCountryStates,
      invoicingDaysAfterCheckout,
      invoicingMonthDay,
      useInvoicingAddress,
      residenceStreet,
      residenceZip,
      residenceCity,
      residenceCountry,
      residenceCountryState,
      residenceCountryStates,
      isOverwritingAddress,
      email,
      phone,
      mobile,
      language,
      comment,
      birthDate,
      age,
      gender,
      nationality,
      user,
      paymentTerm,
      pricelist,
      reference,
      commission,
      saleChannel,
      invoiceToAgency,
      agencyName,
      tabSelected,
      setAddressByZip,
      countryStates,
      countryNames,
      languages,
      users,
      partnerToComplete,
      paymentTerms,
      pricelists,
      dateValue,
      duplicatedContact,
      showCompleteAllData,
      dateOfBirthDatepicker,
      saleChannels,
      getPartnerByVat,
      getAddressByZip,
      completeAllData,
      savePartner,
    };
  },
});
</script>

<style scoped lang="scss">
.main-content {
  height: 100%;
  height: auto;
  .existing-partner {
    display: flex;
    flex-direction: column;
    .link-open-existing-data {
      cursor: pointer;
      color: $primary;
      font-weight: bold;
    }
  }
  .toggle-wrapper {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    span {
      cursor: pointer;
      margin-left: 0.5rem;
    }
  }
  .partner-row {
    display: flex;
    flex-direction: column;
    flex: 1;
    .partner-col {
      .partner-fields {
        display: flex;
        flex-direction: column;
        .partner-field {
          margin-top: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          .label {
            user-select: none;
            font-weight: bold;
          }
          .input,
          select {
            width: 100%;
            &.disabled {
              cursor: not-allowed;
            }
          }
          .radio-button-option {
            margin-top: 0.5rem;
            label {
              margin-left: 0.5rem;
            }
          }
          .overwrite-alert-row {
            color: red;
            font-size: 1rem;
            display: flex;
            align-items: center;
            .icon {
              margin-right: 1rem;
            }
          }
        }
      }
    }
  }
  .buttons-panel {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    .button {
      margin-bottom: 1rem;
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    width: 800px;
    .existing-partner {
      flex-direction: row;
      justify-content: space-between;
    }

    .partner-row {
      flex-direction: row-reverse;
      justify-content: space-between;
      .partner-col {
        &:last-child {
          flex: 1;
        }
        .partner-fields {
          flex-direction: row;
          .invoicing-policy,
          .invoicing-to {
            margin-left: 0.5rem;
          }
          .partner-field {
            margin-right: 0.5rem;
            &:last-child {
              margin-right: 0;
            }
            .overwrite-alert-row {
              margin-top: 21px;
            }
          }
        }
      }
    }
    .tab-container {
      width: 100%;
      min-height: 344px;
      &.contact-data {
        min-height: 288px;
        display: flex;
        .partner-row:nth-child(2) {
          margin-left: 0.5rem;
        }
      }
    }
    .buttons-panel {
      flex-direction: row;
      justify-content: flex-end;
      .button {
        margin-bottom: 0;
        margin-left: 1rem;
        &.cancel {
          background-color: white;
          border: 1px solid $primary;
          color: $primary;
        }
      }
    }
  }
}
</style>
