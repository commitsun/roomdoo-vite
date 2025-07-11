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
      <span class="title-text">
        {{ $t('scan_document') }}
      </span>
    </div>

    <span class="step-subtitle">
      {{ $t('scan_document_subtitle') }}
    </span>

    <div class="images-container">
      <div class="first-image-container">
        <div
          class="img-document-container"
          :class="{ 'with-image': documentImageBase64Front }"
          @click="$emit('backToCaptureFrontDocument')"
        >
          <div class="triangle">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <img class="img-document" :src="documentImageBase64Front" />
        </div>
        <span>{{ $t('scan_document_front') }}</span>
      </div>
      <div class="second-image-container">
        <div
          class="img-document-container"
          :class="{ 'with-image': documentImageBase64Back }"
          @click="$emit('backToCaptureBackDocument')"
        >
          <div class="triangle" v-if="documentImageBase64Back">
            <img class="check-mark" src="/app-images/check-mark.svg" />
          </div>
          <img
            class="img-document"
            :src="documentImageBase64Back || '/app-images/placeholder-document.svg'"
            :class="documentImageBase64Back ? '' : 'img-placeholder'"
          />
        </div>
        <span>{{ $t('scan_document_back') }}</span>
      </div>
    </div>

    <div class="buttons">
      <div class="btn-container" v-if="!documentImageBase64Back">
        <CustomButton
          :text="$t('scan_document_no_back')"
          backgroundColor="#51B2DD"
          @click="$emit('processOCR')"
        />
      </div>
      <div class="btn-container">
        <CustomButton
          :text="
            documentImageBase64Front && documentImageBase64Back
              ? $t('scan_document_scan_data')
              : $t('continue')
          "
          color="primary"
          @click="
            $emit(documentImageBase64Front && documentImageBase64Back ? 'processOCR' : 'next')
          "
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import CustomButton from '@/_legacy/components/roomdooComponents/CustomButton.vue';
import { useI18n } from 'vue-i18n';

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
    documentImageBase64Front: {
      type: String,
      required: true,
    },

    documentImageBase64Back: {
      type: String,
      required: false,
    },
  },
  components: {
    CustomButton,
  },
  setup() {
    const { t } = useI18n();
    return {
      t,
    };
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
  .images-container {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;

    .first-image-container,
    .second-image-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .img-document-container {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        height: 100px;
        &.with-image {
          border: 2px solid #008000;
        }
        .triangle {
          width: 0;
          height: 0;
          border-top: 45px solid #008000;
          border-left: 45px solid transparent;
          position: absolute;
          top: 0;
          right: 0;
          .check-mark {
            position: absolute;
            bottom: 19px;
            right: 3px;
            width: 20px;
            height: 20px;
          }
        }
        .img-document {
          width: 150px;
          height: 100px;
          object-fit: cover;
        }
      }
      span {
        font-size: 15px;
        color: $primary;
        font-weight: bold;
      }
    }
  }
  .buttons {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    width: 100%;
    .btn-container {
      width: 100%;
      &:nth-child(2) {
        margin-top: 1rem;
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
    .images-container {
      flex-direction: row;
      margin-top: 30px;
      display: flex;
      .first-image-container,
      .second-image-container {
        padding-left: 0;
        display: flex;
        flex-direction: column;

        .img-document-container {
          height: 150px;
          width: 250px;
          .img-document {
            width: 100%;
            height: 100%;
          }
        }
        span {
          width: 250px;
          text-align: center;
          font-size: 20px;
        }
      }
      .first-image-container {
        margin-right: 1rem;
        align-items: flex-end;
      }
      .second-image-container {
        align-items: flex-start;
      }
    }

    .buttons {
      height: 100px;
      flex-direction: row-reverse;
      justify-content: center;
      align-items: flex-end;
      .btn-container {
        width: 225px;
        &:nth-child(2) {
          margin-top: 0;
          margin-right: 1rem;
        }
      }
    }
  }
}
</style>
