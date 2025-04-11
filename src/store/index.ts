import { createStore } from 'vuex';
import accountJournals, { type AccountJournalsStateInterface } from './accountJournals';
import address, { type AddressStateInterface } from './address';
import agencies, { type AgenciesStateInterface } from './agencies';
import amenities, { type AmenitiesStateInterface } from './amenities';
import amenityTypes, { type AmenityTypesStateInterface } from './amenityTypes';
import availability, { type AvailabilityStateInterface } from './availability';
import availabilityPlans, { type AvailabilityPlanStateInterface } from './availabilityPlans';
//
import transactions, { type TransactionsStateInterface } from './transactions';
import type { BoardServiceLinesStateInterface } from './boardServiceLines';
import type { BoardServicesStateInterface } from './boardServices';
import type { CancelationRulesStateInterface } from './cancelationRules';
import type { CashRegisterStateInterface } from './cashRegister';
import type { CategoryStateInterface } from './categories';
import type { CheckinPartnerStateInterface } from './checkinPartners';
import type { CountryStateInterface } from './countries';
import type { CountryStatesStateInterface } from './countryStates';
import type { DashboardStateInterface } from './dashboard';
import type { DocumentTypeStateInterface } from './documentType';
import type { ExtraBedsStateInterface } from './extraBeds';
import type { FoliosStateInterface } from './folios';
import type { FolioServicesStateInterface } from './folioServices';
import type { InvoicesStateInterface } from './invoices';
import type { LanguageStateInterface } from './languages';
import type { LayoutStateInterface } from './layout';
import type { NotificationsStateInterface } from './notifications';
import type { OcrDocumentStateInterface } from './ocrDocument';
import type { PartnerStateInterface } from './partners';
import type { PaymentTermStateInterface } from './paymentTerms';
import type { PlanningStateInterface } from './planning';
import type { PrecheckinStateInterface } from './precheckin';
import type { PricelistStateInterface } from './pricelists';
import type { PricesStateInterface } from './prices';
import type { ProductsStateInterface } from './products';
import type { PropertyStateInterface } from './properties';
import type { ReservationLinesStateInterface } from './reservationLines';
import type { ReservationStateInterface } from './reservations';
import type { RoomClosureReasonsStateInterface } from './roomClosureReasons';
import type { RoomsStateInterface } from './rooms';
import type { RoomTypeClassStateInterface } from './roomTypeClasses';
import type { RoomTypeStateInterface } from './roomTypes';
import type { SaleChannelsStateInterface } from './saleChannels';
import type { ServiceStateInterface } from './services';
import type { UbicationStateInterface } from './ubications';
import type { UserStateInterface } from './user';
import type { UsersStateInterface } from './users';
import boardServiceLines from './boardServiceLines';
import boardServices from './boardServices';
import cancelationRules from './cancelationRules';
import cashRegister from './cashRegister';
import categories from './categories';
import checkinPartners from './checkinPartners';
import countries from './countries';
import countryStates from './countryStates';
import dashboard from './dashboard';
import documentType from './documentType';
import extraBeds from './extraBeds';
import folios from './folios';
import folioServices from './folioServices';
import invoices from './invoices';
import languages from './languages';
import layout from './layout';
import notifications from './notifications';
import ocrDocument from './ocrDocument';
import partners from './partners';
import paymentTerms from './paymentTerms';
import planning from './planning';
import precheckin from './precheckin';
import pricelists from './pricelists';
import prices from './prices';
import products from './products';
import properties from './properties';
import reservationLines from './reservationLines';
import reservations from './reservations';
import roomClosureReasons from './roomClosureReasons';
import rooms from './rooms';
import roomTypeClasses from './roomTypeClasses';
import roomTypes from './roomTypes';
import saleChannels from './saleChannels';
import services from './services';
import ubications from './ubications';
import user from './user';
import users from './users';

export interface RootState {
  accountJournals: AccountJournalsStateInterface;
  address: AddressStateInterface;
  agencies: AgenciesStateInterface;
  amenities: AmenitiesStateInterface;
  amenityTypes: AmenityTypesStateInterface;
  availability: AvailabilityStateInterface;
  availabilityPlans: AvailabilityPlanStateInterface;
  boardServices: BoardServicesStateInterface;
  boardServiceLines: BoardServiceLinesStateInterface;
  cancelationRules: CancelationRulesStateInterface;
  cashRegister: CashRegisterStateInterface;
  categories: CategoryStateInterface;
  checkinPartners: CheckinPartnerStateInterface;
  countries: CountryStateInterface;
  countryStates: CountryStatesStateInterface;
  dashboard: DashboardStateInterface;
  documentType: DocumentTypeStateInterface;
  extraBeds: ExtraBedsStateInterface;
  folios: FoliosStateInterface;
  folioServices: FolioServicesStateInterface;
  invoices: InvoicesStateInterface;
  languages: LanguageStateInterface;
  layout: LayoutStateInterface;
  notifications: NotificationsStateInterface;
  ocrDocument: OcrDocumentStateInterface;
  partners: PartnerStateInterface;
  paymentTerms: PaymentTermStateInterface;
  planning: PlanningStateInterface;
  prices: PricesStateInterface;
  pricelists: PricelistStateInterface;
  products: ProductsStateInterface;
  properties: PropertyStateInterface;
  reservations: ReservationStateInterface;
  reservationLines: ReservationLinesStateInterface;
  reservationState: ReservationStateInterface;
  rooms: RoomsStateInterface;
  roomClosureReasons: RoomClosureReasonsStateInterface;
  roomTypes: RoomTypeStateInterface;
  roomTypeClasses: RoomTypeClassStateInterface;
  saleChannels: SaleChannelsStateInterface;
  services: ServiceStateInterface;
  transactions: TransactionsStateInterface;
  ubications: UbicationStateInterface;
  user: UserStateInterface;
  users: UsersStateInterface;
  precheckin: PrecheckinStateInterface;
}

// Exporta el tipo del estado global
export type StateInterface = RootState;

export const store = createStore<StateInterface>({
  modules: {
    accountJournals,
    address,
    agencies,
    amenities,
    amenityTypes,
    availability,
    availabilityPlans,
    boardServices,
    boardServiceLines,
    cancelationRules,
    cashRegister,
    categories,
    checkinPartners,
    countries,
    countryStates,
    dashboard,
    documentType,
    extraBeds,
    folios,
    folioServices,
    invoices,
    languages,
    layout,
    notifications,
    ocrDocument,
    partners,
    paymentTerms,
    planning,
    precheckin,
    prices,
    pricelists,
    products,
    properties,
    reservations,
    reservationLines,
    rooms,
    roomClosureReasons,
    roomTypes,
    roomTypeClasses,
    saleChannels,
    services,
    transactions,
    ubications,
    user,
    users,
  },
});

export function useStore() {
  return store;
}
