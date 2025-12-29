import { createApp } from 'vue'
import './assets/styles/global.css'
import App from './App.vue'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, _instance, info) => {
  console.error('Component error:', err)
  console.error('Error info:', info)
}

app.mount('#app')
