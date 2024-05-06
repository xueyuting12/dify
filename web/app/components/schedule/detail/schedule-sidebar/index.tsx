import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { initAgentList } from '../../util'
import Block from './components/block'
import styles from './index.module.css'

import type { Agent } from '@/models/schedule'
type IProps = {
  agentList: Agent[]
  visible: boolean
}

const AGENT_NAME = {
  COMMON: '公共',
  CONDITION: '工具',
  OUTPUT: '结束',
  START: '开始',
}
type IInitAgentItem = {
  name: string
  value: Agent[]
}
const ScheduleSideBar: FC<IProps> = ({ agentList = [], visible = false }) => {
  const [agents, setAgents] = useState<IInitAgentItem[]>([])
  const [display, setDisplay] = useState(visible)
  useEffect(() => {
    const result = initAgentList(agentList)
    setAgents(result)
  }, [agentList])

  useEffect(() => {
    setDisplay(visible)
  }, [visible])

  const handleSelectVersion = (name: string, version: string) => {
    const newAgents: React.SetStateAction<{ name: string; value: Agent[] }[]> = []
    agents.forEach((a) => {
      const newValue = a?.value?.map((v) => {
        if (v.agent_name === name)
          return { ...v, current_version: version }
        return v
      })
      newAgents.push({ name: a.name, value: newValue })
    })
    setAgents(newAgents)
  }
  const handleClick = () => {
    setDisplay(!display)
  }
  return (
    <>
      <div className={classNames(styles.sidebarController, 'flex justify-center items-center', {
        [styles.sidebarControllerHide]: !display,
      })} onClick={handleClick}></div>
      <div className={classNames(styles.scheduleSidebarContainer, {
        [styles.scheduleSidebarContainerHide]: !display,
      })} >
        {agents?.map((classAgent) => {
          return (
            <div key={classAgent.name}>
              <div>{AGENT_NAME[classAgent?.name as keyof typeof AGENT_NAME]}</div>
              {classAgent?.value.map((item) => {
                return (
                  <Block
                    data={item}
                    key={item.agent_name}
                    handleSelectVersion={handleSelectVersion}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default React.memo(ScheduleSideBar)
