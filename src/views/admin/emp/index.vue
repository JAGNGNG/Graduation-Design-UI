<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
        <el-form-item label="入职时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
        </el-form-item>
          <el-form-item label="所属部门" prop="deptId">
           <treeselect 
           v-model="queryParams.deptId" 
           style="width: 240px" 
           :options="deptOptions" 
           :show-count="true" 
           placeholder="请选择归属部门" 
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
          v-hasPermi="['admin:emp:add']"
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
          v-hasPermi="['admin:emp:edit']"
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
          v-hasPermi="['admin:emp:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['admin:emp:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="empList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id"   v-if="false" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="性别" align="center" prop="sex" >
        <template slot-scope="scope">
          <span v-if="scope.row.sex == 0">女</span>
          <span v-if="scope.row.sex == 1">男</span>
        </template>
      </el-table-column>
      <el-table-column label="所属部门" align="center" prop="deptName" />
      <el-table-column label="手机号码" align="center" prop="phone" />
      <el-table-column label="底薪" align="center" prop="base" />
      <el-table-column label="提成" align="center" prop="commission" />
      <el-table-column label="入职时间" align="center" prop="entryTime" />
      <el-table-column label="生日" align="center" prop="birthday" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['admin:emp:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['admin:emp:remove']"
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

    <!-- 添加或修改员工信息;对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="form.sex" size="medium">
          <el-radio v-for="(item, index) in sexOptions" :key="index" :label="item.value"
            :disabled="item.disabled">{{item.label}}</el-radio>
        </el-radio-group>
      </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
           <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属部门" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="底薪" prop="base">
          <el-input v-model="form.base" placeholder="请输入底薪" />
        </el-form-item>
        <el-form-item label="提成" prop="commission">
          <el-input v-model="form.commission" placeholder="请输入提成" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="form.birthday" :style="{width: '100%'}" format="yyyy-MM-dd" value-format="yyyy-MM-dd" clearable  placeholder="请输入生日" />
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
import { listEmp, getEmp, delEmp, addEmp, updateEmp } from "@/api/admin/emp";
import {  deptTreeSelect } from "@/api/system/user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Emp",
  components: { Treeselect },
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
      // 员工信息;表格数据
      empList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        sex: null,
        deptId: null,
        phone: null,
        entryTime: null,
        birthday: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        sex: [
          { required: true, message: "性别不能为空", trigger: "change" }
        ],
        deptId: [
          { required: true, message: "所属部门不能为空", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "手机号码不能为空", trigger: "blur" }
        ],
        base: [
          { required: true, message: "底薪不能为空", trigger: "blur" }
        ],
        commission: [
          { required: true, message: "提成不能为空", trigger: "blur" }
        ],
        birthday: [
          { required: true, message: "生日不能为空", trigger: "blur" }
        ]
      },
      // 部门树选项
      deptOptions: undefined,
      // 日期范围
      dateRange: [],
      sexOptions:[{
        "label":"男",
        "value":"1"
      },
      {
        "label":"女",
        "value":"0"
      }]
    };
  },
  created() {
    this.getList();
    this.getDeptTree();
  },
  methods: {
    /** 查询员工信息;列表 */
    getList() {
      this.loading = true;
      listEmp(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.empList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
      /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        sex: null,
        deptId: null,
        phone: null,
        base: null,
        commission: null,
        entryTime: null,
        birthday: null
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
      this.title = "添加员工信息;";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getEmp(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改员工信息;";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateEmp(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addEmp(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除员工信息;编号为"' + ids + '"的数据项？').then(function() {
        return delEmp(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/emp/export', {
        ...this.queryParams
      }, `emp_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
