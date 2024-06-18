'use client'

import { useEffect } from 'react'
import ExectionItem from './exection-item'
import { useManagerContext } from '@/context/manager-context'
const ChatExection = () => {
  const { execList } = useManagerContext()

  return (
    <div className='h-full overflow-auto p-2'>
      {execList.map((item) => {
        return (
          <div key={item.conversition_id} className='rounded-2xl shadow-md p-3 mb-4'>
            <ExectionItem id={item.conversition_id} firstMessage={item.new_msg} />
          </div>
        )
      })}
    </div>
  )
}

export default ChatExection
