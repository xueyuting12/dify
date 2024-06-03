'use client'

import { useEffect, useRef, useState } from 'react'
import ChatPlayback from './chat-playback'
import ChatTask from './chat-task'
import ChatSetting from './chat-setting'
import type { IChatItem, IGroupProps, IGroupPropsUnder, ITaskItem } from '@/service/chatTask'
import { fetchChatGroup, fetchChatList, fetchTaskList } from '@/service/chatTask'
import type { Item } from '@/app/components/base/select'
import { SimpleSelect } from '@/app/components/base/select'
import Button from '@/app/components/base/button'

type IGroupInfo = {
  group_id: string
  group_name: string
}

const App = () => {
  const [groupList, setGroupList] = useState<Item[]>([])
  const [currentGroup, setCurrentGroup] = useState<IGroupPropsUnder>()
  const [chatList, setChatList] = useState<IChatItem[]>()
  const [taskList, setTaskList] = useState<ITaskItem[]>([])
  const [canStop, setCanStop] = useState(false)
  const userIntervalRef = useRef<number | null>(null)

  const updateInfo = async (target: IGroupInfo) => {
    if (!target)
      return
    const tempChatList = await fetchChatList({
      group_id: target.group_id,
      group_name: target.group_name,
    })
    setChatList(tempChatList)

    const tempTaskList = await fetchTaskList({
      group_id: target.group_id,
      group_name: target.group_name,
    })
    setTaskList(tempTaskList)
  }

  const handleIntervalStop = () => {
    if (userIntervalRef.current) {
      clearInterval(userIntervalRef.current)
      userIntervalRef.current = null
      setCanStop(false)
    }
  }

  const onGroupChange = async (target: Item) => {
    if (!target)
      return
    setCurrentGroup({
      group_id: target.value as string,
      group_name: target.name,
    })
    updateInfo({
      group_id: target.value as string,
      group_name: target.name,
    })
    handleIntervalStop()
    const locInterval = localStorage.getItem('CHAT_TASK_INTERVAL') || '3'
    userIntervalRef.current = setInterval(() => {
      updateInfo({
        group_id: target.value as string,
        group_name: target.name,
      })
    }, parseInt(locInterval) * 1000) as unknown as number
    setCanStop(true)
  }

  const getChatList = async () => {
    const tempGroupData = await fetchChatGroup()
    setGroupList(tempGroupData.reduce((res: Item[], item: IGroupProps) => {
      res.push({
        name: item.groupName,
        value: item.groupId,
      })
      return res
    }, []))
  }

  useEffect(() => {
    getChatList()
    return () => handleIntervalStop()
  }, [])

  return (
    <div className='flex flex-col h-full m-4 overflow-hidden' >
      <div className='flex-none flex h-12 w-full mb-2 bg-white p-1'>
        <div className='w-[210px]'>
          <SimpleSelect
            items={groupList}
            className='mt-0 w-40 bg-gray-50'
            onSelect={onGroupChange}
          />
        </div>
        <Button
          className='!h-9 !text-sm !font-medium ml-4'
          type="warning"
          disabled={!canStop}
          onClick={handleIntervalStop}>停止</Button>
        {/* <Button>聊天回放</Button> */}
      </div>
      <div className='flex-auto flex overflow-hidden'>
        <div className='flex-1 bg-white border mr-3 overflow-hidden'>
          <ChatSetting />
        </div>
        <div className='flex-none bg-white w-2/6 border overflow-hidden'>
          <ChatPlayback list={chatList || []} />
        </div>
        <div className='flex-1 bg-white border ml-3 overflow-hidden'>
          <ChatTask list={taskList || []} />
        </div>
      </div>
    </div>
  )
}

export default App
