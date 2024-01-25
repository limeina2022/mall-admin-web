import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/order/list',
    method:'get',
    params:params
  })
}

export function closeOrder(params) {
  return request({
    url:'/order/update/close',
    method:'post',
    params:params
  })
}

export function deleteOrder(params) {
  return request({
    url:'/order/delete',
    method:'post',
    params:params
  })
}

export function deliveryOrder(data) {
  return request({
    url:'/order/update/delivery',
    method:'post',
    data:data
  });
}

export function getOrderDetail(id) {
  return request({
    url:'/order/'+id,
    method:'get'
  });
}

export function updateReceiverInfo(data) {
  return request({
    url:'/order/update/receiverInfo',
    method:'post',
    data:data
  });
}

export function updateMoneyInfo(data) {
  return request({
    url:'/order/update/moneyInfo',
    method:'post',
    data:data
  });
}

export function updateOrderNote(params) {
  return request({
    url:'/order/update/note',
    method:'post',
    params:params
  })
}

// 获取产品分类名称
export function productListCategory(id) {
  let url = 'inventory/listCategory';
  if (id !== undefined && id !== null) {
    url = `/inventory/listCategory?categoryId=` + id;
  }
  return request({
    url: url,
    method: 'get'
  });
}
// 获取产品属性
export function productAttributes(id) {
  return request({
    url:'inventory/getAttributesByProductId/' + id,
    method:'get'
  });
}
// 保存草稿
export function productInsert(data) {
  return request({
    url:'/inventory/insert',
    method:'post',
    data:data
  });
}
// 列表
export function inventoryList(params) {
  return request({
    url:'/inventory/list',
    method:'get',
    params:params
  })
}
// 修改申请数据
export function editApplicationData(params) {
  return request({
    url:'/inventory/details',
    method:'get',
    params:params
  })
}
// 修改确认按钮
export function updateApplication(data) {
  return request({
    url:'/inventory/update',
    method:'post',
    data:data
  })
}
// 详情
export function applicationDetail(params) {
  return request({
    url:'/inventory/info',
    method:'get',
    params:params
  })
}
