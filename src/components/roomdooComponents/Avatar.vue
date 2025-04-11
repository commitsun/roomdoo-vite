<template>
  <div
    class="avatar"
    :style=" backgroundColor ? `background-color: ${backgroundColor}`: ''"
  >
    <img
      v-if="image && image !== ''"
      :src="image"
    />
    <span v-else-if="textToRender">
      {{ textToRender }}
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    image: {
      type: String,
      required: false,
    },
    textToRender: {
      type: String,
      required: false,
    },
    backgroundColor: {
      type: String,
      required: false,
    },
  },
});
</script>
<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  color: #FFFFFF;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
</style>
