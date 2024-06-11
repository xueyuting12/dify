'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './task.module.css'
import TaskExecModal from './task-exec-model'
import type { IGroupPropsUnder, ITaskItem } from '@/service/chatTask'
import Button from '@/app/components/base/button'
import Divider from '@/app/components/base/divider'
import { useManagerContext } from '@/context/manager-context'
import { fetchCurrentTask } from '@/service/chatTask'

const ChatTask = () => {
  const { currentMessageId, model, prompt, currentGroup, taskUUId } = useManagerContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)
  const [taskList, setTaskList] = useState<ITaskItem[]>([{
    groupId: '@@5dae6bd1cc1e5de29116e69c64b175a599d0edb1bd96f44c79ef1e11d9c07a43',
    groupName: '开思行兴配件沟通群',
    msgId: '2349',
    // replayId: "56f3b9b1-b86f-4812-c282-d1caa870c058",
    taskName: 'INQUIRY',
    taskRemark: '根据客户最新提供的信息，还需提供[配件名称]和[品质]信息以完成此任务。',
    taskStatus: 'DOING',
    taskType: 'INQUIRY',
    task_id: '180',
    status: 'complete',
  }])
  const [showExecModal, setShowExecModal] = useState(false)
  const [curTask, setCurTask] = useState<ITaskItem>()

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

  const handleTaskExec = (target: ITaskItem) => {
    setShowExecModal(true)
    setCurTask(target)
  }

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
      else {
        setTaskList((prevList) => {
          const nextList = [...prevList]
          nextList[tempIndex] = { status: 'complete', taskType: 'unknown' }
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
                <div className='grow text-gray-800'>
                  {`${item.taskType}任务`}
                </div>
                <Button
                  type='primary'
                  onClick={() => handleTaskExec(item)}
                  className='!h-8 !text-sm !font-medium'>
                  执行
                </Button>
              </div>
              <Divider />
              <div>
                <div className='border rounded-md border-purple-400 bg-purple-100 w-fit mb-2 px-2 py-1'>
                  <div className='text-sm text-gray-800'>{`${item.taskStatus}-${item.msgId}`}</div>
                </div>
              </div>
              <div className='grow text-xs text-gray-600 mb-1'>{item.groupName}</div>
              <div className='text-gray-600 text-sm'>
                {item.taskRemark}
              </div>
            </div>
          )
        }
        else if (item.status === 'replace' && item.taskType !== 'unknown') {
          return (
            <div key={item.msgId} className='rounded-2xl shadow-md p-3 mb-4' id={`taskcard-${item.msgId}`}>
              <div className='flex mb-2'>
                <div className='grow text-gray-800'>
                  {`${item.taskType}任务`}
                </div>
                <Button
                  type='primary'
                  onClick={() => handleTaskExec(item)}
                  className='!h-8 !text-sm !font-medium'>
                  执行
                </Button>
              </div>
              <Divider />
              <div>
                <div className='border rounded-md border-purple-400 bg-purple-100 w-fit mb-2 px-2 py-1'>
                  <div className='text-sm text-gray-800'>{`${item.taskStatus}-${item.msgId}`}</div>
                </div>
              </div>
              <div className='grow text-xs text-gray-600 mb-1'>{item.groupName}</div>
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
      <TaskExecModal
        showModal={showExecModal}
        data={curTask}
        onCancel={() => setShowExecModal(false)} />
    </div>
  )
}

export default ChatTask
