<template>
  <div class="page-container">
    <div class="prev-title">
      Datos {{ currentIndexCheckin + 1
      }}<sup class="sup">{{
        currentIndexCheckin === 0 || currentIndexCheckin === 2 ? 'er' : 'o'
      }}</sup>
      huésped
    </div>
    <div class="step-title">
      <span class="step">
        {{ step }}
        <img src="/app-images/back-arrow-blue.svg" />
      </span>
      <span class="title-text">
        {{ (textTitle as string).charAt(0).toUpperCase() + textTitle.slice(1) }}
        <span class="asterisk">*</span>
      </span>
    </div>
    <span class="step-subtitle"> Introducir {{ textTitle }} </span>
    <div class="input-wrap" v-if="!isHiddenFirstName">
      <span class="input-label"> Nombre </span>
      <InputText
        v-model="firstname"
        @keydown.enter="nextFieldAfterLastNameField()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :isBorder="false"
        textColor="primary"
        :isError="validator.firstname.$errors.length > 0"
        ref="firstnameInputRef"
        class="input-text"
      />
      <div v-if="validator.firstname.$errors.length > 0" class="input-error">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          color="#982113"
          width="12px"
          height="12px"
        />
        <span>
          {{ validator.firstname.$errors[0].$message }}
        </span>
      </div>
    </div>
    <div class="input-wrap" v-if="!isHiddenLastName">
      <span class="input-label"> Primer apellido </span>
      <InputText
        v-model="lastname"
        @keydown.enter="nextFieldAfterFirstNameField()"
        @keydown.esc="$emit('closeCheckinFlow')"
        :isBorder="false"
        textColor="primary"
        :isError="validator.lastname.$errors.length > 0"
        ref="lastnameInputRef"
        class="input-text"
      />
      <div v-if="validator.lastname.$errors.length > 0" class="input-error">
        <CustomIcon
          :imagePath="'/app-images/icon-alert.svg'"
          :color="'#982113'"
          :width="'12px'"
          :height="'12px'"
        />
        <span>
          {{ validator.lastname.$errors[0].$message }}
        </span>
      </div>
    </div>

    <div class="input-wrap" v-if="(!isHiddenLastName2 && isSpanishGuest) || isUnderFourteen">
      <span class="input-label"> Segundo apellido </span>
      <InputText
        v-model="lastname2"
        @keydown.enter="nextStep"
        @keydown.esc="$emit('closeCheckinFlow')"
        :isBorder="false"
        textColor="primary"
        :isError="validator.lastname2.$errors.length > 0"
        ref="lastname2InputRef"
        class="input-text"
      />
      <div v-if="validator.lastname2.$errors.length > 0" class="input-error">
        <CustomIcon
          :imagePath="'/app-images/icon-alert.svg'"
          :color="'#982113'"
          :width="'12px'"
          :height="'12px'"
        />
        <span>
          {{ validator.lastname2.$errors[0].$message }}
        </span>
      </div>
    </div>
    <div class="btn-continue-container">
      <button class="btn-continue" @click="nextStep()" v-if="!validator.$invalid">Aceptar</button>
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
import { required, requiredIf, helpers } from '@vuelidate/validators';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import InputText from '@/legacy/components/roomdooComponents/InputText.vue';

export default defineComponent({
  components: {
    CustomIcon,
    InputText,
  },
  props: {
    isSpanishGuest: {
      type: Boolean,
      required: true,
    },
    guestFirstname: {
      type: String,
      required: true,
    },
    guestLastname: {
      type: String,
      required: true,
    },
    guestLastname2: {
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
    isHiddenFirstName: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHiddenLastName: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHiddenLastName2: {
      type: Boolean,
      required: false,
      default: false,
    },
    isUnderFourteen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props, context) {
    let hasEmittedNext = false;
    const firstname = ref('');
    const lastname = ref('');
    const lastname2 = ref('');
    const textTitle = ref('');

    const validationRules = computed(() => ({
      firstname: {
        required: helpers.withMessage('El nombre es obligatorio', required),
      },
      lastname: {
        required: helpers.withMessage('El apellido es obligatorio', required),
      },
      lastname2: {
        required: helpers.withMessage(
          'El 2º apellido es obligatorio',
          requiredIf(props.isSpanishGuest)
        ),
      },
    }));

    const validator = useVuelidate(validationRules, {
      firstname,
      lastname,
      lastname2,
    });

    const canProceedToNextStep = computed(() => {
      const hasNames = firstname.value !== '' && lastname.value !== '';
      const validSpanishGuest = props.isSpanishGuest ? lastname2.value !== '' : true;
      const isValid = !validator.value.$invalid;

      return hasNames && validSpanishGuest && isValid;
    });

    const firstnameInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const lastnameInputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);
    const lastname2InputRef: Ref<ComponentPublicInstance<HTMLInputElement> | null> = ref(null);

    const nextStep = () => {
      validator.value.$touch();
      if (validator.value.$errors.length > 0) {
        return;
      }
      if (!hasEmittedNext) {
        hasEmittedNext = true;
        context.emit('next');
        context.emit('persistCheckinPartner');
      }
    };

    const nextFieldAfterLastNameField = () => {
      if (!props.isHiddenLastName) {
        lastnameInputRef.value?.focus();
      } else if (!props.isHiddenLastName2) {
        lastname2InputRef.value?.focus();
      } else {
        nextStep();
      }
    };

    const nextFieldAfterFirstNameField = () => {
      if (!props.isHiddenLastName2) {
        if (lastname2InputRef.value) {
          lastname2InputRef.value?.focus();
        } else {
          nextStep();
        }
      }
    };

    watch(firstname, () => {
      if (validator.value.firstname.$errors.length === 0) {
        context.emit('update:guestFirstname', firstname.value);
      } else {
        context.emit('update:guestFirstname', '');
      }
    });

    watch(lastname, () => {
      if (validator.value.lastname.$errors.length === 0) {
        context.emit('update:guestLastname', lastname.value);
      } else {
        context.emit('update:guestLastname', '');
      }
    });

    watch(lastname2, () => {
      if (validator.value.lastname2.$errors.length === 0) {
        context.emit('update:guestLastname2', lastname2.value);
      } else {
        context.emit('update:guestLastname2', '');
      }
    });

    watch(canProceedToNextStep, (value) => {
      if (value) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
    });

    onMounted(() => {
      // allow next step or not
      if (
        props.guestFirstname !== '' &&
        props.guestLastname !== '' &&
        ((props.guestLastname2 && props.isSpanishGuest) || !props.isSpanishGuest)
      ) {
        context.emit('setIsAllowedNextStep', true);
      } else {
        context.emit('setIsAllowedNextStep', false);
      }
      // load model values
      if (props.guestFirstname !== '') {
        firstname.value = props.guestFirstname;
      }
      if (props.guestLastname !== '') {
        lastname.value = props.guestLastname;
      }
      if (props.guestLastname2 !== '') {
        lastname2.value = props.guestLastname2;
      }

      if (!props.isHiddenFirstName && !props.isHiddenLastName && !props.isHiddenLastName2) {
        textTitle.value = 'nombre y apellidos';
      } else if (!props.isHiddenFirstName && props.isHiddenLastName && props.isHiddenLastName2) {
        textTitle.value = 'nombre';
      } else if (props.isHiddenFirstName && !props.isHiddenLastName && !props.isHiddenLastName2) {
        textTitle.value = 'apellidos';
      } else if (props.isHiddenFirstName && !props.isHiddenLastName && props.isHiddenLastName2) {
        textTitle.value = 'primer apellido';
      } else if (props.isHiddenFirstName && props.isHiddenLastName && !props.isHiddenLastName2) {
        textTitle.value = 'segundo apellido';
      } else if (!props.isHiddenFirstName && props.isHiddenLastName && !props.isHiddenLastName2) {
        textTitle.value = 'nombre y segundo apellido';
      }
      if (firstnameInputRef.value) {
        firstnameInputRef.value.focus();
      } else if (lastnameInputRef.value) {
        lastnameInputRef.value.focus();
      } else if (lastname2InputRef.value) {
        lastname2InputRef.value.focus();
      }
    });

    return {
      textTitle,
      firstname,
      lastname,
      lastname2,
      firstnameInputRef,
      lastnameInputRef,
      lastname2InputRef,
      nextFieldAfterLastNameField,
      nextFieldAfterFirstNameField,
      nextStep,
      validator,
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
    .input-text {
      width: 100%;
      font-size: 20px;
      color: $primary;
      padding: 0.5rem 0;
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
  .empty-div {
    width: 160px;
    height: 40px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
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
      input {
        width: 100%;
        font-size: 30px;
      }
      .input-text {
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
