import { del, get, patch, post } from './base'
import type {
  AgentFlowCreateResponse,
  AgentFlowDeleteResponse,
  AgentFlowDetailSaveRequest,
  AgentFlowDetailSaveResponse,
  AgentFlowListResponse,
} from '@/models/schedule'

export const fetchAgentFlowList = () => {
  return get<AgentFlowListResponse>('/agent_flow')
}

export const fetchCreateAgentFlow = (name: string, description: string) => {
  return post<AgentFlowCreateResponse>('/agent_flow', {
    body: {
      name,
      description,
    },
  })
}

export const fetchDeleteAgentFlow = (flowId: string) => {
  return del<AgentFlowDeleteResponse>(`/agent_flow/${flowId}`)
}

export const fetchUpdateAgentFlow = (
  flowId: string,
  name: string,
  description: string,
) => {
  return patch<AgentFlowDeleteResponse>(`/agent_flow/${flowId}`, {
    body: {
      name,
      description,
    },
  })
}

export const fetchAgentFlowById = (agentFlowId: string) => {
  return get<{ data?: any[] }>(`/agent_flow_version?agent_flow_id=${agentFlowId}`)
}

export const fetchAgentFlowByVersion = (agentFlowId: string, version: string) => {
  return get<{ flow_content?: string }>(`/agent_flow_version/${agentFlowId}/${version}`)
}
/** 左侧任务栏 agentList */
export const fetchAgentList = () => {
  return get('/agent')
}

export const fetchSaveAgentFlowDetail = (params: AgentFlowDetailSaveRequest) => {
  return post<AgentFlowDetailSaveResponse>('/agent_flow_version', {
    body: {
      ...params,
    },
  })
}

export const fetchAgentFlowJson = (agentFlowId: string, version: string) => {
  return get<{
    message: string
    entry_point?: string
  }>(`/open/agent_flow_version/${agentFlowId}/${version}`)
}
