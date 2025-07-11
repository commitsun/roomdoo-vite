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
        {{ title }}
      </span>
    </div>

    <div class="mobile-mask">
      <div class="first" />
      <div class="second">
        <div class="pre-mask-container" />
        <div class="mask" />
        <div class="post-mask-container" />
      </div>
      <div class="third" />
    </div>

    <div class="video-container">
      <video ref="videoElement" autoplay playsInline />
      <div class="desktop-mask">
        <div class="first" />
        <div class="second">
          <div class="pre-mask-container" />
          <div class="mask">
            <img src="/app-images/placeholder-document-back.svg" v-if="isBack" />
            <img src="/app-images/placeholder-document-front.svg" v-else />
          </div>
          <div class="post-mask-container" />
        </div>
        <div class="third" />
      </div>
    </div>

    <div class="mobile-buttons">
      <div class="btn-back">
        <CustomIcon
          imagePath="/app-images/arrow-left-blue.svg"
          color="#FFFFFF"
          width="40px"
          height="40px"
          class="icon-arrow"
          @click="$emit('previous')"
        />
      </div>
      <div class="btn-take-photo-container">
        <div class="btn-take-photo" @click="takePicture" />
      </div>
      <div class="btn-upload">
        <CustomIcon
          imagePath="/app-images/icon-gallery.svg"
          color="#FFFFFF"
          width="50px"
          height="50px"
          class="icon-arrow"
          @click="browseFile()"
        />
        {{ $t('gallery') }}
      </div>
    </div>

    <div class="desktop-buttons">
      <div class="btn-container">
        <CustomButton :text="$t('take_photo')" color="primary" @click="takePicture" />
      </div>
      <div class="btn-container">
        <CustomButton :text="$t('upload_file')" backgroundColor="#51B2DD" @click="browseFile" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type Ref, onUnmounted } from 'vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import CustomButton from '@/_legacy/components/roomdooComponents/CustomButton.vue';
import { dialogService } from '@/_legacy/services/DialogService';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    isBack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    CustomIcon,
    CustomButton,
  },
  setup(props, context) {
    const { t } = useI18n();
    const stream: Ref<MediaStream | null> = ref(null);
    const videoElement = ref<HTMLVideoElement | null>(null);
    const photoData = ref('');
    const takePicture = () => {
      if (!videoElement.value) return;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.value.videoWidth;
      canvas.height = videoElement.value.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      photoData.value = dataURL;
      context.emit('capturedPhoto', photoData.value);
    };
    const browseFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            photoData.value = event.target?.result as string;
            context.emit('capturedPhoto', photoData.value);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };

    onMounted(async () => {
      try {
        const constraints = { video: { facingMode: 'environment' } };
        stream.value = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoElement.value) {
          videoElement.value.srcObject = stream.value;
        }
      } catch (error: unknown) {
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
              dialogService.open({
                header: t('error'),
                content: t('camera_error_permission'),
                btnAccept: t('ok'),
              });
              break;
            case 'NotFoundError':
              dialogService.open({
                header: t('error'),
                content: t('camera_error_not_found'),
                btnAccept: t('ok'),
              });
              break;
            case 'NotReadableError':
              dialogService.open({
                header: t('error'),
                content: t('camera_error_not_readable'),
                btnAccept: t('ok'),
              });
              break;
            default:
              dialogService.open({
                header: t('error'),
                content: t('camera_error_generic'),
                btnAccept: t('ok'),
              });
          }
        }
      }
    });

    onUnmounted(() => {
      if (stream.value) {
        stream.value.getTracks().forEach((track) => {
          track.stop();
        });
      }
    });
    return {
      videoElement,
      takePicture,
      browseFile,
    };
  },
});
</script>
<style scoped lang="scss">
.page-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  user-select: none;
  background-color: white;
  align-items: center;
  .prev-title {
    display: none;
    sup {
      text-decoration: underline;
    }
  }
  .step-title {
    display: none;
    align-items: center;
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
        margin-top: px;
      }
    }
    .title-text {
      font-size: 20px;
      font-weight: bold;
      margin-right: 1ch;
    }
  }
  .mobile-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 101;
    .first,
    .third {
      position: relative;
      background-color: black;
      opacity: 0.5;
      z-index: -1;
      height: calc((100% - 270px) / 2);
    }
    .second {
      display: flex;
      height: 270px;
      .pre-mask-container,
      .post-mask-container {
        width: calc((100% - 440px) / 2);
        background-color: black;
        opacity: 0.5;
        z-index: -1;
      }
      .mask {
        width: 440px;
        border-radius: 5px;
        box-shadow: 0 0 0 3px white;
      }
    }
  }
  .video-container {
    width: 100%;
    height: 50%;
    position: relative;
    border-radius: 10px;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .desktop-mask {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 101;
      .first,
      .third {
        position: relative;
        background-color: black;
        opacity: 0.5;
        z-index: -1;
        height: calc((100% - 270px) / 2);
      }
      .second {
        display: flex;
        height: 270px;
        position: relative;
        .pre-mask-container,
        .post-mask-container {
          width: calc((100% - 440px) / 2);
          background-color: black;
          opacity: 0.5;
          z-index: -1;
        }
        .mask {
          position: relative;
          width: 440px;
          border-radius: 5px;
          box-shadow: 0 0 0 3px white;
          img {
            position: absolute;
            z-index: 102;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.7;
          }
        }
      }
      .third {
        border-radius: 0 0 10px 10px;
      }
    }
  }
  .mobile-buttons {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    z-index: 9999;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .btn-back,
    .btn-upload {
      height: 70px;
      width: 70px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
    }
    .btn-take-photo {
      height: 75px;
      width: 75px;
      border-radius: 50%;
      background-color: $primary;
      box-shadow: 0 0 0 8px $primary;

      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 3px solid white;
        border-radius: 50%;
        pointer-events: none;
      }
    }
  }
  .desktop-buttons {
    display: none;
    flex-direction: row;
    justify-content: center;
    margin-top: 2.5rem;
    .btn-container {
      &:first-child {
        margin-right: 20px;
      }
    }
  }
}

@media (min-width: 1024px) {
  .page-container {
    z-index: 1;
    .mobile-buttons {
      display: none;
    }
    .mobile-mask {
      display: none;
    }
    .prev-title {
      display: block;
      align-self: center;
      font-size: 18px;
      color: #8b8a8d;
      font-weight: 600;
      margin-bottom: 1rem;
      margin-left: 0;
    }
    .step-title {
      display: flex;
    }
    .video-container {
      margin-top: 30px;
      max-width: 80%;
      width: 700px;
      overflow: hidden;
      border-radius: 10px;
      video {
        border-radius: 10px;
      }
      .desktop-mask {
        display: block;
      }
    }
    .desktop-buttons {
      display: flex;
    }
  }
}
@media (min-width: 1300px) {
  .page-container {
    .video-container {
      .desktop-mask {
        .first,
        .third {
          height: calc((100% - 350px) / 2);
        }
        .second {
          height: 350px;
          .pre-mask-container,
          .post-mask-container {
            width: 70px;
          }
          .mask {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
