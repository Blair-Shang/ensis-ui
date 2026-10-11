import { setupMonacoWorkers } from 'ensis-ui'
setupMonacoWorkers()

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'ensis-ui/styles.css'
import 'ensis-ui/brand-icons.css'
import './style.css'
import './theme-brand.css'

createApp(App).use(router).mount('#app')
