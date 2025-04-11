<template>
  <div
    class="main-container"
    @blur="refocusToMaincontainer()"
    @keypress="selectSegmentationByKey($event)"
    @keydown.esc="$emit('close')"
    @keydown.backspace="parentSegmentationHasChildren ? restoreParentSegmentation() : null"
    tabindex="0"
    ref="mainContainerRef"
  >
    <div class="segmentation-title" v-if="parentName === 'CheckinFlow' && !checkinPartner">
      <div class="before-start">Antes de empezar</div>
      <div class="title">Segmenta la tipología de cliente</div>
      <div class="step-subtitle">Esto nos ayudará a entender mejor sus preferencias.</div>
    </div>
    <div
      class="segmentation-title"
      v-else-if="checkinPartner || parentName === 'ReservationGeneralTab'"
    >
      <span class="no-segmentation-feedback">
        Para poder marcar llegada se necesita establecer segmentación
      </span>
    </div>

    <div class="segmentation-parent-container">
      <div
        v-for="(parentSegmentation, index) in parentSegmentations.filter(
          (el) => el.id === parentSegmentationSelectedId || parentSegmentationSelectedId === 0
        )"
        :key="parentSegmentation.id"
        class="segmentation-tag"
        :class="{
          'item-with-partner': parentSegmentationHasChildren,
          'disabled-segmentation':
            parentSegmentationSelectedId && parentSegmentationSelectedId !== parentSegmentation.id,
          blink:
            parentSegmentationSelectedId === parentSegmentation.id &&
            isAnimation &&
            !parentSegmentationHasChildren,
        }"
        @click="selectParentSegmentation(parentSegmentation.id)"
        @animationend="saveAndClose"
      >
        <div class="triangle" v-if="parentSegmentationSelectedId === parentSegmentation.id">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <span class="segmentation-letter">
          {{ letters[index] }}
        </span>
        <span class="segmentation-name">
          {{ parentSegmentation.name }}
        </span>
      </div>
    </div>
    <div
      class="icon-container"
      v-if="parentSegmentationSelectedId && parentSegmentationHasChildren"
    >
      <CustomIcon
        imagePath="/app-images/back-arrow-black.svg"
        width="30px"
        height="30px"
        class="icon-arrow"
        color="primary"
      />
    </div>
    <div
      class="segmentation-child-container"
      v-if="parentSegmentationSelectedId !== 0 && parentSegmentationHasChildren"
    >
      <div
        v-for="(childSegmentation, index) in childSegmentations.filter(
          (el) => el.id === childSegmentationSelectedId || childSegmentationSelectedId === 0
        )"
        :key="childSegmentation.id"
        class="segmentation-tag"
        :class="{
          'item-with-partner': parentSegmentationHasChildren,
          'disabled-segmentation':
            childSegmentationSelectedId && childSegmentationSelectedId !== childSegmentation.id,
          blink: childSegmentationSelectedId === childSegmentation.id && isAnimation,
        }"
        @click="selectChildSegmentation(childSegmentation.id)"
        @animationend="saveAndClose"
      >
        <div class="triangle" v-if="childSegmentationSelectedId === childSegmentation.id">
          <img class="check-mark" src="/app-images/check-mark.svg" />
        </div>
        <span class="segmentation-letter">
          {{ letters[index] }}
        </span>
        <span class="segmentation-name">
          {{ childSegmentation.name }}
        </span>
      </div>
    </div>

    <div class="button-container">
      <CustomButton
        class="button"
        :text="saveButtonText"
        backgroundColor="primary"
        textColor="white"
        v-if="
          (!checkinPartner && parentName !== 'ReservationGeneralTab') ||
          (!checkinPartner &&
            parentName === 'ReservationGeneralTab' &&
            (parentSegmentationSelectedId || childSegmentationSelectedId)) ||
          (checkinPartner && (parentSegmentationSelectedId || childSegmentationSelectedId))
        "
        @click="saveAndClose()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, type Ref } from 'vue';
import type { CheckinPartnerInterface } from '@/interfaces/CheckinPartnerInterface';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import CustomButton from '@/components/roomdooComponents/CustomButton.vue';
import { useCheckinPartner } from '@/utils/useCheckinPartner';
import { dialogService } from '@/services/DialogService';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    CustomIcon,
    CustomButton,
  },
  props: {
    parentName: {
      type: String,
      required: true,
    },
    checkinPartner: {
      type: Object as () => CheckinPartnerInterface | null,
      default: null,
      required: false,
    },
  },

  emits: ['close', 'closeAfterDoCheckin', 'allowNextStep', 'accept'],
  setup(props, context) {
    const store = useStore();
    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    const { doCheckin } = useCheckinPartner();
    const isAnimation = ref(false);

    const windowWidth = ref(window.innerWidth);
    const parentSegmentationSelectedId = ref(0);
    const childSegmentationSelectedId = ref(0);
    const parentSegmentationHasChildren = ref(false);
    const mainContainerRef: Ref<HTMLDivElement | null> = ref(null);

    const parentSegmentations = computed(() =>
      store.state.categories.categories.filter((category) => category.parentId === 0)
    );

    const childSegmentations = computed(() =>
      store.state.categories.categories.filter(
        (category) => category.parentId === parentSegmentationSelectedId.value
      )
    );

    const saveButtonText = computed(() => {
      let result = '';
      if (props.checkinPartner || props.parentName === 'ReservationGeneralTab') {
        result = 'Guardar y marcar llegada';
      } else if (props.parentName === 'CheckinFlow') {
        result = parentSegmentationSelectedId.value ? 'Aceptar' : 'Continuar';
      } else {
        result = 'Guardar';
      }
      return result;
    });

    const selectParentSegmentation = (id: number) => {
      if (parentSegmentationSelectedId.value === id) {
        parentSegmentationSelectedId.value = 0;
        childSegmentationSelectedId.value = 0;
        return;
      }
      parentSegmentationSelectedId.value = id;
      childSegmentationSelectedId.value = 0;
    };

    const selectChildSegmentation = (id: number) => {
      if (childSegmentationSelectedId.value === id) {
        childSegmentationSelectedId.value = 0;
        isAnimation.value = false;
        return;
      }
      childSegmentationSelectedId.value = id;
      isAnimation.value = true;
    };

    const restoreParentSegmentation = () => {
      parentSegmentationSelectedId.value = 0;
      childSegmentationSelectedId.value = 0;
    };

    const saveAndClose = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (childSegmentationSelectedId.value !== 0) {
          await store.dispatch('reservations/updateReservation', {
            reservationId: store.state.reservations.currentReservation?.id,
            segmentationId: childSegmentationSelectedId.value,
          });
          await store.dispatch(
            'reservations/fetchReservations',
            store.state.folios.currentFolio?.id
          );
          await store.dispatch(
            'reservations/fetchReservation',
            store.state.reservations.currentReservation?.id
          );
        } else {
          await store.dispatch('reservations/updateReservation', {
            reservationId: store.state.reservations.currentReservation?.id,
            segmentationId: parentSegmentationSelectedId.value,
          });
          await store.dispatch(
            'reservations/fetchReservations',
            store.state.folios.currentFolio?.id
          );
          await store.dispatch(
            'reservations/fetchReservation',
            store.state.reservations.currentReservation?.id
          );
        }
        if (props.checkinPartner && store.state.reservations.currentReservation?.segmentationId) {
          await doCheckin(props.checkinPartner);
        }
        context.emit('accept');
        context.emit('close');
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        context.emit('accept');
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const selectSegmentationByKey = async (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();

      if (key >= 'a' && key <= 'z' && key !== 'enter') {
        const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
        if (index < parentSegmentations.value.length) {
          const selectedId = parentSegmentations.value[index].id;
          if (parentSegmentationSelectedId.value === selectedId) {
            parentSegmentationSelectedId.value = 0;
            childSegmentationSelectedId.value = 0;
            isAnimation.value = false;
          } else {
            parentSegmentationSelectedId.value = selectedId;
            childSegmentationSelectedId.value = 0;
            isAnimation.value = true;
          }
        } else if (index < parentSegmentations.value.length + childSegmentations.value.length) {
          const selectedId = childSegmentations.value[index - parentSegmentations.value.length].id;
          if (childSegmentationSelectedId.value === selectedId) {
            childSegmentationSelectedId.value = 0;
            isAnimation.value = false;
          } else {
            childSegmentationSelectedId.value = selectedId;
            isAnimation.value = true;
          }
        }
      } else if (
        ((parentSegmentationSelectedId.value !== 0 && !parentSegmentationHasChildren.value) ||
          (parentSegmentationHasChildren.value && childSegmentationSelectedId.value !== 0)) &&
        key === 'enter'
      ) {
        await saveAndClose();
      } else if (key === 'enter' && !props.checkinPartner) {
        context.emit('accept');
      }
    };

    const refocusToMaincontainer = () => {
      const divAddress = document.getElementById('main-container');
      if (divAddress) divAddress.focus();
    };

    watch(parentSegmentationSelectedId, (newValue) => {
      if (newValue !== 0) {
        const segmentation = store.state.categories.categories.find(
          (category) => category.id === newValue
        );
        if (segmentation) {
          parentSegmentationHasChildren.value = store.state.categories.categories.some(
            (category) => category.parentId === segmentation.id
          );
        }
      } else {
        parentSegmentationHasChildren.value = false;
      }
    });

    onMounted(() => {
      if (store.state.reservations.currentReservation?.segmentationId) {
        const segmentation = store.state.categories.categories.find(
          (category) => category.id === store.state.reservations.currentReservation?.segmentationId
        );
        if (segmentation && segmentation.parentId === 0) {
          parentSegmentationSelectedId.value = segmentation.id;
        } else if (segmentation && segmentation.parentId !== 0) {
          parentSegmentationSelectedId.value = segmentation.parentId;
          childSegmentationSelectedId.value = segmentation.id;
        }
      }
      if (mainContainerRef.value) {
        mainContainerRef.value.focus();
      }
      context.emit('allowNextStep');
    });

    return {
      parentSegmentationSelectedId,
      parentSegmentations,
      childSegmentations,
      childSegmentationSelectedId,
      parentSegmentationHasChildren,
      windowWidth,
      letters,
      mainContainerRef,
      isAnimation,
      selectParentSegmentation,
      selectChildSegmentation,
      selectSegmentationByKey,
      saveAndClose,
      refocusToMaincontainer,
      restoreParentSegmentation,
      saveButtonText,
    };
  },
});
</script>
<style scoped lang="scss">
.main-container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  &:focus {
    outline: none;
  }
  .segmentation-title {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    .before-start {
      font-size: 12px;
      color: #8b8a8d;
    }
    .title {
      font-weight: bold;
    }
    .step-subtitle {
      color: #4f4f4f;
    }
  }
  .segmentation-parent-container,
  .segmentation-child-container {
    width: 100%;

    max-height: 40%;
    overflow-y: scroll;

    .segmentation-tag {
      background-color: #edf7fc;
      border: 2px solid #51b2dd;
      border-radius: 5px;
      padding: 20px;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #51b2dd;
      width: 100%;
      margin-top: 1rem;
      position: relative;
      &:first-child {
        margin-top: 0;
      }
      .triangle {
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
        background-color: #51b2dd;
        clip-path: polygon(100% 0, 0 0, 100% 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        .check-mark {
          position: absolute;
          right: 5px;
          top: 5px;
          width: 20px;
          height: 20px;
        }
      }
      .segmentation-letter {
        display: none;
        font-size: 14px;
        background-color: white;
        border: 1px solid #90ceea;
        border-radius: 2px;
        width: 25px;
        height: 25px;
        margin-right: 0.5rem;
        text-align: center;
      }
      .segmentation-name {
        font-size: 14px;
        color: #51b2dd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .icon-container {
    margin: 1rem 0;
    .icon-arrow {
      transform: rotate(-90deg);
    }
  }
  .button-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
}
@media (min-width: 1024px) {
  .main-container {
    .button-container {
      width: auto;
    }
  }
}

@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.5;
  }
}
.blink {
  animation: blink 0.5s forwards;
}
</style>
