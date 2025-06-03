<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">美容院管理系统</div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ]
      },
      // 登录按钮loading状态
      loading: false
    }
  },
  methods: {
    // 处理登录
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 调用Vuex的登录action
          this.$store.dispatch('login', this.loginForm)
            .then(() => {
              this.loading = false
              // 根据角色跳转到对应的页面
              const role = localStorage.getItem('role')
              const targetPath = role === 'admin' ? '/store/list' : '/customer/list'
              if (this.$route.path !== targetPath) {
                this.$router.push(targetPath)
              }
              this.$message.success('登录成功')
            })
            .catch(err => {
              this.loading = false
              this.$message.error('登录失败：' + err.message)
            })
        }
      })
    }
  },
  // 如果已登录，直接跳转到对应角色的首页
  created() {
    // 通过检查localStorage中的token来判断是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      // 根据角色跳转到对应的页面
      const role = localStorage.getItem('role')
      const targetPath = role === 'admin' ? '/store/list' : '/customer/list'
      if (this.$route.path !== targetPath) {
        this.$router.push(targetPath)
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  background-color: #2d3a4b;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .login-box {
    width: 90%;
    padding: 20px;
  }
}
</style>