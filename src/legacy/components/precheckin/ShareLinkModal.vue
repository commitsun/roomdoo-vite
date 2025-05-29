<template>
  <div class="share-modal-body">
    <div class="second-title">{{ t('share_checkin_link') }}</div>
    <div class="copy-link">
      <input type="text" readonly :value="link" ref="textInputRef" @blur="blurInputRef()" />
      <button @click="copyCurrentPath()">
        {{ textButton }}
      </button>
    </div>

    <div class="title">{{ t('share_via') }}</div>

    <div class="share-media" @click="shareLinkViaWhatsapp()">
      <div class="icon">
        <CustomIcon
          color="#3F4443"
          :imagePath="'/app-images/whatsapp.svg'"
          :width="'24px'"
          :height="'24px'"
        />
      </div>
      <div class="text">
        <div class="main-text">{{ t('share_whatsapp') }}</div>
      </div>
    </div>
    <div class="share-media" @click="shareLinkViaTelegram()">
      <div class="icon">
        <CustomIcon
          color="#3F4443"
          :imagePath="'/app-images/telegram.svg'"
          :width="'24px'"
          :height="'24px'"
        />
      </div>
      <div class="text">
        <div class="main-text">{{ t('share_telegram') }}</div>
      </div>
    </div>
    <div class="share-media" @click="shareLinkViaMail()">
      <div class="icon">
        <CustomIcon
          color="#3F4443"
          :imagePath="'/app-images/mail.svg'"
          :width="'24px'"
          :height="'24px'"
        />
      </div>
      <div class="text">
        <div class="main-text">{{ t('share_email') }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

export default defineComponent({
  props: {
    link: {
      type: String,
      required: true,
    },
  },
  components: {
    CustomIcon,
  },
  setup(props) {
    const { t } = useI18n();
    const textInputRef: Ref<null | HTMLInputElement> = ref(null);
    const textButton = ref(t('copy_link'));

    const copyCurrentPath = () => {
      void navigator.clipboard.writeText(props.link);
      textButton.value = t('link_copied');
      textInputRef.value?.focus();
      textInputRef.value?.select();
    };
    const blurInputRef = () => {
      textInputRef.value?.blur();
      textButton.value = t('copy_link');
    };
    const shareLinkViaWhatsapp = () => {
      window.open(`https://wa.me/?text=${props.link}`);
    };

    const shareLinkViaTelegram = () => {
      window.open(`https://t.me/share/url?url=${props.link}`);
    };

    const shareLinkViaMail = () => {
      window.open(`mailto:?body=${props.link}`);
    };

    return {
      t,
      copyCurrentPath,
      blurInputRef,
      shareLinkViaWhatsapp,
      shareLinkViaTelegram,
      shareLinkViaMail,
      textInputRef,
      textButton,
    };
  },
});
</script>
<style lang="scss" scoped>
// avoid warnign
@use 'sass:color';

.share-modal-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: auto;
  padding-left: 3rem;
  padding-right: 3rem;

  .title,
  .second-title {
    font-size: 1.3rem;
  }

  .copy-link {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    width: 100%;
    input {
      flex: 1 1 auto;
      width: 250px;
      margin-right: 0.5rem;
      border: 1px solid black;
    }
    button {
      min-width: 120px;
      background-color: $primary;
      color: white;
      border-radius: 6px;
      border: 1px solid $primary;
      cursor: pointer;
      &:hover {
        background-color: color.adjust($primary, $lightness: -10%);
      }
    }
  }

  .share-media {
    width: 100%;
    padding: 1rem;
    background: #78787826;
    height: 50px;
    margin: 15px 0;
    border-radius: 8px;
    display: flex;
    cursor: pointer;
    .text,
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .icon {
      min-width: 24px;
    }
    .text {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      font-size: 16px;
      .main-text {
        text-align: center;
        font-weight: bold;
      }
    }
    &:hover {
      background: #7878784d;
    }
  }
}

@media (min-width: 1024px) {
  .share-modal-body {
    display: flex;
    width: 600px;
    height: auto;
    padding-bottom: 3rem;
  }
}
</style>
