import React, { useEffect, useState } from 'react'
import ChatSetting from './chat-setting'
import { SimpleSelect } from '@/app/components/base/select'
import Button from '@/app/components/base/button'
import DatePicker from '@/app/components/base/date-picker'
import { useManagerContext } from '@/context/manager-context'
import type { IGroupProps } from '@/service/chatTask'
import { fetchChatGroup } from '@/service/chatTask'
import type { Item } from '@/app/components/base/select'

const ChatOperator = () => {
  const { setCurrentGroup } = useManagerContext()

  const [groupList, setGroupList] = useState<Item[]>([])
  const [openSettingDrawer, setOpenSettingDrawer] = useState(false)

  const onGroupChange = async (target: Item) => {
    if (!target)
      return
    setCurrentGroup({
      group_id: target.value as string,
      group_name: target.name,
    })
  }

  const onOk = (value: any) => {
    console.log('onOk: ', value)
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
  }, [])

  return (
    <>
      <div className='grow flex'>
        <div className='w-[210px] mr-4'>
          <SimpleSelect
            items={groupList}
            className='mt-0 bg-gray-50'
            onSelect={onGroupChange}
          />
        </div>
        <div>
          <DatePicker />
        </div>
        {/* <RangePicker
          size='small'
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={(value, dateString) => {
            console.log(value, dateString)
          }}
          onOk={onOk}/> */}
      </div>
      <Button
        onClick={() => { setOpenSettingDrawer(true) } }
        type='primary'
        className='!h-9 !text-sm !font-medium mr-4'>
        设置
      </Button>
      <ChatSetting showDrawer={openSettingDrawer} onClose={() => { setOpenSettingDrawer(false) }} />
    </>
  )
}

export default ChatOperator
