import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Đảm bảo import router
import '@mdi/font/css/materialdesignicons.css';



const app = createApp(App)

app.use(router) // Gắn router vào app
app.mount('#app') // Gắn vào DOM

