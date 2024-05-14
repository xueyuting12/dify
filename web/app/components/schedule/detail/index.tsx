'use client'
import type { FC } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import type { Connection } from 'reactflow'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Panel,
  ReactFlowProvider,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { t } from 'i18next'
import classNames from 'classnames'
import { ConditionNode, CustomNode, InputNode, OutputNode } from '../common/nodeType'

import useInitFlow from '../hooks/useFlowInit'
import { useCopyData } from '../hooks/useCopyData'
import Toast from '../../base/toast'
import { autoGeneraVersion } from '../util'
import CustomEdge from '../common/edgeType'
import type { Item } from '../../base/dropdown'
import Dropdown from '../../base/dropdown'
import ScheduleSideBar from './schedule-sidebar'
import styles from './index.module.css'
import IntoDialog from './into-dialog'
import { fetchAgentFlowJson, fetchAgentList, fetchSaveAgentFlowDetail } from '@/service/schedule'
import { type Agent, IEdgeType } from '@/models/schedule'
import { IAgentTypeEnum } from '@/models/node'
type IProps = {}
// let id = 0
const getId = () => `dndnode_${Date.now()}`
const TaskSchedule: FC<IProps> = () => {
  const reactFlowWrapper = useRef(null)

  const [reactFlowInstance, setReactFlowInstance] = useState()
  const [showIntoDialog, setShowIntoDialog] = useState(false)

  const agent_flow_id = useSearchParams().get('id') || ''
  const { copyData } = useCopyData()
  /** 初始化页面节点与连接关系 */
  const { nodes, edges, setNodes, setEdges, onEdgesChange, onNodesChange, agentFlowVersion, setAgentFlowVersion, agentFlowVersionList } = useInitFlow(agent_flow_id)
  /** 获取具体版本的 agent List */
  const { data: agentList } = useSWR('/fetchAgentList', fetchAgentList) as { data: { data: Agent[] } }

  const nodeTypes = {
    COMMON: CustomNode,
    CONDITION: ConditionNode,
    OUTPUT: OutputNode,
    START: InputNode,
  }
  const edgeTypes = {
    CUSTOMEDGE: CustomEdge,
  }
  // 手动连接Node之间的Edge时 这个函数会触发
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge({ ...params, animated: true, style: { stroke: '#000', strokeWidth: 2 }, type: IEdgeType.CUSTOMEDGE, markerEnd: { type: MarkerType.Arrow, color: '#000' } }, eds),
      ),
    [setEdges],
  )
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const nodeInfoString = event.dataTransfer.getData('application/reactflow')
      if (typeof nodeInfoString === 'undefined' || !nodeInfoString)
        return
      const { agent_name, agent_type, current_version, multi_version = [], id, class_name } = JSON.parse(nodeInfoString) as Agent
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: getId(),
        type: agent_type,
        position,
        data: {
          // label: agent_name,
          label: (multi_version && multi_version[0]) ? multi_version[0].agent_chinese_name : agent_name,
          version: current_version,
          conditionMapping: multi_version?.find(item => item.version === current_version)?.condition_mapping,
          className: class_name,

        },
      }

      setNodes(nds => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )
  const handleInto = () => {
    setShowIntoDialog(true)
  }

  const hideIntoDialog = () => setShowIntoDialog(false)

  const handleIntoSuccess = (json: string) => {
    try {
      const { nodes: ns, edges: es } = JSON.parse(json)
      setNodes(ns)
      setEdges(es)
      hideIntoDialog()
    }
    catch (error) {

    }
  }

  const handleOutJson = useCallback(() => {
    const json = JSON.stringify({ nodes, edges })
    copyData(json, t('schedule.exportSuccess'), 2000)
  }, [nodes, edges, copyData])

  const handleScanJson = useCallback(async () => {
    const res = await fetchAgentFlowJson(agent_flow_id, agentFlowVersion)
    if (res?.entry_point) {
      copyData(JSON.stringify(res), t('schedule.exportSuccess'), 2000)
    }
    else if (res?.message) {
      Toast.notify({
        message: res.message,
        type: 'error',
        duration: 2000,
      })
    }
  }, [agentFlowVersion, agent_flow_id, copyData])

  const handleSave = async (isPublish?: boolean) => {
    if (nodes.length === 0 && edges.length === 0) {
      Toast.notify({
        message: t('schedule.saveFail'),
        type: 'error',
        duration: 2000,
      })
      return
    }
    if (!nodes.find(n => n.type === IAgentTypeEnum.OUTPUT)) {
      Toast.notify({
        message: t('schedule.saveNoEnd'),
        type: 'error',
        duration: 2000,
      })
      return
    }
    if (!nodes.find(n => n.type === IAgentTypeEnum.START)) {
      Toast.notify({
        message: t('schedule.saveNoStart'),
        type: 'error',
        duration: 2000,
      })
      return
    }
    let version = '1.0-snapshoot'
    const lastedSnapVersion = agentFlowVersionList.filter(item => item.includes('snapshoot'))[0] || agentFlowVersion
    if (agentFlowVersion) {
      if (isPublish)
        version = agentFlowVersion.replace('-snapshoot', '')
      else
        version = autoGeneraVersion(lastedSnapVersion)
    }
    else {
      if (isPublish)
        version = version.replace('-snapshoot', '')
    }
    const params = {
      agent_flow_id,
      flow_content: JSON.stringify({ nodes, edges }),
      version,
    }
    const res = await fetchSaveAgentFlowDetail(params)
    if (res && res.agent_flow_id) {
      setAgentFlowVersion(version)
      Toast.notify({
        message: t('schedule.saveSuccess'),
        type: 'success',
        duration: 2000,
      })
    }
    else if (res?.message) {
      Toast.notify({
        message: res.message,
        type: 'error',
        duration: 2000,
      })
    }
  }

  const handlePublish = () => {
    handleSave(true)
  }
  const flowVersionList = agentFlowVersionList.map(item => ({ value: item, text: item }))
  const handleDropSelect = (item: Item) => {
    setAgentFlowVersion(item.text as string)
  }
  return <>
    <ReactFlowProvider>
      <ScheduleSideBar agentList={agentList?.data || []} visible={!agentFlowVersion} />
      <div ref={reactFlowWrapper} style={{ height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          edges={edges}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          // onNodesDelete={onNodesDelete}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          {/* <MiniMap /> */}
          <Panel position="top-right" className={styles.customeBtn}>
            <div className={styles.btnContainer}>
              <div className={classNames(styles.versionBtn, 'flex justify-center items-center')}>
                <span style={{ marginRight: 2 }}>V{agentFlowVersion}</span>
                <Dropdown
                  items={flowVersionList}
                  onSelect={handleDropSelect}
                  popupClassName="z-[70]"
                />
              </div>
              <div className={styles.intoBtn} onClick={handleInto} />
              <div className={styles.outBtn} onClick={handleOutJson} />
              <div className={styles.scanBtn} onClick={handleScanJson}/>
              <div className={styles.saveBtn} onClick={() => handleSave()} />
              {agentFlowVersion.includes('snapshoot') && <div className={styles.publishBtn} onClick={handlePublish}>发布</div>}
            </div>
          </Panel>
          {showIntoDialog && <IntoDialog onSuccess={handleIntoSuccess} isShow={showIntoDialog} onClose={hideIntoDialog} />}
          <Controls position='bottom-right' style={{ display: 'flex' }}/>
        </ReactFlow>
      </div>
    </ReactFlowProvider>

  </>
}

export default React.memo(TaskSchedule)
