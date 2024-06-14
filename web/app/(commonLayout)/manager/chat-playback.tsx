'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import ChatItem from './chat-item'
import type { IChatItem } from '@/service/chatTask'
import { useManagerContext } from '@/context/manager-context'
import { fetchChatList } from '@/service/chatTask'
import styles from './task.module.css'

function generateUUID() {
  const buf = new Uint32Array(4)
  window.crypto.getRandomValues(buf)
  let idx = -1
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    idx++
    let r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15
    r = r ^ (c === 'x' ? 0 : (c === 'y' ? 8 : 3))
    return r.toString(16)
  })
}

const ChatPlayback = () => {
  const { currentGroup, setCurrentMessageId, setTaskUUId, pointMessage } = useManagerContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)
  const [displayList, setDisplayList] = useState<IChatItem[]>([])

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

  const startChat = async () => {
    if (!currentGroup || !currentGroup.group_id || !currentGroup.group_name)
      return
    const uuid = generateUUID()
    setTaskUUId(uuid)
    setDisplayList([])
    // console.log('开始任务执行...')
    const fullChatList = await fetchChatList(currentGroup)
    let count = 0
    if (fullChatList.length) {
      const intervalId = setInterval(() => {
        // 判断是否达到设定的循环次数
        if (count >= fullChatList.length) {
          clearInterval(intervalId)
          // console.log('任务执行完毕')
          return
        }
        const curChat = fullChatList[count]
        setDisplayList(prevList => [...prevList, curChat])
        setCurrentMessageId(curChat.msgId)
        count++
      }, 1500)
    }
  }

  useEffect(() => {
    startChat()
  }, [currentGroup])

  return (
    <div
      ref={containerRef}
      className='h-full overflow-auto px-4 py-2'>
      { displayList?.length
        ? displayList.map((item, index) => {
          if (item.msgType === 'JOIN_GROUP')
            return <div key={index} className='w-full text-center text-xs text-gray-400 mb-3 mt-3'>{`${item.msgContent}加入群聊`}</div>
          else
            return (
              <div className={`mb-6 ${pointMessage === item.msgId && styles.fadeOnce}`} id={item.msgId} >
                <ChatItem key={index} item={item}  />
              </div>
            )
        })
        : null}
    </div>
  )
}

export default ChatPlayback
