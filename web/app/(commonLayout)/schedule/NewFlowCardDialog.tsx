import { t } from 'i18next'
import type { FC } from 'react'
import React, { useState } from 'react'
import Dialog from '@/app/components/base/dialog'
import Button from '@/app/components/base/button'
import Input from '@/app/components/base/input'
import { fetchCreateAgentFlow, fetchUpdateAgentFlow } from '@/service/schedule'
import type { AgentFlowItem } from '@/models/schedule'
type NewAppDialogProps = {
  show: boolean
  currentData?: AgentFlowItem
  onSuccess?: () => void
  onClose?: () => void
}
const NewFlowCardDialog: FC<NewAppDialogProps> = ({
  show,
  currentData,
  onSuccess,
  onClose,
}) => {
  const [title, setTitle] = useState<string>(currentData?.name || '')
  const [desc, setDesc] = useState<string>(currentData?.description || '')
  const handleDescChange = (value: string) => {
    setDesc(value)
  }
  const handleTitleChange = (value: string) => {
    setTitle(value)
  }
  const onCreate = async () => {
    let res
    if (currentData)
      res = await fetchUpdateAgentFlow(currentData.id, title, desc)
    else
      res = await fetchCreateAgentFlow(title, desc)
    if (res)
      onSuccess?.()
  }
  return (
    <Dialog
      show={show}
      title={currentData ? t('schedule.newSchedule.startToUpdate') : t('schedule.newSchedule.startToCreate')}
      footer={
        <>
          <Button onClick={onClose}>{t('schedule.newSchedule.cancel')}</Button>
          <Button type="primary" onClick={onCreate}>
            {currentData ? t('schedule.newSchedule.update') : t('schedule.newSchedule.create')}
          </Button>
        </>
      }
    >
      <div className="h-[80px]">
        <div className="flex items-center h-[40px]">
          <span className="w-[60px]">名称：</span>
          <Input
            className="w-[100px]"
            value={title}
            placeholder={t('schedule.newSchedule.namePlaceholder') || ''}
            onChange={handleTitleChange}
          />
        </div>
        <div className="flex items-center h-[40px]">
          <span className="w-[60px]">备注：</span>
          <Input
            className="w-[100px]"
            value={desc}
            placeholder={t('schedule.newSchedule.descPlaceholder') || ''}
            onChange={handleDescChange}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default NewFlowCardDialog
