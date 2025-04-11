<template>
  <div class="list-content">
    <div class="list-content-header">
      <div class="toggle-container" v-if="isMultiSelectable">
        <CheckboxComponent v-model="isItemsSelected" />
      </div>
      <div
        class="list-header"
        :style="{
          gridTemplateColumns: `repeat(
            ${schema.length + extraColumns}, 1fr)`,
          borderRadius: isMultiSelectable ? '0 10px 0 0' : '',
        }"
      >
        <span
          v-for="field in schema"
          :key="field.label"
          @click="field.isSortable ? sortList(field.fieldName) : null"
          :style="{
            textAlign: field.align ? field.align : 'left',
            gridColumn: field.columnWidth ? `span ${field.columnWidth}` : 'span 1',
          }"
        >
          <div
            class="text-header-wrap"
            :style="
              field.align && field.align === 'right'
                ? 'justify-content: flex-end'
                : field.align && field.align === 'center'
                ? 'justify-content: center'
                : 'justify-content: flex-start;'
            "
          >
            <div class="text-header" :style="field.isSortable ? 'cursor: pointer;' : ''">
              {{ field.label }}
              <span class="secondary-text" v-if="field.secondaryLabel">
                {{ field.secondaryLabel }}
              </span>
            </div>
            <CustomIcon
              v-if="field.isSortable"
              :imagePath="`/app-images/${getIconPath(field.fieldName)}.svg`"
              color="black"
              :width="getIconPath(field.fieldName) === 'icon-sortable' ? '20px' : '10px'"
              :height="getIconPath(field.fieldName) === 'icon-sortable' ? '20px' : '10px'"
              :class="!isDesc ? 'icon-sort' : 'icon-sort-rotate'"
              :style="
                getIconPath(field.fieldName) === 'icon-sortable'
                  ? 'transform: rotate(180deg); cursor: pointer;'
                  : 'cursor: pointer;'
              "
            />
          </div>
        </span>
      </div>
    </div>
    <div class="list-data" @scroll="onScroll()" v-if="listData.length > 0">
      <ItemComponent
        v-for="(item, index) in listData"
        :key="index"
        :schema="schema"
        :data="(item as Object)"
        @addItem="$emit('addItem', $event)"
        @removeItem="$emit('removeItem', $event)"
        @click="$emit('selectItem', item)"
        :isMultiSelectable="isMultiSelectable"
        :multiSelection="selection"
        :isAllItemsSelected="isItemsSelected"
      />
    </div>
    <div v-else class="no-results">No hay resultados</div>
  </div>
</template>

<script lang="ts">
import { type SchemaInterface } from 'src/interfaces/Lists';
import { defineComponent, type Ref, onMounted, ref, watch } from 'vue';
import ItemComponent from '@/components/roomdooComponents/ItemComponent.vue';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import CheckboxComponent from '@/components/roomdooComponents/CheckboxComponent.vue';

export default defineComponent({
  components: {
    ItemComponent,
    CustomIcon,
    CheckboxComponent,
  },
  props: {
    schema: {
      type: Array as () => SchemaInterface[],
      required: true,
    },
    listData: {
      type: Array,
      required: true,
    },
    isMultiSelectable: {
      type: Boolean,
      default: false,
    },
    multiSelection: {
      type: Array as () => number[],
      default: () => [],
    },
  },
  setup(props, context) {
    const selection: Ref<number[]> = ref([]);
    const fieldSort = ref('');
    const isDesc = ref(false);
    const isItemsSelected = ref(false);

    const onScroll = () => {
      const element = document.querySelector('.list-data');
      if (element) {
        const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
        if (bottom) {
          context.emit('scrollInBottom');
        }
      }
    };
    const sortList = (field: string) => {
      isDesc.value = fieldSort.value === field ? !isDesc.value : false;
      fieldSort.value = field;
      context.emit('sort', field);
    };

    const getIconPath = (field: string) => {
      if (fieldSort.value === '' || fieldSort.value !== field) {
        return 'icon-sortable';
      }
      if (isDesc.value) {
        return 'arrow-left-black';
      }
      return 'arrow-left-black';
    };

    const extraColumns = props.schema?.reduce(
      (acc, item) => acc + (item.columnWidth && item.columnWidth !== 1 ? item.columnWidth - 1 : 0),
      0
    );

    watch(
      () => props.multiSelection,
      () => {
        selection.value = props.multiSelection;
        context.emit('update:multiSelection', selection.value);
        if (props.multiSelection.length === 0) {
          isItemsSelected.value = false;
        }
      }
    );

    watch(isItemsSelected, () => {
      if (isItemsSelected.value) {
        context.emit('addAllItems');
      } else {
        context.emit('removeAllItems');
      }
    });

    onMounted(() => {
      selection.value = props.multiSelection;
    });
    return {
      selection,
      fieldSort,
      isDesc,
      extraColumns,
      isItemsSelected,
      onScroll,
      sortList,
      getIconPath,
    };
  },
});
</script>
<style lang="scss" scoped>
.list-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .list-content-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 40px;
    padding: 0 1rem;
    background-color: #f0fcff;
    .toggle-container {
      width: 22px;
      height: 22px;
      margin-right: 1rem;
    }
    .list-header {
      display: none;
      align-items: center;
      grid-template-rows: repeat(1, 1fr);
      width: calc(100% - #{$scrollbar_width});
      font-weight: bold;
      background-color: #f0fcff;
      border-radius: 10px 10px 0 0;
      height: 40px;

      .text-header-wrap {
        display: flex;
        align-items: center;
        user-select: none;
        .text-header {
          display: flex;
          flex-direction: column;
          max-width: 180px;
          .secondary-text {
            font-weight: 100;
          }
        }
        .icon-sort {
          margin-left: 0.3rem;
          margin-top: 1px;
          transform: rotate(90deg);
        }
        .icon-sort-rotate {
          margin-left: 0.3rem;
          margin-top: 1px;
          transform: rotate(-90deg);
        }
      }
    }
  }
  .list-data {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 120px - 1.5rem);
    padding: 0.5rem;
    background-color: white;
  }
  .no-results {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #263941;
    font-weight: bold;
    margin: 1rem 0 0 1rem;
  }
}

@media (min-width: 1024px) {
  .list-content {
    .list-content-header {
      .list-header {
        display: grid;
      }
    }
  }
}
</style>
