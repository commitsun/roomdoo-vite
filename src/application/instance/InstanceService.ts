import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

const english: { code: string; name: string } = { code: 'en-US', name: 'English' };
const spanish: { code: string; name: string } = { code: 'es-ES', name: 'Español' };
const english_GB: { code: string; name: string } = { code: 'en-GB', name: 'English' };

export const APP_LANGUAGES = [english, spanish, english_GB];

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  async fetchInstance(): Promise<Instance> {
    let [instance, languages] = await Promise.all([
      this.instanceRepository.fetchInstance(),
      this.instanceRepository.fetchLanguages(),
    ]);
    const appLanguageCodes = APP_LANGUAGES.map((lang) => lang.code);
    languages = languages.map((lang) => {
      return {
        ...lang,
        code: lang.code.replace('_', '-'),
      };
    });
    languages = languages.filter((lang) => appLanguageCodes.includes(lang.code));

    if (languages.length === 0) {
      languages = [english];
    }
    return {
      ...instance,
      languages,
    };
  }
}
