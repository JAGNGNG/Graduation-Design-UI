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

      <el-form-item label="订单状态" prop="state">
            <el-select
              v-model="queryParams.state"
              placeholder="订单状态"
              clearable
               @keyup.enter.native="handleQuery"
            >
              <el-option
                v-for="dict in dict.type.order_state_dict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['admin:order:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="false" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="订单金额" align="center" prop="amount" />
      <el-table-column label="订单状态" align="center" prop="state" >
      <template slot-scope="scope">
        <span v-if="scope.row.state ===0">待结算</span>
        <span v-if="scope.row.state ===1">已结算</span>
        <span v-if="scope.row.state ===2">已取消</span>
      </template>
      </el-table-column>
      <el-table-column label="会员id" align="center" prop="memberId" v-if="false" />
      <el-table-column label="会员" align="center" prop="memberName" />
      <el-table-column label="是否为会员" align="center" prop="member" >
         <template slot-scope="scope">
        <span v-if="scope.row.member ===0">否</span>
        <span v-if="scope.row.member ===1">是</span>
      </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="addOrderWare(scope.row)"
            v-hasPermi="['admin:order:edit']"
             v-if="scope.row.state ===0"
          >添加产品</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="settlementOrder(scope.row)"
            v-if="scope.row.amount !== 0 && scope.row.state ===0"
            v-hasPermi="['admin:order:edit']"
          >结算</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="refundOrder(scope.row)"
            v-hasPermi="['admin:order:remove']"
            v-if="scope.row.state ===1"
          >退款</el-button>
            <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="cancelOrder(scope.row)"
            v-hasPermi="['admin:order:remove']"
            v-if="scope.row.state ===0"
          >取消</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="feedbackOrder(scope.row)"
            v-hasPermi="['admin:order:remove']"
            v-if="scope.row.state ===1"
          >评价</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改订单;对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="wareCode" v-if="operType==='addOrderWare'">
           <el-select
              v-model="form.wareCode"
              filterable
              remote
              reserve-keyword
              placeholder="请输入产品名称"
              :remote-method="loadWares"
              remote-show-suffix
              @change="changeWare"
              style="width:100%"
              :loading="loading">
              <el-option
                v-for="item in wareOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>
      <el-form-item label="关联员工" prop="empIds" v-if="operType==='addOrderWare'">
           <el-select
              v-model="form.empIds"
              filterable
              remote
              multiple="true"
              reserve-keyword
              remote-show-suffix
              placeholder="请输入员工名称"
              :remote-method="loadEmps"
              style="width:100%"
              :loading="loading">
              <el-option
                v-for="item in empOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>
      <el-form-item label="产品数量" prop="wareNum" v-if="operType==='addOrderWare' && showWareNum ">
          <el-input-number v-model="form.wareNum" />
      </el-form-item>
      <el-form-item label="结算方式" prop="member" v-if="operType==='settlementOrder'">
        <el-radio-group v-model="form.member" size="medium">
                  <el-radio :label=0>普通结算</el-radio>
                  <el-radio :label=1>会员结算</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="结算会员" prop="memberId" v-if="operType==='settlementOrder' && form.member===1">
           <el-select
              v-model="form.memberId"
              filterable
              remote
              reserve-keyword
              remote-show-suffix
              placeholder="请输入员工名称"
              :remote-method="loadMembers"
              style="width:100%"
              :loading="loading">
              <el-option
                v-for="item in memberOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>

      <el-form-item label="反馈内容" prop="feedback" v-if="operType==='feedbackOrder'">
          <el-input v-model="form.feedback" type="textarea" placeholder="请输入反馈内容"
            :autosize="{minRows: 4, maxRows: 4}" :style="{width: '100%'}"></el-input>
      </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder,settlement,refund,orderCancel } from "@/api/admin/order";
import { listWare } from "@/api/admin/ware";
import { listEmp } from "@/api/admin/emp";
import { addDtl } from "@/api/admin/dtl";
import { listMember } from "@/api/admin/member";

export default {
  name: "Order",
  dicts:["order_state_dict"],
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
      // 订单;表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      operType:"",
      showWareNum:true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        amount: null,
        state: null,
        memberId: null,
        member: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        amount: [
          { required: true, message: "订单金额不能为空", trigger: "blur" }
        ],
        state: [
          { required: true, message: "订单状态不能为空", trigger: "blur" }
        ],
        member: [
          { required: true, message: "是否为会员不能为空", trigger: "blur" }
        ],
       memberId: [
          { required: true, message: "会员不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ]
      },
      wareOptions:[],
      empOptions:[],
      memberOptions:[],
      dateRange:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询订单;列表 */
    getList() {
      this.loading = true;
      console.log(this.dateRange);
      listOrder(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.orderList = response.rows;
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
        amount: null,
        state: null,
        memberId: null,
        member: null,
        createTime: null
      };
      this.resetForm("form");
      this.showWareNum=true;
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
      this.$modal.confirm('是否确认创建订单?').then(function() {
        return  addOrder();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("创建成功");
      }).catch(() => {});
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getOrder(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改订单";
      });
    },
    /**新增订单产品 */
    addOrderWare(row){
      this.reset();
      this.operType = "addOrderWare";
      const id = row.id || this.ids
      getOrder(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "添加订单产品";
      });
    },
    /**订单结算 */
    settlementOrder(row){
      this.reset();
      this.operType = "settlementOrder";
      const id = row.id || this.ids
      getOrder(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "订单结算";
      });
    },
    /**订单评价 */
    feedbackOrder(row){
      this.reset();
      this.operType = "feedbackOrder";
      const id = row.id || this.ids
      getOrder(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "反馈评价";
      });
    },
    /**订单退款 */
    refundOrder(row){
      this.$modal.confirm('是否确认退款,编号为"' + row.orderNo + '"的订单？').then(function() {
        return refund(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("退款成功");
      }).catch(() => {});
    },
     /**取消订单 */
    cancelOrder(row){
      this.$modal.confirm('是否确认取消,编号为"' + row.orderNo + '"的订单？').then(function() {
        return orderCancel(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消成功");
      }).catch(() => {});
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.operType === 'addOrderWare'){
              addDtl(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
          if(this.operType === "settlementOrder"){
            settlement(this.form).then(response => {
              this.$modal.msgSuccess("结算成功");
              this.open = false;
              this.getList();
              });
          }
          // if (this.form.id != null) {
          //   updateOrder(this.form).then(response => {
          //     this.$modal.msgSuccess("修改成功");
          //     this.open = false;
          //     this.getList();
          //   });
          // } else {
          //   addOrder(this.form).then(response => {
          //     this.$modal.msgSuccess("新增成功");
          //     this.open = false;
          //     this.getList();
          //   });
          // }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除订单;编号为"' + ids + '"的数据项？').then(function() {
        return delOrder(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/order/export', {
        ...this.queryParams
      }, `order_${new Date().getTime()}.xlsx`)
    },
    /**加载产品信息 */
    loadWares(wareName){
      if (wareName !== '') {
          this.loading = true;
          listWare({'wareName':wareName}).then(response => {
            this.wareOptions = response.rows.map(item =>{
              return {value:`${item.wareCode}`, label: `${item.wareName}(${item.wareTypeName})`}
            })
           this.loading = false;
          });
        } else {
          this.wareOptions = [];
        }
    },
    /**加载员工信息 */
    loadEmps(empName){
      if (empName !== '') {
          this.loading = true;
          listEmp({'name':empName}).then(response => {
            this.empOptions = response.rows.map(item =>{
              return {value:`${item.id}`, label: `${item.name}(${item.deptName})`}
            })
           this.loading = false;
          });
        } else {
          this.empOptions = [];
        }
    },
    loadMembers(phone){
      if (phone !== '') {
          this.loading = true;
          listMember({'phone':phone}).then(response => {
            this.memberOptions = response.rows.map(item =>{
              return {value:`${item.id}`, label: `${item.customerName}(${item.phone})`}
            })
           this.loading = false;
          });
        } else {
          this.memberOptions = [];
        }
    },
    changeWare(value){
     if(value.indexOf('hairdressing-')>=0 || value.indexOf('cosmetology-')>=0){
       this.showWareNum=false;
     }else{
       this.showWareNum=true;
     }
    }
  }
};
</script>
