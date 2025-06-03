<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div class="header-left">
        <div class="logo">美容院管理系统</div>
      </div>
      <div class="header-right">
        <span class="welcome" v-if="userInfo">欢迎您，{{ userInfo.name }}</span>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
          unique-opened>
          
          <!-- 分店账号菜单 -->
          <template v-if="$store.getters.isBranch">
            <el-menu-item index="/customer/list">
              <i class="el-icon-user"></i>
              <span slot="title">客户管理</span>
            </el-menu-item>
          </template>
          
          <!-- 总账号菜单 -->
          <template v-if="$store.getters.isAdmin">
            <el-menu-item index="/store/list">
              <i class="el-icon-office-building"></i>
              <span slot="title">店铺管理</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <!-- 内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'HomePage',
  computed: {
    // 用户信息
    userInfo() {
      return this.$store.getters.userInfo
    },
    // 当前激活的菜单
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    // 处理下拉菜单命令
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      }
    },
    // 退出登录
    logout() {
      this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout').then(() => {
          this.$router.push('/login')
          this.$message.success('退出登录成功')
        })
      }).catch(() => {
        // 取消退出
      })
    }
  },
  // 如果未登录，跳转到登录页
  created() {
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100%;
  width: 100%;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
}

.welcome {
  margin-right: 15px;
  font-size: 14px;
}

.el-dropdown-link {
  cursor: pointer;
  font-size: 20px;
  color: #409EFF;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
  overflow: hidden;
}

.el-menu-vertical {
  border-right: none;
  height: 100%;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .el-aside {
    width: 64px !important;
  }
  
  .el-menu-vertical {
    width: 64px !important;
  }
  
  .el-menu--collapse {
    width: 64px !important;
  }
  
  .welcome {
    display: none;
  }
}
</style>