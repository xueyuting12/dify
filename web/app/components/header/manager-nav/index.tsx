'use client'

import classNames from 'classnames'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Chat, ChatActive } from '../../base/icons/src/public/header-nav/chatTask'

type ManagerNavProps = {
  className?: string
}
const ManagerNav = ({ className }: ManagerNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const actived = selectedSegment === 'manager'

  return (
    <Link href="/manager" className={classNames(
      className, 'group',
      actived && 'bg-white shadow-md',
      actived ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-200',
    )}>
      {
        actived
          ? <ChatActive className='mr-2 w-4 h-4' />
          : <Chat className='mr-2 w-4 h-4' />
      }
      {t('common.menus.chatTask')}
    </Link>
  )
}

export default ManagerNav
