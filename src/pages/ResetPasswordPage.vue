<template>
  <div class="reset-password-page">
    <h1 class="text-2xl font-semibold mb-6 text-center">Reset Password</h1>
    <p class="text-gray-600 mb-6 text-center">
      Enter your email address and we'll send you instructions to reset your password.
    </p>
    <form @submit.prevent="handleResetRequest" class="space-y-4">
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

      <Button
        type="submit"
        label="Send Reset Instructions"
        class="w-full"
        :loading="loading"
        :disabled="v$.$invalid"
      />

      <div class="text-center mt-4">
        <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-700">
          Back to Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

interface ResetForm {
  email: string;
}

const router = useRouter();
const loading = ref(false);

const formData = ref<ResetForm>({
  email: '',
});

const rules = {
  email: { required, email },
};

const v$ = useVuelidate(rules, formData);

const handleResetRequest = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  loading.value = true;
  try {
    // TODO: Implement actual password reset request logic
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
    // Show success message or redirect
  } catch (error) {
    console.error('Reset request failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-password-page {
  width: 100%;
}

.field {
  margin-bottom: 1rem;
}
</style>
