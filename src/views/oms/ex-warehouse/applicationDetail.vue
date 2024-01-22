<template>
   
  <div class="detail-container">
    <el-card shadow="never" style="margin-top: 15px">
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px"></i>
        <span class="color-danger">当前申请状态：{{ order.status }}</span>
        <div class="operate-button-container">
          <span v-if="role == '超级管理员'">
            <el-button size="mini" @click="approval()">通过</el-button>
            <el-button size="mini" @click="refuse()">驳回</el-button>
          </span>
          <el-button v-else size="mini" @click="editApplication()"
            >修改申请</el-button
          >

          <el-button size="mini" @click="remarkApplication()"
            >备注申请</el-button
          >
        </div>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">基本信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="4" class="table-cell-title">申请编号</el-col>
          <el-col :span="4" class="table-cell-title">申请时间</el-col>
          <el-col :span="4" class="table-cell-title">申请用号</el-col>
          <el-col :span="4" class="table-cell-title">申请类型</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell">{{ order.orderSn }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.orderTime }}</el-col>
          <el-col :span="4" class="table-cell">{{
            order.memberUsername
          }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.orderType }}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">申请人信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">申请人</el-col>
          <el-col :span="6" class="table-cell-title">手机号码</el-col>
          <el-col :span="6" class="table-cell-title">申请单位</el-col>
          <el-col :span="6" class="table-cell-title">申请地址</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell">{{ order.receiverName }}</el-col>
          <el-col :span="6" class="table-cell">{{
            order.receiverPhone
          }}</el-col>
          <el-col :span="6" class="table-cell">{{ order.workUnit }}</el-col>
          <el-col :span="6" class="table-cell">{{ workUnitAddress }}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">商品信息</span>
      </div>
      <el-table
        ref="orderItemTable"
        :data="order.orderItemList"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.productPic" style="height: 80px" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.productName }}</p>
            <p>品牌：{{ scope.row.productBrand }}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{ scope.row.productPrice }}</p>
            <p>货号：{{ scope.row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.productAttr | formatProductAttr }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.productQuantity }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="scope">
            ￥{{ scope.row.productPrice * scope.row.productQuantity }}
          </template>
        </el-table-column>
      </el-table>
      <div style="float: right; margin: 20px">
        合计：<span class="color-danger">￥{{ order.totalAmount }}</span>
      </div>
      <div style="margin-top: 40px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">操作信息</span>
      </div>
      <el-table
        style="margin-top: 20px; width: 100%"
        ref="orderHistoryTable"
        :data="order.historyList"
        border
      >
        <el-table-column label="操作者" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.operateMan }}
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="160" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <!-- 修改前状态与当前状态需要修改 -->
        <el-table-column label="修改前状态" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.beforeStatus }}
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.currentStatus }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center">
          <template slot-scope="scope">
            {{ scope.row.note }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="备注申请"
      :visible.sync="markOrderDialogVisible"
      width="40%"
    >
      <el-form :model="markInfo" label-width="150px">
        <el-form-item label="操作备注：">
          <el-input v-model="markInfo.note" type="textarea" rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="markOrderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleMarkOrder">确 定</el-button>
      </span>
    </el-dialog>
    <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
  </div>
</template>
<script>
import { getOrderDetail, updateOrderNote } from "@/api/order";
import LogisticsDialog from "@/views/oms/order/components/logisticsDialog";
import { formatDate } from "@/utils/date";
import VDistpicker from "v-distpicker";
import store from "@/store";

export default {
  name: "orderDetail",
  components: { VDistpicker, LogisticsDialog },
  data() {
    return {
      id: "",
      order: {},
      markOrderDialogVisible: false,
      markInfo: { note: "" },
      logisticsDialogVisible: false,
      role: "",
    };
  },
  created() {
    this.role = store.getters.roles[0];
    this.id = this.$route.query.id;
    this.getOrdreListDetail(this.id);
  },
  filters: {
    formatProductAttr(value) {
      if (value == null) {
        return "";
      } else {
        let attr = JSON.parse(value);
        let result = "";
        for (let i = 0; i < attr.length; i++) {
          result += attr[i].key;
          result += ":";
          result += attr[i].value;
          result += ";";
        }
        return result;
      }
    },
  },
  methods: {
    getOrdreListDetail(id) {
      getOrderDetail(this.Base64.encode(id + "")).then((response) => {
        this.order = JSON.parse(this.Base64.decode(response.data));
      });
    },
    onSelectRegion(data) {
      this.receiverInfo.receiverProvince = data.province.value;
      this.receiverInfo.receiverCity = data.city.value;
      this.receiverInfo.receiverRegion = data.area.value;
    },
    formatTime(time) {
      if (time == null || time === "") {
        return "";
      }
      let date = new Date(time);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
    remarkApplication() {
      this.markOrderDialogVisible = true;
      this.markInfo.id = this.id;
      this.closeOrder.note = "";
    },
    editApplication() {
      this.$router.push({
        path: "/oms/createApplication",
        query: { id: this.id },
      });
    },
    approval() {
      this.$confirm("确定要通过吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调取接口
        this.$message({
          type: "success",
          message: "通过成功!",
        });
      });
    },
    refuse() {
      this.$confirm("确定要驳回吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调取接口
        this.$message({
          type: "success",
          message: "驳回成功!",
        });
      });
    },
    handleMarkOrder() {
      this.$confirm("是否要备注申请?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const idData = this.markInfo.id.toString();
        const statusData = this.order.status.toString();
        let params = {
          id: this.Base64.encode(idData),
          note: this.Base64.encode(this.markInfo.note),
          status: this.Base64.encode(statusData),
        };
        updateOrderNote(params).then((response) => {
          this.markOrderDialogVisible = false;
          this.$message({
            type: "success",
            message: "申请备注成功!",
          });
          // getOrderDetail(this.id).then(response => {
          //   this.order = response.data;
          // });
          this.getOrdreListDetail(this.id);
        });
      });
    },
  },
};
</script>
<style scoped>
.detail-container {
  width: 80%;
  padding: 20px 20px 20px 20px;
  margin: 20px auto;
}

.operate-container {
  background: #f2f6fc;
  height: 80px;
  margin: -20px -20px 0;
  line-height: 80px;
}

.operate-button-container {
  float: right;
  margin-right: 20px;
}

.table-layout {
  margin-top: 20px;
  border-left: 1px solid #dcdfe6;
  border-top: 1px solid #dcdfe6;
}

.table-cell {
  height: 60px;
  line-height: 40px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  padding: 10px;
  font-size: 14px;
  color: #606266;
  text-align: center;
  overflow: hidden;
}

.table-cell-title {
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  padding: 10px;
  background: #f2f6fc;
  text-align: center;
  font-size: 14px;
  color: #303133;
}
</style>


