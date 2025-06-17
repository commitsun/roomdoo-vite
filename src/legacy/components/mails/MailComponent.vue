<template>
  <div class="main-content">
    <div class="first">
      <div class="label">Asunto</div>
      <InputText v-model="subject" size="small" />
    </div>

    <div class="second">
      <div class="add-mail-fields">
        <div class="input-and-label">
          <div class="label">Añadir destinatario/s</div>
          <AutocompleteComponent
            class="autocomplete"
            v-model="selectedPartnerId"
            :items="itemsAutocompleteCustomer"
            :placeholderValue="'Busqueda por DNI, NIF, Email...'"
            :placeholderShowingOptions="'Busqueda por DNI, NIF, Email...'"
            :keepResultAfterChoose="false"
            :emptyResultsAfterClick="true"
            @textSearchChanges="getGuestFromVatDocNumber($event)"
            @addNew="openPartnerForm(0)"
            @keypress.enter="addMailAddressToMails($event.target.value)"
          >
            <template #icon>
              <img src="/app-images/search.svg" />
            </template>
          </AutocompleteComponent>
        </div>
        <AppButton
          icon="pi pi-plus"
          class="btn"
          @click="addMailAddressToMails(emailToAdd)"
          size="small"
          v-if="showBtnToAddEmail && !v.$invalid && emailToAdd !== ''"
        />
      </div>
    </div>
    <div class="third">
      <div class="label" v-if="partners.length > 0 || emails.length > 0">Destinatario/s</div>
      <div class="partners" v-if="partners.length > 0 || emails.length > 0">
        <div class="partner" v-for="email in emails" :key="email">
          <div class="partner-email">
            <span class="email" v-if="email">
              {{ email }}
            </span>
          </div>
          <CustomIcon
            imagePath="/app-images/icon-delete.svg"
            width="20px"
            height="20px"
            class="delete"
            color="black"
            colorHover="primary"
            @click="removeEmail(email)"
          />
        </div>

        <div class="partner" v-for="partner in partners" :key="partner.id">
          <div class="partner-email">
            <span class="email" v-if="partner.email">
              {{ partner?.email }}
            </span>
            <span class="add-email-address" v-else @click="openPartnerForm(partner.id)">
              Añadir dirección de correo
            </span>
            <span class="name"> [{{ partner?.name }}] </span>
          </div>
          <CustomIcon
            imagePath="/app-images/icon-delete.svg"
            width="20px"
            height="20px"
            class="delete"
            color="black"
            colorHover="primary"
            @click="removePartner(partner.id)"
          />
        </div>
      </div>
    </div>
    <div class="fourth">
      <div class="errors">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          width="20px"
          height="20px"
          class="icon"
          color="red"
          colorHover="primary"
          v-if="invalidAddress || partnerWithoutMailAddress"
        />
        <span v-if="invalidAddress">Dirección de correo no válida</span>
        <span v-if="partnerWithoutMailAddress"
          >El cliente no tiene una dirección de correo establecida</span
        >
      </div>
      <AppButton
        icon="pi pi-send"
        class="btn"
        label="Enviar"
        size="small"
        :disabled="
          partners.some((el) => !el.email) || (partners.length === 0 && emails.length === 0)
        "
        :class="{
          disabled:
            partners.some((el) => !el.email) || (partners.length === 0 && emails.length === 0),
        }"
        @click="sendMail()"
      />
    </div>
    <div class="fifth">
      <div class="label">Mensaje</div>

      <div class="editable" contenteditable="true" ref="content" @input="updateContent" />
    </div>
  </div>
</template>

<script lang="ts">
import { type PartnerInterface } from '@/legacy/interfaces/PartnerInterface';
import { defineComponent, computed, ref, watch, type Ref, onMounted, reactive, markRaw } from 'vue';
import useVuelidate from '@vuelidate/core';
import { email } from '@vuelidate/validators';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import Button from 'primevue/button';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import PartnerForm from '@/legacy/components//partners/PartnerForm.vue';
import { useStore } from '@/legacy/store';
import { usePartner } from '@/legacy/utils/usePartner';
import { dialogService } from '@/legacy/services/DialogService';

export default defineComponent({
  components: {
    InputText,
    AutocompleteComponent,
    Editor,
    AppButton: Button,
    CustomIcon,
  },
  props: {
    invoiceId: {
      type: Number,
      required: false,
    },
    stateReservation: {
      type: String,
      required: false,
    },
    template: {
      type: String,
      required: false,
    },
    defaultSubject: {
      type: String,
      required: false,
    },
  },

  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const rules = {
      email: {
        email,
      },
    };

    const content = ref<HTMLElement | null>(null);

    const updateContent = () => {
      mailContent.value = content.value?.innerHTML || '';
    };

    const subject = ref(props.defaultSubject ? props.defaultSubject : '');
    const mailContent = ref(props.template ? props.template : '');
    const partners = ref([] as PartnerInterface[]);
    const selectedPartnerId = ref(0);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const emails = ref([] as string[]);
    const invalidAddress = ref(false);
    const partnerWithoutMailAddress = ref(false);
    const emailToAdd = ref('');
    const showBtnToAddEmail = ref(false);
    const partnerDialog = ref(false);
    const partnerName = ref('');
    const partnersFetched = computed(() => store.state.partners.partners);
    const state = reactive({
      email: '',
    });
    const v = useVuelidate(rules, state);
    const getGuestFromVatDocNumber = async (name: string) => {
      partnerName.value = name;
      selectedPartnerId.value = 0;
      await store.dispatch('partners/removePartners');
      if (name.length >= 5) {
        fetchPartners({
          limit: 20,
          offset: 0,
          multiFieldSearch: name,
        });
      }
      emailToAdd.value = name;
      invalidAddress.value = false;
      showBtnToAddEmail.value = false;
      state.email = name;
      v.value.$touch();
      if (!v.value.$invalid) {
        showBtnToAddEmail.value = true;
      }
    };

    const addMailAddressToMails = (mail: string) => {
      if (partners.value.length > 0 && partners.value.some((el) => !el.email)) {
        partnerWithoutMailAddress.value = true;
      } else {
        partnerWithoutMailAddress.value = false;
      }
      if (emails.value.includes(mail)) {
        return;
      }
      state.email = mail;
      v.value.$touch();
      if (!v.value.$invalid && mail !== '') {
        const mailExists = emails.value.find((el) => el === mail);
        const partnerMailExists = partners.value.find((el) => el.email === mail);
        if (!mailExists && !partnerMailExists) {
          emails.value.push(mail);
          invalidAddress.value = false;
        }
        emailToAdd.value = '';
        selectedPartner.value = null;
      } else {
        invalidAddress.value = true;
      }
    };

    const openPartnerForm = async (partnerId: number) => {
      await store.dispatch('countryStates/removeCountryStates');
      if (partnerId === 0) {
        await store.dispatch('partners/removePartner');
      } else {
        void store.dispatch('layout/showSpinner', true);
      }
      try {
        await store.dispatch('partners/fetchCurrentPartner', partnerId);
        dialogService.open({
          header: partnerId === 0 ? 'Nuevo cliente' : 'Editar cliente',
          content: markRaw(PartnerForm),
          closable: true,
          onAccept: () => {
            addMailToPartner();
          },
        });
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
      partnerDialog.value = true;
    };

    const removePartner = (partnerId: number) => {
      const partnerIndex = partners.value.findIndex((el) => el.id === partnerId);
      if (partnerIndex !== -1) {
        partners.value.splice(partnerIndex, 1);
      }
    };

    const removeEmail = (mailToRemove: string) => {
      emails.value.splice(emails.value.indexOf(mailToRemove), 1);
    };

    const sendMail = async () => {
      const partnerIds: number[] = [];
      const emailAddresses: string[] = [];
      partners.value.forEach((el) => partnerIds.push(el.id));
      emails.value.forEach((el) => emailAddresses.push(el));
      void store.dispatch('layout/showSpinner', true);
      try {
        if (props.invoiceId) {
          const payload = {
            invoiceId: props.invoiceId,
            subject: subject.value,
            bodyMail: mailContent.value,
            partnerIds,
            emailAddresses,
          };
          await store.dispatch('folios/sendMailInvoice', payload);
        } else if (props.stateReservation) {
          const payload = {
            folioId: store.state.folios.currentFolio?.id,
            mailType: props.stateReservation,
            subject: subject.value,
            bodyMail: mailContent.value,
            partnerIds,
            emailAddresses,
          };
          await store.dispatch('folios/sendFolioMail', payload);
        }
        void store.dispatch('folios/fetchFolioMessages', store.state.folios.currentFolio?.id);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        context.emit('accept');
        void store.dispatch('layout/showSpinner', false);
        void store.dispatch('layout/setForceMoveFolioTab', 'messages');
      }
    };

    const addMailToPartner = async () => {
      const partner = partners.value.find((el) => el.id === selectedPartnerId.value);
      if (partner && store.state.partners.currentPartner?.email) {
        partner.email = store.state.partners.currentPartner?.email;
      } else if (!partner && store.state.partners.currentPartner) {
        partners.value.push(store.state.partners.currentPartner);
      }
      if (partners.value.some((el) => !el.email)) {
        partnerWithoutMailAddress.value = true;
      } else {
        partnerWithoutMailAddress.value = false;
        partnerDialog.value = false;
      }
      selectedPartnerId.value = 0;
      await store.dispatch('partners/removePartner');
    };

    watch(selectedPartnerId, () => {
      const partner = partnersFetched.value.find((el) => el.id === selectedPartnerId.value) ?? null;
      const parterMailExists = partners.value.find((el) => el.id === partner?.id);
      if (partner && !parterMailExists) {
        partners.value.push(partner);
        partnerWithoutMailAddress.value = false;
        if (partners.value.some((el) => !el.email)) {
          partnerWithoutMailAddress.value = true;
        }
      }
      invalidAddress.value = false;
    });

    watch(partnersFetched, () => {
      itemsAutocompleteCustomer.value = partnersFetched.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
    });

    onMounted(async () => {
      let partnerId = 0;
      if (props.invoiceId) {
        const invoice = store.state.folios.invoices.find((el) => el.id === props.invoiceId);
        if (invoice?.partnerId) {
          partnerId = invoice.partnerId;
        }
      }
      if (props.stateReservation && store.state.folios.currentFolio?.partnerId) {
        partnerId = store.state.folios.currentFolio.partnerId;
      }
      if (partnerId !== 0) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('partners/fetchCurrentPartner', partnerId);
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        if (store.state.partners.currentPartner && store.state.partners.currentPartner.email) {
          partners.value.push(store.state.partners.currentPartner);
        }
        void store.dispatch('partners/removePartner');
      } else if (store.state.folios.currentFolio?.partnerEmail) {
        emails.value.push(store.state.folios.currentFolio.partnerEmail);
      }
      if (content.value) {
        content.value.innerHTML = mailContent.value;
      }
    });
    return {
      store,
      subject,
      mailContent,
      partners,
      selectedPartnerId,
      selectedPartner,
      itemsAutocompleteCustomer,
      partnerDialog,
      partnerName,
      emails,
      v,
      rules,
      state,
      emailToAdd,
      invalidAddress,
      partnerWithoutMailAddress,
      showBtnToAddEmail,
      sendMail,
      addMailAddressToMails,
      getGuestFromVatDocNumber,
      openPartnerForm,
      removePartner,
      removeEmail,
      addMailToPartner,
      updateContent,
      content,
    };
  },
});
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  flex-direction: column;
  padding-right: 0.5rem;
  .first,
  .second,
  .third,
  .fifth {
    display: flex;
    flex-direction: column;
    .label {
      margin-top: 0.5rem;
      font-weight: bold;
      user-select: none;
    }
    .autocomplete {
      height: 35px;
    }
  }
  .second {
    .add-mail-fields {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      .input-and-label {
        display: flex;
        flex: 1;
        flex-direction: column;
        margin-right: 0.5rem;
      }
    }
  }
  .third {
    display: flex;
    flex-direction: column;
    width: 100%;
    .label {
      margin-top: 0.5rem;
      font-weight: bold;
      user-select: none;
    }
    .partners {
      border-radius: 4px;
      min-height: 35px;
      font-size: 0.8rem;
      .partner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.2rem 0;
        border-bottom: 1px solid grey;
        .partner-email {
          display: flex;
          flex-direction: column;
          .add-email-address {
            color: $primary;
            text-decoration: underline;
            cursor: pointer;
            &:hover {
              color: $corduroy;
            }
          }
          .name {
            font-weight: bold;
          }
        }
        .delete {
          cursor: pointer;
        }
      }
    }
  }
  .fourth {
    display: flex;
    flex-direction: column;
    margin-top: 0.5rem;
    .errors {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      color: red;
      .icon {
        margin-right: 0.5rem;
      }
    }
    .btn {
      width: 100%;
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    width: 800px;
    max-height: 80svh;
    overflow-y: scroll;
    .second {
      flex-direction: row;
    }
    .third {
      .partners {
        .partner {
          .partner-email {
            flex-direction: row;
            justify-content: space-between;
            flex: 1;
            margin-right: 1rem;
            .email {
              font-size: 1rem;
            }
            .add-email-address {
              font-size: 1rem;
            }
            .name {
              font-size: 1rem;
            }
          }
        }
      }
    }
    .fourth {
      flex-direction: row;
      justify-content: space-between;
      .errors {
        margin-right: 2rem;
      }
      .btn {
        width: auto;
      }
    }
  }
}
</style>
