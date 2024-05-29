'use client'

import { useEffect } from 'react'
import { fetchChatGroup } from '@/service/chatTask'

const App = () => {
  const getData = async () => {
    await fetchChatGroup()
  }

  useEffect(() => {
    getData()
  })

  return (
    <div className='flex flex-col h-full m-4' >
      <div className='flex-none h-12 w-full'>
        搜索框
      </div>
      {/* <div className='flex-auto flex overflow-hidden'>
        <div className='flex-none bg-white w-2/6 rounded-2xl shadow-md'>
          111
        </div>
        <div className='flex-1 bg-white rounded-2xl shadow-md ml-3'>
          222
        </div>
        <div className='flex-1 bg-white rounded-2xl shadow-md ml-3'>
          333
        </div>
      </div> */}
    </div>
  )
}

export default App
