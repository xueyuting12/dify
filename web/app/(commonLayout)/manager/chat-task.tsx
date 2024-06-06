'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './task.module.css'
import type { IGroupPropsUnder, ITaskItem } from '@/service/chatTask'
import Tag from '@/app/components/base/tag'
import { useManagerContext } from '@/context/manager-context'
import { fetchCurrentTask } from '@/service/chatTask'

const ChatTask = () => {
  const { currentMessageId, model, prompt, currentGroup, taskUUId } = useManagerContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)
  const [taskList, setTaskList] = useState<ITaskItem[]>([])

  // const handleScrolltoBottom = useCallback(() => {
  //   if (containerRef.current && !userScrolledRef.current)
  //     containerRef.current.scrollTop = containerRef.current.scrollHeight
  // }, [])

  // useEffect(() => {
  //   if (containerRef.current) {
  //     requestAnimationFrame(() => {
  //       handleScrolltoBottom()
  //       // handleWindowResize()
  //     })
  //   }
  // })

  // useEffect(() => {
  //   const container = containerRef.current
  //   if (container) {
  //     const setUserScrolled = () => {
  //       if (container)
  //         userScrolledRef.current = container.scrollHeight - container.scrollTop >= container.clientHeight + 1
  //     }
  //     container.addEventListener('scroll', setUserScrolled)
  //     return () => container.removeEventListener('scroll', setUserScrolled)
  //   }
  // }, [])

  const updateTaskList = useCallback((function () {
    let arrIndex = 0
    return async function (groupInfo: IGroupPropsUnder, prompt: string, model: string, currentMessageId: string, taskUUId: string) {
      const tempIndex = arrIndex
      arrIndex++
      // 进入等待
      setTaskList((prevList) => {
        const nextList = [...prevList]
        // console.log(tempIndex)
        nextList[tempIndex] = { status: 'waiting' }
        return nextList
      })
      if (!groupInfo || !groupInfo.group_id || !groupInfo.group_name)
        return
      const tempTask = await fetchCurrentTask({
        replay_id: taskUUId,
        msg_id: currentMessageId,
        model,
        prompt,
        group_id: groupInfo?.group_id,
        group_name: groupInfo?.group_name,
      }) as ITaskItem

      if (tempTask) {
        setTaskList((prevList) => {
          const nextList = [...prevList]
          if (tempTask.task_id) {
            const existTaskIndex = nextList.findIndex(attr => attr.task_id === tempTask.task_id)
            if (existTaskIndex !== -1) {
              nextList[existTaskIndex] = { status: 'replace', ...tempTask }
              nextList[tempIndex] = { status: 'exist', ...tempTask }
            }
            else {
              nextList[tempIndex] = { status: 'complete', ...tempTask }
            }
          }
          else {
            nextList[tempIndex] = { status: 'complete', ...tempTask }
          }
          return nextList
        })
      }
    }
  }()), [])

  useEffect(() => {
    setTaskList([])
  }, [currentGroup])

  useEffect(() => {
    currentGroup && currentMessageId && updateTaskList(currentGroup, prompt, model, currentMessageId, taskUUId)
  }, [currentMessageId])

  return (
    <div
      ref={containerRef}
      className='h-full overflow-auto px-4 py-2'>
      {taskList.map((item, index) => {
        if (item.status === 'waiting') {
          return (
            <div key={index} className={`h-4 bg-gray-200 mt-4 ${styles.waitingAnimation}`}></div>
          )
        }
        else if (item.status === 'complete' && item.taskType !== 'unknown') {
          return (
            <div key={item.msgId} className='rounded-2xl shadow-md p-3 mb-4' id={`taskcard-${item.msgId}`}>
              <div className='flex mb-2'>
                <div className='grow text-xs text-gray-600'>{item.msgId}</div>
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
        }
        else if (item.status === 'replace' && item.taskType !== 'unknown') {
          return (
            <div key={item.msgId} className={`rounded-2xl shadow-md p-3 mb-4 ${styles.replaceAnimation}`} id={`taskcard-${item.msgId}`}>
              <div className='flex mb-2'>
                <div className='grow text-xs text-gray-600'>{item.msgId}</div>
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
        }
        else {
          return null
        }
      })}
    </div>
  )
}

export default ChatTask
