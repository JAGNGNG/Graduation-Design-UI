<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="库存名称" prop="wareName">
        <el-input
          v-model="queryParams.wareName"
          placeholder="请输入库存名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="库存类型" prop="wareType">
            <el-select
              v-model="queryParams.wareType"
              placeholder="库存类型"
              clearable
               @keyup.enter.native="handleQuery"
            >
              <el-option
                v-for="dict in dict.type.ware_type_dict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['admin:ware:add']"
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
          v-hasPermi="['admin:ware:edit']"
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
          v-hasPermi="['admin:ware:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['admin:ware:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="wareList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="库存名称" align="center" prop="wareName" />
      <el-table-column label="库存类别编码" align="center" prop="wareType" v-if="false"  />
      <el-table-column label="库存类别" align="center" prop="wareTypeName"  />
      <el-table-column label="库存编码" align="center" prop="wareCode" v-if="false" />
      <el-table-column label="库存数量" align="center" prop="wareNum" />
      <el-table-column label="库存信息" align="center" prop="wareContent" />
      <el-table-column label="库存图片地址" align="center" prop="wareImg" />
      <el-table-column label="库存价格" align="center" prop="warePrice" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['admin:ware:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['admin:ware:remove']"
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

    <!-- 添加或修改库存信息;对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="库存名称" prop="wareName">
          <el-input v-model="form.wareName" placeholder="请输入库存名称" />
        </el-form-item>
        <el-form-item label="库存类型" prop="wareType">
            <el-select
              v-model="form.wareType"
              placeholder="库存类型"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.ware_type_dict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        <el-form-item label="库存数量" prop="wareNum" v-if="form.wareType==='goods' || form.wareType==='consumables'">
          <el-input v-model="form.wareNum" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="库存编号" prop="wareCode">
          <el-input v-model="form.wareCode" placeholder="请输入库存编号" />
        </el-form-item>
               <el-form-item label="库存价格" prop="warePrice">
          <el-input v-model="form.warePrice" placeholder="请输入库存价格" />
        </el-form-item>
        <el-form-item label="库存信息">
          <el-input v-model="form.wareContent" placeholder="请输入内容" type="textarea" />
        </el-form-item>
        <el-form-item label="库存图片" prop="wareImg">
          <el-input v-model="form.wareImg" type="textarea" placeholder="请输入内容" />
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
import { listWare, getWare, delWare, addWare, updateWare } from "@/api/admin/ware";

export default {
  name: "Ware",
  dicts: ['ware_type_dict'],
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
      // 库存信息;表格数据
      wareList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        wareName: null,
        wareType: null,
        wareNum: null,
        wareContent: null,
        version: null,
        wareImg: null,
        warePrice: null,
        wareCode: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        wareName: [
          { required: true, message: "库存名称不能为空", trigger: "blur" }
        ],
        wareType: [
          { required: true, message: "库存类别不能为空", trigger: "blur" }
        ],
        wareCode: [
          { required: true, message: "库存编码不能为空", trigger: "blur" }
        ],
        wareNum: [
          { required: true, message: "库存数量不能为空", trigger: "blur" }
        ],
        warePrice: [
          { required: true, message: "库存价格不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询库存信息;列表 */
    getList() {
      this.loading = true;
      listWare(this.queryParams).then(response => {
        this.wareList = response.rows;
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
        wareName: null,
        wareType: null,
        wareNum: null,
        wareContent: null,
        version: null,
        wareImg: null,
        warePrice: null,
        wareCode:null
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
      this.title = "添加库存信息;";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getWare(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改库存信息;";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateWare(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWare(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除库存信息;编号为"' + ids + '"的数据项？').then(function() {
        return delWare(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('admin/ware/export', {
        ...this.queryParams
      }, `ware_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
