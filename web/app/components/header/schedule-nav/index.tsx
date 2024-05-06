import classNames from 'classnames'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Explore, ExploreActive } from '../../base/icons/src/public/header-nav/explore'

type ScheduleNavProps = {
  className?: string
}
const ScheduleNav = ({ className }: ScheduleNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const actived = selectedSegment === 'schedule'

  return (
    <Link href="/schedule" className={classNames(
      className, 'group',
      actived && 'bg-white shadow-md',
      actived ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-200',
    )}>
      {
        actived
          ? <ExploreActive className='mr-2 w-4 h-4' />
          : <Explore className='mr-2 w-4 h-4' />
      }
      {t('common.menus.schedule')}
    </Link>
  )
}

export default ScheduleNav
