<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="员工" prop="empId">
           <el-select
              v-model="queryParams.empId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入员工名"
              :remote-method="remoteMethod"
              :loading="loading">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
      </el-form-item>
      <el-form-item label="班牌类型" prop="brandType">
            <el-select
              v-model="queryParams.brandType"
              placeholder="班牌类型"
              clearable
               @keyup.enter.native="handleQuery"
            >
              <el-option
                v-for="dict in dict.type.brand_type_dict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
      </el-form-item>
      <el-form-item label="当班日期" prop="planDate">
        <el-date-picker
          v-model="queryParams.planDate"
          placeholder="请选择当班日期"
          value-format="yyyy-MM-dd"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['admin:plan:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['admin:plan:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['admin:plan:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['admin:plan:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="false"/>
      <el-table-column label="员工id" align="center" prop="empId" v-if="false"/>
      <el-table-column label="员工" align="center" prop="empName" />
      <el-table-column label="当班日期" align="center" prop="planDate" />
      <el-table-column label="轮班优先级" align="center" prop="priority" />
      <el-table-column label="班牌类型编码" align="center" prop="brandType" v-if="false"/>
      <el-table-column label="班牌类型" align="center" prop="brandTypeName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['admin:plan:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['admin:plan:remove']"
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

    <!-- 添加或修改员工排班计划;对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="员工" prop="empId">
           <el-select
              v-model="form.empId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入员工名"
              :remote-method="remoteMethod"
              :loading="loading">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="当班日期" prop="planDate">
          <el-date-picker v-model="form.planDate"  format="yyyy-MM-dd" value-format="yyyy-MM-dd" clearable  placeholder="请输入当班日期" />
        </el-form-item>
        <el-form-item label="班牌类型" prop="brandType">
            <el-select
              v-model="form.brandType"
              placeholder="班牌类型"
              clearable
            >
              <el-option
                v-for="dict in dict.type.brand_type_dict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
      </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" />
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
import { listPlan, getPlan, delPlan, addPlan, updatePlan } from "@/api/admin/plan";
import { listEmp } from "@/api/admin/emp";

export default {
  name: "Plan",
  dicts:["brand_type_dict"],
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
      // 员工排班计划;表格数据
      planList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        planDate: null,
        serviceTimes: null,
        priority: null,
        brandType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "员工id不能为空", trigger: "blur" }
        ],
        planDate: [
          { required: true, message: "当班日期不能为空", trigger: "blur" }
        ],
        serviceTimes: [
          { required: true, message: "当班次数不能为空", trigger: "blur" }
        ],
        priority: [
          { required: true, message: "轮班优先级不能为空", trigger: "blur" }
        ],
        brandType: [
          { required: true, message: "班牌类型不能为空", trigger: "change" }
        ]
      },
      options: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询员工排班计划;列表 */
    getList() {
      this.loading = true;
      listPlan(this.queryParams).then(response => {
        this.planList = response.rows;
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
        empId: null,
        planDate: null,
        serviceTimes: null,
        priority: null,
        brandType: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      console.log(this.queryParams.planDate);
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
      this.title = "添加员工排班计划";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPlan(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改员工排班计划";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updatePlan(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPlan(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除员工排班计划;编号为"' + ids + '"的数据项？').then(function() {
        return delPlan(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/plan/export', {
        ...this.queryParams
      }, `plan_${new Date().getTime()}.xlsx`)
    },
    remoteMethod(empName) {
        if (empName !== '') {
          this.loading = true;
          listEmp({'name':empName}).then(response => {
            this.options = response.rows.map(item =>{
              return {value:`${item.id}`, label: `${item.name}(${item.phone})`}
            })
           this.loading = false;
          });
        } else {
          this.options = [];
        }
      }
  }
};
</script>
