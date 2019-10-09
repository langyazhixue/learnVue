import KRouter from './krouter'
import Vue from 'vue'

Vue.use(KRouter)

export default new KRouter({
  routes: [
    {
      path: '/',
      component: () => import('@/views/functional/index')
    }, {
      path: '/',
      component: () => import('@/views/render/index')
    }
  ]
})
