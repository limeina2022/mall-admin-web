<template>
  <div class="wrapper" v-if="showPage">
    <div v-for="(productForm, index) in productForms" :key="index">
      <el-card class="filter-container" shadow="never">
        <div style="display: flex; justify-content: space-between">
          <div>产品{{ index + 1 }}</div>
          <i class="el-icon-close" @click="removeProdctForm(index)"></i>
        </div>
        <el-form
          :model="productForm"
          ref="productFormRef"
          :rules="getRules(index)"
          size="small"
          label-width="220px"
        >
          <el-form-item label="产品分类：" prop="type">
            <span class="text-danger" style="color: red; margin: 0 10px 0 -9px"
              >*</span
            >
            <el-select
              v-model="productForm.type"
              class="input-width"
              placeholder="全部"
              clearable
              @change="getProductName(productForm)"
            >
              <el-option
                v-for="item in prodctTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品名称：" v-if="showProductName">
            <span class="text-danger" style="color: red; margin: 0 10px 0 -9px"
              >*</span
            >
            <el-select
              v-model="productForm.name"
              class="input-width"
              placeholder="全部"
              clearable
              @change="getProductAttributes(productForm)"
            >
              <el-option
                v-for="item in productNameList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品数量：" v-if="showProductName">
            <span class="text-danger" style="color: red; margin: 0 10px 0 -9px"
              >*</span
            >
            <el-input
              v-model.number="productForm.num"
              type="number"
              min="0"
              style="width: 190px"
              placeholder="请输入产品数量"
            ></el-input>
          </el-form-item>
          <el-form-item
            ref="attributeSelects"
            v-for="(attribute, index) in productForm.attributes"
            :key="attribute.key"
            :label="attribute.label"
          >
            <span
              class="text-danger"
              v-if="showAttribute"
              style="color: red; margin: 0 10px 0 -9px"
              >*</span
            >
            <el-select
              v-if="showAttribute"
              v-model="productForm.attributes[index].valueData"
              clearable
              placeholder="请选择属性值"
              @change="updateDom"
            >
              <el-option
                v-for="option in attribute.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
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
      <el-button
        type="primary"
        :disabled="!isFormComplete"
        @click="submit(0)"
        size="small"
      >
        保存草稿
      </el-button>
      <el-button
        type="primary"
        :disabled="!isFormComplete"
        @click="submit(1)"
        size="small"
      >
        提交申请
      </el-button>
    </div>
  </div>
</template>
<script>
import {
  productListCategory,
  productAttributes,
  productInsert,
  editApplicationData,
  updateApplication,
} from "@/api/order";
// import { fetchList } from "@/api/productCate";

const defaultListQuery = {
  type: "",
  name: "",
  num: "",
  attributes: "",
};
export default {
  data() {
    return {
      showAttribute: false,
      // productForm: Object.assign({}, defaultListQuery),
      productForms: [
        {
          type: "",
          name: "",
          num: "",
          attributes: [
            {
              valueData: "",
            },
          ],
        },
      ],
      prodctTypeList: [],
      productNameList: [],
      parentId: 0,
      showPage: false,
      isFormComplete: false,
      showProductName: false,
      // rules:[]
      rules(index) {
        // return {
        //   num: [{ required: true, message: "请输入产品数量", trigger: "blur" }],
        //   name: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
        // };
      },
    };
  },
  created() {
    this.getProductListCategory();
    // 编辑申请
    if (this.$route.query.id) {
      this.showAttribute = true;
      this.editApplicationDataDetail();
    } else {
      this.showPage = true;
    }
  },
  watch: {
    productForms: {
      deep: true,
      handler() {
        this.checkFormCompletion();
      },
    },
  },
  methods: {
    checkFormCompletion() {
      this.isFormComplete = this.productForms.every((product) => {
        return (
          product.type &&
          product.name &&
          product.num &&
          product.attributes.every((attribute) => attribute.valueData)
        );
      });
    },
    getRules(index) {
      // return {
      //   type: [{ required: true, message: "请输入类型", trigger: "blur" }],
      //   num: [{ required: true, message: "请输入数量", trigger: "blur" }],
      //   name: [{ required: true, message: "请输入名称", trigger: "blur" }],
      // };
    },
    addProdctForm() {
      this.productForms.push({ type: "", name: "", num: "", attributes: "" });
    },

    removeProdctForm(index) {
      this.productForms.splice(index, 1);
    },
    //  点击产品名称，获取属性值
    async getProductAttributes(productForm) {
      if (productForm.name == "") {
        return;
      }
      const nameValue = productForm.name;
      productAttributes(this.Base64.encode(nameValue + "")).then((response) => {
        const data = this.Base64.decode(response.data);
        const input = JSON.parse(data);
        productForm.attributes = this.convertToSelectOptioData(input);
        if (productForm.attributes.length > 0) {
          this.showAttribute = true;
        }
        this.$forceUpdate();
      });
    },
    getProductName(productForm) {
      if (productForm.type == "") {
        return;
      }
      productListCategory(this.Base64.encode(productForm.type + "")).then(
        (response) => {
          const productNameData = this.Base64.decode(response.data);
          this.productNameList = JSON.parse(productNameData).map((obj) => {
            return {
              name: obj.productName,
              id: obj.productId,
            };
          });
          this.showProductName = true;
        }
      );
    },
    updateDom() {
      // this.$forceUpdate();
    },

    getProductListCategory() {
      productListCategory().then((response) => {
        const productListData = this.Base64.decode(response.data);
        this.prodctTypeList = JSON.parse(productListData).map((obj) => {
          return {
            name: obj.productCategoryName,
            id: obj.productCategoryId,
          };
        });
        this.showPage = true;
      });
    },
    submit(statusVal) {
      // let isValid = true;
      // for (let i = 0; i < this.productForms.length; i++) {
      //   this.$refs.productFormRef[i].validate((valid) => {
      //     if (!valid) {
      //       isValid = false;
      //     }
      //   });
      // }

      // if (isValid) {
      const data = this.convertParamsData(this.productForms, statusVal);
      if (this.$route.query.id) {
        // 修改申请接口
        const data1 = this.convertParamsData1(this.productForms, statusVal);
        const params = {
          id: this.$route.query.id,
          list: data1,
        };
        const paramsData = JSON.stringify(params);
        updateApplication(this.Base64.encode(paramsData)).then((response) => {
          this.$message.success(response.message);
          this.$router.push("/oms/returnApplication");
        });
      } else {
        // 新建接口
        const paramsData = JSON.stringify(data);
        productInsert(this.Base64.encode(paramsData)).then((response) => {
          this.$message.success(response.message);
          this.$router.push("/oms/returnApplication");
        });
      }
      // } else {
      //   this.$message.warning("请填写必选项");
      // }
    },
    editApplicationDataDetail() {
      const params = {
        id: this.Base64.encode(this.$route.query.id.toString()),
      };
      editApplicationData(params).then((response) => {
        const data = this.Base64.decode(response.data);
        this.productForms = this.echoApplicaitonData(JSON.parse(data));
        this.showPage = true;
        // const data1 = [
        //   {
        //     productId: 28,
        //     productName:
        //       "小米 红米5A 全网通版 3GB+32GB 香槟金 移动联通电信4G手机 双卡双待",
        //     productCategoryId: 19,
        //     productCategoryName: "手机通讯",
        //     stock: 12,
        //     spData2Json: {
        //       颜色: "金色,红色",
        //       容量: "64G",
        //       尺寸: "39",
        //       风格: "夏季,秋季",
        //     },
        //     spData2JsonArray: [
        //       { key: "颜色", value: "金色" },
        //       { key: "容量", value: "64g" },
        //     ],
        //   },
        //   {
        //     productId: 22,
        //     productName:
        //       "大米 红米5A 全网通版 3GB+32GB 香槟金 移动联通电信4G手机 双卡双待",
        //     productCategoryId: 19,
        //     productCategoryName: "手机通讯",
        //     spData2Json: {
        //       颜色: "金色,红色",
        //       容量: "64g,16g",
        //       尺寸: "39,38",
        //       风格: "夏季,秋季",
        //     },
        //     spData2JsonArray: [
        //       { key: "颜色", value: "金色" },
        //       { key: "容量", value: "64g" },
        //     ],
        //   },
        // ];
        // this.productForms = this.echoApplicaitonData(data1);
        // console.log('mock数据this.productForms',this.productForms)
      });
    },
    convertToSelectOptioData(input) {
      // 接受的数据格式
      // const input = {
      //   "颜色": "红色,蓝色",
      //   "尺寸": "38,39",
      //   "风格": "秋季,夏季",
      // };

      const output = [];

      // 循环处理每一项
      for (const key in input) {
        const item = {
          key: key,
          label: key,
          options: [],
        };

        // 处理选项
        const options = input[key].split(",");
        for (let i = 0; i < options.length; i++) {
          item.options.push({
            value: options[i],
            label: options[i],
          });
        }

        output.push(item);
      }
      return output;
    },
    // 提交申请数据处理
    convertParamsData(formVal, statusVal) {
      return formVal.map((item) => {
        const attributes = item.attributes.map((attr) => ({
          key: attr.key,
          value: attr.valueData,
        }));

        return {
          productId: item.name,
          stock: item.num,
          spData: JSON.stringify(attributes),
          status: statusVal,
          type: 2,
        };
      });
    },
    // 提交申请数据处理
    convertParamsData1(formVal, statusVal) {
      return formVal.map((item) => {
        const attributes = item.attributes.map((attr) => ({
          key: attr.key,
          value: attr.valueData,
        }));

        return {
          productId: item.productId || item.name,
          stock: item.num,
          spData: JSON.stringify(attributes),
          status: statusVal,
          type: 2,
        };
      });
    },
    // 修改按钮回显数据处理
    echoApplicaitonData(data) {
      return data.map((item) => {
        const attributes = [];
        for (const key in item.spData2Json) {
          const options = item.spData2Json[key]
            .split(",")
            .map((value) => ({ label: value, value }));

          const entity = item.spData2JsonArray.find((attr) => attr.key === key);
          const selectedValue = entity ? entity.value : "";

          attributes.push({
            key,
            label: key,
            valueData: selectedValue,
            options,
          });
        }
        return {
          type: item.productCategoryName,
          categoryId: item.productCategoryId,
          name: item.productName,
          productId: item.productId,
          num: item.stock,
          attributes,
        };
      });
    },
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