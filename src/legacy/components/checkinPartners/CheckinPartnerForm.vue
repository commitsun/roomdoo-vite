<template>
  <div class="checkin-partner-form-content" v-if="editingCheckinPartner">
    <div class="form-row">
      <div class="item">
        <span>
          País del documento
          <span class="asterisk" v-if="!isUnderFourteen"> * </span>
        </span>
        <AutocompleteComponent
          class="input"
          id="doc-country-checkin-partner"
          v-model="editingCheckinPartner.documentCountryId"
          :items="
            countries.map((el) => ({
              value: el.id,
              name: el.name,
              image: `/country-flags/${el.code.toLowerCase()}.svg`,
            }))
          "
          :minChars="0"
          :showAddNewOption="false"
          :maxHeight="250"
          :emptyResultsAfterClick="false"
          keepResultAfterChoose
          iconExpandCollapse
          icon="2"
          isRoundedIcons
          :isError="validatorCheckin.editingCheckinPartner.documentCountryId.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.documentCountryId.$error">
            {{ validatorCheckin.editingCheckinPartner.documentCountryId.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item">
        <span>
          Tipo de documento
          <span class="asterisk" v-if="!isUnderFourteen"> * </span>
        </span>
        <CustomSelect
          class="input"
          v-model="editingCheckinPartner.documentType"
          :options="
            documentTypes
              .filter(
                (dt) =>
                  dt.countryIds.length === 0 ||
                  dt.countryIds.includes(editingCheckinPartner?.documentCountryId ?? 0)
              )
              .map((dt) => ({
                id: dt.id,
                text: dt.documentType,
              }))
          "
          :optionsMarginTop="2"
          focusable
          :isError="validatorCheckin.editingCheckinPartner.documentType.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.documentType.$error">
            {{ validatorCheckin.editingCheckinPartner.documentType.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-2">
        <span>
          Nº documento
          <span class="asterisk" v-if="!isUnderFourteen"> * </span>
        </span>
        <InputText
          isUpperCase
          v-model="editingCheckinPartner.documentNumber"
          class="input document-number-input"
          @input="
            validatorCheckin.editingCheckinPartner.documentNumber.$reset();
            validatorCheckin.editingCheckinPartner.documentNumber.$reset();
          "
          :isError="
            validatorCheckin.editingCheckinPartner.documentNumber.$error ||
            validatorCheckin.editingCheckinPartner.documentNumber.$error
          "
          @blur="fetchCheckinPartnerByDocNumber()"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.documentNumber.$error">
            {{ validatorCheckin.editingCheckinPartner.documentNumber.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="item item-3">
        <span>
          Fecha de expedición
          <span class="asterisk" v-if="!isUnderFourteen"> * </span>
        </span>
        <InputDate
          class="input"
          :includeCalendar="true"
          v-model="editingCheckinPartner.documentExpeditionDate"
          @badFormatting="badFormattingDocumentExpeditionDate = $event"
          @input="
            validatorCheckin.editingCheckinPartner.documentExpeditionDate.$reset();
            validatorCheckin.editingCheckinPartner.documentExpeditionDate.$reset();
          "
          :isError="
            badFormattingDocumentExpeditionDate ||
            validatorCheckin.editingCheckinPartner.documentExpeditionDate.$error ||
            validatorCheckin.editingCheckinPartner.documentExpeditionDate.$error
          "
        />
        <div class="error-message">
          <span v-if="badFormattingDocumentExpeditionDate"> Formato de fecha no válido </span>
          <span v-else-if="validatorCheckin.editingCheckinPartner.documentExpeditionDate.$error">
            {{ validatorCheckin.editingCheckinPartner.documentExpeditionDate.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-4">
        <span>
          Número de soporte
          <span
            class="asterisk"
            v-if="
              editingCheckinPartner.documentType === DOCUMENT_TYPE_DNI ||
              editingCheckinPartner.documentType === DOCUMENT_TYPE_NIE
            "
          >
            *
          </span>
        </span>
        <InputText
          class="input"
          isUpperCase
          :disabled="
            editingCheckinPartner.documentType === DOCUMENT_TYPE_DNI &&
            editingCheckinPartner.documentType === DOCUMENT_TYPE_NIE
          "
          v-model="editingCheckinPartner.documentSupportNumber"
          @input="
            validatorCheckin.editingCheckinPartner.documentSupportNumber.$reset();
            validatorCheckin.editingCheckinPartner.documentSupportNumber.$reset();
          "
          :isError="
            validatorCheckin.editingCheckinPartner.documentSupportNumber.$error ||
            validatorCheckin.editingCheckinPartner.documentSupportNumber.$error
          "
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.documentSupportNumber.$error">
            {{ validatorCheckin.editingCheckinPartner.documentSupportNumber.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <br />
    <div class="form-row">
      <div class="item item-5">
        <span>
          Nombre
          <span class="asterisk">*</span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.firstname"
          :isError="validatorCheckin.editingCheckinPartner.firstname.$error"
          @input="validatorCheckin.editingCheckinPartner.firstname.$reset()"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.firstname.$error">
            {{ validatorCheckin.editingCheckinPartner.firstname.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-6">
        <span>
          Primer apellido
          <span class="asterisk">*</span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.lastname"
          @input="validatorCheckin.editingCheckinPartner.lastname.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.lastname.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.lastname.$error">
            {{ validatorCheckin.editingCheckinPartner.lastname.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-7">
        <span>
          Segundo apellido
          <span class="asterisk" v-if="editingCheckinPartner.documentType === DOCUMENT_TYPE_DNI">
            *
          </span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.lastname2"
          @input="validatorCheckin.editingCheckinPartner.lastname2.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.lastname2.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.lastname2.$error">
            {{ validatorCheckin.editingCheckinPartner.lastname2.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="item item-9">
        <span>
          Fecha de nacimiento
          <span class="asterisk">*</span>
        </span>
        <InputDate
          class="input"
          :includeCalendar="true"
          v-model="editingCheckinPartner.birthdate"
          @badFormatting="badFormattingBirthdate = $event"
          @input="
            validatorCheckin.editingCheckinPartner.birthdate.$reset();
            validatorCheckin.editingCheckinPartner.birthdate.$reset();
          "
          :isError="
            badFormattingBirthdate ||
            validatorCheckin.editingCheckinPartner.birthdate.$error ||
            validatorCheckin.editingCheckinPartner.birthdate.$error
          "
        />
        <div class="error-message">
          <span v-if="badFormattingBirthdate"> Formato de fecha no válido </span>
          <span v-else-if="validatorCheckin.editingCheckinPartner.birthdate.$error">
            {{ validatorCheckin.editingCheckinPartner.birthdate.$errors[0].$message }}
          </span>
        </div>
      </div>

      <div class="item item-10">
        <span>
          Nacionalidad
          <span class="asterisk">*</span>
        </span>
        <AutocompleteComponent
          class="input"
          id="nationality-checkin-partner-autocomplete"
          v-model="editingCheckinPartner.nationality"
          :items="
            countries.map((el) => ({
              value: el.id,
              name: el.name,
              image: `/country-flags/${el.code.toLowerCase()}.svg`,
            }))
          "
          :minChars="0"
          :showAddNewOption="false"
          :maxHeight="250"
          :emptyResultsAfterClick="false"
          keepResultAfterChoose
          iconExpandCollapse
          icon="2"
          isRoundedIcons
          :isError="validatorCheckin.editingCheckinPartner.nationality.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.nationality.$error">
            {{ validatorCheckin.editingCheckinPartner.nationality.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-8">
        <span>
          Género
          <span class="asterisk">*</span>
        </span>
        <CustomSelect
          class="input"
          v-model="editingCheckinPartner.gender"
          :options="[
            {
              id: 'male',
              text: 'Hombre',
            },
            {
              id: 'female',
              text: 'Mujer',
            },
            {
              id: 'other',
              text: 'Otro',
            },
          ]"
          :optionsMarginTop="2"
          focusable
          :isError="validatorCheckin.editingCheckinPartner.gender.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.gender.$error">
            {{ validatorCheckin.editingCheckinPartner.gender.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="item" v-if="isUnderAge">
        <span>
          Adulto responsable
          <span class="asterisk">*</span>
        </span>
        <AutocompleteComponent
          class="input"
          v-model="editingCheckinPartner.responsibleCheckinPartnerId"
          :items="adultsInFolio"
          focusable
          iconExpandCollapse
          keepResultAfterChoose
          :showAddNewOption="false"
          :emptyResultsAfterClick="false"
          :minChars="0"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.responsibleCheckinPartnerId.$error">
            {{
              validatorCheckin.editingCheckinPartner.responsibleCheckinPartnerId.$errors[0].$message
            }}
          </span>
        </div>
      </div>
      <div class="item" v-if="isUnderAge">
        <span>
          Relación de parentesco
          <span class="asterisk">*</span>
        </span>
        <CustomSelect
          class="input"
          v-if="editingCheckinPartner.relationship == '' || editingCheckinPartner.relationship"
          v-model="editingCheckinPartner.relationship"
          :options="optionsRelationship.map((item) => ({ id: item.code, text: item.text }))"
          focusable
          iconExpandCollapse
          keepResultAfterChoose
          :maxHeight="200"
          :showAddNewOption="false"
          :emptyResultsAfterClick="false"
          :minChars="0"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.relationship.$error">
            {{ validatorCheckin.editingCheckinPartner.relationship.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="item item-11">
        <span> Email </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.email"
          @input="validatorCheckin.editingCheckinPartner.email.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.email.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.email.$error">
            {{ validatorCheckin.editingCheckinPartner.email.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-12">
        <span> Teléfono </span>
        <InputText class="input" v-model="editingCheckinPartner.mobile" />
        <div class="error-message"></div>
      </div>
    </div>
    <br />
    <div class="form-row">
      <div class="item item-13 residence-street">
        <span>
          Calle
          <span class="asterisk">*</span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.residenceStreet"
          @input="validatorCheckin.editingCheckinPartner.residenceStreet.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.residenceStreet.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.residenceStreet.$error">
            {{ validatorCheckin.editingCheckinPartner.residenceStreet.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-14 residence-zip">
        <span>
          Código postal
          <span class="asterisk">*</span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.zip"
          @input="validatorCheckin.editingCheckinPartner.zip.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.zip.$error"
          @blur="fetchAddressByZip()"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.zip.$error">
            {{ validatorCheckin.editingCheckinPartner.zip.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="item item-16">
        <span>
          País
          <span class="asterisk">*</span>
        </span>
        <AutocompleteComponent
          class="input"
          id="nationality-checkin-partner-autocomplete"
          v-model="editingCheckinPartner.countryId"
          :items="
            countries.map((el) => ({
              value: el.id,
              name: el.name,
              image: `/country-flags/${el.code.toLowerCase()}.svg`,
            }))
          "
          :minChars="0"
          :showAddNewOption="false"
          :maxHeight="300"
          :emptyResultsAfterClick="false"
          keepResultAfterChoose
          iconExpandCollapse
          :orientation="'up'"
          isRoundedIcons
          :isError="validatorCheckin.editingCheckinPartner.countryId.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.countryId.$error">
            {{ validatorCheckin.editingCheckinPartner.countryId.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-17" v-if="residenceStates.length > 0">
        <span>
          Provincia o Estado
          <span class="asterisk">*</span>
        </span>
        <AutocompleteComponent
          class="input"
          id="state-checkin-partner-autocomplete"
          v-model="editingCheckinPartner.countryState"
          :items="
            residenceStates.map((el) => ({
              value: el.id,
              name: el.name,
            }))
          "
          :minChars="0"
          :showAddNewOption="false"
          :maxHeight="300"
          :emptyResultsAfterClick="false"
          keepResultAfterChoose
          iconExpandCollapse
          :orientation="'up'"
          :isError="validatorCheckin.editingCheckinPartner.countryState.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.countryState.$error">
            {{ validatorCheckin.editingCheckinPartner.countryState.$errors[0].$message }}
          </span>
        </div>
      </div>
      <div class="item item-15">
        <span>
          Población
          <span class="asterisk">*</span>
        </span>
        <InputText
          class="input"
          v-model="editingCheckinPartner.residenceCity"
          @input="validatorCheckin.editingCheckinPartner.residenceCity.$reset()"
          :isError="validatorCheckin.editingCheckinPartner.residenceCity.$error"
        />
        <div class="error-message">
          <span v-if="validatorCheckin.editingCheckinPartner.residenceCity.$error">
            {{ validatorCheckin.editingCheckinPartner.residenceCity.$errors[0].$message }}
          </span>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="left">
        <CustomButton
          class="button"
          text="Eliminar datos"
          backgroundColor="white"
          textColor="primary"
          borderColor="primary"
          v-if="
            editingCheckinPartner.checkinPartnerState !== 'onboard' &&
            editingCheckinPartner.checkinPartnerState !== 'done'
          "
          @click="clearCheckinPartner()"
        >
          <template #icon>
            <CustomIcon
              imagePath="/app-images/icon-delete.svg"
              color="primary"
              width="20px"
              height="20px"
            />
          </template>
        </CustomButton>
        <CustomButton
          class="button"
          text="Imprimir"
          backgroundColor="white"
          textColor="primary"
          borderColor="primary"
          v-if="
            checkinMandatoryDataComplete(
              editingCheckinPartner,
              editingCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
              editingCheckinPartner.documentType === DOCUMENT_TYPE_NIE,

              editingCheckinPartner.countryId === COUNTRY_ID_SPAIN
            ) && validatorCheckin.$error === false
          "
          @click="validateAndPrintCheckin()"
        >
          <template #icon>
            <CustomIcon
              imagePath="/app-images/icon-print.svg"
              color="primary"
              width="20px"
              height="20px"
            />
          </template>
        </CustomButton>
      </div>
      <div class="right">
        <CustomButton
          class="button"
          text="Guardar"
          backgroundColor="primary"
          textColor="white"
          @click="validateAndSaveCheckinPartner()"
        >
          <template #icon>
            <CustomIcon
              imagePath="/app-images/icon-save.svg"
              color="white"
              width="20px"
              height="20px"
            />
          </template>
        </CustomButton>
        <CustomButton
          class="button"
          text="Marcar llegada"
          backgroundColor="primary"
          textColor="white"
          v-if="isCheckinAllowed && !isPublicCheckinFlow"
          @click="validateAndDoCheckin()"
        >
          <template #icon>
            <CustomIcon
              imagePath="/app-images/icon-checkin.svg"
              color="white"
              width="17px"
              height="17px"
            />
          </template>
        </CustomButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Ref, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { required, email, helpers, requiredIf, minValue } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import CustomSelect from '@/legacy/components/roomdooComponents/CustomSelect.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import InputDate from '@/legacy/components/roomdooComponents/InputDate.vue';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomButton from '@/legacy/components/roomdooComponents/CustomButton.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { useStore } from '@/legacy/store';
import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import utilsDates from '@/legacy/utils/dates';
import { dialogService } from '@/legacy/services/DialogService';

export default defineComponent({
  components: {
    CustomSelect,
    InputText,
    InputDate,
    AutocompleteComponent,
    CustomButton,
    CustomIcon,
  },
  props: {
    checkinPartner: {
      type: Object as () => CheckinPartnerInterface,
      required: true,
    },
    isPublicCheckinFlow: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const {
      validateDocumentNumber,
      validateSupportNumber,
      checkinMandatoryDataComplete,
      printCheckin,
      saveCheckinPartner,
      doCheckin,
    } = useCheckinPartner();
    const { yearsFrom } = utilsDates;

    const store = useStore();

    const optionsRelationship = [
      { id: 1, code: 'PM', text: 'Padre o madre' },
      { id: 2, code: 'TU', text: 'Tutor/a' },
      { id: 3, code: 'TI', text: 'Tío/a' },
      { id: 4, code: 'HR', text: 'Hermano/a' },
      { id: 5, code: 'AB', text: 'Abuelo/a' },
      { id: 6, code: 'BA', text: 'Bisabuelo/a' },
      { id: 7, code: 'CD', text: 'Cuñado/a' },
      { id: 8, code: 'CY', text: 'Cónyuge' },
      { id: 9, code: 'SB', text: 'Sobrino/a' },
      { id: 10, code: 'SG', text: 'Suegro/a' },
      { id: 11, code: 'YN', text: 'Yerno o nuera' },
      { id: 12, code: 'OT', text: 'Otro' },
    ];

    const selectedRelationShip = ref(0);

    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (dt) => dt.code === 'D'
    )?.id;

    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (dt) => dt.code === 'N'
    )?.id;

    const COUNTRY_ID_SPAIN = store.state.countries.countries.find((c) => c.code === 'ES')?.id;

    const isLoadingData = ref(false);
    const badFormattingDocumentExpeditionDate = ref(false);
    const badFormattingBirthdate = ref(false);
    const countries = computed(() => store.state.countries.countries);
    const residenceStates = computed(() => store.state.countryStates.countryStates);
    const documentTypes = computed(() => store.state.documentType.documentType);
    const editingCheckinPartner: Ref<CheckinPartnerInterface | null> = ref(null);

    const adultsInFolio = computed(() =>
      store.state.folios.adultsInFolio.map((el) => ({
        value: el.id ?? 0,
        name: el.name ?? '',
      }))
    );

    const validDocumentNumber = (documentNumber: string) => {
      let rdo = true;
      if (editingCheckinPartner.value?.documentType) {
        const documentTypeCode = documentTypes.value.find(
          (dt) => dt.id === editingCheckinPartner.value?.documentType
        )?.code;
        if (documentTypeCode && documentNumber && documentNumber.length > 0) {
          rdo = validateDocumentNumber(documentTypeCode, documentNumber);
        }
      }
      return rdo;
    };

    const validateEditingCheckinPartnerSupportNumber = () => {
      let rdo = true;
      if (
        editingCheckinPartner.value &&
        editingCheckinPartner.value.documentType &&
        editingCheckinPartner.value.documentSupportNumber &&
        editingCheckinPartner.value.documentSupportNumber.length > 0 &&
        editingCheckinPartner.value?.documentType === DOCUMENT_TYPE_DNI
      ) {
        rdo = validateSupportNumber(editingCheckinPartner.value?.documentSupportNumber);
      }
      return rdo;
    };

    const validateState = () => {
      let rdo = true;
      if (editingCheckinPartner.value?.countryId === COUNTRY_ID_SPAIN) {
        rdo = editingCheckinPartner.value?.countryState !== 0;
      }
      return rdo;
    };

    const isDuplicateCheckinPartner = (documentNumber: string) => {
      let result = true;
      const item = store.state.checkinPartners.checkinpartners.find(
        (el) =>
          el.documentNumber === documentNumber &&
          el.documentType === editingCheckinPartner.value?.documentType &&
          el.id !== editingCheckinPartner.value?.id &&
          documentNumber !== '' &&
          editingCheckinPartner.value?.documentType !== 0
      );
      if (item) {
        result = false;
      }
      return result;
    };

    const isUnderAge = computed(() => {
      let result = false;
      if (editingCheckinPartner.value?.birthdate) {
        if (yearsFrom(editingCheckinPartner.value?.birthdate) < 18) {
          result = true;
        }
      }
      return result;
    });

    const isUnderFourteen = computed(() => {
      let result = false;
      if (editingCheckinPartner.value?.birthdate) {
        if (yearsFrom(editingCheckinPartner.value?.birthdate) < 14) {
          result = true;
        }
      }
      return result;
    });

    const isCheckinAllowed = computed(() => {
      let checkinDate;
      if (!props.isPublicCheckinFlow) {
        checkinDate = store.state.reservations.currentReservation?.checkin;
      } else {
        checkinDate = store.state.precheckin.folioPublicInfo?.reservations[0].checkin;
      }
      let result = false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result =
        today.getTime() >= (checkinDate as Date).getTime() &&
        editingCheckinPartner.value?.checkinPartnerState !== 'onboard' &&
        editingCheckinPartner.value?.checkinPartnerState !== 'done';
      return result;
    });

    const validationCheckinRules = computed(() => ({
      editingCheckinPartner: {
        documentType: {
          required: helpers.withMessage('El tipo de documento es obligatorio', (value: number) => {
            if (!isUnderFourteen.value) {
              return value > 0;
            }
            return true;
          }),
        },
        documentNumber: {
          required: helpers.withMessage(
            'El nº de documento es obligatorio',
            requiredIf(!isUnderFourteen.value)
          ),
          validDocumentNumber: helpers.withMessage(
            'Nº de documento no válido',
            validDocumentNumber
          ),
          isDuplicateCheckinPartner: helpers.withMessage(
            'Este huésped ya existe en la reserva',
            isDuplicateCheckinPartner
          ),
        },
        documentExpeditionDate: {
          required: helpers.withMessage(
            'La fecha de expedición es obligatoria',
            requiredIf(!isUnderFourteen.value)
          ),
          maxValue: helpers.withMessage(
            'La fecha de expedición deber ser menor o igual a hoy.',
            (value: Date | undefined) => {
              if (value) {
                return value.getTime() < new Date().getTime();
              }
              return true;
            }
          ),
        },
        documentSupportNumber: {
          required: helpers.withMessage(
            'El número de soporte es obligatorio',
            requiredIf(
              editingCheckinPartner.value?.documentType === DOCUMENT_TYPE_DNI ||
                editingCheckinPartner.value?.documentType === DOCUMENT_TYPE_NIE
            )
          ),
          validSupportNumber: helpers.withMessage(
            'El número de soporte no es válido',
            validateEditingCheckinPartnerSupportNumber
          ),
        },
        firstname: {
          required: helpers.withMessage('El nombre es obligatorio', required),
        },
        lastname: {
          required: helpers.withMessage('El apellido es obligatorio', required),
        },
        lastname2: {
          required: helpers.withMessage(
            'El 2º apellido es obligatorio',
            requiredIf(editingCheckinPartner.value?.documentType === DOCUMENT_TYPE_DNI)
          ),
        },
        gender: {
          required: helpers.withMessage('El género es obligatorio', required),
        },
        birthdate: {
          required: helpers.withMessage('La fecha de nacimiento es obligatoria', required),
          minValue: helpers.withMessage(
            'La fecha de nacimiento no válida.',
            (value: Date | undefined) => {
              if (value) {
                const dateToTest = new Date();
                dateToTest.setHours(0, 0, 0, 0);
                dateToTest.setFullYear(dateToTest.getFullYear() - 120);
                return value.getTime() > dateToTest.getTime();
              }
              return true;
            }
          ),
          maxValue: helpers.withMessage(
            'La fecha de nacimiento no válida.',
            (value: Date | undefined) => {
              if (value) {
                return value.getTime() < new Date().getTime();
              }
              return true;
            }
          ),
        },
        responsibleCheckinPartnerId: {
          required: helpers.withMessage('El adulto responsable es obligatorio', (value: number) => {
            if (isUnderAge.value) {
              return value > 0;
            }
            return true;
          }),
        },
        relationship: {
          required: helpers.withMessage(
            'La relación de parentesco es obligatoria',
            requiredIf(isUnderAge.value)
          ),
        },
        nationality: {
          required: helpers.withMessage('La nacionalidad es obligatoria', minValue(1)),
        },
        residenceStreet: {
          required: helpers.withMessage('La calle es obligatoria', required),
        },
        zip: {
          required: helpers.withMessage('El código postal es obligatorio', required),
        },
        residenceCity: {
          required: helpers.withMessage('La población es obligatoria', required),
        },
        countryId: {
          required: helpers.withMessage('El país de residencia es obligatorio', minValue(1)),
        },
        countryState: {
          validCountryState: helpers.withMessage('La provincia es obligatoria', validateState),
        },
        documentCountryId: {
          required: helpers.withMessage('El país del documento es obligatorio', (value: number) => {
            if (!isUnderFourteen.value) {
              return value > 0;
            }
            return true;
          }),
        },
        email: {
          email: helpers.withMessage('El email no es válido', email),
        },
      },
    }));

    const validatorCheckin = useVuelidate(validationCheckinRules, {
      editingCheckinPartner,
    });

    const clearCheckinPartner = () => {
      editingCheckinPartner.value = {
        birthdate: null,
        checkinPartnerState: '',
        countryId: 0,
        countryState: 0,
        documentCountryId: 0,
        documentExpeditionDate: null,
        documentNumber: '',
        documentSupportNumber: '',
        documentType: 0,
        email: '',
        firstname: '',
        gender: '',
        id: editingCheckinPartner.value?.id ?? 0,
        lastname: '',
        lastname2: '',
        mobile: '',
        name: '',
        nationality: 0,
        originInputData: editingCheckinPartner.value?.originInputData ?? '',
        partnerId: undefined,
        relationship: '',
        reservationId: editingCheckinPartner.value?.reservationId ?? 0,
        residenceCity: '',
        residenceStreet: '',
        responsibleCheckinPartnerId: 0,
        zip: '',
      };

      badFormattingBirthdate.value = false;
      badFormattingDocumentExpeditionDate.value = false;
      validatorCheckin.value.editingCheckinPartner.$reset();
    };

    const validateAndSaveCheckinPartner = async () => {
      validatorCheckin.value.$touch();
      if (!validatorCheckin.value.$error && editingCheckinPartner.value) {
        await saveCheckinPartner(editingCheckinPartner.value);
        context.emit('continueCheckinFlowFromForm');
      }
    };

    const validateAndDoCheckin = async () => {
      validatorCheckin.value.$touch();
      validatorCheckin.value.$touch();
      if (!validatorCheckin.value.$error && editingCheckinPartner.value) {
        if (
          !store.state.reservations.currentReservation?.segmentationId &&
          store.state.categories.categories.length > 0
        ) {
          context.emit('moveToSegmentation', editingCheckinPartner.value);
        } else {
          await doCheckin(editingCheckinPartner.value);
          context.emit('continueCheckinFlowFromForm');
        }
      }
    };

    const validateAndPrintCheckin = async () => {
      validatorCheckin.value.$touch();
      if (!validatorCheckin.value.$error && editingCheckinPartner.value) {
        await printCheckin(editingCheckinPartner.value);
      }
    };

    const fetchCheckinPartnerByDocNumber = async () => {
      if (
        editingCheckinPartner.value?.documentType &&
        editingCheckinPartner.value?.documentNumber &&
        !props.isPublicCheckinFlow
      ) {
        try {
          isLoadingData.value = true;
          void store.dispatch('layout/showSpinner', true);
          await store.dispatch('checkinPartners/fetchCheckinPartnerByDocNumber', {
            documentNumber: editingCheckinPartner.value?.documentNumber,
            documentType: editingCheckinPartner.value?.documentType,
          });
          const checkin = store.state.checkinPartners.checkinPartner;

          if (checkin) {
            if (checkin.countryId) {
              await store.dispatch('countryStates/fetchCountryStates', checkin.countryId);
            }
            editingCheckinPartner.value.id = props.checkinPartner.id;
            editingCheckinPartner.value.reservationId = props.checkinPartner.reservationId;
            editingCheckinPartner.value = {
              ...editingCheckinPartner.value,
              ...checkin,
            };
          } else {
            editingCheckinPartner.value.partnerId = undefined;
          }
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
          isLoadingData.value = false;
          validatorCheckin.value.editingCheckinPartner.documentNumber.$touch();
        }
      }
    };

    const fetchAddressByZip = async () => {
      void store.dispatch('layout/showSpinner', true);
      isLoadingData.value = true;
      try {
        if (editingCheckinPartner.value?.zip !== '') {
          await store.dispatch('address/fetchAddressByZip', editingCheckinPartner.value?.zip);
          const { address } = store.state.address;
          if (address && editingCheckinPartner.value) {
            if (address.countryId) {
              editingCheckinPartner.value.countryId = address.countryId;
              await store.dispatch('countryStates/fetchCountryStates', address.countryId);
            }
            if (address.cityId) {
              editingCheckinPartner.value.residenceCity = address.cityId;
            }
            if (address.stateId) {
              editingCheckinPartner.value.countryState = address.stateId;
            }
          }

          void store.dispatch('address/removeAddress');
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
        isLoadingData.value = false;
      }
    };

    const resetDocumentCountryIdDependantData = () => {
      if (editingCheckinPartner.value) {
        if (editingCheckinPartner.value.documentType !== 0) {
          if (
            documentTypes.value
              .filter(
                (dt) => !dt.countryIds.includes(editingCheckinPartner.value?.documentCountryId ?? 0)
              )
              .map((dt) => ({
                id: dt.id,
                text: dt.documentType,
              }))
          ) {
            editingCheckinPartner.value.documentType = 0;
          }
        }
        if (editingCheckinPartner.value.documentNumber !== '') {
          validatorCheckin.value.editingCheckinPartner.documentNumber.$touch();
        }
      }
    };

    watch(
      () => editingCheckinPartner.value?.countryId,
      async (newValue, oldValue) => {
        if (newValue && !isLoadingData.value) {
          try {
            void store.dispatch('layout/showSpinner', true);
            await store.dispatch('countryStates/fetchCountryStates', newValue);
            if (editingCheckinPartner.value && oldValue !== 0 && newValue !== oldValue) {
              editingCheckinPartner.value.countryState = 0;
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
      }
    );

    watch(
      () => editingCheckinPartner.value?.documentCountryId,
      () => {
        if (editingCheckinPartner.value && !isLoadingData.value) {
          resetDocumentCountryIdDependantData();
        }
      }
    );

    watch(
      () => editingCheckinPartner.value?.documentType,
      () => {
        if (editingCheckinPartner.value && editingCheckinPartner.value.documentNumber !== '') {
          validatorCheckin.value.editingCheckinPartner.documentNumber.$touch();
        }
      }
    );

    watch(selectedRelationShip, () => {
      if (editingCheckinPartner.value) {
        const selectedRelationShipCode =
          optionsRelationship.find((item) => item.id === selectedRelationShip.value)?.code || '';
        editingCheckinPartner.value.relationship = selectedRelationShipCode;
      }
    });

    onMounted(async () => {
      isLoadingData.value = true;
      editingCheckinPartner.value = {
        birthdate: props.checkinPartner.birthdate,
        checkinPartnerState: props.checkinPartner.checkinPartnerState,
        countryId: props.checkinPartner.countryId ?? 0,
        countryState: props.checkinPartner.countryState ?? 0,
        documentCountryId: props.checkinPartner.documentCountryId ?? 0,
        documentExpeditionDate: props.checkinPartner.documentExpeditionDate ?? null,
        documentNumber: props.checkinPartner.documentNumber,
        documentSupportNumber: props.checkinPartner.documentSupportNumber,
        documentType:
          props.checkinPartner.documentType !== null ? props.checkinPartner.documentType : 0,
        email: props.checkinPartner.email,
        firstname: props.checkinPartner.firstname,
        gender: props.checkinPartner.gender ?? '',
        id: props.checkinPartner.id,
        lastname: props.checkinPartner.lastname,
        lastname2: props.checkinPartner.lastname2,
        mobile: props.checkinPartner.mobile,
        name: props.checkinPartner.name,
        nationality: props.checkinPartner.nationality ?? 0,
        originInputData: props.checkinPartner.originInputData,
        partnerId: props.checkinPartner.partnerId,
        relationship: props.checkinPartner.relationship ?? '',
        reservationId: props.checkinPartner.reservationId,
        residenceCity: props.checkinPartner.residenceCity,
        residenceStreet: props.checkinPartner.residenceStreet,
        responsibleCheckinPartnerId: props.checkinPartner.responsibleCheckinPartnerId,
        zip: props.checkinPartner.zip,
      };

      try {
        void store.dispatch('layout/showSpinner', true);
        if (store.state.folios.currentFolio) {
          await store.dispatch('folios/fetchAdultsInFolio', store.state.folios.currentFolio.id);
        }
        if (countries.value.length === 0) {
          await store.dispatch('countries/fetchCountries');
        }
        if (props.checkinPartner.countryState) {
          await store.dispatch('countryStates/fetchCountryStates', props.checkinPartner.countryId);
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
      isLoadingData.value = false;
    });

    onUnmounted(() => {
      void store.dispatch('countryStates/removeCountryStates');
    });

    return {
      editingCheckinPartner,
      countries,
      documentTypes,
      badFormattingDocumentExpeditionDate,
      badFormattingBirthdate,
      DOCUMENT_TYPE_DNI,
      DOCUMENT_TYPE_NIE,
      residenceStates,
      validatorCheckin,
      isCheckinAllowed,
      COUNTRY_ID_SPAIN,
      optionsRelationship,
      selectedRelationShip,
      isUnderAge,
      isUnderFourteen,
      adultsInFolio,
      clearCheckinPartner,
      validateAndSaveCheckinPartner,
      validateAndDoCheckin,
      validateAndPrintCheckin,
      checkinMandatoryDataComplete,
      printCheckin,
      fetchCheckinPartnerByDocNumber,
      fetchAddressByZip,
    };
  },
});
</script>

<style lang="scss" scoped>
.checkin-partner-form-content {
  font-size: 1rem;
  width: 100%;
  height: auto;
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  .item {
    border-radius: 13px;
    .asterisk {
      color: #ed4a1c;
      font-weight: bold;
    }
    .input {
      height: 40px;
    }
    .error-message {
      height: 1rem;
      color: red;
      font-size: 12px;
      margin-bottom: 1rem;
    }
  }
  .footer {
    margin-top: 1rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .left,
    .right {
      display: flex;
      gap: 1rem;
      .button {
        width: 100%;
      }
    }
  }
}
@media (min-width: 1024px) {
  .checkin-partner-form-content {
    width: 100%;
    br {
      margin-bottom: 60px;
    }
    .form-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      .item {
        width: 100%;
      }
      .residence-street {
        flex: 1 1 75%;
      }
      .residence-zip {
        flex: 1 1 25%;
      }
    }
  }
}
@media (min-width: 1280px) {
  .checkin-partner-form-content {
    .footer {
      flex-direction: row;
      width: 100%;
      .left,
      .right {
        width: 100%;
        .button {
          width: auto;
        }
      }
      .right {
        flex-direction: row-reverse;
      }
    }
  }
}
</style>
