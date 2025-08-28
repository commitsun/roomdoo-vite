// LoginPage.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import { prettyDOM } from '@testing-library/dom';
import Login from './LoginPage.vue';
// Pinia
import { createTestingPinia } from '@pinia/testing';
// PrimeVue + componentes usados por Login
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { i18n } from '@/ui/plugins/i18n';
import router from '@/ui/plugins/router';

// Router de memoria para tests
import { createRouter, createMemoryHistory } from 'vue-router';

// function makeRouter() {
//   return createRouter({
//     history: createMemoryHistory(),
//     routes: [
//       { path: '/', name: 'login', component: Login }, // ruta mínima
//       // añade aquí las rutas a las que navegues desde el login si hace falta
//     ],
//   });
// }

describe('LoginPage', () => {
  it('renders and reacts to click', async () => {
    // const i18n = i18nPlugin();
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn });
    // const router = makeRouter();

    // set i18n english
    i18n.global.locale.value = 'en';

    const { container } = render(Login, {
      global: {
        plugins: [pinia, i18n, router, PrimeVue],
        components: { InputText, Password, Button },
      },
    });

    const btn = screen.getByRole('button', { name: /log in/i });
    console.log(prettyDOM(btn));
    expect(btn).toBeDisabled();
    const inputEmail = screen.getByPlaceholderText('Email');
    console.log(prettyDOM(inputEmail));
    // fill email
    await fireEvent.update(inputEmail, 'test@teast.com');
    expect(btn).toBeDisabled();
    const inputPassword = screen.getByPlaceholderText('Password');
    console.log(prettyDOM(inputPassword));
    // fill password
    await fireEvent.update(inputPassword, '000');
    expect(btn).toBeDisabled();

    // 👉 Matchers robustos:
    // 1) Si hay <h1/2/3> con el título:
    //    usa role heading en vez de texto literal
    // const heading = screen.getByRole('heading', { name: /login/i });
    // expect(heading).toBeInTheDocument();

    // // 2) Inputs por placeholder (traducidos)
    // expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    // expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // // 3) Botón por nombre accesible
    // const btn = screen.getByRole('button', { name: /login/i });
    // await fireEvent.click(btn);

    // Añade aquí la aserción de tu efecto (llamada a store, navegación, etc.)
    // p.ej.: expect(useUserStore().login).toHaveBeenCalled()
    // o si navega: expect(router.currentRoute.value.name).toBe('dashboard')

    // Si vuelve a fallar un query, descomenta para inspeccionar el DOM real:
    // // eslint-disable-next-line no-console
    // console.log(container.innerHTML)
  });
});
