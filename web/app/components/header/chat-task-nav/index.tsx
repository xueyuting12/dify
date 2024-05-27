'use client'

import classNames from 'classnames'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Chat, ChatActive } from '../../base/icons/src/public/header-nav/chatTask'

type ChatTaskNavProps = {
  className?: string
}
const ChatTaskNav = ({ className }: ChatTaskNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const actived = selectedSegment === 'chat-task'

  return (
    <Link href="/chat-task" className={classNames(
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

export default ChatTaskNav
