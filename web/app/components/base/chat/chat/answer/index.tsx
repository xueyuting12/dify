import type {
  FC,
  ReactNode,
} from 'react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  ChatConfig,
  ChatItem,
} from '../../types'
import Operation from './operation'
import AgentContent from './agent-content'
import BasicContent from './basic-content'
import SuggestedQuestions from './suggested-questions'
import QuoteModal from './quote-modal'
import More from './more'
import WorkflowProcess from './workflow-process'
import s from './index.module.css'
import { AnswerTriangle } from '@/app/components/base/icons/src/vender/solid/general'
import { MessageFast } from '@/app/components/base/icons/src/vender/solid/communication'
import LoadingAnim from '@/app/components/app/chat/loading-anim'
import Citation from '@/app/components/app/chat/citation'
import { EditTitle } from '@/app/components/app/annotation/edit-annotation-modal/edit-item'
import type { Emoji } from '@/app/components/tools/types'
import Tag from '@/app/components/base/tag'
import { Link as LinkIcon } from '@/app/components/base/icons/src/public/chat'

type AnswerProps = {
  item: ChatItem
  question: string
  index: number
  config?: ChatConfig
  answerIcon?: ReactNode
  responding?: boolean
  allToolIcons?: Record<string, string | Emoji>
  showPromptLog?: boolean
  chatAnswerContainerInner?: string
}
const Answer: FC<AnswerProps> = ({
  item,
  question,
  index,
  config,
  answerIcon,
  responding,
  allToolIcons,
  showPromptLog,
  chatAnswerContainerInner,
}) => {
  const { t } = useTranslation()
  const {
    content,
    citation,
    agent_thoughts,
    more,
    annotation,
    workflowProcess,
  } = item
  const hasAgentThoughts = !!agent_thoughts?.length

  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [openQuote, setOpenQuote] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const getContainerWidth = () => {
    if (containerRef.current)
      setContainerWidth(containerRef.current?.clientWidth + 16)
  }
  const getContentWidth = () => {
    if (contentRef.current)
      setContentWidth(contentRef.current?.clientWidth)
  }

  useEffect(() => {
    getContainerWidth()
  }, [])

  useEffect(() => {
    if (!responding)
      getContentWidth()
  }, [responding])
  // console.log('item', item)

  const quoteDocLinks = useMemo(() => {
    //  Array.from(new Set(item.quote_list?.map(item => item.source_name || item.source)))
    return Array.from(new Set(item.quote_list?.map(attr => attr.source)))
      .map((source) => {
        return item.quote_list?.find(item => item.source === source)
      })
  }, [item.quote_list])

  return (
    <div className='flex mb-2 last:mb-0'>
      <div className='shrink-0 relative w-10 h-10'>
        {
          answerIcon || (
            <div className='flex items-center justify-center w-full h-full rounded-full bg-[#d5f5f6] border-[0.5px] border-black/5 text-xl'>
              🤖
            </div>
          )
        }
        {
          responding && (
            <div className='absolute -top-[3px] -left-[3px] pl-[6px] flex items-center w-4 h-4 bg-white rounded-full shadow-xs border-[0.5px] border-gray-50'>
              <LoadingAnim type='avatar' />
            </div>
          )
        }
      </div>
      <div className='chat-answer-container grow w-0 ml-4' ref={containerRef}>
        {
          item.process && (
            <div className="mb-2">
              <Tag className=''>
                <div className={`${s.statusAnimation} w-2 h-2 rounded-full bg-green-600 mr-2`}></div>
                {`${item.process}`}
              </Tag>
            </div>
          )
        }
        <div className={`group relative pr-10 ${chatAnswerContainerInner}`}>
          <AnswerTriangle className='absolute -left-2 top-0 w-2 h-3 text-gray-100' />
          <div
            ref={contentRef}
            className={`
              relative inline-block px-4 py-3 max-w-full bg-gray-100 rounded-b-2xl rounded-tr-2xl text-sm text-gray-900
              ${workflowProcess && 'w-full'}
            `}
          >
            {annotation?.id && (
              <div
                className='absolute -top-3.5 -right-3.5 box-border flex items-center justify-center h-7 w-7 p-0.5 rounded-lg bg-white cursor-pointer text-[#444CE7] shadow-md group-hover:hidden'
              >
                <div className='p-1 rounded-lg bg-[#EEF4FF] '>
                  <MessageFast className='w-4 h-4' />
                </div>
              </div>
            )}
            {
              !responding && (
                <Operation
                  hasWorkflowProcess={!!workflowProcess}
                  maxSize={containerWidth - contentWidth - 4}
                  contentWidth={contentWidth}
                  item={item}
                  question={question}
                  index={index}
                  showPromptLog={showPromptLog}
                />
              )
            }
            {
              workflowProcess && (
                <WorkflowProcess data={workflowProcess} hideInfo />
              )
            }
            {
              responding && !content && !hasAgentThoughts && (
                <div className='flex items-center justify-center w-6 h-5'>
                  <LoadingAnim type='text' />
                </div>
              )
            }
            {
              content && !hasAgentThoughts && (
                <>
                  <div className={`${(quoteDocLinks.length === 0 && item.cost) ? 'mb-4' : ''}`}>
                    <BasicContent item={item} />
                  </div>
                  {
                    quoteDocLinks.length
                      ? <div className='mt-4 mb-3'>
                        { quoteDocLinks.map((item) => {
                          return <div key={item} className='flex items-center mr-4'>
                            <LinkIcon className='mr-1' />
                            <a
                              href={item.source}
                              target='_blank'
                              className='font-bold text-xs text-gray-600 underline underline-offset-2' >
                              {item.source_name || item.source.split('/')[item.source.split('/').length - 1]}
                            </a>
                          </div>
                        }) }
                      </div>
                      : null
                  }
                  {
                    item.quote_list?.length
                      ? <div className='pt-2 inline mr-3' onClick={() => { setOpenQuote(true) }}>
                        <Tag
                          className='cursor-pointer'
                          color='primary'
                          bordered
                          hideBg>
                          {`${item.quote_list?.length}条引用`}
                        </Tag>
                      </div>
                      : null
                  }
                  {
                    item.cost && <Tag
                      color='purple'
                      bordered
                      hideBg>
                      {`${Number(item.cost).toFixed(2)}s`}
                    </Tag>
                  }
                </>
              )
            }
            {
              hasAgentThoughts && (
                <AgentContent
                  item={item}
                  responding={responding}
                  allToolIcons={allToolIcons}
                />
              )
            }
            {
              annotation?.id && annotation.authorName && (
                <EditTitle
                  className='mt-1'
                  title={t('appAnnotation.editBy', { author: annotation.authorName })}
                />
              )
            }
            <SuggestedQuestions item={item} />
            {
              !!citation?.length && !responding && (
                <Citation data={citation} showHitInfo={config?.supportCitationHitInfo} />
              )
            }
          </div>
        </div>
        <More more={more} />
      </div>
      <QuoteModal
        isShow={openQuote}
        onClose={() => { setOpenQuote(false) }}
        quoteList={item.quote_list || []} />
    </div>
  )
}

export default memo(Answer)
