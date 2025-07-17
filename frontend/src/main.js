import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Router'ı içeri aktar
import { createPinia } from 'pinia'; // Pinia store'u içeri aktar

const app = createApp(App);
const pinia = createPinia(); // Pinia store'u oluştur

app.use(router); // Vue Router'ı kullan
app.use(pinia); // Pinia store'u kullan

app.mount('#app');