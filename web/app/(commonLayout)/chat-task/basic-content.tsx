import type { FC } from 'react'
import { memo } from 'react'
// import type { ChatItem } from '../../types'
import { Markdown } from '@/app/components/base/markdown'

type BasicContentProps = {
  msg: string
}
const BasicContent: FC<BasicContentProps> = ({
  msg,
}) => {
  return <Markdown content={msg} />

  // if (annotation?.logAnnotation)
  //   return <Markdown content={annotation?.logAnnotation.content || ''} />

  // return <Markdown content={content} className={`${item.isError && '!text-[#F04438]'}`} />
}

export default memo(BasicContent)
