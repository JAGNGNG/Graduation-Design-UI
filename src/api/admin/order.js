import request from '@/utils/request'

// 查询订单;列表
export function listOrder(query) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单;详细
export function getOrder(id) {
  return request({
    url: '/admin/order/' + id,
    method: 'get'
  })
}

// 新增订单;
export function addOrder() {
  return request({
    url: '/admin/order/addOrder',
    method: 'get'
  })
}

// 修改订单;
export function updateOrder(data) {
  return request({
    url: '/admin/order',
    method: 'put',
    data: data
  })
}

// 删除订单;
export function delOrder(id) {
  return request({
    url: '/admin/order/' + id,
    method: 'delete'
  })
}

// 订单结算;
export function settlement(data) {
  return request({
    url: '/admin/order/settlement/' ,
    method: 'post',
    data: data
  })
}

// 订单退款 orderCancel
export function refund(id) {
  return request({
    url: '/admin/order/refund/' + id,
    method: 'get'
  })
}

// 订单取消
export function orderCancel(id) {
  return request({
    url: '/admin/order/cancel/' + id,
    method: 'get'
  })
}
