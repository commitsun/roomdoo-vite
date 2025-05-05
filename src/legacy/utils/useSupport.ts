import { useStore } from '@/legacy/store';

export function useSupport() {
  const store = useStore();

  function openSupportTab() {
    const pattern = /https:\/\/([^./]+(?:\.[^./]+)*)[./]/;
    const url = window.location.href;
    const matches = pattern.exec(url);
    const subUrl = matches ? matches[1] : '';
    const supportUrl = `https://roomdoo.typeform.com/soporte#user_name=${
      store.state.user.activeUser?.userName ?? ''
    }&property_id=${
      store.state.properties.activeProperty?.id ?? 0
    }&instance=${subUrl}&property_name=${store.state.properties.activeProperty?.name ?? ''}`;
    window.open(supportUrl, '_blank');
  }

  return { openSupportTab };
}
