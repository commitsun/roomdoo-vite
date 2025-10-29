import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

export function useBookAINotifier() {
  const toast = useToast();
  const router = useRouter();

  function notify(chatId: string, title: string, preview: string) {
    toast.add({
      severity: 'info',
      summary: title,
      detail: preview,
      life: 3500,
    });
    const container = document.querySelector('.p-toast') as HTMLElement | null;
    if (container) {
      const handler = () => {
        router.push({ name: 'book-ai', query: { chat: chatId } });
        container.removeEventListener('click', handler);
      };
      container.addEventListener('click', handler, { once: true });
    }
  }

  return { notify };
}
