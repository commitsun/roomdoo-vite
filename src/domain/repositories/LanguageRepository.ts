import type { Language } from '../entities/Language';

export interface LanguageRepository {
  getLanguages(): Promise<Language[]>;
}
