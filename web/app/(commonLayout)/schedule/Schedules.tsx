import useSWRInfinite from 'swr/infinite'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash-es'
import NewFlowCard from './NewFlowCard'
import ScheduleCard from './ScheduleCard'
import { fetchAgentFlowList } from '@/service/schedule'
import type { AgentFlowItem, AgentFlowListResponse } from '@/models/schedule'

const getKey = (pageIndex: number, previousPageData: AgentFlowListResponse) => {
  if (!pageIndex || previousPageData.has_more)
    return { url: 'schedule', params: { page: pageIndex + 1, limit: 30 } }
  return null
}
type Props = {
  containerRef: React.RefObject<HTMLDivElement>
}
const Schedules = ({ containerRef }: Props) => {
  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    getKey,
    fetchAgentFlowList,
  )
  const loadingStateRef = useRef(false)
  const anchorRef = useRef<HTMLAnchorElement>(null)

  const { t } = useTranslation()

  useEffect(() => {
    loadingStateRef.current = isLoading
    document.title = `${t('schedule.title')} - 纽带星云`
  }, [isLoading])

  useEffect(() => {
    const onScroll = debounce(() => {
      if (!loadingStateRef.current) {
        const { scrollTop, clientHeight } = containerRef.current!
        const anchorOffset = anchorRef.current!.offsetTop
        if (anchorOffset - scrollTop - clientHeight < 100)
          setSize((size: number) => size + 1)
      }
    }, 50)

    containerRef.current?.addEventListener('scroll', onScroll)
    return () => containerRef.current?.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="grid content-start grid-cols-1 gap-4 px-12 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grow shrink-0">
      <NewFlowCard onSuccess={mutate} />
      {data?.map(({ data: dataFlows }) =>
        dataFlows.map((flow: AgentFlowItem) => (
          <ScheduleCard flow={flow} key={flow.id} onSuccess={mutate} />
        )),
      )}
    </nav>
  )
  return <div>schedules</div>
}

export default Schedules
