'use client'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import React, { useEffect, useRef } from 'react'
import Schedules from './Schedules'

const Layout: FC = () => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.title = `${t('schedule.title')} - 纽带星云`
  }, [])

  return (
    <div
      className="relative flex flex-col overflow-y-auto bg-gray-100 shrink-0 h-0 grow"
      style={{
        height: 'calc(100vh - 56px)',
      }}
    >
      <Schedules containerRef={containerRef} />
    </div>
  )
}
export default React.memo(Layout)
