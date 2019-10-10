
import KRouter from './krouter.js'
import Vue from 'vue'

Vue.use(KRouter)
const router = new KRouter({
  routes: [
    {
      path: '/',
      component: () => import('../src/components/test1.vue')
    },
    {
      path: '/test2',
      component: () => import('../src/components/test2.vue')
    }
  ]
})

export default router
