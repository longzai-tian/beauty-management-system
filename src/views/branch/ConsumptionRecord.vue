<template>
  <div class="consumption-record">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="back-button">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
      <div class="title">消费记录</div>
      <div class="customer-info" v-if="customer.name">
        <span>{{ customer.name }}</span>
        <span class="balance">余额: ¥{{ customer.balance ? customer.balance.toFixed(2) : '0.00' }}</span>
      </div>
    </div>
    
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="消费时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 消费记录列表 -->
    <el-card class="record-card" v-loading="loading">
      <el-table
        :data="records"
        style="width: 100%"
        border
        stripe>
        <el-table-column
          prop="date"
          label="消费日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="amount"
          label="消费金额"
          width="150">
          <template slot-scope="scope">
            <span class="amount">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注">
        </el-table-column>
        <el-table-column
          label="客户签字"
          width="150">
          <template slot-scope="scope">
            <el-popover
              placement="right"
              trigger="hover">
              <div class="signature-preview">
                <img :src="scope.row.signature" alt="签名" class="signature-img">
              </div>
              <el-button slot="reference" type="text">查看签名</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空数据提示 -->
      <el-empty v-if="records.length === 0" description="暂无消费记录"></el-empty>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ConsumptionRecord',
  data() {
    return {
      // 客户ID
      customerId: '',
      // 客户信息
      customer: {},
      // 消费记录
      records: [],
      // 加载状态
      loading: false,
      // 搜索表单
      searchForm: {
        dateRange: null
      }
    }
  },
  methods: {
    // 获取客户信息
    getCustomerInfo() {
      this.$store.dispatch('getCustomerDetail', this.customerId)
        .then(data => {
          this.customer = data
        })
        .catch(error => {
          this.$message.error('获取客户信息失败：' + error.message)
        })
    },
    // 获取消费记录
    getConsumptionRecords() {
      this.loading = true
      const params = {}
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        params.startDate = this.searchForm.dateRange[0]
        params.endDate = this.searchForm.dateRange[1]
      }
      
      this.$store.dispatch('getConsumptionRecords', {
        id: this.customerId,
        ...params
      })
        .then(records => {
          this.records = records
          this.loading = false
        })
        .catch(error => {
          this.$message.error('获取消费记录失败：' + error.message)
          this.loading = false
        })
    },
    // 处理搜索
    handleSearch() {
      this.getConsumptionRecords()
    },
    // 重置搜索
    resetSearch() {
      this.searchForm.dateRange = null
      this.getConsumptionRecords()
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
      this.getConsumptionRecords()
    } else {
      this.$message.error('客户ID不能为空')
      this.$router.push('/customer/list')
    }
  }
}
</script>

<style scoped>
.consumption-record {
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

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.record-card {
  min-height: 400px;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}

.signature-preview {
  width: 200px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.signature-img {
  max-width: 100%;
  max-height: 100%;
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
  
  .search-form {
    flex-direction: column;
  }
  
  .el-form-item {
    margin-right: 0;
  }
}
</style>