<template>
  <div class="customer-list">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title">客户管理</div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAddCustomer">添加客户</el-button>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        placeholder="请输入客户名称或手机号"
        v-model="searchQuery"
        class="search-input"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>
    
    <!-- 客户列表 -->
    <div class="customer-cards" v-loading="loading">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="customer in filteredCustomers" :key="customer.id">
          <el-card class="customer-card" shadow="hover" @click.native="handleCardClick(customer)">
            <div class="customer-info">
              <div class="customer-name">{{ customer.name }}</div>
              <div class="customer-phone">{{ customer.phone }}</div>
              <div class="customer-balance">余额: ¥{{ customer.balance.toFixed(2) }}</div>
            </div>
            <div class="customer-actions">
              <el-button type="text" icon="el-icon-delete" @click.stop="handleDelete(customer)">删除</el-button>
              <el-button type="text" icon="el-icon-edit" @click.stop="handleEdit(customer)">修改</el-button>
              <el-button type="text" icon="el-icon-view" @click.stop="handleView(customer)">详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 空数据提示 -->
      <el-empty v-if="filteredCustomers.length === 0" description="暂无客户数据"></el-empty>
    </div>
    
    <!-- 添加/编辑客户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @closed="resetForm">
      <el-form :model="customerForm" :rules="customerRules" ref="customerForm" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="customerForm.name" placeholder="请输入客户姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="customerForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="余额" prop="balance" v-if="dialogType === 'add'">
          <el-input-number v-model="customerForm.balance" :min="0" :precision="2" :step="100"></el-input-number>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="customerForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="customerForm.birthday" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="customerForm.remark" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog title="删除客户" :visible.sync="deleteDialogVisible" width="500px">
      <div class="delete-confirm">
        <p>确定要删除客户 <span class="highlight">{{ currentCustomer.name }}</span> 吗？</p>
        <p>删除后将无法恢复，请谨慎操作。</p>
        <el-form :model="deleteForm" :rules="deleteRules" ref="deleteForm">
          <el-form-item label="删除原因" prop="reason">
            <el-input type="textarea" v-model="deleteForm.reason" placeholder="请输入删除原因"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomerList',
  data() {
    return {
      // 客户列表
      customers: [],
      // 加载状态
      loading: false,
      // 搜索关键词
      searchQuery: '',
      // 对话框类型：add-添加，edit-编辑
      dialogType: 'add',
      // 对话框可见性
      dialogVisible: false,
      // 删除对话框可见性
      deleteDialogVisible: false,
      // 当前操作的客户
      currentCustomer: {},
      // 客户表单数据
      customerForm: {
        name: '',
        phone: '',
        balance: 0,
        address: '',
        birthday: '',
        remark: ''
      },
      // 删除表单
      deleteForm: {
        reason: ''
      },
      // 客户表单验证规则
      customerRules: {
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        balance: [
          { required: true, message: '请输入余额', trigger: 'blur' }
        ]
      },
      // 删除表单验证规则
      deleteRules: {
        reason: [
          { required: true, message: '请输入删除原因', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 对话框标题
    dialogTitle() {
      return this.dialogType === 'add' ? '添加客户' : '编辑客户'
    },
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
    // 获取客户列表
    getCustomerList() {
      this.loading = true
      this.$store.dispatch('getCustomerList')
        .then(list => {
          this.customers = list
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取客户列表失败：' + error.message)
          this.loading = false
        })
    },
    // 处理搜索
    handleSearch() {
      // 搜索逻辑已在计算属性中实现
    },
    // 处理添加客户
    handleAddCustomer() {
      this.dialogType = 'add'
      this.dialogVisible = true
    },
    // 处理编辑客户
    handleEdit(customer) {
      this.dialogType = 'edit'
      this.currentCustomer = customer
      // 复制客户数据到表单
      this.customerForm = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        birthday: customer.birthday || '',
        remark: customer.remark || ''
      }
      this.dialogVisible = true
    },
    // 处理查看客户详情
    handleView(customer) {
      this.$router.push(`/customer/detail/${customer.id}`)
    },
    // 处理删除客户
    handleDelete(customer) {
      this.currentCustomer = customer
      this.deleteForm.reason = ''
      this.deleteDialogVisible = true
    },
    // 确认删除客户
    confirmDelete() {
      this.$refs.deleteForm.validate(valid => {
        if (valid) {
          // 模拟删除操作
          setTimeout(() => {
            this.customers = this.customers.filter(item => item.id !== this.currentCustomer.id)
            this.$message.success('删除成功')
            this.deleteDialogVisible = false
          }, 500)
        }
      })
    },
    // 提交表单
    submitForm() {
      this.$refs.customerForm.validate(valid => {
        if (valid) {
          if (this.dialogType === 'add') {
            // 模拟添加客户
            const newCustomer = {
              id: 'c' + Date.now(),
              ...this.customerForm,
              createTime: new Date().toISOString().split('T')[0]
            }
            this.customers.unshift(newCustomer)
            this.$message.success('添加客户成功')
          } else {
            // 模拟更新客户
            const index = this.customers.findIndex(item => item.id === this.currentCustomer.id)
            if (index !== -1) {
              // 保持余额不变
              this.customers[index] = {
                ...this.customers[index],
                name: this.customerForm.name,
                phone: this.customerForm.phone,
                address: this.customerForm.address,
                birthday: this.customerForm.birthday,
                remark: this.customerForm.remark
              }
              this.$message.success('更新客户成功')
            }
          }
          this.dialogVisible = false
        }
      })
    },
    // 重置表单
    resetForm() {
      if (this.$refs.customerForm) {
        this.$refs.customerForm.resetFields()
      }
      this.customerForm = {
        name: '',
        phone: '',
        balance: 0,
        address: '',
        birthday: '',
        remark: ''
      }
    },
    // 处理卡片点击
    handleCardClick(customer) {
      this.$router.push(`/customer/detail/${customer.id}`)
    }
  },
  created() {
    this.getCustomerList()
  }
}
</script>

<style scoped>
.customer-list {
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

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.customer-cards {
  margin-top: 20px;
}

.customer-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.customer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.customer-info {
  margin-bottom: 15px;
}

.customer-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.customer-phone {
  color: #666;
  margin-bottom: 5px;
}

.customer-balance {
  color: #409EFF;
  font-weight: bold;
}

.customer-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.delete-confirm .highlight {
  color: #f56c6c;
  font-weight: bold;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .customer-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .customer-actions .el-button {
    margin-bottom: 5px;
  }
}
</style>