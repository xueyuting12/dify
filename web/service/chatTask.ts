import { get, post, put } from './base'

const originUrl = 'http://10.7.0.240:9093/'

export type IGroupProps = {
  groupName: string
  groupId: string
}

export type IGroupPropsUnder = {
  group_name?: string
  group_id?: string
}

export type IChatItem = {
  msgId: string
  groupId?: string
  groupName?: string
  msgContent?: string
  msgType?: 'JOIN_GROUP' | 'TEXT' | 'IMAGE' | 'VOICE' | 'SHARING' | 'VIDEO'
  senderId?: string
  senderName?: string
  msgTime?: string
}

export type ITaskItem = {
  task_id?: number | string
  groupId?: string
  groupName?: string
  taskType?: string
  taskName?: string
  taskStatus?: string
  taskRemark?: string
  senderId?: string
  senderName?: string
  msgId?: string
  status?: 'waiting' | 'complete' | 'exist' | 'replace'
}

export type IUpdateCurrentTask = {
  replay_id: string
  msg_id: string
  model: string
  prompt: string
  group_id: string
  group_name: string
}

export const fetchChatGroup = () => {
  return get<IGroupProps[]>(`${originUrl}ai-ass/api/v1/msg/group/list`)
}

export const fetchChatList = (groupData: IGroupPropsUnder) => {
  return post<IChatItem[]>(`${originUrl}ai-ass/api/v1/msg/detail/list`, { body: groupData })
}

export const fetchTaskList = (groupData: IGroupPropsUnder) => {
  return post<ITaskItem[]>(`${originUrl}ai-ass/api/v1/msg/task/list`, { body: groupData })
}
/**
 * 获取当前消息生成的Task
 * @param content
 * @returns
 */
export const fetchCurrentTask = (content: IUpdateCurrentTask) => {
  return post(`${originUrl}ai-ass/api/v1/msg/replay`, { body: { ...content } })
}

export const fetchTaskExec = (content: any) => {
  return post(`${originUrl}api/v1/chat/inquiry`, { body: { ...content } })
}

export const fetchExecResponse = (conversationId: string) => {
  return post(`${originUrl}api/v1/inquiry/response`, { body: { conversationId } })
}

export const fetchCurrentLLM = () => {
  return get<string>(`${originUrl}ai-ass/api/v1/msg/llm`)
}

export const fetchLLMList = () => {
  return get<string[]>(`${originUrl}ai-ass/api/v1/msg/llm/list`)
}

export const updateLLM = (llm: string) => {
  return put(`${originUrl}ai-ass/api/v1/msg/llm?req=${llm}`)
}

export const fetchPrompt = () => {
  return get<string>(`${originUrl}ai-ass/api/v1/msg/prompt`)
}

export const updatePrompt = (content: string) => {
  return put<string>(`${originUrl}ai-ass/api/v1/msg/prompt`, { body: { content } })
}
