import type { FC } from 'react'
import { memo } from 'react'
import Modal from '@/app/components/base/modal'
import AppIcon from '@/app/components/base/app-icon'
import Tag from '@/app/components/base/tag'
import ProgressBar from '@/app/components/base/progress-bar'
import { Link as LinkIcon, Word as WordIcon } from '@/app/components/base/icons/src/public/chat'

type QuoteModalProps = {
  isShow: boolean
  onClose: () => void
  quoteList: any[]
}
const QuoteModal: FC<QuoteModalProps> = ({
  isShow,
  onClose,
  quoteList,
}) => {
  return (
    <Modal
      isShow={isShow}
      onClose={onClose}
      closable={true}
      className='max-h-[80vh] min-w-[640px] flex flex-col pl-0 pr-0'>
      <div className='flex pl-6 pr-6 mb-2'>
        <AppIcon
          className='!w-[40px] !h-40px]'
          icon='bookmark_tabs'
          background='white'/>
        <div className='leading-8 text-[16px] font-medium text-gray-700'>知识库引用</div>
      </div>
      <div className='pl-6 pr-6 overflow-y-auto'>
        {quoteList.map((item, index) =>
          <div
            key={index}
            className={`border-solid border border-slate-300 rounded p-3 mb-4 ${index % 2 === 0 ? 'bg-slate-50' : ''}`}>
            <div className='flex mb-3'>
              <Tag color='primary' bordered className='mr-4 text-sm'>{`#${index + 1} | 综合排名`}</Tag>
              <div>
                <div className='align-text-left text-xs text-gray-700'>语义检索：{item.score?.toFixed(4) || 0}</div>
                <ProgressBar percent={item.score?.toFixed(4) * 100} showNumber={false} />
              </div>
            </div>
            <div className='text-sm text-gray-700 mt-2'>
              {item.page_content}
            </div>
            <div className='flex mt-3'>
              <div className='flex items-center mr-4'>
                <WordIcon />
                <div className='text-xs text-gray-700 ml-1'>{item.page_content.length}</div>
              </div>
              <div className='flex items-center mr-4'>
                <LinkIcon />
                <a
                  className='font-bold text-xs text-gray-950 underline underline-offset-2 ml-1'
                  target='_blank'
                  href={item.source}>
                  {item.source_name || item.source.split('/')[item.source.split('/').length - 1]}
                </a>
              </div>
            </div>
          </div>,
        )}
      </div>
    </Modal>
  )
}

export default memo(QuoteModal)
