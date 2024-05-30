'use client'

import { useEffect, useState } from 'react'
import ChatPlayback from './chat-playback'
import type { IChatItem, IGroupProps, IGroupPropsUnder, ITaskItem } from '@/service/chatTask'
import { fetchChatGroup, fetchChatList, fetchTaskList } from '@/service/chatTask'
import type { Item } from '@/app/components/base/select'
import { SimpleSelect } from '@/app/components/base/select'

const App = () => {
  const [groupList, setGroupList] = useState<Item[]>([])
  const [currentGroup, setCurrentGroup] = useState<IGroupPropsUnder>()
  const [chatList, setChatList] = useState<IChatItem[]>()
  const [taskList, setTaskList] = useState<ITaskItem[]>([])

  const onGroupChange = async (target: Item) => {
    target && setCurrentGroup({
      group_id: target.value as string,
      group_name: target.name,
    })
    const tempChatList = await fetchChatList({
      group_id: target.value as string,
      group_name: target.name,
    })
    setChatList(tempChatList)

    const tempTaskList = await fetchTaskList({
      group_id: target.value as string,
      group_name: target.name,
    })
    setTaskList(tempTaskList)
  }

  const getData = async () => {
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
    getData()
  }, [])

  return (
    <div className='flex flex-col h-full m-4 overflow-hidden' >
      <div className='flex-none h-12 w-full'>
        <div className='w-[210px]'>
          <SimpleSelect
            items={groupList}
            className='mt-0 !w-40'
            onSelect={onGroupChange}
          />
        </div>
      </div>
      <div className='flex-auto flex overflow-hidden'>
        <div className='flex-none bg-white w-2/6 rounded-2xl shadow-md overflow-auto px-4 py-2'>
          <ChatPlayback list={chatList || []} />
        </div>
        <div className='flex-1 bg-white rounded-2xl shadow-md ml-3'>
          {/* <ChatTask /> */}
        </div>
        <div className='flex-1 bg-white rounded-2xl shadow-md ml-3'>
          333
        </div>
      </div>
    </div>
  )
}

export default App
