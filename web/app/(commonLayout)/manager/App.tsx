'use client'

import { useState } from 'react'
import ChatPlayback from './chat-playback'
import ChatTask from './chat-task'
import ChatOperator from './chat-operator'
import ChatExection from './chat-exection'
import { ManagerContext } from '@/context/manager-context'
import type { IGroupPropsUnder } from '@/service/chatTask'

const App = () => {
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const [model, setModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [currentGroup, setCurrentGroup] = useState<IGroupPropsUnder | null>(null)
  const [taskUUId, setTaskUUId] = useState('')
  const [execList, setExecList] = useState<any[]>([])

  return (
    <ManagerContext.Provider value={{
      currentMessageId,
      setCurrentMessageId,
      model,
      setModel,
      prompt,
      setPrompt,
      currentGroup,
      setCurrentGroup,
      taskUUId,
      setTaskUUId,
      execList,
      setExecList,
    }}>
      <div className='flex flex-col h-full m-4 overflow-hidden' >
        <div className='flex-none flex h-12 w-full mb-2 bg-white p-1'>
          <ChatOperator />
        </div>
        <div className='flex-auto flex overflow-hidden'>
          <div className='flex-1 bg-white border mr-3 overflow-hidden'>
            <ChatPlayback />
          </div>
          <div className='flex-none bg-white w-2/6 border overflow-hidden'>
            <ChatTask />
          </div>
          <div className='flex-1 bg-gray-100 border ml-3 overflow-hidden'>
            <div className='w-full h-full text-gray-600 text-sm text-center inline-block'>
              <ChatExection />
            </div>
          </div>
        </div>
      </div>
    </ManagerContext.Provider>
  )
}

export default App
