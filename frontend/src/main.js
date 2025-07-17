import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Router'ı içeri aktar

const app = createApp(App);

app.use(router); // Vue Router'ı kullan

app.mount('#app');