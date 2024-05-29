import { get } from './base'

const originUrl = 'http://10.7.0.240:9092/'

export const fetchChatGroup = () => {
  return get<any>(`${originUrl}api/v1/msg/group/list`)
}
