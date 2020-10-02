import { createRouter, createWebHashHistory } from 'vue-router'
import Options from './components/Options.vue'
import Popup from './components/Popup.vue'

const history = createWebHashHistory()
const routes = [
  { path: '/options', component: Options },
  { path: '/popup', component: Popup },
]

export const router = createRouter({
  history,
  routes,
})
