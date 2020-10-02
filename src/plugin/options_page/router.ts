import { createRouter, createWebHashHistory } from 'vue-router'
import Options from './components/Options.vue'

const history = createWebHashHistory()
const routes = [
  { path: '/options', component: Options },
]

export const router = createRouter({
  history,
  routes,
})
