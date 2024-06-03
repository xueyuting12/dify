'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import type { ITaskItem } from '@/service/chatTask'
import Tag from '@/app/components/base/tag'

type IChatTaskProps = {
  list: ITaskItem[]
}

const ChatTask = ({
  list,
}: IChatTaskProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)

  const handleScrolltoBottom = useCallback(() => {
    if (containerRef.current && !userScrolledRef.current)
      containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      requestAnimationFrame(() => {
        handleScrolltoBottom()
        // handleWindowResize()
      })
    }
  })

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

  return (
    <div
      ref={containerRef}
      className='h-full overflow-auto px-4 py-2'>
      {list.map((item) => {
        return (
          <div key={item.taskId} className='rounded-2xl shadow-md p-3 mb-4'>
            <div className='flex mb-2'>
              <div className='grow text-xs text-gray-600'>{item.senderName}</div>
              <Tag>{item.taskStatus}</Tag>
            </div>
            <div className='border rounded-md border-blue-400 bg-blue-100 w-fit mb-2 px-2 py-1'>
              <div className='text-sm text-gray-800'>{item.taskName}</div>
            </div>
            <div className='text-gray-600 text-sm'>
              {item.taskRemark}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChatTask
