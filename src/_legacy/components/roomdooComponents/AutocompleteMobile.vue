<template>
  <div class="container-autocomplete-mobile">
    <div class="search">
      <div class="left">
        <img src="/app-images/arrow-left-blue.svg" @click="closeRightDrawer" />
        <input
          type="text"
          @click="isOpen = true"
          @input="inputChange"
          v-model="search"
          :style="styleInput()"
          :placeholder="placeholder"
        />
      </div>
      <div class="right" v-if="logoSelectedOption !== ''">
        <div class="select-mobile">
          <div
            class="logo"
            :style="{
              backgroundImage: imageActiveProperty ? `url(${imageActiveProperty})` : 'none',
              backgroundColor: imageActiveProperty ? 'none' : 'aquamarine',
            }"
          >
            <span v-if="!imageActiveProperty">
              {{ logoSelectedOption }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="options">
      <div v-for="item in results" :key="item.value" @click="setResult(item)" class="option">
        <div
          class="logo"
          v-if="showLogoOptions"
          :test="item.logo"
          :style="{
            backgroundImage: item.logo ? `url(${item.logo})` : 'none',
            backgroundColor: item.logo ? 'none' : 'aquamarine',
          }"
        >
          <span v-if="!item.logo">
            {{ firstTwoInitials(item.name) }}
          </span>
        </div>
        <span class="name">
          {{ item.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { useStore } from '@/_legacy/store';

export default defineComponent({
  props: {
    items: {
      type: Array as () => { value: number; name: string; logo?: string }[],
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    logoSelectedOption: {
      type: String,
      required: false,
      default: '',
    },
    showLogoSelected: {
      type: Boolean,
      required: false,
      default: false,
    },
    showLogoOptions: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    const store = useStore();
    const isOpen = ref(false);
    const results = ref([] as { value: number; name: string; logo?: string }[]);
    const search = ref('');

    const imageActiveProperty = computed(
      () => store.state.properties.activeProperty?.hotelImageUrl
    );

    const styleInput = () => {
      let style = {};
      style = {
        paddingLeft: `${1}rem`,
      };
      return style;
    };

    const filterResults = () => {
      results.value = props.items.filter(
        (item) =>
          item.name
            .normalize('NFKD')
            .replace(/[^\w]/g, '')
            .toLowerCase()
            .indexOf(search.value.normalize('NFKD').replace(/[^\w]/g, '').toLowerCase()) > -1
      );
    };

    const inputChange = () => {
      context.emit('input', search.value);
      results.value = props.items;
      filterResults();
      isOpen.value = true;
      context.emit('textSearchChanges', search.value);
    };

    const setResult = (result: { value: number; name: string }) => {
      search.value = result.name;
      isOpen.value = false;
      context.emit('update:modelValue', result.value);
      search.value = '';
    };

    const styleOptionsContainer = () => {
      let style = {};
      style = {
        ...style,
        bottom: '36px',
      };
      return style;
    };

    const setInputClass = () => {
      let classToSet = '';
      classToSet = 'without-icon-expanded';

      return classToSet;
    };

    const closeRightDrawer = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
    };

    const firstTwoInitials = (name: string) => {
      let result = name.split(' ')[0][0].toUpperCase();
      if (name.split(' ').length > 1) {
        result += name.split(' ')[1][0].toUpperCase();
      }
      return result;
    };

    watch(
      () => props.items,
      (newValue, oldValue) => {
        if (newValue.length !== oldValue.length) {
          results.value = newValue;
        }
      }
    );

    onMounted(() => {
      if (props.items.length > 0) {
        results.value = props.items;
      }
    });

    return {
      store,
      isOpen,
      results,
      search,
      imageActiveProperty,
      inputChange,
      firstTwoInitials,
      setResult,
      styleInput,
      styleOptionsContainer,
      setInputClass,
      closeRightDrawer,
    };
  },
});
</script>
<style lang="scss" scoped>
.container-autocomplete-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
  .search {
    padding: 1rem 1rem 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);

    .left {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      img {
        width: 15px;
        height: 15px;
        margin-right: 1rem;
      }
      input {
        width: 100%;
        outline: 0;
        border: 0;
        font-size: 18px;
      }
    }
    .right {
      .select-mobile {
        width: 35px;
        height: 35px;
        .logo {
          border-radius: 50%;
          font-weight: bold;
          font-size: 1.3rem;
          display: flex;
          height: 100%;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          background-size: cover;
        }
      }
    }
  }
  .options {
    padding-top: 1.3rem;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    margin-left: 0.5rem;
    .option {
      border-bottom: 1px solid lightgray;
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      .logo {
        border-radius: 50%;
        font-weight: bold;
        display: flex;
        height: 32px;
        width: 32px;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        background-size: cover;
        margin-right: 1rem;
      }
      .name {
        font-size: 18px;
      }
    }
  }
}
</style>
