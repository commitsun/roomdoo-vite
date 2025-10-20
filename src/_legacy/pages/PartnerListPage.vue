<template>
  <div class="page" id="partners-page">
    <div class="page-container">
      <div class="header">
        <div class="left">
          <img src="/app-images/icon-burger.svg" @click="openLeftDrawer" class="icon-menu" />
          <CustomIcon
            image-path="/app-images/search.svg"
            class="input-icon"
            color="primary"
            height="1.5rem"
            width="1.5rem"
          />
          <input placeholder="Buscar contacto" class="input-search" v-model="partnerTextSearch" />
          <div
            class="select-filters"
            :class="isFilterOpened ? 'select-filters-open' : ''"
            tabindex="1"
          >
            <div class="filter-top" @click="isFilterOpened = !isFilterOpened">
              <img class="filter-img" src="/app-images/filter-icon-tuning-black.svg" />

              <span>
                {{ numFiltersApplied > 0 ? `${numFiltersApplied}` : '' }}
                Filtro{{ numFiltersApplied === 1 ? '' : 's' }} de clientes
              </span>
              <img src="/app-images/dropdown.svg" class="dropdown-img" />
            </div>
            <div class="filter-options" v-if="isFilterOpened">
              <div class="multiselect-container">
                <div class="filter-type-container">
                  <span class="title">Tipo de cliente</span>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isIndividual"
                      @click.stop="toggleIndividual()"
                    />
                    <span @click="(isIndividual = !isIndividual), toggleIndividual()">
                      Particulares
                    </span>
                  </div>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isAgency"
                      @click.stop="toggleAgency()"
                    />
                    <span @click="(isAgency = !isAgency), toggleAgency()"> Agencias </span>
                  </div>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isCompany"
                      @click.stop="toggleCompany()"
                    />
                    <span @click="(isCompany = !isCompany), toggleCompany()"> Empresas </span>
                  </div>
                </div>
                <MultiSelect title="Alojados" v-model="selectedHoused" :options="housedOptions" />
              </div>
              <div v-if="numFiltersApplied > 0" class="clear-filters">
                <span @click="clearFilters"> Borrar filtros </span>
              </div>
            </div>
          </div>
        </div>
        <CustomIcon
          image-path="/app-images/icon-filters.svg"
          class="icon-filters"
          color="primary"
          height="20px"
          width="20px"
          @click="showFilters = !showFilters"
        />
        <button class="btn-new-partner" @click="openCreatePartner()">
          <CustomIcon
            imagePath="/app-images/icon-add-white.svg"
            class="icon"
            color="white"
            height="22px"
            width="22px"
          />
          <span class="text"> Nuevo contacto </span>
        </button>
      </div>
      <div class="main-content">
        <div class="drawer-filters" :class="!showFilters ? 'drawer-filters-hidden' : ''">
          <div
            class="select-filters"
            :class="isFilterOpened ? 'select-filters-open' : ''"
            tabindex="1"
          >
            <div class="filter-top" @click="isFilterOpened = !isFilterOpened">
              <img class="filter-img" src="/app-images/filter-icon-tuning-black.svg" />

              <span>
                {{ numFiltersApplied > 0 ? `${numFiltersApplied}` : '' }}
                Filtro{{ numFiltersApplied === 1 ? '' : 's' }} de clientes
              </span>
              <img src="/app-images/dropdown.svg" class="dropdown-img" />
            </div>
            <div class="filter-options" v-if="isFilterOpened">
              <div class="multiselect-container">
                <div class="filter-type-container">
                  <span class="title">Tipo de cliente</span>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isIndividual"
                      @click.stop="toggleIndividual()"
                    />
                    <span @click="(isIndividual = !isIndividual), toggleIndividual()">
                      Particulares
                    </span>
                  </div>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isAgency"
                      @click.stop="toggleAgency()"
                    />
                    <span @click="(isAgency = !isAgency), toggleAgency()"> Agencias </span>
                  </div>
                  <div class="filter-type-row">
                    <CheckboxComponent
                      class="checkbox"
                      v-model="isCompany"
                      @click.stop="toggleCompany()"
                    />
                    <span @click="(isCompany = !isCompany), toggleCompany()"> Empresas </span>
                  </div>
                </div>
                <MultiSelect title="Alojados" v-model="selectedHoused" :options="housedOptions" />
              </div>
              <div v-if="numFiltersApplied > 0" class="clear-filters">
                <span @click="clearFilters"> Borrar filtros </span>
              </div>
            </div>
          </div>
        </div>
        <ListComponent
          :schema="schema"
          :listData="partnersList"
          @selectItem="setCurrentPartner($event)"
          @scrollInBottom="fetchMorePartners"
          @sort="sortPartnersByField($event)"
        />
      </div>
      <div class="new-partner" @click="openCreatePartner()">
        <img src="/app-images/icon-add-white.svg" class="icon-add" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import { type SchemaInterface } from '@/_legacy/interfaces/Lists';
import { type PayloadPartnerRequestInterface } from '@/_legacy/interfaces/PayloadPartnerRequestInterface';

import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import MultiSelect from '@/_legacy/components/roomdooComponents/MultiSelect.vue';
import CheckboxComponent from '@/_legacy/components/roomdooComponents/CheckboxComponent.vue';

import ListComponent from '@/_legacy/components/roomdooComponents/ListComponent.vue';
import { usePartner } from '@/_legacy/utils/usePartner';
import { defineComponent, computed, onMounted, onUnmounted, ref, watch, markRaw } from 'vue';

import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    PartnerForm,
    CustomIcon,
    MultiSelect,
    CheckboxComponent,
    ListComponent,
  },
  emits: ['openLeftDrawer'],
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const housedOptions = [
      { id: 0, name: 'Ahora' },
      { id: 1, name: 'Última semana' },
      { id: 2, name: 'Último mes' },
    ];

    const limit = 40;

    const partnerTextSearch = ref('');
    const selectedHoused = ref([] as number[]);
    const maxPage = ref(0);
    const currentPage = ref(1);
    const openPartnerDialog = ref(false);
    const isFilterOpened = ref(false);
    const showFilters = ref(false);
    const showTags = ref(false);
    const selectedOrder = ref({
      field: '',
      isDesc: false,
    });
    const isIndividual = ref(false);
    const isAgency = ref(false);
    const isCompany = ref(false);

    const countries = computed(() => store.state.countries.countries);
    const partners = computed(() => store.state.partners.partners);
    const categories = computed(() => store.state.categories.categories);
    const totalPartners = computed(() => store.state.partners.totalPartners);

    const numFiltersApplied = computed(() => {
      const numFilters =
        selectedHoused.value.length +
        (isIndividual.value ? 1 : 0) +
        (isAgency.value ? 1 : 0) +
        (isCompany.value ? 1 : 0);
      return numFilters;
    });

    const openNewPartner = () => {
      void store.dispatch('layout/rightDrawerDisplayed', true);
      void store.dispatch('layout/changeRightDrawerContent', 'PartnerDetail');
      openPartnerDialog.value = false;
    };

    const tagNameById = (tagId: number) => {
      const category = categories.value.find((element) => element.id === tagId);
      return category?.name ?? '';
    };

    const countryCode = (countryId: number) =>
      countries.value.find((el) => el.id === countryId)?.code.toLowerCase();

    const countryName = (countryId: number) =>
      countries.value.find((el) => el.id === countryId)?.name;

    const partnerType = (isAgencyBool: boolean, isCompanyBool: boolean) => {
      if (isAgencyBool) {
        return 'Agencia';
      }
      if (isCompanyBool) {
        return 'Empresa';
      }
      return 'Particular';
    };

    const setCurrentPartner = async (partnerSelected: PartnerInterface) => {
      const partner = partners.value.find((el) => el.id === partnerSelected.id);
      await store.dispatch('partners/setCurrentPartner', partner);
      void store.dispatch('layout/rightDrawerDisplayed', true);
      void store.dispatch('layout/changeRightDrawerContent', 'PartnerDetail');
    };

    const splitPhone = (phone: string) => {
      if (phone.substring(phone.length - 1) === '.') {
        phone = phone.substring(0, phone.length - 1);
      }
      return phone.split(' ').join('');
    };

    const clearFilters = () => {
      isIndividual.value = false;
      isAgency.value = false;
      isCompany.value = false;
      selectedHoused.value = [];
    };

    const getBackgroundColor = (isAgencyBool: boolean, isCompanyBool: boolean) => {
      let color = '#1E9ED9';
      if (isAgencyBool) {
        color = '#475D66';
      } else if (isCompanyBool) {
        color = '#FFB900';
      }
      return color;
    };

    const openLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', true);
      context.emit('openLeftDrawer');
    };

    const openCreatePartner = async () => {
      await store.dispatch('partners/setCurrentPartner', null);
      openPartnerDialog.value = true;
      dialogService.open({
        header: 'Nuevo contacto',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const sortPartnersByField = (field: string) => {
      selectedOrder.value = { field, isDesc: !selectedOrder.value.isDesc };
    };

    const toggleTooltip = (partner: PartnerInterface, firstTag: string) => {
      if (firstTag.length > 18 || partner.tagIds.length > 1) {
        if (document.getElementById(`tooltip-${partner?.id}`)?.classList.contains('show')) {
          document.getElementById(`tooltip-${partner?.id}`)?.classList.remove('show');
        } else {
          document.getElementById(`tooltip-${partner?.id}`)?.classList.add('show');
        }
      }
    };

    const toggleIndividual = () => {
      if (isAgency.value) {
        isAgency.value = false;
      }
      if (isCompany.value) {
        isCompany.value = false;
      }
    };

    const toggleAgency = () => {
      if (isIndividual.value) {
        isIndividual.value = false;
      }
      if (isCompany.value) {
        isCompany.value = false;
      }
    };

    const toggleCompany = () => {
      if (isIndividual.value) {
        isIndividual.value = false;
      }
      if (isAgency.value) {
        isAgency.value = false;
      }
    };

    const getFirstLetters = (name: string) => {
      const firstLetters = name.split(' ').map((word) => word[0]);
      return firstLetters.join('').substring(0, 2).toUpperCase();
    };

    const fetchMorePartners = () => {
      let payload;
      void store.dispatch('layout/showSpinner', true);
      currentPage.value += 1;
      payload = {
        limit,
        multiFieldSearch: partnerTextSearch.value,
        isIndividual: isIndividual.value,
        isAgency: isAgency.value,
        isCompany: isCompany.value,
        offset: (currentPage.value - 1) * limit,
      };
      if (selectedHoused.value.length > 0) {
        const today = new Date();
        const filteredHousedOptions = housedOptions.filter((el) =>
          selectedHoused.value.includes(el.id)
        );
        if (filteredHousedOptions.find((el) => el.id === 0)) {
          payload = {
            ...payload,
            inHouse: 'true',
            // TODO: review this field
            housedNow: true,
          };
        }
        if (filteredHousedOptions.find((el) => el.id === 1)) {
          const lastweek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          payload = {
            ...payload,
            housedFrom: lastweek,
            housedTo: today,
            // TODO: review this field
            housedLastWeek: true,
          };
        }
        if (filteredHousedOptions.find((el) => el.id === 2)) {
          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          payload = {
            ...payload,
            housedFrom: lastMonth,
            housedTo: today,
            // TODO: review this field
            housedLastMonth: true,
          };
        }
      }
      fetchPartners(payload);
      void store.dispatch('layout/showSpinner', false);
    };

    const schema: SchemaInterface[] = [
      {
        label: 'Contacto',
        fieldType: 'textBoldWithAvatar',
        fieldName: 'name',
        avatar: 'avatar',
        avatarColor: 'avatarColor',
        mobileAllowed: true,
        isSortable: true,
        columnWidth: 2,
      },
      {
        label: 'Tipo',
        fieldType: 'text',
        fieldName: 'type',
      },
      {
        label: 'Ult.estancia',
        fieldType: 'text',
        fieldName: 'lastStay',
      },
      {
        label: 'País',
        fieldType: 'textWithAvatar',
        fieldName: 'nationality',
        avatarImage: 'avatarImage',
      },
      {
        label: 'Email',
        fieldType: 'tag',
        fieldName: 'email',
        columnWidth: 2,
      },
      {
        label: 'Teléfono',
        fieldType: 'tag',
        fieldName: 'phone',
      },
      {
        label: 'Identificación',
        fieldType: 'tag',
        fieldName: 'documentNumber',
        mobileAllowed: true,
        align: window.innerWidth < 1024 ? 'right' : 'left',
      },
      {
        label: 'Etiquetas',
        fieldType: 'tagList',
        fieldName: 'tags',
      },
    ];

    const partnersList = computed(() =>
      partners.value.map((partner) => ({
        id: partner.id,
        name: partner.name || '',
        avatar: getFirstLetters(partner.name),
        avatarColor: getBackgroundColor(partner.isAgency, partner.isCompany),
        avatarImage:
          partner.nationality && partner.nationality !== 0
            ? `/country-flags/${countryCode(partner.nationality) || ''}.svg`
            : '',
        type: partnerType(partner.isAgency, partner.isCompany) || '',
        lastStay: partner.lastStay || '',
        nationality: countryName(partner.nationality) || '',
        nationalityCode: countryCode(partner.nationality),
        email: partner.email || '',
        phone: partner.mobile || partner.phone || '',
        documentNumber: partner.vatNumber || '',
        tags: partner.tagIds.map((tagId) => tagNameById(tagId)),
      }))
    );

    watch(partners, () => {
      maxPage.value = Math.ceil(totalPartners.value / limit);
    });
    const fetchResults = async () => {
      void store.dispatch('layout/showSpinner', true);
      let payload: PayloadPartnerRequestInterface;
      currentPage.value = 1;

      await store.dispatch('partners/removePartners');
      payload = {
        limit,
        multiFieldSearch: partnerTextSearch.value,
        isIndividual: isIndividual.value,
        isAgency: isAgency.value,
        isCompany: isCompany.value,
        offset: 0,
      };
      if (selectedHoused.value.length > 0) {
        const today = new Date();
        const filteredHousedOptions = housedOptions.filter((el) =>
          selectedHoused.value.includes(el.id)
        );
        if (filteredHousedOptions.find((el) => el.id === 0)) {
          payload = {
            ...payload,
            inHouse: 'true',
            // TODO: review this field
            housedNow: true,
          };
        }
        if (filteredHousedOptions.find((el) => el.id === 1)) {
          const lastweek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          payload = {
            ...payload,
            housedFrom: lastweek,
            housedTo: today,
            // TODO: review this field
            housedLastWeek: true,
          };
        }
        if (filteredHousedOptions.find((el) => el.id === 2)) {
          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          payload = {
            ...payload,
            housedFrom: lastMonth,
            housedTo: today,
            // TODO: review this field
            housedLastMonth: true,
          };
        }
      }
      if (selectedOrder.value) {
        payload = {
          ...payload,
          orderBy: selectedOrder.value.field,
          orderDesc: selectedOrder.value.isDesc,
        };
      }
      fetchPartners(payload);
      void store.dispatch('layout/showSpinner', false);
    };

    watch(
      [partnerTextSearch, selectedHoused, isIndividual, isAgency, isCompany, selectedOrder],
      () => {
        void fetchResults();
      },
      { deep: true }
    );

    onMounted(async () => {
      void store.dispatch('categories/fetchCategories');
      void store.dispatch('layout/showSpinner', true);
      await Promise.all([
        await store.dispatch('countries/fetchCountries'),
        fetchPartners({ limit, offset: 0 }),
      ]);
      void store.dispatch('layout/showSpinner', false);
    });

    onUnmounted(() => {
      void store.dispatch('partners/removePartners');
      if (store.state.partners.currentPartner !== null) {
        void store.dispatch('partners/setCurrentPartner', null);
      }
    });

    return {
      maxPage,
      currentPage,
      partners,
      categories,
      countries,
      housedOptions,
      partnerTextSearch,
      isFilterOpened,
      openPartnerDialog,
      numFiltersApplied,
      showFilters,
      selectedHoused,
      showTags,
      schema,
      partnersList,
      isIndividual,
      isAgency,
      isCompany,
      countryCode,
      splitPhone,
      partnerType,
      openNewPartner,
      countryName,
      tagNameById,
      setCurrentPartner,
      clearFilters,
      getBackgroundColor,
      openLeftDrawer,
      openCreatePartner,
      sortPartnersByField,
      toggleTooltip,
      getFirstLetters,
      fetchMorePartners,
      toggleIndividual,
      toggleAgency,
      toggleCompany,
    };
  },
});
</script>
<style lang="scss" scoped>
.page {
  height: 100%;
  .page-container {
    height: 100%;
    .header {
      width: 100%;
      height: 60px;
      padding-left: 0.5rem;
      padding-right: 1.6rem;
      padding-bottom: 0.8rem;
      background-color: #f8f8f8;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);
      margin-bottom: 1rem;
      position: relative;
      .left {
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 15px;
        .icon-menu {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .input-search {
          background: white;
          width: 100%;
          border-radius: 10px;
          border: none;
          margin-left: 0.5rem;
          display: flex;
          align-items: center;
          font-size: 18px;
          &:focus {
            outline: none;
          }
          &::placeholder {
            color: #5f6367;
          }
        }
        .input-icon {
          position: absolute;
          top: 1.3rem;
          color: rgb(147, 147, 146);
          transform: translateY(-50%);
          left: 2rem;
          display: none;
        }
        .select-filters {
          display: none;
          position: relative;
          width: 230px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
          margin: 0 2rem;
          outline: none;
          background-color: white;
          .filter-top {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            .filter-img {
              width: 18px;
              height: 18px;
            }
            span {
              font-size: 15px;
            }
            .dropdown-img {
              width: 11px;
              height: 7px;
              margin-top: 0.3rem;
            }
          }
          .filter-options {
            position: absolute;
            top: 35px;
            left: -1px;
            width: 101%;
            z-index: 120;
            border-right: 1px solid #d2ecf2;
            border-left: 1px solid #d2ecf2;
            border-bottom: 1px solid #d2ecf2;
            background-color: white;
            border-radius: 0 0 10px 10px;
            display: flex;
            flex-direction: column;
            box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

            .multiselect-container {
              max-height: 850px;
              overflow-y: scroll;
              flex: 1 1 auto;
              .filter-type-container {
                margin-left: 1rem;
                margin-top: 1rem;
                .title {
                  font-size: 15px;
                  font-weight: 600;
                  padding-bottom: 0.5rem;
                }
                .filter-type-row {
                  display: flex;
                  align-items: center;
                  margin: 0.25rem 0;
                  font-size: 15px;
                  margin-left: 1rem;
                  .checkbox {
                    margin-right: 0.5rem;
                    width: 20px;
                    height: 20px;
                  }
                }
              }
            }
            .clear-filters {
              padding: 0.5rem 1rem;
              border-top: 1px solid grey;
              color: $primary;
            }
          }
        }
        .select-filters-open {
          background-color: white;
          border-radius: 10px 10px 0 0;
          box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
          .dropdown-img {
            transform: rotate(180deg);
          }
        }
      }

      .btn-new-partner {
        color: white;
        background-color: $primary;
        border-radius: 10px;
        height: 3rem;
        width: 13rem;
        padding: 0;
        border: none;
        cursor: pointer;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        margin-right: 40px;
        display: none;
        .icon {
          font-weight: bold;
          margin: 0 1rem;
          height: 22px;
          width: 22px;
        }
      }
      .icon-filters {
        margin-bottom: 5px;
      }
    }
    .main-content {
      height: 100%;

      .drawer-filters {
        padding-bottom: 0.5rem;
        padding-right: 11px;
        padding-left: 11px;
        justify-content: space-between;
        transition: max-height 0.2s ease;
        height: 45px;
        max-height: 1000px;
        .select-filters {
          position: relative;
          width: 60%;
          height: 40px;
          border: 1px solid #d2ecf2;
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
          outline: none;
          margin-left: 1rem;
          .filter-top {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            .filter-img {
              width: 18px;
              height: 18px;
            }
            span {
              font-size: 15px;
            }
            .dropdown-img {
              width: 11px;
              height: 7px;
              margin-top: 0.3rem;
            }
          }
          .filter-options {
            position: absolute;
            top: 35px;
            left: -1px;
            width: 101%;
            z-index: 120;
            border-right: 1px solid #d2ecf2;
            border-left: 1px solid #d2ecf2;
            border-bottom: 1px solid #d2ecf2;
            background-color: white;
            border-radius: 0 0 10px 10px;
            display: flex;
            flex-direction: column;
            box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

            .multiselect-container {
              max-height: 850px;
              overflow-y: scroll;
              flex: 1 1 auto;
              .filter-type-container {
                margin-top: 1rem;
                .title {
                  font-size: 15px;
                  font-weight: 600;
                  padding-bottom: 0.5rem;
                  margin-left: 0.5rem;
                }
                .filter-type-row {
                  display: flex;
                  align-items: center;
                  margin: 0.25rem 0;
                  font-size: 15px;
                  margin-left: 1rem;
                  .checkbox {
                    margin-right: 0.5rem;
                    width: 20px;
                    height: 20px;
                  }
                }
              }
            }

            .clear-filters {
              padding: 0.5rem 1rem;
              border-top: 1px solid grey;
              color: $primary;
            }
          }
        }
        .select-filters-open {
          background-color: white;
          border-radius: 10px 10px 0 0;
          box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
          .dropdown-img {
            transform: rotate(180deg);
          }
        }
      }
      .drawer-filters-hidden {
        max-height: 0;
        padding-bottom: 0;
        transition: max-height 0.2s ease;
        overflow: hidden;
      }
      .table-header {
        background-color: #f0fcff;
        display: flex;
        height: 40px;
        font-size: 15px;
        font-weight: bold;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        display: none;
      }
      .table-content {
        height: calc(100% - 80px);
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        padding: 0 12px 0 15px;
        &::-webkit-scrollbar {
          display: none;
        }
        .partner-row {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(211, 211, 211, 0.46);
          width: 100%;
          .partner {
            padding: 8px 0;
            display: flex;
            align-items: center;
            width: 100%;
            .partner-contact {
              display: flex;
              align-items: center;
              width: 100%;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              .avatar {
                min-width: 30px;
                max-width: 30px;
                height: 30px;
                border-radius: 15px;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 16px;
                font-weight: bold;
                margin: 0 1rem;
              }
              .partner-name {
                font-size: 16px;
                font-weight: 600;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
              }
            }
            .partner-doc-number {
              margin-left: auto;
              color: #263941;
              background-color: #f6f6f6;
              padding: 3px 8px;
              border-radius: 20px;
            }
            .partner-type {
              display: none;
            }
            .partner-last-stay {
              display: none;
            }
            .partner-nationality {
              display: none;
            }
            .partner-email {
              display: none;
            }
            .partner-phone {
              display: none;
            }
            .partner-tags {
              display: none;
            }
          }
        }
      }
    }
  }
  .new-partner {
    position: fixed;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    margin: 0 1rem 1.5rem 0;
    background: rgba(255, 255, 255, 0.58);
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.58);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
    z-index: 50;
    .icon-add {
      width: 1rem;
      height: 1rem;
    }
  }
}
@media (min-width: 1024px) {
  .page {
    .page-container {
      .header {
        width: 100%;
        height: 80px;
        padding-left: 0;
        padding-right: 1.6rem;
        background-color: #f8f8f8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);
        margin-left: 1rem;
        margin-bottom: 0;
        .left {
          padding-left: 7px;
          .icon-menu {
            display: none;
          }
          .input-search {
            background: white;
            width: 275px;
            border-radius: 10px;
            border: none;
            height: 40px;
            padding-left: 40px;
            display: flex;
            align-items: center;
            font-size: 16px;
            &:focus {
              outline: none;
            }
          }
          .input-icon {
            display: inline;
          }
          .select-filters {
            display: flex;
          }
        }
        .btn-new-partner {
          margin-right: 7px;
        }
        .icon-filters {
          display: none;
        }
        .btn-new-partner {
          display: flex;
        }
      }
      .main-content {
        height: 100%;
        margin-left: 1rem;
        .table-header {
          background-color: #f8f8f8;
          height: 40px;
          font-weight: bold;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 1fr;
          column-gap: 10px;
          align-items: center;
          padding: 0 1rem;
          .partner-data-title:last-child {
            display: none;
          }
          .partner-type-title {
            margin-left: 3px;
          }
        }
        .table-content {
          padding-top: 1rem;
          &::-webkit-scrollbar {
            display: block;
          }
          .partner-row {
            display: inline;
            padding: 0 0.2rem;
            .partner {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 1fr;
              align-items: center;
              .partner-contact {
                .avatar {
                  margin-left: 0;
                }
                .partner-name {
                  margin-right: 15px;
                }
              }
              .partner-type {
                display: inline;
                font-size: 14px;
              }
              .partner-last-stay {
                display: inline;
                font-size: 14px;
              }
              .partner-nationality {
                display: flex;
                align-items: center;
                margin-left: 3px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                .flag {
                  width: 25px;
                  height: 25px;
                  margin-right: 15px;
                }
              }
              .partner-email {
                display: inline;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                font-size: 14px;
                margin-left: 5px;
                span {
                  color: #263941;
                  background-color: #f6f6f6;
                  padding: 3px 14px;
                  border-radius: 20px;
                }
              }
              .partner-phone {
                display: inline;
                font-size: 14px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                margin-left: 5px;
                span {
                  color: #263941;
                  background-color: #f6f6f6;
                  padding: 3px 14px;
                  border-radius: 20px;
                }
              }
              .partner-tags {
                display: none;
                font-size: 14px;
                margin-left: 7px;
                position: relative;
                .tag-wrap {
                  border-radius: 20px;
                  max-width: 18ch;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  background-color: #f6f6f6;
                  padding: 0 14px;
                  color: #263941;
                }
                .more-tags {
                  color: #263941;
                  background-color: #f6f6f6;
                  padding: 0 8px;
                  border-radius: 20px;
                  font-size: 14px;
                }
                .tags-tooltip {
                  position: absolute;
                  top: -10px;
                  left: -80px;
                  width: max-content;
                  padding: 5px 15px;
                  background-color: #87cefa;
                  color: white;
                  font-weight: bold;
                  border-radius: 10px;
                  text-align: center;
                  visibility: hidden;
                  transform: translateY(-100%);
                  opacity: 0;
                  transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .show {
                  visibility: visible;
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              .partner-doc-number {
                margin-left: 5px;
                padding: 0;
                background-color: white;
                font-size: 14px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                span {
                  color: #263941;
                  background-color: #f6f6f6;
                  padding: 3px 14px;
                  border-radius: 20px;
                }
              }
            }
            &:hover {
              box-shadow: 0px 0 4px rgb(190, 190, 190);
              border-radius: 10px;
            }
          }
        }
      }
    }
    .new-partner {
      display: none;
    }
  }
}
@media (min-width: 1240px) {
  .page {
    .page-container {
      .main-content {
        .table-header {
          grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 1fr 1fr;
          .partner-data-title:last-child {
            display: block;
          }
        }
        .table-content {
          .partner-row {
            .partner {
              grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 1fr 1fr;
              .partner-tags {
                display: flex;
              }
            }
          }
        }
      }
    }
  }
}
</style>
