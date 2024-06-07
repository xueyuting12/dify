'use client'

import { SWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SwrInitorProps = {
  children: ReactNode
}
const SwrInitor = ({
  children,
}: SwrInitorProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weChatCode = searchParams.get('code')
  const consoleToken = searchParams.get('console_token')
  const consoleTokenFromLocalStorage = localStorage?.getItem('console_token')
  const [init, setInit] = useState(false)

  const getChatUserToken = async (code: string) => {
    // const tempRes = await weChatLogin(code) as any
    // if (tempRes?.token) {
    //   localStorage?.setItem('console_token', tempRes.token)
    //   router.replace('/explore/apps', { forceOptimisticNavigation: false } as any)
    //   setInit(true)
    // }
    console.log(code)
  }

  useEffect(() => {
    if (!(consoleToken || consoleTokenFromLocalStorage || weChatCode)) {
      router.replace('/signin')
      setInit(true)
    }

    if (weChatCode)
      getChatUserToken(weChatCode)

    // if (consoleToken) {
    //   localStorage?.setItem('console_token', consoleToken!)
    //   router.replace('/explore/apps', { forceOptimisticNavigation: false } as any)
    //   setInit(true)
    // }

    // if (consoleTokenFromLocalStorage)
    //   setInit(true)

    // localStorage?.setItem('console_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTU2ZmRkN2UtODYxMi00YzIyLWIzYmUtOTMyNmY1MDkxNGMxIiwiZXhwIjoxNzIwMjM1MzYxLCJpc3MiOiJTRUxGX0hPU1RFRCIsInN1YiI6IkNvbnNvbGUgQVBJIFBhc3Nwb3J0In0.bkP8OAXtmR-0nBgCmMi3m08gKxPTpMynvVhbzfijwbk')
    // localStorage?.setItem('chat_code', weChatCode)
    // router.replace(`/explore/apps?code=${weChatCode}`, { forceOptimisticNavigation: false } as any)
  }, [])

  return init
    ? (
      <SWRConfig value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}>
        {children}
      </SWRConfig>
    )
    : <div>122</div>
}

export default SwrInitor
