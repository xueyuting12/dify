'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextArea from 'rc-textarea'
import Modal from '@/app/components/base/modal'
import { useToastContext } from '@/app/components/base/toast'
import type { ITaskItem } from '@/service/chatTask'
import Button from '@/app/components/base/button'
import { useAppContext } from '@/context/app-context'
import { useManagerContext } from '@/context/manager-context'
import { ssePost } from '@/service/base'

type ModalProps = {
  showModal: boolean
  data: ITaskItem | undefined
  onCancel: () => void
}

const TaskExecModal = ({
  showModal,
  data,
  onCancel,
}: ModalProps) => {
  const { t } = useTranslation()
  const { notify } = useToastContext()
  const { execList, setExecList } = useManagerContext()

  const [content, setContent] = useState('')
  const { userProfile } = useAppContext()

  useEffect(() => {
    data?.taskRemark && setContent(data?.taskRemark)
  }, [showModal])

  const handleSave = async () => {
    ssePost('http://10.7.0.240:9093/api/v1/chat/inquiry', {
      body: {
        appId: '123321',
        stream: true,
        collection: '',
        conversationId: data?.task_id,
        messages: [{
          messageId: '',
          role: 'user',
          content,
          userId: userProfile.name,
        }],
      },
    }, {
      onData: (msg: string) => {
        const tempList = new Array(...execList)
        tempList.push({
          conversition_id: data?.task_id as string,
          new_msg: msg
        })
        setExecList(tempList)
      }
    })
    notify({ type: 'success', message: t('common.actionMsg.submitSucceeded') })
    onCancel()
  }

  return (
    <Modal
      isShow={showModal}
      onClose={onCancel}
      wrapperClassName='!z-[103]'
      className='!p-8 !pb-6 !max-w-none !w-[640px]'
    >
      <div>
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          className='mt-1 block w-full leading-5 max-h-none outline-none appearance-none resize-none bg-gray-50 rounded-lg border text-sm text-gray-700'
          autoFocus
          autoSize={{ minRows: 12, maxRows: 12 }} />
        <div className='flex items-center justify-end mt-6'>
          <Button
            onClick={onCancel}
            className='mr-2 text-sm font-medium'
          >
            {t('common.operation.cancel')}
          </Button>
          <Button
            type='primary'
            className='text-sm font-medium'
            onClick={handleSave}
          >
            {t('common.operation.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskExecModal
