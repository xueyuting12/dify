'use client'

import { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import { createWorkspace } from '@/service/common'
import { useToastContext } from '@/app/components/base/toast'
import { useWorkspacesContext } from '@/context/workspace-context'

type WorkspaceEditModalProps = {
  showModal: boolean
  onCancel: () => void
}

const WorkspaceEditModal: FC<WorkspaceEditModalProps> = ({
  showModal,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [workspaceName, setWorkspaceName] = useState('')
  const { notify } = useToastContext()
  const { mutate } = useWorkspacesContext()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await createWorkspace({
      name: workspaceName,
    })
    notify({ type: 'success', message: t('common.userProfile.createWorkspaceSuccessfully') })
    setLoading(false)
    onCancel()
    mutate()
  }

  return (
    <Modal
      closable={false}
      isShow={showModal}
      onClose={onCancel}
      wrapperClassName='!z-[103]'
      className='!p-8 !pb-6 !max-w-none !w-[640px]'
    >
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.userProfile.workspace')}
        </div>
        <input
          onChange={e => setWorkspaceName(e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.userProfile.workspacePlaceholder') || ''}
        />
      </div>
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
          disabled={!workspaceName}
          onClick={handleSave}
          loading={loading}
        >
          {t('common.operation.confirm')}
        </Button>
      </div>
    </Modal>
  )
}

export default WorkspaceEditModal
