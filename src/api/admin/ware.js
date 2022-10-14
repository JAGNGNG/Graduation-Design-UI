import request from '@/utils/request'

// 查询库存信息;列表
export function listWare(query) {
  return request({
    url: '/admin/ware/list',
    method: 'get',
    params: query
  })
}

// 查询库存信息;详细
export function getWare(id) {
  return request({
    url: '/admin/ware/' + id,
    method: 'get'
  })
}

// 新增库存信息;
export function addWare(data) {
  return request({
    url: '/admin/ware',
    method: 'post',
    data: data
  })
}

// 修改库存信息;
export function updateWare(data) {
  return request({
    url: '/admin/ware',
    method: 'put',
    data: data
  })
}

// 删除库存信息;
export function delWare(id) {
  return request({
    url: '/admin/ware/' + id,
    method: 'delete'
  })
}
