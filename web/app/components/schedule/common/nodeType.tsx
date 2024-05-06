import React from 'react'
import { Handle, Position } from 'reactflow'
import classNames from 'classnames'
import useCalculatePosition from '../hooks/useCalculatePosition'
import styles from './index.module.css'
import CommonHeader from './components/common-header'
import type { IHeaderType } from '@/models/schedule'

type IProps = {
  id: string
  data: { label: string; conditionMapping: { name: string }[];version: string }
  type: keyof typeof IHeaderType
  selected: boolean
}
const DEFAULT_HANDLE_STYLE = {
  width: 12,
  height: 12,
}
/** 默认节点 */
const CustomNode = ({ data: { label, conditionMapping = [], version }, type, selected, id }: IProps) => {
  const containerRef = useCalculatePosition(id)

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ ...DEFAULT_HANDLE_STYLE, background: 'rgb(156, 162, 168)' }}/>
      <div className={selected ? styles.blockContainerSelected : styles.blockContainer} ref={containerRef}>
        <CommonHeader type={type} version={version} label={label}/>
        {conditionMapping.length
          ? conditionMapping.map((item) => {
            return <Handle type="source" position={Position.Right} key={item.name} style={{
              ...DEFAULT_HANDLE_STYLE,
              background: 'rgb(54, 173, 239)',
            }}/>
          })
          : <Handle type="source" position={Position.Right} style={{
            ...DEFAULT_HANDLE_STYLE,
            background: 'rgb(231, 209, 24)',
          }}/>}
      </div>
    </>
  )
}

/** 判断节点 */
const ConditionNode = ({ data: { label, conditionMapping = [], version }, id, type, selected }: IProps) => {
  const containerRef = useCalculatePosition(id)

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ ...DEFAULT_HANDLE_STYLE, background: 'rgb(156, 162, 168)' }}/>
      <div className={classNames(selected ? styles.blockContainerSelected : styles.blockContainer)} ref={containerRef}>
        <CommonHeader type={type} version={version} label={label}/>
        {conditionMapping.length
          ? conditionMapping.map((item, index) => {
            return <div key={item.name} className={id} style={{ position: 'absolute', right: 0 }}>
              <div style={{ marginRight: 12, fontSize: 10 }}>{item.name}</div>
              <Handle type="source" position={Position.Right} id={item.name} style={{
                ...DEFAULT_HANDLE_STYLE,
                background: 'rgb(54, 173, 239)',
              }}/>
            </div>
          })
          : <Handle type="source" position={Position.Right} />}
      </div>
    </>
  )
}
/** 出口 */
const InputNode = ({ data: { label, version }, type, selected }: IProps) => (
  <>
    <Handle type="source" position={Position.Right} style={{ ...DEFAULT_HANDLE_STYLE, background: 'rgb(54, 173, 239)' }}/>
    <div className={selected ? styles.blockContainerSelected : styles.blockContainer} >
      <CommonHeader type={type} version={version} label={label}/>
    </div>
  </>
)

/** 出口 */
const OutputNode = ({ data: { label, version }, type, selected }: IProps) => (
  <>
    <Handle type="target" position={Position.Left} style={{ ...DEFAULT_HANDLE_STYLE, background: 'rgb(156, 162, 168)' }}/>
    <div className={selected ? styles.blockContainerSelected : styles.blockContainer} >
      <CommonHeader type={type} version={version} label={label}/>
    </div>
  </>
)
export {
  OutputNode,
  CustomNode,
  ConditionNode,
  InputNode,
}
