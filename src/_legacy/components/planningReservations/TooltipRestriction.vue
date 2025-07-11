<template>
  <div class="tooltip-box" @mouseenter="showRestriction()" @mouseleave="hideRestriction()">
    <div class="tooltip" v-show="restrictionDisplayed">
      <span class="text" v-if="minStay">
        Est. mínima de
        <span class="data">
          {{ minStay }}
        </span>
        noches
      </span>

      <span class="text" v-if="maxStay">
        Est. máxima de
        <span class="data">
          {{ maxStay }}
        </span>
        noches
      </span>

      <span class="text" v-if="minStayArrival">
        Est. mín. llegada de
        <span class="data">
          {{ minStayArrival }}
        </span>
        noches
      </span>

      <span class="text" v-if="maxStayArrival">
        Est. máx. llegada de
        <span class="data">
          {{ maxStayArrival }}
        </span>
        noches
      </span>

      <span class="text" v-if="closed"> Cerrada </span>

      <span class="text" v-if="closedDeparture"> Cerrada como día de salida </span>

      <span class="text" v-if="closedArrival"> Cerrada como día de entrada </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    minStay: Number,
    maxStay: Number,
    minStayArrival: Number,
    maxStayArrival: Number,
    closed: Boolean,
    closedDeparture: Boolean,
    closedArrival: Boolean,
  },
  setup() {
    const restrictionDisplayed = ref(false);
    const showRestriction = () => {
      restrictionDisplayed.value = true;
    };
    const hideRestriction = () => {
      restrictionDisplayed.value = false;
    };
    return {
      restrictionDisplayed,
      showRestriction,
      hideRestriction,
    };
  },
});
</script>

<style scoped lang="scss">
.tooltip-box {
  background-color: $secondary;
  padding-top: 4px;
  height: 40px;
  font-size: 12px;
  .tooltip {
    border: 2px solid $primary;
    border-radius: 8px;
    color: $primary;
    padding: 5px 5px 5px 9px;
    width: auto;
    left: 50%;
    margin-left: -60px;
    transition: opacity 0.5s;
    position: relative;
    background: #ffffff;
    z-index: 6;
    font-weight: bold;
    .data {
      font-weight: normal;
      color: black;
    }
    .text {
      display: block;
    }
  }
}
</style>
