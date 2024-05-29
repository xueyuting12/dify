import type {
  FC,
  ReactNode,
} from 'react'
import { memo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
// import type {
//   ChatConfig,
//   ChatItem,
// } from '../../types'
import BasicContent from './basic-content'
import type { IChatItem } from '@/service/chatTask'
import { AnswerTriangle } from '@/app/components/base/icons/src/vender/solid/general'

type ChatItemProps = {
  item: IChatItem
  index: number
  answerIcon?: ReactNode
  responding?: boolean
  chatAnswerContainerInner?: string
}
const ChatItem: FC<ChatItemProps> = ({
  item,
  answerIcon,
  responding,
  chatAnswerContainerInner,
}) => {
  const { t } = useTranslation()

  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // const getContainerWidth = () => {
  //   if (containerRef.current)
  //     setContainerWidth(containerRef.current?.clientWidth + 16)
  // }
  // const getContentWidth = () => {
  //   if (contentRef.current)
  //     setContentWidth(contentRef.current?.clientWidth)
  // }

  // useEffect(() => {
  //   getContainerWidth()
  // }, [])

  // useEffect(() => {
  //   if (!responding)
  //     getContentWidth()
  // }, [responding])

  const render = (item: IChatItem) => {
    if (item.msgType === 'IMAGE')
      return <BasicContent msg={`![聊天](${item.msgContent})`} />
    else if (item.msgType === 'TEXT')
      return <BasicContent msg={item.msgContent || ''} />
    else
      return <BasicContent msg={item.msgContent || ''} />
  }

  return (
    <div className='flex mb-6 last:mb-0'>
      <div className='shrink-0 relative w-10 h-10'>
        {
          answerIcon || (
            <div className='flex items-center justify-center w-full h-full rounded-xl bg-[#d5f5f6] border-[0.5px] border-black/5 text-xl'>
              🤖
            </div>
          )
        }
      </div>
      <div className='chat-answer-container grow w-0 ml-2' ref={containerRef}>
        <div className='text-xs text-gray-400 mb-3'>{item.senderName}</div>
        <div className={`group relative pr-10 ${chatAnswerContainerInner}`}>
          <AnswerTriangle className='absolute -left-2 top-0 w-2 h-3 text-gray-100' />
          <div
            ref={contentRef}
            className={`
              relative inline-block px-4 py-3 max-w-full bg-gray-100 rounded-b-2xl rounded-tr-2xl text-sm text-gray-900
              'w-full'
            `}
          >
            { render(item) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatItem)
