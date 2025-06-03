import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css' // 全局样式
import api from './api' // API请求

// 注册Element UI
Vue.use(ElementUI, { size: 'small' })

// 挂载API到Vue原型
Vue.prototype.$api = api

// 生产环境提示
Vue.config.productionTip = false

// 创建Vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
