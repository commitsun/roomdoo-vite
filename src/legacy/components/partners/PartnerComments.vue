<template>
  <div class="content">
    <AppTextarea v-model="partnerComments" rows="6" autoResize class="textarea" />
    <div class="buttons-panel">
      <AppButton class="btn" label="Guardar" size="small" @click="savePartnerComments" />
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
  props: {
    partnerId: {
      type: Number,
      required: true,
    },
    partnerComment: {
      type: String,
      required: false,
    },
  },
  components: {
    AppTextarea: Textarea,
    AppButton: Button,
  },
  setup(props, context) {
    const store = useStore();

    const partnerComments = ref('');

    const savePartnerComments = async () => {
      void store.dispatch('layout/showSpinner', true);

      try {
        await store.dispatch('partners/updatePartner', {
          id: props.partnerId,
          comment: partnerComments.value,
        });
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
      partnerComments.value = props.partnerComment || '';
    });

    return {
      partnerComments,
      savePartnerComments,
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
