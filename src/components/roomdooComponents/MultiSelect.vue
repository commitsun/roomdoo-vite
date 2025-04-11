<template>
  <div class="container">
    <div class="title">
      {{ title }}
    </div>
    <div class="options-group">
      <div
        v-for="option in optionValues"
        :key="option.id"
        class="option"
        @click="updateControlValue(option.id, selected.includes(option.id))"
      >
        <input
          type="checkbox"
          :name="option.name"
          :checked="option.selected"
          />
        <label
          :for="option.name"
        >
          {{ option.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, watch,
} from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Array as ()=> number[],
      required: true,
    },
    options: {
      type: Array as () => {id: number; name: string}[],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const selected = ref([...props.modelValue] as number[]);
    const optionValues = computed(() => {
      const rdo: {id: number, name: string, selected:boolean }[] = [];
      props.options.forEach((option) => {
        rdo.push(
          { id: option.id, name: option.name, selected: props.modelValue.includes(option.id) },
        );
      });
      return rdo;
    });

    const updateControlValue = (optionId: number, newValue: boolean) => {
      if (!newValue) {
        selected.value.push(optionId);
      } else {
        const index = selected.value.findIndex((el) => el === optionId);
        selected.value.splice(index, 1);
      }
      context.emit('update:modelValue', selected.value);
    };
    watch(() => props.modelValue, () => {
      selected.value = props.modelValue;
    });
    return {
      selected,
      updateControlValue,
      optionValues,
    };
  },
});
</script>

<style lang="scss" scoped>

  .container {
    padding: 1rem 0 1rem 1rem;
    font-size: 16px;
    .title {
      font-weight: bold;
    }
    .options-group {
      display: flex;
      flex-direction: column;
      align-items: baseline;
      height: 100%;
      padding: .5rem 0 .5rem 1rem;
      .option {
        display: flex;
        align-items: center;
        margin-bottom: .2rem;
        width: 100%;
        input {
          height: 20px;
          min-width: 20px;
          -webkit-appearance: none;
          -moz-appearance: none;
          -o-appearance: none;
          appearance: none;
          border-radius: 4px;
          outline: none;
          transition-duration: 0.3s;
          background-color: #e2e2e2;
          cursor: pointer;
          accent-color: white;
          pointer-events: none;
        }

        input:checked {
          background-color: $primary;
          background-image: url('/app-images/check-mark.svg');
          background-position: center center;
          background-size: 80%;
          background-repeat: no-repeat;
        }

        label {
          margin-left: .8rem;
          cursor: pointer;
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .container {
      padding: 1rem 0 1rem .5rem;
      font-size: 14px;
      .options-group {
        display: flex;
        flex-direction: column;
        align-items: baseline;
        height: 100%;
        padding: .5rem 0 .5rem .5rem;
        .option {
          display: flex;
          align-items: center;
          margin-bottom: .2rem;
          width: 100%;
          input {
            height: 20px;
            min-width: 20px;
            -webkit-appearance: none;
            -moz-appearance: none;
            -o-appearance: none;
            appearance: none;
            border-radius: 4px;
            outline: none;
            transition-duration: 0.3s;
            background-color: #e2e2e2;
            cursor: pointer;
            accent-color: white;
            pointer-events: none;
          }

          input:checked {
            background-color: $primary;
            background-image: url('/app-images/check-mark.svg');
            background-position: center center;
            background-size: 80%;
            background-repeat: no-repeat;
          }

          label {
            margin-left: .8rem;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
