<template>
   
  <div class="detail-container">
    <el-card shadow="never" style="margin-top: 15px">
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px"></i>
        <span class="color-danger"
          >当前申请状态：{{ order.summary.status ? getStatus(order.summary.status) : ''}}</span
        >
        <div class="operate-button-container">
          <span v-if="role == '超级管理员'">
            <el-button
              v-if="order.summary.status !== 2"
              size="mini"
              @click="approval()"
              >通过</el-button
            >
            <el-button
              v-if="order.summary.status !== 2"
              size="mini"
              @click="refuse()"
              >驳回</el-button
            >
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
          <el-col :span="5" class="table-cell-title">申请编号</el-col>
          <el-col :span="4" class="table-cell-title">申请时间</el-col>
          <el-col :span="3" class="table-cell-title">申请用户</el-col>
          <el-col :span="4" class="table-cell-title">申请类型</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="table-cell">{{ order.summary.code }}</el-col>
          <el-col :span="4" class="table-cell">{{
            order.summary.createTime
          }}</el-col>
          <el-col :span="3" class="table-cell">{{
            order.summary.applicantName
          }}</el-col>
          <el-col :span="4" class="table-cell">{{
            getType(order.summary.type)
          }}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">申请人信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">申请人</el-col>
          <!-- <el-col :span="6" class="table-cell-title">手机号码</el-col> -->
          <el-col :span="6" class="table-cell-title">申请单位</el-col>
          <el-col :span="6" class="table-cell-title">申请地址</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell">{{
            order.summary.applicantName
          }}</el-col>
          <!-- <el-col :span="6" class="table-cell">{{
            order.logs.receiverPhone
          }}</el-col> -->
          <el-col :span="6" class="table-cell">{{ order.workUnit }}</el-col>
          <el-col :span="6" class="table-cell">{{
            order.workUnitAddress
          }}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">商品信息</span>
      </div>
      <el-table
        ref="orderItemTable"
        :data="order.infos"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.pic" style="height: 80px" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.productName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{ scope.row.unitPrice }}</p>
            <p>货号：{{ scope.row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="120" align="center">
          <template slot-scope="scope">
            {{ getProductAttr(scope.row.spData2JsonArray) }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.stock }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="scope">
            ￥{{ scope.row.realTotalPrice }}
          </template>
        </el-table-column>
      </el-table>
      <div style="float: right; margin: 20px">
        合计：<span class="color-danger">￥{{ order.totalPrice }}</span>
      </div>
      <div style="margin-top: 40px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">操作信息</span>
      </div>
      <el-table
        style="margin-top: 20px; width: 100%"
        ref="orderHistoryTable"
        :data="order.logs"
        border
      >
        <el-table-column label="操作者" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.operatorName }}
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="160" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="修改前状态" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.beforeStatus? getStatus(scope.row.beforeStatus) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.nowStatus? getStatus(scope.row.nowStatus): '' }}
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
    <!-- <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog> -->
  </div>
</template>
<script>
import {
  applicationDetail,
  updateOrderNote,
  auditApplication,
  noteApplication,
} from "@/api/order";
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
      // logisticsDialogVisible: false,
      role: "",
      // status:''  // 申请状态，0,1,2,3（草稿，待审批，通过，驳回）
    };
  },
  created() {
    this.role = store.getters.roles[0];
    this.id = this.$route.query.id;
    this.getOrdreListDetail(this.id);
  },
  filters: {},
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
        case -1:
          return "无";
       default:
         return "";
      }
    },
    getType(type) {
      switch (type) {
        case 0:
          return "入库";
        case 1:
          return "出库";
        case 2:
          return "退库";
      }
    },
    getProductAttr(value) {
      return value.map((item) => `${item.key}: ${item.value}`).join(", ");
    },
    getOrdreListDetail(id) {
      const params = {
        summaryId: this.Base64.encode(id + ""),
      };
      applicationDetail(params).then((response) => {
        this.order = JSON.parse(this.Base64.decode(response.data));
      });
      // this.order = {
      //   summary: {
      //     id: 23,
      //     code: "202401241813528935400",
      //     status: 0,
      //     applicantId: 3,
      //     applicantName: "admin",
      //     createTime: 1706062433000,
      //     type: 0,
      //   },
      //   logs: [
      //     {
      //       id: 8,
      //       beforeStatus: -1,
      //       nowStatus: 0,
      //       operatorId: 3,
      //       operatorName: "admin",
      //       type: 0,
      //     },
      //   ],
      //   infos: [
      //     {
      //       productName: "华为 HUAWEI P20 ",
      //       realTotalPrice: 39990,
      //       unitPrice: 3999,
      //       pic: "http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/images/20180607/5ac1bf58Ndefaac16.jpg",
      //       productSn: "6946605",
      //       productCategoryId: 0,
      //       productId: 26,
      //       stock: 10,
      //       spData:
      //         '[{"key":"颜色","value":"金色"},{"key":"容量","value":"32G"}]',
      //       spData2JsonArray: [
      //         {
      //           key: "颜色",
      //           value: "金色",
      //         },
      //         {
      //           key: "容量",
      //           value: "32G",
      //         },
      //       ],
      //     },
      //     {
      //       productName: "华为 HUAWEI P20 ",
      //       realTotalPrice: 39990,
      //       unitPrice: 3999,
      //       pic: "http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/images/20180607/5ac1bf58Ndefaac16.jpg",
      //       productSn: "6946605",
      //       productCategoryId: 0,
      //       productId: 26,
      //       stock: 10,
      //       spData:
      //         '[{"key":"颜色","value":"金色"},{"key":"容量","value":"32G"}]',
      //       spData2JsonArray: [
      //         {
      //           key: "颜色",
      //           value: "金色",
      //         },
      //         {
      //           key: "容量",
      //           value: "32G",
      //         },
      //       ],
      //     },
      //   ],
      //   totalPrice: 39990,
      // };
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
      // this.markInfo.id = this.id;
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
        // 调取接口， 入参id和stauts
        const params = {
          id: this.id,
          opCode: 0,
        };
        const paramsString = JSON.stringify(params);
        auditApplication(this.Base64.encode(paramsString)).then((response) => {
          this.$message({
            type: "success",
            message: "通过成功!",
          });
          this.getOrdreListDetail(this.id);
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
        const params = {
          id: this.id,
          opCode: 1,
        };
        const paramsString = JSON.stringify(params);
        auditApplication(this.Base64.encode(paramsString)).then((response) => {
          this.$message({
            type: "success",
            message: "通过成功!",
          });
          this.getOrdreListDetail(this.id);
        });
      });
    },
    handleMarkOrder() {
      this.$confirm("是否要备注申请?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        let params = {
          id: this.id,
          note: this.markInfo.note,
        };
        const paramsString = JSON.stringify(params);
        console.log("备注的参数", params);
        noteApplication(this.Base64.encode(paramsString)).then((response) => {
          this.markOrderDialogVisible = false;
          this.$message({
            type: "success",
            message: "备注申请成功!",
          });
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


