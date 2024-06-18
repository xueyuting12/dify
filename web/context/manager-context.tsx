'use client'

import { createContext, useContext } from 'use-context-selector'
import type { IGroupPropsUnder } from '@/service/chatTask'

type IExecListItem = {
  conversition_id: string
  new_msg: string
}

export type ManagerContextProps = {
  currentGroup: IGroupPropsUnder | null
  setCurrentGroup: (data: IGroupPropsUnder) => void
  currentMessageId: string | null
  setCurrentMessageId: (messageId: string | null) => void
  model: string
  setModel: (str: string) => void
  prompt: string
  setPrompt: (str: string) => void
  taskUUId: string
  setTaskUUId: (str: string) => void
  execList: IExecListItem[]
  setExecList: (list: IExecListItem[]) => void
  pointMessage: string
  setPointMessage: (str: string) => void
  // pointExection: ''
}

export const ManagerContext = createContext<ManagerContextProps>({
  currentGroup: null,
  setCurrentGroup: () => {},
  currentMessageId: null,
  setCurrentMessageId: () => {},
  model: '',
  setModel: () => {},
  prompt: '',
  setPrompt: () => {},
  taskUUId: '',
  setTaskUUId: () => {},
  execList: [],
  setExecList: () => {},
  pointMessage: '',
  setPointMessage: () => {},
})

export const useManagerContext = () => useContext(ManagerContext)
