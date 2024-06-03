'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import ChatItem from './chat-item'
import type { IChatItem } from '@/service/chatTask'

type IChatPlayback = {
  list: IChatItem[]
}

const ChatPlayback = ({
  list,
}: IChatPlayback) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)

  const handleScrolltoBottom = useCallback(() => {
    if (containerRef.current && !userScrolledRef.current)
      containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const setUserScrolled = () => {
        if (container)
          userScrolledRef.current = container.scrollHeight - container.scrollTop >= container.clientHeight + 1
      }
      container.addEventListener('scroll', setUserScrolled)
      return () => container.removeEventListener('scroll', setUserScrolled)
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      requestAnimationFrame(() => {
        handleScrolltoBottom()
        // handleWindowResize()
      })
    }
  })

  return (
    <div
      ref={containerRef}
      className='h-full overflow-auto px-4 py-2'>
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
