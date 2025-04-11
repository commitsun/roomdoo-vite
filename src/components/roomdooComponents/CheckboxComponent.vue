<template>
  <div
    class="toogle-item"
    @click.stop="toggleCheckbox()"
  >
    <input
      type="checkbox"
      v-model="isChecked"
      :checked="isChecked"
    >
  </div>
</template>
<script lang="ts">
import {
  defineComponent, onMounted, ref, watch,
} from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],

  setup(props, context) {
    const isChecked = ref(false);

    const toggleCheckbox = () => {
      isChecked.value = !isChecked.value;
      context.emit('update:modelValue', isChecked.value);
    };

    watch(() => props.modelValue, () => {
      isChecked.value = props.modelValue;
    });

    onMounted(() => {
      isChecked.value = props.modelValue;
    });

    return {
      isChecked,
      toggleCheckbox,
    };
  },
});

</script>
<style lang="scss" scoped>
  .toogle-item {
    cursor: pointer;
    height: 100%;
    width: 100%;
    input {
      height: 100%;
      width: 100%;
      -webkit-appearance: none;
      -moz-appearance: none;
      -o-appearance: none;
      appearance: none;
      border-radius: 4px;
      outline: none;
      transition-duration: 0.3s;
      background-color: #e2e2e2;
      accent-color: white;
      cursor: pointer;
      &:hover {
        background-color: #cfcfcf;
      }
    }

    input:checked {
      background-color: $primary;
      background-image: url('/app-images/check-mark.svg');
      background-position: center center;
      background-size: 80%;
      background-repeat: no-repeat;
    }
  }
</style>
