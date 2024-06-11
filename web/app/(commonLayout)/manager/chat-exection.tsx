'use client'

import ExectionItem from './exection-item'
import { useManagerContext } from '@/context/manager-context'

const ChatExection = () => {
  const { execList } = useManagerContext()

  return (
    <div>
      {execList.map((item) => {
        return (
          <div key={item}>
            <ExectionItem id={item} />
          </div>
        )
      })}
    </div>
  )
}

export default ChatExection
