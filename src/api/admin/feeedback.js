import request from '@/utils/request'

// 查询顾客反馈记录;列表
export function listFeeedback(query) {
  return request({
    url: '/admin/feeedback/list',
    method: 'get',
    params: query
  })
}

// 查询顾客反馈记录;详细
export function getFeeedback(id) {
  return request({
    url: '/admin/feeedback/' + id,
    method: 'get'
  })
}

// 新增顾客反馈记录;
export function addFeeedback(data) {
  return request({
    url: '/admin/feeedback',
    method: 'post',
    data: data
  })
}

// 修改顾客反馈记录;
export function updateFeeedback(data) {
  return request({
    url: '/admin/feeedback',
    method: 'put',
    data: data
  })
}

// 删除顾客反馈记录;
export function delFeeedback(id) {
  return request({
    url: '/admin/feeedback/' + id,
    method: 'delete'
  })
}
