<template>
  <div class="page-container">
    <div class="prev-title">
      {{ $t('guest_data_title', { index: currentIndexCheckin + 1 }) }}
      <sup>
        {{
          currentIndexCheckin === 0
            ? $t('ordinal_1')
            : currentIndexCheckin === 1
            ? $t('ordinal_2')
            : currentIndexCheckin === 2
            ? $t('ordinal_3')
            : $t('ordinal_other')
        }}
      </sup>
      {{ $t('guest') }}
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">{{ $t('check_legibility_title') }}</span>
    </div>
    <div class="image-container">
      <img :src="documentImageBase64" alt="no image" />
    </div>
    <div class="buttons">
      <div class="btn-container">
        <CustomButton :text="$t('retry')" backgroundColor="#51B2DD" @click="$emit('previous')" />
      </div>
      <div class="btn-container">
        <CustomButton :text="$t('continue')" color="primary" @click="$emit('next')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CustomButton from '@/_legacy/components/roomdooComponents/CustomButton.vue';

export default defineComponent({
  props: {
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    documentImageBase64: {
      type: String,
      required: true,
    },
  },
  components: {
    CustomButton,
  },
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss">
.page-container {
  width: 100%;
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  // prev-title
  .prev-title {
    width: 100%;
    text-align: center;
    sup {
      text-decoration: underline;
      font-size: 0.5rem;
    }
  }
  // title
  .step-title {
    width: 100%;
    display: flex;
    margin: 0 1rem;
    .step {
      color: $primary;
      display: flex;
      align-items: center;
      font-size: 20px;
      margin-right: 0.75rem;
      img {
        transform: rotate(180deg);
        width: 16px;
        height: 16px;
      }
    }
    .title-text {
      font-size: 20px;
      font-weight: bold;
      .asterisk {
        color: #ed4a1c;
      }
    }
  }

  // subtitle
  .step-subtitle {
    width: 100%;
    font-size: 13px;
    color: #4f4f4f;
    margin: 0 1rem;
  }
  .image-container {
    width: 100%;
    margin-top: 0.5rem;
    img {
      width: 100%;
      height: 30vh;
      object-fit: cover;
      border-radius: 10px;
    }
  }
  .buttons {
    display: flex;
    flex-direction: column;
    width: 100%;

    .btn-container {
      width: 100%;
      &:first-child {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    }
  }
}

@media (min-width: 1024px) {
  .page-container {
    justify-content: center;
    // prev-title
    .prev-title {
      align-self: center;
      color: #8b8a8d;
      font-weight: 600;
      margin-bottom: 1rem;
      margin-left: 0;
      sup {
        font-size: 0.75rem;
      }
    }
    // title
    .step-title {
      width: auto;
      font-size: 25px;
      .step {
        font-size: 25px;
        align-self: center;
        img {
          width: 14px;
          height: 14px;
        }
      }
      .title-text {
        font-size: 25px;
        width: 100%;
      }
    }
    // subtitle
    .step-subtitle {
      width: auto;
      font-size: 18px;
      text-align: center;
    }
    .image-container {
      max-width: 80%;
      width: auto;
      img {
        max-height: 45vh;
      }
    }
    .buttons {
      margin-top: 0.5rem;
      flex-direction: row;
      justify-content: center;
      .btn-container {
        width: 160px;
        &:first-child {
          margin-right: 1rem;
          margin-top: 0;
        }
      }
    }
  }
}
</style>
