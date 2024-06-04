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
  const [openSettingDrawer, setOpenSettingDrawer] = useState(false)

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
    // handleIntervalStop()
    // const locInterval = localStorage.getItem('CHAT_TASK_INTERVAL') || '3'
    // userIntervalRef.current = setInterval(() => {
    //   updateInfo({
    //     group_id: target.value as string,
    //     group_name: target.name,
    //   })
    // }, parseInt(locInterval) * 1000) as unknown as number
    // setCanStop(true)
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
        <div className='grow'>
          <div className='w-[210px]'>
            <SimpleSelect
              items={groupList}
              className='mt-0 bg-gray-50'
              onSelect={onGroupChange}
            />
          </div>
        </div>
        {/* <Button
          className='!h-9 !text-sm !font-medium ml-4'
          type="warning"
          disabled={!canStop}
          onClick={handleIntervalStop}>停止</Button> */}
        <Button
          onClick={() => { setOpenSettingDrawer(true) } }
          type='primary'
          className='!h-9 !text-sm !font-medium mr-4'>
          设置
        </Button>
      </div>
      <div className='flex-auto flex overflow-hidden'>
        <div className='flex-1 bg-white border mr-3 overflow-hidden'>
          <ChatPlayback fullList={chatList || []} />
        </div>
        <div className='flex-none bg-white w-2/6 border overflow-hidden'>
          <ChatTask list={taskList || []} />
        </div>
        <div className='flex-1 bg-white border ml-3 overflow-hidden'>
          任务执行
        </div>
      </div>
      <ChatSetting showDrawer={openSettingDrawer} onClose={() => { setOpenSettingDrawer(false) }} />
    </div>
  )
}

export default App
