import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api', // API的基础URL
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      // 让每个请求携带token
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    // 如果返回的状态码不是200，说明接口有问题，需要处理错误
    if (res.code !== 200) {
      // 根据不同的错误码处理不同的错误
      if (res.code === 401) {
        // 401: 未登录或token过期
        // 清除本地token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('userRole')
        // 跳转到登录页
        location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '未知错误'))
    } else {
      return res
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// API请求方法
export default {
  // 登录
  login(data) {
    return service({
      url: '/user/login',
      method: 'post',
      data
    })
  },
  // 登出
  logout() {
    return service({
      url: '/user/logout',
      method: 'post'
    })
  },
  // 获取客户列表
  getCustomerList() {
    return service({
      url: '/customer/list',
      method: 'get'
    })
  },
  // 获取客户详情
  getCustomerDetail(id) {
    return service({
      url: `/customer/detail/${id}`,
      method: 'get'
    })
  },
  // 添加客户
  addCustomer(data) {
    return service({
      url: '/customer/add',
      method: 'post',
      data
    })
  },
  // 更新客户信息
  updateCustomer(data) {
    return service({
      url: '/customer/update',
      method: 'put',
      data
    })
  },
  // 删除客户
  deleteCustomer(id, reason) {
    return service({
      url: `/customer/delete/${id}`,
      method: 'delete',
      data: { reason }
    })
  },
  // 获取消费记录
  getConsumptionRecords(customerId, params) {
    return service({
      url: `/consumption/list/${customerId}`,
      method: 'get',
      params
    })
  },
  // 添加消费记录
  addConsumption(data) {
    return service({
      url: '/consumption/add',
      method: 'post',
      data
    })
  },
  // 获取充值记录
  getRechargeRecords(customerId, params) {
    return service({
      url: `/recharge/list/${customerId}`,
      method: 'get',
      params
    })
  },
  // 添加充值记录
  addRecharge(data) {
    return service({
      url: '/recharge/add',
      method: 'post',
      data
    })
  },
  // 获取店铺列表
  getStoreList() {
    return service({
      url: '/store/list',
      method: 'get'
    })
  },
  // 获取店铺详情
  getStoreDetail(id) {
    return service({
      url: `/store/detail/${id}`,
      method: 'get'
    })
  },
  // 添加店铺
  addStore(data) {
    return service({
      url: '/store/add',
      method: 'post',
      data
    })
  },
  // 更新店铺信息
  updateStore(data) {
    return service({
      url: '/store/update',
      method: 'put',
      data
    })
  },
  // 删除店铺
  deleteStore(id, reason) {
    return service({
      url: `/store/delete/${id}`,
      method: 'delete',
      data: { reason }
    })
  }
}