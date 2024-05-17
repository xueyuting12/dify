export type AgentFlowItem = {
  id: string
  name: string
  description: string
}
export type AgentFlowListResponse = {
  data: AgentFlowItem[]
  has_more: boolean
  limit: number
  page: number
  total: number
}

export type AgentFlowCreateResponse = {}
export type AgentFlowDeleteResponse = {
  result: boolean
}

export type AgentFlowVersionItem = {
  id: string
  agent_flow_id: string
  version: string
  flow_content: string
  created_by: string
  created_at: number
  updated_by: string
  updated_at: number
}

export type AgentFlowVersionResponse = {
  data: AgentFlowVersionItem[]
}

export type IAgentMultiVersion = {
  version?: string
  condition_mapping?: { name: string }[]
  id: String
  desc: String
  agent_chinese_name: String
}

export type Agent = {
  agent_name: string
  agent_type: keyof typeof IHeaderType
  class_name: string
  created_time: string | null
  id: number
  updated_time: string | null
  multi_version?: IAgentMultiVersion[]
  current_version?: string
}

export type INode = {
  class_name: string
  key: string
  version?: string
  action: string
}

export type IEdge = {
  start_key: string
  end_key: string
}

export type IConditionalEdge = {
  start_key: string
  condition: string
  condition_class_name: string
  conditional_edge_mapping: { [key: string]: string }
}

export type IGraphData = {
  nodes: INode[]
  entry_point: string
  edges: IEdge[]
  conditional_edges: IConditionalEdge[]
}

export type AgentFlowDetailSaveRequest = {
  version?: string
  agent_flow_id?: string
  flow_content?: string
}

export type AgentFlowDetailSaveResponse = {
  agent_flow_id?: string
  status?: number
  message?: string
}

export enum IHeaderType {
  COMMON = 'common',
  CONDITION = 'condition',
  OUTPUT = 'output',
  START = 'start',
}

export enum IEdgeType {
  CUSTOMEDGE = 'CUSTOMEDGE',
}
