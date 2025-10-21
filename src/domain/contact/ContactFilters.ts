interface BaseFilters {
  globalSearch?: string;
  nameContains?: string;
  countryIn?: string[];
  orderBy?: string;
}

export interface ContactFilters extends BaseFilters {
  emailContains?: string;
  phonesContains?: string;
  typeIn?: string[];
}

export interface CustomerFilters extends BaseFilters {
  vatContains?: string;
  emailContains?: string;
  phonesContains?: string;
}

export interface GuestFilters extends BaseFilters {
  documentContains?: string;
  inHouseOnly?: boolean;
}

export interface AgencyFilters extends Omit<ContactFilters, 'typeIn'> {}

export interface SupplierFilters extends BaseFilters {
  vatContains?: string;
  emailContains?: string;
  phonesContains?: string;
}
