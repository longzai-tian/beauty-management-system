import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    redirect: '/customer/list',
    children: [
      // 分店账号路由
      {
        path: '/customer/list',
        name: 'CustomerList',
        component: () => import('../views/branch/CustomerList.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      {
        path: '/customer/detail/:id',
        name: 'CustomerDetail',
        component: () => import('../views/branch/CustomerDetail.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      {
        path: '/customer/consumption/:id',
        name: 'ConsumptionRecord',
        component: () => import('../views/branch/ConsumptionRecord.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      {
        path: '/customer/recharge/:id',
        name: 'RechargeRecord',
        component: () => import('../views/branch/RechargeRecord.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      {
        path: '/customer/recharge-action/:id',
        name: 'Recharge',
        component: () => import('../views/branch/Recharge.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      {
        path: '/customer/consumption-action/:id',
        name: 'Consumption',
        component: () => import('../views/branch/Consumption.vue'),
        meta: { requiresAuth: true, role: 'branch' }
      },
      
      // 总账号路由
      {
        path: '/store/list',
        name: 'StoreList',
        component: () => import('../views/admin/StoreList.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: '/store/detail/:id',
        name: 'StoreDetail',
        component: () => import('../views/admin/StoreDetail.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 从 store 获取登录状态
    const isLoggedIn = localStorage.getItem('token') || false
    const userRole = localStorage.getItem('role') || ''
    
    if (!isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 检查用户角色权限
      const requiredRole = to.meta.role
      if (requiredRole && requiredRole !== userRole) {
        // 角色不匹配，重定向到对应角色的首页
        if (userRole === 'admin') {
          next({ path: '/store/list' })
        } else {
          next({ path: '/customer/list' })
        }
      } else {
        // 认证通过，继续导航
        next()
      }
    }
  } else {
    // 不需要认证的路由，直接通过
    next()
  }
})

export default router