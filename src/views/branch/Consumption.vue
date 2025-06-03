<template>
  <div class="consumption">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="back-button">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
      <div class="title">客户消费</div>
      <div class="customer-info" v-if="customer.name">
        <span>{{ customer.name }}</span>
        <span class="balance">余额: ¥{{ customer.balance ? customer.balance.toFixed(2) : '0.00' }}</span>
      </div>
    </div>
    
    <!-- 消费表单 -->
    <el-card class="consumption-card" v-loading="loading">
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 30px">
        <el-step title="填写消费金额"></el-step>
        <el-step title="客户签字确认"></el-step>
        <el-step title="完成消费"></el-step>
      </el-steps>
      
      <!-- 步骤1：填写消费金额 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-form :model="consumptionForm" :rules="consumptionRules" ref="consumptionForm" label-width="100px" class="consumption-form">
          <el-form-item label="消费金额" prop="amount">
            <el-input-number v-model="consumptionForm.amount" :min="1" :max="customer.balance || 0" :precision="2" :step="100" style="width: 200px"></el-input-number>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="consumptionForm.remark" placeholder="请输入备注信息"></el-input>
          </el-form-item>
        </el-form>
        <div class="balance-warning" v-if="consumptionForm.amount > (customer.balance || 0)">
          <i class="el-icon-warning"></i> 消费金额不能大于当前余额
        </div>
        <div class="step-actions">
          <el-button type="primary" @click="nextStep" :disabled="consumptionForm.amount > (customer.balance || 0)">下一步</el-button>
        </div>
      </div>
      
      <!-- 步骤2：客户签字 -->
      <div v-if="activeStep === 1" class="step-content">
        <div class="signature-container">
          <div class="signature-title">请客户在下方签字</div>
          <div class="signature-pad-container">
            <canvas ref="signaturePad" class="signature-pad"></canvas>
          </div>
          <div class="signature-actions">
            <el-button type="text" @click="clearSignature">清除签名</el-button>
          </div>
        </div>
        <div class="consumption-summary">
          <div class="summary-item">
            <span class="label">消费金额：</span>
            <span class="value amount">¥{{ consumptionForm.amount.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">消费后余额：</span>
            <span class="value balance">¥{{ (customer.balance - consumptionForm.amount).toFixed(2) }}</span>
          </div>
          <div class="summary-item" v-if="consumptionForm.remark">
            <span class="label">备注：</span>
            <span class="value">{{ consumptionForm.remark }}</span>
          </div>
        </div>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="submitConsumption">确认消费</el-button>
        </div>
      </div>
      
      <!-- 步骤3：完成消费 -->
      <div v-if="activeStep === 2" class="step-content">
        <div class="success-message">
          <i class="el-icon-success success-icon"></i>
          <div class="success-text">消费成功</div>
          <div class="success-detail">
            <p>已成功为 <span class="highlight">{{ customer.name }}</span> 消费 <span class="highlight amount">¥{{ consumptionForm.amount.toFixed(2) }}</span></p>
            <p>当前余额：<span class="highlight balance">¥{{ (customer.balance - consumptionForm.amount).toFixed(2) }}</span></p>
          </div>
        </div>
        <div class="step-actions">
          <el-button @click="goToCustomerDetail">返回客户详情</el-button>
          <el-button type="primary" @click="goToConsumptionRecords">查看消费记录</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import SignaturePad from 'signature_pad'

export default {
  name: 'ConsumptionRecord',
  data() {
    return {
      // 客户ID
      customerId: '',
      // 客户信息
      customer: {},
      // 当前步骤
      activeStep: 0,
      // 签名板实例
      signaturePad: null,
      // 加载状态
      loading: false,
      // 消费表单
      consumptionForm: {
        amount: 100,
        remark: '',
        signature: ''
      },
      // 表单验证规则
      consumptionRules: {
        amount: [
          { required: true, message: '请输入消费金额', trigger: 'blur' },
          { type: 'number', min: 1, message: '消费金额必须大于0', trigger: 'blur' },
          { validator: this.validateAmount, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 验证消费金额
    validateAmount(rule, value, callback) {
      if (value > (this.customer.balance || 0)) {
        callback(new Error('消费金额不能大于当前余额'))
      } else {
        callback()
      }
    },
    // 获取客户信息
    getCustomerInfo() {
      this.loading = true
      this.$store.dispatch('getCustomerDetail', this.customerId)
        .then(data => {
          this.customer = data
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取客户信息失败：' + error.message)
          this.loading = false
        })
    },
    // 初始化签名板
    initSignaturePad() {
      const canvas = this.$refs.signaturePad
      if (canvas) {
        // 设置canvas尺寸
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        
        // 初始化SignaturePad
        this.signaturePad = new SignaturePad(canvas, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(0, 0, 0)'
        })
      }
    },
    // 清除签名
    clearSignature() {
      if (this.signaturePad) {
        this.signaturePad.clear()
      }
    },
    // 下一步
    nextStep() {
      if (this.activeStep === 0) {
        this.$refs.consumptionForm.validate(valid => {
          if (valid) {
            this.activeStep++
            // 在下一步渲染完成后初始化签名板
            this.$nextTick(() => {
              this.initSignaturePad()
            })
          }
        })
      } else {
        this.activeStep++
      }
    },
    // 上一步
    prevStep() {
      this.activeStep--
    },
    // 提交消费
    submitConsumption() {
      if (this.signaturePad && this.signaturePad.isEmpty()) {
        this.$message.warning('请客户签名确认')
        return
      }
      
      // 获取签名数据
      this.consumptionForm.signature = this.signaturePad.toDataURL()
      
      this.loading = true
      // 调用消费接口
      this.$store.dispatch('addConsumption', {
        customerId: this.customerId,
        amount: this.consumptionForm.amount,
        signature: this.consumptionForm.signature
      })
        .then(() => {
          // 更新客户余额
          this.customer.balance -= this.consumptionForm.amount
          this.loading = false
          this.activeStep++
        })
        .catch(error => {
          this.$message.error('消费失败：' + error.message)
          this.loading = false
        })
    },
    // 返回客户详情
    goToCustomerDetail() {
      this.$router.push(`/customer/detail/${this.customerId}`)
    },
    // 查看消费记录
    goToConsumptionRecords() {
      this.$router.push(`/customer/consumption/${this.customerId}`)
    },
    // 返回上一页
    goBack() {
      this.$router.go(-1)
    }
  },
  created() {
    this.customerId = this.$route.params.id
    if (this.customerId) {
      this.getCustomerInfo()
    } else {
      this.$message.error('客户ID不能为空')
      this.$router.push('/customer/list')
    }
  },
  mounted() {
    // 监听窗口大小变化，重新初始化签名板
    window.addEventListener('resize', this.initSignaturePad)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.initSignaturePad)
  }
}
</script>

<style scoped>
.consumption {
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

.customer-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance {
  color: #409EFF;
  font-weight: bold;
  margin-top: 5px;
}

.consumption-card {
  min-height: 500px;
}

.step-content {
  padding: 20px 0;
}

.consumption-form {
  max-width: 500px;
  margin: 0 auto;
}

.balance-warning {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.step-actions {
  margin-top: 30px;
  text-align: center;
}

.signature-container {
  max-width: 600px;
  margin: 0 auto;
}

.signature-title {
  text-align: center;
  margin-bottom: 15px;
  font-size: 16px;
  color: #606266;
}

.signature-pad-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 15px;
}

.signature-pad {
  width: 100%;
  height: 200px;
}

.signature-actions {
  text-align: right;
}

.consumption-summary {
  max-width: 600px;
  margin: 30px auto;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  margin-bottom: 10px;
  line-height: 1.5;
}

.label {
  color: #606266;
  margin-right: 5px;
}

.value {
  font-weight: 500;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}

.success-message {
  text-align: center;
  padding: 30px 0;
}

.success-icon {
  font-size: 60px;
  color: #67c23a;
  margin-bottom: 20px;
}

.success-text {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 20px;
}

.success-detail {
  font-size: 16px;
  line-height: 1.8;
}

.highlight {
  font-weight: bold;
  color: #303133;
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
  
  .customer-info {
    align-items: flex-start;
    margin-top: 10px;
  }
  
  .consumption-form {
    width: 100%;
  }
  
  .signature-pad {
    height: 150px;
  }
}
</style>