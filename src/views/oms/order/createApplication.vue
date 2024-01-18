<template>
  <div class="wrapper">
    <div v-for="(productForm, index) in productForms" :key="index">
      <el-card class="filter-container" shadow="never">
        <div style="display: flex; justify-content: space-between">
          <div>产品{{ index + 1 }}</div>
          <i class="el-icon-close" @click="removeProdctForm(index)"></i>
        </div>
        <el-form :model="productForm" size="small" label-width="220px">
          <el-form-item label="产品分类：">
            <el-select
              v-model="productForm.type"
              class="input-width"
              placeholder="全部"  
              clearable
            >
              <el-option
                v-for="item in prodctTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品名称：">
            <el-select
              v-model="productForm.name"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in prodctNameList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品数量：">
            <el-input
              v-model.number="productForm.num"
              style="width: 190px"
              placeholder="请选择产品数量"
            ></el-input>
          </el-form-item>
          <el-form-item label="产品属性1：">
            <el-select
              v-model="productForm.attribute"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in prodctAttributeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <div class="add-box" @click="addProdctForm">添加产品</div>
    <div
      v-if="productForms.length > 0"
      style="display: flex; justify-content: center"
    >
      <el-button type="primary" @click="saveDraft()" size="small">
        保存草稿
      </el-button>
      <el-button type="primary" @click="submit()" size="small">
        提交申请
      </el-button>
    </div>
  </div>
</template>
<script>
// import { productList } from "@/api/order";
const defaultListQuery = {
  type: "",
  name: "",
  num: "",
  attribute: "",
};
export default {
  data() {
    return {
      productForm: Object.assign({}, defaultListQuery),
      productForms: [],
      prodctTypeList: [
        {
          label: "产品A",
          value: 0,
        },
        {
          label: "产品B",
          value: 1,
        },
        {
          label: "产品C",
          value: 2,
        },
      ],
      prodctNameList: [
        {
          label: "AA",
          value: 0,
        },
        {
          label: "BB",
          value: 1,
        },
        {
          label: "CC",
          value: 2,
        },
      ],
      prodctAttributeList: [],
    };
  },
  created() {
    this.getProductList();
    if(this.$route.query.id){
      this.productForms =[
        {
          type: 1,
           name: "ww",
           num: 10,
          attribute: "2",
        },{
          type: "3",
           name: "qq",
           num: 10,
          attribute: "2",
        }
      ]
    }
  },
  watch: {
    productForms: {
      handler: function (newVal) {
        this.getProductList(newVal);
      },
      deep: true,
    },
  },
  methods: {
    addProdctForm() {
      this.productForms.push({ type: "", name: "", num: "", attribute: "" });
    },
    removeProdctForm(index) {
      this.productForms.splice(index, 1);
    },
    getProductList() {
      // 请求接口
      //   productList(params).then((response) => {});
      // 产品分类获取到有效值后，再展示产品名称
    },
    saveDraft() {},
    submit() {},
  },
};
</script>
<style scoped>
.filter-container {
  width: 800px;
  margin: auto;
  margin-top: 20px;
}
.add-box {
  width: 400px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px solid #b4bccc;
  margin: 100px auto 30px;
}
</style>