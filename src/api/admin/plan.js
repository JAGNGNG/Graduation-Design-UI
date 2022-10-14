import request from '@/utils/request'

// 查询员工排班计划;列表
export function listPlan(query) {
  return request({
    url: '/admin/plan/list',
    method: 'get',
    params: query
  })
}

// 查询员工排班计划;详细
export function getPlan(id) {
  return request({
    url: '/admin/plan/' + id,
    method: 'get'
  })
}

// 新增员工排班计划;
export function addPlan(data) {
  return request({
    url: '/admin/plan',
    method: 'post',
    data: data
  })
}

// 修改员工排班计划;
export function updatePlan(data) {
  return request({
    url: '/admin/plan',
    method: 'put',
    data: data
  })
}

// 删除员工排班计划;
export function delPlan(id) {
  return request({
    url: '/admin/plan/' + id,
    method: 'delete'
  })
}
