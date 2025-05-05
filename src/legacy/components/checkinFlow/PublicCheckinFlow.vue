<template>
  <div class="full-screen-stepper" id="full-screen-stepper">
    <div class="stepper-wrap">
      <div class="progress-bar-content">
        <div class="progress-bar" :style="{ width: `${currentProgress}%` }" />
      </div>
      <div class="gradient-top">
        <button class="btn-close" @click="$emit('closeCheckinFlow')">
          <img src="/app-images/double-arrow-right-white.svg" />
        </button>
      </div>
      <div class="content-step">
        <TransitionGroup :name="isStepIncreasing ? 'slide-fade' : 'slide-fade-decreases'">
          <CheckinFlowStart
            isPrecheckin
            v-if="currentStep === 'start'"
            :propertyName="precheckinInfo?.pmsPropertyName ?? ''"
            :roomTypeName="precheckinInfo?.reservations[0].roomTypeName ?? ''"
            :partnerName="precheckinInfo?.folioPartnerName ?? ''"
            :reservationCode="precheckinInfo?.reservations[0].reservationReference ?? ''"
            :nights="precheckinInfo?.reservations[0].nights ?? 0"
            :checkin="(precheckinInfo?.reservations[0].checkin as Date)"
            :checkout="(precheckinInfo?.reservations[0].checkout as Date)"
            :adults="precheckinInfo?.reservations[0].adults ?? 0"
            :children="precheckinInfo?.reservations[0].children ?? 0"
            @next="nextStep()"
            @nextCheckinPartnerToComplete="nextCheckinPartnerToComplete"
            :checkinPartners="publicCheckinPartners"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                v-for="(checkinPartner, cpIndex) in publicCheckinPartners.filter(
                  (el) => el.checkinPartnerState !== 'draft' && el.checkinPartnerState !== 'dummy'
                )"
                :key="checkinPartner.id"
                :checkinPartnerIndex="cpIndex"
                isPreCheckin
                isFromStart
                :countryName="countryName(checkinPartner.nationality)"
                :countryCode="countryCode(checkinPartner.nationality)"
                :documentTypeName="documentTypeName(checkinPartner.documentType)"
                :documentNumber="checkinPartner.documentNumber"
                :checkinSignature="checkinPartner.signature"
                :checkinPartnerState="checkinPartner.checkinPartnerState"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    activeCheckinPartner,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_NIE,
                    activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
              />
            </template>
          </CheckinFlowStart>
          <CheckinFlowEntryType
            v-else-if="currentStep === 'entryType'"
            v-model="activeCheckinPartner.originInputData"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            isPrecheckin
            :isOCRAvailable="precheckinInfo?.pmsPropertyIsOCRAvailable"
            @next="nextStep()"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowPhotoTake
            title="Cara frontal"
            :step="currentStepNumber"
            v-else-if="currentStep === 'take-photo-front'"
            :currentIndexCheckin="currentIndexCheckin"
            @capturedPhoto="capturedPhoto($event, true)"
            @previous="previousStep()"
          />
          <CheckinFlowPhotoConfirm
            :step="currentStepNumber"
            v-else-if="currentStep === 'confirm-photo-front'"
            :currentIndexCheckin="currentIndexCheckin"
            :documentImageBase64="documentImageBase64Front"
            @next="nextStep()"
            @previous="previousStep()"
          />
          <CheckinFlowPhotoComplete
            :currentIndexCheckin="currentIndexCheckin"
            :documentImageBase64Front="documentImageBase64Front"
            :documentImageBase64Back="documentImageBase64Back"
            :step="currentStepNumber"
            v-else-if="currentStep === 'after-confirm-photo-front'"
            @next="nextStep()"
            @previous="previousStep()"
            @processOCR="processOCR"
            @backToCaptureBackDocument="currentStep = 'take-photo-back'"
            @backToCaptureFrontDocument="currentStep = 'take-photo-front'"
          />
          <CheckinFlowPhotoTake
            title="Cara trasera"
            :step="currentStepNumber"
            v-else-if="currentStep === 'take-photo-back'"
            :currentIndexCheckin="currentIndexCheckin"
            @capturedPhoto="capturedPhoto($event)"
            @previous="previousStep()"
            isBack
          />
          <CheckinFlowPhotoConfirm
            :step="currentStepNumber"
            v-else-if="currentStep === 'confirm-photo-back'"
            :currentIndexCheckin="currentIndexCheckin"
            :documentImageBase64="documentImageBase64Back"
            @next="nextStep()"
            @previous="previousStep()"
          />
          <CheckinFlowPhotoComplete
            :currentIndexCheckin="currentIndexCheckin"
            :documentImageBase64Front="documentImageBase64Front"
            :documentImageBase64Back="documentImageBase64Back"
            :step="currentStepNumber"
            v-else-if="currentStep === 'after-confirm-photo-back'"
            @processOCR="processOCR"
            @previous="previousStep()"
            @backToCaptureBackDocument="currentStep = 'take-photo-back'"
            @backToCaptureFrontDocument="currentStep = 'take-photo-front'"
          />
          <CheckinFlowBirthdate
            isPrecheckin
            v-else-if="currentStep === 'birthDate' && activeCheckinPartner"
            v-model="activeCheckinPartner.birthdate"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            :reservationId="reservationId"
            :reservationToken="reservationToken"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowRelationship
            v-else-if="currentStep === 'relationship' && activeCheckinPartner"
            v-model:relationship="activeCheckinPartner.relationship"
            v-model:documentLegalRepresentative="activeCheckinPartner.documentLegalRepresentative"
            isPrecheckin
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            :reservationId="reservationId"
            :reservationToken="reservationToken"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            @next="nextStep()"
          >
          </CheckinFlowRelationship>
          <CheckinFlowCountry
            v-else-if="
              currentStep === 'documentCountry' &&
              activeCheckinPartner &&
              activeCheckinPartner.birthdate
            "
            v-model="activeCheckinPartner.documentCountryId"
            title="País de origen del documento"
            subtitle="Selecciona el país del documento del huésped"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            :isUnderFourteen="yearsFrom(activeCheckinPartner.birthdate) <= 14"
            @next="nextStep()"
            @noDocumentSelected="activeCheckinPartner.documentType = 0"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowDocumentType
            v-else-if="currentStep === 'documentType' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentType"
            :documentCountryId="activeCheckinPartner.documentCountryId"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowDocumentNumber
            isPrecheckin
            v-else-if="currentStep === 'documentNumber' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentNumber"
            :documentType="activeCheckinPartner.documentType"
            :documentCountryId="activeCheckinPartner.documentCountryId"
            :currentIndexCheckin="currentIndexCheckin"
            :checkinPartnerId="activeCheckinPartner.id"
            :step="currentStepNumber"
            @next="nextStep()"
            @setActiveCheckinPartner="setExistingCheckinPartner($event)"
            :reservationId="reservationId"
            :checkinPartners="publicCheckinPartners"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            @continueCheckinFlow="continueCheckinFlow()"
            @clearExistingCheckinPartner="deleteNextDocNumberStepValues()"
          />
          <CheckinFlowDocumentExpeditionDate
            v-else-if="currentStep === 'documentExpeditionDate' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentExpeditionDate"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowDocumentSupportNumber
            v-else-if="currentStep === 'documentSupportNumber' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentSupportNumber"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowName
            v-else-if="currentStep === 'name' && activeCheckinPartner"
            v-model:guestFirstname="activeCheckinPartner.firstname"
            v-model:guestLastname="activeCheckinPartner.lastname"
            v-model:guestLastname2="activeCheckinPartner.lastname2"
            :isSpanishGuest="activeCheckinPartner.documentCountryId === NATIONALITY_CODE_SPAIN"
            @next="nextStep()"
            :isUnderFourteen="
              (activeCheckinPartner.birthdate || false) &&
              yearsFrom(activeCheckinPartner.birthdate) <= 14
            "
            :isHiddenFirstName="
              existingCheckinPartner !== null && existingCheckinPartner.firstname === '#'
                ? true
                : false
            "
            :isHiddenLastName="
              existingCheckinPartner !== null && existingCheckinPartner.lastname === '#'
                ? true
                : false
            "
            :isHiddenLastName2="
              existingCheckinPartner !== null && existingCheckinPartner.lastname2 === '#'
                ? true
                : false
            "
            :existingCheckinPartner="existingCheckinPartner"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowCountry
            v-else-if="currentStep === 'nationality' && activeCheckinPartner"
            v-model="activeCheckinPartner.nationality"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowGender
            v-else-if="currentStep === 'gender' && activeCheckinPartner"
            v-model="activeCheckinPartner.gender"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowCountry
            v-else-if="currentStep === 'residenceCountry'"
            v-model="activeCheckinPartner.countryId"
            @next="nextStep()"
            title="País de residencia"
            subtitle="Selecciona el país de residencia del huésped"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            :step="currentStepNumber"
          />
          <CheckinFlowStreet
            v-else-if="currentStep === 'street'"
            v-model="activeCheckinPartner.residenceStreet"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowAddress
            v-else-if="currentStep === 'address'"
            v-model:residenceZip="activeCheckinPartner.zip"
            v-model:residenceCity="activeCheckinPartner.residenceCity"
            v-model:residenceStateId="activeCheckinPartner.countryState"
            :countryId="activeCheckinPartner.countryId"
            @next="nextStep()"
            :isSpanishGuest="activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            :isHiddenZip="
              existingCheckinPartner !== null && existingCheckinPartner.zip !== null ? true : false
            "
            :isHiddenCity="
              existingCheckinPartner !== null && existingCheckinPartner.residenceCity !== null
                ? true
                : false
            "
            :isHiddenState="
              existingCheckinPartner !== null && existingCheckinPartner.countryState !== null
                ? true
                : false
            "
          />
          <CheckinFlowContact
            v-else-if="currentStep === 'contact'"
            v-model:guestMail="activeCheckinPartner.email"
            v-model:guestPhone="activeCheckinPartner.mobile"
            @next="nextStep()"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            :isHiddenMail="
              existingCheckinPartner !== null && existingCheckinPartner.email === '#' ? true : false
            "
            :isHiddenPhone="
              existingCheckinPartner !== null && existingCheckinPartner.mobile === '#'
                ? true
                : false
            "
          />
          <CheckinFlowFingerSign
            v-else-if="
              currentStep === 'signature' &&
              precheckinInfo?.reservations[0].checkin &&
              precheckinInfo?.reservations[0].checkout
            "
            v-model="activeCheckinPartner.signature"
            isPreCheckin
            :checkinPartner="activeCheckinPartner"
            :step="currentStepNumber"
            :reservationName="precheckinInfo?.reservations[0].reservationReference"
            :roomTypeName="precheckinInfo?.reservations[0].roomTypeName"
            :cardexWarning="precheckinInfo?.cardexWarning"
            :checkin="precheckinInfo?.reservations[0].checkin"
            :checkout="precheckinInfo?.reservations[0].checkout"
            :reservationAmount="precheckinInfo?.reservations[0].reservationAmount"
            :reservationReference="precheckinInfo?.reservations[0].reservationReference"
            :currentIndexCheckin="currentIndexCheckin"
            @next="nextStep()"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
          />
          <CheckinFlowSummary
            v-else-if="currentStep === 'summaryCurrentCheckinPartner' && activeCheckinPartner"
            :checkinPartnerId="activeCheckinPartner.id"
            :firstName="activeCheckinPartner.firstname"
            :lastName="activeCheckinPartner.lastname"
            :lastName2="activeCheckinPartner.lastname2"
            :documentTypeId="activeCheckinPartner.documentType"
            :documentNumber="activeCheckinPartner.documentNumber"
            :birthDate="activeCheckinPartner.birthdate"
            :nationality="activeCheckinPartner.nationality"
            :currentIndexCheckin="currentIndexCheckin"
            :checkinPartnerActive="activeCheckinPartner"
            :step="currentStepNumber"
            :isSegmented="false"
            @continueCheckinFlow="nextStep()"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                isPreCheckin
                class="checkin-card-flow"
                :countryName="countryName(activeCheckinPartner.nationality)"
                :firstname="activeCheckinPartner.firstname"
                :lastname="activeCheckinPartner.lastname"
                :lastname2="activeCheckinPartner.lastname2"
                :countryCode="countryCode(activeCheckinPartner.nationality)"
                :documentTypeName="documentTypeName(activeCheckinPartner.documentType)"
                :documentNumber="activeCheckinPartner.documentNumber"
                :age="checkinPartnerAge(activeCheckinPartner.birthdate)"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    activeCheckinPartner,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_NIE,
                    activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
                :checkinSignature="activeCheckinPartner.signature"
                :checkinPartnerIndex="currentIndexCheckin"
                :isExistingCheckinPartner="existingCheckinPartner !== null"
              />
            </template>
          </CheckinFlowSummary>
          <CheckinFlowFeedback
            v-else-if="currentStep === 'feedback'"
            :currentIndexCheckin="currentIndexCheckin"
            :checkinPartners="publicCheckinPartners"
            :currentCheckinName="`${
              currentIndexCheckin === 0 ? 'Primer' : currentIndexCheckin + 1 + 'º'
            } huésped`"
            @next="nextStep()"
          />
        </TransitionGroup>
      </div>
      <CheckinFlowStepper
        :currentStep="currentStep"
        :checkinPartners="publicCheckinPartners"
        :activeCheckinPartnerId="activeCheckinPartner.id"
        :isFormDisplayed="false"
        :isAllowedNextStep="isAllowedNextStep"
        @restartCheckinFlow="restartCheckinFlow()"
        @previous="previousStep()"
        @next="nextStep()"
        isPrecheckin
      />
    </div>
  </div>
</template>

<script lang="ts">
import { type CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import { defineComponent, ref, type Ref, computed, onMounted, watch } from 'vue';

import { useRoute } from 'vue-router';
import {
  useCheckinPartner,
  DEFAULT_CHECKIN_PARTNER_VALUES,
} from '@/legacyu/utils/useCheckinPartner';
import utilsDates from '@/legacy/utils/dates';
import { useStore } from '@/legacy/store';

import CheckinCardFlow from '@/legacy/components/checkinFlow/CheckinCardFlow.vue';
import CheckinFlowStart from '@/legacy/components/checkinFlow/CheckinFlowStart.vue';
import CheckinFlowEntryType from '@/legacy/components/checkinFlow/CheckinFlowEntryType.vue';
import CheckinFlowPhotoTake from '@/legacy/components/checkinFlow/CheckinFlowPhotoTake.vue';
import CheckinFlowPhotoConfirm from '@/legacy/components/checkinFlow/CheckinFlowPhotoConfirm.vue';
import CheckinFlowPhotoComplete from '@/legacy/components/checkinFlow/CheckinFlowPhotoComplete.vue';
import CheckinFlowBirthdate from '@/legacy/components/checkinFlow/CheckinFlowBirthdate.vue';
import CheckinFlowRelationship from '@/legacy/components/checkinFlow/CheckinFlowRelationship.vue';
import CheckinFlowCountry from '@/legacy/components/checkinFlow/CheckinFlowCountry.vue';
import CheckinFlowDocumentType from '@/legacy/components/checkinFlow/CheckinFlowDocumentType.vue';
import CheckinFlowDocumentNumber from '@/legacy/components/checkinFlow/CheckinFlowDocumentNumber.vue';
import CheckinFlowDocumentExpeditionDate from '@/legacy/components/checkinFlow/CheckinFlowDocumentExpeditionDate.vue';
import CheckinFlowDocumentSupportNumber from '@/legacy/components/checkinFlow/CheckinFlowDocumentSupportNumber.vue';
import CheckinFlowName from '@/legacy/components/checkinFlow/CheckinFlowName.vue';
import CheckinFlowGender from '@/legacy/components/checkinFlow/CheckinFlowGender.vue';
import CheckinFlowStreet from '@/legacy/components/checkinFlow/CheckinFlowStreet.vue';
import CheckinFlowAddress from '@/legacy/components/checkinFlow/CheckinFlowAddress.vue';
import CheckinFlowContact from '@/legacy/components/checkinFlow/CheckinFlowContact.vue';
import CheckinFlowSummary from '@/legacy/components/checkinFlow/CheckinFlowSummary.vue';
import CheckinFlowFeedback from '@/legacy/components/checkinFlow/CheckinFlowFeedback.vue';
import CheckinFlowStepper from '@/legacy/components/checkinFlow/CheckinFlowStepper.vue';
import CheckinFlowFingerSign from '@/legacy/components/checkinFlow/CheckinFlowFingerSign.vue';
import { dialogService } from '@/legacy/services/DialogService';

type TypeStep =
  | 'start'
  | 'entryType'
  | 'take-photo-front'
  | 'confirm-photo-front'
  | 'after-confirm-photo-front'
  | 'take-photo-back'
  | 'confirm-photo-back'
  | 'after-confirm-photo-back'
  | 'birthDate'
  | 'relationship'
  | 'documentCountry'
  | 'nationality'
  | 'documentType'
  | 'documentNumber'
  | 'documentExpeditionDate'
  | 'documentSupportNumber'
  | 'name'
  | 'gender'
  | 'residenceCountry'
  | 'street'
  | 'address'
  | 'contact'
  | 'signature'
  | 'summaryCurrentCheckinPartner'
  | 'feedback';

export default defineComponent({
  components: {
    CheckinCardFlow,
    CheckinFlowStart,
    CheckinFlowCountry,
    CheckinFlowBirthdate,
    CheckinFlowRelationship,
    CheckinFlowDocumentType,
    CheckinFlowDocumentNumber,
    CheckinFlowDocumentExpeditionDate,
    CheckinFlowDocumentSupportNumber,
    CheckinFlowName,
    CheckinFlowGender,
    CheckinFlowStreet,
    CheckinFlowAddress,
    CheckinFlowContact,
    CheckinFlowSummary,
    CheckinFlowFeedback,
    CheckinFlowStepper,
    CheckinFlowEntryType,
    CheckinFlowPhotoTake,
    CheckinFlowPhotoConfirm,
    CheckinFlowPhotoComplete,
    CheckinFlowFingerSign,
  },
  setup(props, context) {
    const store = useStore();
    const route = useRoute();
    const { yearsFrom } = utilsDates;

    const reservationToken = route.params.reservationToken as string;
    const reservationId = parseInt(route.params.reservationId as string, 10);

    const isStepIncreasing = ref(true);
    const isAllowedNextStep = ref(false);
    const currentStepNumber = ref(1);

    const selectedAdress = ref(0);
    const currentStep: Ref<TypeStep> = ref('start');
    const documentImageBase64Front = ref('');
    const documentImageBase64Back = ref('');

    const isResidenceCountryFromExistingCheckinPartner = ref(false);

    const { checkinMandatoryDataComplete } = useCheckinPartner();

    const publicCheckinPartners: Ref<CheckinPartnerInterface[]> = ref([]);

    const activeCheckinPartner: Ref<CheckinPartnerInterface> = ref({
      ...DEFAULT_CHECKIN_PARTNER_VALUES,
    });

    const existingCheckinPartner: Ref<CheckinPartnerInterface | null> = ref(null);

    const precheckinInfo = computed(() => store.state.precheckin.folioPublicInfo);
    const countryStates = computed(() => store.state.countryStates.countryStates);

    const currentIndexCheckin = computed(() => {
      const index = publicCheckinPartners.value.findIndex(
        (el) => el.id === activeCheckinPartner.value.id
      );
      return index;
    });

    const checkinPartnerOcr = computed(() => store.state.ocrDocument.documentData);

    const currentProgress = computed(() => {
      if (currentStep.value === 'entryType') {
        return 5;
      }
      if (currentStep.value === 'birthDate') {
        return 10;
      }
      if (currentStep.value === 'relationship') {
        return 15;
      }
      if (currentStep.value === 'documentCountry') {
        return 20;
      }
      if (currentStep.value === 'documentType') {
        return 25;
      }
      if (currentStep.value === 'take-photo-front') {
        return 30;
      }
      if (currentStep.value === 'confirm-photo-front') {
        return 35;
      }
      if (currentStep.value === 'after-confirm-photo-front') {
        return 37;
      }
      if (currentStep.value === 'take-photo-back') {
        return 40;
      }
      if (currentStep.value === 'confirm-photo-back') {
        return 45;
      }
      if (currentStep.value === 'after-confirm-photo-back') {
        return 47;
      }
      if (currentStep.value === 'documentNumber') {
        return 50;
      }
      if (currentStep.value === 'documentExpeditionDate') {
        return 55;
      }
      if (currentStep.value === 'documentSupportNumber') {
        return 57;
      }
      if (currentStep.value === 'name') {
        return 60;
      }
      if (currentStep.value === 'nationality') {
        return 65;
      }
      if (currentStep.value === 'gender') {
        return 70;
      }

      if (currentStep.value === 'residenceCountry') {
        return 75;
      }
      if (currentStep.value === 'street') {
        return 80;
      }
      if (currentStep.value === 'address') {
        return 85;
      }
      if (currentStep.value === 'contact') {
        return 90;
      }
      if (currentStep.value === 'signature') {
        return 95;
      }
      if (currentStep.value === 'summaryCurrentCheckinPartner') {
        return 99;
      }
      if (currentStep.value === 'feedback') {
        return 100;
      }
      return 0;
    });

    const countryName = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.name;

    const checkinPartnerAge = (partnerBirthDate: Date | null): number => {
      if (!partnerBirthDate) return 0;

      const today = new Date();
      const [yearToday, monthToday, dayToday] = [
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ];
      const [yearBirth, monthBirth, dayBirth] = [
        partnerBirthDate.getFullYear(),
        partnerBirthDate.getMonth(),
        partnerBirthDate.getDate(),
      ];

      let age = yearToday - yearBirth;
      if (monthToday < monthBirth || (monthToday === monthBirth && dayToday < dayBirth)) {
        age -= 1;
      }

      return age;
    };

    const countryCode = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    const documentTypeName = (documentTypeId: number) =>
      store.state.documentType.documentType.find((el) => el.id === documentTypeId)?.documentType;

    const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find(
      (el) => el.code === 'ES'
    )?.id;

    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (el) => el.code === 'D'
    )?.id;

    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (el) => el.code === 'N'
    )?.id;

    const nextCheckinPartnerToComplete = () => {
      currentStepNumber.value = 1;
      // active partner index
      const index = publicCheckinPartners.value.findIndex(
        (el) => el.id === activeCheckinPartner.value.id
      );

      // next dummy with greater index
      let nextActiveCheckinPartner = publicCheckinPartners.value.find(
        (value, i) => value.checkinPartnerState === 'dummy' && i > index
      );

      // next draft with greater index
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = publicCheckinPartners.value.find(
          (value, i) => value.checkinPartnerState === 'draft' && i > index
        );
      }

      // next dummy
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = publicCheckinPartners.value.find(
          (value) =>
            value.checkinPartnerState === 'dummy' && value.id !== activeCheckinPartner.value.id
        );
      }

      // next draft
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = publicCheckinPartners.value.find(
          (value) =>
            value.checkinPartnerState === 'draft' && value.id !== activeCheckinPartner.value.id
        );
      }

      // if next dummy partner set it as active
      if (nextActiveCheckinPartner) {
        activeCheckinPartner.value = nextActiveCheckinPartner;
      }
      if (precheckinInfo.value?.pmsPropertyIsOCRAvailable) {
        currentStep.value = 'entryType';
      } else {
        currentStep.value = 'birthDate';
      }
    };

    const nextStepExistingCheckinPartner = () => {
      if (!activeCheckinPartner.value?.documentExpeditionDate) {
        currentStep.value = 'documentExpeditionDate';
      } else if (
        !activeCheckinPartner.value?.documentSupportNumber &&
        (activeCheckinPartner.value?.documentType === DOCUMENT_TYPE_NIE ||
          activeCheckinPartner.value?.documentType === DOCUMENT_TYPE_DNI)
      ) {
        currentStep.value = 'documentSupportNumber';
      } else if (
        !activeCheckinPartner.value?.firstname ||
        !activeCheckinPartner.value?.lastname ||
        (!activeCheckinPartner.value?.lastname2 &&
          activeCheckinPartner.value?.documentCountryId === NATIONALITY_CODE_SPAIN)
      ) {
        currentStep.value = 'name';
      } else if (!activeCheckinPartner.value?.nationality) {
        currentStep.value = 'nationality';
      } else if (!activeCheckinPartner.value?.gender) {
        currentStep.value = 'gender';
      } else if (!activeCheckinPartner.value?.countryId) {
        currentStep.value = 'residenceCountry';
      } else if (!activeCheckinPartner.value?.residenceStreet) {
        currentStep.value = 'street';
      } else if (
        !activeCheckinPartner.value?.zip ||
        !activeCheckinPartner.value?.residenceCity ||
        (!activeCheckinPartner.value?.countryState && countryStates.value.length > 0)
      ) {
        currentStep.value = 'address';
      } else if (!activeCheckinPartner.value?.email || !activeCheckinPartner.value?.mobile) {
        currentStep.value = 'contact';
      } else {
        currentStep.value = 'signature';
      }
    };

    const isDocumentExpeditionDateProvided = () =>
      activeCheckinPartner.value.documentExpeditionDate?.getTime() !== 0;
    const isDocumentSupportNumberProvided = () =>
      activeCheckinPartner.value.documentSupportNumber !== '#';
    const isNameProvided = () =>
      activeCheckinPartner.value.firstname !== '#' ||
      activeCheckinPartner.value.lastname !== '#' ||
      activeCheckinPartner.value.lastname2 !== '#';
    const isNationalityProvided = () => activeCheckinPartner.value.nationality !== -1;
    const isGenderProvided = () => activeCheckinPartner.value.gender !== '#';
    const isResidenceStreetProvided = () => activeCheckinPartner.value.residenceStreet !== '#';
    const isAddressProvided = () =>
      activeCheckinPartner.value.zip !== '#' ||
      activeCheckinPartner.value.residenceCity !== '#' ||
      activeCheckinPartner.value.countryState !== -1;
    const isContactProvided = () =>
      activeCheckinPartner.value.email !== '#' || activeCheckinPartner.value.mobile !== '#';

    const previousStepExistingCheckinPartner = () => {
      switch (currentStep.value) {
        case 'documentNumber':
          currentStep.value = 'documentType';
          break;
        case 'documentExpeditionDate':
          currentStep.value = 'documentNumber';
          break;
        case 'documentSupportNumber':
          currentStep.value = isDocumentExpeditionDateProvided()
            ? 'documentExpeditionDate'
            : 'documentNumber';
          break;
        case 'name':
          if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'nationality':
          if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'gender':
          if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'residenceCountry':
          if (isGenderProvided()) {
            currentStep.value = 'gender';
          } else if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'street':
          if (!isResidenceCountryFromExistingCheckinPartner.value) {
            currentStep.value = 'residenceCountry';
          } else if (isGenderProvided()) {
            currentStep.value = 'gender';
          } else if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'address':
          if (isResidenceStreetProvided()) {
            currentStep.value = 'street';
          } else if (!isResidenceCountryFromExistingCheckinPartner.value) {
            currentStep.value = 'residenceCountry';
          } else if (isGenderProvided()) {
            currentStep.value = 'gender';
          } else if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'contact':
          if (isAddressProvided()) {
            currentStep.value = 'address';
          } else if (isResidenceStreetProvided()) {
            currentStep.value = 'street';
          } else if (!isResidenceCountryFromExistingCheckinPartner.value) {
            currentStep.value = 'residenceCountry';
          } else if (isGenderProvided()) {
            currentStep.value = 'gender';
          } else if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'signature':
          if (isContactProvided()) {
            currentStep.value = 'contact';
          } else if (isAddressProvided()) {
            currentStep.value = 'address';
          } else if (isResidenceStreetProvided()) {
            currentStep.value = 'street';
          } else if (!isResidenceCountryFromExistingCheckinPartner.value) {
            currentStep.value = 'residenceCountry';
          } else if (isGenderProvided()) {
            currentStep.value = 'gender';
          } else if (isNationalityProvided()) {
            currentStep.value = 'nationality';
          } else if (isNameProvided()) {
            currentStep.value = 'name';
          } else if (isDocumentSupportNumberProvided()) {
            currentStep.value = 'documentSupportNumber';
          } else if (isDocumentExpeditionDateProvided()) {
            currentStep.value = 'documentExpeditionDate';
          } else {
            currentStep.value = 'documentNumber';
          }
          break;
        case 'summaryCurrentCheckinPartner':
          currentStep.value = 'signature';
          break;
        default:
          currentStep.value = 'start';
      }
    };

    const nextStep = async () => {
      if (currentStep.value !== 'summaryCurrentCheckinPartner') {
        currentStepNumber.value += 1;
      }
      // steps for existing checkin partner
      const existingCheckinPartnerSteps = [
        'documentNumber',
        'documentExpeditionDate',
        'documentSupportNumber',
        'name',
        'nationality',
        'gender',
        'residenceCountry',
        'address',
        'after-confirm-photo-front',
        'after-confirm-photo-back',
      ];
      if (existingCheckinPartner.value && existingCheckinPartnerSteps.includes(currentStep.value)) {
        nextStepExistingCheckinPartner();
        return;
      }
      if (currentStep.value === 'start') {
        if (precheckinInfo.value?.pmsPropertyIsOCRAvailable) {
          currentStep.value = 'entryType';
        } else {
          currentStep.value = 'birthDate';
        }
      } else if (currentStep.value === 'entryType') {
        if (activeCheckinPartner.value.originInputData === 'ocr-precheckin') {
          currentStep.value = 'take-photo-front';
        } else if (activeCheckinPartner.value.originInputData === 'wizard-precheckin') {
          currentStep.value = 'birthDate';
        }
      } else if (currentStep.value === 'birthDate') {
        if (
          activeCheckinPartner.value.birthdate &&
          yearsFrom(activeCheckinPartner.value.birthdate) < 18
        ) {
          currentStep.value = 'relationship';
        } else {
          currentStep.value = 'documentCountry';
        }
      } else if (currentStep.value === 'relationship') {
        currentStep.value = 'documentCountry';
      } else if (currentStep.value === 'take-photo-front') {
        currentStep.value = 'confirm-photo-front';
      } else if (currentStep.value === 'confirm-photo-front') {
        currentStep.value = 'after-confirm-photo-front';
      } else if (currentStep.value === 'after-confirm-photo-front') {
        currentStep.value = 'take-photo-back';
      } else if (currentStep.value === 'take-photo-back') {
        currentStep.value = 'confirm-photo-back';
      } else if (currentStep.value === 'confirm-photo-back') {
        currentStep.value = 'after-confirm-photo-back';
      } else if (currentStep.value === 'documentCountry') {
        if (
          activeCheckinPartner.value.birthdate &&
          activeCheckinPartner.value.documentCountryId === 0 &&
          yearsFrom(activeCheckinPartner.value.birthdate) <= 14
        ) {
          currentStep.value = 'name';
        } else {
          currentStep.value = 'documentType';
        }
      } else if (currentStep.value === 'documentType') {
        currentStep.value = 'documentNumber';
      } else if (currentStep.value === 'documentNumber') {
        currentStep.value = 'documentExpeditionDate';
      } else if (currentStep.value === 'documentExpeditionDate') {
        if (
          activeCheckinPartner.value.documentType === DOCUMENT_TYPE_DNI ||
          activeCheckinPartner.value.documentType === DOCUMENT_TYPE_NIE
        ) {
          currentStep.value = 'documentSupportNumber';
        } else {
          currentStep.value = 'name';
        }
      } else if (currentStep.value === 'documentSupportNumber') {
        currentStep.value = 'name';
      } else if (currentStep.value === 'name') {
        currentStep.value = 'nationality';
      } else if (currentStep.value === 'nationality') {
        currentStep.value = 'gender';
      } else if (currentStep.value === 'gender') {
        currentStep.value = 'residenceCountry';
      } else if (currentStep.value === 'residenceCountry') {
        currentStep.value = 'street';
      } else if (currentStep.value === 'street') {
        currentStep.value = 'address';
      } else if (currentStep.value === 'address') {
        currentStep.value = 'contact';
      } else if (currentStep.value === 'contact') {
        currentStep.value = 'signature';
      } else if (currentStep.value === 'signature') {
        currentStep.value = 'summaryCurrentCheckinPartner';
      } else if (currentStep.value === 'summaryCurrentCheckinPartner') {
        // save checkin partner
        await store.dispatch('precheckin/savePrecheckin', {
          checkinPartner: activeCheckinPartner.value,
          reservationId,
          token: reservationToken,
        });
        // fetch after save
        await store.dispatch('precheckin/fetchReservationPublicInfo', {
          id: reservationId,
          token: reservationToken,
          globalErrors: false,
        });
        publicCheckinPartners.value = [];
        store.state.precheckin.folioPublicInfo?.reservations[0].checkinPartners.forEach((el) => {
          publicCheckinPartners.value.push({
            ...DEFAULT_CHECKIN_PARTNER_VALUES,
            ...el,
          });
        });
        currentStep.value = 'feedback';
      } else if (currentStep.value === 'feedback') {
        const numCheckinPartnersDraftOrDummy = publicCheckinPartners.value.filter(
          (cp) => cp.checkinPartnerState === 'dummy' || cp.checkinPartnerState === 'draft'
        ).length;
        if (numCheckinPartnersDraftOrDummy > 0) {
          nextCheckinPartnerToComplete();
        } else if (numCheckinPartnersDraftOrDummy === 0) {
          context.emit('closeCheckinFlow');
        } else {
          currentStep.value = 'start';
        }
      }
    };

    const previousStep = () => {
      currentStepNumber.value -= 1;
      if (existingCheckinPartner.value) {
        previousStepExistingCheckinPartner();
        return;
      }
      if (currentStep.value === 'summaryCurrentCheckinPartner') {
        currentStep.value = 'signature';
      } else if (currentStep.value === 'signature') {
        currentStep.value = 'contact';
      } else if (currentStep.value === 'contact') {
        currentStep.value = 'address';
      } else if (currentStep.value === 'address') {
        currentStep.value = 'street';
      } else if (currentStep.value === 'street') {
        currentStep.value = 'residenceCountry';
      } else if (currentStep.value === 'residenceCountry') {
        currentStep.value = 'gender';
      } else if (currentStep.value === 'gender') {
        currentStep.value = 'nationality';
      } else if (currentStep.value === 'nationality') {
        currentStep.value = 'name';
      } else if (currentStep.value === 'name') {
        if (
          activeCheckinPartner.value.birthdate &&
          yearsFrom(activeCheckinPartner.value.birthdate) <= 14
        ) {
          currentStep.value = 'documentCountry';
        } else if (
          activeCheckinPartner.value.documentType === DOCUMENT_TYPE_DNI ||
          activeCheckinPartner.value.documentType === DOCUMENT_TYPE_NIE
        ) {
          currentStep.value = 'documentSupportNumber';
        } else {
          currentStep.value = 'documentExpeditionDate';
        }
      } else if (currentStep.value === 'documentExpeditionDate') {
        currentStep.value = 'documentNumber';
      } else if (currentStep.value === 'documentSupportNumber') {
        currentStep.value = 'documentExpeditionDate';
      } else if (currentStep.value === 'documentNumber') {
        currentStep.value = 'documentType';
      } else if (currentStep.value === 'documentType') {
        currentStep.value = 'documentCountry';
      } else if (currentStep.value === 'documentCountry') {
        if (
          activeCheckinPartner.value.birthdate &&
          yearsFrom(activeCheckinPartner.value.birthdate) < 18
        ) {
          currentStep.value = 'relationship';
        } else {
          currentStep.value = 'birthDate';
        }
      } else if (currentStep.value === 'relationship') {
        currentStep.value = 'birthDate';
      } else if (currentStep.value === 'birthDate') {
        if (precheckinInfo.value?.pmsPropertyIsOCRAvailable) {
          currentStep.value = 'entryType';
        } else {
          currentStep.value = 'start';
        }
      } else if (currentStep.value === 'entryType') {
        currentStep.value = 'start';
      } else if (currentStep.value === 'take-photo-front') {
        currentStep.value = 'entryType';
      } else if (currentStep.value === 'confirm-photo-front') {
        currentStep.value = 'take-photo-front';
      } else if (currentStep.value === 'after-confirm-photo-front') {
        currentStep.value = 'confirm-photo-front';
      } else if (currentStep.value === 'take-photo-back') {
        currentStep.value = 'after-confirm-photo-front';
      } else if (currentStep.value === 'confirm-photo-back') {
        currentStep.value = 'take-photo-back';
      } else if (currentStep.value === 'after-confirm-photo-back') {
        currentStep.value = 'confirm-photo-back';
      }
    };

    const continueCheckinFlow = () => {
      currentStepNumber.value += 1;

      if (existingCheckinPartner.value) {
        const {
          birthdate,
          relationship,
          documentLegalRepresentative,
          documentCountryId,
          documentType,
          documentNumber,
          originInputData,
        } = activeCheckinPartner.value;

        activeCheckinPartner.value = {
          ...existingCheckinPartner.value,
          birthdate,
          relationship,
          documentLegalRepresentative,
          documentCountryId,
          documentType,
          documentNumber,
          originInputData,
        };
        // document data
        if (activeCheckinPartner.value.documentCountryId === null) {
          activeCheckinPartner.value.documentCountryId = 0;
        }
        if (activeCheckinPartner.value.documentType === null) {
          activeCheckinPartner.value.documentType = 0;
        }
        if (activeCheckinPartner.value.documentNumber === null) {
          activeCheckinPartner.value.documentNumber = '';
        }
        if (activeCheckinPartner.value.documentSupportNumber === null) {
          activeCheckinPartner.value.documentSupportNumber = '';
        }

        // names
        if (activeCheckinPartner.value.firstname === null) {
          activeCheckinPartner.value.firstname = '';
        }
        if (activeCheckinPartner.value.lastname === null) {
          activeCheckinPartner.value.lastname = '';
        }
        if (activeCheckinPartner.value.lastname2 === null) {
          activeCheckinPartner.value.lastname2 = '';
        }

        // personal info
        if (activeCheckinPartner.value.gender === null) {
          activeCheckinPartner.value.gender = '';
        }

        // residence info
        if (activeCheckinPartner.value.countryId === null) {
          activeCheckinPartner.value.countryId = 0;
        }
        if (activeCheckinPartner.value.residenceStreet === null) {
          activeCheckinPartner.value.residenceStreet = '';
        }
        if (activeCheckinPartner.value.zip === null) {
          activeCheckinPartner.value.zip = '';
        }
        if (activeCheckinPartner.value.residenceCity === null) {
          activeCheckinPartner.value.residenceCity = '';
        }
        if (activeCheckinPartner.value.countryState === null) {
          activeCheckinPartner.value.countryState = 0;
        }
        // nationality
        if (activeCheckinPartner.value.nationality === null) {
          activeCheckinPartner.value.nationality = 0;
        }

        // contact
        if (activeCheckinPartner.value.email === null) {
          activeCheckinPartner.value.email = '';
        }
        if (activeCheckinPartner.value.mobile === null) {
          activeCheckinPartner.value.mobile = '';
        }
      }

      if (existingCheckinPartner.value) {
        nextStepExistingCheckinPartner();
      } else {
        currentStep.value = 'feedback';
      }
    };

    const restartCheckinFlow = () => {
      activeCheckinPartner.value.originInputData = '';
      currentStep.value = 'start';
    };

    const deleteCheckinPartnerValues = () => {
      activeCheckinPartner.value = {
        ...(DEFAULT_CHECKIN_PARTNER_VALUES as CheckinPartnerInterface),
      };
    };

    const setExistingCheckinPartner = (checkinPartner: CheckinPartnerInterface) => {
      existingCheckinPartner.value = checkinPartner;
      if (existingCheckinPartner.value) {
        activeCheckinPartner.value.partnerId = existingCheckinPartner.value.partnerId;
      }
      if (existingCheckinPartner.value && existingCheckinPartner.value.countryId) {
        isResidenceCountryFromExistingCheckinPartner.value = true;
      } else {
        isResidenceCountryFromExistingCheckinPartner.value = false;
      }
    };

    const deleteNextDocNumberStepValues = () => {
      activeCheckinPartner.value = {
        ...(DEFAULT_CHECKIN_PARTNER_VALUES as CheckinPartnerInterface),
        id: activeCheckinPartner.value.id,
        reservationId: activeCheckinPartner.value.reservationId,
        birthdate: activeCheckinPartner.value.birthdate,
        documentType: activeCheckinPartner.value.documentType,
        documentCountryId: activeCheckinPartner.value.documentCountryId,
        documentNumber: activeCheckinPartner.value.documentNumber,
        originInputData: activeCheckinPartner.value.originInputData,
      };
      existingCheckinPartner.value = null;
      void store.dispatch('ocrDocument/resetDocumentData');
    };

    const capturedPhoto = (imageBase64: string, front?: boolean) => {
      if (imageBase64) {
        if (front) {
          documentImageBase64Front.value = imageBase64;
          documentImageBase64Back.value = '';
        } else {
          documentImageBase64Back.value = imageBase64;
        }
        void nextStep();
      }
    };

    const processOCR = async () => {
      try {
        void store.dispatch('layout/showSpinner', true);
        await store.dispatch('ocrDocument/publicProcessDocument', {
          imageBase64Front: documentImageBase64Front.value.split(';base64,')[1],
          imageBase64Back: documentImageBase64Back?.value.split(';base64,')[1],
          token: reservationToken,
          reservationId,
          pmsPropertyId: precheckinInfo.value?.pmsPropertyId,
        });
        // if the ocr process returns an object with all fields as
        //          null, it means that the ocr process failed
        if (
          Object.values(checkinPartnerOcr.value).every(
            (field) => field === null || field === '' || field === 0
          )
        ) {
          dialogService.open({
            header: 'No se ha podido escanear el documento',
            content:
              'Los datos no se pudieron reconocer. Por favor, introduce los datos manualmente.',
            btnAccept: 'Continuar',
          });
        }

        activeCheckinPartner.value = {
          birthdate: checkinPartnerOcr.value.birthdate ?? null,
          countryId: checkinPartnerOcr.value.countryId ?? 0,
          countryState: checkinPartnerOcr.value.countryState ?? 0,
          documentCountryId: checkinPartnerOcr.value.documentCountryId ?? 0,
          documentExpeditionDate: checkinPartnerOcr.value.documentExpeditionDate ?? null,
          documentNumber: checkinPartnerOcr.value.documentNumber ?? '',
          documentSupportNumber: checkinPartnerOcr.value.documentSupportNumber ?? '',
          documentType: checkinPartnerOcr.value.documentType ?? 0,
          email: activeCheckinPartner.value.email ?? '',
          firstname: checkinPartnerOcr.value.firstname ?? '',
          gender: checkinPartnerOcr.value.gender ?? '',
          id: activeCheckinPartner.value.id,
          lastname: checkinPartnerOcr.value.lastname ?? '',
          lastname2: checkinPartnerOcr.value.lastname2 ?? '',
          mobile: activeCheckinPartner.value.mobile ?? '',
          nationality: checkinPartnerOcr.value.nationality ?? 0,
          originInputData: activeCheckinPartner.value.originInputData,
          partnerId: activeCheckinPartner.value.partnerId,
          relationship: activeCheckinPartner.value.relationship,
          reservationId: activeCheckinPartner.value.reservationId,
          residenceCity: checkinPartnerOcr.value.residenceCity ?? '',
          residenceStreet: checkinPartnerOcr.value.residenceStreet ?? '',
          responsibleCheckinPartnerId: activeCheckinPartner.value.responsibleCheckinPartnerId,
          zip: checkinPartnerOcr.value.zip ?? '',
        };
        // /////////////////
        // it the person is under legal age and no adults in the reservation
        if (
          activeCheckinPartner.value.birthdate &&
          yearsFrom(activeCheckinPartner.value.birthdate) < 18
        ) {
          currentStep.value = 'birthDate';
        } else {
          currentStep.value = 'documentCountry';
        }
        currentStepNumber.value += 1;
      } catch (error) {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    onMounted(() => {
      store.state.precheckin.folioPublicInfo?.reservations[0].checkinPartners.forEach((el) => {
        publicCheckinPartners.value.push({
          ...DEFAULT_CHECKIN_PARTNER_VALUES,
          ...el,
        });
      });
    });

    watch(currentStep, () => {
      if (currentStep.value === 'start') {
        deleteCheckinPartnerValues();
        activeCheckinPartner.value.originInputData = '';
        existingCheckinPartner.value = null;
      }
    });

    watch(
      () => activeCheckinPartner.value.countryId,
      async (value) => {
        await store.dispatch('countryStates/fetchCountryStates', value);
      }
    );

    return {
      isStepIncreasing,
      currentStep,
      selectedAdress,
      activeCheckinPartner,
      existingCheckinPartner,
      precheckinInfo,
      NATIONALITY_CODE_SPAIN,
      DOCUMENT_TYPE_DNI,
      DOCUMENT_TYPE_NIE,
      currentIndexCheckin,
      publicCheckinPartners,
      route,
      isAllowedNextStep,
      documentImageBase64Front,
      documentImageBase64Back,
      checkinPartnerOcr,
      currentStepNumber,
      currentProgress,
      reservationToken,
      reservationId,
      yearsFrom,
      deleteNextDocNumberStepValues,
      processOCR,
      capturedPhoto,
      nextStepExistingCheckinPartner,
      setExistingCheckinPartner,
      restartCheckinFlow,
      continueCheckinFlow,
      countryName,
      checkinPartnerAge,
      countryCode,
      documentTypeName,
      checkinMandatoryDataComplete,
      nextStep,
      previousStep,
      nextCheckinPartnerToComplete,
      previousStepExistingCheckinPartner,
    };
  },
});
</script>

<style scoped lang="scss">
$heightStepper: 10px;
$heightGradients: 80px;
.full-screen-stepper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 320px;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);

  .stepper-wrap {
    position: relative;
    height: 100%;
    .progress-bar-content {
      height: $heightStepper;
      background-color: #edf7fc;
      .progress-bar {
        height: 100%;
        background-color: $primary;
        transition: width 0.3s ease-in-out;
      }
    }
    .gradient-top {
      position: absolute;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 1) 0%,
        rgba(255, 255, 255, 0.9) 65%,
        rgba(255, 255, 255, 0.5) 100%
      );
      height: 80px;
      width: calc(100% - #{$scrollbar_width});
      z-index: 3;

      .btn-close {
        position: absolute;
        right: 0;
        height: 28px;
        width: 28px;
        background-color: $primary;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        cursor: pointer;
        border: none;
        margin-right: 1rem;
        margin-top: 1rem;
      }
    }
    .content-step {
      height: calc(100% - #{$heightStepper});
      overflow-y: scroll;
      padding-top: $heightGradients;
      padding-bottom: $heightGradients;
      .checkin-card-flow {
        margin: 0.5rem 0;
      }
    }
    .footer {
      background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 1) 0%,
        rgba(255, 255, 255, 0.9) 65%,
        rgba(255, 255, 255, 0.5) 100%
      );
      position: absolute;
      bottom: 0;
      height: 80px;
      width: calc(100% - #{$scrollbar_width});
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      .icons {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        .icons-wrapper {
          background-color: #f5f5f5;
          border-radius: 30px;
          padding: 0.25rem 1rem;
          display: flex;
          align-items: center;
          .icon-burger {
            margin-right: 5px;
            cursor: pointer;
          }
          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          span {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            margin-left: 3px;
          }
          .icon-checkin {
            cursor: pointer;
          }
          .arrow-next-checkin-partner {
            transform: rotate(-90deg);
            cursor: pointer;
            margin-left: 8px;
          }
        }
      }
      .stepper-arrows {
        display: flex;
        align-items: center;
        margin-left: 5px;
        margin-right: 20px;
        .previous-arrow {
          width: 30px;
          height: 30px;
          cursor: pointer;
          border-radius: 5px 0px 0px 5px;
          background-color: $primary;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 1px;
          border: none;
          .previous {
            transform: rotate(180deg);
            width: 12px;
            height: 12px;
          }
        }
        .next-arrow {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: $primary;
          width: 30px;
          height: 30px;
          border-radius: 0px 5px 5px 0px;
          border: none;
          .next {
            width: 12px;
            height: 12px;
          }
        }
        .disabled {
          cursor: not-allowed !important;
          touch-action: none;
          opacity: 0.3;
        }
      }
    }
  }
  .modal-checkin-data-from-ocr {
    .checkin-modal-header {
      padding-left: 1rem;
    }
  }
}
@media (min-width: 1024px) {
  .full-screen-stepper {
    top: 3%;
    left: 20%;
    height: 94vh;
    width: 60%;
    .stepper-wrap {
      .content-step {
        .checkin-partner-form {
          padding: 0 1rem 0 calc(1rem + 8px);
        }
      }
      .footer {
        .icons {
          .icons-wrapper {
            padding: 0.5rem 1.5rem;
            .icon-burger {
              margin-right: 1rem;
            }
            .arrow-next-checkin-partner {
              margin-left: 5px;
            }
            span {
              margin-left: 10px;
            }
          }
        }
        .stepper-arrows {
          margin-left: 25px;
        }
      }
    }
  }
}
// transitions and other stuff
@keyframes flash {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
.flashing-icon {
  animation: flash 1.5s infinite normal;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s linear;
}
.slide-fade-enter-to {
  transform: translateY(-100%);
}
.slide-fade-leave-from {
  transform: translateY(0);
}
.slide-fade-enter-from {
  transform: translateY(-200%);
}
.slide-fade-leave-to {
  transform: translateY(200%);
}

.slide-fade-decreases-enter-active,
.slide-fade-decreases-leave-active {
  transition: all 0.3s linear;
}
.slide-fade-decreases-enter-to {
  transform: translateY(-100%);
}
.slide-fade-decreases-leave-from {
  transform: translateY(0);
}
.slide-fade-decreases-enter-from {
  transform: translateY(200%);
}
.slide-fade-decreases-leave-to {
  transform: translateY(-200%);
}
</style>
