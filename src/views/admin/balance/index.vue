<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="会员" prop="memberId">
           <el-select
              v-model="queryParams.memberId"
              filterable
              remote
              reserve-keyword
              remote-show-suffix
              placeholder="请输入员工名称"
              :remote-method="loadMembers"
              :loading="loading">
              <el-option
                v-for="item in memberOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>

      <el-form-item label="变动时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 340px"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            ></el-date-picker>
        </el-form-item>

      <el-form-item label="变动方向" prop="changeDirection">
        <el-select
              v-model="queryParams.changeDirection"
              clearable="true"
              placeholder="请选择变动方向">
            <el-option v-for="(item, index) in dirOptions" :key="index" :label="item.label"
            :value="item.value" :disabled="item.disabled"></el-option>
            </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
     
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="balanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="false"/>
      <el-table-column label="会员id" align="center" prop="memberId" v-if="false"/>
      <el-table-column label="会员" align="center" prop="memberName"/>
      <el-table-column label="会员手机号码" align="center" prop="phone"/>
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="变动方向" align="center" prop="changeDirection">
       <template slot-scope="scope">
          <span v-if="scope.row.changeDirection ===0">收入</span>
          <span v-if="scope.row.changeDirection ===1">支出</span>
       </template>
      </el-table-column>
      <el-table-column label="变动金额" align="center" prop="changeAmount" />
      <el-table-column label="交易金额" align="center" prop="tradeAmount" />
      <el-table-column label="变动时间" align="center" prop="changeTime" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改会员账户余额变动明细;对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBalance, getBalance, delBalance, addBalance, updateBalance } from "@/api/admin/balance";
import { listMember } from "@/api/admin/member";

export default {
  name: "Balance",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 会员账户余额变动明细;表格数据
      balanceList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        memberId: null,
        changeAmount: null,
        changeTime: null,
        changeDirection: null,
        orderId: null,
        tradeAmount: null,
        orderNo:null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        memberId: [
          { required: true, message: "会员id不能为空", trigger: "blur" }
        ],
        changeAmount: [
          { required: true, message: "变动金额不能为空", trigger: "blur" }
        ],
        changeTime: [
          { required: true, message: "变动时间;日期格式(yyyy-MM-dd)不能为空", trigger: "blur" }
        ],
        changeDirection: [
          { required: true, message: "变动方向;0:收入1:支出不能为空", trigger: "blur" }
        ],
        tradeAmount: [
          { required: true, message: "交易金额;交易金额，记录充值活动如充300送100记录顾客时间支付金额不能为空", trigger: "blur" }
        ]
      },
      dirOptions:[{
        "label": "收入",
        "value": 0
      }, {
        "label": "支出",
        "value": 1
      }],
      dateRange:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询会员账户余额变动明细;列表 */
    getList() {
      this.loading = true;
      listBalance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.balanceList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        memberId: null,
        changeAmount: null,
        changeTime: null,
        changeDirection: null,
        orderId: null,
        tradeAmount: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加会员账户余额变动明细;";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getBalance(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改会员账户余额变动明细;";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateBalance(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBalance(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除会员账户余额变动明细;编号为"' + ids + '"的数据项？').then(function() {
        return delBalance(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/balance/export', {
        ...this.queryParams
      }, `balance_${new Date().getTime()}.xlsx`)
    },
    loadMembers(name){
      if (name !== '') {
          this.loading = true;
          listMember({'customerName':name}).then(response => {
            this.memberOptions = response.rows.map(item =>{
              return {value:`${item.id}`, label: `${item.customerName}(${item.phone})`}
            })
           this.loading = false;
          });
        } else {
          this.memberOptions = [];
        }
    }
  }
};
</script>
