'use client'

import { useEffect, useState } from 'react'
import { fetchExecResponse } from '@/service/chatTask'

type IExectionItemProps = {
  id: string
}

const ExectionItem = ({
  id,
}: IExectionItemProps) => {
  const [chatList, setChatList] = useState<any[]>([])

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (chatList.length === 2)
        clearInterval(intervalId)

      const tempRes = await fetchExecResponse(id)
      setChatList((tempRes as any).messages)
    }, 15000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div>
      {chatList.map((item, index) => {
        return (
          <div key={index}>{item.content}</div>
        )
      })}
    </div>
  )
}

export default ExectionItem
