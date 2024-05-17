import React from 'react'
import classNames from 'classnames'

export type ITagProps = {
  children: string | React.ReactNode
  color?: keyof typeof COLOR_MAP
  className?: string
  bordered?: boolean
  hideBg?: boolean
}

const COLOR_MAP = {
  primary: {
    text: 'text-primary-600',
    bg: 'bg-primary-100',
    border: 'border-primary-600'
  },
  green: {
    text: 'text-green-800',
    bg: 'bg-green-100',
    border: 'border-green-600'
  },
  yellow: {
    text: 'text-yellow-800',
    bg: 'bg-yellow-100',
    border: 'border-yellow-600'
  },
  red: {
    text: 'text-red-800',
    bg: 'bg-red-100',
    border: 'border-red-600'
  },
  gray: {
    text: 'text-gray-800',
    bg: 'bg-gray-100',
    border: 'border-gray-600'
  },
  purple: {
    text: 'text-purple-800',
    bg: 'bg-purple-100',
    border: 'border-purple-600'
  }
}

export default function Tag({ children, color = 'green', className = '', bordered = false, hideBg = false }: ITagProps) {
  return (
    <div className={
      classNames('px-2.5 py-px text-xs leading-5 rounded-md inline-flex items-center flex-shrink-0',
        COLOR_MAP[color] ? `${COLOR_MAP[color].text} ${COLOR_MAP[color].bg}` : '',
        bordered ? 'border-[1px]' : '',
        bordered ? COLOR_MAP[color].border : '',
        hideBg ? 'bg-opacity-0' : '',
        className)} >
      {children}
    </div>
  )
}
