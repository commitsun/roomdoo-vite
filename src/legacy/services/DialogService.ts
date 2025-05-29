import { reactive } from 'vue';
import type { Component } from 'vue';

export interface DialogOptions {
  iconHeader?: string; // Icono para el título del diálogo
  iconHeaderColor?: string; // Color del icono del título
  header: string; // Título del diálogo
  content: string | Component; // Componente para el contenido del diálogo
  footer?: Component; // Componente para el pie del diálogo
  props?: Record<string, unknown>; // Props dinámicos para el contenido
  modal?: boolean; // Si el diálogo debe ser modal (por defecto true)
  closable?: boolean; // Si el diálogo debe ser cerrable (por defecto true)
  visible?: boolean;
  btnAccept?: string; // Texto del botón de aceptar
  btnCancel?: string; // Texto del botón de cancelar
  onClose?: (result?: unknown) => void; // Callback al cerrar el diálogo
  onAccept?: (result?: unknown) => unknown; // Callback al aceptar el diálogo
}

class DialogService {
  dialogs = reactive<DialogOptions[]>([]);

  open(options: DialogOptions) {
    this.dialogs.push({
      modal: true,
      closable: true,
      visible: true,
      ...options, // Configuraciones por defecto sobrescritas por las específicas
    });
  }

  close(index: number, result?: unknown) {
    const dialog = this.dialogs[index];
    if (dialog?.onClose) {
      dialog.onClose(result);
    }
    this.dialogs.splice(index, 1);
  }
  accept(index: number, data?: unknown) {
    const dialog = this.dialogs[index];
    if (typeof dialog.onAccept === 'function') {
      dialog.onAccept(data);
    }
    this.dialogs.splice(index, 1);
  }
}

export const dialogService = new DialogService();
