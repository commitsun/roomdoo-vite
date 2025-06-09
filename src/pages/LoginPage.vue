<template>
  <div class="login-page">
    <h1 class="text-2xl font-semibold mb-6 text-center">Welcome Back</h1>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="field">
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <InputText
          id="email"
          v-model="formData.email"
          type="email"
          class="w-full"
          :class="{ 'p-invalid': v$.email.$invalid && v$.email.$dirty }"
          placeholder="Enter your email"
        />
        <small class="p-error" v-if="v$.email.$error">{{ v$.email.$errors[0].$message }}</small>
      </div>

      <div class="field">
        <label for="password" class="block text-sm font-medium mb-1">Password</label>
        <Password
          id="password"
          v-model="formData.password"
          :feedback="false"
          toggleMask
          class="w-full"
          :class="{ 'p-invalid': v$.password.$invalid && v$.password.$dirty }"
          placeholder="Enter your password"
        />
        <small class="p-error" v-if="v$.password.$error">{{
          v$.password.$errors[0].$message
        }}</small>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox v-model="rememberMe" :binary="true" id="remember" />
          <label for="remember" class="ml-2 text-sm">Remember me</label>
        </div>
        <router-link
          to="/login/reset-password"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          Forgot password?
        </router-link>
      </div>

      <Button
        type="submit"
        label="Sign In"
        class="w-full"
        :loading="loading"
        :disabled="v$.$invalid"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';

interface LoginForm {
  email: string;
  password: string;
}

const router = useRouter();
const loading = ref(false);
const rememberMe = ref(false);

const formData = ref<LoginForm>({
  email: '',
  password: '',
});

const rules = {
  email: { required, email },
  password: { required, minLength: minLength(6) },
};

const v$ = useVuelidate(rules, formData);

const handleLogin = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  loading.value = true;
  try {
    // TODO: Implement actual login logic
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  width: 100%;
}

.field {
  margin-bottom: 1rem;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}
</style>
