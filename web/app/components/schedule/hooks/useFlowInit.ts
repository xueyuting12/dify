import { useEdgesState, useNodesState } from 'reactflow'
import { useCallback, useEffect, useState } from 'react'
import { fetchAgentFlowById, fetchAgentFlowByVersion } from '@/service/schedule'
const useFlowInit = (flowId: string) => {
  const [agentFlowVersion, setAgentFlowVersion] = useState<string>('')
  const [agentFlowVersionList, setAgentFlowVersionList] = useState<string[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const fetchFlowForVersion = useCallback(async () => {
    const flowRes = await fetchAgentFlowById(flowId)
    if (flowRes && flowRes.data && flowRes.data.length > 0) {
      const version = agentFlowVersion || flowRes.data[0].version
      const flowVersions = flowRes.data.map(item => item.version)
      setAgentFlowVersionList(flowVersions)
      if (!version)
        return
      const res = await fetchAgentFlowByVersion(flowId, version)
      if (res && res.flow_content) {
        const agentNodesString = res.flow_content
        setAgentFlowVersion(version)
        if (agentNodesString) {
          const { nodes: ns, edges: es } = JSON.parse(agentNodesString)
          setNodes(ns)
          setEdges(es)
        }
        else {
          setNodes([])
          setEdges([])
        }
      }
    }
  }, [agentFlowVersion, flowId, setEdges, setNodes])
  useEffect(() => {
    fetchFlowForVersion()
  }, [fetchFlowForVersion])

  return {
    nodes, edges, onNodesChange, onEdgesChange, setEdges, setNodes, agentFlowVersion, setAgentFlowVersion, agentFlowVersionList,
  }
}

export default useFlowInit
