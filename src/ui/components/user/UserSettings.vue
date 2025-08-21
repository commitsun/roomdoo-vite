<template>
  <div class="user__settings">
    <div class="user__settings--row">
      <div class="user__settings--avatar">
        <Avatar :image="user?.avatar" size="xlarge" shape="circle" />
      </div>
      <div class="user__settings--buttons">
        <div class="user__settings--button">
          <Button label="Reemplazar foto" :style="{ width: '100%', minWidth: '130px' }" />
        </div>
        <div class="user__settings--button">
          <Button label="Eliminar foto" :style="{ width: '100%', minWidth: '130px' }" />
        </div>
      </div>
    </div>
    <div class="user__settings--row">
      <div class="user__settings--field">
        <label class="user__settings--label">Nombre</label>
        <InputText v-model="firstName" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">Apellido</label>
        <InputText v-model="lastName" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">Segundo apellido</label>
        <InputText v-model="secondLastName" />
      </div>
    </div>
    <div class="user__settings--row">
      <div class="user__settings--field">
        <label class="user__settings--label">Teléfono</label>
        <InputText v-model="phone" />
      </div>

      <div class="user__settings--field">
        <label class="user__settings--label">Email</label>
        <InputText v-model="email" />
      </div>

      <div class="user__settings--field" v-if="locales.length > 1">
        <label class="user__settings--label">Idioma</label>
        <Select v-model="language" :options="locales" optionLabel="label" />
      </div>
    </div>
    <div class="user__settings--row">
      <Panel header="Cambiar contraseña" toggleable collapsed :style="{ width: '100%' }">
        <div class="user__settings--field">
          <label class="user__settings--label">Contraseña actual</label>
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="currentPassword"
              :feedback="false"
              toggleMask
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
            />
          </IconField>
        </div>
        <div class="user__settings--field">
          <label class="user__settings--label">Nueva contraseña</label>
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="newPassword"
              :feedback="false"
              toggleMask
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
            />
          </IconField>
        </div>
        <div class="user__settings--field">
          <label class="user__settings--label">repetir contraseña</label>
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="repeatPassword"
              :feedback="false"
              toggleMask
              :style="{ width: '100%' }"
              :inputStyle="{ width: '100%' }"
            />
          </IconField>
        </div>
      </Panel>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useUserStore } from '@/infrastructure/stores/user';
import { i18n, availableLocales } from '@/ui/plugins/i18n';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Panel from 'primevue/panel';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';

export default defineComponent({
  components: {
    Avatar,
    Button,
    InputText,
    Select,
    Panel,
    IconField,
    InputIcon,
    Password,
  },
  setup() {
    const userStore = useUserStore();
    const user = userStore.user;
    const firstName = ref('');
    const lastName = ref('');
    const secondLastName = ref('');
    const phone = ref('');
    const email = ref('');
    const locales = ref(availableLocales);
    const language = ref(locales.value.find((l) => l.value === i18n.global.locale.value));
    const currentPassword = ref('');
    const newPassword = ref('');
    const repeatPassword = ref('');

    onMounted(() => {
      firstName.value = user?.firstName || '';
      lastName.value = user?.lastName || '';
      secondLastName.value = user?.lastName2 || '';
      phone.value = user?.phone || '';
      email.value = user?.email || '';
    });
    return {
      user,
      firstName,
      lastName,
      secondLastName,
      phone,
      email,
      locales,
      language,
      currentPassword,
      newPassword,
      repeatPassword,
    };
  },
});
</script>
<style scoped lang="scss">
.user__settings {
  display: flex;
  flex-direction: column;
  height: 90svh;
  &--row {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  &--avatar {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 1rem;
  }
  &--buttons {
    display: flex;
    gap: 1rem;
    width: 100%;
  }
  &--button {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  &--field {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1rem;
  }
  &--label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
}

@media (min-width: 1024px) {
  .user__settings {
    width: auto;
    height: auto;
    &--row {
      flex-direction: row;
      align-items: center;
    }
    &--avatar {
      width: fit-content;
      margin-bottom: 0;
      margin-right: 1rem;
    }
    &--field {
      margin-right: 0.5rem;
    }
    &--field:last-child {
      margin-right: 0;
    }
    &--button {
      width: fit-content;
      justify-content: start;
    }
  }
}
</style>
