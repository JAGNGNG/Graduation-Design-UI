import request from '@/utils/request'

// 查询会员账户余额变动明细;列表
export function listBalance(query) {
  return request({
    url: '/admin/balance/list',
    method: 'get',
    params: query
  })
}

// 查询会员账户余额变动明细;详细
export function getBalance(id) {
  return request({
    url: '/admin/balance/' + id,
    method: 'get'
  })
}

// 新增会员账户余额变动明细;
export function addBalance(data) {
  return request({
    url: '/admin/balance',
    method: 'post',
    data: data
  })
}

// 修改会员账户余额变动明细;
export function updateBalance(data) {
  return request({
    url: '/admin/balance',
    method: 'put',
    data: data
  })
}

// 删除会员账户余额变动明细;
export function delBalance(id) {
  return request({
    url: '/admin/balance/' + id,
    method: 'delete'
  })
}
