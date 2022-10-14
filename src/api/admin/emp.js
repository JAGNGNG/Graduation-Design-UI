import request from '@/utils/request'

// 查询员工信息;列表
export function listEmp(query) {
  return request({
    url: '/admin/emp/list',
    method: 'get',
    params: query
  })
}

// 查询员工信息;详细
export function getEmp(id) {
  return request({
    url: '/admin/emp/' + id,
    method: 'get'
  })
}

// 新增员工信息;
export function addEmp(data) {
  return request({
    url: '/admin/emp',
    method: 'post',
    data: data
  })
}

// 修改员工信息;
export function updateEmp(data) {
  return request({
    url: '/admin/emp',
    method: 'put',
    data: data
  })
}

// 删除员工信息;
export function delEmp(id) {
  return request({
    url: '/admin/emp/' + id,
    method: 'delete'
  })
}
