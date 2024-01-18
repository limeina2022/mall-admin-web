<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList()"
          size="small"
        >
          查询搜索
        </el-button>
        <el-button
          style="float: right; margin-right: 15px"
          @click="handleResetSearch()"
          size="small"
        >
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form
          :inline="true"
          :model="listQuery"
          size="small"
          label-width="140px"
        >
          <el-form-item label="申请编号：">
            <el-input
              v-model="listQuery.orderSn"
              class="input-width"
              placeholder="申请编号"
            ></el-input>
          </el-form-item>
          <el-form-item label="申请人：">
            <el-input
              v-model="listQuery.receiverKeyword"
              class="input-width"
              placeholder="申请人姓名"
            ></el-input>
          </el-form-item>
          <el-form-item label="申请时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.createTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="请选择时间"
            >
            </el-date-picker>
          </el-form-item>

          <el-form-item label="申请状态：">
            <el-select
              v-model="listQuery.applyStatus"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in applyStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <!-- 需要判断，是否是管理员，管理员则不需要展示该按钮 -->
      <el-button
        style="float: right"
        type="primary"
        @click="submitApplication()"
        size="small"
      >
        新增申请
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table
        ref="orderTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border
      >
        <el-table-column
          type="selection"
          width="60"
          align="center"
        ></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="申请编号" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.orderSn }}</template>
        </el-table-column>
        <el-table-column label="申请时间" width="180" align="center">
          <template slot-scope="scope">{{
            scope.row.createTime | formatCreateTime
          }}</template>
        </el-table-column>
        <el-table-column label="申请用户" align="center">
          <template slot-scope="scope">{{ scope.row.memberUsername }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="center">
          <template slot-scope="scope">￥{{ scope.row.totalAmount }}</template>
        </el-table-column>

        <!-- 新增申请状态：草稿，待审批，通过，驳回 -->
        <el-table-column label="申请状态" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.applyStatus }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="viewApplication(scope.$index, scope.row)"
              >查看申请</el-button
            >
            <!--  审批按钮：管理员且待审批状态才会展示 -->
            <el-button
              v-if="role == '超级管理员' &&  scope.row.applyStatus === 1"
              size="mini"
              @click="approvalApplication(scope.$index, scope.row)"
              >审批申请</el-button
            >
            <el-button
              v-else
              size="mini"
              @click="editApplication(scope.$index, scope.row)"
              >修改申请</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5, 10, 15]"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- <el-dialog
      title="关闭订单"
      :visible.sync="closeOrder.dialogVisible"
      width="30%"
    >
      <span style="vertical-align: top">操作备注：</span>
      <el-input
        style="width: 80%"
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
        v-model="closeOrder.content"
      >
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm"
          >确 定</el-button
        >
      </span>
    </el-dialog> -->
    <!-- <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog> -->
  </div>
</template>
<script>
import { fetchList, closeOrder, deleteOrder } from "@/api/order";
import { formatDate } from "@/utils/date";
// import LogisticsDialog from "@/views/oms/order/components/logisticsDialog";
import store from "@/store";
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  orderSn: "", // 申请编号
  receiverKeyword: "",
  applyStatus: "", // 申请状态
  createTime: "",
};
export default {
  name: "orderList",
  // components: { LogisticsDialog },
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      listLoading: true,
      list: null,
      total: null,
      operateType: null,
      role: "",
      applyStatusOptions: [
        {
          label: "草稿",
          value: 0,
        },
        {
          label: "待审批",
          value: 1,
        },
        {
          label: "通过",
          value: 2,
        },
        {
          label: "驳回",
          value: 3,
        },
      ],
      // logisticsDialogVisible: false,
    };
  },
  created() {
    this.role = store.getters.roles[0];
    this.getList();
  },
  filters: {
    formatCreateTime(time) {
      let date = new Date(time);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
      this.getList();
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    viewApplication(index, row) {
      this.$router.push({ path: "/oms/orderDetail", query: { id: row.id } });
    },
    editApplication(index, row) {
      this.$router.push({ path: "/oms/createApplication", query: { id: row.id } });
    },
    approvalApplication(index, row){
      this.$router.push({ path: "/oms/createApplication", query: { id: row.id } });
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    // handleCloseOrderConfirm() {
    //   if (this.closeOrder.content == null || this.closeOrder.content === "") {
    //     this.$message({
    //       message: "操作备注不能为空",
    //       type: "warning",
    //       duration: 1000,
    //     });
    //     return;
    //   }
    //   // let params = new URLSearchParams();
    //   // params.append("ids", this.closeOrder.orderIds);
    //   // params.append("note", this.closeOrder.content);
    //  const idsData = this.closeOrder.orderIds.toString()
    //  let params = {
    //     ids: this.Base64.encode(idsData),
    //     note:  this.Base64.encode(this.closeOrder.content)
    //  }
    //   closeOrder(params).then((response) => {
    //     this.closeOrder.orderIds = [];
    //     this.closeOrder.dialogVisible = false;
    //     this.getList();
    //     this.$message({
    //       message: "修改成功",
    //       type: "success",
    //       duration: 1000,
    //     });
    //   });
    // },
    getList() {
      this.listLoading = true;
      if (this.listQuery.applyStatus === null) {
        this.listQuery.applyStatus = "";
      }
      const params = {
        pageNum: this.Base64.encode(this.listQuery.pageNum + ""),
        pageSize: this.Base64.encode(this.listQuery.pageSize + ""),
        orderSn: this.Base64.encode(this.listQuery.orderSn + ""),
        receiverKeyword: this.Base64.encode(this.listQuery.receiverKeyword),
        status: this.Base64.encode(this.listQuery.applyStatus + ""),

        // sourceType: this.Base64.encode(this.listQuery.sourceType + ""),
        createTime: this.Base64.encode(this.listQuery.createTime),
      };
      fetchList(params).then((response) => {
        let data = JSON.parse(this.Base64.decode(response.data));
        this.listLoading = false;
        this.list = data.list;
        this.total = data.total;
      });
    },
    submitApplication() {
      this.$router.push({
        path: "/oms/createApplication",
      });
    },
  },
};
</script>
<style scoped>
.input-width {
  width: 203px;
}
</style>


