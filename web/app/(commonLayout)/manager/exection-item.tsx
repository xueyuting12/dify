'use client'

import { useEffect, useState } from 'react'
import { fetchExecResponse } from '@/service/chatTask'
import ChatItem from './chat-item'

type IExectionItemProps = {
  id: string
  firstMessage: string
}

const ExectionItem = ({
  id,
  firstMessage
}: IExectionItemProps) => {
  const [chatList, setChatList] = useState<any[]>([])


  useEffect(() => {
    setChatList([{
      msgType: 'TEXT',
      msgId: id,
      msgContent: firstMessage,
      senderName: 'ai'
    }])

    const intervalId = setInterval(async () => {
      const tempRes = await fetchExecResponse(id)
      setChatList((tempRes as any).messages.map((attr: any, index: number) => {
        return {
          msgType: 'TEXT',
          msgId: index,
          msgContent: attr.content,
          senderName: attr.user
        }
      }))

      if ((tempRes as any).messages.length === 2) {
        clearInterval(intervalId)
        console.log('clearInterval')
      }
      
    }, 15000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div>
      {chatList.map((item, index) => {
        return (
          // <div className='text-sm text-gray-900' key={index}>{item.content}</div>
          <ChatItem item={item} />
        )
      })}
    </div>
  )
}

export default ExectionItem
