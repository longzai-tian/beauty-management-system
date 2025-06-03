<template>
  <div class="customer-detail">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="back-button">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
      <div class="title">客户详情</div>
      <div class="actions">
        <el-button type="primary" size="small" @click="showEditDialog">编辑客户</el-button>
      </div>
    </div>
    
    <!-- 客户基本信息 -->
    <el-card class="info-card">
      <div slot="header" class="card-header">
        <span>基本信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ customer.name }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">手机号：</span>
            <span class="value">{{ customer.phone }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">卡上余额：</span>
            <span class="value balance">¥{{ customer.balance ? customer.balance.toFixed(2) : '0.00' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">生日：</span>
            <span class="value">{{ customer.birthday || '未设置' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ customer.createTime || '未知' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <span class="label">地址：</span>
            <span class="value">{{ customer.address || '未设置' }}</span>
          </div>
        </el-col>
        <el-col :xs="24">
          <div class="info-item">
            <span class="label">备注：</span>
            <span class="value">{{ customer.remark || '无' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 功能卡片 -->
    <div class="function-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="function-card" shadow="hover" @click.native="goToConsumptionRecords">
            <i class="el-icon-shopping-cart-2 icon"></i>
            <div class="function-name">消费记录</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="function-card" shadow="hover" @click.native="goToRechargeRecords">
            <i class="el-icon-wallet icon"></i>
            <div class="function-name">充值记录</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="function-card" shadow="hover" @click.native="goToRecharge">
            <i class="el-icon-plus icon"></i>
            <div class="function-name">充值</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="function-card" shadow="hover" @click.native="goToConsumption">
            <i class="el-icon-minus icon"></i>
            <div class="function-name">消费</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 编辑客户对话框 -->
    <el-dialog title="编辑客户信息" :visible.sync="dialogVisible" width="500px" @closed="resetForm">
      <el-form :model="customerForm" :rules="customerRules" ref="customerForm" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="customerForm.name" placeholder="请输入客户姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="customerForm.phone" placeholder="请输入手机号"></el-input>
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
  </div>
</template>

<script>
export default {
  name: 'CustomerDetail',
  data() {
    return {
      // 客户ID
      customerId: '',
      // 客户信息
      customer: {},
      // 加载状态
      loading: false,
      // 对话框可见性
      dialogVisible: false,
      // 客户表单数据
      customerForm: {
        name: '',
        phone: '',
        address: '',
        birthday: '',
        remark: ''
      },
      // 客户表单验证规则
      customerRules: {
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取客户详情
    getCustomerDetail() {
      this.loading = true
      this.$store.dispatch('getCustomerDetail', this.customerId)
        .then(data => {
          this.customer = data
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取客户详情失败：' + error.message)
          this.loading = false
        })
    },
    // 返回上一页
    goBack() {
      this.$router.go(-1)
    },
    // 处理编辑客户
    handleEdit() {
      // 复制客户数据到表单
      this.customerForm = {
        id: this.customer.id,
        name: this.customer.name,
        phone: this.customer.phone,
        address: this.customer.address || '',
        birthday: this.customer.birthday || '',
        remark: this.customer.remark || ''
      }
      this.dialogVisible = true
    },
    // 提交表单
    submitForm() {
      this.$refs.customerForm.validate(valid => {
        if (valid) {
          // 模拟更新客户
          setTimeout(() => {
            // 更新本地数据
            this.customer = {
              ...this.customer,
              name: this.customerForm.name,
              phone: this.customerForm.phone,
              address: this.customerForm.address,
              birthday: this.customerForm.birthday,
              remark: this.customerForm.remark
            }
            this.$message.success('更新客户成功')
            this.dialogVisible = false
          }, 500)
        }
      })
    },
    // 重置表单
    resetForm() {
      if (this.$refs.customerForm) {
        this.$refs.customerForm.resetFields()
      }
    },
    // 跳转到消费记录页面
    goToConsumptionRecords() {
      this.$router.push(`/customer/consumption/${this.customerId}`)
    },
    // 跳转到充值记录页面
    goToRechargeRecords() {
      this.$router.push(`/customer/recharge/${this.customerId}`)
    },
    // 跳转到充值页面
    goToRecharge() {
      this.$router.push(`/customer/recharge-action/${this.customerId}`)
    },
    // 跳转到消费页面
    goToConsumption() {
      this.$router.push(`/customer/consumption-action/${this.customerId}`)
    }
  },
  created() {
    this.customerId = this.$route.params.id
    if (this.customerId) {
      this.getCustomerDetail()
    } else {
      this.$message.error('客户ID不能为空')
      this.$router.push('/customer/list')
    }
  }
}
</script>

<style scoped>
.customer-detail {
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

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.info-item {
  margin-bottom: 15px;
  line-height: 1.5;
}

.label {
  color: #606266;
  margin-right: 5px;
}

.value {
  font-weight: 500;
}

.balance {
  color: #409EFF;
  font-weight: bold;
}

.function-cards {
  margin-top: 30px;
}

.function-card {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.function-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 36px;
  color: #409EFF;
  margin-bottom: 10px;
}

.function-name {
  font-size: 16px;
  font-weight: 500;
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
}
</style>