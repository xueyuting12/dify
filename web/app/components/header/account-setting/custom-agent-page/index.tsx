import React, { useState } from 'react'
import useSWR from 'swr'
import { useTranslation } from 'react-i18next'
import CustomAgentModal from './modal'
import { fetchAgentTypes } from '@/service/apps'
import type { AgentTypes } from '@/models/app'
import { CustomRobote } from '@/app/components/base/icons/src/vender/solid/communication'
const CustomAgentPage = () => {
  const { t } = useTranslation()
  const { data, mutate } = useSWR({ url: 'apps/api-agent' }, fetchAgentTypes)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<AgentTypes | null>(null)

  const onCreate = () => {
    setShowEditModal(true)
    setEditData(null)
  }

  const onEdit = (agentItem: AgentTypes) => {
    setShowEditModal(true)
    setEditData(agentItem)
  }

  return (
    <div className='flex flex-col'>
      <div className='grid justify-items-end mb-4 p-3 bg-gray-50 rounded-2xl'>
        <div className={
          `shrink-0 flex items-center py-[7px] px-3 border-[0.5px] border-gray-200
            text-[13px] font-medium text-primary-600 bg-white
            shadow-xs rounded-lg cursor-pointer`
        } onClick={onCreate}>
          <CustomRobote className='w-4 h-4 mr-2 ' />
          {t('common.operation.add')}
        </div>
      </div>
      <div className='overflow-visible lg:overflow-visible'>
        <div className='flex items-center py-[7px] border-b border-gray-200 min-w-[480px]'>
          <div className='w-[184px] px-3 text-xs font-medium text-gray-500'>{t('common.customAgent.agentName')}</div>
          <div className='shrink-0 w-[184px] text-xs font-medium text-gray-500'>{t('common.customAgent.host')}</div>
          <div className='shrink-0 w-[184px] px-3 text-xs font-medium text-gray-500'>{t('common.customAgent.url')}</div>
          <div className='shrink-0 grow px-3 text-xs font-medium text-gray-500'>{t('common.customAgent.desc')}</div>
          <div className='shrink-0 w-[80px] px-3 text-xs font-medium text-gray-500'>{t('common.customAgent.operator')}</div>
        </div>
        <div className='min-w-[480px] relative'>
          {
            data?.data.map(agentItem => (
              <div key={agentItem.id} className='flex border-b border-gray-100'>
                <div className='w-[184px] flex items-center py-2 px-3 text-[13px] text-gray-700'>{agentItem.ai_agent_name}</div>
                <div className='shrink-0 flex items-center w-[184px] py-2 text-[13px] text-gray-700'>{agentItem.host}</div>
                <div className='shrink-0 flex items-center w-[184px] py-2 text-[13px] text-gray-700'>{agentItem.url}</div>
                <div className='shrink-0 flex items-center grow py-2 text-[13px] text-gray-700'>{agentItem.desc}</div>
                <div className='shrink-0 flex items-center w-[80px] py-2 text-[13px] text-gray-700'>
                  <div className={
                    `shrink-0 flex items-center py-[7px] px-3 border-[0.5px] border-gray-200
                      text-[13px] font-medium text-primary-600 bg-white
                      shadow-xs rounded-lg cursor-pointer`
                  } onClick={() => onEdit(agentItem)}>
                    {t('common.operation.edit')}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <CustomAgentModal
        data={editData}
        showModal={showEditModal}
        onCancel={() => { setShowEditModal(false) }}
        onSuccess={mutate} />
    </div>
  )
}

export default CustomAgentPage
