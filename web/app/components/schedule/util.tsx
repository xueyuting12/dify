import lodash from 'lodash'
import { type Agent, IHeaderType } from '@/models/schedule'
import { IAgentTypeEnum } from '@/models/node'

export const initAgentList = (list: Agent[]) => {
  const newList = list.map((l) => {
    if (l.multi_version && l.multi_version.length > 0)
      return { ...l, current_version: l.multi_version[0].version }
    return l
  })
  const groupByAgents = lodash.groupBy(newList, 'agent_type')
  const keys = lodash.keys(groupByAgents)
  let result: any[] = []
  result.push({
    name: IAgentTypeEnum.START,
    value: [
      {
        class_name: IAgentTypeEnum.START,
        agent_name: IAgentTypeEnum.START,
        agent_type: IAgentTypeEnum.START,
      },
    ],
  })
  const fetchNodes = keys.map((key) => {
    return {
      name: key,
      value: groupByAgents[key],
    }
  })
  result = result.concat(fetchNodes)
  result.push({
    name: IAgentTypeEnum.OUTPUT,
    value: [
      {
        class_name: IAgentTypeEnum.OUTPUT,
        agent_name: 'END',
        agent_type: IAgentTypeEnum.OUTPUT,
      },
    ],
  })
  return result || []
}

export const autoGeneraVersion = (version: string) => {
  const repVersion = version.replace('-snapshoot', '')
  const splitVersion = repVersion.split('.')
  if (Number(splitVersion[1]) === 50)
    return `${Number(splitVersion[0]) + 1}.0-snapshoot`
  return `${splitVersion[0]}.${Number(splitVersion[1]) + 1}-snapshoot`
}

export const getType = (type: keyof typeof IHeaderType) => {
  return IHeaderType[type]
}
