<template>
  <div class="full-screen-stepper" id="full-screen-stepper">
    <div class="stepper-wrap">
      <div class="progress-bar-content">
        <div class="progress-bar" :style="{ width: `${currentProgress}%` }" />
      </div>
      <div class="gradient-top">
        <button @click="closeCheckinFlow()" class="btn-close" v-if="currentStep !== 'feedback'">
          <img src="/app-images/double-arrow-right-white.svg" />
        </button>
      </div>
      <div class="content-step">
        <TransitionGroup :name="isStepIncreasing ? 'slide-fade' : 'slide-fade-decreases'">
          <CheckinPartnerForm
            v-if="isFormDisplayed"
            :checkinPartner="activeCheckinPartner"
            class="checkin-partner-form"
            @continueCheckinFlowFromForm="continueCheckinFlowFromForm()"
            @moveToSegmentation="closeFormAndMoveToSegmentation($event)"
          />
          <CheckinFlowFingerSign
            v-else-if="isFingerSignDisplayed"
            :checkin="(currentReservation?.checkin as Date)"
            :checkout="(currentReservation?.checkout as Date)"
            :roomTypeName="currentReservation?.roomTypeName ?? ''"
            :cardexWarning="activeProperty?.cardexWarning ?? ''"
            :reservationAmount="currentReservation?.priceTotal ?? 0"
            :reservationReference="currentReservation?.name ?? ''"
            :checkinPartner="activeCheckinPartner"
            :currentIndexCheckin="currentIndexCheckin"
            v-model="activeCheckinPartner.signature"
            @persistCheckinPartner="persistCheckinPartner()"
            @closeFingerSign="closeSignatureStep()"
            :step="currentStepNumber"
          />

          <CheckinFlowStart
            v-else-if="currentStep === 'start'"
            :reservationId="currentReservation?.id ?? 0"
            :propertyName="activeProperty?.name ?? ''"
            :roomTypeName="roomTypeName"
            :partnerName="currentReservation?.partnerName ?? ''"
            :reservationCode="currentReservation?.name ?? ''"
            :nights="currentReservation?.nights ?? 0"
            :checkin="(currentReservation?.checkin as Date)"
            :checkout="(currentReservation?.checkout as Date)"
            :adults="currentReservation?.adults ?? 0"
            :children="currentReservation?.children ?? 0"
            :segmentationId="currentReservation?.segmentationId ?? 0"
            @nextCheckinPartnerToComplete="nextCheckinPartnerToComplete"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :checkinPartners="checkinPartners"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                class="checkin-card-flow"
                v-for="(checkinPartner, index) in checkinPartners.filter(
                  (cp) => cp.checkinPartnerState !== 'dummy'
                )"
                :key="checkinPartner.id"
                :firstname="checkinPartner.firstname"
                :lastname="checkinPartner.lastname"
                :lastname2="checkinPartner.lastname2"
                :countryName="countryName(checkinPartner.nationality)"
                :countryCode="countryCode(checkinPartner.nationality)"
                :age="checkinPartnerAge(checkinPartner.birthdate)"
                :documentTypeName="documentType(checkinPartner.documentType)"
                :documentNumber="checkinPartner.documentNumber"
                :checkinSignature="checkinPartner.signature"
                :checkinPartnerState="checkinPartner.checkinPartnerState"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    checkinPartner,
                    checkinPartner.documentType === DOCUMENT_TYPE_DNI,
                    checkinPartner.documentType === DOCUMENT_TYPE_NIE,
                    checkinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
                :isCheckinToday="isCheckinToday(checkinPartner)"
                :isSegmentation="currentReservation?.segmentationId ? true : false"
                isCollapsible
                @printCheckin="performPrintCheckin(checkinPartner)"
                @viewPDFCheckin="viewCheckinPDF(checkinPartner)"
                @doCheckin="performDoCheckin(checkinPartner)"
                @displayForm="setActiveCheckinPartnerAndDisplayForm(checkinPartner)"
                @selectActiveCheckinPartner="selectActiveCheckinPartner(index)"
                @displayFingerSign="openFingerSign(checkinPartner)"
              />
            </template>
          </CheckinFlowStart>
          <ReservationSegmentation
            v-else-if="currentStep === 'segmentation'"
            :parentName="'CheckinFlow'"
            :checkinPartner="checkinPartnerSegmentation"
            @close="nextStep()"
            @closeAfterDoCheckin="continueCheckinFlow()"
            @setIsAllowedNextStep="setIsAllowedNextStep(true)"
          />
          <CheckinFlowEntryType
            v-else-if="currentStep === 'entryType'"
            v-model="activeCheckinPartner.originInputData"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
            @displayForm="isFormDisplayed = true"
            :isOCRAvailable="activeProperty?.isOCRAvailable"
            showNewFeatureFeedback
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
            @capturedPhoto="capturedPhoto($event)"
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

          <CheckinFlowCustomerSearch
            v-else-if="currentStep === 'customerSearch'"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            :checkinPartnerId="activeCheckinPartner.id"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            @continueCheckinFlow="continueCheckinFlow()"
            @setActiveCheckinPartner="setActiveCheckinPartner($event)"
            @persistExistingCheckinPartner="persistExistingCheckinPartner($event)"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                class="checkin-card-flow"
                :firstname="activeCheckinPartner.firstname"
                :lastname="activeCheckinPartner.lastname"
                :lastname2="activeCheckinPartner.lastname2"
                :countryName="countryName(activeCheckinPartner.nationality)"
                :countryCode="countryCode(activeCheckinPartner.nationality)"
                :age="checkinPartnerAge(activeCheckinPartner.birthdate)"
                :documentTypeName="documentType(activeCheckinPartner.documentType)"
                :documentNumber="activeCheckinPartner.documentNumber"
                :checkinSignature="activeCheckinPartner.signature"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    activeCheckinPartner,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_NIE,
                    activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
                :isCheckinToday="isCheckinToday(activeCheckinPartner)"
                :isSegmentation="currentReservation?.segmentationId ? true : false"
                @printCheckin="performPrintCheckin(activeCheckinPartner)"
                @viewPDFCheckin="viewCheckinPDF(activeCheckinPartner)"
                @doCheckin="performDoCheckin(activeCheckinPartner)"
                @displayForm="setActiveCheckinPartnerAndDisplayForm(activeCheckinPartner)"
                @displayFingerSign="openFingerSign(activeCheckinPartner)"
              />
            </template>
          </CheckinFlowCustomerSearch>

          <CheckinFlowBirthdate
            v-else-if="currentStep === 'birthDate' && activeCheckinPartner"
            v-model="activeCheckinPartner.birthdate"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
          />

          <CheckinFlowRelationship
            v-else-if="currentStep === 'relationship' && activeCheckinPartner"
            v-model:relationship="activeCheckinPartner.relationship"
            v-model:documentLegalRepresentative="activeCheckinPartner.documentLegalRepresentative"
            v-model:responsibleCheckinPartnerId="activeCheckinPartner.responsibleCheckinPartnerId"
            :currentIndexCheckin="currentIndexCheckin"
            :step="currentStepNumber"
            @setIsAllowedNextStep="isAllowedNextStep = $event"
            @next="nextStep()"
          />

          <CheckinFlowCountry
            v-else-if="
              currentStep === 'documentCountry' &&
              activeCheckinPartner &&
              activeCheckinPartner.birthdate
            "
            v-model="activeCheckinPartner.documentCountryId"
            :isUnderFourteen="yearsFrom(activeCheckinPartner.birthdate) <= 14"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            title="País de origen del documento"
            subtitle="Selecciona el país del documento del huésped"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            @noDocumentSelected="activeCheckinPartner.documentType = 0"
            :step="currentStepNumber"
          />

          <CheckinFlowDocumentType
            v-else-if="currentStep === 'documentType' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentType"
            :documentCountryId="activeCheckinPartner.documentCountryId"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="3"
          />

          <CheckinFlowDocumentNumber
            v-else-if="currentStep === 'documentNumber' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentNumber"
            :documentType="activeCheckinPartner.documentType"
            :documentCountryId="activeCheckinPartner.documentCountryId"
            :currentIndexCheckin="currentIndexCheckin"
            :checkinPartnerId="activeCheckinPartner.id"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            @continueCheckinFlow="continueCheckinFlow()"
            @persistCheckinPartner="persistCheckinPartner"
            @setActiveCheckinPartner="setActiveCheckinPartner($event)"
            @persistExistingCheckinPartner="persistExistingCheckinPartner($event)"
            @clearExistingCheckinPartner="deleteNextDocNumberStepValues()"
            :step="currentStepNumber"
            :checkinPartners="checkinPartners"
            :reservationId="currentReservation?.id ?? 0"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                class="checkin-card-flow"
                :firstname="activeCheckinPartner.firstname"
                :lastname="activeCheckinPartner.lastname"
                :lastname2="activeCheckinPartner.lastname2"
                :countryName="countryName(activeCheckinPartner.nationality)"
                :countryCode="countryCode(activeCheckinPartner.nationality)"
                :age="checkinPartnerAge(activeCheckinPartner.birthdate)"
                :documentTypeName="documentType(activeCheckinPartner.documentType)"
                :documentNumber="activeCheckinPartner.documentNumber"
                :checkinSignature="activeCheckinPartner.signature"
                :checkinPartnerState="activeCheckinPartner.checkinPartnerState"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    activeCheckinPartner,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_NIE,
                    activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
                :isCheckinToday="isCheckinToday(activeCheckinPartner)"
                :isSegmentation="currentReservation?.segmentationId ? true : false"
                @printCheckin="performPrintCheckin(activeCheckinPartner)"
                @viewPDFCheckin="viewCheckinPDF(activeCheckinPartner)"
                @doCheckin="performDoCheckin(activeCheckinPartner)"
                @displayForm="setActiveCheckinPartnerAndDisplayForm(activeCheckinPartner)"
                @displayFingerSign="openFingerSign(activeCheckinPartner)"
              />
            </template>
          </CheckinFlowDocumentNumber>

          <CheckinFlowDocumentExpeditionDate
            v-else-if="currentStep === 'documentExpeditionDate' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentExpeditionDate"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
          />

          <CheckinFlowDocumentSupportNumber
            v-else-if="currentStep === 'documentSupportNumber' && activeCheckinPartner"
            v-model="activeCheckinPartner.documentSupportNumber"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
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
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
          />

          <CheckinFlowCountry
            v-else-if="currentStep === 'nationality' && activeCheckinPartner"
            isNationality
            :isUnderFourteen="
              (activeCheckinPartner.birthdate || false) &&
              yearsFrom(activeCheckinPartner.birthdate) <= 14
            "
            :isNotDocumentCountry="activeCheckinPartner.documentCountryId === -1"
            v-model="activeCheckinPartner.nationality"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
          />

          <CheckinFlowGender
            v-else-if="currentStep === 'gender' && activeCheckinPartner"
            v-model="activeCheckinPartner.gender"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            @persistCheckinPartner="persistCheckinPartner"
            :step="currentStepNumber"
          />

          <CheckinFlowAddressOptions
            v-else-if="currentStep === 'addressOptions' && activeCheckinPartner"
            v-model="selectedAdress"
            v-model:zip="activeCheckinPartner.zip"
            v-model:city="activeCheckinPartner.residenceCity"
            v-model:countryState="activeCheckinPartner.countryState"
            v-model:countryId="activeCheckinPartner.countryId"
            v-model:street="activeCheckinPartner.residenceStreet"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            :checkinPartners="checkinPartners"
          />

          <CheckinFlowCountry
            v-else-if="currentStep === 'residenceCountry' && activeCheckinPartner"
            v-model="activeCheckinPartner.countryId"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            title="País de residencia"
            subtitle="Selecciona el país de residencia del huésped"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
          />

          <CheckinFlowStreet
            v-else-if="currentStep === 'street' && activeCheckinPartner"
            v-model="activeCheckinPartner.residenceStreet"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
          />

          <CheckinFlowAddress
            v-else-if="currentStep === 'address' && activeCheckinPartner"
            v-model:residenceZip="activeCheckinPartner.zip"
            v-model:residenceCity="activeCheckinPartner.residenceCity"
            v-model:residenceStateId="activeCheckinPartner.countryState"
            :countryId="activeCheckinPartner.countryId"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :isSpanishGuest="activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
          />

          <CheckinFlowContact
            v-else-if="currentStep === 'contact' && activeCheckinPartner"
            v-model:guestMail="activeCheckinPartner.email"
            v-model:guestPhone="activeCheckinPartner.mobile"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            @setIsAllowedNextStep="setIsAllowedNextStep($event)"
            :step="currentStepNumber"
            @persistCheckinPartner="persistCheckinPartner"
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
            :isSegmented="currentReservation?.segmentationId ? true : false"
            :nationality="activeCheckinPartner.nationality"
            :currentIndexCheckin="currentIndexCheckin"
            :checkinPartnerActive="activeCheckinPartner"
            @closeCheckinFlow="closeCheckinFlow()"
            @continueCheckinFlow="continueCheckinFlow()"
            :step="currentStepNumber"
          >
            <template #checkin-flow-card>
              <CheckinCardFlow
                class="checkin-card-flow"
                :firstname="activeCheckinPartner.firstname"
                :lastname="activeCheckinPartner.lastname"
                :lastname2="activeCheckinPartner.lastname2"
                :countryName="countryName(activeCheckinPartner.nationality)"
                :countryCode="countryCode(activeCheckinPartner.nationality)"
                :age="checkinPartnerAge(activeCheckinPartner.birthdate)"
                :documentTypeName="documentType(activeCheckinPartner.documentType)"
                :documentNumber="activeCheckinPartner.documentNumber"
                :checkinSignature="activeCheckinPartner.signature"
                :isExistingCheckinPartnerMandatoryDataComplete="
                  checkinMandatoryDataComplete(
                    activeCheckinPartner,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_DNI,
                    activeCheckinPartner.documentType === DOCUMENT_TYPE_NIE,
                    activeCheckinPartner.countryId === NATIONALITY_CODE_SPAIN
                  )
                "
                :isCheckinToday="isCheckinToday(activeCheckinPartner)"
                :isSegmentation="currentReservation?.segmentationId ? true : false"
                @printCheckin="performPrintCheckin(activeCheckinPartner)"
                @viewPDFCheckin="viewCheckinPDF(activeCheckinPartner)"
                @doCheckin="performDoCheckin(activeCheckinPartner)"
                @displayForm="isFormDisplayed = true"
                @displayFingerSign="openFingerSign(activeCheckinPartner)"
              />
            </template>
          </CheckinFlowSummary>

          <CheckinFlowFeedback
            v-else-if="currentStep === 'feedback'"
            :checkinPartners="checkinPartners"
            :numCheckinPartners="checkinPartners.length"
            @next="nextStep()"
            @closeCheckinFlow="closeCheckinFlow()"
            :currentIndexCheckin="currentIndexCheckin"
            :currentCheckinName="`${activeCheckinPartner.firstname} ${
              activeCheckinPartner.lastname
            } ${activeCheckinPartner.lastname2 ? activeCheckinPartner.lastname2 : ''}`"
          />
        </TransitionGroup>
      </div>
      <CheckinFlowStepper
        :currentStep="currentStep"
        :checkinPartners="checkinPartners"
        :activeCheckinPartnerId="activeCheckinPartner.id"
        :isFormDisplayed="isFormDisplayed"
        :isFingerSignDisplayed="isFingerSignDisplayed"
        :isAllowedNextStep="isAllowedNextStep"
        @restartCheckinFlow="restartCheckinFlow()"
        @setActiveCheckinPartnerByIndex="setActiveCheckinPartnerByIndex($event)"
        @nextCheckinPartner="nextCheckinPartner()"
        @previous="previousStep()"
        @next="nextStep()"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, type Ref, watch } from 'vue';
import { type CheckinPartnerInterface } from '@/interfaces/CheckinPartnerInterface';

import CheckinPartnerForm from '@/components/checkinPartners/CheckinPartnerForm.vue';
import CheckinFlowStart from '@/components/checkinFlow/CheckinFlowStart.vue';
import ReservationSegmentation from '@/components/reservations/ReservationSegmentation.vue';
import CheckinFlowEntryType from '@/components/checkinFlow//CheckinFlowEntryType.vue';
import CheckinFlowPhotoTake from '@/components/checkinFlow/CheckinFlowPhotoTake.vue';
import CheckinFlowPhotoConfirm from '@/components/checkinFlow/CheckinFlowPhotoConfirm.vue';
import CheckinFlowPhotoComplete from '@/components/checkinFlow/CheckinFlowPhotoComplete.vue';
import CheckinFlowCustomerSearch from '@/components/checkinFlow/CheckinFlowCustomerSearch.vue';
import CheckinFlowCountry from '@/components/checkinFlow/CheckinFlowCountry.vue';
import CheckinFlowDocumentType from '@/components/checkinFlow/CheckinFlowDocumentType.vue';
import CheckinFlowDocumentNumber from '@/components/checkinFlow/CheckinFlowDocumentNumber.vue';
import CheckinFlowDocumentExpeditionDate from '@/components/checkinFlow/CheckinFlowDocumentExpeditionDate.vue';
import CheckinFlowDocumentSupportNumber from '@/components/checkinFlow/CheckinFlowDocumentSupportNumber.vue';
import CheckinFlowName from '@/components/checkinFlow/CheckinFlowName.vue';
import CheckinFlowBirthdate from '@/components/checkinFlow/CheckinFlowBirthdate.vue';
import CheckinFlowRelationship from '@/components/checkinFlow/CheckinFlowRelationship.vue';
import CheckinFlowGender from '@/components/checkinFlow/CheckinFlowGender.vue';
import CheckinFlowStreet from '@/components/checkinFlow/CheckinFlowStreet.vue';
import CheckinFlowAddress from '@/components/checkinFlow/CheckinFlowAddress.vue';
import CheckinFlowContact from '@/components/checkinFlow/CheckinFlowContact.vue';
import CheckinFlowAddressOptions from '@/components/checkinFlow/CheckinFlowAddressOptions.vue';
import CheckinFlowSummary from '@/components/checkinFlow/CheckinFlowSummary.vue';
import CheckinFlowFeedback from '@/components/checkinFlow/CheckinFlowFeedback.vue';
import CheckinCardFlow from '@/components/checkinFlow/CheckinCardFlow.vue';
import CheckinFlowFingerSign from '@/components/checkinFlow/CheckinFlowFingerSign.vue';
import CheckinFlowStepper from '@/components/checkinFlow/CheckinFlowStepper.vue';
import { useCheckinPartner, DEFAULT_CHECKIN_PARTNER_VALUES } from '@/utils/useCheckinPartner';

import { useStore } from '@/store';
import utilsDates from '@/utils/dates';
import { dialogService } from '@/services/DialogService';

type TypeStep =
  | 'start'
  | 'segmentation'
  | 'entryType'
  | 'take-photo-front'
  | 'confirm-photo-front'
  | 'after-confirm-photo-front'
  | 'take-photo-back'
  | 'confirm-photo-back'
  | 'after-confirm-photo-back'
  | 'customerSearch'
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
  | 'addressOptions'
  | 'residenceCountry'
  | 'street'
  | 'address'
  | 'contact'
  | 'summaryCurrentCheckinPartner'
  | 'feedback';

export default defineComponent({
  components: {
    CheckinFlowStart,
    ReservationSegmentation,
    CheckinFlowEntryType,
    CheckinFlowPhotoTake,
    CheckinFlowPhotoConfirm,
    CheckinFlowPhotoComplete,
    CheckinFlowCustomerSearch,
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
    CheckinFlowAddressOptions,
    CheckinFlowSummary,
    CheckinFlowFeedback,
    CheckinPartnerForm,
    CheckinCardFlow,
    CheckinFlowFingerSign,
    CheckinFlowStepper,
  },

  setup(props, context) {
    const store = useStore();
    const { yearsFrom } = utilsDates;

    const currentStepNumber = ref(1);

    // constant for country spain
    const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find(
      (el) => el.code === 'ES'
    )?.id;

    // constant for document type DNI
    const DOCUMENT_TYPE_DNI = store.state.documentType.documentType.find(
      (el) => el.code === 'D'
    )?.id;

    // constant for document type NIE
    const DOCUMENT_TYPE_NIE = store.state.documentType.documentType.find(
      (el) => el.code === 'N'
    )?.id;

    // checkin partner common methods
    const { saveCheckinPartner, printCheckin, doCheckin, checkinMandatoryDataComplete, viewCheckinPDF } =
      useCheckinPartner();

    // used for animation
    const isStepIncreasing = ref(true);

    // used for select previous address in other checkin partner
    const selectedAdress = ref(0);

    // read in stepper and set in every step
    const isAllowedNextStep = ref(false);

    // current step
    const currentStep: Ref<TypeStep> = ref('start');

    // used for display form
    const isFormDisplayed = ref(false);

    // used for display finger sign
    const isFingerSignDisplayed = ref(false);

    // checkin partner segmentation
    const checkinPartnerSegmentation: Ref<CheckinPartnerInterface | null> = ref(null);

    // scanned document images
    const documentImageBase64Front = ref('');
    const documentImageBase64Back = ref('');

    // active checkin partner
    const activeCheckinPartner: Ref<CheckinPartnerInterface> = ref({
      ...(DEFAULT_CHECKIN_PARTNER_VALUES as CheckinPartnerInterface),
    });

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const checkinPartnerOcr = computed(() => store.state.ocrDocument.documentData);

    const currentIndexCheckin = computed(() => {
      const index = store.state.checkinPartners.checkinpartners.findIndex(
        (el) => el.id === activeCheckinPartner.value.id
      );
      return index;
    });

    // There may be certain fields missing in checkin partner state
    const checkinPartners = computed(() =>
      store.state.checkinPartners.checkinpartners.map((cp) => ({
        ...cp,
        birthdate: cp.birthdate ?? null,
        countryId: cp.countryId ?? 0,
        countryState: cp.countryState ?? 0,
        documentCountryId: cp.documentCountryId ?? 0,
        documentExpeditionDate: cp.documentExpeditionDate ?? null,
        documentLegalRepresentative: cp.documentLegalRepresentative ?? '',
        documentNumber: cp.documentNumber ?? '',
        documentSupportNumber: cp.documentSupportNumber ?? '',
        documentType: cp.documentType ?? 0,
        email: cp.email ?? '',
        firstname: cp.firstname ?? '',
        gender: cp.gender ?? '',
        lastname: cp.lastname ?? '',
        lastname2: cp.lastname2 ?? '',
        mobile: cp.mobile ?? '',
        nationality: cp.nationality ?? 0,
        originInputData: cp.originInputData ?? '',
        relationship: cp.relationship ?? '',
        residenceCity: cp.residenceCity ?? '',
        residenceStreet: cp.residenceStreet ?? '',
        responsibleCheckinPartnerId: cp.responsibleCheckinPartnerId ?? 0,
        signature: cp.signature ?? '',
        zip: cp.zip ?? '',
      }))
    );

    const roomTypeName = computed(() => {
      let result = '';
      if (currentReservation.value?.roomTypeId) {
        result =
          store.state.roomTypes.roomTypes.find(
            (rt) => rt.id === currentReservation.value?.roomTypeId
          )?.name ?? '';
      }
      return result;
    });

    const currentProgress = computed(() => {
      if (currentStep.value === 'entryType') {
        return 5;
      }
      if (currentStep.value === 'birthDate') {
        return 7;
      }
      if (currentStep.value === 'relationship') {
        return 9;
      }
      if (currentStep.value === 'documentCountry') {
        return 10;
      }
      if (currentStep.value === 'documentType') {
        return 15;
      }
      if (currentStep.value === 'take-photo-front') {
        return 20;
      }
      if (currentStep.value === 'confirm-photo-front') {
        return 22;
      }
      if (currentStep.value === 'after-confirm-photo-front') {
        return 24;
      }
      if (currentStep.value === 'take-photo-back') {
        return 26;
      }
      if (currentStep.value === 'confirm-photo-back') {
        return 28;
      }
      if (currentStep.value === 'after-confirm-photo-back') {
        return 30;
      }
      if (currentStep.value === 'documentNumber') {
        return 35;
      }
      if (currentStep.value === 'documentExpeditionDate') {
        return 40;
      }
      if (currentStep.value === 'documentSupportNumber') {
        return 45;
      }
      if (currentStep.value === 'name') {
        return 50;
      }
      if (currentStep.value === 'nationality') {
        return 55;
      }
      if (currentStep.value === 'gender') {
        return 65;
      }
      if (currentStep.value === 'customerSearch') {
        return 70;
      }
      if (currentStep.value === 'addressOptions') {
        return 75;
      }
      if (currentStep.value === 'residenceCountry') {
        return 80;
      }
      if (currentStep.value === 'street') {
        return 85;
      }
      if (currentStep.value === 'address') {
        return 90;
      }
      if (currentStep.value === 'contact') {
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
      void store.dispatch('ocrDocument/resetDocumentData');
    };

    const setIsAllowedNextStep = (allowed: boolean) => {
      isAllowedNextStep.value = allowed;
    };

    const nextCheckinPartner = () => {
      if (isFormDisplayed.value) {
        isFormDisplayed.value = false;
      }
      if (isFingerSignDisplayed.value) {
        isFingerSignDisplayed.value = false;
      }
      let currentIndex = checkinPartners.value.findIndex(
        (el) => el.id === activeCheckinPartner.value.id
      );
      if (currentIndex !== -1) {
        currentIndex += 1;
        activeCheckinPartner.value =
          checkinPartners.value[currentIndex % checkinPartners.value.length];
        if (
          activeCheckinPartner.value.checkinPartnerState === 'draft' ||
          activeCheckinPartner.value.checkinPartnerState === 'dummy'
        ) {
          if (
            !currentReservation.value?.segmentationId &&
            store.state.categories.categories.length > 0
          ) {
            currentStep.value = 'segmentation';
          } else {
            currentStep.value = 'entryType';
          }
        } else {
          currentStep.value = 'summaryCurrentCheckinPartner';
        }
      }
    };

    const nextCheckinPartnerToComplete = () => {
      currentStepNumber.value = 1;

      // active partner index
      const index = checkinPartners.value.findIndex(
        (el) => el.id === activeCheckinPartner.value.id
      );

      // next dummy with greater index
      let nextActiveCheckinPartner = checkinPartners.value.find(
        (value, i) => value.checkinPartnerState === 'dummy' && i > index
      );

      // next draft with greater index
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = checkinPartners.value.find(
          (value, i) => value.checkinPartnerState === 'draft' && i > index
        );
      }

      // next dummy
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = checkinPartners.value.find(
          (value) => value.checkinPartnerState === 'dummy'
        );
      }

      // next draft
      if (!nextActiveCheckinPartner) {
        nextActiveCheckinPartner = checkinPartners.value.find(
          (value) => value.checkinPartnerState === 'draft'
        );
      }

      // if next dummy partner set it as active
      if (nextActiveCheckinPartner) {
        activeCheckinPartner.value = nextActiveCheckinPartner;
      }
      // before asking for checkin partners data, if not is set, ask for segmentation
      if (
        !currentReservation.value?.segmentationId &&
        store.state.categories.categories.length > 0
      ) {
        currentStep.value = 'segmentation';
      } else {
        currentStep.value = 'entryType';
      }
    };

    const restartCheckinFlow = () => {
      if (isFormDisplayed.value) {
        isFormDisplayed.value = false;
      }
      if (isFingerSignDisplayed.value) {
        isFingerSignDisplayed.value = false;
      }
      activeCheckinPartner.value.originInputData = '';
      currentStep.value = 'start';
    };

    const setActiveCheckinPartnerByIndex = (index: number) => {
      if (isFormDisplayed.value) {
        isFormDisplayed.value = false;
      }
      if (isFingerSignDisplayed.value) {
        isFingerSignDisplayed.value = false;
      }
      activeCheckinPartner.value = checkinPartners.value[index];

      if (
        activeCheckinPartner.value.checkinPartnerState === 'draft' ||
        activeCheckinPartner.value.checkinPartnerState === 'dummy'
      ) {
        if (
          !currentReservation.value?.segmentationId &&
          store.state.categories.categories.length > 0
        ) {
          currentStep.value = 'segmentation';
        } else {
          currentStep.value = 'entryType';
        }
      } else {
        currentStep.value = 'summaryCurrentCheckinPartner';
      }
    };

    const nextStep = () => {
      if (currentStep.value !== 'summaryCurrentCheckinPartner') {
        currentStepNumber.value += 1;
      }
      if (
        currentStep.value === 'start' &&
        !currentReservation.value?.segmentationId &&
        store.state.categories.categories.length > 0
      ) {
        currentStep.value = 'segmentation';
      } else if (
        (currentStep.value === 'start' &&
          currentReservation.value?.segmentationId &&
          store.state.categories.categories.length > 0) ||
        currentStep.value === 'segmentation'
      ) {
        currentStep.value = 'entryType';
      } else if (currentStep.value === 'entryType') {
        if (activeCheckinPartner.value.originInputData === 'ocr') {
          currentStep.value = 'take-photo-front';
        } else if (activeCheckinPartner.value.originInputData === 'form') {
          isFormDisplayed.value = true;
        } else if (activeCheckinPartner.value.originInputData === 'wizard') {
          currentStep.value = 'birthDate';
        } else if (activeCheckinPartner.value.originInputData === 'regular_customer') {
          currentStep.value = 'customerSearch';
        }
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
      } else if (currentStep.value === 'customerSearch') {
        currentStep.value = 'summaryCurrentCheckinPartner';
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
        const someAddressExists = store.state.checkinPartners.checkinpartners.find(
          (el) =>
            el.countryId && el.residenceStreet && el.zip && el.residenceCity && el.countryState
        );
        if (someAddressExists) {
          currentStep.value = 'addressOptions';
        } else {
          currentStep.value = 'residenceCountry';
        }
      } else if (currentStep.value === 'addressOptions') {
        if (activeCheckinPartner.value.zip && activeCheckinPartner.value.residenceCity) {
          currentStep.value = 'contact';
        } else {
          currentStep.value = 'residenceCountry';
        }
      } else if (currentStep.value === 'residenceCountry') {
        currentStep.value = 'street';
      } else if (currentStep.value === 'street') {
        currentStep.value = 'address';
      } else if (currentStep.value === 'address') {
        currentStep.value = 'contact';
      } else if (currentStep.value === 'contact') {
        currentStep.value = 'summaryCurrentCheckinPartner';
      } else if (currentStep.value === 'summaryCurrentCheckinPartner') {
        currentStep.value = 'feedback';
      } else if (currentStep.value === 'feedback') {
        const numCheckinPartnersDraftOrPrecheckin = checkinPartners.value.filter(
          (cp) => cp.checkinPartnerState === 'dummy' || cp.checkinPartnerState === 'draft'
        ).length;
        if (numCheckinPartnersDraftOrPrecheckin > 0) {
          nextCheckinPartnerToComplete();
        } else {
          currentStep.value = 'start';
        }
      }
    };

    const previousStep = () => {
      currentStepNumber.value -= 1;
      if (isFormDisplayed.value) {
        isFormDisplayed.value = false;
      } else if (isFingerSignDisplayed.value) {
        isFingerSignDisplayed.value = false;
      } else if (currentStep.value === 'summaryCurrentCheckinPartner') {
        currentStep.value = 'contact';
      } else if (currentStep.value === 'contact') {
        currentStep.value = 'address';
      } else if (currentStep.value === 'address') {
        currentStep.value = 'street';
      } else if (currentStep.value === 'street') {
        currentStep.value = 'residenceCountry';
      } else if (currentStep.value === 'residenceCountry') {
        const someAddressExists = store.state.checkinPartners.checkinpartners.find(
          (el) =>
            el.countryId && el.residenceStreet && el.zip && el.residenceCity && el.countryState
        );
        if (someAddressExists) {
          currentStep.value = 'addressOptions';
        } else {
          currentStep.value = 'gender';
        }
      } else if (currentStep.value === 'addressOptions') {
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
      } else if (currentStep.value === 'customerSearch') {
        currentStep.value = 'entryType';
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
        currentStep.value = 'entryType';
      } else if (currentStep.value === 'entryType') {
        if (
          !currentReservation.value?.segmentationId &&
          store.state.categories.categories.length > 0
        ) {
          currentStep.value = 'segmentation';
        } else {
          currentStep.value = 'start';
        }
      } else if (currentStep.value === 'segmentation') {
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

    // used in start slot
    const selectActiveCheckinPartner = (index: number) => {
      activeCheckinPartner.value = checkinPartners.value[index];
      if (
        !currentReservation.value?.segmentationId &&
        store.state.categories.categories.length > 0
      ) {
        currentStep.value = 'segmentation';
      } else {
        currentStep.value = 'entryType';
      }
    };

    const continueCheckinFlow = () => {
      if (isFormDisplayed.value) {
        isFormDisplayed.value = false;
      }
      currentStep.value = 'feedback';
    };

    // used in form
    const continueCheckinFlowFromForm = () => {
      continueCheckinFlow();
      documentImageBase64Back.value = '';
      documentImageBase64Front.value = '';
    };

    const setActiveCheckinPartner = (checkinPartner: CheckinPartnerInterface) => {
      const { relationship, responsibleCheckinPartnerId, originInputData } =
        activeCheckinPartner.value;

      activeCheckinPartner.value = {
        ...checkinPartner,
        relationship,
        responsibleCheckinPartnerId,
        originInputData,
      };
    };

    const setActiveCheckinPartnerAndDisplayForm = (checkinPartner: CheckinPartnerInterface) => {
      activeCheckinPartner.value = checkinPartner;
      isFormDisplayed.value = true;
    };

    const closeFormAndMoveToSegmentation = (checkinPartner: CheckinPartnerInterface) => {
      checkinPartnerSegmentation.value = checkinPartner;
      isFormDisplayed.value = false;
      currentStep.value = 'segmentation';
    };

    const closeCheckinFlow = () => {
      context.emit('closeCheckinFlow');
    };

    const persistCheckinPartner = async () => {
      await saveCheckinPartner(activeCheckinPartner.value);
    };

    const persistExistingCheckinPartner = async (checkinPartner: CheckinPartnerInterface) => {
      const {
        birthdate,
        relationship,
        responsibleCheckinPartnerId,
        documentCountryId,
        documentType,
        documentNumber,
        originInputData,
      } = activeCheckinPartner.value;

      activeCheckinPartner.value = {
        ...checkinPartner,
        birthdate,
        relationship,
        responsibleCheckinPartnerId,
        documentCountryId,
        documentType,
        documentNumber,
        originInputData,
      };
      await saveCheckinPartner(activeCheckinPartner.value);
    };

    const performPrintCheckin = async (checkinPartner: CheckinPartnerInterface) => {
      await printCheckin(checkinPartner);
    };

    const performDoCheckin = async (checkinPartner: CheckinPartnerInterface) => {
      if (
        !currentReservation.value?.segmentationId &&
        store.state.categories.categories.length > 0
      ) {
        checkinPartnerSegmentation.value = checkinPartner;
        currentStep.value = 'segmentation';
      } else {
        await doCheckin(checkinPartner);
        if (currentStep.value !== 'start') {
          continueCheckinFlow();
        }
      }
    };

    const openFingerSign = (checkinPartner: CheckinPartnerInterface) => {
      activeCheckinPartner.value = checkinPartner;
      isFingerSignDisplayed.value = true;
    };

    const countryCode = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    const checkinPartnerAge = (partnerBirthDate: Date | null) => {
      let age = 0;

      if (partnerBirthDate) {
        const today = new Date();
        age = today.getFullYear() - partnerBirthDate.getFullYear();
        const m = today.getMonth() - partnerBirthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < partnerBirthDate.getDate())) {
          age -= 1;
        }
      }

      return age;
    };
    const documentType = (documentTypeId: number) =>
      store.state.documentType.documentType.find((el) => el.id === documentTypeId)?.documentType;

    const countryName = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.name;

    const closeSignatureStep = () => {
      isFingerSignDisplayed.value = false;
      if (currentStep.value !== 'start') {
        currentStep.value = 'summaryCurrentCheckinPartner';
      }
    };

    const isCheckinToday = (checkinPartner: CheckinPartnerInterface) => {
      const today = new Date();
      const checkinDate = new Date(currentReservation.value?.checkin ?? '');
      const isCheckinDateToday =
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear();
      const isCheckinDateBeforeToday = checkinDate < today;
      if (
        (isCheckinDateToday || isCheckinDateBeforeToday) &&
        checkinPartner.checkinPartnerState !== 'onboard' &&
        checkinPartner.checkinPartnerState !== 'done'
      ) {
        return true;
      }
      return false;
    };

    const capturedPhoto = (imageBase64: string, front?: boolean) => {
      if (imageBase64) {
        if (front) {
          documentImageBase64Front.value = imageBase64;
          documentImageBase64Back.value = '';
        } else {
          documentImageBase64Back.value = imageBase64;
        }
        nextStep();
      }
    };

    const processOCR = async () => {
      try {
        void store.dispatch('layout/showSpinner', true);
        await store.dispatch('ocrDocument/processDocument', {
          imageBase64Front: documentImageBase64Front.value.split(';base64,')[1],
          imageBase64Back: documentImageBase64Back?.value.split(';base64,')[1],
          pmsPropertyId: store.state.properties.activeProperty?.id,
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
        const checkinPartner = {
          ...checkinPartnerOcr.value,
          reservationId: currentReservation.value?.id,
          id: activeCheckinPartner.value.id,
          originInputData: activeCheckinPartner.value.originInputData,
        };
        setActiveCheckinPartnerAndDisplayForm(checkinPartner as CheckinPartnerInterface);
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

    watch([currentStep, isFormDisplayed, isFingerSignDisplayed], () => {
      if (currentStep.value === 'start' && !isFormDisplayed.value && !isFingerSignDisplayed.value) {
        activeCheckinPartner.value = {
          ...(DEFAULT_CHECKIN_PARTNER_VALUES as CheckinPartnerInterface),
        };
      }
    });

    return {
      NATIONALITY_CODE_SPAIN,
      DOCUMENT_TYPE_DNI,
      DOCUMENT_TYPE_NIE,
      checkinPartnerSegmentation,
      currentStep,
      checkinPartners,
      activeCheckinPartner,
      currentReservation,
      isStepIncreasing,
      isAllowedNextStep,
      activeProperty,
      currentIndexCheckin,
      selectedAdress,
      currentProgress,
      checkinPartnerOcr,
      roomTypeName,
      isFormDisplayed,
      documentImageBase64Front,
      documentImageBase64Back,
      isFingerSignDisplayed,
      currentStepNumber,
      yearsFrom,
      deleteNextDocNumberStepValues,
      closeSignatureStep,
      restartCheckinFlow,
      setActiveCheckinPartnerByIndex,
      nextCheckinPartner,
      selectActiveCheckinPartner,
      setIsAllowedNextStep,
      previousStep,
      nextStep,
      continueCheckinFlow,
      continueCheckinFlowFromForm,
      closeCheckinFlow,
      nextCheckinPartnerToComplete,
      persistCheckinPartner,
      persistExistingCheckinPartner,
      countryCode,
      checkinPartnerAge,
      documentType,
      countryName,
      isCheckinToday,
      performPrintCheckin,
      performDoCheckin,
      setActiveCheckinPartner,
      setActiveCheckinPartnerAndDisplayForm,
      closeFormAndMoveToSegmentation,
      checkinMandatoryDataComplete,
      capturedPhoto,
      processOCR,
      openFingerSign,
      viewCheckinPDF,
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
