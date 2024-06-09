import { createApp } from 'vue'
import App from './App.vue'
import supportChat from "@/components/SupportChat.vue";

const app = createApp(App)
app.component('support-chat', supportChat)
app.mount('#app')
