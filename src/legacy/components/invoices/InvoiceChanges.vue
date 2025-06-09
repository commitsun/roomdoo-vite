<template>
  <div class="main-content">
    <div class="first">
      <div class="label" v-if="!partnerToAdd && !isSearchPartnerOpened">
        {{ !isSimplifiedInvoice ? 'Selecciona una opción' : '&nbsp;' }}
      </div>
      <div class="label" v-else-if="!partnerToAdd && isSearchPartnerOpened && !isSimplifiedInvoice">
        Busca a un {{ !isRenderCheckinPartners ? 'cliente' : 'huésped' }} ya registrado
      </div>
      <!-- PARTNER OPTIONS -->
      <div class="options" v-if="!partnerToAdd && !isSearchPartnerOpened">
        <div class="option" @click="openPartnerForm(true)">
          <div class="icon-wrapper">
            <CustomIcon
              imagePath="/app-images/icon-plus.svg"
              width="23px"
              height="23px"
              color="primary"
              class="icon-mobile"
            />
            <CustomIcon
              imagePath="/app-images/icon-plus.svg"
              width="25px"
              height="25px"
              color="primary"
              class="icon-desktop"
            />
          </div>
          <span> Nuevos datos de facturación </span>
        </div>
        <div
          class="option"
          :class="partners.length === 0 ? 'disabled' : ''"
          @click="partners.length > 0 ? openPartnerSearchDialog(true) : null"
        >
          <div class="icon-wrapper">
            <CustomIcon
              imagePath="/app-images/icon-supervised-user.svg"
              width="28px"
              height="28px"
              color="primary"
              class="icon-mobile"
            />
            <CustomIcon
              imagePath="/app-images/icon-supervised-user.svg"
              width="30px"
              height="30px"
              color="primary"
              class="icon-desktop"
            />
          </div>
          <span> Uno de los huéspedes </span>
        </div>
        <div class="option" @click="openPartnerSearchDialog(false)">
          <div class="icon-wrapper">
            <CustomIcon
              imagePath="/app-images/icon-search-partner.svg"
              width="28px"
              height="28px"
              color="primary"
              class="icon-mobile"
            />
            <CustomIcon
              imagePath="/app-images/icon-search-partner.svg"
              width="30px"
              height="30px"
              color="primary"
              class="icon-desktop"
            />
          </div>
          <span>Buscar cliente registrado</span>
        </div>
        <div
          class="option"
          :class="{
            disabled:
              activeProperty?.maxAmountSimplifiedInvoice &&
              getTotalToInvoice > activeProperty.maxAmountSimplifiedInvoice,
          }"
          @click="
            isSimplifiedInvoice = !(
              activeProperty?.maxAmountSimplifiedInvoice &&
              getTotalToInvoice > activeProperty.maxAmountSimplifiedInvoice
            )
              ? !isSimplifiedInvoice
              : isSimplifiedInvoice
          "
        >
          <div class="icon-wrapper">
            <CustomIcon
              imagePath="/app-images/icon-task.svg"
              width="23px"
              height="23px"
              color="primary"
              class="icon-mobile"
            />
            <CustomIcon
              imagePath="/app-images/icon-task.svg"
              width="30px"
              height="30px"
              color="primary"
              class="icon-desktop"
            />
          </div>
          <span>
            {{
              activeProperty?.maxAmountSimplifiedInvoice &&
              getTotalToInvoice > activeProperty.maxAmountSimplifiedInvoice
                ? `Simplificada Máx. ${activeProperty.maxAmountSimplifiedInvoice} € superado`
                : 'Facturación simplificada'
            }}
          </span>
          <div class="triangle" v-if="isSimplifiedInvoice">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
        </div>
      </div>
      <div class="select-partner-autocomplete" v-else-if="!partnerToAdd && isSearchPartnerOpened">
        <div class="select-partner-autocomplete-back">
          <CustomIcon
            imagePath="/app-images/back-arrow-blue.svg"
            width="30px"
            height="30px"
            color="primary"
            @click="isSearchPartnerOpened = false"
            class="icon-back"
          />
        </div>
        <AutocompleteComponent
          v-model="selectedPartnerId"
          keepResultAfterChoose
          id="partners-autocomplete-invoice"
          placeholderValue="Nombre, DNI, email, tlf..."
          placeholderShowingOptions="Nombre, DNI, email, tlf..."
          class="autocomplete-partner"
          iconExpandCollapse
          :items="itemsAutocompleteCustomer"
          :showAddNewOption="false"
          :minChars="!isRenderCheckinPartners ? 5 : 0"
          :isBorder="false"
          @textSearchChanges="getGuest($event)"
        >
          <template #icon>
            <img src="/app-images/search.svg" />
          </template>
        </AutocompleteComponent>
      </div>
      <div class="partner-date" v-else>
        <div
          class="partner"
          :style="noMinimumPartnerDataError ? 'border: 1px solid #ED4A1C;' : ''"
          @click="openPartnerForm(false)"
        >
          <div class="partner-name-content">
            <div class="partner-name">
              {{ partnerToAdd?.name }}
            </div>
            <CustomIcon
              imagePath="/app-images/delete.svg"
              width="17px"
              height="17px"
              color="#3F4443"
              @click.stop="restorePartner"
              class="icon-close"
            />
          </div>
          <div class="document-number">
            {{ partnerToAdd?.vatNumber }}
          </div>
          <div class="partner-street" v-if="partnerToAdd?.street">
            {{ partnerToAdd?.street }}
          </div>
          <div class="partner-zip-and-city">
            <span class="partner-zip" v-if="partnerToAdd?.zip">{{ partnerToAdd?.zip }}</span>
            <span v-if="partnerToAdd?.zip && partnerToAdd?.city">, </span>
            <span class="partner-city" v-if="partnerToAdd?.city">
              {{ partnerToAdd?.city }}
            </span>
          </div>
          <div class="partner-state-and-country">
            <span class="partner-state" v-if="partnerToAdd?.stateId">
              {{ partnerStateName }}
            </span>
            <span v-if="partnerToAdd?.stateId && partnerToAdd?.countryId">, </span>
            <span class="partner-country" v-if="partnerToAdd?.countryId">
              {{ countryName(partnerToAdd?.countryId || 0) }}
            </span>
          </div>
          <div class="error" v-if="noMinimumPartnerDataError">Datos de facturación incompletos</div>
        </div>
        <div class="date">
          <span class="title">Fecha</span>
          <span class="value">
            {{
              invoiceDate
                ? invoiceDate
                : new Date().toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
            }}
          </span>
        </div>
      </div>
    </div>
    <div class="second">
      <div class="sale-lines" v-if="isRenderSaleLines">
        <div v-for="(saleLine, index) in saleLinesToSend" :key="saleLine.id">
          <div
            :class="{
              'sale-line-section': saleLine.displayType === 'line_section',
              'sale-line-note': saleLine.displayType === 'line_note',
            }"
            v-if="
              saleLine.displayType === 'line_section' ||
              (saleLine.displayType === 'line_note' && saleLineNotInInvoiceLines(saleLine))
            "
          >
            {{ saleLine.name }}
          </div>
          <div class="sale-line" v-else-if="saleLine.qtyToInvoice > 0">
            <div class="sale-line-content">
              <div class="name" :class="{ disabled: !isLineRemoved[index] }">
                <TooltipComponent
                  :content="saleLine.name ? saleLine.name : ''"
                  backgroundColor="rgba(75, 177, 224, 1)"
                  position="top"
                  class="tooltip-component"
                >
                  <input
                    class="name-input"
                    type="text"
                    v-model="saleLine.name"
                    :disabled="!isLineRemoved[index]"
                    :style="getSaleLinesToInvoiceRowStyle(saleLine.displayType, index)"
                  />
                </TooltipComponent>
              </div>
              <div class="rest" :class="{ disabled: !isLineRemoved[index] }">
                <div class="sale-line-price-unit">{{ saleLine.priceUnit }} €/Ud</div>
                <div class="sale-line-qty">
                  <input
                    class="qty-to-invoice"
                    type="number"
                    v-model="saleLine.qtyToInvoice"
                    :disabled="!isLineRemoved[index]"
                    @blur="setQtyToInvoice(index)"
                  />
                  <span v-if="saleLine.reservationId && !saleLine.serviceId">
                    Noche{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
                  </span>
                  <span v-else> Ud{{ saleLine.qtyToInvoice > 1 ? 's' : '' }} </span>
                </div>
              </div>
              <div class="rest" :class="{ disabled: !isLineRemoved[index] }">
                <div class="sale-line-discount">
                  {{ saleLine.discount ? saleLine.discount : 0 }} % Desc.
                </div>
                <div class="sale-line-price">
                  {{ amountSaleLineTotal(saleLine.id, false).toFixed(2) }} €
                </div>
              </div>
            </div>
            <div class="sale-line-selection">
              <input type="checkbox" v-model="isLineRemoved[index]" />
            </div>
          </div>
        </div>
      </div>
      <div class="sale-lines" v-else-if="isRenderInvoiceLines">
        <div v-for="(invoiceLine, index) in invoiceLinesToSend" :key="invoiceLine.id ?? 0">
          <div
            :class="{
              'sale-line-section': invoiceLine.displayType === 'line_section',
              'sale-line-note': invoiceLine.displayType === 'line_note',
            }"
            v-if="
              invoiceLine.displayType === 'line_section' || invoiceLine.displayType === 'line_note'
            "
          >
            {{ invoiceLine.name }}
          </div>
          <div class="sale-line" v-else-if="invoiceLine.quantity > 0">
            <div class="sale-line-content">
              <div class="name" :class="{ disabled: !isLineRemoved[index] }">
                <TooltipComponent
                  :content="invoiceLine.name ? invoiceLine.name : ''"
                  backgroundColor="rgba(75, 177, 224, 1)"
                  position="top"
                  class="tooltip-component"
                >
                  <input
                    class="name-input"
                    type="text"
                    v-model="invoiceLine.name"
                    :disabled="!isLineRemoved[index]"
                    :style="getSaleLinesToInvoiceRowStyle(invoiceLine.displayType, index)"
                  />
                </TooltipComponent>
              </div>
              <div class="rest" :class="{ disabled: !isLineRemoved[index] }">
                <div class="sale-line-price-unit">{{ invoiceLine.priceUnit }} €/Ud</div>
                <div class="sale-line-qty">
                  <input
                    class="qty-to-invoice"
                    type="number"
                    v-model="invoiceLine.quantity"
                    :disabled="!isLineRemoved[index]"
                    @blur="setQtyToInvoice(index)"
                  />
                  {{
                    moveLineUnit(invoiceId ?? 0, invoiceLine.id ?? 0, invoiceLine.saleLineId ?? 0)
                  }}
                </div>
              </div>
              <div class="rest" :class="{ disabled: !isLineRemoved[index] }">
                <div class="sale-line-discount">
                  {{ invoiceLine.discount ? invoiceLine.discount : 0 }} % Desc.
                </div>
                <div class="sale-line-price">
                  {{
                    amountInvoiceLineTotal(
                      invoiceLine.id ?? 0,
                      invoiceLine.saleLineId ?? 0
                    ).toFixed(2)
                  }}
                  €
                </div>
              </div>
            </div>
            <div class="sale-line-selection">
              <input type="checkbox" v-model="isLineRemoved[index]" />
            </div>
          </div>
        </div>
      </div>
      <div class="comments">
        <InputText v-model="comment" textArea textLabel="Comentarios" />
      </div>
      <div
        class="add-sale-lines"
        v-if="isRenderInvoiceLines && checkQtyToInvoiceSaleLines() && saleLinesToInvoice.length > 0"
        @click="showFolioSaleLines = !showFolioSaleLines"
      >
        Añadir lineas por facturar
      </div>
      <div class="sale-lines" v-if="isRenderInvoiceLines && showFolioSaleLines">
        <div v-for="(saleLine, index) in saleLinesToInvoice" :key="saleLine.id">
          <div
            :class="{
              'sale-line-section': saleLine.displayType === 'line_section',
              'sale-line-note': saleLine.displayType === 'line_note',
            }"
            v-if="
              saleLine.displayType === 'line_section' ||
              (saleLine.displayType === 'line_note' && saleLineNotInInvoiceLines(saleLine))
            "
          >
            {{ saleLine.name }}
          </div>
          <div class="sale-line" v-else-if="saleLine.qtyToInvoice > 0">
            <div class="sale-line-content">
              <div class="name disabled">
                <TooltipComponent
                  :content="saleLine.name ? saleLine.name : ''"
                  backgroundColor="rgba(75, 177, 224, 1)"
                  position="top"
                  class="tooltip-component"
                >
                  <input
                    class="name-input"
                    type="text"
                    :value="saleLine.name"
                    :disabled="!isLineRemoved[index]"
                    :style="getSaleLinesToInvoiceRowStyle(saleLine.displayType, index)"
                  />
                </TooltipComponent>
              </div>
              <div class="rest disabled">
                <div class="sale-line-price-unit">{{ saleLine.priceUnit }} €/Ud</div>
                <div class="sale-line-qty">
                  <input
                    class="qty-to-invoice"
                    type="number"
                    v-model="saleLine.qtyToInvoice"
                    :disabled="!isLineRemoved[index]"
                    @blur="setQtyToInvoice(index)"
                  />
                  <span v-if="saleLine.reservationId && !saleLine.serviceId">
                    Noche{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
                  </span>
                  <span v-else> Ud{{ saleLine.qtyToInvoice > 1 ? 's' : '' }} </span>
                </div>
              </div>
              <div class="rest disabled">
                <div class="sale-line-discount">
                  {{ saleLine.discount ? saleLine.discount : 0 }} % Desc.
                </div>
                <div class="sale-line-price">
                  {{ amountSaleLineTotal(saleLine.id, true).toFixed(2) }} €
                </div>
              </div>
            </div>
            <div class="sale-line-selection">
              <CustomIcon
                imagePath="/app-images/back-arrow-blue.svg"
                width="23px"
                height="23px"
                color="primary"
                class="icon"
                @click="addSaleLinesToInvoice(saleLine.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="amounts">
        <div class="total-amount">
          <span class="title-amount-total"> Importe total </span>
          <span class="amount-total"> {{ getTotalToInvoice.toFixed(2) }} € </span>
        </div>
        <div class="total-amount">
          <span class="title-amount-pending" v-if="pendingToInvoice > 0">
            Pendiente de facturar
          </span>
          <span class="amount-pending" v-if="pendingToInvoice > 0">
            {{ pendingToInvoice.toFixed(2) }} €
          </span>
        </div>
      </div>
      <div class="btns">
        <CustomButton
          text="Cancelar"
          textColor="primary"
          borderColor="primary"
          class="btn"
          @click="$emit('close')"
        />
        <CustomButton
          text="Guardar"
          backgroundColor="primary"
          class="btn"
          @click="saveInvoice"
          :disabled="
            getTotalToInvoice === 0 ||
            (!partnerToAdd && !isSimplifiedInvoice) ||
            noMinimumPartnerDataError ||
            (isRenderSaleLines &&
              saleLinesToSend.some((el, index) => el.name === '' && isLineRemoved[index])) ||
            (isRenderInvoiceLines &&
              invoiceLinesToSend.some((el, index) => el.name === '' && isLineRemoved[index]))
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, markRaw, nextTick, onMounted, ref, watch, type Ref } from 'vue';

import type { InvoiceLineInterface } from '@/legacy/interfaces/InvoiceLineInterface';
import type { FolioSaleLineInterface } from '@/legacy/interfaces/FolioSaleLineInterface';
import type { PartnerInterface } from '@/legacy/interfaces/PartnerInterface';

import { useStore } from '@/legacy/store';
import { usePartner } from '@/legacy/utils/usePartner';

import CustomButton from '@/legacy/components/roomdooComponents/CustomButton.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import TooltipComponent from '@/legacy/components/roomdooComponents/TooltipComponent.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import { dialogService } from '@/legacy/services/DialogService';

import PartnerForm from '@/legacy/components/partners/PartnerForm.vue';

export default defineComponent({
  components: {
    CustomButton,
    CustomIcon,
    AutocompleteComponent,
    TooltipComponent,
    InputText,
  },
  props: {
    isRenderSaleLines: {
      type: Boolean,
      require: false,
    },
    isRenderInvoiceLines: {
      type: Boolean,
      require: false,
    },
    invoiceId: {
      type: Number,
      require: false,
    },
    invoiceDialog: {
      type: Boolean,
    },
    saleLineIds: {
      type: Array,
      require: false,
    },
    idPartner: {
      type: Number,
      require: false,
    },
  },
  setup(props, context) {
    // composables
    const store = useStore();
    const { fetchPartners } = usePartner();
    // refs
    const isSimplifiedInvoice = ref(false);
    const saleLinesToSend = ref([] as FolioSaleLineInterface[]);
    const invoiceLinesToSend = ref([] as InvoiceLineInterface[]);
    const isLineRemoved = ref([] as boolean[]);
    const partnerToAdd: Ref<PartnerInterface | null> = ref(null);
    const noMinimumPartnerDataError = ref(false);
    const partnerStateName = ref('');
    const isSearchPartnerOpened = ref(false);
    const isRenderCheckinPartners = ref(false);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartnerId = ref(0);

    const partners = ref([] as PartnerInterface[]);
    const partnerError = ref(false);
    const noLinesToSendError = ref(false);
    const comment = ref('');
    const saleLinesToInvoice = ref([] as FolioSaleLineInterface[]);
    const linesToSend = ref([] as FolioSaleLineInterface[]);
    const pendingToInvoice = ref(0);
    const openCheckinPartners = ref(false);
    const checkinPartnerText = ref('');
    const invoiceDate = ref('');
    const showFolioSaleLines = ref(false);
    const isRestorePartner = ref(false);

    // computeds
    const folio = computed(() => store.state.folios.currentFolio);
    const saleLines = computed(() => store.state.folios.saleLines);
    const invoices = computed(() => store.state.folios.invoices);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const partnersList = computed(() => store.state.partners.partners);

    const getTotalToInvoice = computed(() => {
      let total = 0;
      if (props.isRenderSaleLines) {
        saleLinesToSend.value.forEach((el, index) => {
          if (isLineRemoved.value[index] && el.qtyToInvoice > 0) {
            const subTotal =
              el.qtyToInvoice * el.priceUnit -
              ((el.discount * el.priceUnit) / 100) * el.qtyToInvoice;
            total += subTotal;
          }
        });
      } else {
        invoiceLinesToSend.value.forEach((el, index) => {
          if (isLineRemoved.value[index]) {
            const subTotal =
              el.quantity * el.priceUnit - ((el.discount * el.priceUnit) / 100) * el.quantity;
            total += subTotal;
          }
        });
      }
      return total;
    });

    const checkMinimumPartnerData = (partner: PartnerInterface) => {
      const partnerCountryCode = store.state.countries.countries.find(
        (el) => el.id === partner.countryId
      )?.code;
      if (
        !partner?.name ||
        !partner?.zip ||
        !partner?.street ||
        !partner?.city ||
        !partner?.countryId ||
        !partner?.vatNumber ||
        (partnerCountryCode === 'ES' && !partner?.stateId)
      ) {
        noMinimumPartnerDataError.value = true;
      } else {
        noMinimumPartnerDataError.value = false;
      }
    };

    const addPartnerToInvoice = async () => {
      partnerToAdd.value = store.state.partners.currentPartner;
      if (partnerToAdd.value) {
        checkMinimumPartnerData(partnerToAdd.value);
        if (partnerToAdd.value.stateId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('countryStates/fetchCountryStates', partnerToAdd.value.countryId);
            partnerStateName.value =
              store.state.countryStates.countryStates.find(
                (el) => el.id === partnerToAdd.value?.stateId
              )?.name ?? '';
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
      void store.dispatch('partners/setCurrentPartner', partnerToAdd.value);
    };

    const getGuest = (name: string) => {
      if (!isRenderCheckinPartners.value) {
        if (name.length >= 5) {
          fetchPartners({
            limit: 20,
            offset: 0,
            multiFieldSearch: name,
            isRemovedPartnersBeforeSearch: true,
          });
        }
      } else {
        itemsAutocompleteCustomer.value.filter(
          (item) =>
            item.name
              .normalize('NFKD')
              .replace(/[^\w]/g, '')
              .toLowerCase()
              .indexOf(name.normalize('NFKD').replace(/[^\w]/g, '').toLowerCase()) > -1
        );
      }
    };

    const setPartnerArray = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (store.state.folios.currentFolio?.partnerId) {
          await store.dispatch(
            'partners/fetchCurrentPartner',
            store.state.folios.currentFolio.partnerId
          );
          partners.value.push(store.state.partners.currentPartner ?? ({} as PartnerInterface));
        }
        const { reservations } = store.state.reservations;
        if (reservations) {
          await Promise.all(
            reservations.map(async (reservation) => {
              if (reservation.partnerId) {
                await store.dispatch('partners/fetchCurrentPartner', reservation.partnerId);
                partners.value.push(
                  store.state.partners.currentPartner ?? ({} as PartnerInterface)
                );
              }
              await store.dispatch('checkinPartners/fetchCheckinPartners', reservation.id);
              const fetchPartnerPromises = store.state.checkinPartners.checkinpartners.map(
                async (checkinPartner) => {
                  if (checkinPartner.partnerId) {
                    await store.dispatch('partners/fetchCurrentPartner', checkinPartner.partnerId);
                    partners.value.push(
                      store.state.partners.currentPartner ?? ({} as PartnerInterface)
                    );
                  }
                }
              );

              await Promise.all(fetchPartnerPromises);
            })
          );
        }
        partners.value = partners.value.filter(
          (partner, index, self) => index === self.findIndex((t) => t.id === partner.id)
        );
        itemsAutocompleteCustomer.value = partners.value.map((el) => ({
          value: el.id,
          name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
            el.vatNumber ? ')' : ''
          }`,
        }));
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('partners/removePartner');
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const openPartnerSearchDialog = (isRenderCheckins: boolean) => {
      isRenderCheckinPartners.value = isRenderCheckins;
      if (isRenderCheckinPartners.value) {
        void setPartnerArray();
      } else {
        itemsAutocompleteCustomer.value = [];
      }
      isSearchPartnerOpened.value = true;
      if (isRenderCheckinPartners.value) {
        void nextTick(() => {
          const autocompletePartner = document.getElementById('partners-autocomplete-invoice');
          if (autocompletePartner) {
            const firstInput = autocompletePartner.getElementsByTagName('input')[0];
            firstInput.focus();
          }
        });
      }
    };

    const restorePartner = () => {
      selectedPartnerId.value = 0;
      partnerToAdd.value = null;
      noMinimumPartnerDataError.value = false;
      void store.dispatch('partners/removePartner');
    };

    const openPartnerForm = async (restorePartner: boolean) => {
      if (partnerToAdd.value) {
        await store.dispatch('partners/setCurrentPartner', partnerToAdd.value);
      }
      isRestorePartner.value = restorePartner;
      dialogService.open({
        header: 'Crear contacto',
        content: markRaw(PartnerForm),
        closable: true,
        onAccept: () => addPartnerToInvoice(),
        props: {
          resetCurrentPartner: isRestorePartner.value,
        },
      });
    };

    const countryName = (countryId: number) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.name;

    const getMoveLineRowStyle = (displayType: string, numberRow: number) => {
      let backgroundColor = '';
      let fontWeight = 'normal';
      let color = '';
      let fontStyle = 'normal';
      if (displayType === 'line_section') {
        backgroundColor = '#d6ebf2';
        fontWeight = 'bold';
      } else if (displayType === 'line_note') {
        fontStyle = 'italic';
        color = 'black';
        backgroundColor = '#FFFFFF';
      } else if (numberRow % 2 === 0) {
        backgroundColor = '#EEF7FA';
      }

      if (!isLineRemoved.value[numberRow]) {
        color = 'lightgrey';
      }

      const style: Record<string, string> = {
        backgroundColor,
        fontWeight,
        color,
        fontStyle,
      };

      return style;
    };

    const getSaleLinesToInvoiceRowStyle = (displayType: string, numberRow: number) => {
      let backgroundColor = '';
      let fontWeight = 'normal';
      let fontStyle = 'normal';
      if (displayType === 'line_section') {
        backgroundColor = '#d6ebf2';
        fontWeight = 'bold';
      } else if (displayType === 'line_note') {
        fontStyle = 'italic';
        backgroundColor = '#FFFFFF';
      } else if (displayType === 'line_total') {
        backgroundColor = '#D6EBF2';
        fontWeight = 'bold';
      } else if (numberRow % 2 === 0) {
        backgroundColor = '#EEF7FA';
      }
      const style: Record<string, string> = {
        backgroundColor,
        color: 'black',
        fontWeight,
        fontStyle,
      };
      return style;
    };

    const getQtyInvoiceRowStyle = (displayType: string, numberRow: number) => {
      let backgroundColor = '';
      let color = '';
      if (numberRow % 2 === 0) {
        backgroundColor = '#EEF7FA';
      }
      if (!isLineRemoved.value[numberRow]) {
        color = 'lightgrey';
      }
      const style = {
        backgroundColor,
        color,
      };
      return style;
    };

    const removeAddLine = (numberRow: number) => {
      isLineRemoved.value[numberRow] = !isLineRemoved.value[numberRow];
    };

    const saveInvoice = async () => {
      if (
        //
        getTotalToInvoice.value === 0 ||
        (!partnerToAdd.value && !isSimplifiedInvoice.value) ||
        noMinimumPartnerDataError.value ||
        (props.isRenderSaleLines &&
          saleLinesToSend.value.some(
            (el, index) => el.name === '' && isLineRemoved.value[index]
          )) ||
        (props.isRenderInvoiceLines &&
          invoiceLinesToSend.value.some(
            (el, index) => el.name === '' && isLineRemoved.value[index]
          ))
        //
      ) {
        return;
      }
      void store.dispatch('layout/showSpinner', true);
      try {
        if (props.isRenderSaleLines) {
          const linesSend: FolioSaleLineInterface[] = [];
          isLineRemoved.value.forEach((el, index) => {
            if (el) {
              if (
                saleLinesToSend.value[index].displayType !== 'line_section' &&
                saleLinesToSend.value[index].qtyToInvoice !== 0
              ) {
                linesSend.push(saleLinesToSend.value[index]);
              }
            }
          });
          if (linesSend.length === 0) {
            partnerError.value = false;
            noLinesToSendError.value = true;
            return;
          }
          const payload = {
            folioId: folio.value?.id,
            partnerId: partnerToAdd.value?.id,
            saleLines: linesSend,
            narration: comment.value,
            isSimplifiedInvoice: isSimplifiedInvoice.value,
          };
          await store.dispatch('folios/createFolioInvoice', payload);
        } else {
          const invoicesLinesToSend: InvoiceLineInterface[] = [];
          isLineRemoved.value.forEach((el, index) => {
            if (el) {
              if (invoiceLinesToSend.value[index].displayType !== 'line_section') {
                invoicesLinesToSend.push(invoiceLinesToSend.value[index]);
              }
            }
          });
          const payload = {
            invoiceId: props.invoiceId,
            partnerId: partnerToAdd.value?.id,
            moveLines: invoicesLinesToSend,
            narration: comment.value,
            isSimplifiedInvoice: isSimplifiedInvoice.value,
          };
          await store.dispatch('folios/updateFolioInvoice', payload);
        }
        void store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
        void store.dispatch('folios/fetchFolioInvoices', folio.value?.id);
        context.emit('update:invoiceDialog', false);
        context.emit('close');
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

    const addSaleLinesToInvoice = (saleLineId: number) => {
      const saleLine = saleLinesToInvoice.value.find((el) => el.id === saleLineId);
      if (saleLine) {
        const saleLineSectionToAdd = saleLinesToInvoice.value.find(
          (el) => el.displayType === 'line_section' && el.sectionId === saleLine.sectionId
        );
        if (saleLineSectionToAdd) {
          const newInvoiceLineSection: InvoiceLineInterface = {
            id: null,
            name: saleLineSectionToAdd.name,
            quantity: saleLineSectionToAdd.qtyToInvoice,
            priceUnit: saleLineSectionToAdd.priceUnit,
            total: amountSaleLineTotal(saleLineSectionToAdd.id, true),
            displayType: saleLineSectionToAdd.displayType,
            saleLineId: saleLineSectionToAdd.id,
            discount: saleLineSectionToAdd.discount,
          };
          const existsLineSectionInInvoice = invoiceLinesToSend.value.find(
            (el) => el.saleLineId === saleLineSectionToAdd.id
          );
          if (!existsLineSectionInInvoice) {
            invoiceLinesToSend.value.push(newInvoiceLineSection);
            isLineRemoved.value.push(true);
          }
          const hasAnotherLineInSection = saleLinesToInvoice.value.some(
            (el) =>
              el.sectionId === saleLineSectionToAdd.sectionId &&
              el.displayType !== 'line_note' &&
              el.id !== saleLineSectionToAdd.id &&
              el.id !== saleLine.id
          );
          if (!hasAnotherLineInSection) {
            saleLinesToInvoice.value.splice(
              saleLinesToInvoice.value.findIndex((el) => el.id === saleLineSectionToAdd.id),
              1
            );
          }
        }
        const saleLineNoteToAdd = saleLinesToInvoice.value.find(
          (el) => el.displayType === 'line_note' && el.sectionId === saleLine.sectionId
        );
        if (saleLineNoteToAdd) {
          const newInvoiceLineNote: InvoiceLineInterface = {
            id: null,
            name: saleLineNoteToAdd.name,
            quantity: saleLineNoteToAdd.qtyToInvoice,
            priceUnit: saleLineNoteToAdd.priceUnit,
            total: amountSaleLineTotal(saleLineNoteToAdd.id, true),
            displayType: saleLineNoteToAdd.displayType,
            saleLineId: saleLineNoteToAdd.id,
            discount: saleLineNoteToAdd.discount,
          };
          const existsLineNoteInInvoice = invoiceLinesToSend.value.find(
            (el) => el.saleLineId === saleLineNoteToAdd.id
          );
          if (!existsLineNoteInInvoice) {
            invoiceLinesToSend.value.push(newInvoiceLineNote);
            isLineRemoved.value.push(true);
          }
          const hasAnotherLineInSection = saleLinesToInvoice.value.some(
            (el) =>
              el.sectionId === saleLineNoteToAdd.sectionId &&
              el.displayType !== 'line_section' &&
              el.id !== saleLineNoteToAdd.id &&
              el.id !== saleLine.id
          );
          if (!hasAnotherLineInSection) {
            saleLinesToInvoice.value.splice(
              saleLinesToInvoice.value.findIndex((el) => el.id === saleLineNoteToAdd.id),
              1
            );
          }
        }
        const newInvoiceLine: InvoiceLineInterface = {
          id: null,
          name: saleLine.name,
          quantity: saleLine.qtyToInvoice,
          priceUnit: saleLine.priceUnit,
          total: amountSaleLineTotal(saleLine.id, true),
          displayType: saleLine.displayType,
          saleLineId: saleLine.id,
          discount: saleLine.discount,
        };
        invoiceLinesToSend.value.push(newInvoiceLine);
        isLineRemoved.value.push(true);
        saleLinesToInvoice.value.splice(
          saleLinesToInvoice.value.findIndex((el) => el.id === saleLineId),
          1
        );
      }
    };

    const amountSaleLineTotal = (lineId: number, isToAddInvoice: boolean) => {
      let amount = 0;
      if (isToAddInvoice) {
        const line = saleLinesToInvoice.value.find((el) => el.id === lineId);
        if (line) {
          amount =
            line.qtyToInvoice * line.priceUnit -
            ((line.discount * line.priceUnit) / 100) * line.qtyToInvoice;
        }
      } else {
        const line = saleLinesToSend.value.find((el) => el.id === lineId);
        if (line) {
          amount =
            line.qtyToInvoice * line.priceUnit -
            ((line.discount * line.priceUnit) / 100) * line.qtyToInvoice;
        }
      }

      return amount;
    };

    const amountInvoiceLineTotal = (invoiceLineId: number, saleLineId: number) => {
      let amount = 0;
      const invoiceLine = invoiceLinesToSend.value.find((el) => el.id === invoiceLineId);
      if (invoiceLine) {
        if (invoiceLine.id) {
          amount =
            invoiceLine.quantity * invoiceLine.priceUnit -
            ((invoiceLine.discount * invoiceLine.priceUnit) / 100) * invoiceLine.quantity;
        } else {
          const saleLine = saleLines.value.find((el) => el.id === saleLineId);
          if (saleLine) {
            amount =
              saleLine.qtyToInvoice * saleLine.priceUnit -
              ((saleLine.discount * saleLine.priceUnit) / 100) * saleLine.qtyToInvoice;
          }
        }
      } else {
        const saleLine = saleLines.value.find((el) => el.id === saleLineId);
        if (saleLine) {
          amount =
            saleLine.qtyToInvoice * saleLine.priceUnit -
            ((saleLine.discount * saleLine.priceUnit) / 100) * saleLine.qtyToInvoice;
        }
      }
      return amount;
    };

    const moveLineUnit = (invId: number, invoiceLineId: number, saleLineId: number) => {
      let unit = '';
      const invoice = invoices.value.find((el) => el.id === invId);
      if (invoice) {
        const invoiceLine = invoice.moveLines.find((el) => el.id === invoiceLineId);
        if (invoiceLine) {
          const saleLine = saleLines.value.find((el) => el.id === invoiceLine.saleLineId);
          if (saleLine && saleLine.reservationId && !saleLine.serviceId) {
            unit = 'Noche';
          } else {
            unit = 'Ud';
          }
          if (invoiceLine.quantity > 1) {
            unit += 's';
          }
        } else {
          const saleLine = saleLines.value.find((el) => el.id === saleLineId);
          if (saleLine && saleLine.reservationId && !saleLine.serviceId) {
            unit = 'Noche';
          } else {
            unit = 'Ud';
          }
          if (saleLine && saleLine?.qtyToInvoice > 1) {
            unit += 's';
          }
        }
      }
      return unit;
    };

    const checkQtyToInvoiceSaleLines = () => saleLines.value.some((el) => el.qtyToInvoice > 0);

    const setQtyToInvoice = (index: number) => {
      if (props.isRenderSaleLines) {
        if (!saleLinesToSend.value[index].qtyToInvoice) {
          saleLinesToSend.value[index].qtyToInvoice = linesToSend.value[index].qtyToInvoice;
        } else if (
          saleLinesToSend.value[index].qtyToInvoice > linesToSend.value[index].qtyToInvoice
        ) {
          saleLinesToSend.value[index].qtyToInvoice = linesToSend.value[index].qtyToInvoice;
        }
      } else if (props.isRenderInvoiceLines) {
        const invoiceLine = invoices.value
          .find((el) => el.id === props.invoiceId)
          ?.moveLines.find((el) => el.id === invoiceLinesToSend.value[index].id);
        if (invoiceLine && !invoiceLinesToSend.value[index].quantity) {
          invoiceLinesToSend.value[index].quantity = invoiceLine.quantity;
        } else if (invoiceLine && invoiceLinesToSend.value[index].quantity > invoiceLine.quantity) {
          invoiceLinesToSend.value[index].quantity = invoiceLine.quantity;
        }
      }
    };

    const getPendingAmount = () => {
      pendingToInvoice.value = 0;
      if (props.isRenderSaleLines) {
        isLineRemoved.value.forEach((el, index) => {
          if (!el) {
            pendingToInvoice.value += amountSaleLineTotal(saleLinesToSend.value[index].id, false);
          } else {
            let difference = 0;
            if (saleLinesToSend.value[index].qtyToInvoice > 0) {
              difference =
                linesToSend.value[index].qtyToInvoice - saleLinesToSend.value[index].qtyToInvoice;
            }
            if (difference > 0) {
              pendingToInvoice.value += difference * saleLinesToSend.value[index].priceUnit;
            }
          }
        });
      } else {
        isLineRemoved.value.forEach((el, index) => {
          if (!el) {
            pendingToInvoice.value += amountInvoiceLineTotal(
              invoiceLinesToSend.value[index].id ?? 0,
              invoiceLinesToSend.value[index].saleLineId ?? 0
            );
          } else {
            let difference = 0;
            const invoiceLine = invoices.value
              .find((invoice) => invoice.id === props.invoiceId)
              ?.moveLines.find((iL) => iL.id === invoiceLinesToSend.value[index].id);
            if (invoiceLine && invoiceLinesToSend.value[index].quantity > 0) {
              difference = invoiceLine.quantity - invoiceLinesToSend.value[index].quantity;
            }
            if (difference > 0) {
              pendingToInvoice.value += difference * invoiceLinesToSend.value[index].priceUnit;
            }
          }
        });
      }
    };

    const saleLineNotInInvoiceLines = (saleLine: FolioSaleLineInterface) => {
      let notInInvoiceLines = true;
      invoices.value.forEach((invoice) => {
        invoice.moveLines.forEach((moveLine) => {
          if (moveLine.saleLineId === saleLine.id) {
            notInInvoiceLines = false;
          }
        });
      });
      return notInInvoiceLines;
    };

    watch(selectedPartnerId, async () => {
      if (selectedPartnerId.value !== 0) {
        if (isRenderCheckinPartners.value) {
          partnerToAdd.value =
            partners.value.find((el) => el.id === selectedPartnerId.value) ?? null;
        } else {
          partnerToAdd.value =
            store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
        }
        isSearchPartnerOpened.value = false;
      }
      if (partnerToAdd.value) {
        checkMinimumPartnerData(partnerToAdd.value);
        if (partnerToAdd.value.stateId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('countryStates/fetchCountryStates', partnerToAdd.value.countryId);
            partnerStateName.value =
              store.state.countryStates.countryStates.find(
                (el) => el.id === partnerToAdd.value?.stateId
              )?.name ?? '';
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
      if (isSimplifiedInvoice.value) {
        isSimplifiedInvoice.value = false;
      }
      await store.dispatch('partners/setCurrentPartner', partnerToAdd.value);
      void store.dispatch('partners/removePartners');
    });

    watch(isSearchPartnerOpened, () => {
      if (!isSearchPartnerOpened.value) {
        itemsAutocompleteCustomer.value = [];
        openCheckinPartners.value = false;
        checkinPartnerText.value = '';
      }
      if (isSimplifiedInvoice.value) {
        isSimplifiedInvoice.value = false;
      }
    });

    watch(getTotalToInvoice, () => {
      if (
        activeProperty.value?.maxAmountSimplifiedInvoice &&
        getTotalToInvoice.value > activeProperty.value?.maxAmountSimplifiedInvoice &&
        isSimplifiedInvoice.value
      ) {
        isSimplifiedInvoice.value = false;
      }
    });

    watch(
      invoiceLinesToSend,
      () => {
        if (props.isRenderInvoiceLines) {
          invoiceLinesToSend.value.forEach((el, index) => {
            if (el.quantity === 0 && el.displayType !== 'line_note') {
              isLineRemoved.value[index] = false;
            }
          });
        }
        getPendingAmount();
      },
      { deep: true }
    );

    watch(
      saleLinesToSend,
      () => {
        if (props.isRenderSaleLines) {
          saleLinesToSend.value.forEach((el, index) => {
            if (el.qtyToInvoice === 0 && el.displayType !== 'line_note') {
              isLineRemoved.value[index] = false;
            }
          });
        }
        getPendingAmount();
      },
      { deep: true }
    );

    watch(
      isLineRemoved,
      () => {
        if (props.isRenderSaleLines) {
          isLineRemoved.value.forEach((el, index) => {
            if (el && saleLinesToSend.value[index].qtyToInvoice === 0) {
              saleLinesToSend.value[index].qtyToInvoice = linesToSend.value[index].qtyToInvoice;
            }
          });
        }
        getPendingAmount();
      },
      { deep: true }
    );

    watch(partnersList, () => {
      itemsAutocompleteCustomer.value = partnersList.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
    });

    onMounted(async () => {
      if (props.isRenderSaleLines) {
        saleLines.value.forEach((el) => {
          props.saleLineIds?.forEach((idSaleLine) => {
            if (el.id === idSaleLine && (el.qtyToInvoice !== 0 || el.displayType === 'line_note')) {
              linesToSend.value.push(el);
            }
          });
        });
        linesToSend.value.forEach((el, index) => {
          saleLinesToSend.value.push({
            id: el.id,
            name: el.name,
            priceUnit: el.priceUnit,
            productQty: el.productQty,
            priceTotal: el.priceTotal,
            qtyInvoiced: el.qtyInvoiced,
            qtyToInvoice: el.qtyToInvoice,
            discount: el.discount,
            reservationId: el.reservationId,
            serviceId: el.serviceId,
            displayType: el.displayType,
            defaultInvoiceTo: el.defaultInvoiceTo,
            sectionId: el.sectionId,
          });
          isLineRemoved.value[index] = true;
        });
      } else {
        const invoice = invoices.value.find((el) => el.id === props.invoiceId);
        if (invoice) {
          invoice.moveLines.forEach((line, index) => {
            invoiceLinesToSend.value.push({
              id: line.id,
              name: line.name,
              quantity: line.quantity,
              priceUnit: line.priceUnit,
              total: line.total,
              displayType: line.displayType,
              saleLineId: line.saleLineId,
              discount: line.discount,
            });
            isLineRemoved.value[index] = true;
          });
          if (invoice.narration) {
            comment.value = invoice.narration;
          }
        }
        if (saleLines.value) {
          saleLines.value.forEach((el) => {
            if (
              el.qtyToInvoice !== 0 ||
              (el.displayType === 'line_note' && saleLineNotInInvoiceLines(el))
            ) {
              saleLinesToInvoice.value.push(el);
            }
          });
        }
        if (invoice?.partnerId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store
              .dispatch('partners/fetchCurrentPartner', invoice?.partnerId)
              .then(async () => {
                if (store.state.partners.currentPartner) {
                  isSearchPartnerOpened.value = false;
                  partnerToAdd.value = store.state.partners.currentPartner;
                  if (partnerToAdd.value.stateId) {
                    await store.dispatch(
                      'countryStates/fetchCountryStates',
                      partnerToAdd.value.countryId
                    );
                    partnerStateName.value =
                      store.state.countryStates.countryStates.find(
                        (el) => el.id === partnerToAdd.value?.stateId
                      )?.name ?? '';
                  }
                }
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
        }
        if (invoice?.date) {
          invoiceDate.value = invoice?.date;
        }
      }
      await setPartnerArray();
    });

    return {
      isSimplifiedInvoice,
      activeProperty,
      partnerToAdd,
      isSearchPartnerOpened,
      isRenderCheckinPartners,
      selectedPartnerId,
      itemsAutocompleteCustomer,
      partners,
      folio,
      saleLines,
      invoices,
      partnersList,
      getTotalToInvoice,
      noMinimumPartnerDataError,
      invoiceDate,
      partnerStateName,
      isLineRemoved,
      saleLinesToSend,
      invoiceLinesToSend,
      partnerError,
      noLinesToSendError,
      comment,
      saleLinesToInvoice,
      linesToSend,
      pendingToInvoice,
      openCheckinPartners,
      checkinPartnerText,
      showFolioSaleLines,
      getSaleLinesToInvoiceRowStyle,
      getQtyInvoiceRowStyle,
      getMoveLineRowStyle,
      restorePartner,
      openPartnerSearchDialog,
      getGuest,
      openPartnerForm,
      countryName,
      removeAddLine,
      saveInvoice,
      addSaleLinesToInvoice,
      amountSaleLineTotal,
      amountInvoiceLineTotal,
      moveLineUnit,
      saleLineNotInInvoiceLines,
      addPartnerToInvoice,
      checkQtyToInvoiceSaleLines,
      setQtyToInvoice,
      getPendingAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  display: flex;
  flex-direction: column;
  .first {
    .label {
      font-weight: bold;
      margin: 0 0 1rem 0;
    }
    .options {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      .option {
        position: relative;
        margin-bottom: 1rem;
        flex: 1;
        min-height: 60px;
        display: flex;
        align-items: center;
        background-color: #edf7fc;
        border-radius: 5px;
        border: 2px solid $primary;
        overflow: hidden;
        padding: 0 1rem;
        cursor: pointer;
        user-select: none;
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        span {
          margin-left: 1rem;
          font-size: 1rem;
          font-weight: bold;
          color: $primary;
          flex-grow: 1;
        }
        .icon-wrapper {
          .icon-desktop {
            display: none;
          }
        }

        .triangle {
          position: absolute;
          top: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background-color: #51b2dd;
          clip-path: polygon(100% 0, 0 0, 100% 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          .check-mark {
            position: absolute;
            right: 5px;
            top: 5px;
            width: 20px;
            height: 20px;
          }
        }
      }
    }
    .select-partner-autocomplete {
      display: flex;
      height: 45px;
      align-items: center;
      margin-bottom: 45px;
      .icon-back {
        margin-right: 0.5rem;
      }
    }
    .partner-date {
      display: flex;
      flex-direction: column-reverse;
      margin-bottom: 1rem;
      .partner,
      .date {
        padding: 0.5rem 1rem;
        border: 1px solid #90ceea;
        border-radius: 8px;
      }
      .partner {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: 1rem;
        cursor: pointer;
        .partner-name-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-overflow: ellipsis;
          .partner-name {
            font-weight: bold;
            font-size: 17px;
            overflow: hidden;
            white-space: nowrap;
            width: 100%;
          }
          .icon-close {
            cursor: pointer;
            margin-left: 1rem;
          }
        }
        &:hover {
          background-color: #f2f2f2;
        }
        .error {
          color: #ed4a1c;
        }
      }
      .date {
        display: flex;
        flex-direction: column;
        width: 100%;
        .value {
          font-weight: bold;
        }
      }
    }
  }
  .second {
    .sale-lines {
      .sale-line-section {
        padding: 0.5rem;
        background-color: #d6ebf2;
        font-weight: bold;
      }
      .sale-line-note {
        padding: 0.5rem;
        font-style: italic;
        color: black;
        background-color: #ffffff;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .sale-line {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        &:nth-child(even) {
          background-color: #eef7fa;
        }
        .sale-line-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          .name {
            color: black;
            margin: 0.5rem 0;
            width: 100%;
            .tooltip-component {
              width: 100% !important;
              input {
                width: 100%;
                border: 1px solid $primary;
              }
            }
          }
          .rest {
            margin: 0.5rem 0;
            display: flex;
            justify-content: space-between;
            .sale-line-qty {
              min-width: 100px;
              display: flex;
              input {
                margin: 0 0.5rem;
                width: 30px;
                border: 1px solid $primary;
                text-align: center;
              }
            }
            .sale-line-price {
              font-weight: bold;
            }
          }
          .name,
          .rest {
            &.disabled {
              opacity: 0.5;
              input {
                cursor: not-allowed;
              }
            }
          }
        }
        .sale-line-selection {
          margin-left: 1rem;
          margin-top: 0.5rem;

          input {
            height: 23px;
            width: 18px;
            cursor: pointer;
          }
          .icon {
            cursor: pointer;
            rotate: 90deg;
          }
        }
      }
    }
    .comments {
      margin: 0.5rem 0;
    }
    .add-sale-lines {
      text-decoration: underline;
      font-weight: bold;
      color: $primary;
      cursor: pointer;
      margin: 1rem 0;
    }
  }
  .footer {
    display: flex;
    flex-direction: column;
    .amounts {
      .total-amount {
        display: flex;
        justify-content: space-between;
        &:first-child {
          font-weight: bold;
        }
      }
    }
    .btns {
      margin-top: 0.5rem;
      .btn {
        margin: 0.5rem 0;
      }
    }
  }
}

@media (min-width: 1024px) {
  .main-content {
    width: 800px;
    max-height: 80svh;
    .first {
      .label {
        font-size: 1rem;
      }
      .options {
        flex-direction: row;
        .option {
          height: 100px;
          margin-right: 1rem;
          &:last-child {
            margin-right: 0;
          }
          .icon-wrapper {
            .icon-mobile {
              display: none;
            }
            .icon-desktop {
              display: block;
            }
          }
        }
      }
      .partner-date {
        flex-direction: row;
        .partner {
          margin: 0;
          flex: 2;
          margin-right: 1rem;
        }
        .date {
          flex: 1;
          max-width: auto;
        }
      }
    }
    .second {
      .sale-lines {
        .sale-line {
          .sale-line-content {
            flex-direction: row;
            align-items: center;
            .name {
              width: 30%;
            }
            .rest {
              flex: 1;
              padding: 0 1rem;
            }
          }
        }
      }
    }
    .footer {
      .btns {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        .btn {
          width: auto;
          &:last-child {
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
