<template>
  <div class="item-container">
    <div class="item-container-wrapper">
      <div class="toggle-container" v-if="isMultiSelectable">
        <CheckboxComponent v-model="isItemSelected" />
      </div>
      <div
        class="list-row"
        :style="`grid-template-columns: repeat(
          ${
            windowWidth >= 1024
              ? schema.length + extraColumns
              : schema.filter((el) => el.mobileAllowed).length + extraColumns
          },
        1fr);`"
      >
        <div
          v-for="field in schema"
          :key="field.fieldName"
          class="list-item"
          :style="{
            textAlign: field.align ? field.align : 'left',
            gridColumn: field.columnWidth ? `span ${field.columnWidth}` : 'span 1',
          }"
          :class="field.mobileAllowed ? 'mobile-allowed' : 'mobile-not-allowed'"
        >
          <span v-if="field.fieldType === 'text'">
            {{ data[field.fieldName] }}
          </span>
          <span v-else-if="field.fieldType === 'number'">
            {{ data[field.fieldName] }}
          </span>
          <span v-else-if="field.fieldType === 'tag'">
            <span :class="data[field.fieldName] !== '' ? 'tag' : ''">
              {{ data[field.fieldName] }}
            </span>
          </span>
          <span v-else-if="field.fieldType === 'textBold'" class="text-bold">
            <span>
              {{ data[field.fieldName] }}
            </span>
          </span>
          <span v-else-if="field.fieldType === 'money'">
            <span> {{ data[field.fieldName] }} € </span>
          </span>
          <span v-else-if="field.fieldType === 'moneyBold'" class="text-bold">
            <span v-if="data[field.fieldName] !== ''"> {{ data[field.fieldName] }} € </span>
            <span v-else> 0 € </span>
          </span>
          <span
            :class="data[field.fieldName] !== '' ? 'text-with-avatar' : ''"
            v-else-if="field.fieldType === 'textWithAvatar'"
          >
            <Avatar
              :image="data[field.avatarImage ?? '']"
              :textToRender="data[field.avatar ?? '']"
              :backgroundColor="data[field.avatarColor ?? '']"
              class="avatar-content"
            />
            <span>{{ data[field.fieldName] }}</span>
          </span>
          <span class="bold-with-avatar" v-else-if="field.fieldType === 'textBoldWithAvatar'">
            <Avatar
              :image="data[field.avatarImage ?? '']"
              :textToRender="data[field.avatar ?? '']"
              :backgroundColor="data[field.avatarColor ?? '']"
              class="avatar"
            />
            <span>{{ data[field.fieldName] }}</span>
          </span>
          <span
            v-else-if="field.fieldType === 'tagMoney'"
            class="tag-money"
            :style="{ backgroundColor: tagMoneyBackgroundColor(data[field.fieldName]) }"
          >
            <span v-if="data[field.fieldName] !== ''"> {{ data[field.fieldName] }} € </span>
            <span v-else> 0 € </span>
          </span>
          <span v-else-if="field.fieldType === 'tagColor'" class="tag-color">
            <div class="tag-color-content" :style="{ backgroundColor: data.color }">
              <span>
                {{ data[field.fieldName] }}
              </span>
            </div>
          </span>
          <span
            v-else-if="field.fieldType === 'tagList'"
            :class="data[field.fieldName].length > 0 ? 'tag' : ''"
          >
            <span v-if="data[field.fieldName].length === 1">
              {{ data[field.fieldName][0] }}
            </span>
            <span
              v-else-if="data[field.fieldName].length > 1"
              @mouseenter="showToolTip()"
              @mouseleave="hideTooltip()"
            >
              {{ data[field.fieldName][0] }}
              <span class="number-tags"> +{{ data[field.fieldName].length - 1 }}</span>
            </span>
            <div
              class="tags-tooltip"
              ref="tooltip"
              @mouseenter="showToolTip()"
              @mouseleave="hideTooltip()"
            >
              <div v-for="tag in data[field.fieldName]" :key="tag">
                <span>
                  {{ tag }}
                </span>
              </div>
            </div>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type SchemaInterface } from 'src/interfaces/Lists';
import { defineComponent, type Ref, ref, watch, computed } from 'vue';
import Avatar from '@/components/roomdooComponents/Avatar.vue';
import CheckboxComponent from '@/components/roomdooComponents/CheckboxComponent.vue';

export default defineComponent({
  components: {
    Avatar,
    CheckboxComponent,
  },
  props: {
    isMultiSelectable: {
      type: Boolean,
      default: false,
    },
    multiSelection: {
      type: Array as () => number[],
      default: () => [],
    },
    isAllItemsSelected: {
      type: Boolean,
      default: false,
    },
    schema: {
      type: Object as () => SchemaInterface[],
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props, context) {
    const tooltip: Ref<HTMLElement | null> = ref(null);
    const isItemSelected = ref(false);
    const windowWidth = computed(() => window.innerWidth);

    const showToolTip = () => {
      if (tooltip.value) {
        tooltip.value.classList.add('show');
      }
    };
    const hideTooltip = () => {
      if (tooltip.value) {
        tooltip.value.classList.remove('show');
      }
    };

    const tagMoneyBackgroundColor = (tag: string) => {
      const firstChar = tag.charAt(0);
      if (firstChar === '+') {
        return 'rgb(226, 251, 226)';
      }
      if (firstChar === '-') {
        return '#FFDDDD8A';
      }
      return '#eeeeee';
    };

    const extraColumns = props.schema?.reduce(
      (acc, item) => acc + (item.columnWidth && item.columnWidth !== 1 ? item.columnWidth - 1 : 0),
      0
    );

    watch(isItemSelected, () => {
      if (!props.isAllItemsSelected) {
        if (isItemSelected.value) {
          context.emit('addItem', props.data.id);
        } else {
          context.emit('removeItem', props.data.id);
        }
      }
    });

    watch(
      () => props.multiSelection,
      () => {
        if (props.multiSelection.length === 0) {
          isItemSelected.value = false;
        } else {
          isItemSelected.value = props.multiSelection.includes(props.data.id);
        }
      }
    );

    return {
      tooltip,
      isItemSelected,
      windowWidth,
      extraColumns,
      showToolTip,
      hideTooltip,
      tagMoneyBackgroundColor,
    };
  },
});
</script>
<style lang="scss" scoped>
.item-container {
  width: 100%;
  .item-container-wrapper {
    border-bottom: 1px solid rgba(211, 211, 211, 0.46);
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    .toggle-container {
      width: 22px;
      height: 22px;
      margin-right: 1rem;
    }
    .list-row {
      display: grid;
      grid-template-rows: repeat(1, 1fr);
      align-items: center;
      width: 100%;
      height: 50px;
      position: relative;

      cursor: pointer;
      .list-item {
        width: 200%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .text-bold {
          font-weight: bold;
        }
        .bold-with-avatar {
          font-weight: bold;
          display: flex;
          align-items: center;
          .avatar {
            margin-right: 0.5rem;
            width: 30px;
            height: 30px;
            min-width: 30px;
            font-size: 16px;
          }
          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        .text-with-avatar {
          display: flex;
          align-items: center;
          .avatar-content {
            margin-right: 0.5rem;
            width: 30px;
            height: 30px;
            min-width: 30px;
            font-size: 16px;
            border: 0.5px solid lightgray;
          }
          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        .tag {
          padding: 3px 14px;
          border-radius: 20px;
          background-color: #f6f6f6;
          color: #263941;
          .number-tags {
            margin-left: 0.5rem;
          }
        }
        .tag-money {
          color: #263941;
          font-weight: bold;
          width: 100%;
          padding: 3px 14px;
          border-radius: 20px;
        }
        .tags-tooltip {
          position: absolute;
          top: -40px;
          right: 0;
          width: max-content;
          padding: 5px 15px;
          background-color: #87cefa;
          color: white;
          font-weight: bold;
          border-radius: 10px;
          text-align: center;
          visibility: hidden;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .show {
          visibility: visible;
          transform: translateY(0);
          opacity: 1;
        }
        &.mobile-not-allowed {
          display: none;
        }
        .tag-color {
          font-weight: bold;
          .tag-color-content {
            display: flex;
            align-items: center;
            width: max-content;
            padding: 3px 12px;
            border-radius: 30px;
            max-width: 125px;
            span {
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              width: 100%;
            }
          }
        }
      }
    }
    &:hover {
      box-shadow: 0px 0 4px rgb(190, 190, 190);
      border-radius: 10px;
    }
  }
}

@media (min-width: 1024px) {
  .item-container {
    .item-container-wrapper {
      .list-row {
        .list-item {
          width: 100%;
          max-width: 250px;
          &.mobile-not-allowed {
            display: flex;
          }
        }
      }
    }
  }
}
</style>
