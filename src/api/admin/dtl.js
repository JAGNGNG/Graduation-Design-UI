import request from '@/utils/request'

// 查询订单明细;列表
export function listDtl(query) {
  return request({
    url: '/admin/dtl/list',
    method: 'get',
    params: query
  })
}

// 查询订单明细;详细
export function getDtl(id) {
  return request({
    url: '/admin/dtl/' + id,
    method: 'get'
  })
}

// 新增订单明细;
export function addDtl(data) {
  return request({
    url: '/admin/dtl',
    method: 'post',
    data: data
  })
}

// 修改订单明细;
export function updateDtl(data) {
  return request({
    url: '/admin/dtl',
    method: 'put',
    data: data
  })
}

// 删除订单明细;
export function delDtl(id) {
  return request({
    url: '/admin/dtl/' + id,
    method: 'delete'
  })
}
