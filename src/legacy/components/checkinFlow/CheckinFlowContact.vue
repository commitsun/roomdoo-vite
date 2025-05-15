<template>
  <div class="page-container">
    <div class="prev-title">
      {{
        $t('guest_data_title', { index: currentIndexCheckin + 1 })
      }}
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
      <span class="title-text">{{ $t('contact_data') }}</span>
    </div>
    <div class="step-subtitle">{{ $t('enter_contact_data_instruction', { field: titleText }) }}</div>

    <div class="input-wrap" v-if="!isHiddenMail">
      <span class="input-label">{{ $t('email_label') }}</span>
      <InputText
        v-model="emailRef"
        class="input"
        @keydown.enter="onEnterEmail()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :placeholder="$t('placeholder_write_here')"
        :isBorder="false"
        placeholderBlue
        textColor="primary"
        :isError="validator.emailRef.$errors.length > 0"
        ref="emailInputRef"
      />
      <div v-if="validator.emailRef.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>{{ $t('invalid_email') }}</span>
      </div>
    </div>

    <div class="input-wrap" v-if="!isHiddenPhone">
      <span class="input-label">{{ $t('phone_label') }}</span>
      <InputText
        v-model="phone"
        class="input"
        @keydown.enter="submitForm()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :placeholder="$t('placeholder_write_here')"
        :isBorder="false"
        placeholderBlue
        textColor="primary"
        ref="phoneInputRef"
      />
    </div>

    <div class="btn-continue-container">
      <button class="btn-continue" @click="submitForm">{{ $t('accept') }}</button>
    </div>
  </div>
</template>


<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  type Ref,
  type ComponentPublicInstance,
  computed,
} from 'vue';
import useVuelidate from '@vuelidate/core';
import { email, helpers } from '@vuelidate/validators';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
  components: {
    CustomIcon,
    InputText,
  },

  props: {
    guestPhone: {
      type: String,
      required: false,
    },
    guestMail: {
      type: String,
      required: false,
    },
    currentIndexCheckin: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    isHiddenMail: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHiddenPhone: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props, context) {
    const { t } = useI18n();

    let hasEmittedNext = false;
    const phone = ref('');
    const emailRef = ref('');
    const emailInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const phoneInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const titleText = ref('');

    const validationRules = computed(() => ({
      emailRef: {
        emailRef: helpers.withMessage(t('invalid_email'), email),
      },
    }));

    const validator = useVuelidate(validationRules, {
      emailRef,
    });

    const submitForm = () => {
      validator.value.$touch();
      if ((emailRef.value === '' || !validator.value.$invalid) && !hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    const onEnterEmail = () => {
      validator.value.$touch();
      if (!props.isHiddenPhone) {
        const input = phoneInputRef.value?.$refs.input as HTMLInputElement;
        if (input) {
          input.focus();
        }
      } else {
        submitForm();
      }
    };

    const isAllowedNextStep = () => {
      if (!validator.value.$invalid) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
    };

    watch(emailRef, () => {
      if (!validator.value.$invalid) {
        context.emit('update:guestMail', emailRef.value);
      } else {
        context.emit('update:guestMail', '');
      }
      isAllowedNextStep();
    });

    watch(phone, () => {
      context.emit('update:guestPhone', phone.value);
      isAllowedNextStep();
    });

    onMounted(() => {
      context.emit('setIsAllowedNextStep', true);
      if (props.guestPhone) {
        phone.value = props.guestPhone;
      }
      if (props.guestMail) {
        emailRef.value = props.guestMail;
      }

      if (!props.isHiddenMail && !props.isHiddenPhone) {
        titleText.value = t('enter_contact_data_email_phone');
      } else if (props.isHiddenMail) {
        titleText.value = t('enter_contact_data_phone');
      } else if (props.isHiddenPhone) {
        titleText.value = t('enter_contact_data_email');
      }
      if (emailInputRef.value) {
        emailInputRef.value.focus();
      } else if (phoneInputRef.value) {
        phoneInputRef.value.focus();
      }
    });

    return {
      phone,
      emailRef,
      emailInputRef,
      phoneInputRef,
      validator,
      titleText,
      submitForm,
      onEnterEmail,
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
    }
  }

  // subtitle
  .step-subtitle {
    width: 100%;
    font-size: 13px;
    color: #4f4f4f;
    margin: 0 1rem;
  }

  .input-wrap {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    padding: 0 1rem;
    .input-label {
      font-size: 18px;
      color: $primary;
      margin-top: 2rem;
    }
    .input {
      font-size: 20px;
      width: 100%;
      padding: 0.5rem 0;
    }
    input::placeholder {
      color: #cae8f5;
    }
    .input-error {
      color: #982113;
      display: flex;
      align-items: center;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      background-color: #f3e3e3;
      border-radius: 20px;
      align-self: flex-start;
      span {
        margin-left: 10px;
        font-size: 14px;
      }
    }
  }
  .btn-continue-container {
    display: flex;
    justify-content: center;
    .btn-continue {
      width: 160px;
      height: 40px;
      background-color: $primary;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-top: 30px;
      visibility: visible;
      border: none;
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
    }
    .input-wrap {
      width: 500px;
      .input-label {
        font-size: 20px;
      }
      .input {
        font-size: 30px;
      }
      .input-error {
        span {
          font-size: 12px;
        }
      }
    }
    .btn-continue {
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
      margin-top: 30px;
    }
    .empty-div {
      width: 160px;
      height: 40px;
      padding: 0.25rem 0.5rem;
      margin-top: 30px;
    }
  }
}
</style>
