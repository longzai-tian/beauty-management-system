<template>
  <div class="store-list">
    <el-card class="store-list-card">
      <div slot="header" class="card-header">
        <span>店铺管理</span>
        <el-button type="primary" size="small" @click="showAddDialog">添加店铺</el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          placeholder="搜索店铺名称或手机号"
          v-model="searchQuery"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter.native="handleSearch">
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
      
      <!-- 店铺列表 -->
      <div class="store-grid" v-loading="loading">
        <el-empty v-if="filteredStores.length === 0" description="暂无店铺数据"></el-empty>
        <el-card 
          v-for="store in filteredStores" 
          :key="store.id" 
          class="store-card"
          shadow="hover"
          @click.native="goToStoreDetail(store.id)">
          <div class="store-info">
            <h3 class="store-name">{{ store.name }}</h3>
            <div class="store-phone">
              <i class="el-icon-phone"></i> {{ store.phone }}
            </div>
            <div class="store-stats">
              <div class="stat-item">
                <span class="stat-label">客户总数</span>
                <span class="stat-value">{{ store.customerCount }}</span>
              </div>
            </div>
          </div>
          <div class="store-actions">
            <el-button type="text" @click.stop="showEditDialog(store)">修改</el-button>
            <el-button type="text" @click.stop="showDeleteDialog(store)">删除</el-button>
            <el-button type="text" @click.stop="goToStoreDetail(store.id)">详情</el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredStores.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[8, 16, 24, 32]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredStores.length">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加店铺对话框 -->
    <el-dialog title="添加店铺" :visible.sync="addDialogVisible" width="500px">
      <el-form :model="storeForm" :rules="storeRules" ref="storeForm" label-width="100px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="storeForm.name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="storeForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="storeForm.password" placeholder="请输入登录密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addStore" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 编辑店铺对话框 -->
    <el-dialog title="编辑店铺" :visible.sync="editDialogVisible" width="500px">
      <el-form :model="storeForm" :rules="storeRules" ref="storeFormEdit" label-width="100px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="storeForm.name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="storeForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="storeForm.password" placeholder="请输入新密码（不修改请留空）" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateStore" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 删除店铺对话框 -->
    <el-dialog title="删除店铺" :visible.sync="deleteDialogVisible" width="500px">
      <div class="delete-warning">
        <i class="el-icon-warning"></i>
        <p>确定要删除店铺 <span class="highlight">{{ currentStore.name }}</span> 吗？</p>
        <p>删除后将无法恢复，请谨慎操作！</p>
      </div>
      <el-form :model="deleteForm" :rules="deleteRules" ref="deleteForm" label-width="100px">
        <el-form-item label="删除原因" prop="reason">
          <el-input type="textarea" v-model="deleteForm.reason" placeholder="请输入删除原因" rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="deleteStore" :loading="submitLoading">确认删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StoreList',
  data() {
    return {
      // 店铺列表
      stores: [],
      // 加载状态
      loading: false,
      // 提交加载状态
      submitLoading: false,
      // 搜索关键词
      searchQuery: '',
      // 分页
      currentPage: 1,
      pageSize: 8,
      // 对话框显示状态
      addDialogVisible: false,
      editDialogVisible: false,
      deleteDialogVisible: false,
      // 当前操作的店铺
      currentStore: {},
      // 店铺表单
      storeForm: {
        name: '',
        phone: '',
        password: ''
      },
      // 删除表单
      deleteForm: {
        reason: ''
      },
      // 店铺表单验证规则
      storeRules: {
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur', validator: this.validatePassword }
        ]
      },
      // 删除表单验证规则
      deleteRules: {
        reason: [
          { required: true, message: '请输入删除原因', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 过滤后的店铺列表
    filteredStores() {
      if (!this.searchQuery) {
        return this.stores
      }
      const query = this.searchQuery.toLowerCase()
      return this.stores.filter(store => {
        return store.name.toLowerCase().includes(query) || 
               store.phone.includes(query)
      })
    },
    // 当前页的店铺
    paginatedStores() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredStores.slice(start, end)
    }
  },
  methods: {
    // 获取店铺列表
    getStoreList() {
      this.loading = true
      this.$store.dispatch('getStoreList')
        .then(data => {
          this.stores = data
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取店铺列表失败：' + error.message)
          this.loading = false
        })
    },
    // 处理搜索
    handleSearch() {
      this.currentPage = 1
    },
    // 处理每页显示数量变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    // 处理页码变化
    handleCurrentChange(page) {
      this.currentPage = page
    },
    // 显示添加对话框
    showAddDialog() {
      this.storeForm = {
        name: '',
        phone: '',
        password: ''
      }
      this.addDialogVisible = true
      this.$nextTick(() => {
        this.$refs.storeForm && this.$refs.storeForm.clearValidate()
      })
    },
    // 显示编辑对话框
    showEditDialog(store) {
      this.currentStore = store
      this.storeForm = {
        id: store.id,
        name: store.name,
        phone: store.phone,
        password: '' // 不回显密码
      }
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.$refs.storeFormEdit && this.$refs.storeFormEdit.clearValidate()
      })
    },
    // 显示删除对话框
    showDeleteDialog(store) {
      this.currentStore = store
      this.deleteForm.reason = ''
      this.deleteDialogVisible = true
      this.$nextTick(() => {
        this.$refs.deleteForm && this.$refs.deleteForm.clearValidate()
      })
    },
    // 验证密码
    validatePassword(rule, value, callback) {
      // 编辑时密码可以为空（表示不修改）
      if (this.editDialogVisible && value === '') {
        callback()
        return
      }
      
      if (value === '') {
        callback(new Error('请输入登录密码'))
        return
      }
      
      if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
        return
      }
      
      callback()
    },
    // 添加店铺
    addStore() {
      this.$refs.storeForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$store.dispatch('addStore', this.storeForm)
            .then(() => {
              this.$message.success('添加店铺成功')
              this.addDialogVisible = false
              this.getStoreList()
              this.submitLoading = false
            })
            .catch(error => {
              this.$message.error('添加店铺失败：' + error.message)
              this.submitLoading = false
            })
        }
      })
    },
    // 更新店铺
    updateStore() {
      this.$refs.storeFormEdit.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$store.dispatch('updateStore', this.storeForm)
            .then(() => {
              this.$message.success('更新店铺成功')
              this.editDialogVisible = false
              this.getStoreList()
              this.submitLoading = false
            })
            .catch(error => {
              this.$message.error('更新店铺失败：' + error.message)
              this.submitLoading = false
            })
        }
      })
    },
    // 删除店铺
    deleteStore() {
      this.$refs.deleteForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$store.dispatch('deleteStore', {
            id: this.currentStore.id,
            reason: this.deleteForm.reason
          })
            .then(() => {
              this.$message.success('删除店铺成功')
              this.deleteDialogVisible = false
              this.getStoreList()
              this.submitLoading = false
            })
            .catch(error => {
              this.$message.error('删除店铺失败：' + error.message)
              this.submitLoading = false
            })
        }
      })
    },
    // 跳转到店铺详情
    goToStoreDetail(storeId) {
      this.$router.push(`/store/detail/${storeId}`)
    }
  },
  created() {
    this.getStoreList()
  }
}
</script>

<style scoped>
.store-list {
  height: 100%;
}

.store-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  max-width: 400px;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  flex: 1;
  min-height: 200px;
}

.store-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.store-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.store-info {
  flex: 1;
}

.store-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.store-phone {
  color: #606266;
  margin-bottom: 15px;
  font-size: 14px;
}

.store-stats {
  display: flex;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  margin-right: 20px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.store-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.pagination-container {
  text-align: right;
  margin-top: 20px;
}

.delete-warning {
  text-align: center;
  margin-bottom: 20px;
}

.delete-warning i {
  font-size: 48px;
  color: #E6A23C;
  margin-bottom: 10px;
}

.delete-warning p {
  margin: 5px 0;
  font-size: 16px;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .store-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header .el-button {
    margin-top: 10px;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>