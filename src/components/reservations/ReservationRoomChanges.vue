<template>
  <div class="main-container">
    <div class="confirm-assignment" v-if="currentReservation?.toAssign">
      <AppButton
        class="confirm-assignment"
        @click="assignReservationRoom"
        label="CONFIRMAR ASIGNACIÓN"
        size="small"
      />
    </div>

    <div class="option-details" v-if="!isShowingRoomPerNight">
      <div class="first">
        <span> Habitaciones libres en la fecha de la reserva </span>
        <div class="link" @click="toggleIsShowingRoomPerNight">Dividir reserva</div>
      </div>
      <div class="second">
        <AppSelect
          size="small"
          class="room-input"
          optionLabel="text"
          optionValue="id"
          placeholder="Selecciona opción"
          :options="
            availRooms.map((el) => ({
              id: el.id,
              text: el.name,
            }))
          "
          v-model="selectedRoom"
        />
        <div class="room-feedback">
          <span class="text-weight-bold">
            {{ availRooms.length }}
          </span>
          Habitaciones disponibles
        </div>
      </div>
    </div>

    <div class="option-details" v-else>
      <div class="first">
        <div class="month-year">{{ dateStartMonth() }} {{ dateStartYear() }}</div>
        <div class="link" @click="toggleIsShowingRoomPerNight">Unificar reserva</div>
      </div>
      <div class="calendar-content">
        <div
          class="day day-name"
          v-for="day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']"
          :key="day"
        >
          <span class="long">
            {{ day }}
          </span>
          <span class="short">
            {{ day[0] }}
          </span>
        </div>
        <div class="day" v-for="(item, index) in calendarDates" :key="index">
          <div :class="item.reservationLineId ? 'content' : 'empty'">
            <div>
              {{ item.date.getDate() }}
            </div>
            <select
              v-if="item.reservationLineId"
              @change="
                selectRoomIdPerNight(
                  parseInt(($event.target as HTMLSelectElement).value, 10),
                  item.reservationLineId ?? 0
                )
              "
            >
              <option
                v-for="room in item.rooms"
                :key="room.id"
                :value="room.id"
                :selected="item.roomId === room.id"
              >
                {{ room.shortName }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="option">
      <div class="label" @click="toggleIsFilteringByRoomType">
        Mostrar solamente las habitaciones
        <span class="name-reservation-room-type">
          {{ reservationRoomTypeName(currentReservation?.roomTypeId ?? 0) }}
        </span>
      </div>
      <ToggleSwitch size="small" v-model="isFilteringByRoomType" class="toggle" />
    </div>

    <div class="option">
      <div class="label" @click="toggleIsFilteringByCapacity">Filtrar por capacidad</div>
      <ToggleSwitch
        size="small"
        v-model="isFilteringByCapacity"
        @update:model-value="isFilteringByExtraBedsAvailability = false"
        class="toggle"
      />
    </div>

    <div class="option-details">
      <div :class="{ inactive: !isFilteringByCapacity }" class="content">
        <div
          class="btn-capacity"
          :class="{ active: selectedCapacity === -1 }"
          @click="changeCapacity(-1)"
        >
          TODOS
        </div>
        <div
          class="btn-capacity"
          v-for="(capacity, index) in [1, 2, 3, 4]"
          :key="index"
          @click="changeCapacity(capacity)"
          :class="{
            active: capacity === selectedCapacity,
            'not-allowed': (currentReservation?.adults ?? 0) > capacity,
          }"
        >
          {{ capacity }}
        </div>
      </div>
      <div class="sub-option content" :class="{ inactive: !isFilteringByCapacity }">
        <span @click="isFilteringByExtraBedsAvailability = !isFilteringByExtraBedsAvailability">
          Tener en cuenta camas supletorias
        </span>
        <ToggleSwitch
          size="small"
          :disable="!isFilteringByCapacity || selectedCapacity === -1 || selectedCapacity === 1"
          v-model="isFilteringByExtraBedsAvailability"
          class="toggle"
        />
      </div>
      <div
        class="feedback"
        v-if="numExtraBedsAvailable === 0 && isFilteringByExtraBedsAvailability"
      >
        <div class="icon"></div>
        <CustomIcon
          imagePath="/app-images/info.svg"
          width="16px"
          height="16px"
          class="iconr"
          color="black"
        />
        <div class="text text-info">
          No hay camas supletorias disponibles para los días de la reserva. Puedes añadir camas
          supletorias desde
          <span class="config-link"> configuración </span>.
        </div>
      </div>
    </div>

    <div class="option">
      <div @click="toggleIsFilteringByAmenities" class="label">
        Filtrar por características de la habitación
      </div>
      <ToggleSwitch size="small" v-model="isFilteringByAmenities" class="toggle" />
    </div>

    <div class="option-details amenities">
      <div :class="{ inactive: !isFilteringByAmenities }" class="second">
        <MultiSelect
          :id="`amenity-type-${at.id}`"
          v-for="(at, index) in groupedAmenities"
          :key="at.id"
          size="small"
          class="select"
          v-model="selectedAmenities[index]"
          :options="groupedAmenities[index].amenities"
          optionLabel="name"
          optionValue="id"
          :placeholder="getAmenityTypeName(at.id)"
          :maxSelectedLabels="1"
          :selectedItemsLabel="`{0} ${getAmenityTypeName(at.id)} seleccionados`"
          display="comma"
          :disabled="!isFilteringByAmenities"
          :showToggleAll="false"
        />
      </div>
    </div>

    <div class="option">
      <div class="label" @click="isReservationReselling = !isReservationReselling">
        Marcar la reserva como Reselling
      </div>
      <ToggleSwitch size="small" v-model="isReservationReselling" class="toggle" />
    </div>

    <div class="option-details" v-if="isReservationReselling">
      <div class="first">
        <div class="month-year">{{ dateStartMonth() }} {{ dateStartYear() }}</div>
      </div>
      <div class="tip-reselling">Marcar los días de reselling:</div>
      <div class="calendar-content">
        <div
          class="day day-name"
          v-for="day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']"
          :key="day"
        >
          <span class="long">
            {{ day }}
          </span>
          <span class="short">
            {{ day[0] }}
          </span>
        </div>
        <div class="day" v-for="(item, index) in calendarDates" :key="index">
          <div :class="item.reservationLineId ? 'content' : 'empty'">
            <div>
              {{ item.date.getDate() }}
            </div>
            <div
              v-if="item.reservationLineId"
              class="reselling"
              @click="toggleIsReservationReselling(index)"
            >
              <span>
                <input type="checkbox" v-model="reservationLinesToReselling[index].isReselling" />
                <span class="text-reselling"> Reselling</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="feedback" v-if="reservationLinesToReselling.some((el) => el.isReselling)">
        <div>
          <CustomIcon
            imagePath="/app-images/warning.svg"
            width="20px"
            height="20px"
            class="icon"
            color="red"
          />
        </div>
        <div>
          Si marcas la reserva como Reselling liberarás la disponibilidad automáticamente y puede
          quedar sin sitio en el establecimiento.
        </div>
      </div>
    </div>
    <div class="buttons">
      <AppButton
        :label="'Guardar'"
        @click="save()"
        raised
        size="small"
        class="button"
        :disabled="!selectedRoom"
        :class="{ disabled: !selectedRoom }"
      />
      <AppButton
        :label="'Cancelar'"
        raised
        size="small"
        severity="secondary"
        class="button"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/store';
import type { AxiosResponse } from 'axios';

import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';

import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';

import utilsDates, { localeSpain } from '@/utils/dates';
import { usePlanning } from '@/utils/usePlanning';
import { dialogService } from '@/services/DialogService';

import type { AmenityInterface } from '@/interfaces/AmenityInterface';
import type { RoomInterface } from '@/interfaces/RoomInterfaces';

interface AvailabilityPerDayInterface {
  date: Date;
  rooms?: RoomInterface[];
  reservationLineId?: number;
  roomId?: number;
}

interface GroupedAmenitiesAmenityInterface {
  id: number;
  name: string;
}

interface GroupedAmenitiesInterface {
  id: number;
  amenities: GroupedAmenitiesAmenityInterface[];
}

interface ReservationLineChangedRoomInterface {
  reservationLineId: number;
  roomId: number;
}

interface ReservationLineResellingInterface {
  reservationLineId: number;
  isReselling: boolean;
}

export default defineComponent({
  components: {
    AppButton: Button,
    AppSelect: Select,
    ToggleSwitch,
    CustomIcon,
    MultiSelect,
  },
  props: {
    splitMode: {
      type: Boolean,
    },
    changeRoomModal: {
      type: Boolean,
    },
  },
  emits: ['moveToRoomTab', 'close'],
  setup(props, context) {
    const store = useStore();
    const { refreshPlanning } = usePlanning();
    const route = useRoute();

    const isShowingRoomPerNight = ref(false);
    const isFilteringByRoomType = ref(false);
    const isFilteringByCapacity = ref(false);
    const isFilteringByExtraBedsAvailability = ref(false);
    const isFilteringByAmenities = ref(false);
    const isReservationReselling = ref(false);
    const saveWithExtraBeds = ref(false);
    const selectedRoom = ref();
    const selectedCapacity = ref(-1);
    const selectedAmenities = ref();
    const optionsRoom = ref([] as RoomInterface[]);
    const availabilityPerDay = ref([] as AvailabilityPerDayInterface[]);
    const reservationLinesToChangeRoom = ref([] as ReservationLineChangedRoomInterface[]);
    const reservationLinesToReselling = ref([] as ReservationLineResellingInterface[]);
    const assignReservation = ref(false);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const currentReservationLines = computed(() => store.state.reservationLines.reservationLines);

    const activePricelist = computed(() => store.state.pricelists.activePricelist);

    const numExtraBedsAvailable = computed(() =>
      store.state.extraBeds.extraBeds.reduce((total, el) => total + el.dailyLimitAvail, 0)
    );

    const groupedAmenities = computed(() => {
      const result: GroupedAmenitiesInterface[] = [];
      store.state.amenityTypes.amenityTypes.forEach((at) => {
        const amenitiesFilteredById = store.state.amenities.amenities.filter(
          (a: AmenityInterface) => a.amenityTypeId === at.id
        );
        const amenities = amenitiesFilteredById.map(
          // remove amenityTypeId, to push amenities ({id, name})
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ amenityTypeId, ...other }) => other
        );
        result.push({
          id: at.id,
          amenities,
        });
      });
      return result;
    });

    const availRooms = computed(() => {
      // room ids with capacity of reservation's adults and current reservation's capacity
      // also if filtering by extra beds is active
      const roomsWithAvailabilityOfExtraBedFilter = store.state.rooms.rooms
        .filter(
          (room: RoomInterface) =>
            (isFilteringByExtraBedsAvailability.value === true &&
              room.capacity + Math.min(room.extraBedsAllowed, numExtraBedsAvailable.value) >=
                (currentReservation.value?.adults ?? 0)) ||
            (isFilteringByExtraBedsAvailability.value === false &&
              room.capacity >= (currentReservation.value?.adults ?? 0))
        )
        .map((el) => el.id);

      // room ids with room type filter if active
      const roomIdsSameReservationRoomType = store.state.rooms.rooms
        .filter(
          (room: RoomInterface) =>
            (isFilteringByRoomType.value &&
              room.roomTypeId === currentReservation.value?.roomTypeId) ||
            !isFilteringByRoomType.value
        )
        .map((el) => el.id);

      // room ids with capacity filter if active
      // also apply extra beds filter if active
      const roomsIdsWithCapacityFilter = store.state.rooms.rooms
        .filter(
          (room: RoomInterface) =>
            (isFilteringByCapacity.value &&
              !isFilteringByExtraBedsAvailability.value &&
              room.capacity === selectedCapacity.value) ||
            (isFilteringByCapacity.value &&
              isFilteringByExtraBedsAvailability.value &&
              (room.extraBedsAllowed > 0
                ? room.capacity + Math.min(room.extraBedsAllowed, numExtraBedsAvailable.value)
                : room.capacity) === selectedCapacity.value) ||
            selectedCapacity.value === -1 ||
            !isFilteringByCapacity.value
        )
        .map((el) => el.id);

      // amenities selected in array format
      const amenityFilterIds = (selectedAmenities.value as number[][]).reduce(
        (total, el) => total.concat(el),
        []
      );
      // room ids with amenity filter if active
      const roomIdsWithAmenitiesFilter = store.state.rooms.rooms
        .filter(
          (room: RoomInterface) =>
            (isFilteringByAmenities.value &&
              amenityFilterIds.length > 0 &&
              room.roomAmenityIds !== null &&
              amenityFilterIds.every((el) => room.roomAmenityIds?.includes(el))) ||
            !isFilteringByAmenities.value ||
            (isFilteringByAmenities.value && amenityFilterIds.length === 0)
        )
        .map((el) => el.id);

      const setA = new Set(roomIdsSameReservationRoomType);
      const setB = new Set(roomsIdsWithCapacityFilter);
      const setC = new Set(roomIdsWithAmenitiesFilter);
      const setD = new Set(roomsWithAvailabilityOfExtraBedFilter);

      let intersection = new Set([...setA].filter((x) => setB.has(x)));
      intersection = new Set([...intersection].filter((x) => setC.has(x)));
      intersection = new Set([...intersection].filter((x) => setD.has(x)));

      // if view per night is off apply intersection filters and availability
      if (!isShowingRoomPerNight.value) {
        const setE = new Set(optionsRoom.value.map((el) => el.id));
        intersection = new Set([...intersection].filter((x) => setE.has(x)));
      }

      // class id from current reservation
      const roomTypeClassIdReservation = store.state.roomTypes.roomTypes.find(
        (el) => el.id === currentReservation.value?.roomTypeId
      )?.classId;

      // roomTypes with same reservation class id room type
      const roomTypeIdsWithSameRoomTypeClass = store.state.roomTypes.roomTypes
        .filter((el) => el.classId === roomTypeClassIdReservation)
        .map((el) => el.id);

      const roomIdsSameReservationRoomTypeClass = store.state.rooms.rooms
        .filter((el) => roomTypeIdsWithSameRoomTypeClass.includes(el.roomTypeId))
        .map((el) => el.id);

      const setF = new Set(roomIdsSameReservationRoomTypeClass);
      intersection = new Set([...intersection].filter((x) => setF.has(x)));

      const ids = Array.from(intersection);

      return store.state.rooms.rooms.filter((room: RoomInterface) => ids.includes(room.id));
    });

    const calendarDates = computed(() => {
      const result: AvailabilityPerDayInterface[] | undefined = [];
      let startDate;
      let endDate;
      let daysBeforeCheckin;
      let daysAfterCheckout;

      if (currentReservation.value) {
        startDate = new Date(currentReservation.value?.checkin);
        if (startDate.getDay() === 0) {
          daysBeforeCheckin = 6;
        } else {
          daysBeforeCheckin = startDate.getDay() - 1;
        }

        endDate = new Date(currentReservation.value?.checkout);
        if (endDate.getDay() === 0) {
          daysAfterCheckout = 0;
        } else {
          daysAfterCheckout = 6 - (endDate.getDay() - 1);
        }

        startDate.setDate(startDate.getDate() - daysBeforeCheckin);
        endDate.setDate(endDate.getDate() + daysAfterCheckout);

        utilsDates.getDatesRange(startDate, endDate).forEach((date, index) => {
          const night = currentReservationLines.value.find(
            (rl) => new Date(rl.date).getTime() === date.getTime()
          );

          let item: AvailabilityPerDayInterface = {
            date,
          };

          if (night) {
            const rooms = availabilityPerDay.value.find(
              (ra) => ra.date.getTime() === date.getTime()
            )?.rooms;
            if (rooms) {
              const setA = new Set(availRooms.value.map((el) => el.id));
              const setB = new Set(rooms.map((el) => el.id));
              const intersection = new Set([...setA].filter((x) => setB.has(x)));
              const ids = Array.from(intersection);

              item = {
                date,
                reservationLineId: night.id,
                roomId: night.roomId,
                rooms: store.state.rooms.rooms.filter((room: RoomInterface) =>
                  ids.includes(room.id)
                ),
              };
            }
            if (night.isReselling) {
              reservationLinesToReselling.value[index] = {
                reservationLineId: night.id ? night.id : 0,
                isReselling: true,
              };
            } else {
              reservationLinesToReselling.value[index] = {
                reservationLineId: night.id ? night.id : 0,
                isReselling: false,
              };
            }
          }
          result.push(item);
        });
      }

      return result;
    });

    const selectRoomIdPerNight = (roomId: number, reservationLineId: number) => {
      // original reservation line
      const reservationLine = currentReservationLines.value.find(
        (el) => el.id === reservationLineId
      );
      // the room have changed
      if (reservationLine && reservationLine.roomId !== roomId) {
        const index = reservationLinesToChangeRoom.value.findIndex(
          (el) => el.reservationLineId === reservationLineId
        );
        // udpate or push element
        if (index === -1) {
          reservationLinesToChangeRoom.value.push({
            reservationLineId,
            roomId,
          });
        } else {
          reservationLinesToChangeRoom.value[index].roomId = roomId;
        }
      } else {
        // the room havent changed -> remove the change if exists
        const indexToRemove = reservationLinesToChangeRoom.value.findIndex(
          (el) => el.reservationLineId === reservationLineId
        );
        if (indexToRemove !== -1) {
          reservationLinesToChangeRoom.value.splice(indexToRemove, 1);
        }
      }
    };

    const toggleIsShowingRoomPerNight = () => {
      isShowingRoomPerNight.value = !isShowingRoomPerNight.value;
    };
    const toggleIsFilteringByRoomType = () => {
      isFilteringByRoomType.value = !isFilteringByRoomType.value;
    };

    const toggleIsFilteringByCapacity = () => {
      isFilteringByCapacity.value = !isFilteringByCapacity.value;
      isFilteringByExtraBedsAvailability.value = false;
    };

    const toggleIsFilteringByAmenities = () => {
      isFilteringByAmenities.value = !isFilteringByAmenities.value;
    };

    const toggleIsReservationReselling = (index: number) => {
      // eslint-disable-next-line max-len
      reservationLinesToReselling.value[index].isReselling =
        !reservationLinesToReselling.value[index].isReselling;
    };

    const changeCapacity = (capacity: number) => {
      if (capacity === -1) {
        isFilteringByExtraBedsAvailability.value = false;
      }
      if (capacity >= (currentReservation.value?.adults ?? 0) || capacity === -1) {
        selectedCapacity.value = capacity;
      }
    };

    const getAmenityTypeName = (id: number) =>
      store.state.amenityTypes.amenityTypes.find((el) => el.id === id)?.name;

    const reservationRoomTypeName = (roomTypeId: number) => {
      const roomType = store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId);
      if (roomType) {
        return roomType.name;
      }
      return '';
    };

    const reservationRoomTypeCode = (roomTypeId: number) => {
      const roomType = store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId);
      if (roomType) {
        return roomType.defaultCode;
      }
      return '';
    };

    const dateStartMonth = () => {
      let result = '';
      if (currentReservation.value) {
        result = localeSpain.months[new Date(currentReservation?.value.checkin).getMonth()];
      }
      return result;
    };

    const dateStartYear = () => {
      let result = '';
      if (currentReservation.value) {
        result = new Date(currentReservation?.value.checkin).getFullYear().toString();
      }
      return result;
    };

    const saveChanges = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (isShowingRoomPerNight.value && currentReservation.value) {
          const reservationId = currentReservation.value.id;
          await Promise.all(
            reservationLinesToChangeRoom.value.map(async (el) => {
              await store.dispatch('reservations/updateReservationLineRoom', {
                reservationId,
                reservationLineId: el.reservationLineId,
                roomId: el.roomId,
              });
            })
          );
        } else if (selectedRoom.value) {
          await store.dispatch('reservations/updateReservationRoom', {
            reservationId: currentReservation.value?.id,
            roomId: selectedRoom.value as number,
          });
        }
        if (isReservationReselling.value) {
          await Promise.all(
            reservationLinesToReselling.value.map(async (el) => {
              await store.dispatch('reservationLines/updateReservationLine', {
                reservationLineId: el.reservationLineId,
                isReselling: el.isReselling,
              });
            })
          );
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('folios/fetchFolio', currentReservation.value?.folioId);
        void store.dispatch('reservations/fetchReservation', currentReservation.value?.id);
        void store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id);
        void store.dispatch('services/fetchServices', currentReservation.value?.id);
        if (route.fullPath.includes('planning')) {
          await refreshPlanning();
        }
        void store.dispatch('layout/showSpinner', false);
        context.emit('moveToRoomTab');
        context.emit('close');
      }
    };

    const saveChangesWithExtraBed = async () => {
      if (currentReservation.value?.adults) {
        const room = store.state.rooms.rooms.find((el) => el.id === selectedRoom.value);
        if (
          room &&
          room.capacity < currentReservation.value.adults &&
          isFilteringByExtraBedsAvailability.value
        ) {
          const productId = store.state.extraBeds.extraBeds[0].id;
          const payload = {
            reservationId: currentReservation.value.id,
            productId,
            serviceLines: [],
          };
          await store.dispatch('services/createService', payload);
          await saveChanges();
        }
      }
    };

    const assignReservationRoom = async () => {
      dialogService.open({
        header: 'Confirmar asignación',
        content: '¿Quieres confirmar la asignación de esta reserva?',
        btnAccept: 'Confirmar',
        btnCancel: 'Cancelar',
        onAccept: async () => {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('reservations/assignReservationRoom', {
              reservationId: currentReservation.value?.id,
              toAssign: false,
            });
            await store.dispatch('reservations/fetchReservation', currentReservation.value?.id);
            await store.dispatch('reservations/fetchReservations', currentFolio.value?.id);
            await store.dispatch(
              'reservations/fetchReservationsToAssign',
              store.state.properties.activeProperty?.id
            );
            await store.dispatch(
              'notifications/fetchNotificationsReservationsToAssign',
              activeProperty.value?.id
            );
            if (route.fullPath.includes('planning')) {
              await refreshPlanning();
            }
            assignReservation.value = false;
            context.emit('moveToRoomTab');
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
        },
      });
    };

    const save = async () => {
      const room = store.state.rooms.rooms.find((el) => el.id === selectedRoom.value);
      if (room && currentReservation.value?.adults) {
        if (
          !isFilteringByExtraBedsAvailability.value ||
          (isFilteringByExtraBedsAvailability.value &&
            room.capacity >= currentReservation.value.adults)
        ) {
          await saveChanges();
        } else if (
          isFilteringByExtraBedsAvailability.value &&
          room.capacity < currentReservation.value.adults
        ) {
          dialogService.open({
            header: 'Confirmar operación',
            content: 'Se añadirá una cama supletoria en la habitación. ¿Quieres guardar?',
            btnAccept: 'Guardar',
            btnCancel: 'Cancelar',
            onAccept: async () => {
              await saveChangesWithExtraBed();
            },
          });
        }
      }
    };

    const isLineReselling = (reservationLineId: number) => {
      const reservationLine = store.state.reservationLines.reservationLines.find(
        (el) => el.id === reservationLineId
      );
      if (reservationLine) {
        return reservationLine.isReselling;
      }
      return false;
    };

    // VALUE INITS
    // init selected amenities with nº of arrays of amenity types
    selectedAmenities.value = [...groupedAmenities.value.map(() => [])];

    // init selected room or -1 if
    selectedRoom.value = !currentReservation.value?.isSplitted
      ? currentReservation.value?.preferredRoomId
      : -1;

    watch(availRooms, () => {
      const preferredRoomInAvailRooms = availRooms.value.find(
        (el) => el.id === currentReservation.value?.preferredRoomId
      );
      if (!preferredRoomInAvailRooms && availRooms.value.length > 0) {
        selectedRoom.value = availRooms.value[0].id;
      } else if (preferredRoomInAvailRooms) {
        selectedRoom.value = currentReservation.value?.preferredRoomId;
      } else {
        selectedRoom.value = null;
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (props.splitMode && currentReservation.value?.isSplitted) {
          isShowingRoomPerNight.value = true;
        }
        let dateFrom;
        let dateTo;
        if (currentReservation.value?.checkin && currentReservation.value.checkout) {
          dateFrom = new Date(currentReservation.value.checkin);
          dateTo = new Date(currentReservation.value.checkout);
        }
        await Promise.all([
          store.dispatch('extraBeds/fetchExtraBeds', {
            pmsPropertyId: activeProperty.value?.id,
            dateFrom,
            dateTo,
          }),
          store.dispatch('amenityTypes/fetchAmenityTypes', activeProperty.value?.id),
        ]);

        if (currentReservation.value) {
          await store
            .dispatch('rooms/fetchRoomsByAvailability', {
              pmsPropertyId: activeProperty.value?.id,
              availabilityFrom: new Date(currentReservation.value?.checkin),
              availabilityTo: new Date(currentReservation.value?.checkout),
              pricelistId: activePricelist.value?.id,
              currentLines: currentReservationLines.value.map((el) => el.id),
            })
            .then((response: AxiosResponse<RoomInterface[]>) => {
              optionsRoom.value = response.data;
            });
          const lastNight = new Date(currentReservation.value?.checkout);
          lastNight.setDate(lastNight.getDate() - 1);
          utilsDates
            .getDatesRange(new Date(currentReservation.value?.checkin), lastNight)
            .forEach((date) => {
              const oneDayAfter = new Date(date);
              oneDayAfter.setDate(date.getDate() + 1);
              void store
                .dispatch('rooms/fetchRoomsByAvailability', {
                  pmsPropertyId: activeProperty.value?.id,
                  availabilityFrom: date,
                  availabilityTo: oneDayAfter,
                  pricelistId: activePricelist.value?.id,
                  currentLines: currentReservationLines.value.map((el) => el.id),
                })
                .then((response: AxiosResponse<RoomInterface[]>) => {
                  availabilityPerDay.value.push({
                    date,
                    rooms: response.data,
                  });
                });
            });
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    });

    return {
      activeProperty,
      activePricelist,
      currentFolio,
      currentReservation,
      currentReservationLines,
      numExtraBedsAvailable,
      groupedAmenities,
      optionsRoom,
      availRooms,
      availabilityPerDay,
      calendarDates,
      selectedRoom,
      reservationLinesToChangeRoom,
      selectedCapacity,
      selectedAmenities,

      isReservationReselling,
      isShowingRoomPerNight,
      isFilteringByRoomType,
      isFilteringByCapacity,
      isFilteringByExtraBedsAvailability,
      isFilteringByAmenities,
      saveWithExtraBeds,
      reservationLinesToReselling,
      assignReservation,
      toggleIsFilteringByRoomType,
      toggleIsFilteringByCapacity,
      toggleIsFilteringByAmenities,
      toggleIsShowingRoomPerNight,
      toggleIsReservationReselling,

      selectRoomIdPerNight,
      changeCapacity,
      getAmenityTypeName,
      reservationRoomTypeName,
      reservationRoomTypeCode,
      dateStartMonth,
      dateStartYear,
      save,
      saveChanges,
      saveChangesWithExtraBed,
      isLineReselling,
      assignReservationRoom,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  .confirm-assignment {
    width: 100%;
  }
  .option,
  .option-details {
    margin-top: 1rem;
  }
  .option {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    .label {
      font-size: 0.9rem;
      font-weight: bold;
      flex: 1 1 auto;
    }
  }
  .option-details {
    user-select: none;
    .first {
      display: flex;
      justify-content: space-between;
      span {
        font-weight: bold;
      }
      .month-year {
        text-decoration: underline;
        font-weight: bold;
      }
      .link {
        text-align: right;
        color: $primary;
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
        font-size: 1rem;
      }
    }
    .second {
      .room-input {
        width: 100%;
      }
      .room-feedback {
        color: grey;
      }
      .select {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
    .calendar-content {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      .day-name {
        text-align: center;
        .long {
          display: none;
        }
      }
      .day {
        &:not(.day-name) {
          min-height: 50px;
        }
        width: calc(100% / 7);
        padding: 0.15rem;
        .empty,
        .content {
          border-radius: 4px;
          padding: 0.2rem;
          padding-top: 0;
          height: 100%;
          font-weight: bold;
        }

        .empty {
          background-color: $tertiary;
          color: white;
          border: none;
        }
        .content {
          border: 1px solid $primary;
          color: $corduroy;
          background-color: white;
          select {
            &:focus {
              outline: none !important;
            }
            text-align: center;

            width: 100%;
            overflow: hidden;
            overflow-wrap: break-word;
            display: inline-block;
            white-space: pre-line;
            color: $primary;
            font-weight: bold;
            border: none;
            background-color: white;
            font-size: 1.1rem;
          }
        }
        .reselling {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          .text-reselling {
            display: none;
          }
          input {
            margin-top: 0.2rem;
            margin-left: 0.2rem;
            cursor: pointer;
          }
        }
      }
    }
    .content {
      &.inactive {
        opacity: 0.5;
        pointer-events: none;
      }
    }
    .section-title {
      margin-bottom: 0.5rem;
      margin-top: 1rem;
      font-weight: bold;
      font-size: 1rem;
    }
    .room-selector {
      border: 2px solid $primary;
      border-radius: 5px;
      background-color: $secondary;
      color: $primary;
      font-weight: bold;
      padding: 0.4rem;
      width: 200px;
      font-size: 1rem;
    }
    .split-reservation-link {
      color: $primary;
      font-size: 1rem;
      text-decoration: underline;
      font-weight: bold;
      margin-left: 1rem;
      padding-top: 0.4rem;
      cursor: pointer;
    }
    .rooms-avail-feedback {
      margin-top: 0.5rem;
      margin-bottom: 1.5rem;
      color: grey;
    }
    .btn-capacity {
      &.active {
        background-color: $primary;
        color: white;
      }
      &.not-allowed {
        cursor: not-allowed;
      }
      background-color: white;
      color: $primary;
      cursor: pointer;
      border-radius: 3px;
      text-align: center;
      border: 2px solid $primary;
      min-width: 40px;
      margin-top: 0.5rem;
      color: $primary;
      font-weight: bold;
    }
    .sub-option {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .toggle {
        margin-left: 0.5rem;
      }
    }
    .feedback {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      color: red;
      div:first-child {
        padding-top: 0.5rem;
      }
      div:nth-child(2) {
        margin-left: 1.5rem;
        flex: 1;
      }
    }
  }
  .buttons {
    padding: 1rem 0;
    .button {
      display: block;
      width: 100%;
      margin-top: 1rem;
      &:first-child {
        margin-top: 0;
      }
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-container {
    width: 660px;
    .confirm-assignment {
      width: auto;
      display: flex;
      justify-content: flex-end;
    }
    .option-details {
      .second {
        .room-input {
          width: auto;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
      }
      .content {
        display: flex;
        .btn-capacity {
          margin-top: 0;
          margin-right: 1rem;
          padding: 0 0.5rem;
        }
        &.sub-option {
          justify-content: flex-end;
          flex-direction: row-reverse;
          .toggle {
            margin-right: 0.5rem;
            margin-left: 0;
          }
        }
      }
      &.amenities {
        .second {
          display: flex;
          justify-content: space-between;
          .select {
            width: 33%;
            margin: 0;
          }
        }
      }
      .tip-reselling {
        display: none;
      }
      .calendar-content {
        .day-name {
          text-align: left;
          .long {
            display: block;
          }
          .short {
            display: none;
          }
        }
        .day {
          .content {
            display: flex;
            flex-direction: column;
            .reselling {
              .text-reselling {
                display: block;
              }
            }
          }
        }
      }
    }
    .buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 0;
      padding-bottom: 0;
      .button {
        width: auto;
        margin: 0;
        margin-left: 1rem;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
