import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: null,
    // 用户角色：'admin'(总账号) 或 'branch'(分店账号)
    role: '',
    // 认证令牌
    token: '',
    // 客户列表（模拟数据）
    customers: [
      {
        id: '1',
        name: '张三',
        phone: '13800138001',
        balance: 1000,
        createTime: '2023-01-15 10:30:00',
        lastConsumptionTime: '2023-05-20 14:20:00',
        lastRechargeTime: '2023-04-10 11:15:00',
        remark: '高级会员'
      },
      {
        id: '2',
        name: '李四',
        phone: '13900139002',
        balance: 500,
        createTime: '2023-02-20 15:45:00',
        lastConsumptionTime: '2023-05-15 16:30:00',
        lastRechargeTime: '2023-03-25 09:20:00',
        remark: ''
      }
    ],
    // 店铺列表（模拟数据）
    stores: [
      {
        id: '1',
        name: '美丽人生总店',
        phone: '13888888888',
        customerCount: 120,
        createTime: '2022-01-01 08:00:00'
      },
      {
        id: '2',
        name: '美丽人生分店1',
        phone: '13777777777',
        customerCount: 80,
        createTime: '2022-03-15 09:30:00'
      }
    ]
  },
  mutations: {
    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
    },
    // 设置用户角色
    SET_ROLE(state, role) {
      state.role = role
    },
    // 设置认证令牌
    SET_TOKEN(state, token) {
      state.token = token
    },
    // 清除用户信息
    CLEAR_USER(state) {
      state.user = null
      state.role = ''
      state.token = ''
    },
    // 添加客户
    ADD_CUSTOMER(state, customer) {
      state.customers.push(customer)
    },
    // 更新客户
    UPDATE_CUSTOMER(state, customer) {
      const index = state.customers.findIndex(c => c.id === customer.id)
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...customer }
      }
    },
    // 删除客户
    DELETE_CUSTOMER(state, customerId) {
      state.customers = state.customers.filter(c => c.id !== customerId)
    },
    // 添加店铺
    ADD_STORE(state, store) {
      state.stores.push(store)
    },
    // 更新店铺
    UPDATE_STORE(state, store) {
      const index = state.stores.findIndex(s => s.id === store.id)
      if (index !== -1) {
        state.stores[index] = { ...state.stores[index], ...store }
      }
    },
    // 删除店铺
    DELETE_STORE(state, storeId) {
      state.stores = state.stores.filter(s => s.id !== storeId)
    },
    // 添加充值记录
    ADD_RECHARGE(state, { customerId, amount }) {
      const customer = state.customers.find(c => c.id === customerId)
      if (customer) {
        customer.balance += amount
        customer.lastRechargeTime = new Date().toLocaleString()
      }
    },
    // 添加消费记录
    ADD_CONSUMPTION(state, { customerId, amount }) {
      const customer = state.customers.find(c => c.id === customerId)
      if (customer) {
        customer.balance -= amount
        customer.lastConsumptionTime = new Date().toLocaleString()
      }
    }
  },
  actions: {
    // 登录
    login({ commit }, { username }) {
      return new Promise((resolve) => {
        // 模拟登录请求
        setTimeout(() => {
          // 模拟登录成功
          const token = 'mock_token_' + Date.now()
          let user = null
          let role = ''
          
          // 根据用户名判断角色（模拟）
          if (username === 'admin') {
            user = { id: 'admin', name: '管理员', username: 'admin' }
            role = 'admin'
          } else {
            user = { id: 'branch1', name: '分店1管理员', username: 'branch1' }
            role = 'branch'
          }
          
          // 保存到 store
          commit('SET_USER', user)
          commit('SET_ROLE', role)
          commit('SET_TOKEN', token)
          
          // 保存到 localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('role', role)
          localStorage.setItem('user', JSON.stringify(user))
          
          resolve({ user, role })
        }, 1000)
      })
    },
    
    // 退出登录
    logout({ commit }) {
      return new Promise(resolve => {
        // 清除 store 中的用户信息
        commit('CLEAR_USER')
        
        // 清除 localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('user')
        
        resolve()
      })
    },
    
    // 获取客户列表
    getCustomerList({ state }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          resolve(state.customers)
        }, 500)
      })
    },
    
    // 获取客户详情
    getCustomerDetail({ state }, customerId) {
      return new Promise((resolve) => {
        // 模拟请求延迟
        setTimeout(() => {
          const customer = state.customers.find(c => c.id === customerId)
          if (customer) {
            resolve(customer)
          } else {
            resolve(null)
          }
        }, 500)
      })
    },
    
    // 添加客户
    addCustomer({ commit }, customerData) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          const customer = {
            id: Date.now().toString(),
            ...customerData,
            balance: 0,
            createTime: new Date().toLocaleString(),
            lastConsumptionTime: '',
            lastRechargeTime: ''
          }
          commit('ADD_CUSTOMER', customer)
          resolve(customer)
        }, 500)
      })
    },
    
    // 更新客户
    updateCustomer({ commit }, customerData) {
      return new Promise((resolve) => {
        // 模拟请求延迟
        setTimeout(() => {
          commit('UPDATE_CUSTOMER', customerData)
          resolve()
        }, 500)
      })
    },
    
    // 删除客户
    deleteCustomer({ commit }, { customerId }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          commit('DELETE_CUSTOMER', customerId)
          resolve()
        }, 500)
      })
    },
    
    // 获取客户消费记录
    getConsumptionRecords(_, customerId) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          // 模拟消费记录数据
          const records = [
            {
              id: '1',
              customerId,
              amount: 200,
              date: '2023-05-20 14:20:00',
              remark: '面部护理',
              signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAA'
            },
            {
              id: '2',
              customerId,
              amount: 300,
              date: '2023-04-15 11:30:00',
              remark: '全身按摩',
              signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAA'
            }
          ]
          resolve(records)
        }, 500)
      })
    },
    
    // 获取客户充值记录
    getRechargeRecords(_, customerId) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          // 模拟充值记录数据
          const records = [
            {
              id: '1',
              customerId,
              amount: 500,
              date: '2023-04-10 11:15:00',
              remark: '现金充值',
              signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAA'
            },
            {
              id: '2',
              customerId,
              amount: 1000,
              date: '2023-03-05 16:45:00',
              remark: '银行卡充值',
              signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAA'
            }
          ]
          resolve(records)
        }, 500)
      })
    },
    
    // 添加充值记录
    addRecharge({ commit }, { customerId, amount, signature }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          // 更新客户余额
          commit('ADD_RECHARGE', { customerId, amount })
          
          // 模拟充值记录
          const record = {
            id: Date.now().toString(),
            customerId,
            amount,
            date: new Date().toLocaleString(),
            remark: '会员充值',
            signature
          }
          
          resolve(record)
        }, 500)
      })
    },
    
    // 添加消费记录
    addConsumption({ commit }, { customerId, amount, signature }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          // 更新客户余额
          commit('ADD_CONSUMPTION', { customerId, amount })
          
          // 模拟消费记录
          const record = {
            id: Date.now().toString(),
            customerId,
            amount,
            date: new Date().toLocaleString(),
            remark: '会员消费',
            signature
          }
          
          resolve(record)
        }, 500)
      })
    },
    
    // 获取店铺列表
    getStoreList({ state }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          resolve(state.stores)
        }, 500)
      })
    },
    
    // 获取店铺详情
    getStoreDetail({ state }, storeId) {
      return new Promise((resolve) => {
        // 模拟请求延迟
        setTimeout(() => {
          const store = state.stores.find(s => s.id === storeId)
          if (store) {
            // 添加一些额外的统计信息
            const storeDetail = {
              ...store,
              totalBalance: 15000,
              totalRecharge: 25000
            }
            resolve(storeDetail)
          } else {
            resolve(null)
          }
        }, 500)
      })
    },
    
    // 获取店铺客户列表
    getStoreCustomers({ state }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          // 模拟该店铺的客户列表
          const customers = state.customers.slice(0, 5)
          resolve({
            list: customers,
            total: customers.length
          })
        }, 500)
      })
    },
    
    // 添加店铺
    addStore({ commit }, storeData) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          const store = {
            id: Date.now().toString(),
            ...storeData,
            customerCount: 0,
            createTime: new Date().toLocaleString()
          }
          commit('ADD_STORE', store)
          resolve(store)
        }, 500)
      })
    },
    
    // 更新店铺
    updateStore({ commit }, storeData) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          commit('UPDATE_STORE', storeData)
          resolve()
        }, 500)
      })
    },
    
    // 删除店铺
    deleteStore({ commit }, { id }) {
      return new Promise(resolve => {
        // 模拟请求延迟
        setTimeout(() => {
          commit('DELETE_STORE', id)
          resolve()
        }, 500)
      })
    }
  },
  getters: {
    // 是否是管理员角色
    isAdmin: state => state.role === 'admin',
    // 是否是分店角色
    isBranch: state => state.role === 'branch',
    // 用户信息
    userInfo: state => state.user,
    // 是否已登录
    isLoggedIn: state => !!state.token
  },
  modules: {
  }
})