<template>
  <div class="wrapper">
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
          <el-form-item label="产品分类：">
            <el-select
              v-model="productForm.type"
              class="input-width"
              placeholder="全部"
              clearable
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
          <el-form-item label="产品名称：">
            <el-select
              v-model="productForm.name"
              class="input-width"
              placeholder="全部"
              clearable
              @change="getProductAttributes(productForm)"
            >
              <el-option
                v-for="item in prodctNameList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品数量：" prop="num">
            <el-input
              v-model.number="productForm.num"
              type="number"
              min="0"
              style="width: 190px"
              placeholder="请选择产品数量"
            ></el-input>
          </el-form-item>
          <el-form-item
            ref="attributeSelects"
            v-for="(attribute, index) in productForm.attributes"
            :key="attribute.key"
            :label="attribute.label"
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
      <el-button type="primary" @click="submit(0)" size="small">
        保存草稿
      </el-button>
      <el-button type="primary" @click="submit(1)" size="small">
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
      prodctNameList: [],
      parentId: 0,
      // rules:[]
      rules(index) {
        return {
          num: [{ required: true, message: "请输入产品数量", trigger: "blur" }],
        };
      },
    };
  },
  created() {
    this.getProductListCategory();
    // 编辑申请
    if (this.$route.query.id) {
      this.showAttribute = true;
      this.editApplicationDataDetail();
    }
  },
  methods: {
    getRules(index) {
      return {
        num: [{ required: true, message: "请输入数量", trigger: "blur" }],
        // 其他字段校验规则
      };
    },
    addProdctForm() {
      this.productForms.push({ type: "", name: "", num: "", attributes: "" });
    },

    removeProdctForm(index) {
      this.productForms.splice(index, 1);
    },
    //  点击产品名称，获取属性值
    async getProductAttributes(productForm) {
      // const nameValue = this.productForms[index].name;
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
    updateDom() {
      // this.$forceUpdate();
    },

    getProductListCategory() {
      productListCategory().then((response) => {
        const productListData = this.Base64.decode(response.data);
        this.prodctTypeList = JSON.parse(productListData).map((obj) => {
          return {
            name: obj.productCategoryName,
            // id: Math.floor(Math.random() * 100),
            id: obj.productId,
          };
        });
        this.prodctNameList = JSON.parse(productListData).map((obj) => {
          return {
            name: obj.productName,
            id: obj.productId,
          };
        });
      });
    },
    submit(statusVal) {
      let isValid = true;
      for (let i = 0; i < this.productForms.length; i++) {
        this.$refs.productFormRef[i].validate((valid) => {
          if (!valid) {
            isValid = false;
          }
        });
      }
      if (isValid) {
        const data = this.convertParamsData(this.productForms, statusVal);
        const paramsData = JSON.stringify(data);
        productInsert(this.Base64.encode(paramsData)).then((response) => {
          this.$message.success(response.message);
          this.$router.push('/oms/order')
        });
      } else {
        console.log("校验不通过");
      }
    },
    editApplicationDataDetail() {
      const params = {
        id: this.Base64.encode(this.$route.query.id.toString()),
      };
      editApplicationData(params).then((response) => {
        console.log("调通了咩", this.Base64.decode(response.data));
      });
      // this.productForms = [
      //   {
      //     type: 1,
      //     name: "ww",
      //     num: 10,
      //     attributes: [
      //       {
      //         key: "颜色",
      //         label: "颜色",
      //         valueData: "黑色",
      //         options: [
      //           {
      //             label: "黑色",
      //             value: "黑色",
      //           },
      //           {
      //             label: "蓝色",
      //             value: "蓝色",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      //   {
      //     type: "3",
      //     name: "qq",
      //     num: 10,
      //     attributes: "2",
      //   },
      // ];
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
          key: key.toLowerCase(),
          label: key,
          options: [],
        };

        // 处理选项
        const options = input[key].split(",");
        for (let i = 0; i < options.length; i++) {
          item.options.push({
            value: options[i].toLowerCase(),
            label: options[i],
          });
        }

        output.push(item);
      }
      return output;
    },
    convertParamsData(formVal, statusVal) {
      //  spData: JSON.stringify(attributes),
      return formVal.map((item) => {
        const attributes = item.attributes.map((attr) => ({
          key: attr.key,
          value: attr.valueData,
        }));

        return {
          productId: item.type,
          stock: item.num,
          spData: JSON.stringify(attributes),
          status: statusVal,
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