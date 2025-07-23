import { useStore } from '@/_legacy/store';
import { useUserStore } from '@/infrastructure/stores/user';

export function useSupport() {
  const store = useStore();
  const userStore = useUserStore();
  function openSupportTab() {
    const pattern = /https:\/\/([^./]+(?:\.[^./]+)*)[./]/;
    const url = window.location.href;
    const matches = pattern.exec(url);
    const subUrl = matches ? matches[1] : '';
    const userName = [
      userStore.user?.firstName ?? '',
      userStore.user?.lastName ?? '',
      userStore.user?.lastName2 ?? ''
    ].filter(Boolean).join(' ');
    const supportUrl = `https://roomdoo.typeform.com/soporte#user_name=${userName}&property_id=${
      store.state.properties.activeProperty?.id ?? 0
    }&instance=${subUrl}&property_name=${store.state.properties.activeProperty?.name ?? ''}`;
    window.open(supportUrl, '_blank');
  }

  return { openSupportTab };
}
