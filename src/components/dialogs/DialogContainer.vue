<template>
  <AppDialog
    v-for="(dialog, index) in dialogs"
    :key="index"
    :header="dialog.header"
    :modal="dialog.modal"
    :closable="false"
    v-model:visible="dialog.visible"
    :draggable="false"
    @hide="closeDialog(index)"
    :pt="{
      root: {
        style: {
          maxHeight: '100%',
          borderRadius: '0',
        },
      },
    }"
  >
    <template #header>
      <div
        class="header-container flex justify-between items-center"
        :class="{
          header: typeof dialog.content !== 'string' && dialog.content,
        }"
      >
        <div class="flex-1 flex items-center flex-row text-lg font-bold mr-2">
          <CustomIcon
            v-if="dialog.iconHeader"
            :imagePath="dialog.iconHeader"
            color="primary"
            width="15px"
            height="15px"
            class="mr-2"
          />
          {{ dialog.header }}
        </div>
        <div
          class="cursor-pointer flex items-center"
          @click="closeDialog(index)"
          v-if="dialog.closable"
        >
          <i class="pi pi-times" />
        </div>
      </div>
    </template>
    <template #default>
      <div
        :class="{
          'component-container': typeof dialog.content !== 'string' && dialog.content,
        }"
      >
        <component
          @close="closeDialog(index)"
          @accept="acceptDialog(index, $event)"
          v-if="typeof dialog.content !== 'string' && dialog.content"
          :is="dialog.content"
          v-bind="dialog.props"
        />
        <div v-else class="text-base" v-html="dialog.content" />
      </div>
    </template>
    <template #footer v-if="dialog.footer || dialog.btnCancel || dialog.btnAccept">
      <div class="flex justify-end items-center w-full footer-container">
        <component :is="dialog.footer" v-if="dialog.footer" />
        <template v-else>
          <AppButton
            v-if="dialog.btnCancel"
            class="p-1 mr-2"
            :label="dialog.btnCancel"
            raised
            size="small"
            severity="secondary"
            @click="closeDialog(index)"
          />
          <AppButton
            v-if="dialog.btnAccept"
            class="btn-accept p-1"
            :label="dialog.btnAccept"
            raised
            size="small"
            @click="acceptDialog(index)"
          />
        </template>
      </div>
    </template>
  </AppDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import { dialogService } from '@/services/DialogService.ts';
export default defineComponent({
  components: { AppDialog: Dialog, AppButton: Button, CustomIcon },
  setup() {
    return {
      dialogs: dialogService.dialogs,
      closeDialog: dialogService.close,
      acceptDialog: dialogService.accept,
    };
  },
});
</script>
<style lang="scss" scoped>
.header-container {
  width: 100%;
  user-select: none;
}
.header {
  width: calc(100svw - 42px);
}
.component-container {
  width: calc(100svw - 40px);
  height: calc(100svh - 90px) !important;
}
.component-container-with-footer {
  width: auto;
  height: auto !important;
}
.footer-container {
  padding-top: 1rem;
}
@media (min-width: 1024px) {
  .header {
    width: 100%;
  }
  .component-container {
    width: auto;
    height: auto !important;
  }
  .component-container-with-footer {
    width: auto;
    height: auto !important;
  }
}
</style>
