import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import type { AgentTypes } from '@/models/app'
import { useToastContext } from '@/app/components/base/toast'
import { createAgentTypes, updateAgentTypes } from '@/service/apps'

type CustomEditModalProps = {
  showModal: boolean
  data: AgentTypes | null
  onCancel: () => void
  onSuccess: () => void
}
const CustomEditModal: FC<CustomEditModalProps> = ({
  showModal,
  data,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const [localeData, setLocaleData] = useState(data)
  // const [loading, setLoading] = useState(false)
  const { notify } = useToastContext()

  useEffect(() => {
    setLocaleData(data)
  }, [showModal])

  const handleDataChange = (type: string, value: string) => {
    setLocaleData({ ...localeData, [type]: value })
  }

  const handleSave = async () => {
    if (localeData?.id) {
      await updateAgentTypes({
        ai_agent_id: localeData.id,
        ai_agent_name: localeData.ai_agent_name,
        host: localeData.host,
        url: localeData.url,
        desc: localeData.desc,
      })
    }
    else {
      await createAgentTypes({ ...localeData })
    }
    notify({ type: 'success', message: t('common.customAgent.modifiedSuccessfully') })
    onCancel()
    onSuccess()
  }

  return (
    <Modal
      isShow={showModal}
      onClose={onCancel}
      wrapperClassName='!z-[103]'
      className='!p-8 !pb-6 !max-w-none !w-[640px]'
    >
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.agentName')}
        </div>
        <input
          value={localeData?.ai_agent_name || ''}
          onChange={e => handleDataChange('ai_agent_name', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.agentNamePlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.host')}
        </div>
        <input
          value={localeData?.host || ''}
          onChange={e => handleDataChange('host', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.hostPlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.url')}
        </div>
        <input
          value={localeData?.url || ''}
          onChange={e => handleDataChange('url', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.urlPlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.desc')}
        </div>
        <input
          value={localeData?.desc || ''}
          onChange={e => handleDataChange('desc', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.descPlaceholder') || ''}
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
          disabled={!localeData?.ai_agent_name || !localeData.host || !localeData.url}
          onClick={handleSave}
        >
          {t('common.operation.save')}
        </Button>
      </div>
    </Modal>
  )
}

export default CustomEditModal
