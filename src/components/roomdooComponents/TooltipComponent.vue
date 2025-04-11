<template>
  <div class="tooltip-container" @mouseover="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>
    <div
      v-if="visible"
      :class="['tooltip', position]"
      :style="{ backgroundColor }"
      ref="tooltipRef"
    >
      {{ content }}
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';

export default defineComponent({
  props: {
    content: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: 'top',
      validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value),
    },
    backgroundColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.7)',
    },
  },
  setup() {
    const tooltipRef = ref(null);
    const visible = ref(false);

    const showTooltip = () => {
      visible.value = true;
    };

    const hideTooltip = () => {
      visible.value = false;
    };

    return {
      tooltipRef,
      visible,
      showTooltip,
      hideTooltip,
    };
  },
});
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: bold;
}

.tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.tooltip.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.tooltip.left {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.tooltip.right {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  margin-left: 8px;
}
</style>
