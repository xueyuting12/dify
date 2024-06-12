'use client'

import { createContext, useContext } from 'use-context-selector'
import type { IGroupPropsUnder } from '@/service/chatTask'

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
})

export const useManagerContext = () => useContext(ManagerContext)
