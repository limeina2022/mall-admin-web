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
              v-model="listQuery.code"
              class="input-width"
              placeholder="申请编号"
            ></el-input>
          </el-form-item>
          <el-form-item label="申请人：">
            <el-input
              v-model="listQuery.applicantName"
              class="input-width"
              placeholder="申请人姓名"
            ></el-input>
          </el-form-item>
          <el-form-item label="申请时间：">
            <el-date-picker
              width="200px"
              class="input-width"
              v-model="createTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateRangeChange"
            >
            </el-date-picker>
          </el-form-item>

          <el-form-item label="申请状态：">
            <el-select
              v-model="listQuery.status"
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
       v-if=" role !== '超级管理员'"
        style="float: right"
        type="primary"
        @click="addApplication()"
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
          <!-- {{ scope.row.id }} -->
          <template slot-scope="scope">{{scope.$index + 1}}</template>
        </el-table-column>
        <el-table-column label="申请编号" width="200" align="center">
          <template slot-scope="scope">{{ scope.row.code }}</template>
        </el-table-column>
        <el-table-column label="申请时间" width="180" align="center">
          <template slot-scope="scope">{{
            scope.row.createTime | formatCreateTime
          }}</template>
        </el-table-column>
        <el-table-column label="申请用户" align="center">
          <template slot-scope="scope">{{ scope.row.applicantName }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="center">
          <template slot-scope="scope">￥{{ scope.row.totalAmount }}</template>
        </el-table-column>
        <!-- 新增申请状态：草稿，待审批，通过，驳回 -->
        <el-table-column label="申请状态" width="120" align="center">
          <template slot-scope="scope">{{
            getStatus(scope.row.status)
          }}</template>
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
              v-if="role == '超级管理员' && scope.row.status === 1"
              size="mini"
              @click="approvalApplication(scope.$index, scope.row)"
              >审批申请</el-button
            >
            <el-button
              v-if="role !== '超级管理员' && scope.row.status !== 2"
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
  </div>
</template>
<script>
import { fetchList, inventoryList, closeOrder, deleteOrder } from "@/api/order";
import { formatDate } from "@/utils/date";
// import LogisticsDialog from "@/views/oms/order/components/logisticsDialog";
import store from "@/store";
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  code: "", // 申请编号
  applicantName: "", //申请人
  status: "", // 申请状态
  startTime: "",
  endTime: "",
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
      createTime: "",
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
    getStatus(status) {
      switch (status) {
        case 0:
          return "草稿";
        case 1:
          return "待审批";
        case 2:
          return "通过";
        case 3:
          return "驳回";
      }
    },
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
      this.$router.push({
        path: "/oms/createApplication",
        query: { id: row.id },
      });
    },
    approvalApplication(index, row) {
      this.$router.push({
        path: "/oms/createApplication",
        query: { id: row.id },
      });
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
    getList() {
      this.listLoading = true;
      // type ： 0入库， 1出库，2退库
      const params = {
        type: this.Base64.encode('0'),
        pageNum: this.Base64.encode(this.listQuery.pageNum.toString()),
        pageSize: this.Base64.encode(this.listQuery.pageSize.toString()),
        code: this.Base64.encode(this.listQuery.code.toString()),
        applicantName: this.Base64.encode(this.listQuery.applicantName),
        status: this.Base64.encode(this.listQuery.status.toString()),
        // createTime: this.Base64.encode(this.listQuery.createTime.toString()),
        startAt: this.Base64.encode(this.listQuery.startTime),
        endAt: this.Base64.encode(this.listQuery.endTime),
      };
      inventoryList(params).then((response) => {
        let data = JSON.parse(this.Base64.decode(response.data));
        this.listLoading = false;
        this.list = data.list;
        this.total = data.total;
      });
    },
    handleDateRangeChange() {
      if (this.createTime && this.createTime.length === 2) {
        this.listQuery.startTime = this.createTime[0];
        this.listQuery.endTime = this.createTime[1];
      } else {
        this.listQuery.startTime = "";
        this.listQuery.endTime = "";
      }
    },
    addApplication() {
      this.$router.push({
        path: "/oms/createApplication",
      });
    },
  },
};
</script>
<style scoped>
.input-width {
  width: 360px;
}
</style>


