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
          :rules="rules"
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
              @change="getProductAttributes(index)"
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
          <el-form-item label="产品数量：">
            <el-input
              v-model.number="productForm.num"
              type="number"
              min="0"
              style="width: 190px"
              placeholder="请选择产品数量"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-for="attribute in productForm.attributes"
            :key="attribute.key"
            :label="attribute.label"
          >
            <el-select v-model="attribute.value" placeholder="请选择属性值">
              <el-option
                v-for="option in attribute.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="产品颜色：">
            <el-select
              v-model="productForm.color"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in prodctColorList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="产品尺寸：">
            <el-select
              v-model="productForm.attribute"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in prodctSizeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item> -->
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
import { productListCategory, productAttributes } from "@/api/order";
// import { fetchList } from "@/api/productCate";

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
      prodctTypeList: [],
      prodctNameList: [],
      // prodctColorList: [],
      // prodctSizeList: [],
      attributes: [],
      parentId: 0,
      rules: {
        type: [{ required: true, message: "请输入产品分类", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getProductListCategory();
    if (this.$route.query.id) {
      this.productForms = [
        {
          type: 1,
          name: "ww",
          num: 10,
          attribute: "2",
        },
        {
          type: "3",
          name: "qq",
          num: 10,
          attribute: "2",
        },
      ];
    }
  },
  // watch: {
  //   productForms: {
  //     handler: function (newVal) {
  //       this.getProductListCategory(newVal);
  //     },
  //     deep: true,
  //   },
  // },
  methods: {
    addProdctForm() {
      this.productForms.push({ type: "", name: "", num: "", attribute: "" });
    },

    removeProdctForm(index) {
      this.productForms.splice(index, 1);
    },
    // 点击产品分类，获取产品名称
    // loadProdctName(index) {
    //   const typeValue = this.productForms[index].type;
    //   productAttributes(this.Base64.encode(typeValue + "")).then((response) => {
    //     const responseData = JSON.parse(this.Base64.decode(response.data));
    //     console.log('responseData--', responseData)
    //     this.prodctNameList = responseData.map((obj) => {
    //       return {
    //         name: obj.productName,
    //         id: obj.id,
    //       };
    //     });
    //     this.productForms[index].name = "";
    //   });
    // },
    //  点击产品名称，获取属性值
    async getProductAttributes(index) {
      const nameValue = this.productForms[index].name;
      productAttributes(this.Base64.encode(nameValue + "")).then((response) => {
        const attrData = this.Base64.decode(response.data);
        console.log("attrData", JSON.parse(attrData)[0].spData);
      });

      // const data = await response.json();
      // this.attributes = data.attributes.map((attribute) => ({
      //   key: attribute.key,
      //   label: attribute.label,
      //   options: attribute.options.map((option) => ({
      //     value: option.value,
      //     label: option.label,
      //   })),
      //   value: "",
      // }));
    },

    getProductListCategory() {
      productListCategory().then((response) => {
        const productListData = this.Base64.decode(response.data);
        this.prodctTypeList = JSON.parse(productListData).map((obj) => {
          return {
            name:obj.productCategoryName,
            id: Math.floor(Math.random() * 100),
          };
        });
         this.prodctNameList = JSON.parse(productListData).map(obj =>{
          return {
            name: obj.productName,
            id: obj.productId,
          }
         })
      });
    },
    saveDraft() {
      let isValid = true;
      for (let i = 0; i < this.productForms.length; i++) {
        this.$refs.productFormRef[i].validate((valid) => {
          if (!valid) {
            isValid = false;
          }
        });
      }
      if (isValid) {
        console.log("校验通过");
      } else {
        console.log("校验不通过");
      }
    },
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