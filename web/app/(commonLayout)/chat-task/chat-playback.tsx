'use client'

import React from 'react'
import ChatItem from './chat-item'
import type { IChatItem } from '@/service/chatTask'

type IChatPlayback = {
  list: IChatItem[]
}

const ChatPlayback = ({
  list,
}: IChatPlayback) => {
  return (
    <div>
      <img src='http://10.7.0.240:3000/cass/20240524/240524-172250.png' />
      { list?.length
        ? list.map((item, index) => {
          if (item.msgType === 'JOIN_GROUP')
            return <div key={index} className='w-full text-center text-xs text-gray-400 mb-3 mt-3'>{`${item.msgContent}加入群聊`}</div>
          else
            return <ChatItem key={index} item={item} index={index} />
        })
        : null}
    </div>
  )
}

export default ChatPlayback
