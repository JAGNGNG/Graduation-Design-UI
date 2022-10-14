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
      <el-form-item label="商品" prop="wareCode">
           <el-select
              v-model="queryParams.wareCode"
              filterable
              remote
              reserve-keyword
              placeholder="请选择商品"
              :remote-method="loadWares"
              remote-show-suffix
              style="width:100%"
              :loading="loading"
              clearable
               @keyup.enter.native="handleQuery"
              >
              <el-option
                v-for="item in wareOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>

      <el-form-item label="关联员工" prop="empIds">
           <el-select
              v-model="form.empIds"
              filterable
              remote
              multiple="true"
              reserve-keyword
              remote-show-suffix
              placeholder="请选择员工"
              :remote-method="loadEmps"
              @keyup.enter.native="handleQuery"
              clearable
              :loading="loading">
              <el-option
                v-for="item in empOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['admin:dtl:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dtlList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="false" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="商品编号" align="center" prop="wareCode" v-if="false"/>
      <el-table-column label="商品" align="center" prop="wareName" />
      <el-table-column label="商品数量" align="center" prop="wareNum" />
      <el-table-column label="明细金额" align="center" prop="detailedAmount" />
      <el-table-column label="关联员工id" align="center" prop="empId" v-if="false"/>
      <el-table-column label="关联员工" align="center" prop="empName" />
      <el-table-column label="员工提成" align="center" prop="commission" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['admin:dtl:remove']"
          >删除</el-button>
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

    <!-- 添加或修改订单明细;对话框 -->
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
import { listDtl, getDtl, delDtl, addDtl, updateDtl } from "@/api/admin/dtl";
import { listWare } from "@/api/admin/ware";
import { listEmp } from "@/api/admin/emp";

export default {
  name: "Dtl",
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
      // 订单明细;表格数据
      dtlList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderId: null,
        wareId: null,
        wareNum: null,
        detailedAmount: null,
        empId: null,
        commission: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderId: [
          { required: true, message: "订单id不能为空", trigger: "blur" }
        ]
      },
      wareOptions:[],
      empOptions:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询订单明细;列表 */
    getList() {
      this.loading = true;
      listDtl(this.queryParams).then(response => {
        this.dtlList = response.rows;
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
        orderId: null,
        wareId: null,
        wareNum: null,
        detailedAmount: null,
        empId: null,
        commission: null
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
      this.title = "添加订单明细;";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDtl(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改订单明细;";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDtl(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDtl(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除订单明细;编号为"' + ids + '"的数据项？').then(function() {
        return delDtl(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/dtl/export', {
        ...this.queryParams
      }, `dtl_${new Date().getTime()}.xlsx`)
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
    }

  }
};
</script>
