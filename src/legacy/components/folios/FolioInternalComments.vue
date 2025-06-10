<template>
  <div class="content">
    <AppTextarea
      v-model="internalComments"
      rows="6"
      autoResize
      class="textarea"
    />
    <div class="buttons-panel">
      <AppButton
        class="btn"
        label="Guardar"
        size="small"
        :class="{
          'btn-disabled': internalComments === '',
        }"
        :disabled="internalComments === ''"
        @click="saveInternalNotes"
      />
      <AppButton
        class="btn"
        @click="$emit('close')"
        label="Cancelar"
        size="small"
        severity="secondary"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';

export default defineComponent({
  components: {
    AppTextarea: Textarea,
    AppButton: Button,
  },
  setup(props, context) {
    const store = useStore();

    const internalComments = ref('');

    const saveInternalNotes = async () => {
      void store.dispatch('layout/showSpinner', true);

      try {
        await store.dispatch('folios/updateFolio', {
          folioId: store.state.folios.currentFolio?.id,
          internalComment: internalComments.value,
        });
        await store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
        context.emit('close');
      }
    };

    onMounted(() => {
      internalComments.value = store.state.folios.currentFolio?.internalComment || '';
    });

    return {
      internalComments,
      saveInternalNotes,
    };
  },
});
</script>
<style lang="scss" scoped>
.content {
  max-height: 80svh;
  .textarea {
    width: 100%;
    height: 100%;
  }
  .buttons-panel {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    .btn {
      width: auto;
      margin-top: 0.5rem;
    }
    .btn.btn-disabled {
      cursor: not-allowed;
    }
  }
}
@media (min-width: 1024px) {
  .content {
    width: 550px;
    .buttons-panel {
      flex-direction: row;
      justify-content: flex-end;
      .btn {
        width: auto;
      }
      .btn:last-child {
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
