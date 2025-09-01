<template>
  <div
    class="header"
    v-if="pmsPropertyImage"
    :style="{
      backgroundImage: `url(${pmsPropertyImage})`,
      height: headerHeight,
    }"
  >
    <AppSelect
      v-model="selectedLocale"
      :options="locales"
      optionLabel="label"
      class="select-language"
      placeholder="Select Language"
    >
      <template #option="slotProps">
        <div class="flag">
          <img :src="slotProps.option.flag" />
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>

      <template #value="slotProps">
        <div class="flag">
          <img :src="slotProps.value?.flag" />
          <span>{{ slotProps.value?.label }}</span>
        </div>
      </template>
    </AppSelect>
    <div
      class="overlay"
      :style="{
        height: headerHeight,
      }"
    />
    <div class="link-share-row">
      <div class="link-share" @click="shareLink()">
        <CustomIcon
          class="arrow-back"
          color="black"
          imagePath="/app-images/share2.svg"
          width="22px"
          height="22px"
        />
      </div>
    </div>
    <div class="logo-and-hotel-text">
      <div class="logo-container">
        <div class="logo">
          <img v-if="pmsPropertyLogo" :src="pmsPropertyLogo" alt="logo" />
        </div>
      </div>
      <div class="name">
        {{ pmsPropertyName }}
      </div>
      <div class="location">
        {{ pmsPropertyLocation }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, markRaw, watch, onMounted } from 'vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import ShareLinkModal from '@/_legacy/components/precheckin/ShareLinkModal.vue';
import { dialogService } from '@/_legacy/services/DialogService';
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { updateI18nLocale } from '@/infrastructure/plugins/i18n';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';

export default defineComponent({
  props: {
    headerHeight: {
      type: String,
      required: true,
    },
    isFolio: {
      type: Boolean,
      required: false,
      default: false,
    },
    pmsPropertyName: {
      type: String,
      required: true,
    },
    pmsPropertyCity: {
      type: String,
      required: true,
    },
    pmsPropertyState: {
      type: String,
      required: true,
    },
    pmsPropertyImage: {
      type: String,
      required: true,
    },
    pmsPropertyLogo: {
      type: String,
      required: true,
    },
  },
  components: {
    CustomIcon,
    AppSelect: Select,
  },
  setup(props) {
    const { t, locale } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const locales = ref([
      { label: 'Español', value: 'es', flag: '/country-flags/es.svg' },
      { label: 'English', value: 'en', flag: '/country-flags/gb.svg' },
    ]);
    const selectedLocale = ref(locales.value.find((l) => l.value === locale.value));

    const currentPath = `${window.location.href}`;
    const pmsPropertyLocation = computed(() => {
      let result = '';
      if (props.pmsPropertyCity && props.pmsPropertyState) {
        result = `${props.pmsPropertyCity}, ${props.pmsPropertyState}`;
      } else if (props.pmsPropertyCity) {
        result = props.pmsPropertyCity;
      } else if (props.pmsPropertyState) {
        result = props.pmsPropertyState;
      }
      return result;
    });
    const shareLink = () => {
      const canShare = 'share' in window.navigator;
      if (canShare) {
        void navigator.share({
          title: document.title,
          url: currentPath,
        });
      } else {
        dialogService.open({
          header: t('share_link'),
          content: markRaw(ShareLinkModal),
          closable: true,
          props: {
            link: currentPath,
          },
        });
      }
    };
    const shareLinkViaWhatsapp = () => {
      window.open(`https://api.whatsapp.com/send?text=${currentPath}`);
    };

    const shareLinkViaTelegram = () => {
      window.open(`https://t.me/share/url?url=${currentPath}`);
    };

    const shareLinkViaMail = () => {
      window.open(`mailto:?body=${currentPath}`);
    };
    const copyCurrentPath = () => {
      void navigator.clipboard.writeText(currentPath);
    };

    watch(selectedLocale, (newLocale) => {
      if (newLocale?.value) {
        locale.value = newLocale.value;
        // updateAppLocale(newLocale.value);
        updateI18nLocale(newLocale.value);
        updatePrimevueLocale(newLocale.value);

        const newParams = { ...route.params, lang: newLocale.value };
        router.push({ name: route.name!, params: newParams });
      }
    });

    onMounted(() => {
      const langUrl = route.params.lang as string | undefined;

      let languageCode: string;

      if (langUrl && ['en', 'es'].includes(langUrl)) {
        languageCode = langUrl;
      } else {
        const browserLang = window.navigator.language.toLowerCase().substring(0, 2);
        languageCode = ['es', 'gl', 'ca'].includes(browserLang) ? 'es' : 'en';
      }

      const selected = locales.value.find((l) => l.value === languageCode);
      selectedLocale.value = selected ?? locales.value[1]; // fallback a 'en'
      locale.value = selectedLocale.value.value;
    });

    return {
      currentPath,
      pmsPropertyLocation,
      selectedLocale,
      locales,
      shareLink,
      shareLinkViaWhatsapp,
      shareLinkViaTelegram,
      shareLinkViaMail,
      copyCurrentPath,
    };
  },
});
</script>
<style lang="scss" scoped>
.header {
  background-position: center center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-top: 25px;
  position: relative;
  background-size: cover;
  .select-language {
    position: absolute;
    top: 20px;
    left: 15px;
    z-index: 25;
    width: 130px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .link-share-row {
    position: absolute;
    top: 20px;
    right: 15px;
    display: flex;
    justify-content: flex-end;
    .link-share {
      cursor: pointer;
      color: white;
      right: 0;
      border-radius: 50%;
      height: 40px;
      width: 40px;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background: #cccccc;
      }
    }
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
  }
  .logo-and-hotel-text {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
    .logo,
    .name,
    .location {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }
    .logo {
      background-color: white;
      border-radius: 50%;
      height: 70px;
      width: 70px;
      padding: 5px;
      overflow: hidden;
      img {
        width: 100%;
      }
    }
    .name {
      height: auto;
      font-size: 22px;
      font-weight: bold;
    }
    .location {
      height: auto;
      font-size: 18px;
    }
  }
}
.share-modal {
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
      justify-content: center;
      margin-bottom: 2rem;
      input {
        width: 250px;
        margin-right: 0.5rem;
      }
      .icon {
        border: 1px solid $primary;
        cursor: pointer;
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
    }
  }
}
.flag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }
}
@media (min-width: 768px) {
  .header {
    margin-left: 25px;
    width: 744px;
  }
}
@media (min-width: 1024px) {
  .share-modal {
    .share-modal-body {
      display: flex;
      width: 600px;
      height: auto;
      padding-bottom: 3rem;
    }
  }
}
</style>
