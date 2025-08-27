<template>
  <div
    class="card-mail"
    v-if="confirmedReservations.length > 0 && currentFolio?.reservationType !== 'out'"
  >
    <span class="title-mail"> Correo de Confirmación </span>
    <div class="mail-reservations">
      Enviar Correo a la{{ confirmedReservations.length > 1 ? 's' : '' }} reserva{{
        confirmedReservations.length > 1 ? 's' : ''
      }}:
      <span v-for="confirmedReservation in confirmedReservations" :key="confirmedReservation.id">
        <span class="reservation-sequence"> H/{{ confirmedReservation.folioSequence }} </span>
      </span>
    </div>
    <button class="btn-mail" @click="openMailDialog('confirm')">
      Enviar Correo de Confirmación
    </button>
  </div>

  <div v-if="doneReservations.length > 0" class="card-mail">
    <span class="title-mail"> Correo de Salida </span>
    <div class="mail-reservations">
      Enviar Correo a la{{ doneReservations.length > 1 ? 's' : '' }} reserva{{
        doneReservations.length > 1 ? 's' : ''
      }}:
      <span v-for="doneReservation in doneReservations" :key="doneReservation.id">
        <span class="reservation-sequence"> H/{{ doneReservation.folioSequence }} </span>
      </span>
    </div>
    <button class="btn-mail" @click="openMailDialog('done')">Enviar Correo de Salida</button>
  </div>

  <div v-if="cancelledReservations.length > 0" class="card-mail">
    <span class="title-mail"> Correo de Cancelación </span>
    <div class="mail-reservations">
      Enviar Correo a la{{ cancelledReservations.length > 1 ? 's' : '' }} reserva{{
        cancelledReservations.length > 1 ? 's' : ''
      }}:
      <span v-for="cancelledReservation in cancelledReservations" :key="cancelledReservation.id">
        <span class="reservation-sequence"> H/{{ cancelledReservation.folioSequence }} </span>
      </span>
    </div>
    <button class="btn-mail" @click="openMailDialog('cancel')">Enviar Correo de Cancelación</button>
  </div>

  <div class="card-messages">
    <div class="messages-title">Mensajes</div>
    <div
      v-for="(message, index) in filteredMessages"
      :key="message.subject"
      :style="setMessageRowStyle(index)"
    >
      <div class="message">
        <div class="message-first-row">
          <div class="avatar-author-name">
            <div
              class="avatar-container"
              :style="{
                backgroundImage: message.authorImageUrl
                  ? `url(${message.authorImageUrl})`
                  : 'url(/app-images/avatar.png)',
              }"
            />
            <div>
              {{ message.author }}
            </div>
          </div>
          <div>
            {{ message.date }}
          </div>
        </div>
        <div v-if="message.reservationId" class="reservation-id">
          Reserva:
          <span
            class="reservation-name"
            @click="openCurrentReservation(message?.reservationId ?? 0)"
          >
            {{ renderReservationName(message.reservationId) }}
          </span>
        </div>
        <div class="body-content">
          {{ message.subject }}
          <div v-if="message.messageType !== 'email'">
            <div v-for="msg in stripMessageBody(message.message)" :key="msg">
              {{ msg }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type ReservationInterface } from '@/_legacy/interfaces/ReservationInterface';
import type { AxiosResponse } from 'axios';
import { defineComponent, computed, ref, onMounted, watch, markRaw } from 'vue';
import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';
import type { MsgInterface } from '@/_legacy/interfaces/MsgInterface';
import MailComponent from '@/_legacy/components/mails/MailComponent.vue';

export default defineComponent({
  emits: ['goToReservationCard'],
  setup(props, context) {
    const store = useStore();

    const confirmedReservations = ref([] as ReservationInterface[]);
    const doneReservations = ref([] as ReservationInterface[]);
    const cancelledReservations = ref([] as ReservationInterface[]);
    const state = ref('');
    const template = ref('');
    const subject = ref('');

    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);

    const reservationMessages = computed(() => store.state.folios.messages?.reservationMessages);
    const folioMessages = computed(() => store.state.folios.messages?.folioMessages);

    const filteredMessages = computed(() => {
      let messages: MsgInterface[] = [];
      if (reservationMessages.value) {
        messages = [...messages, ...reservationMessages.value];
      }
      if (folioMessages.value) {
        messages = [...messages, ...folioMessages.value];
      }

      const messageSet = new Set();
      return messages
        .filter((message) => {
          if (messageSet.has(message.message)) {
            return false;
          }
          messageSet.add(message.message);
          return true;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    const openMailDialog = async (stateType: string) => {
      state.value = stateType;
      const payload = {
        folioId: currentFolio.value?.id,
        mailType: state.value,
      };
      void store.dispatch('layout/showSpinner', true);
      const response = (await store.dispatch(
        'folios/fetchFolioMailData',
        payload
      )) as AxiosResponse<{ bodyMail: string; subject: string }>;
      if (response.data) {
        if (response.data.bodyMail) {
          template.value = response.data.bodyMail;
        }
        if (response.data.subject) {
          subject.value = response.data.subject;
        }
      }
      let title = '';
      if (state.value === 'confirm') {
        title = 'Enviar correo de confirmación';
      } else if (state.value === 'done') {
        title = 'Enviar correo de salida';
      } else if (state.value === 'cancel') {
        title = 'Enviar correo de cancelación';
      }
      dialogService.open({
        header: title,
        content: markRaw(MailComponent),
        closable: true,
        props: {
          template: template.value,
          stateReservation: state.value,
          defaultSubject: subject.value,
        },
      });
      void store.dispatch('layout/showSpinner', false);
    };

    const stripMessageBody = (body: string) => {
      const bodyMessage = body.replace(/<\/?[^>]+(>|$)/g, '');
      const bodyParts = bodyMessage.split('-');
      return bodyParts;
    };

    const setMessageRowStyle = (position: number) => {
      let backgroundColor = '';
      if (position % 2 === 0) {
        backgroundColor = '#daf7fc';
      }
      return {
        backgroundColor,
      };
    };
    const renderReservationName = (reservationId: number) => {
      const reservation = store.state.reservations.reservations?.find(
        (el) => el.id === reservationId
      );
      if (reservation) {
        return reservation.name;
      }
      return '';
    };

    const openCurrentReservation = async (reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('reservations/fetchReservation', reservationId);
      context.emit('goToReservationCard');
      void store.dispatch('layout/showSpinner', false);
    };

    const decodeAvatarImage = (encodedImage: string) => window.atob(encodedImage);

    watch(currentReservations, () => {
      confirmedReservations.value = [];
      doneReservations.value = [];
      cancelledReservations.value = [];
      if (currentReservations.value) {
        currentReservations.value.forEach((el) => {
          if (el.stateCode === 'confirm' || el.stateCode === 'arrival_delayed') {
            confirmedReservations.value.push(el);
          } else if (el.stateCode === 'done') {
            doneReservations.value.push(el);
          } else if (el.stateCode === 'cancel') {
            cancelledReservations.value.push(el);
          }
        });
      }
    });

    watch(currentFolio, async () => {
      if (currentFolio.value) {
        void store.dispatch('layout/showSpinner', true);
        await store.dispatch('folios/fetchFolioMessages', currentFolio.value?.id);
        void store.dispatch('layout/showSpinner', false);
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('folios/fetchFolioMessages', currentFolio.value?.id);
      void store.dispatch('layout/showSpinner', false);
      if (currentReservations.value) {
        currentReservations.value.forEach((el) => {
          if (el.stateCode === 'confirm' || el.stateCode === 'arrival_delayed') {
            confirmedReservations.value.push(el);
          } else if (el.stateCode === 'done') {
            doneReservations.value.push(el);
          } else if (el.stateCode === 'cancel') {
            cancelledReservations.value.push(el);
          }
        });
      }
    });

    return {
      currentFolio,
      currentReservations,
      reservationMessages,
      folioMessages,
      confirmedReservations,
      doneReservations,
      cancelledReservations,
      template,
      subject,
      state,
      filteredMessages,
      openMailDialog,
      openCurrentReservation,
      stripMessageBody,
      renderReservationName,
      setMessageRowStyle,
      decodeAvatarImage,
    };
  },
});
</script>
<style scoped lang="scss">
.card-mail {
  padding-top: 0.5rem;
  margin-top: 1rem;
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  border-radius: 10px;
  .title-mail {
    font-weight: bold;
    font-size: 18px;
    margin-left: 1rem;
  }
  .mail-reservations {
    margin-left: 1rem;
    .reservation-sequence {
      font-weight: bold;
      margin-left: 1ch;
    }
  }
  .btn-mail {
    background-color: $primary;
    color: white;
    cursor: pointer;
    padding: 0.3rem;
    margin: 1rem 0;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    font-weight: bold;
    margin-left: 1rem;
  }
}
.card-messages {
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  width: 99%;
  .messages-title {
    font-size: 18px;
    font-weight: bold;
    margin-left: 1rem;
    padding: 1rem 0;
  }
  .message {
    padding: 0.5rem 1rem;
    .message-first-row {
      display: flex;
      font-size: 13px;
      align-items: center;
      justify-content: space-between;
      .avatar-author-name {
        display: flex;
        align-items: center;
      }
    }
    .reservation-id {
      margin-left: 1ch;
      .reservation-name {
        color: $primary;
        font-weight: bold;
        cursor: pointer;
        &:hover {
          color: $corduroy;
        }
      }
    }
    .body-content {
      padding: 0.5rem 0 0.5rem 0.5rem;
      font-weight: bold;
    }
    .avatar-container {
      margin-right: 0.5rem;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-size: cover;
    }
  }
}
</style>
