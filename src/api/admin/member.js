import request from '@/utils/request'

// 查询会员信息;列表
export function listMember(query) {
  return request({
    url: '/admin/member/list',
    method: 'get',
    params: query
  })
}

// 查询会员信息;详细
export function getMember(id) {
  return request({
    url: '/admin/member/' + id,
    method: 'get'
  })
}

// 新增会员信息;
export function addMember(data) {
  return request({
    url: '/admin/member',
    method: 'post',
    data: data
  })
}

// 修改会员信息;
export function updateMember(data) {
  return request({
    url: '/admin/member',
    method: 'put',
    data: data
  })
}

// 删除会员信息;
export function delMember(id) {
  return request({
    url: '/admin/member/' + id,
    method: 'delete'
  })
}
