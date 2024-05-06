import React from 'react'
import classNames from 'classnames'
import styles from './index.module.css'
import type { Agent } from '@/models/schedule'
import type { Item } from '@/app/components/base/dropdown'
import Dropdown from '@/app/components/base/dropdown'
import { getType } from '@/app/components/schedule/util'

type IProps = {
  data: Agent
  handleSelectVersion?: (name: string, version: string) => void
}
const Block = ({ data, handleSelectVersion }: IProps) => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    node: string,
  ) => {
    event.dataTransfer.setData('application/reactflow', node)
    event.dataTransfer.effectAllowed = 'move'
  }
  const options = data?.multi_version?.map(v => ({ value: v.version || '', text: v.version || '' })).filter(f => f.value) || []
  const agentName = data.current_version ? `${data.agent_name}_${data.current_version}` : `${data.agent_name}`
  const handleDropSelect = (item: Item) => {
    handleSelectVersion?.(data.agent_name, item.value as string)
  }
  return (
    <div
      className={styles.blockContainer}
      onDragStart={event => onDragStart(event, JSON.stringify(data))}
      draggable
    >
      <div className={classNames(styles[getType(data.agent_type)], styles.commonIcon)}/>
      <span className={styles.agentName}>{agentName}</span>
      {options.length > 1 && <Dropdown
        items={options}
        onSelect={handleDropSelect}
        popupClassName="z-[70]"
      />}
    </div>
  )
}
export default Block
