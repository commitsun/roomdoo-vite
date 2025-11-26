<template>
  <div class="booking-engine">
    <div class="header">
      <div class="first">
        <div class="left">
          <div class="title-container">
            <CustomIcon
              v-if="step === 2 && !currentFolio"
              imagePath="/app-images/back-arrow-black.svg"
              width="22px"
              height="22px"
              class="icon-arrow-back"
              color="black"
              colorHover="primary"
              @click="step = 1"
            />
            <CustomIcon
              v-if="currentFolio"
              imagePath="/app-images/back-arrow-black.svg"
              width="22px"
              height="22px"
              class="icon-arrow-back"
              color="black"
              colorHover="primary"
              @click="backToLastReservationView()"
            />
            <CustomIcon
              v-if="!currentFolio && step === 1"
              imagePath="/app-images/back-arrow-black.svg"
              width="22px"
              height="22px"
              class="icon-arrow-back icon-arrow-back-mobile"
              color="black"
              colorHover="primary"
              @click="closeBookingEngine()"
            />
            <span class="title">
              {{ !currentFolio ? 'NUEVA RESERVA' : 'AÑADIR HABITACIONES' }}
            </span>
          </div>

          <div class="folio" v-if="currentFolio">
            <CustomIcon
              v-if="step === 2 && !currentFolio"
              imagePath="/app-images/back-arrow-black.svg"
              width="22px"
              height="22px"
              class="icon-arrow-back"
              color="black"
              colorHover="primary"
              @click="step = 1"
            />
            <span class="folio-name" v-if="currentFolio"> {{ currentFolio.name }} </span>
          </div>
        </div>
        <div class="right">
          <div class="prices">
            <div class="old-price" v-if="currentFolio">
              {{ currentFolio.amountTotal?.toFixed(2) }} €
            </div>
            <CustomIcon
              imagePath="/app-images/trending-flat.svg"
              v-if="
                currentFolio &&
                currentReservations?.length !==
                  (currentReservations?.length ?? 0) +
                    reservationsByRoomTypeToCreate
                      .map((el) => el.reservations.length)
                      .reduce((a, b) => a + b, 0)
              "
              width="28px"
              height="28px"
              color="primary"
              class="icon-arrow-back"
            />
            <div class="new-price" v-if="folioTotalPrice > 0">
              {{ (folioTotalPrice + (currentFolio?.amountTotal ?? 0)).toFixed(2) }} €
            </div>
          </div>
          <div class="rooms" v-if="currentFolio">
            <div class="old-rooms">{{ currentReservations?.length }} hab.</div>
            <CustomIcon
              imagePath="/app-images/trending-flat.svg"
              width="28px"
              height="28px"
              color="primary"
              v-if="
                currentReservations?.length !==
                (currentReservations?.length ?? 0) +
                  reservationsByRoomTypeToCreate
                    .map((el) => el.reservations.length)
                    .reduce((a, b) => a + b, 0)
              "
            />
            <div
              class="new-rooms"
              v-if="
                currentReservations?.length !==
                (currentReservations?.length ?? 0) +
                  reservationsByRoomTypeToCreate
                    .map((el) => el.reservations.length)
                    .reduce((a, b) => a + b, 0)
              "
            >
              {{
                (currentReservations?.length ?? 0) +
                reservationsByRoomTypeToCreate
                  .map((el) => el.reservations.length)
                  .reduce((a, b) => a + b, 0)
              }}
              hab.
            </div>
          </div>
        </div>
      </div>
      <div class="second" v-if="currentFolio">
        {{ currentFolio.partnerName }}
      </div>
    </div>
    <div class="content" v-if="step === 1">
      <!-- RESERVATION TYPE -->
      <div class="section-card" v-if="!currentFolio && !currentReservations">
        <div class="title-section-card">
          <div class="left">Tipo de reserva</div>
        </div>
        <div class="content-section-card">
          <div class="reservation-type">
            <div
              class="option"
              :class="{ selected: selectedReservationType === 'normal' }"
              @click="changeReservationType('normal')"
            >
              Normal
            </div>
            <div
              class="option"
              :class="{ selected: selectedReservationType === 'group' }"
              @click="changeReservationType('group')"
            >
              Grupo
            </div>
            <div
              class="option"
              :class="{ selected: selectedReservationType === 'out' }"
              @click="changeReservationType('out')"
            >
              Fuera de servicio
            </div>
            <div
              class="option"
              :class="{ selected: selectedReservationType === 'staff' }"
              @click="changeReservationType('staff')"
            >
              Invitado
            </div>
          </div>
        </div>
      </div>
      <!-- SALE CHANNEL & PRICELIST -->
      <div
        class="section-card"
        v-if="
          selectedReservationType === 'group' ||
          selectedReservationType === 'normal' ||
          selectedReservationType === 'staff'
        "
      >
        <div class="title-section-card">
          <div class="left">Información de venta</div>
        </div>
        <div class="content-section-card">
          <div class="sale-info">
            <div
              class="item"
              v-if="selectedReservationType === 'group' || selectedReservationType === 'normal'"
            >
              <span class="label"> Canal de venta: </span>
              <div class="select">
                <AutocompleteComponent
                  :items="
                    saleChannels
                      .filter((el) => el.isOnLine === false)
                      .map((el) => ({ value: el.id, name: el.name }))
                  "
                  id="sale-channel-booking-engine-autocomplete"
                  v-model="selectedSaleChannelId"
                  :minChars="0"
                  :showAddNewOption="false"
                  keepResultAfterChoose
                  :emptyResultsAfterClick="false"
                  iconExpandCollapse
                  isChangeFocusOnEnter
                  placeholderValue="Selecciona un canal de venta"
                />
              </div>
            </div>
            <div class="item">
              <span class="label"> Tarifa: </span>
              <div class="select">
                <AutocompleteComponent
                  class="select"
                  :items="pricelists.map((el) => ({ value: el.id, name: el.name }))"
                  id="pricelist-booking-engine-autocomplete"
                  v-model="selectedPricelistId"
                  :minChars="0"
                  :showAddNewOption="false"
                  keepResultAfterChoose
                  :emptyResultsAfterClick="false"
                  iconExpandCollapse
                  isChangeFocusOnEnter
                  :disable="selectedSaleChannelId === 0 && selectedReservationType !== 'staff'"
                  placeholderValue="Selecciona una tarifa"
                />
              </div>
            </div>
          </div>
          <div
            class="sale-info"
            v-if="selectedSaleChannel && selectedSaleChannel.channelType === 'indirect'"
          >
            <div class="item">
              <span class="label"> Agencia: </span>
              <div class="select">
                <AutocompleteComponent
                  :items="
                    agencies
                      .filter((el) => el.saleChannelId === selectedSaleChannelId)
                      .map((el) => ({ value: el.id, name: el.name }))
                  "
                  id="agencies-bookin-engine-autocomplete"
                  v-model="selectedAgencyId"
                  :minChars="0"
                  :showAddNewOption="false"
                  keepResultAfterChoose
                  :emptyResultsAfterClick="false"
                  iconExpandCollapse
                  isChangeFocusOnEnter
                  placeholderValue="Selecciona una agencia"
                />
              </div>
            </div>
            <div class="item">
              <span class="label"> Referencia externa: </span>
              <div class="input">
                <InputText v-model="externalReference" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- OUT OF SERVICE RESERVATIONS DATA -->
      <div class="section-card" v-else-if="selectedReservationType === 'out'">
        <div class="title-section-card">
          <div class="left">Información de fuera de servicio</div>
        </div>
        <div class="content-section-card">
          <div class="out-of-service-info">
            <div class="item">
              <span class="label"> Motivo de cierre </span>
              <div class="select">
                <AutocompleteComponent
                  :items="roomClosureReasons.map((el) => ({ value: el.id, name: el.name }))"
                  id="closure-reason-bookin-engine-autocomplete"
                  v-model="selectedRoomClosureReasonId"
                  :minChars="0"
                  :showAddNewOption="false"
                  keepResultAfterChoose
                  iconExpandCollapse
                  isChangeFocusOnEnter
                  :disable="currentFolio !== null"
                  placeholderValue="Selecciona un motivo de cierre"
                />
              </div>
            </div>
            <div class="item">
              <span class="label"> Descripción </span>
              <div class="input">
                <InputText
                  v-model="roomClosureReasonDescription"
                  :disabled="currentFolio !== null"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- DATES -->
      <div
        class="section-card"
        v-if="
          (selectedPricelistId !== 0 &&
            selectedSaleChannelId !== 0 &&
            ((selectedSaleChannel?.channelType === 'indirect' && selectedAgencyId !== 0) ||
              selectedSaleChannel?.channelType !== 'indirect')) ||
          (selectedReservationType === 'out' &&
            selectedRoomClosureReasonId !== 0 &&
            roomClosureReasonDescription !== '') ||
          selectedReservationType === 'staff'
        "
      >
        <div class="title-section-card">
          <div class="left">Duración de la reserva</div>
        </div>
        <div class="content-section-card">
          <div class="dates">
            <CustomIcon
              imagePath="/app-images/calendar-grey.svg"
              width="22px"
              height="22px"
              color="primary"
              class="icon-calendar"
            />
            <DatePicker
              v-model="dates"
              class="datepicker"
              inputClass="input-date-picker"
              dateFormat="dd MM yy"
              placeholder="DD/MM/YYYY"
              size="small"
              selectionMode="range"
              hideOnRangeSelection
              :manualInput="false"
            />
          </div>
          <p class="text-dates" v-if="checkin && checkout">
            Desde el
            <span class="font-bold">
              {{ `${checkin.toLocaleString('default', { weekday: 'long' })}` }}
              {{ `${checkin.getDate()}` }}
              de
              {{ `${checkin.toLocaleString('default', { month: 'long' })}` }}
              de
              {{ `${checkin.getFullYear()}` }} </span
            >, hasta el
            <span class="font-bold">
              {{ `${checkout.toLocaleString('default', { weekday: 'long' })}` }}
              {{ `${checkout.getDate()}` }}
              de
              {{ `${checkout.toLocaleString('default', { month: 'long' })}` }}
              de
              {{ `${checkout.getFullYear()}` }}.
            </span>
          </p>
          <p class="text-dates font-bold" v-if="checkin && checkout">
            Estancia de {{ numDays }} noche{{ numDays === 1 ? '' : 's' }}.
          </p>
        </div>
      </div>
      <!-- ROOM TYPE INCREMENT CONTROL -->
      <div
        class="section-card"
        v-if="
          (checkin &&
            checkout &&
            selectedPricelistId !== 0 &&
            selectedSaleChannelId !== 0 &&
            ((selectedSaleChannel?.channelType === 'indirect' && selectedAgencyId !== 0) ||
              selectedSaleChannel?.channelType !== 'indirect')) ||
          (selectedReservationType === 'out' &&
            selectedRoomClosureReasonId !== 0 &&
            roomClosureReasonDescription !== '') ||
          selectedReservationType === 'staff'
        "
      >
        <div class="title-section-card">
          <div class="left">Añadir habitaciones</div>
        </div>
        <div class="content-section-card">
          <div class="availability-plan" v-if="showAvailabilityPlan">
            <div class="icon-alert">
              <CustomIcon
                imagePath="/app-images/icon-alert-2.svg"
                width="14px"
                height="14px"
                color="#73510d"
              />
            </div>
            <div class="availability-plan-text">
              <span class="availability-plan-title">
                Disponibilidad limitada por restricciones
              </span>
              <span>
                "{{ availabilityPlanName }}" tiene reglas aplicadas en estas fechas, consulta el
                calendario
              </span>
            </div>
          </div>
          <span v-for="roomType in roomTypeSelector" :key="roomType.id">
            <div class="room-type-option">
              <div class="left-wrapper">
                <div class="left">
                  <div class="room-type-name">
                    {{ roomTypeName(roomType.id) }}
                  </div>
                  <div
                    class="room-type-text text-red"
                    v-if="
                      freeRoomsByType.filter(
                        (el) =>
                          el.roomTypeId === roomType.id && !notAvailableRoomIds.includes(el.id)
                      ).length === 0
                    "
                  >
                    No hay habitaciones libres
                  </div>
                  <div class="room-type-text" v-else>
                    {{
                      freeRoomsByType.filter(
                        (el) =>
                          el.roomTypeId === roomType.id && !notAvailableRoomIds.includes(el.id)
                      ).length
                    }}
                    habitaci{{
                      freeRoomsByType.filter(
                        (el) =>
                          el.roomTypeId === roomType.id && !notAvailableRoomIds.includes(el.id)
                      ).length === 1
                        ? 'ón'
                        : 'ones'
                    }}
                    libre{{
                      freeRoomsByType.filter(
                        (el) =>
                          el.roomTypeId === roomType.id && !notAvailableRoomIds.includes(el.id)
                      ).length === 1
                        ? ''
                        : 's'
                    }}
                  </div>
                </div>
                <div
                  class="available-room-type-pill"
                  v-if="isRoomTypeAvailabilityLimited(roomType.id)"
                >
                  <CustomIcon
                    imagePath="/app-images/icon-alert-2.svg"
                    width="13px"
                    height="13px"
                    color="#73510d"
                    class="icon-warning"
                  />
                  <div
                    class="available-room-type available-room-type-red"
                    v-if="
                      (globalAvailableRooms.find((rt) => rt.roomTypeId === roomType.id)?.count ||
                        0) <= 0
                    "
                  >
                    Sin disponibilidad
                  </div>
                  <div class="available-room-type" v-else>
                    {{
                      globalAvailableRooms.find((rt) => rt.roomTypeId === roomType.id)?.count || 0
                    }}
                    disponible{{
                      globalAvailableRooms.find((rt) => rt.roomTypeId === roomType.id)?.count === 1
                        ? ''
                        : 's'
                    }}
                  </div>
                </div>
              </div>
              <div class="right">
                <div class="number-selector">
                  <div class="icon-wrapper">
                    <AppButton
                      icon="pi pi-minus"
                      class="btn"
                      :class="{
                        disabled:
                          (reservationsByRoomTypeToCreate?.find(
                            (el) => el.roomTypeId === roomType.id
                          )?.reservations.length ?? 0) <= 0,
                      }"
                      :pt="{
                        root: {
                          style: 'padding: 0; background-color: #1e9ed9; border: none;',
                        },
                        icon: { style: 'font-size: 10px; font-weight: bold;' },
                      }"
                      @click="removeReservation({ roomTypeId: roomType.id })"
                    />
                  </div>
                  <div class="current-value text-center">
                    <input
                      type="number"
                      :value="
                        (reservationsByRoomTypeToCreate
                          .filter((el) => el.roomTypeId === roomType.id)
                          .map((rt) => rt.reservations)
                          .reduce((acc, val) => acc.concat(val), []).length > 0
                          ? reservationsByRoomTypeToCreate
                              .filter((el) => el.roomTypeId === roomType.id)
                              .map((rt) => rt.reservations)
                              .reduce((acc, val) => acc.concat(val), []).length
                          : 0) +
                        (oldReservationsByRoomTypeToCreate
                          .filter((el) => el.roomTypeId === roomType.id)
                          .map((rt) => rt.reservations)
                          .reduce((acc, val) => acc.concat(val), []).length > 0
                          ? oldReservationsByRoomTypeToCreate
                              .filter((el) => el.roomTypeId === roomType.id)
                              .map((rt) => rt.reservations)
                              .reduce((acc, val) => acc.concat(val), []).length
                          : 0)
                      "
                      @blur="
                        addOrRemoveMultipleReservations(
                          roomType.id,
                          parseInt(($event.target as HTMLInputElement).value, 10) -
                            (oldReservationsByRoomTypeToCreate
                              .filter((el) => el.roomTypeId === roomType.id)
                              .map((rt) => rt.reservations)
                              .reduce((acc, val) => acc.concat(val), []).length > 0
                              ? oldReservationsByRoomTypeToCreate
                                  .filter((el) => el.roomTypeId === roomType.id)
                                  .map((rt) => rt.reservations)
                                  .reduce((acc, val) => acc.concat(val), []).length
                              : 0)
                        )
                      "
                      :min="0"
                    />
                  </div>
                  <div class="icon-wrapper">
                    <AppButton
                      icon="pi pi-plus"
                      class="btn"
                      :class="{
                        disabled:
                          freeRoomsByType.filter(
                            (el) =>
                              el.roomTypeId === roomType.id && !notAvailableRoomIds.includes(el.id)
                          ).length === 0 && selectedReservationType === 'out',
                        'no-avail':
                          (globalAvailableRooms.find((rt) => rt.roomTypeId === roomType.id)
                            ?.count || 0) <= 0,
                      }"
                      :pt="{
                        root: {
                          style: 'padding: 0; background-color: #1e9ed9; border: none;',
                        },
                        icon: { style: 'font-size: 10px; font-weight: bold;' },
                      }"
                      @click="addReservation(roomType.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr />
          </span>
        </div>
      </div>
      <!-- SWITCH BETWEEN ROOM/ROOM TYPE CARDS VIEWS -->
      <div
        class="grouped-control"
        v-if="
          reservationsByRoomTypeToCreate
            .map((el) => el.reservations)
            .reduce((acc, val) => acc.concat(val), []).length > 0 ||
          (currentFolio && currentReservations)
        "
      >
        <div class="left">
          {{
            reservationsByRoomTypeToCreate
              .map((el) => el.reservations)
              .reduce((acc, val) => acc.concat(val), []).length + (currentReservations?.length ?? 0)
          }}
          habitaci{{
            reservationsByRoomTypeToCreate
              .map((el) => el.reservations)
              .reduce((acc, val) => acc.concat(val), []).length === 1
              ? 'ón '
              : 'ones'
          }}
          en la reserva.
        </div>
        <div class="right">
          <div class="btn-switch-view" @click="isGroupedReservations = !isGroupedReservations">
            <CustomIcon
              imagePath="/app-images/visibility-fill.svg"
              width="15px"
              height="15px"
              class="icon"
              color="white"
            />
            <span class="btn-text" v-if="!isGroupedReservations"> Ver agrupadas </span>
            <span class="btn-text" v-if="isGroupedReservations"> Ver separadas </span>
          </div>

          <div class="three-dots">
            <CustomIcon
              imagePath="/app-images/three-dots-white.svg"
              width="25px"
              height="25px"
              color="black"
              colorHover="primary"
              :class="{
                disabled:
                  reservationsByRoomTypeToCreate.length === 0 ||
                  reservationsByRoomTypeToCreate
                    .map((el) => el.reservations)
                    .reduce((acc, val) => acc.concat(val), [])
                    .some((el) => el.roomId === 0 || el.adults === 0),
              }"
              @click.stop="isOpenMenu = !isOpenMenu"
              @blur="isOpenMenu = false"
              tabindex="1"
            />
            <transition name="menu">
              <div class="menu" v-if="isOpenMenu">
                <div @mousedown="openBatchChanges()">Modificación en lote</div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <!-- ROOM TYPE CARDS -->
      <div v-if="isGroupedReservations && checkin && checkout" class="grouped-reservations">
        <BookingEngineRoomType
          v-for="roomTypeReservations in reservationsByRoomTypeToCreate"
          :key="roomTypeReservations.roomTypeId"
          :roomTypeReservations="roomTypeReservations"
          :selectedReservationType="selectedReservationType"
          :selectedPricelistId="selectedPricelistId"
          :checkinDateSelected="checkin"
          :checkoutDateSelected="checkout"
          @toggleRoomType="toggleRoomType($event)"
          @toggleReservation="toggleReservation($event)"
          @setReservationAdults="setReservationAdults($event)"
          @setReservationChildren="setReservationChildren($event)"
          @addReservationExtraService="addReservationExtraService($event)"
          @removeReservationExtraService="removeReservationExtraService($event)"
          @setReservationRoomId="setReservationRoomId($event)"
          @setReservationBoardService="addReservationBoardServiceLinesAndItems($event)"
          @updateReservationRangeDates="updateReservationRangeDates($event)"
        />

        <!-- this template is only if new folio is called from existing reservation (adding rooms)-->
        <template v-if="currentFolio && currentReservations">
          <BookingEngineRoomType
            v-for="roomTypeReservations in oldReservationsByRoomTypeToCreate"
            :key="roomTypeReservations.roomTypeId"
            :roomTypeReservations="roomTypeReservations"
            :selectedReservationType="selectedReservationType"
            :checkinDateSelected="checkin"
            :checkoutDateSelected="checkout"
            :selectedPricelistId="selectedPricelistId"
            @toggleReservation="toggleOldReservation($event)"
            @toggleRoomType="toggleOldRoomType($event)"
          />
        </template>
      </div>
      <!-- RESERVATION CARDS -->
      <div v-else-if="checkin && checkout" class="reservation-cards-container">
        <BookingEngineReservation
          v-for="(reservation, reservationIndex) in reservationsByRoomTypeToCreate
            .map((el) => el.reservations)
            .reduce((acc, val) => acc.concat(val), [])"
          :key="reservation.id"
          :reservation="reservation"
          :reservationIndex="reservationIndex"
          :checkinDateSelected="checkin"
          :checkoutDateSelected="checkout"
          :selectedReservationType="selectedReservationType"
          @toggleReservation="toggleReservation($event)"
          @removeReservation="removeReservation($event)"
        >
          <BookingEngineReservationInfo
            :reservation="reservation"
            :selectedReservationType="selectedReservationType"
            :reservationIndex="reservationIndex"
            :selectedPricelistId="selectedPricelistId"
            @setReservationAdults="setReservationAdults($event)"
            @setReservationChildren="setReservationChildren($event)"
            @setReservationRoomId="setReservationRoomId($event)"
            @addReservationExtraService="addReservationExtraService($event)"
            @removeReservationExtraService="removeReservationExtraService($event)"
            @setReservationBoardService="addReservationBoardServiceLinesAndItems($event)"
            @updateReservationRangeDates="updateReservationRangeDates($event)"
            @toggleReservationAutoAssignRoomChanged="
              reservation.autoAssignRoom = !reservation.autoAssignRoom
            "
          />
        </BookingEngineReservation>
        <template v-if="currentFolio && currentReservations">
          <BookingEngineReservation
            v-for="(reservation, reservationIndex) in oldReservationsByRoomTypeToCreate.length > 0
              ? oldReservationsByRoomTypeToCreate
                  .map((el) => el.reservations)
                  .reduce((acc, val) => acc.concat(val), [])
              : []"
            :key="reservation.id"
            :reservation="reservation"
            :reservationIndex="reservationIndex"
            :checkinDateSelected="checkin"
            :checkoutDateSelected="checkout"
            :selectedReservationType="selectedReservationType"
            @toggleReservation="toggleOldReservation($event)"
          >
            <BookingEngineReservationInfo
              :reservation="reservation"
              :selectedReservationType="selectedReservationType"
              :reservationIndex="reservationIndex"
              :selectedPricelistId="selectedPricelistId"
              @toggleReservationAutoAssignRoomChanged="
                reservation.autoAssignRoom = !reservation.autoAssignRoom
              "
            />
          </BookingEngineReservation>
        </template>
      </div>
      <!-- NEXT STEP LINKS -->
      <div
        class="buttons-container"
        v-if="
          reservationsByRoomTypeToCreate
            .map((el) => el.reservations)
            .reduce((acc, val) => acc.concat(val), []).length > 0
        "
      >
        <AppButton
          v-if="currentFolio && currentReservations"
          color="primary"
          @click="!notAllowedNextStep ? updateFolio() : false"
          label="Guardar cambios"
          class="btn"
          :class="{ disabled: notAllowedNextStep }"
        />
        <AppButton
          v-else
          color="primary"
          @click="!notAllowedNextStep ? (step = 2) : false"
          label="Siguiente"
          :class="{ disabled: notAllowedNextStep }"
          class="btn"
        />
      </div>
    </div>
    <!-- STEP 2 -->
    <div class="content" v-if="step == 2">
      <!-- RESERVATION DIGEST -->
      <div class="section-card">
        <div class="title-section-card flex justify-between">
          <div class="left">Resumen de la reserva</div>
        </div>
        <div class="content-section-card">
          <div class="resume-dates">
            <div class="date-checkin">
              {{
                minAllCheckins.toLocaleDateString('default', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })
              }}
            </div>
            <CustomIcon
              imagePath="/app-images/chevron-right.svg"
              width="20px"
              height="20px"
              class="icon-arrow-wrapper"
              color="black"
            />
            <div class="date-checkout">
              {{
                maxAllCheckouts.toLocaleDateString('default', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })
              }}
            </div>
          </div>
          <div class="resume-stay">
            <p>
              Desde el
              <span class="text-bold">
                {{
                  minAllCheckins.toLocaleDateString('default', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                }} </span
              >, hasta el
              <span class="text-bold">
                {{
                  maxAllCheckouts.toLocaleDateString('default', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                }} </span
              >.
            </p>
            <p class="text-bold" v-if="selectedReservationType !== 'out'">
              <span v-if="allReservationsSameCheckinAndCheckout">
                Estancia de {{ numDays }} noche{{ numDays === 1 ? '' : 's' }}.
              </span>
              <span v-else> Reservas con fechas diferentes. </span>
            </p>
            <Tree
              v-if="selectedReservationType !== 'out'"
              :value="reservationNodesTreeView"
              class="tree"
            />
          </div>
        </div>
      </div>
      <!-- CUSTOMER DATA -->
      <div class="section-card" v-if="selectedReservationType !== 'out'">
        <div class="title-section-card flex justify-between">
          <div class="left">Información de contacto</div>
          <span class="edit text-primary q-pr-md" @click="openContactDetail()" v-if="selectedPartner">
            Editar
          </span>
        </div>
        <div class="content-section-card">
          <div class="partner-data">
            <div class="partner-row">
              <div class="partner-field">
                <AutocompleteComponent
                  @textSearchChanges="updateCustomerSearchBox($event)"
                  @addNew="openNewContact()"
                  id="partners-autocomplete"
                  icon="search"
                  v-model="selectedPartnerId"
                  :items="itemsAutocompleteCustomer"
                  placeholderShowingOptions="Buscar clientes"
                  placeholderValue="Buscar clientes"
                  isItemToRemove
                  keepResultAfterChoose
                  @removeItem="removePartner()"
                  class="partner-input"
                >
                  <template #icon>
                    <img src="/app-images/search.svg" />
                  </template>
                </AutocompleteComponent>
              </div>
            </div>
            <!-- not selected partner info -->
            <div class="partner-row" v-if="!selectedPartnerId">
              <div class="partner-field">
                <span class="label">Nombre de la reserva</span>
                <InputText
                  v-model="partnerName"
                  :isError="showEmptyPartnerName"
                  class="partner-input"
                  @input="showEmptyPartnerName = false"
                />
              </div>
              <div class="partner-field">
                <span class="label">Idioma de las comunicaciones</span>
                <AppSelect
                  size="small"
                  class="partner-input"
                  optionLabel="text"
                  optionValue="id"
                  placeholder="Selecciona opción"
                  :options="
                    languages.map((el) => ({
                      id: el.code,
                      text: el.name,
                    }))
                  "
                  v-model="languageSelected"
                />
              </div>
            </div>
            <div class="partner-row" v-if="!selectedPartnerId">
              <div class="partner-field">
                <span class="label">Correo electrónico</span>
                <InputText
                  v-model="partnerEmail"
                  :isError="showEmptyPhoneMail"
                  @input="showEmptyPhoneMail = false"
                  class="partner-input"
                />
              </div>
              <div class="partner-field">
                <span class="label">Teléfono</span>
                <InputText
                  v-model="partnerPhone"
                  :isError="showEmptyPhoneMail"
                  @input="showEmptyPhoneMail = false"
                  class="partner-input"
                />
              </div>
            </div>

            <!-- selected partner info -->
            <div class="existing-partner-data" v-if="selectedPartner">
              <div class="partner-data-row">
                <span class="label"> Nombre </span>
                <span class="text-bold">
                  {{ selectedPartner.name }}
                </span>
              </div>
              <div class="partner-data-row">
                <span class="label"> Email </span>
                <span class="text-bold">
                  {{ selectedPartner.email }}
                </span>
              </div>
              <div class="partner-data-row">
                <span class="label"> Telefono </span>
                <span class="text-bold">
                  {{ selectedPartner.phone }}
                </span>
              </div>
              <div class="partner-data-row">
                <span> Tipo de documento </span>
                <span class="text-bold">
                  {{ getDocumentType() }}
                </span>
              </div>
              <div class="partner-data-row">
                <span> Número de identificación </span>
                <span class="text-bold">
                  {{ selectedPartner.vatNumber }}
                </span>
              </div>
              <div class="partner-data-row">
                <span> País </span>
                <div class="text-bold">
                  {{ partnerCountryName(selectedPartner.nationality) }}
                </div>
              </div>
            </div>
            <!-- send confirmation email -->
            <div class="partner-row">
              <div class="partner-field">
                <div class="toggle-wrapper">
                  <ToggleSwitch
                    size="small"
                    v-model="isConfirmationMailWillBeSent"
                    class="toggle"
                  />
                  <span @click="isConfirmationMailWillBeSent = !isConfirmationMailWillBeSent">
                    Enviar email de confirmación
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- internal comment -->
          <div class="internal-comments">
            <div class="internal-comments-header">
              <div class="left">
                <div class="pin-icon-wrapper">
                  <img src="/app-images/pin.svg" class="pin-icon" />
                </div>
                <span> Notas y comentarios internos </span>
              </div>
            </div>
            <div class="internal-comments-content">
              <textarea class="internal-comment" v-model="internalComment" />
            </div>
          </div>
        </div>
      </div>
      <!-- SAVE DATA LINKS -->
      <div class="buttons-container">
        <AppButton
          color="primary"
          @click="saveFolio(true)"
          label="Confirmar reserva"
          class="btn btn-confirm"
          size="small"
        />
        <AppButton
          color="primary"
          v-if="selectedReservationType !== 'out'"
          @click="saveFolio(false)"
          label="Guardar como presupuesto"
          class="btn btn-draft"
          size="small"
          severity="secondary"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, type Ref, markRaw } from 'vue';

import type { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Tree from 'primevue/tree';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import type { TreeNode } from 'primevue/treenode';

import utilsDates, { ONE_DAY_IN_MS } from '@/_legacy/utils/dates';
import { useStore } from '@/_legacy/store';
import { usePartner } from '@/_legacy/utils/usePartner';
import { usePlanning } from '@/_legacy/utils/usePlanning';
import { dialogService } from '@/_legacy/services/DialogService';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useI18n } from 'vue-i18n';

import type {
  ReservationsToCreateInterface,
  RoomTypeReservationsToCreateInterface,
  RoomTypeSelectorInterface,
} from '@/_legacy/interfaces/BookingEngine';
import type { RoomInterface } from '@/_legacy/interfaces/RoomInterfaces';
import type { ServiceLineInterface } from '@/_legacy/interfaces/ServiceLineInterface';
import type { RoomTypePrices } from '@/_legacy/interfaces/RoomTypePrices';
import type { ReservationLineInterface } from '@/_legacy/interfaces/ReservationLineInterface';
import type { PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import type { ServiceInterface } from '@/_legacy/interfaces/ServiceInterface';
import type { PayloadAvailabilityRoomsInterface } from '@/_legacy/interfaces/PayloadAvailabilityRooms';
import type { RoomTypeInterface } from '@/_legacy/interfaces/RoomTypeInterfaces';

import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';
import InputText from '@/_legacy/components/roomdooComponents/InputText.vue';
import BookingEngineRoomType from '@/_legacy/components/bookingEngine/BookingEngineRoomType.vue';
import BookingEngineReservation from '@/_legacy/components/bookingEngine/BookingEngineReservation.vue';
import BookingEngineReservationInfo from '@/_legacy/components/bookingEngine/BookingEngineReservationInfo.vue';
import ContactDetail from '@/ui/components/contacts/ContactDetail.vue';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import FolioBatchChanges from '@/_legacy/components/folios//FolioBatchChanges.vue';

import type { FolioApiInterface } from '@/_legacy/interfaces/FolioInterface';
import type { CountGlobalAvailableRooms } from '@/_legacy/interfaces/CountGlobalAvailableRooms';
import type {
  BatchChangesInterface,
  ExtraServiceInterface,
} from '@/_legacy/interfaces/BatchChangesInterface';
import type { ReservationApiInterface } from '@/_legacy/interfaces/ReservationInterface';

export default defineComponent({
  components: {
    DatePicker,
    CustomIcon,
    AutocompleteComponent,
    InputText,
    AppButton: Button,
    BookingEngineRoomType,
    BookingEngineReservation,
    BookingEngineReservationInfo,
    Tree,
    AppSelect: Select,
    ToggleSwitch,
  },
  setup() {
    // composables
    const store = useStore();
    const { fetchPartners } = usePartner();
    const { refreshPlanning } = usePlanning();
    const uiStore = useUIStore();
    const contactsStore = useContactsStore();
    const { openDialog } = useAppDialog();
    const { t } = useI18n();
    // const
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // refs
    const step = ref(1);
    const selectedReservationType = ref('normal');
    const freeRoomsByType = ref([] as RoomInterface[]);
    const availabilityPlanName = ref('');
    const selectedSaleChannelId = ref(0);
    const selectedPricelistId = ref(0);
    const selectedAgencyId = ref(0);
    const externalReference = ref('');
    const selectedRoomClosureReasonId = ref(0);
    const roomClosureReasonDescription = ref('');
    const dates: Ref<Date[]> = ref([today, tomorrow]);
    const roomTypeSelector = ref([] as RoomTypeSelectorInterface[]);
    const globalAvailableRooms = ref([] as CountGlobalAvailableRooms[]);
    const prices = ref([] as RoomTypePrices[]);
    const reservationsByRoomTypeToCreate = ref([] as RoomTypeReservationsToCreateInterface[]);
    const oldReservationsByRoomTypeToCreate = ref({} as RoomTypeReservationsToCreateInterface[]);
    const loadingPrices = ref(false);
    const isGroupedReservations = ref(false);
    const isOpenMenu = ref(false);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const languageSelected = ref('0');
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartnerId = ref(0);
    const isConfirmationMailWillBeSent = ref(false);
    const partnerName = ref('');
    const partnerPhone = ref('');
    const partnerEmail = ref('');
    const showEmptyPhoneMail = ref(false);
    const showEmptyPartnerName = ref(false);
    const internalComment = ref('');
    // computed
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const saleChannels = computed(() => store.state.saleChannels.saleChannels);
    const agencies = computed(() => store.state.agencies.agencies);
    const roomClosureReasons = computed(() => store.state.roomClosureReasons.roomClosureReasons);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const partners = computed(() => store.state.partners.partners);
    const rightDrawerExpanded = computed(() => store.state.layout.rightDrawerExpanded);
    const currentPartner = computed(() => store.state.partners.currentPartner);
    const roomTypes = computed(() => store.state.roomTypes.roomTypes);
    const extraServices = computed(() => store.state.products.products);
    const languages = computed(() => store.state.languages.languages);

    const pricelists = computed(() => {
      const result = [...store.state.pricelists.pricelists];
      const currentPricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === currentFolio.value?.pricelistId
      );
      if (!currentPricelist && store.state.pricelists.restrictedPricelist) {
        result.push(store.state.pricelists.restrictedPricelist);
      }
      return result;
    });

    const selectedSaleChannel = computed(() =>
      store.state.saleChannels.saleChannels.find((el) => el.id === selectedSaleChannelId.value)
    );

    const checkin = computed(() => {
      let result = null;
      if (dates.value.length === 2 && dates.value[0] && dates.value[1]) {
        result = new Date(dates.value[0]);
        result.setHours(0, 0, 0, 0);
      }
      return result;
    });

    const checkout = computed(() => {
      let result = null;
      if (dates.value.length === 2 && dates.value[0] && dates.value[1]) {
        result = new Date(dates.value[1]);
        result.setHours(0, 0, 0, 0);
      }
      return result;
    });

    const numDays = computed(() => {
      if (dates.value.length === 2 && dates.value[0] && dates.value[1]) {
        return utilsDates.daysBetween(dates.value[0], dates.value[1]);
      }
      return 0;
    });

    const notAvailableRoomIds = computed(() => {
      if (checkin.value && checkout.value) {
        const from = checkin.value;
        const to = checkout.value;
        return freeRoomsByType.value
          .filter((el) =>
            reservationsByRoomTypeToCreate.value
              .map((el2) => el2.reservations)
              .reduce((acc, val) => acc.concat(val), [])
              .filter(
                (nr) =>
                  nr.checkin.getTime() >= from.getTime() && nr.checkout.getTime() <= to.getTime()
              )
              .map((nr) => nr.roomId)
              .includes(el.id)
          )
          .map((el) => el.id);
      }
      return [];
    });

    const notAllowedNextStep = computed(() =>
      reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations)
        .reduce((acc, val) => acc.concat(val), [])
        .some((el) => (el.roomId === 0 && !el.autoAssignRoom) || el.adults === 0)
    );

    const folioTotalPrice = computed(() => {
      const newPriceTotalNights = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations)
        .reduce((acc, val) => acc.concat(val), [])
        .map((el) =>
          el.reservationLines
            .map((rl) => rl.price * (rl.discount !== 0 ? rl.discount / 100 : 1))
            .reduce((a, b) => a + b, 0)
        )
        .reduce((a, b) => a + b, 0);

      const newPriceTotalServices = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations)
        .reduce((acc, val) => acc.concat(val), [])
        .map((el) =>
          el.extraServices.map((ex) =>
            ex.items
              .map((i) => i.priceUnit * (i.discount !== 0 ? i.discount / 100 : 1) * i.quantity)
              .reduce((a, b) => a + b, 0)
          )
        )
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => a + b, 0);
      return newPriceTotalNights + newPriceTotalServices;
    });

    const minAllCheckins = computed(() => {
      const times = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations.map((r) => r.checkin.getTime()))
        .flat();
      const minTime = Math.min(...times);
      return new Date(minTime);
    });

    const maxAllCheckouts = computed(() => {
      const times = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations.map((r) => r.checkout.getTime()))
        .flat();
      const maxTime = Math.max(...times);
      return new Date(maxTime);
    });

    const allReservationsSameCheckinAndCheckout = computed(() => {
      const checkins = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations.map((r) => r.checkin.getTime()))
        .flat();
      const checkouts = reservationsByRoomTypeToCreate.value
        .map((el) => el.reservations.map((r) => r.checkout.getTime()))
        .flat();
      return (
        checkins.every((el) => el === checkins[0]) && checkouts.every((el) => el === checkouts[0])
      );
    });

    const reservationNodesTreeView = computed(() => {
      let result: TreeNode[] = [];
      const rooms: TreeNode[] = [];
      reservationsByRoomTypeToCreate.value.forEach((rt) => {
        rt.reservations.forEach((reservation) => {
          const extraServices: TreeNode[] = [];
          reservation.extraServices
            .filter((el) => !el.isBoardService)
            .forEach((extraService) => {
              extraServices.push({
                key: `${reservation.roomId}-${extraService._uuid ?? ''}`,
                icon: 'pi pi-fw pi-shopping-cart',
                label: `${extraService.name}`,
              });
            });
          const extra = [];
          if (
            (checkin.value && reservation.checkin.getTime() !== checkin.value.getTime()) ||
            (checkout.value && reservation.checkout.getTime() !== checkout.value.getTime())
          ) {
            extra.push({
              key: `${reservation.roomId}-date-modified`,
              icon: 'pi pi-fw pi-exclamation-triangle',
              label: `Fechas modificadas. Desde el ${reservation.checkin.toLocaleString('default', {
                weekday: 'long',
              })}
                  ${reservation.checkin.getDate()} de ${reservation.checkin.toLocaleString(
                'default',
                { month: 'long' }
              )} de
                  ${reservation.checkin.getFullYear()} hasta el ${reservation.checkout.toLocaleString(
                'default',
                { weekday: 'long' }
              )}
                  ${reservation.checkout.getDate()} de ${reservation.checkout.toLocaleString(
                'default',
                { month: 'long' }
              )} de
                  ${reservation.checkout.getFullYear()}
                  `,
            });
          }
          rooms.push({
            key: `${reservation.roomId}-room`,
            label: `${roomShortName(reservation.roomId)} - ${roomTypeName(
              reservation.roomTypeId
            )} - ${reservation.adults} adultos`,
            children: [
              {
                key: `${reservation.roomId}-board-service`,
                icon: reservation.boardServiceId ? 'pi pi-fw pi-flag' : 'pi pi-fw pi-times',
                label: `${
                  reservation.boardServiceId
                    ? boardServiceName(reservation.boardServiceId) ?? ''
                    : 'Sin régimen incluido'
                }`,
              },
              {
                key: `${reservation.roomId}-extra-services`,
                icon: extraServices.length > 0 ? 'pi pi-fw pi-plus-circle' : 'pi pi-fw pi-times',
                label: `${extraServices.length === 0 ? 'Sin s' : 'S'}ervicios adicionales`,
                children: extraServices,
              },
              ...extra,
            ],
          });
        });
      });
      result = [
        {
          key: 'folio',
          label: `${reservationsByRoomTypeToCreate.value
            .map((el) => el.reservations)
            .reduce((acc, val) => acc.concat(val), [])
            .map((el) => el.adults)
            .reduce((a, b) => a + b, 0)} adultos - ${
            reservationsByRoomTypeToCreate.value
              .map((el) => el.reservations)
              .reduce((acc, val) => acc.concat(val), []).length
          } habitaciones.`,
          children: rooms,
        },
      ];
      return result;
    });

    const isRoomTypeAvailabilityLimited = (roomTypeId: number): boolean => {
      const free =
        globalAvailableRooms.value.find((rt) => rt.roomTypeId === roomTypeId)?.count ?? 0;
      const available = freeRoomsByType.value.filter(
        (el) => el.roomTypeId === roomTypeId && !notAvailableRoomIds.value.includes(el.id)
      ).length;
      const isFreeAndavailableDifferent = free !== available && free >= 0;
      return isFreeAndavailableDifferent;
    };

    const showAvailabilityPlan = computed(() =>
      roomTypeSelector.value.some((rt) => isRoomTypeAvailabilityLimited(rt.id))
    );

    const reservationsMappedForBatchChanges = computed(() => {
      const rdo = [] as BatchChangesInterface[];
      reservationsByRoomTypeToCreate.value.forEach((rt) => {
        rt.reservations.forEach((res) => {
          const extraServicesMapped: ExtraServiceInterface[] = [];
          res.extraServices.forEach((ex) => {
            const items: {
              date: Date;
              discount: number;
              priceUnit: number;
              quantity: number;
            }[] = [];
            ex.items.forEach((item) => {
              items.push({
                date: item.date as Date,
                discount: item.discount,
                priceUnit: item.priceUnit,
                quantity: item.quantity,
              });
            });
            extraServicesMapped.push({
              serviceId: -1,
              isBoardService: ex.isBoardService,
              boardServiceLineId: ex.boardServiceLineId,
              name: ex.name,
              productId: ex.productId,
              items,
              fromBatchChanges: false,
              _uuid: ex._uuid,
            });
          });

          const reservationLines: ReservationLineInterface[] = [];
          res.reservationLines?.forEach((line) => {
            reservationLines.push({ ...line });
          });
          const eachRes = {
            id: res.id,
            checkin: new Date(res.checkin),
            checkout: new Date(res.checkout),
            roomTypeId: res.roomTypeId,
            roomId: res.roomId,
            boardServiceId: res.boardServiceId,
            adults: res.adults,
            children: res.children,
            selected: true,
            extraServices: res.extraServices,
            isSplitted: false,
            reservationLines,
          };
          eachRes.extraServices = extraServicesMapped.map((e) => ({ ...e }));
          rdo.push(eachRes as BatchChangesInterface);
        });
      });
      return rdo;
    });

    // methods
    const changeReservationType = (type: string) => {
      selectedReservationType.value = type;
      if (selectedReservationType.value === 'group') {
        isGroupedReservations.value = true;
        selectedRoomClosureReasonId.value = 0;
      } else if (selectedReservationType.value === 'normal') {
        isGroupedReservations.value = false;
        selectedRoomClosureReasonId.value = 0;
      } else if (selectedReservationType.value === 'staff') {
        isGroupedReservations.value = false;
        selectedSaleChannelId.value = 0;
        selectedPricelistId.value = 0;
        roomClosureReasonDescription.value = '';
      } else if (selectedReservationType.value === 'out') {
        isGroupedReservations.value = false;
        selectedSaleChannelId.value = 0;
        selectedPricelistId.value = 0;
        roomClosureReasonDescription.value = '';
      }
    };

    const removeReservation = (value: { roomTypeId: number; reservationId?: number }) => {
      let reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);

      if (!reservation) {
        reservation = reservationsByRoomTypeToCreate.value
          .find((el) => el.roomTypeId === value.roomTypeId)
          ?.reservations.pop();
      }
      if (reservation) {
        const { checkin, checkout, id, roomTypeClassId, roomId } = reservation;
        // overlapping with the removed reservations
        const overlappingReservations = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter(
            (el) =>
              utilsDates.datesOverlaps(el.checkin, el.checkout, checkin, checkout) &&
              el.id !== id &&
              el.roomTypeClassId === roomTypeClassId
          );
        if (overlappingReservations) {
          // foreach overlapping reservations add reservation removed room id
          overlappingReservations.forEach((el) => {
            if (roomId !== 0) {
              el.availRoomIds.push(roomId);
            }
          });
        }
        const roomTypeReservations = reservationsByRoomTypeToCreate.value.find(
          (el) => el.roomTypeId === value.roomTypeId
        );
        if (roomTypeReservations) {
          const indexToRemove = roomTypeReservations.reservations.findIndex((el) => el.id === id);
          if (indexToRemove !== -1) {
            roomTypeReservations?.reservations.splice(indexToRemove, 1);
          }
        }
        if (roomId !== 0) {
          const availableRooms = globalAvailableRooms.value.find(
            (el) => el.roomTypeId === value.roomTypeId
          );
          if (availableRooms) {
            availableRooms.count += 1;
          }
        }
      }
    };

    const addReservation = async (roomTypeId: number) => {
      void store.dispatch('layout/showSpinner', true);
      // room type
      const roomType = store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId);
      const availableRooms = globalAvailableRooms.value.find((el) => el.roomTypeId === roomTypeId);
      let roomPrice = 0;

      if (checkin.value && checkout.value && roomType) {
        const dateFrom = new Date(checkin.value);

        const dateTo = new Date(checkout.value);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo.setHours(0, 0, 0, 0);
        // calculate room price with default checkin & checkout
        utilsDates
          .getDatesRange(new Date(dateFrom.getTime()), new Date(dateTo.getTime() - ONE_DAY_IN_MS))
          .forEach((date: Date) => {
            roomPrice +=
              prices.value
                .find((el) => el.roomTypeId === roomTypeId)
                ?.prices.find((el) => el.date.getTime() === date.getTime())?.price ?? 0;
          });

        // occupied room IDs in the same range as the new reservation
        const roomsNotAvailFromOverlaps = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter(
            (el) =>
              utilsDates.datesOverlaps(el.checkin, el.checkout, dateFrom, dateTo) &&
              el.roomTypeClassId === roomType.classId
          )
          .map((el) => el.roomId);

        // avail room ids with global checkin & checkout and not in
        // reservations in the same range
        const availRoomIds = freeRoomsByType.value.filter(
          (el) =>
            !roomsNotAvailFromOverlaps.includes(el.id) && el.roomTypeClassId === roomType.classId
        );

        // first room id from available rooms with same type as new reservation
        const room = availRoomIds.find((el) => el.roomTypeId === roomTypeId);

        reservationsByRoomTypeToCreate.value.forEach((rt) => {
          rt.reservations.forEach((r) => {
            if (utilsDates.datesOverlaps(r.checkin, r.checkout, dateFrom, dateTo)) {
              r.availRoomIds = r.availRoomIds.filter((el) => el !== room?.id);
            }
          });
        });

        const existingIds = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations.map((e) => e.id))
          .reduce((a, b) => a.concat(b), []);
        let newId = Math.floor(Math.random() * 1000);
        while (existingIds.includes(newId)) {
          newId = Math.floor(Math.random() * 1000);
        }

        // create reservation lines
        const reservationLines: ReservationLineInterface[] = [];

        utilsDates
          .getDatesRange(dateFrom, new Date(dateTo.getTime() - ONE_DAY_IN_MS))
          .forEach((date) => {
            reservationLines.push({
              date,
              price:
                prices.value
                  .find((el) => el.roomTypeId === roomTypeId)
                  ?.prices.find((el) => el.date.getTime() === date.getTime())?.price ?? 0,
              discount: 0,
              roomId: room?.id ?? 0,
              pmsPropertyId: store.state.properties.activeProperty?.id ?? 0,
            });
          });

        const lastNight = new Date(dateTo);
        lastNight.setDate(lastNight.getDate() - 1);

        // get the availability per day of the room type of the reservation that we are processing
        await store.dispatch('availability/fetchAvailability', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          from: new Date(dateFrom),
          to: lastNight,
          roomTypeId,
        });

        // room ids with the same room type
        const roomIdsWithTheSameRoomType = store.state.rooms.rooms
          .filter((el) => el.roomTypeId === roomTypeId)
          .map((el) => el.id);

        // reservations with assigned room ids with the same room type
        const reservationsWithAssignedRoomIdSameRoomType = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter((el) => roomIdsWithTheSameRoomType.includes(el.roomId)).length;

        const reservationsWithUnnassignedRoomIdSameRoomType = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter((el) => el.roomTypeId === roomTypeId && el.autoAssignRoom).length;

        // default board service id for the room type and pricelist
        const defaultBoardServiceId = store.state.boardServices.boardServices.find(
          (el) =>
            el.roomTypeId === roomTypeId &&
            (el.pricelistIds.includes(selectedPricelistId.value) || el.pricelistIds.length === 0) &&
            el.isDefaultBoardService
        )?.id;

        // create the reservation
        const newReservation: ReservationsToCreateInterface = {
          autoAssignRoom: false,
          isSplittedAvailability: store.state.availability.availability.every(
            (el) =>
              el.roomIds.length >
              reservationsWithAssignedRoomIdSameRoomType +
                reservationsWithUnnassignedRoomIdSameRoomType
          ),
          expanded: false,
          modified: false,
          editable: true,
          id: newId,
          checkin: new Date(dateFrom.getTime()),
          checkout: new Date(dateTo.getTime()),
          roomTypeId,
          roomTypeClassId: roomType.classId,
          boardServiceId: defaultBoardServiceId ?? 0,
          roomId: availableRooms && availableRooms.count > 0 ? room?.id ?? 0 : 0,
          roomPrice,
          reservationLines,
          boardServicePrice: 0,
          adults: room?.capacity ?? 0,
          children: 0,
          extraServices: [],
          boardServices: [],
          availRoomIds: availRoomIds.map((el) => el.id),
        };

        // check if room type id index exists
        const reservationsRoomTypeId = reservationsByRoomTypeToCreate.value.find(
          (el) => el.roomTypeId === roomTypeId
        );
        // if not exists push room type id
        if (!reservationsRoomTypeId) {
          reservationsByRoomTypeToCreate.value.push({
            roomTypeId,
            expanded: false,
            reservations: [newReservation],
            editable: true,
          });
        } else {
          // if exists push reservation
          reservationsRoomTypeId.reservations.push(newReservation);
        }
      }
      if (availableRooms && availableRooms.count > 0) {
        availableRooms.count -= 1;
      }
      void store.dispatch('layout/showSpinner', false);
    };

    const addReservationExtraService = async (value: {
      roomTypeId: number;
      reservationId: number;
      productId: number;
    }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);

      if (value.productId !== 0 && reservation) {
        const product = extraServices.value.find((el) => el.id === value.productId);
        if (selectedPricelistId.value !== 0) {
          const payloadPrices = {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            pricelistId: selectedPricelistId.value,
            productId: value.productId,
            dateFrom: reservation.checkin,
            dateTo: reservation.checkout,
          };
          void store.dispatch('layout/showSpinner', true);
          await store.dispatch('prices/fetchPrices', payloadPrices);
          void store.dispatch('layout/showSpinner', false);
          if (product) {
            const items: ServiceLineInterface[] = [];
            if (product.perDay) {
              let dateStart;
              let dateEnd;
              if (product.consumedOn === 'before') {
                dateStart = new Date(reservation.checkin.getTime());
                dateEnd = new Date(reservation.checkout.getTime() - ONE_DAY_IN_MS);
              } else {
                dateStart = new Date(reservation.checkin.getTime() + ONE_DAY_IN_MS);
                dateEnd = new Date(reservation.checkout.getTime());
              }
              utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                const priceUnit =
                  store.state.prices.prices.find((el) => el.date.getTime() === date.getTime())
                    ?.price ?? 0;
                items.push({
                  priceUnit,
                  date,
                  quantity: product.perPerson ? reservation.adults : 1,
                  discount: 0,
                });
              });
            } else {
              items.push({
                priceUnit:
                  store.state.prices.prices.find(
                    (el) =>
                      el.date.getTime() ===
                      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
                  )?.price ?? 0,
                date: today,
                quantity: product.perPerson ? reservation.adults : 1,
                discount: 0,
              });
            }
            reservation.extraServices.push({
              _uuid: uuidv4(),
              productId: product.id,
              name: product.name,
              perPerson: product.perPerson,
              items,
              isBoardService: false,
            });
          }
        }
      }
    };

    const roomTypeName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.name;

    const addOrRemoveMultipleReservations = async (
      roomTypeId: number,
      numRoomsToOccupy: number
    ) => {
      const numReservationsRoomTypeIdRt =
        reservationsByRoomTypeToCreate.value.find((el) => el.roomTypeId === roomTypeId)
          ?.reservations.length ?? 0;

      if (numReservationsRoomTypeIdRt < numRoomsToOccupy) {
        await Array.from(
          { length: numRoomsToOccupy - numReservationsRoomTypeIdRt },
          (_, index) => index
        ).reduce(async (memo) => {
          await memo;
          await addReservation(roomTypeId);
        }, undefined as unknown);
      } else if (numReservationsRoomTypeIdRt > numRoomsToOccupy) {
        for (let i = 0; i < numReservationsRoomTypeIdRt - numRoomsToOccupy; i += 1) {
          removeReservation({ roomTypeId });
        }
      }
    };

    const buildAvailabilityRoomTypes = async () => {
      roomTypeSelector.value = [];
      reservationsByRoomTypeToCreate.value = [];
      oldReservationsByRoomTypeToCreate.value = [];
      if (currentFolio.value && currentReservations.value && currentReservations.value.length > 0) {
        const currentServices: ServiceInterface[] = [];

        await Promise.all(
          currentReservations.value
            .map((el) => el.id)
            .map(async (i) => {
              await store.dispatch('services/fetchServices', i);
              store.state.services.services
                .filter((el) => !el.isBoardService)
                .forEach((s) => {
                  currentServices.push(s);
                });
            })
        );

        const roomTypeIds = Array.from(
          new Set(store.state.reservations.reservations?.map((el) => el.roomTypeId) ?? [])
        );
        roomTypeIds.forEach((rt) => {
          const reservations = store.state.reservations.reservations
            ?.filter((res) => res.roomTypeId === rt)
            .map((res) => ({
              expanded: false,
              editable: false,
              modified: false,
              id: res.id,
              checkin: new Date(res.checkin),
              checkout: new Date(res.checkout),
              roomTypeId: res.roomTypeId,
              roomTypeClassId:
                store.state.roomTypes.roomTypes.find((r) => r.id === res.roomTypeId)?.classId ?? 0,
              roomId: res.preferredRoomId ?? 0,
              boardServiceId: res.boardServiceId ?? 0,
              roomPrice: res.priceTotal ?? 0,
              boardServicePrice: 0,
              adults: res.adults ?? 0,
              children: res.children ?? 0,
              extraServices: currentServices
                .filter((s) => s.reservationId === res.id)
                .map((el) => ({
                  productId: el.productId,
                  name: el.name ?? '',
                  perPerson: true, // TODO CHANGE THIS
                  isBoardService: el.isBoardService,
                  items: el.serviceLines.map((lin) => ({
                    priceUnit: lin.priceUnit,
                    date: lin.date,
                    quantity: lin.quantity,
                    discount: lin.discount,
                    id: lin.id,
                  })),
                })),
              availRoomIds: [] as number[],
            })) as ReservationsToCreateInterface[];
          oldReservationsByRoomTypeToCreate.value.push({
            expanded: false,
            roomTypeId: rt,
            reservations,
            editable: false,
          });
        });
      }
      // get availability
      let payload: PayloadAvailabilityRoomsInterface;
      if (store.state.properties.activeProperty?.id) {
        if (checkin.value && checkout.value) {
          payload = {
            pmsPropertyId: store.state.properties.activeProperty.id,
            availabilityFrom: checkin.value,
            availabilityTo: checkout.value,
          };
          const response = (await store.dispatch(
            'rooms/fetchRoomsByAvailability',
            payload
          )) as AxiosResponse<RoomInterface[]>;
          freeRoomsByType.value = response.data;
          // set availability for each room type
          roomTypes.value
            .filter((el) => store.state.rooms.rooms.map((r) => r.roomTypeId).includes(el.id))
            .forEach((el: RoomTypeInterface) => {
              roomTypeSelector.value.push({
                id: el.id,
                numRoomsToOccupy: 0,
              });
            });
          const responseFreeRooms = (await store.dispatch('availability/fetchNumAvailRooms', {
            pmsPropertyId: store.state.properties.activeProperty.id,
            from: checkin.value,
            to: checkout.value,
            pricelistId: selectedPricelistId.value,
          })) as AxiosResponse<CountGlobalAvailableRooms[]>;

          globalAvailableRooms.value = responseFreeRooms.data;
        }
      }
    };

    const toggleRoomType = (roomTypeId: number) => {
      const roomType = reservationsByRoomTypeToCreate.value.find(
        (el) => el.roomTypeId === roomTypeId
      );
      if (roomType) {
        roomType.expanded = !roomType.expanded;
      }
      reservationsByRoomTypeToCreate.value
        .filter((el) => el.roomTypeId !== roomTypeId)
        .forEach((el) => {
          el.expanded = false;
          el.reservations.forEach((res) => {
            res.expanded = false;
          });
        });
      oldReservationsByRoomTypeToCreate.value.forEach((el) => {
        el.expanded = false;
        el.reservations.forEach((res) => {
          res.expanded = false;
        });
      });
    };

    const toggleReservation = (value: { roomTypeId: number; reservationId: number }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        reservation.expanded = !reservation.expanded;
      }
      reservationsByRoomTypeToCreate.value.forEach((el) => {
        el.reservations
          .filter((r) => r.id !== value.reservationId)
          .forEach((r) => {
            r.expanded = false;
          });
      });
    };

    const setReservationAdults = (value: {
      roomTypeId: number;
      reservationId: number;
      adults: number;
    }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        reservation.adults = value.adults;
        if (reservation.extraServices) {
          reservation.extraServices.forEach((el) => {
            if (el.perPerson) {
              el.items.forEach((i) => {
                i.quantity = value.adults;
              });
            }
          });
        }
      }
    };

    const setReservationChildren = (value: {
      roomTypeId: number;
      reservationId: number;
      children: number;
    }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        reservation.children = value.children;
      }
    };

    const removeReservationExtraService = (value: {
      roomTypeId: number;
      reservationId: number;
      extraServiceIndex: number;
    }) => {
      reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId)
        ?.extraServices.splice(value.extraServiceIndex, 1);
    };

    const setReservationRoomId = async (value: {
      roomTypeId: number;
      reservationId: number;
      roomId: number;
    }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);

      if (reservation) {
        void store.dispatch('layout/showSpinner', true);
        reservation.roomId = value.roomId;
        const resp = (await store.dispatch('rooms/fetchRoomsByAvailability', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          availabilityFrom: reservation.checkin,
          availabilityTo: reservation.checkout,
        })) as AxiosResponse<RoomInterface[]>;

        const availFromApi = resp.data
          .filter((el) => el.roomTypeClassId === reservation.roomTypeClassId)
          .map((el) => el.id);

        const overlappingReservationsSameRoomTypeClass = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter(
            (el) =>
              utilsDates.datesOverlaps(
                el.checkin,
                el.checkout,
                reservation.checkin,
                reservation.checkout
              ) &&
              el.id !== reservation.id &&
              el.roomTypeClassId === reservation.roomTypeClassId
          );
        reservation.availRoomIds = availFromApi.filter(
          (el) => !overlappingReservationsSameRoomTypeClass.map((ov) => ov.roomId).includes(el)
        );
        overlappingReservationsSameRoomTypeClass.forEach((el) => {
          el.availRoomIds = availFromApi.filter(
            (roomFromApi) =>
              !overlappingReservationsSameRoomTypeClass
                .filter((ov) => ov.id !== el.id)
                .map((ov) => ov.roomId)
                .includes(roomFromApi) && roomFromApi !== reservation.roomId
          );
        });
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const addReservationBoardServiceLinesAndItems = async (value: {
      roomTypeId: number;
      reservationId: number;
      boardServiceId: number;
    }) => {
      if (selectedReservationType.value === 'out') {
        return;
      }
      // reservation
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        // remove previous board service lines
        reservation.extraServices = reservation.extraServices.filter((el) => !el.isBoardService);
        // fetch board service lines
        await store.dispatch('boardServiceLines/fetchBoardServiceLines', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          boardServiceId: value.boardServiceId,
        });

        // for every board service line
        await store.state.boardServiceLines.boardServiceLines.reduce(async (memo, bsl) => {
          await memo;
          const payloadPrices = {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            pricelistId: selectedPricelistId.value,
          };
          let qty = 1;
          // product
          const product = extraServices.value.find((el) => el.id === bsl.productId);
          if (product) {
            const items: ServiceLineInterface[] = [];
            if (product?.perPerson) {
              if (bsl.isAdults && bsl.isChildren) {
                qty = reservation.adults + reservation.children;
                Object.assign(payloadPrices, { isAdults: true });
              } else if (bsl.isAdults) {
                qty = reservation.adults;
                Object.assign(payloadPrices, { isAdults: true });
              } else if (bsl.isChildren) {
                qty = reservation.children;
                Object.assign(payloadPrices, { isChildren: true });
              }
            } else {
              qty = 1;
            }
            if (product.perDay) {
              Object.assign(payloadPrices, {
                dateFrom: reservation.checkin,
                dateTo: reservation.checkout,
                boardServiceId: bsl.boardServiceId,
                boardServiceLineId: bsl.id,
              });
              ///
              await store.dispatch('prices/fetchPrices', payloadPrices);
              ///
              let dateStart;
              let dateEnd;
              if (product.consumedOn === 'before') {
                dateStart = new Date(reservation.checkin.getTime());
                dateEnd = new Date(reservation.checkout.getTime() - ONE_DAY_IN_MS);
              } else {
                dateStart = new Date(reservation.checkin.getTime() + ONE_DAY_IN_MS);
                dateEnd = new Date(reservation.checkout.getTime());
              }
              utilsDates.getDatesRange(dateStart, dateEnd).forEach((date) => {
                const priceUnit =
                  store.state.prices.prices.find((el) => el.date.getTime() === date.getTime())
                    ?.price ?? 0;
                items.push({
                  priceUnit,
                  date,
                  quantity: qty,
                  discount: 0,
                });
              });
            } else {
              Object.assign(payloadPrices, {
                dateFrom: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                dateTo: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              });
              await store.dispatch('prices/fetchPrices', payloadPrices);
              items.push({
                priceUnit:
                  store.state.prices.prices.find(
                    (el) =>
                      el.date.getTime() ===
                      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
                  )?.price ?? 0,
                date: today,
                quantity: qty,
                discount: 0,
              });
            }
            if (items.map((el) => el.quantity).every((el) => el > 0)) {
              reservation.extraServices.push({
                _uuid: uuidv4(),
                productId: product.id,
                name: product.name,
                perPerson: product.perPerson,
                items,
                isBoardService: true,
                boardServiceLineId: bsl.id,
              });
            }
            reservation.boardServicePrice = reservation.extraServices
              .filter((el) => el.isBoardService)
              .reduce(
                (acc, val) => acc + val.items.reduce((acc2, val2) => acc2 + val2.priceUnit, 0),
                0
              );
          }
        }, undefined as unknown);
        reservation.boardServiceId = value.boardServiceId;
      }
    };

    const adjustAvailableRoomIdsAndPrices = async (roomTypeId: number, reservationId: number) => {
      // reservation
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === roomTypeId)
        ?.reservations.find((el) => el.id === reservationId);

      if (reservation) {
        let availFromApi: number[] = [];

        // obtenemos la dispo para las fechas de la reserva que estamos procesando
        const resp = (await store.dispatch('rooms/fetchRoomsByAvailability', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          availabilityFrom: reservation.checkin,
          availabilityTo: reservation.checkout,
        })) as AxiosResponse<RoomInterface[]>;

        // filtramos las de la clase de la reserva seleccionada
        availFromApi = resp.data
          .filter((el) => el.roomTypeClassId === reservation.roomTypeClassId)
          .map((el) => el.id);

        const lastNight = new Date(reservation.checkout);
        lastNight.setDate(lastNight.getDate() - 1);

        // obtenemos la disponibilidad por día del room type de la reserva que estamos procesando
        await store.dispatch('availability/fetchAvailability', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          from: reservation.checkin,
          to: lastNight,
          roomTypeId: reservation.roomTypeId,
        });

        // flag to check if there's splitted avbailability when no room type's room avail
        reservation.isSplittedAvailability = store.state.availability.availability.every(
          (el) => el.roomIds.length >= 1
        );

        // calculamos las reservas solapadas con la que estamos procesando
        const overlappingReservations = reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter(
            (el) =>
              el.id !== reservation.id &&
              reservation.checkin.getTime() < el.checkout.getTime() &&
              reservation.checkout.getTime() > el.checkin.getTime()
          );

        // establecemos la dispo del api que no coincida con las hab. de reservas solapadas
        reservation.availRoomIds = availFromApi.filter(
          (el) => !overlappingReservations.map((or) => or.roomId).includes(el)
        );

        // si la habitación seleccionada no está disponible la borramos
        if (!reservation.availRoomIds.includes(reservation.roomId)) {
          reservation.roomId = 0;
        }

        // en las reservas que solapan actualizamos las habitaciones disponibles quitando
        // la habitación de la reserva que estamos procesando -- OK
        overlappingReservations.forEach((ov) => {
          const indexCurrentRoomId = ov.availRoomIds.findIndex((el) => el === reservation.roomId);
          if (indexCurrentRoomId !== -1 && ov.id) {
            ov.availRoomIds.splice(indexCurrentRoomId, 1);
          }
        });

        // ajustamos el precio de la reserva
        if (selectedPricelistId.value !== 0) {
          await store.dispatch('prices/fetchPrices', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            pricelistId: selectedPricelistId.value,
            roomTypeId: reservation.roomTypeId,
            dateFrom: reservation.checkin,
            dateTo: reservation.checkout,
          });
        }
        let roomPrice = 0;
        utilsDates
          .getDatesRange(
            new Date(reservation.checkin.getTime()),
            new Date(reservation.checkout.getTime() - ONE_DAY_IN_MS)
          )
          .forEach((date) => {
            roomPrice +=
              store.state.prices.prices.find((el) => el.date.getTime() === date.getTime())?.price ??
              99;
          });
        reservation.roomPrice = roomPrice;

        // ajustamos el precio de los servicios extra (sin incluir los board services)
        // obtenemos los productos que son servicios extra y no son board services
        const extraServiceProducts = reservation.extraServices
          .filter((el) => !el.isBoardService)
          .map((el) => ({
            productId: el.productId,
            boardServiceId: el.boardServiceLineId,
          }));

        reservation.extraServices = [];
        await Promise.all(
          extraServiceProducts.map(async (p) => {
            await addReservationExtraService({
              roomTypeId: reservation.roomTypeId,
              reservationId: reservation.id,
              productId: p.productId,
            });
          })
        );

        // seteamos el board service de nuevo
        await addReservationBoardServiceLinesAndItems({
          roomTypeId: reservation.roomTypeId,
          reservationId: reservation.id,
          boardServiceId: reservation.boardServiceId,
        });

        // iteramos asíncronamente las reservas que no se solapan con
        // la reserva que estamos procesando
        await reservationsByRoomTypeToCreate.value
          .map((el) => el.reservations)
          .reduce((acc, val) => acc.concat(val), [])
          .filter(
            (el) =>
              !overlappingReservations.map((or) => or.id).includes(el.id) &&
              el.id !== reservation.id &&
              el.roomTypeClassId === reservation.roomTypeClassId
          )
          .reduce(async (acc, outter) => {
            await acc;
            // obtenemos la dispo para cada una
            const res = (await store.dispatch('rooms/fetchRoomsByAvailability', {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              availabilityFrom: outter.checkin,
              availabilityTo: outter.checkout,
            })) as AxiosResponse<RoomInterface[]>;

            outter.availRoomIds = res.data
              .filter((el) => el.roomTypeClassId === reservation.roomTypeClassId)
              .map((el) => el.id);
            const occupiedRooms: number[] = [];

            // iteramos en un 2º nivel las que no se solapan
            reservationsByRoomTypeToCreate.value
              .map((el) => el.reservations)
              .reduce((acc2, val) => acc2.concat(val), [])
              .filter(
                (el) =>
                  !overlappingReservations.map((or) => or.id).includes(el.id) &&
                  el.id !== reservation.id &&
                  el.id !== outter.id &&
                  el.roomTypeClassId === reservation.roomTypeClassId
              )
              .forEach((inner) => {
                // si la de fuera solapa con la de dentro se guarda en
                // la lista de ocupadas su roomId
                if (
                  utilsDates.datesOverlaps(
                    outter.checkin,
                    outter.checkout,
                    inner.checkin,
                    inner.checkout
                  )
                ) {
                  occupiedRooms.push(inner.roomId);
                }
              });

            outter.availRoomIds = outter.availRoomIds.filter((el) => !occupiedRooms.includes(el));
          }, undefined as unknown);
      }
    };

    const updateReservationRangeDates = async (value: {
      roomTypeId: number;
      reservationId: number;
      checkin: Date;
      checkout: Date;
    }) => {
      const reservation = reservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        reservation.checkin = new Date(value.checkin);
        reservation.checkout = new Date(value.checkout);
        void store.dispatch('layout/showSpinner', true);
        await adjustAvailableRoomIdsAndPrices(reservation.roomTypeId, reservation.id);
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const getDocumentType = () => {
      let documentType = '';
      if (currentPartner.value?.vatDocumentType === '02' && currentPartner.value?.nationality) {
        if (!currentPartner.value?.isAgency && !currentPartner.value?.isCompany) {
          const nameCountry = store.state.countries.countries.find(
            (el) => el.id === currentPartner.value?.nationality
          )?.name;
          if (nameCountry === 'Spain' || nameCountry === 'España') {
            documentType = 'NIF / Documento Identidad';
          } else {
            documentType = 'Documento Nacional Oficial';
          }
        }
      } else if (currentPartner.value?.vatDocumentType === '03') {
        documentType = 'Pasaporte';
      } else if (currentPartner.value?.vatDocumentType === '05') {
        documentType = 'Certificado de Residencia';
      } else if (currentPartner.value?.vatDocumentType === '06') {
        documentType = 'Otro Documento';
      } else if (
        currentPartner.value?.vatNumber &&
        (currentPartner.value?.isAgency || currentPartner.value?.isCompany)
      ) {
        documentType = 'CIF';
      }
      return documentType;
    };

    const boardServiceName = (boardServiceId: number) =>
      store.state.boardServices.boardServices.find((el) => el.id === boardServiceId)?.name;

    const roomShortName = (roomId: number) =>
      store.state.rooms.rooms.find((el) => el.id === roomId)?.shortName;

    const openContactDetail = async (): Promise<void> => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContactSchema();
        const contactId = currentPartner.value?.id ?? 0;
        const contact = await contactsStore.fetchContactById(contactId);
        if (contact) {
          contact.id = contactId;
          openDialog(ContactDetail, {
            props: { header: contact.name || t('contacts.detail') },
            data: { contact },
            onClose: async ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
              if (data?.refresh === true || data?.action === 'saved') {
                await store.dispatch('partners/fetchCurrentPartner', contactId);
              }
            },
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('Contact not found for id:', contactId);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    };

    const openNewContact = async (): Promise<void> => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContactSchema();
        openDialog(ContactDetail, {
          props: { header: t('contacts.new') },
          data: { props: { contact: null } },
          onClose: async ({ data }: { data?: { refresh?: boolean; action?: string, contactId?: number } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              const newContactId = data?.contactId;
              if (newContactId) {
                await store.dispatch('partners/fetchCurrentPartner', newContactId);
              }
            }
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    }

    const updateCustomerSearchBox = async (name: string) => {
      partnerName.value = name;
      await store.dispatch('partners/removePartners');
      if (name.length >= 5) {
        fetchPartners({
          limit: 20,
          offset: 0,
          multiFieldSearch: name,
        });
      }
      if (showEmptyPartnerName.value) {
        showEmptyPartnerName.value = false;
      }
      if (showEmptyPhoneMail.value) {
        showEmptyPhoneMail.value = false;
      }
    };

    const partnerCountryName = (countryId: number) => {
      let rdo = '';
      const country = store.state.countries.countries.find((el) => el.id === countryId);
      if (country) {
        rdo = country.name;
      }
      return rdo;
    };

    const saveBatchChanges = (value: { modifiedReservations: ReservationsToCreateInterface[] }) => {
      value.modifiedReservations.forEach((el) => {
        const res = reservationsByRoomTypeToCreate.value
          .filter((rt) => rt.roomTypeId === el.roomTypeId)
          .map((rt) => rt.reservations)
          .reduce((a, b) => a.concat(b), [])
          .find((r) => r.id === el.id);
        if (res) {
          setReservationAdults({
            roomTypeId: el.roomTypeId,
            reservationId: el.id,
            adults: el.adults,
          });
          setReservationChildren({
            roomTypeId: el.roomTypeId,
            reservationId: el.id,
            children: el.children,
          });
          res.checkin = el.checkin;
          res.checkout = el.checkout;
          const reservation = reservationsByRoomTypeToCreate.value
            .find((r) => r.roomTypeId === el.roomTypeId)
            ?.reservations.find((r) => r.id === el.id);
          if (reservation) {
            reservation.boardServiceId = el.boardServiceId;
            reservation.reservationLines = el.reservationLines;
          }
          res.boardServiceId = el.boardServiceId;
          res.extraServices = el.extraServices;
        }
      });
    };

    const openBatchChanges = () => {
      dialogService.open({
        header: 'CAMBIOS EN LOTE',
        content: markRaw(FolioBatchChanges),
        props: {
          folio: currentFolio.value,
          fromBookingEngine: true,
          reservations: reservationsMappedForBatchChanges,
        },
        onAccept: (result?: unknown) =>
          saveBatchChanges(result as { modifiedReservations: ReservationsToCreateInterface[] }),
      });
    };

    const removePartner = () => {
      selectedPartnerId.value = 0;
      partnerName.value = '';
      partnerPhone.value = '';
      partnerEmail.value = '';
    };

    const backToLastReservationView = () => {
      if (!store.state.reservations.currentReservation) {
        void store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
      } else {
        void store.dispatch('layout/changeRightDrawerContent', 'ReservationDetail');
      }
    };

    const toggleOldRoomType = (roomTypeId: number) => {
      const roomType = oldReservationsByRoomTypeToCreate.value.find(
        (el) => el.roomTypeId === roomTypeId
      );
      if (roomType) {
        roomType.expanded = !roomType.expanded;
      }
      oldReservationsByRoomTypeToCreate.value
        .filter((el) => el.roomTypeId !== roomTypeId)
        .forEach((el) => {
          el.expanded = false;
          el.reservations.forEach((res) => {
            res.expanded = false;
          });
        });
      reservationsByRoomTypeToCreate.value.forEach((el) => {
        el.expanded = false;
        el.reservations.forEach((res) => {
          res.expanded = false;
        });
      });
    };

    const toggleOldReservation = (value: { roomTypeId: number; reservationId: number }) => {
      const reservation = oldReservationsByRoomTypeToCreate.value
        .find((el) => el.roomTypeId === value.roomTypeId)
        ?.reservations.find((el) => el.id === value.reservationId);
      if (reservation) {
        reservation.expanded = !reservation.expanded;
      }
      oldReservationsByRoomTypeToCreate.value.forEach((el) => {
        el.reservations
          .filter((r) => r.id !== value.reservationId)
          .forEach((r) => {
            r.expanded = false;
          });
      });
    };

    const saveFolio = async (preconfirm: boolean) => {
      let send: FolioApiInterface;
      if (selectedReservationType.value !== 'out') {
        send = {
          reservations: [],
          pmsPropertyId: store.state.properties?.activeProperty?.id ?? 0,
          reservationType:
            selectedReservationType.value === 'group' ? 'normal' : selectedReservationType.value,
          pricelistId: selectedPricelistId.value,
          saleChannelId: selectedSaleChannelId.value,
          preconfirm,
          internalComment: internalComment.value,
          sendConfirmationMail: isConfirmationMailWillBeSent.value,
          invoiceStatus: 'to_invoice',
          language: languageSelected.value,
        };
        if (selectedAgencyId.value) {
          send.agencyId = selectedAgencyId.value;
          send.externalReference = externalReference.value;
        }
        if (selectedPartnerId.value) {
          send.partnerId =
            selectedPartnerId.value > 0 ? selectedPartnerId.value : currentPartner.value?.id;
        } else if (currentPartner.value && !selectedPartnerId.value) {
          send.partnerId = currentPartner.value?.id;
        } else if (partnerName.value) {
          if (partnerPhone.value) {
            send.partnerName = partnerName.value;
            send.partnerPhone = partnerPhone.value;
          }
          if (partnerEmail.value) {
            send.partnerName = partnerName.value;
            send.partnerEmail = partnerEmail.value;
          }
          if (!partnerEmail.value && !partnerPhone.value) {
            showEmptyPhoneMail.value = true;
            if (showEmptyPartnerName.value) {
              showEmptyPartnerName.value = false;
            }
            return;
          }
        } else {
          showEmptyPartnerName.value = true;
          if (showEmptyPhoneMail.value) {
            showEmptyPhoneMail.value = false;
          }
          return;
        }
      } else {
        send = {
          reservations: [],
          pmsPropertyId: store.state.properties?.activeProperty?.id ?? 0,
          reservationType: 'out',
          closureReasonId: selectedRoomClosureReasonId.value,
          outOfServiceDescription: roomClosureReasonDescription.value,
          preconfirm,
          internalComment: internalComment.value,
          language: languageSelected.value,
        };
      }
      reservationsByRoomTypeToCreate.value.forEach((el) => {
        const reservations = [];
        el.reservations.forEach((r) => {
          reservations.push({
            r,
          });
          const services = [] as ServiceInterface[];
          r.extraServices.forEach((s) => {
            const val = {
              productId: s.productId,
              isBoardService: s.isBoardService,
              boardServiceLineId: s.boardServiceLineId,
              serviceLines: s.items,
            } as ServiceInterface;
            services.push(val);
          });
          if (selectedReservationType.value !== 'out') {
            send.reservations.push({
              id: r.id,
              roomTypeId: r.roomTypeId,
              adults: r.adults,
              preferredRoomId: r.autoAssignRoom ? 0 : r.roomId,
              children: r.children,
              boardServiceId: r.boardServiceId,
              checkin: `${r.checkin.getFullYear()}-${(r.checkin.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkin.getDate().toString().padStart(2, '0')}`,
              checkout: `${r.checkout.getFullYear()}-${(r.checkout.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkout.getDate().toString().padStart(2, '0')}`,
              services,
              reservationType: selectedReservationType.value,
              isSplitted: false,
            });
          } else {
            send.reservations.push({
              id: r.id,
              roomTypeId: r.roomTypeId,
              preferredRoomId: r.autoAssignRoom ? 0 : r.roomId,
              checkin: `${r.checkin.getFullYear()}-${(r.checkin.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkin.getDate().toString().padStart(2, '0')}`,
              checkout: `${r.checkout.getFullYear()}-${(r.checkout.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkout.getDate().toString().padStart(2, '0')}`,
              reservationType: selectedReservationType.value,
              isSplitted: false,
            });
          }
        });
      });
      void store.dispatch('layout/showSpinner', true);
      const { data } = (await store.dispatch('folios/createFolio', send)) as AxiosResponse<number>;
      await store.dispatch('folios/fetchFolio', data);
      await store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
      await refreshPlanning();

      void store.dispatch('layout/showSpinner', false);
    };

    const updateFolio = async () => {
      const send: FolioApiInterface = {
        pmsPropertyId: activeProperty.value?.id ?? 0,
        reservations: [] as ReservationApiInterface[],
        id: currentFolio.value?.id,
        pricelistId: selectedPricelistId.value,
        reservationType: selectedReservationType.value,
      };
      reservationsByRoomTypeToCreate.value.forEach((el) => {
        const reservations = [];
        el.reservations.forEach((r) => {
          reservations.push({
            r,
          });
          const services = [] as ServiceInterface[];
          r.extraServices.forEach((s) => {
            const val = {
              productId: s.productId,
              isBoardService: false,
              serviceLines: s.items,
            } as ServiceInterface;
            services.push(val);
          });
          if (selectedReservationType.value !== 'out') {
            send.reservations.push({
              id: r.id,
              roomTypeId: r.roomTypeId,
              adults: r.adults,
              preferredRoomId: r.roomId,
              children: r.children,
              boardServiceId: r.boardServiceId,
              checkin: `${r.checkin.getFullYear()}-${(r.checkin.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkin.getDate().toString().padStart(2, '0')}`,
              checkout: `${r.checkout.getFullYear()}-${(r.checkout.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkout.getDate().toString().padStart(2, '0')}`,
              services,
              reservationType: selectedReservationType.value,
              isSplitted: false,
            });
          } else {
            send.reservations.push({
              id: r.id,
              roomTypeId: r.roomTypeId,
              preferredRoomId: r.roomId,
              checkin: `${r.checkin.getFullYear()}-${(r.checkin.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkin.getDate().toString().padStart(2, '0')}`,
              checkout: `${r.checkout.getFullYear()}-${(r.checkout.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${r.checkout.getDate().toString().padStart(2, '0')}`,
              reservationType: selectedReservationType.value,
              isSplitted: false,
            });
          }
        });
      });
      void store.dispatch('layout/showSpinner', true);
      (await store.dispatch('folios/addReservationsToFolio', send)) as AxiosResponse<number>;
      await store.dispatch('folios/fetchFolio', currentFolio.value?.id);
      await store.dispatch('reservations/setCurrentReservation', null);
      await store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
      await refreshPlanning();
      void store.dispatch('layout/showSpinner', false);
    };

    const closeBookingEngine = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
    };

    watch(partners, () => {
      itemsAutocompleteCustomer.value = partners.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
    });

    watch(rightDrawerExpanded, () => {
      oldReservationsByRoomTypeToCreate.value = [];
      reservationsByRoomTypeToCreate.value = [];
    });

    watch(selectedPartnerId, () => {
      selectedPartner.value =
        partners.value.find((el) => el.id === selectedPartnerId.value) ?? null;
      void store.dispatch('partners/setCurrentPartner', selectedPartner.value);
    });

    watch(currentPartner, () => {
      if (currentPartner?.value) {
        selectedPartner.value = currentPartner.value;
      }
    });

    watch([checkin, checkout, selectedPricelistId, selectedReservationType], async () => {
      prices.value = [];
      reservationsByRoomTypeToCreate.value = [];
      if (
        checkin.value &&
        checkout.value &&
        ((selectedPricelistId.value !== 0 &&
          (selectedReservationType.value === 'normal' ||
            selectedReservationType.value === 'group')) ||
          ((selectedReservationType.value === 'out' || selectedReservationType.value === 'staff') &&
            selectedPricelistId.value === 0))
      ) {
        void store.dispatch('layout/showSpinner', true);
        loadingPrices.value = true;
        await buildAvailabilityRoomTypes();
        if (selectedPricelistId.value !== 0) {
          await roomTypes.value.reduce(async (acc, rt) => {
            await acc;
            await store.dispatch('prices/fetchPrices', {
              pmsPropertyId: store.state.properties.activeProperty?.id,
              pricelistId: selectedPricelistId.value,
              roomTypeId: rt.id,
              dateFrom: checkin.value,
              dateTo: checkout.value,
            });
            prices.value.push({
              roomTypeId: rt.id,
              prices: store.state.prices.prices,
            });
          }, undefined as unknown);
          const selectedPricelist = store.state.pricelists.pricelists.find(
            (el) => el.id === selectedPricelistId.value
          );
          const availabilityPlan = store.state.availabilityPlans.availabilityPlans.find(
            (el) => el.id === selectedPricelist?.defaultAvailabilityPlanId
          );
          if (availabilityPlan && availabilityPlan.name) {
            availabilityPlanName.value = availabilityPlan.name;
          }
        }
        void store.dispatch('layout/showSpinner', false);
        loadingPrices.value = false;
      }
    });

    watch(selectedSaleChannelId, async () => {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('pricelists/fetchPricelists', {
        pmsPropertyId: store.state.properties.activeProperty?.id,
        saleChannelId: selectedSaleChannelId.value,
      });
      if (!currentFolio.value) {
        if (selectedPricelistId.value !== 0) {
          selectedPricelistId.value = 0;
        }
        if (selectedAgencyId.value !== 0) {
          selectedAgencyId.value = 0;
        }
      }

      void store.dispatch('layout/showSpinner', false);
    });

    onMounted(async () => {
      void store.dispatch('partners/removePartner');
      void store.dispatch('layout/showSpinner', true);
      await Promise.all([
        store.dispatch('pricelists/fetchPricelists', { pmsPropertyId: activeProperty.value?.id }),
        store.dispatch('roomClosureReasons/fetchRoomClosureReasons'),
        store.dispatch('languages/fetchLanguages'),
      ]);

      if (activeProperty.value?.language) {
        languageSelected.value = activeProperty.value.language;
      }
      if (currentFolio.value) {
        await store.dispatch('folios/fetchFolio', currentFolio.value.id);
        if (currentFolio.value.reservationType === 'normal') {
          selectedSaleChannelId.value = currentFolio.value?.saleChannelId ?? 0;
          selectedPricelistId.value = currentFolio.value.pricelistId ?? 0;
          selectedAgencyId.value = currentFolio.value.agencyId ?? 0;
          externalReference.value = currentFolio.value.externalReference ?? '';
        } else if (currentFolio.value.reservationType === 'out') {
          selectedReservationType.value = 'out';
          selectedRoomClosureReasonId.value = currentFolio.value.closureReasonId ?? 0;
          if (currentFolio.value?.outOfServiceDescription) {
            roomClosureReasonDescription.value = currentFolio.value.outOfServiceDescription;
          }
        } else if (currentFolio.value.reservationType === 'staff') {
          selectedReservationType.value = 'staff';
        }

        const checkins =
          store.state.reservations.reservations?.map((el) => (el.checkin as Date).getTime()) ?? [];
        const minCheckins = Math.min.apply(null, checkins);

        const checkouts =
          store.state.reservations.reservations?.map((el) => (el.checkout as Date).getTime()) ?? [];
        const maxCheckouts = Math.max.apply(null, checkouts);

        dates.value = [new Date(minCheckins), new Date(maxCheckouts)];
      }

      void store.dispatch('layout/showSpinner', false);
    });

    return {
      step,
      selectedReservationType,
      selectedSaleChannelId,
      selectedPricelistId,
      selectedAgencyId,
      externalReference,
      selectedRoomClosureReasonId,
      roomClosureReasonDescription,
      dates,
      roomTypeSelector,
      globalAvailableRooms,
      reservationsByRoomTypeToCreate,
      oldReservationsByRoomTypeToCreate,
      isGroupedReservations,
      isOpenMenu,
      selectedPartner,
      selectedPartnerId,
      languageSelected,
      itemsAutocompleteCustomer,
      currentFolio,
      currentReservations,
      saleChannels,
      agencies,
      roomClosureReasons,
      languages,
      partnerName,
      partnerEmail,
      partnerPhone,
      showEmptyPhoneMail,
      showEmptyPartnerName,
      pricelists,
      selectedSaleChannel,
      checkin,
      checkout,
      numDays,
      notAvailableRoomIds,
      folioTotalPrice,
      notAllowedNextStep,
      minAllCheckins,
      maxAllCheckouts,
      allReservationsSameCheckinAndCheckout,
      reservationNodesTreeView,
      internalComment,
      isConfirmationMailWillBeSent,
      reservationsMappedForBatchChanges,
      removePartner,
      partnerCountryName,
      getDocumentType,
      updateCustomerSearchBox,
      changeReservationType,
      removeReservation,
      addReservation,
      addReservationExtraService,
      roomTypeName,
      addOrRemoveMultipleReservations,
      toggleRoomType,
      toggleReservation,
      setReservationAdults,
      setReservationChildren,
      removeReservationExtraService,
      setReservationRoomId,
      addReservationBoardServiceLinesAndItems,
      updateReservationRangeDates,
      toggleOldRoomType,
      toggleOldReservation,
      saveFolio,
      updateFolio,
      openContactDetail,
      openNewContact,
      openBatchChanges,
      saveBatchChanges,
      backToLastReservationView,
      availabilityPlanName,
      showAvailabilityPlan,
      isRoomTypeAvailabilityLimited,
      freeRoomsByType,
      closeBookingEngine,
    };
  },
});
</script>

<style lang="scss" scoped>
.booking-engine {
  height: 100%;
  width: 100%;
  padding: 0.5rem 0.25rem 0 0.5rem;
  display: flex;
  flex-direction: column;
  min-width: 370px;
  .header {
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    font-weight: bold;
    padding-right: 0.75rem;
    padding-top: 0.5rem;
    .first {
      display: flex;
      .left,
      .right {
        display: flex;
        flex-direction: column;
      }
      .left {
        font-weight: bold;
        .title-container {
          display: flex;
          align-items: center;
          .icon-arrow-back {
            cursor: pointer;
            margin-right: 0.5rem;
          }
          .dummy {
            width: 22px;
            height: 22px;
            margin-right: 0.5rem;
          }
          .title {
            font-size: 16px;
          }
        }
        .folio {
          display: flex;
          margin-left: 0.5rem;
          .icon-arrow-back {
            margin-right: 0.5rem;
          }
        }
      }
      .right {
        margin-left: auto;
        .prices,
        .rooms {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .prices {
          .old-price,
          .new-price {
            border-radius: 15px;
            font-size: 0.9rem;
            padding: 0 0.3rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .old-price {
            color: grey;
            border: 1px solid grey;
          }
          .new-price {
            color: $primary;
            border: 1px solid $primary;
          }
          .icon-arrow-back {
            margin: 0 0.5rem;
          }
        }
        .rooms {
          .old-rooms {
            color: grey;
            font-size: 0.9rem;
          }
          .new-rooms {
            color: $primary;
            font-size: 0.9rem;
          }
        }
      }
    }
    .second {
      font-size: 1rem;
      margin-left: 0.5rem;
    }
  }
  .content {
    padding: 2px;
    flex: 1;
    overflow-y: scroll;
    margin-bottom: 0.5rem;
    .section-card {
      margin-right: 0.25rem;
      box-shadow: 0 1px 5px rgb(0 0 0 / 30%), 0 2px 2px rgb(0 0 0 / 14%),
        0 3px 1px -2px rgb(0 0 0 / 12%);

      background-color: white;
      border-radius: 5px;
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
      .title-section-card {
        padding: 0.5rem 1rem 0.5rem 1rem;
        background: $secondary;
        border-radius: 5px 5px 0 0;
        font-weight: bold;
        .edit {
          cursor: pointer;
          color: $primary;
        }
      }
      .content-section-card {
        padding: 1rem;
        hr {
          border-top: 1px solid lightgrey;
        }
        .reservation-type {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          font-size: 0.9rem;
          .option {
            border: 1px solid black;
            padding: 0.2rem 1rem 0.2rem 1rem;
            border-radius: 15px;
            margin-bottom: 0.5rem;
            text-align: center;
            &.selected {
              border: 1px solid $primary;
              background-color: $primary;
              color: white;
              font-weight: bold;
            }
            &:hover:not(.selected) {
              cursor: pointer;
              background-color: $corduroy;
              color: white;
              font-weight: bold;
            }
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        .sale-info,
        .out-of-service-info {
          display: flex;
          flex-direction: column;
          .item {
            display: flex;
            flex-direction: column;
            margin-bottom: 0.5rem;
            .select,
            .input {
              height: 30px;
            }
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        .dates {
          display: flex;
          align-items: center;
          .datepicker {
            margin-left: 1rem;
            width: 220px;
          }
        }
        .text-dates {
          margin-top: 1rem;
          .font-bold {
            font-weight: bold;
          }
        }
        .room-type-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .left {
            .room-type-name {
              font-weight: bold;
              font-size: 15px;
            }
            .room-type-text {
              font-size: 1rem;
              color: gray;
              &.text-red {
                color: red;
              }
            }
          }
          .available-room-type-pill {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            background-color: #fbf0da;
            border-radius: 15px;
            padding: 0 0.5rem;
            margin-bottom: 0.5rem;
            .icon-alert {
              margin-right: 1rem;
              margin-bottom: 1px;
            }
            .available-room-type {
              font-size: 12px;
              color: #73510d;
            }
          }
          .right {
            .number-selector {
              font-weight: bold;
              justify-content: space-around;
              display: flex;
              align-items: center;
              .current-value {
                input {
                  width: 30px;
                  text-align: center;
                  border: none;
                  margin-left: 0.25rem;
                  margin-right: 0.25rem;
                }
              }
              .icon-wrapper {
                .btn {
                  width: 22px !important;
                  height: 22px !important;
                  &.disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }
                  &.no-avail {
                    background-color: red !important;
                  }
                }
              }
            }
          }
        }
        .resume-dates {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .date-checkin,
          .date-checkout {
            border-radius: 25px;
            border: 1px solid $corduroy;
            padding: 0.1rem 2rem 0.1rem 2rem;
          }
        }
        .resume-stay {
          margin-top: 0.5rem;
          .font-bold {
            font-weight: bold;
          }
          p {
            margin: 1rem 0;
          }
          .tree {
            padding: 0 !important;
          }
        }
        .partner-data {
          display: flex;
          flex-direction: column;
          .partner-row {
            display: flex;
            flex-direction: column;
            .partner-field {
              margin-top: 1rem;
              display: flex;
              flex-direction: column;
              .label {
                font-weight: bold;
              }
              .partner-input {
                height: 40px;
              }
              .toggle-wrapper {
                display: flex;
                align-items: center;
                .toggle {
                  margin-right: 0.5rem;
                }
                span {
                  cursor: pointer;
                  user-select: none;
                }
              }
            }
          }
          .existing-partner-data {
            display: flex;
            flex-direction: column;
            .partner-data-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid lightgray;
              position: relative;
              .label {
                margin-right: 1rem;
              }
              input {
                text-align: right;
              }
              .input-discount {
                padding-right: 20px;
                width: 60px;
              }

              .discount {
                position: absolute;
                right: 5px;
              }
              input[type='email'] {
                width: 250px;
              }
              input,
              select {
                width: 150px;
                height: 25px;
              }
            }
          }
        }
        .availability-plan {
          display: flex;
          background-color: #fbf0da;
          align-items: center;
          width: 100%;
          border-radius: 8px;
          margin-bottom: 1rem;
          .icon-alert {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .availability-plan-text {
            display: flex;
            flex-direction: column;
            color: #73510d;
            padding: 0.75rem 0;
            font-size: 12px;
            .availability-plan-title {
              font-weight: bold;
            }
          }
        }
        .internal-comments {
          margin-top: 1rem;
          box-shadow: 0px 1px 5px 0px #0000007d;
          border-radius: 10px;
          .internal-comments-header {
            background-color: #ffb9006b;
            border-radius: 10px 10px 0 0;
            height: 35px;
            display: flex;
            align-items: center;
            font-weight: bold;
            .left {
              margin-left: 1rem;
              display: flex;
              align-items: center;
              .pin-icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                .pin-icon {
                  margin-right: 1rem;
                  height: 16px;
                  width: 16px;
                }
              }
            }
          }
          .internal-comments-content {
            display: flex;
            align-items: center;
            width: 100%;
            border-radius: 0 0 10px 10px;
            .internal-comment {
              width: 100%;
              height: 100%;
              resize: none;
              border: none;
              min-height: 120px;
              border-radius: 0 0 10px 10px;
              outline: none;
              margin: 0.5rem 1rem;
            }
          }
        }
      }
    }
    .grouped-control {
      user-select: none;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-right: 0.25rem;
      .left {
        font-weight: bold;
      }
      .right {
        display: flex;
        align-items: center;
        .btn-switch-view {
          display: flex;
          align-items: center;
          border-radius: 10px;
          font-size: 0.85rem;
          height: 100%;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          background-color: grey;
          color: white;
          cursor: pointer;
          .btn-text {
            font-size: 0.85rem;
          }
          .icon {
            margin-right: 0.25rem;
          }
        }
        .three-dots {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          .menu {
            user-select: none;
            position: absolute;
            display: flex;
            flex-direction: column;
            background-color: #ffffff;
            color: black;
            font-size: 14px;
            box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
            border-radius: 10px;
            cursor: pointer;
            padding: 0.2rem 0;
            left: -160px;
            div {
              padding: 0.3rem 1rem;
              &:hover {
                font-weight: bold;
              }
            }
          }
        }
      }
    }
    .grouped-reservations {
      margin-right: 0.25rem;
    }
    .reservation-cards-container {
      margin-bottom: 1rem;
    }
    .buttons-container {
      margin-right: 0.25rem;

      .btn {
        width: 100%;
        border: none;
        &.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        &.btn-draft {
          margin-top: 0.5rem;
          background-color: white;
          border: 1px solid grey;
        }
      }
    }
  }
}
@media (min-width: 1024px) {
  .booking-engine {
    padding-left: 2rem;
    padding: 1rem 0.25rem 0.5rem 1.9rem;
    margin-right: 0.25rem;
    .header {
      padding-right: 0.5rem;
      .first {
        .left {
          .icon-arrow-back-mobile {
            display: none;
          }
          .title {
            font-size: 1.2rem !important;
          }
          .folio {
            .icon-arrow-back {
              margin-right: 1rem;
            }
          }
        }
        .right {
          .prices {
            .old-price,
            .new-price {
              font-size: 1.2rem !important;
            }
          }
          .rooms {
            .old-rooms,
            .new-rooms {
              font-size: 1rem;
            }
          }
        }
      }
    }
    .content {
      .section-card {
        .content-section-card {
          .reservation-type {
            flex-direction: row;
            .option {
              margin: 0;
            }
          }
          .sale-info {
            flex-direction: row;
            justify-content: space-between;
            .item {
              width: 50%;
              select,
              input {
                width: 100%;
              }
              &:last-child {
                margin-left: 0.5rem;
              }
            }
          }
          .partner-data {
            .partner-row {
              flex-direction: row;
              .partner-field {
                width: 100%;
                display: flex;
                justify-content: stretch;
                &:nth-child(2) {
                  margin-left: 1rem;
                }
                .label,
                .value {
                  flex: 1;
                }
              }
            }
          }
          .availability-plan-text {
            font-size: 14px !important;
          }
          .room-type-option {
            .left-wrapper {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              .available-room-type-pill {
                margin-bottom: 0 !important;
                margin-top: 0 !important;
                width: 150px;
                margin-right: 1rem;
                height: 22px;
                .icon-warning {
                  margin-left: 0.5rem;
                }
                .available-room-type {
                  font-size: 13px !important;
                  margin: 0 auto;
                }
              }
            }
          }
        }
      }
      .buttons-container {
        display: flex;
        justify-content: center;
        .btn {
          width: auto;
          &.btn-draft {
            margin-top: 0;
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
