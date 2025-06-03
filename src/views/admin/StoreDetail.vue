<template>
  <div class="store-detail">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="back-button">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
      <div class="title">店铺详情</div>
      <div class="actions">
        <el-button type="primary" size="small" @click="showEditDialog">编辑店铺</el-button>
      </div>
    </div>
    
    <!-- 店铺详情卡片 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <el-card class="store-info-card">
          <div slot="header" class="card-header">
            <span>基本信息</span>
          </div>
          <div class="store-info">
            <div class="store-avatar">
              <el-avatar :size="80" icon="el-icon-s-shop"></el-avatar>
            </div>
            <h2 class="store-name">{{ store.name }}</h2>
            <div class="info-item">
              <span class="label">手机号：</span>
              <span class="value">{{ store.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ store.createTime }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <el-card class="store-stats-card">
          <div slot="header" class="card-header">
            <span>统计信息</span>
          </div>
          <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="8">
              <div class="stat-card">
                <div class="stat-icon customer-icon">
                  <i class="el-icon-user"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ store.customerCount || 0 }}</div>
                  <div class="stat-label">累计客户数</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <div class="stat-card">
                <div class="stat-icon balance-icon">
                  <i class="el-icon-money"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ formatCurrency(store.totalBalance) }}</div>
                  <div class="stat-label">累计会员余额</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <div class="stat-card">
                <div class="stat-icon recharge-icon">
                  <i class="el-icon-top"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ formatCurrency(store.totalRecharge) }}</div>
                  <div class="stat-label">累计充值金额</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 客户增长趋势图 -->
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>客户增长趋势</span>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="week">近一周</el-radio-button>
              <el-radio-button label="month">近一月</el-radio-button>
              <el-radio-button label="year">近一年</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container">
            <!-- 这里可以集成图表库如ECharts来展示数据 -->
            <div class="chart-placeholder">
              <i class="el-icon-data-line"></i>
              <p>客户增长趋势图</p>
              <p class="chart-note">（实际项目中可集成ECharts等图表库）</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 客户列表 -->
    <el-card class="customer-list-card">
      <div slot="header" class="card-header">
        <span>客户列表</span>
        <div class="header-actions">
          <el-input
            placeholder="搜索客户名称或手机号"
            v-model="searchQuery"
            class="search-input"
            clearable
            @clear="handleSearch"
            @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </div>
      </div>
      
      <el-table
        :data="filteredCustomers"
        style="width: 100%"
        v-loading="customersLoading"
        border>
        <el-table-column
          prop="name"
          label="客户名称"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="balance"
          label="卡上余额"
          min-width="120">
          <template slot-scope="scope">
            <span class="balance-text">¥{{ formatCurrency(scope.row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          min-width="180">
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewCustomerDetail(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredCustomers.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCustomers">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 编辑店铺对话框 -->
    <el-dialog title="编辑店铺" :visible.sync="editDialogVisible" width="500px">
      <el-form :model="storeForm" :rules="storeRules" ref="storeForm" label-width="100px">
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
  </div>
</template>

<script>
export default {
  name: 'StoreDetail',
  data() {
    return {
      // 店铺ID
      storeId: '',
      // 店铺信息
      store: {},
      // 客户列表
      customers: [],
      // 加载状态
      loading: false,
      customersLoading: false,
      submitLoading: false,
      // 搜索关键词
      searchQuery: '',
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCustomers: 0,
      // 图表时间范围
      chartTimeRange: 'month',
      // 对话框显示状态
      editDialogVisible: false,
      // 店铺表单
      storeForm: {
        name: '',
        phone: '',
        password: ''
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
        ]
      }
    }
  },
  computed: {
    // 过滤后的客户列表
    filteredCustomers() {
      if (!this.searchQuery) {
        return this.customers
      }
      const query = this.searchQuery.toLowerCase()
      return this.customers.filter(customer => {
        return customer.name.toLowerCase().includes(query) || 
               customer.phone.includes(query)
      })
    }
  },
  methods: {
    // 获取店铺详情
    getStoreDetail() {
      this.loading = true
      this.$store.dispatch('getStoreDetail', this.storeId)
        .then(data => {
          this.store = data
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取店铺详情失败：' + error.message)
          this.loading = false
        })
    },
    // 获取店铺客户列表
    getStoreCustomers() {
      this.customersLoading = true
      this.$store.dispatch('getStoreCustomers', {
        storeId: this.storeId,
        page: this.currentPage,
        pageSize: this.pageSize,
        query: this.searchQuery
      })
        .then(data => {
          this.customers = data.list
          this.totalCustomers = data.total
          this.customersLoading = false
        })
        .catch(error => {
          this.$message.error('获取客户列表失败：' + error.message)
          this.customersLoading = false
        })
    },
    // 处理搜索
    handleSearch() {
      this.currentPage = 1
      this.getStoreCustomers()
    },
    // 处理每页显示数量变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getStoreCustomers()
    },
    // 处理页码变化
    handleCurrentChange(page) {
      this.currentPage = page
      this.getStoreCustomers()
    },
    // 显示编辑对话框
    showEditDialog() {
      this.storeForm = {
        id: this.store.id,
        name: this.store.name,
        phone: this.store.phone,
        password: '' // 不回显密码
      }
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.$refs.storeForm && this.$refs.storeForm.clearValidate()
      })
    },
    // 更新店铺
    updateStore() {
      this.$refs.storeForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$store.dispatch('updateStore', this.storeForm)
            .then(() => {
              this.$message.success('更新店铺成功')
              this.editDialogVisible = false
              this.getStoreDetail()
              this.submitLoading = false
            })
            .catch(error => {
              this.$message.error('更新店铺失败：' + error.message)
              this.submitLoading = false
            })
        }
      })
    },
    // 查看客户详情
    viewCustomerDetail(customerId) {
      this.$router.push(`/customer/detail/${customerId}`)
    },
    // 返回上一页
    goBack() {
      this.$router.push('/store/list')
    },
    // 格式化货币
    formatCurrency(value) {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }
  },
  created() {
    this.storeId = this.$route.params.id
    if (this.storeId) {
      this.getStoreDetail()
      this.getStoreCustomers()
    } else {
      this.$message.error('店铺ID不能为空')
      this.$router.push('/store/list')
    }
  },
  watch: {
    // 监听图表时间范围变化
    chartTimeRange() {
      // 在实际项目中，这里可以重新请求图表数据
      console.log('图表时间范围变更为：', this.chartTimeRange)
    }
  }
}
</script>

<style scoped>
.store-detail {
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.store-info-card,
.store-stats-card,
.chart-card,
.customer-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-info {
  text-align: center;
}

.store-avatar {
  margin-bottom: 15px;
}

.store-name {
  margin: 10px 0;
  font-size: 20px;
  color: #303133;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  text-align: left;
}

.label {
  color: #909399;
}

.value {
  color: #606266;
  font-weight: 500;
}

.stats-row {
  margin-bottom: 0 !important;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 30px;
  color: #fff;
}

.customer-icon {
  background-color: #409EFF;
}

.balance-icon {
  background-color: #67C23A;
}

.recharge-icon {
  background-color: #E6A23C;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.chart-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.chart-note {
  font-size: 12px;
  margin-top: 5px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.search-input {
  width: 250px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.balance-text {
  color: #67C23A;
  font-weight: bold;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .back-button {
    margin-bottom: 10px;
  }
  
  .title {
    margin-bottom: 10px;
  }
  
  .actions {
    margin-top: 10px;
    align-self: flex-end;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header .el-radio-group {
    margin-top: 10px;
  }
  
  .search-input {
    width: 100%;
    margin-top: 10px;
  }
  
  .chart-container {
    height: 200px;
  }
}
</style>